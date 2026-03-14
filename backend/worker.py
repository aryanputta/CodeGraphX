"""Background worker stub — extend with Redis RQ/arq for production."""
from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


def run_worker():
    logger.info("Worker started (stub — extend with rq or arq for production)")


if __name__ == "__main__":
    run_worker()
