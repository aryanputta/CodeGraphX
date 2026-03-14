"""AGT-05 — Backend Agent: FastAPI application entry point."""
from __future__ import annotations

import logging
import sys

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

sys.path.insert(0, ".")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

app = FastAPI(
    title="CodeGraphX 2.0",
    description="Graph-based ML platform for software repository analysis",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.routes import cascade, graphs, predictions, repos, system  # noqa: E402

app.include_router(repos.router)
app.include_router(graphs.router)
app.include_router(predictions.router)
app.include_router(cascade.router)
app.include_router(system.router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.getLogger(__name__).error("Unhandled: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"data": None, "error": str(exc), "timestamp": None},
    )
