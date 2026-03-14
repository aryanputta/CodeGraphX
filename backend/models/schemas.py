"""Pydantic v2 request/response models for the FastAPI backend."""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class ApiResponse(BaseModel):
    data: Any = None
    error: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class JobStatus(str, Enum):
    pending = "pending"
    running = "running"
    complete = "complete"
    failed = "failed"


class AnalyzeRequest(BaseModel):
    repo_url: str
    branch: str = "HEAD"


class RepoStatus(BaseModel):
    repo_name: str
    repo_url: str
    branch: str
    status: JobStatus
    node_count: int = 0
    edge_count: int = 0
    top_risk_score: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class NodeSchema(BaseModel):
    node_id: str
    name: str
    kind: str
    filepath: str
    lineno: int
    loc: int
    complexity: int


class EdgeSchema(BaseModel):
    src: str
    dst: str
    kind: str


class GraphMeta(BaseModel):
    repo_name: str
    node_count: int
    edge_count: int


class GraphResponse(BaseModel):
    meta: GraphMeta
    nodes: list[NodeSchema]
    edges: list[EdgeSchema]


class NodePrediction(BaseModel):
    node_id: str
    risk_score: float
    label: str


class CriticalNode(BaseModel):
    node_id: str
    name: str
    kind: str
    blast_radius: float
    cascade_depth: int
    total_affected: int


class CascadeRequest(BaseModel):
    nodes: list[str]
    model: str = "deterministic"
    beta: float = Field(default=0.3, ge=0.1, le=1.0)


class CascadeResponse(BaseModel):
    model: str
    initial_failures: list[str]
    propagation_waves: list[list[str]]
    final_failed_set: list[str]
    blast_radius: float
    cascade_depth: int
    critical_nodes: list[CriticalNode]
