"""Prediction endpoints."""
from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter, Query

from backend.models.schemas import ApiResponse

router = APIRouter(prefix="/api/predictions", tags=["predictions"])
MODEL_OUT = Path("data/model_outputs")


@router.get("/{repo_name}", response_model=ApiResponse)
async def get_predictions(repo_name: str):
    path = MODEL_OUT / f"{repo_name}_predictions.json"
    if not path.exists():
        return ApiResponse(error=f"Predictions for '{repo_name}' not found")
    data = json.loads(path.read_text())
    return ApiResponse(data=data["predictions"])


@router.get("/{repo_name}/top", response_model=ApiResponse)
async def get_top_predictions(repo_name: str, k: int = Query(default=20)):
    path = MODEL_OUT / f"{repo_name}_predictions.json"
    if not path.exists():
        return ApiResponse(error=f"Predictions for '{repo_name}' not found")
    data = json.loads(path.read_text())
    preds = sorted(data["predictions"], key=lambda x: x["risk_score"], reverse=True)
    return ApiResponse(data=preds[:k])
