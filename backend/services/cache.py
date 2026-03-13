"""
Cache layer for DocForge.

In DEV_MODE (no Redis), uses a simple in-memory dict with TTL simulation.
In production, wraps Redis for distributed caching.
"""

import json
import logging
import os
import time
from typing import Any

logger = logging.getLogger(__name__)

DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
CACHE_TTL_SECONDS = 60 * 60 * 24  # 24 hours


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


# Singleton cache instance
_cache: InMemoryCache | RedisCache | None = None


def get_cache() -> InMemoryCache | RedisCache:
    global _cache
    if _cache is None:
        if DEV_MODE:
            logger.info("DEV_MODE: using in-memory cache (no Redis)")
            _cache = InMemoryCache()
        else:
            logger.info("Connecting to Redis at %s", REDIS_URL)
            _cache = RedisCache(REDIS_URL)
    return _cache


def make_context_key(library: str, version: str) -> str:
    return f"docforge:context:{library}:{version}"


def make_job_key(job_id: str) -> str:
    return f"docforge:job:{job_id}"


async def get_cached_context(library: str, version: str) -> dict[str, Any] | None:
    cache = get_cache()
    raw = await cache.get(make_context_key(library, version))
    if raw:
        logger.info("Cache HIT for %s@%s", library, version)
        return json.loads(raw)
    logger.info("Cache MISS for %s@%s", library, version)
    return None


async def set_cached_context(library: str, version: str, data: dict[str, Any]) -> None:
    cache = get_cache()
    await cache.set(make_context_key(library, version), json.dumps(data))


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