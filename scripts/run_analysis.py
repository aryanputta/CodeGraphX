#!/usr/bin/env python
"""CLI: run cascade analysis on a graph.

Usage:
    python scripts/run_analysis.py --graph data/graphs/myrepo_graph.json
    python scripts/run_analysis.py --graph data/graphs/myrepo_graph.json --seed node_id_1 node_id_2
"""
from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

sys.path.insert(0, ".")
logging.basicConfig(level=logging.INFO)


def main():
    parser = argparse.ArgumentParser(description="Run CodeGraphX cascade analysis")
    parser.add_argument("--graph", required=True, help="Path to *_graph.json")
    parser.add_argument("--model", default="deterministic",
                        choices=["deterministic", "probabilistic"])
    parser.add_argument("--beta", type=float, default=0.3)
    parser.add_argument("--top-k", type=int, default=20)
    parser.add_argument("--seed", nargs="*", default=None, help="Seed node IDs")
    args = parser.parse_args()

    from src.graph.builder import GraphBuilder
    from src.analysis.risk_scorer import CriticalNodeAnalyzer

    graph_path = Path(args.graph)
    if not graph_path.exists():
        print(f"Graph file not found: {args.graph}")
        sys.exit(1)

    G = GraphBuilder.load(graph_path)
    repo_name = graph_path.stem.replace("_graph", "")
    analyzer = CriticalNodeAnalyzer(G, beta=args.beta)

    if args.seed:
        print(f"\n=== Cascade from {args.seed} ({args.model}) ===")
        result = analyzer.full_cascade(args.seed, model=args.model)
    else:
        print(f"\n=== Critical Node Ranking ({args.model}) ===")
        critical = analyzer.rank_critical_nodes(top_k=args.top_k, model=args.model)
        result = {"critical_nodes": critical}

    out_path = analyzer.save(result, repo_name)
    print(json.dumps(result, indent=2)[:3000])
    print(f"\nSaved → {out_path}")


if __name__ == "__main__":
    main()
