"""AGT-02 — Feature extraction: compute 10-column normalized feature matrix."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Optional

import networkx as nx
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

FEATURE_DIM = 10
FEATURE_NAMES = [
    "in_degree", "out_degree", "degree_centrality", "betweenness_centrality",
    "clustering_coeff", "pagerank", "hub_score", "authority_score",
    "loc", "complexity",
]

GRAPH_DIR = Path("data/graphs")


def _safe_norm(arr: np.ndarray) -> np.ndarray:
    mn, mx = arr.min(), arr.max()
    if mx - mn < 1e-9:
        return np.zeros_like(arr)
    return (arr - mn) / (mx - mn)


class FeatureExtractor:
    """Compute the fixed 10-column feature matrix for a DiGraph."""

    def __init__(self, G: nx.DiGraph):
        self.G = G
        self._matrix: Optional[np.ndarray] = None
        self._node_index: Optional[list[str]] = None

    def extract(self) -> tuple[np.ndarray, list[str]]:
        """Return (N×10 float32 matrix, ordered list of node_ids)."""
        if self._matrix is not None:
            return self._matrix, self._node_index  # type: ignore[return-value]

        G = self.G
        nodes = list(G.nodes())
        N = len(nodes)
        mat = np.zeros((N, FEATURE_DIM), dtype=np.float32)

        mat[:, 0] = [G.in_degree(n) for n in nodes]
        mat[:, 1] = [G.out_degree(n) for n in nodes]

        ug = G.to_undirected()
        dc = nx.degree_centrality(ug)
        mat[:, 2] = [dc.get(n, 0.0) for n in nodes]

        k = 500 if N > 5000 else None
        bc = nx.betweenness_centrality(G, k=k, normalized=True)
        mat[:, 3] = [bc.get(n, 0.0) for n in nodes]

        cc = nx.clustering(ug)
        mat[:, 4] = [cc.get(n, 0.0) for n in nodes]

        try:
            pr = nx.pagerank(G, alpha=0.85)
        except nx.PowerIterationFailedConvergence:
            pr = {n: 1.0 / N for n in nodes}
        mat[:, 5] = [pr.get(n, 0.0) for n in nodes]

        try:
            hubs, auths = nx.hits(G, max_iter=500)
        except nx.PowerIterationFailedConvergence:
            hubs = auths = {n: 1.0 / N for n in nodes}
        mat[:, 6] = [hubs.get(n, 0.0) for n in nodes]
        mat[:, 7] = [auths.get(n, 0.0) for n in nodes]

        mat[:, 8] = [G.nodes[n].get("loc", 0) for n in nodes]
        mat[:, 9] = [G.nodes[n].get("complexity", 0) for n in nodes]

        for col in range(FEATURE_DIM):
            mat[:, col] = _safe_norm(mat[:, col])

        self._matrix = mat
        self._node_index = nodes
        return mat, nodes

    def save(self, repo_name: str, output_dir: Path = GRAPH_DIR) -> Path:
        mat, nodes = self.extract()
        output_dir.mkdir(parents=True, exist_ok=True)
        out = output_dir / f"{repo_name}_features.csv"
        df = pd.DataFrame(mat, index=nodes, columns=FEATURE_NAMES)
        df.index.name = "node_id"
        df.to_csv(out)
        logger.info("Saved features CSV → %s", out)
        return out

    def top_risk_nodes(self, k: int = 20) -> list[tuple[str, float]]:
        """Heuristic pre-GNN ranking: betweenness + pagerank + in_degree."""
        mat, nodes = self.extract()
        score = 0.5 * mat[:, 3] + 0.3 * mat[:, 5] + 0.2 * mat[:, 0]
        ranked = sorted(zip(nodes, score.tolist()), key=lambda x: x[1], reverse=True)
        return ranked[:k]
