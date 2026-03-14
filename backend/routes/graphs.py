"""Graph data endpoints."""
from __future__ import annotations

import csv
import json
from pathlib import Path

from fastapi import APIRouter, Query

from backend.models.schemas import ApiResponse

router = APIRouter(prefix="/api/graphs", tags=["graphs"])
GRAPH_DIR = Path("data/graphs")


@router.get("/{repo_name}", response_model=ApiResponse)
async def get_graph(repo_name: str):
    path = GRAPH_DIR / f"{repo_name}_graph.json"
    if not path.exists():
        return ApiResponse(error=f"Graph for '{repo_name}' not found")
    return ApiResponse(data=json.loads(path.read_text()))


@router.get("/{repo_name}/features", response_model=ApiResponse)
async def get_features(repo_name: str):
    path = GRAPH_DIR / f"{repo_name}_features.csv"
    if not path.exists():
        return ApiResponse(error=f"Features for '{repo_name}' not found")
    rows = list(csv.DictReader(path.open()))
    return ApiResponse(data=rows)


@router.get("/{repo_name}/subgraph", response_model=ApiResponse)
async def get_subgraph(repo_name: str, kind: str = Query(default="")):
    path = GRAPH_DIR / f"{repo_name}_graph.json"
    if not path.exists():
        return ApiResponse(error=f"Graph for '{repo_name}' not found")
    data = json.loads(path.read_text())
    if kind:
        node_ids = {n["node_id"] for n in data["nodes"] if n.get("kind") == kind}
        data["nodes"] = [n for n in data["nodes"] if n.get("kind") == kind]
        data["edges"] = [e for e in data["edges"]
                         if e["src"] in node_ids and e["dst"] in node_ids]
    return ApiResponse(data=data)
