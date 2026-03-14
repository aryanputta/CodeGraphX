"""Cascade and risk endpoints."""
from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter

from backend.models.schemas import ApiResponse, CascadeRequest

router = APIRouter(tags=["cascade"])
GRAPH_DIR = Path("data/graphs")


def _load_graph(repo_name: str):
    from src.graph.builder import GraphBuilder
    path = GRAPH_DIR / f"{repo_name}_graph.json"
    if not path.exists():
        return None
    return GraphBuilder.load(path)


@router.post("/api/cascade/{repo_name}/simulate", response_model=ApiResponse)
async def simulate_cascade(repo_name: str, req: CascadeRequest):
    G = _load_graph(repo_name)
    if G is None:
        return ApiResponse(error=f"Graph for '{repo_name}' not found")
    from src.analysis.risk_scorer import CriticalNodeAnalyzer
    result = CriticalNodeAnalyzer(G, beta=req.beta).full_cascade(req.nodes, model=req.model)
    return ApiResponse(data=result)


@router.get("/api/cascade/{repo_name}/critical", response_model=ApiResponse)
async def get_critical_nodes(repo_name: str):
    path = GRAPH_DIR / f"{repo_name}_cascade.json"
    if path.exists():
        data = json.loads(path.read_text())
        return ApiResponse(data=data.get("critical_nodes", []))
    G = _load_graph(repo_name)
    if G is None:
        return ApiResponse(error=f"Graph for '{repo_name}' not found")
    from src.analysis.risk_scorer import CriticalNodeAnalyzer
    return ApiResponse(data=CriticalNodeAnalyzer(G).rank_critical_nodes(top_k=20))


@router.get("/api/risk/{repo_name}/heatmap", response_model=ApiResponse)
async def get_risk_heatmap(repo_name: str):
    pred_path = Path("data/model_outputs") / f"{repo_name}_predictions.json"
    if pred_path.exists():
        data = json.loads(pred_path.read_text())
        heatmap = {p["node_id"]: p["risk_score"] for p in data["predictions"]}
        return ApiResponse(data=heatmap)
    G = _load_graph(repo_name)
    if G is None:
        return ApiResponse(error=f"Graph for '{repo_name}' not found")
    from src.graph.features import FeatureExtractor
    top = FeatureExtractor(G).top_risk_nodes(k=len(G.nodes()))
    return ApiResponse(data={nid: float(score) for nid, score in top})
