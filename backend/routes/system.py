"""Health check and metrics endpoints."""
from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

router = APIRouter(tags=["system"])

VERSION = "2.0.0"
_request_count = 0


@router.get("/health")
async def health():
    return {"status": "ok", "version": VERSION}


@router.get("/metrics", response_class=PlainTextResponse)
async def metrics():
    return (
        "# HELP codegraphx_requests_total Total HTTP requests\n"
        "# TYPE codegraphx_requests_total counter\n"
        f"codegraphx_requests_total {_request_count}\n"
    )
