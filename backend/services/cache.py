"""
Cache layer for DocForge.

Priority:
1. Supabase — if SUPABASE_URL + SUPABASE_KEY are set (persistent, cross-restart)
2. Redis    — if DEV_MODE=false and REDIS_URL is set
3. In-memory — fallback for local dev

Cache invalidation strategy:
- Pinned versions (e.g. react@18.2.0): 15-day TTL. Docs for a fixed version never change.
- "latest" / unpinned entries: GitHub release check on cache hit, but at most once per hour
  (stored as github_checked_at in the cached payload). If a newer GitHub release exists
  since cached_at, the entry is deleted and the pipeline re-runs for the next request.
"""

import json
import logging
import os
import time
from datetime import datetime, timedelta, timezone
from typing import Any

logger = logging.getLogger(__name__)

DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")

# Pinned versions live for 15 days; "latest" entries rely on GitHub commit checks
CACHE_TTL_PINNED  = 60 * 60 * 24 * 15   # 15 days
CACHE_TTL_LATEST  = 60 * 60 * 24 * 15   # same wall-clock TTL, but invalidated earlier by GitHub
CACHE_TTL_SECONDS = CACHE_TTL_PINNED    # default (keep old name for job TTL callers)
# How often we're allowed to re-check GitHub for a given library (seconds)
GITHUB_CHECK_INTERVAL = 60 * 60         # 1 hour


class InMemoryCache:
    """Fallback cache for local development without Redis."""

    def __init__(self) -> None:
        self._store: dict[str, tuple[str, float]] = {}  # key -> (value, expiry_ts)

    async def get(self, key: str) -> str | None:
        entry = self._store.get(key)
        if entry is None:
            return None
        value, expiry = entry
        if time.time() > expiry:
            del self._store[key]
            return None
        return value

    async def set(self, key: str, value: str, ttl: int = CACHE_TTL_SECONDS) -> None:
        self._store[key] = (value, time.time() + ttl)

    async def keys_matching(self, pattern: str) -> list[str]:
        """Return keys that contain the pattern substring (simplified glob)."""
        needle = pattern.replace("*", "")
        now = time.time()
        return [k for k, (_, exp) in self._store.items() if needle in k and now < exp]

    async def delete(self, key: str) -> None:
        self._store.pop(key, None)


class RedisCache:
    """Production Redis cache."""

    def __init__(self, redis_url: str) -> None:
        import redis.asyncio as aioredis  # type: ignore[import]
        self._redis = aioredis.from_url(redis_url, decode_responses=True)

    async def get(self, key: str) -> str | None:
        return await self._redis.get(key)

    async def set(self, key: str, value: str, ttl: int = CACHE_TTL_SECONDS) -> None:
        await self._redis.setex(key, ttl, value)

    async def keys_matching(self, pattern: str) -> list[str]:
        return await self._redis.keys(pattern)

    async def delete(self, key: str) -> None:
        await self._redis.delete(key)


class SupabaseCache:
    """Supabase-backed persistent cache using a `cache_entries` table."""

    def __init__(self, url: str, key: str) -> None:
        import asyncio
        from supabase import create_client  # type: ignore[import]
        self._client = create_client(url, key)
        self._loop = asyncio.get_event_loop

    async def get(self, key: str) -> str | None:
        import asyncio
        now = datetime.now(timezone.utc).isoformat()
        result = await asyncio.to_thread(
            lambda: self._client.table("cache_entries")
            .select("value")
            .eq("key", key)
            .gt("expires_at", now)
            .execute()
        )
        if result.data:
            return result.data[0]["value"]
        return None

    async def set(self, key: str, value: str, ttl: int = CACHE_TTL_SECONDS) -> None:
        import asyncio
        expires_at = (datetime.now(timezone.utc) + timedelta(seconds=ttl)).isoformat()
        await asyncio.to_thread(
            lambda: self._client.table("cache_entries")
            .upsert({"key": key, "value": value, "expires_at": expires_at})
            .execute()
        )

    async def keys_matching(self, pattern: str) -> list[str]:
        import asyncio
        needle = pattern.replace("*", "")
        now = datetime.now(timezone.utc).isoformat()
        result = await asyncio.to_thread(
            lambda: self._client.table("cache_entries")
            .select("key")
            .like("key", f"%{needle}%")
            .gt("expires_at", now)
            .execute()
        )
        return [row["key"] for row in result.data]

    async def delete(self, key: str) -> None:
        import asyncio
        await asyncio.to_thread(
            lambda: self._client.table("cache_entries")
            .delete()
            .eq("key", key)
            .execute()
        )


# Singleton cache instance
_cache: InMemoryCache | RedisCache | SupabaseCache | None = None


def get_cache() -> InMemoryCache | RedisCache | SupabaseCache:
    global _cache
    if _cache is None:
        if SUPABASE_URL and SUPABASE_KEY:
            logger.info("Using Supabase cache at %s", SUPABASE_URL)
            try:
                _cache = SupabaseCache(SUPABASE_URL, SUPABASE_KEY)
            except Exception as exc:
                logger.warning("Supabase cache init failed (%s), falling back to in-memory", exc)
                _cache = InMemoryCache()
        elif not DEV_MODE:
            logger.info("Connecting to Redis at %s", REDIS_URL)
            _cache = RedisCache(REDIS_URL)
        else:
            logger.info("DEV_MODE: using in-memory cache (no Redis)")
            _cache = InMemoryCache()
    return _cache


def make_context_key(library: str, version: str) -> str:
    return f"docforge:context:{library}:{version}"


def make_job_key(job_id: str) -> str:
    return f"docforge:job:{job_id}"


