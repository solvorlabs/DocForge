"""Pydantic models for DocForge API request/response schemas."""

from datetime import date
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class InputType(str, Enum):
    npm = "npm"
    pypi = "pypi"
    url = "url"
    github = "github"
    paste = "paste"


class OutputFormat(str, Enum):
    context_md = "context_md"
    json = "json"
    mcp = "mcp"


class JobStatus(str, Enum):
    queued = "queued"
    processing = "processing"
    complete = "complete"
    failed = "failed"


class ContextRequest(BaseModel):
    input: str = Field(..., description="Package name, URL, or GitHub repo")
    input_type: InputType = Field(InputType.npm, description="Type of input")
    components: list[str] | None = Field(None, description="Specific components to extract")
    output_format: OutputFormat = Field(OutputFormat.context_md, description="Output format")
    content: str | None = Field(None, description="Raw content for paste input type")


class JobCreatedResponse(BaseModel):
    job_id: str
    status: JobStatus = JobStatus.queued


class PropSchema(BaseModel):
    name: str
    type: str
    required: bool = False
    default: str | None = None


class ComponentSchema(BaseModel):
    name: str
    import_path: str | None = None
    install_command: str | None = None
    props: list[PropSchema] = Field(default_factory=list)
    gotchas: list[str] = Field(default_factory=list)
    peer_dependencies: list[str] = Field(default_factory=list)
    usage_example: str | None = None
    last_verified: str = Field(default_factory=lambda: date.today().isoformat())


class StructuredLibrary(BaseModel):
    library: str
    version: str
    description: str | None = None
    components: list[ComponentSchema] = Field(default_factory=list)


class ContextJobResult(BaseModel):
    status: JobStatus
    job_id: str
    library: str | None = None
    version: str | None = None
    output: str | None = None
    components: list[dict[str, Any]] = Field(default_factory=list)
    error: str | None = None


class SearchResult(BaseModel):
    name: str
    version: str
    cached_at: str


class SearchResponse(BaseModel):
    results: list[SearchResult]


class VersionsResponse(BaseModel):
    package: str
    versions: list[str]