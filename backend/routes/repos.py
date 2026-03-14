"""Repository management endpoints."""
from __future__ import annotations

import logging
import sys
import uuid

from fastapi import APIRouter, BackgroundTasks

from backend.models.schemas import AnalyzeRequest, ApiResponse, JobStatus, RepoStatus

router = APIRouter(prefix="/api/repos", tags=["repos"])

_jobs: dict[str, dict] = {}
_repos: dict[str, RepoStatus] = {}


def _run_pipeline(job_id: str, repo_url: str, branch: str):
    sys.path.insert(0, ".")
    logger = logging.getLogger(__name__)

    try:
        _jobs[job_id]["status"] = "running"
        repo_name = repo_url.rstrip("/").split("/")[-1].removesuffix(".git")
        if repo_name in _repos:
            _repos[repo_name].status = JobStatus.running

        from src.ingestion.repo_ingester import RepoIngester
        result = RepoIngester().ingest(repo_url, branch)

        from src.graph.builder import GraphBuilder
        from src.graph.features import FeatureExtractor
        G = GraphBuilder().build(result)
        GraphBuilder().save(G, repo_name)
        extractor = FeatureExtractor(G)
        mat, nodes = extractor.extract()
        extractor.save(repo_name)

        if repo_name in _repos:
            _repos[repo_name].node_count = G.number_of_nodes()
            _repos[repo_name].edge_count = G.number_of_edges()

        try:
            import numpy as np
            from src.ml.model import CodeGraphGNN
            from src.ml.trainer import GNNTrainer

            node_idx = {n: i for i, n in enumerate(nodes)}
            valid_edges = [(u, v) for u, v in G.edges() if u in node_idx and v in node_idx]
            if valid_edges:
                edge_index = np.array([[node_idx[u] for u, v in valid_edges],
                                       [node_idx[v] for u, v in valid_edges]])
                model = CodeGraphGNN()
                trainer = GNNTrainer(model, mat, edge_index, nodes)
                train_result = trainer.train()
                trainer.save(repo_name, train_result)
                preds = train_result["predictions"]
                if preds and repo_name in _repos:
                    _repos[repo_name].top_risk_score = max(p["risk_score"] for p in preds)
        except ImportError:
            logger.warning("torch_geometric not available, skipping GNN")

        _jobs[job_id]["status"] = "complete"
        if repo_name in _repos:
            _repos[repo_name].status = JobStatus.complete

    except Exception as exc:
        logger.error("Pipeline failed for job %s: %s", job_id, exc, exc_info=True)
        _jobs[job_id]["status"] = "failed"
        _jobs[job_id]["error"] = str(exc)
        repo_name = repo_url.rstrip("/").split("/")[-1].removesuffix(".git")
        if repo_name in _repos:
            _repos[repo_name].status = JobStatus.failed


@router.post("/analyze", response_model=ApiResponse)
async def analyze_repo(req: AnalyzeRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    repo_name = req.repo_url.rstrip("/").split("/")[-1].removesuffix(".git")
    _jobs[job_id] = {"status": "pending", "repo_url": req.repo_url}
    _repos[repo_name] = RepoStatus(
        repo_name=repo_name, repo_url=req.repo_url,
        branch=req.branch, status=JobStatus.pending,
    )
    background_tasks.add_task(_run_pipeline, job_id, req.repo_url, req.branch)
    return ApiResponse(data={"job_id": job_id})


@router.get("/{repo_name}", response_model=ApiResponse)
async def get_repo(repo_name: str):
    if repo_name not in _repos:
        return ApiResponse(error=f"Repo '{repo_name}' not found")
    return ApiResponse(data=_repos[repo_name].model_dump())


@router.get("", response_model=ApiResponse)
async def list_repos():
    return ApiResponse(data=[r.model_dump() for r in _repos.values()])