def _extract_github_owner_repo(repository: str) -> tuple[str, str] | None:
    """Parse owner/repo from any GitHub URL variant."""
    import re
    m = re.search(r"github\.com[/:]([^/]+)/([^/.]+)", repository)
    if m:
        return m.group(1), m.group(2)
    return None


async def _github_has_new_release(owner: str, repo: str, since: str) -> bool:
    """
    Return True if there is a GitHub release published after `since` (ISO date string).
    Falls back to checking the latest commit on the default branch if no releases exist.
    """
    import httpx
    headers = {"User-Agent": "docforge/1.0", "Accept": "application/vnd.github+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    try:
        since_dt = datetime.fromisoformat(since).replace(tzinfo=timezone.utc)
    except ValueError:
        return False

    async with httpx.AsyncClient(timeout=8) as client:
        # 1. Check releases first
        try:
            r = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/releases/latest",
                headers=headers,
            )
            if r.status_code == 200:
                published = r.json().get("published_at", "")
                if published:
                    pub_dt = datetime.fromisoformat(published.rstrip("Z")).replace(tzinfo=timezone.utc)
                    if pub_dt > since_dt:
                        logger.info("New release on %s/%s (%s > %s) — cache stale", owner, repo, published, since)
                        return True
                    return False  # release exists but is older — cache is fresh
        except Exception:
            pass  # fall through to commit check

        # 2. No releases — check latest commit on default branch
        try:
            r = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/commits?per_page=1",
                headers=headers,
            )
            if r.status_code == 200 and r.json():
                commit_date = (
                    r.json()[0]
                    .get("commit", {})
                    .get("committer", {})
                    .get("date", "")
                )
                if commit_date:
                    commit_dt = datetime.fromisoformat(commit_date.rstrip("Z")).replace(tzinfo=timezone.utc)
                    if commit_dt > since_dt:
                        logger.info("New commit on %s/%s (%s > %s) — cache stale", owner, repo, commit_date, since)
                        return True
        except Exception:
            pass

    return False


async def get_cached_context(library: str, version: str) -> dict[str, Any] | None:
    cache = get_cache()
    key = make_context_key(library, version)
    raw = await cache.get(key)
    if not raw:
        logger.info("Cache MISS for %s@%s", library, version)
        return None

    data: dict[str, Any] = json.loads(raw)
    logger.info("Cache HIT for %s@%s", library, version)

    # Pinned versions (e.g. react@18.2.0) never need GitHub staleness checks —
    # the docs for that exact version don't change. Only "latest" or similar.
    is_pinned = version not in ("latest", "latest", "") and version[0].isdigit()
    if is_pinned:
        return data

    # For "latest" entries: check GitHub at most once per GITHUB_CHECK_INTERVAL
    last_checked = data.get("github_checked_at")
    now_ts = time.time()
    if last_checked and (now_ts - last_checked) < GITHUB_CHECK_INTERVAL:
        return data  # checked recently — trust the cache

    repo_url: str = data.get("repository", "")
    parsed = _extract_github_owner_repo(repo_url) if repo_url else None

    if parsed:
        owner, repo = parsed
        cached_at: str = data.get("cached_at", "")
        try:
            stale = await _github_has_new_release(owner, repo, cached_at)
        except Exception as exc:
            logger.warning("GitHub staleness check failed for %s/%s: %s — keeping cache", owner, repo, exc)
            stale = False

        if stale:
            logger.info("Invalidating cache for %s@%s — new GitHub release detected", library, version)
            await cache.delete(key)
            return None  # caller will re-run the pipeline

    # Mark the time we last checked so we don't re-check for another hour
    data["github_checked_at"] = now_ts
    await cache.set(key, json.dumps(data), ttl=CACHE_TTL_LATEST)
    return data


async def set_cached_context(library: str, version: str, data: dict[str, Any]) -> None:
    cache = get_cache()
    # Pinned versions get the full 15-day TTL; "latest" also gets 15 days but
    # GitHub staleness checks will evict it earlier if a new release lands.
    is_pinned = version not in ("latest", "") and version[:1].isdigit()
    ttl = CACHE_TTL_PINNED if is_pinned else CACHE_TTL_LATEST
    await cache.set(make_context_key(library, version), json.dumps(data), ttl=ttl)


async def get_job(job_id: str) -> dict[str, Any] | None:
    cache = get_cache()
    raw = await cache.get(make_job_key(job_id))
    if raw:
        return json.loads(raw)
    return None


async def set_job(job_id: str, data: dict[str, Any]) -> None:
    cache = get_cache()
    # Jobs are stored for 1 hour — enough to poll results
    await cache.set(make_job_key(job_id), json.dumps(data), ttl=3600)


async def search_cached_libraries(query: str) -> list[dict[str, str]]:
    """Search in-memory index for libraries matching query."""
    cache = get_cache()
    pattern = f"docforge:context:*{query.lower()}*"
    keys = await cache.keys_matching(pattern)
    results = []
    for key in keys:
        raw = await cache.get(key)
        if raw:
            data = json.loads(raw)
            results.append({
                "name": data.get("library", ""),
                "version": data.get("version", ""),
                "cached_at": data.get("cached_at", ""),
            })
    return results


async def list_cached_versions(package: str) -> list[str]:
    """List all cached versions for a given package."""
    cache = get_cache()
    pattern = f"docforge:context:{package.lower()}:*"
    keys = await cache.keys_matching(pattern)
    versions = []
    for key in keys:
        # key format: docforge:context:{library}:{version}
        parts = key.split(":")
        if len(parts) >= 4:
            versions.append(parts[3])
    return sorted(versions, reverse=True)