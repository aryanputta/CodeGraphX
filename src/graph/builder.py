"""AGT-02 — Graph Agent: build NetworkX DiGraph from IngestionResult."""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

import networkx as nx

from src.ingestion.repo_ingester import IngestionResult, NodeMeta

logger = logging.getLogger(__name__)

GRAPH_DIR = Path("data/graphs")


class GraphBuilder:
    """Convert IngestionResult → NetworkX DiGraph and persist as JSON."""

    def __init__(self, output_dir: Path = GRAPH_DIR):
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def build(self, result: IngestionResult) -> nx.DiGraph:
        G = nx.DiGraph(repo_name=result.repo_name)
        node_ids = {n.node_id for n in result.nodes}

        for n in result.nodes:
            G.add_node(n.node_id, **self._node_attrs(n))

        external_added: set[str] = set()
        for e in result.edges:
            if e.src == e.dst:
                continue
            if e.dst not in node_ids and e.dst not in external_added:
                G.add_node(
                    e.dst,
                    node_id=e.dst, name=e.dst, kind="external",
                    filepath="", lineno=0, end_lineno=0, loc=0, complexity=0,
                )
                external_added.add(e.dst)
            G.add_edge(e.src, e.dst, kind=e.kind)

        logger.info("Built graph for %s: %d nodes, %d edges",
                    result.repo_name, G.number_of_nodes(), G.number_of_edges())
        return G

    def save(self, G: nx.DiGraph, repo_name: str) -> Path:
        out = self.output_dir / f"{repo_name}_graph.json"
        data = self._graph_to_dict(G, repo_name)
        out.write_text(json.dumps(data, indent=2))
        logger.info("Saved graph JSON → %s", out)
        return out

    @staticmethod
    def load(filepath: str | Path) -> nx.DiGraph:
        fp = Path(filepath)
        data = json.loads(fp.read_text())
        G = nx.DiGraph(repo_name=data["meta"]["repo_name"])
        for n in data["nodes"]:
            nid = n["node_id"]
            attrs = {k: v for k, v in n.items() if k != "node_id"}
            G.add_node(nid, node_id=nid, **attrs)
        for e in data["edges"]:
            if e["src"] != e["dst"]:
                G.add_edge(e["src"], e["dst"], kind=e["kind"])
        return G

    @staticmethod
    def _node_attrs(n: NodeMeta) -> dict[str, Any]:
        return {
            "node_id": n.node_id, "name": n.name, "kind": n.kind,
            "filepath": n.filepath, "lineno": n.lineno,
            "end_lineno": n.end_lineno, "loc": n.loc, "complexity": n.complexity,
        }

    @staticmethod
    def _graph_to_dict(G: nx.DiGraph, repo_name: str) -> dict:
        nodes = [{"node_id": nid, **attrs} for nid, attrs in G.nodes(data=True)]
        edges = [{"src": u, "dst": v, "kind": d.get("kind", "calls")}
                 for u, v, d in G.edges(data=True)]
        return {
            "meta": {
                "repo_name": repo_name,
                "node_count": G.number_of_nodes(),
                "edge_count": G.number_of_edges(),
            },
            "nodes": nodes,
            "edges": edges,
        }
