"""AGT-04 — Analysis Agent: critical node ranking via single-node failure simulation."""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

import networkx as nx

from src.analysis.failure_propagation import CascadeResult, DeterministicCascade, ProbabilisticCascade

logger = logging.getLogger(__name__)

GRAPH_DIR = Path("data/graphs")


class CriticalNodeAnalyzer:
    """Rank nodes by their blast radius when they fail in isolation."""

    def __init__(self, G: nx.DiGraph, beta: float = 0.3, threshold: float = 0.5):
        self.G = G
        self.beta = beta
        self.threshold = threshold

    def rank_critical_nodes(self, top_k: int = 20, model: str = "deterministic") -> list[dict[str, Any]]:
        results = []
        nodes = list(self.G.nodes())
        logger.info("Ranking %d nodes using %s cascade…", len(nodes), model)

        for nid in nodes:
            if model == "deterministic":
                cr = DeterministicCascade(self.G).simulate([nid])
            else:
                cr = ProbabilisticCascade(self.G, beta=self.beta, threshold=self.threshold).simulate([nid])

            attrs = self.G.nodes[nid]
            results.append({
                "node_id": nid,
                "name": attrs.get("name", nid),
                "kind": attrs.get("kind", "unknown"),
                "blast_radius": cr.blast_radius,
                "cascade_depth": cr.cascade_depth,
                "total_affected": len(cr.final_failed_set),
            })

        results.sort(key=lambda x: x["blast_radius"], reverse=True)
        return results[:top_k]

    def full_cascade(self, seed: list[str], model: str = "deterministic") -> dict[str, Any]:
        if model == "probabilistic":
            engine: DeterministicCascade | ProbabilisticCascade = ProbabilisticCascade(
                self.G, beta=self.beta, threshold=self.threshold
            )
        else:
            engine = DeterministicCascade(self.G)

        cr: CascadeResult = engine.simulate(seed)
        critical = self.rank_critical_nodes(top_k=10, model=model)

        return {
            "model": cr.model,
            "initial_failures": cr.initial_failures,
            "propagation_waves": cr.propagation_waves,
            "final_failed_set": cr.final_failed_set,
            "blast_radius": cr.blast_radius,
            "cascade_depth": cr.cascade_depth,
            "critical_nodes": critical,
        }

    def save(self, result: dict, repo_name: str, output_dir: Path = GRAPH_DIR) -> Path:
        out = output_dir / f"{repo_name}_cascade.json"
        out.write_text(json.dumps(result, indent=2))
        logger.info("Saved cascade → %s", out)
        return out
