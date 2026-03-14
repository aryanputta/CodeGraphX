#!/usr/bin/env python
"""CLI: train GNN on pre-computed graph features.

Usage:
    python scripts/train_model.py --graphs data/graphs/ --epochs 200
"""
from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

sys.path.insert(0, ".")
logging.basicConfig(level=logging.INFO)


def main():
    parser = argparse.ArgumentParser(description="Train CodeGraphX GNN")
    parser.add_argument("--graphs", default="data/graphs", help="Directory with *_graph.json files")
    parser.add_argument("--epochs", type=int, default=200)
    parser.add_argument("--lr", type=float, default=0.001)
    parser.add_argument("--device", default="cpu")
    args = parser.parse_args()

    graphs_dir = Path(args.graphs)
    graph_files = list(graphs_dir.glob("*_graph.json"))
    if not graph_files:
        print(f"No graph files found in {graphs_dir}")
        sys.exit(1)

    try:
        import numpy as np
        from src.graph.builder import GraphBuilder
        from src.graph.features import FeatureExtractor
        from src.ml.model import CodeGraphGNN
        from src.ml.trainer import GNNTrainer
    except ImportError as e:
        print(f"Missing dependency: {e}")
        sys.exit(1)

    for graph_file in graph_files:
        repo_name = graph_file.stem.replace("_graph", "")
        print(f"\n=== Training for {repo_name} ===")

        G = GraphBuilder.load(graph_file)
        extractor = FeatureExtractor(G)
        mat, nodes = extractor.extract()

        node_idx = {n: i for i, n in enumerate(nodes)}
        valid_edges = [(u, v) for u, v in G.edges() if u in node_idx and v in node_idx]
        if not valid_edges:
            print(f"  No valid edges for {repo_name}, skipping")
            continue

        edge_index = np.array([[node_idx[u] for u, v in valid_edges],
                                [node_idx[v] for u, v in valid_edges]])
        model = CodeGraphGNN()
        trainer = GNNTrainer(model, mat, edge_index, nodes, epochs=args.epochs,
                             lr=args.lr, device=args.device)
        result = trainer.train()
        pred_path = trainer.save(repo_name, result)
        trainer.save_training_curve(repo_name)

        m = result["metrics"]
        print(f"  Precision: {m['precision']:.3f}  Recall: {m['recall']:.3f}  F1: {m['f1']:.3f}")
        print(f"  Saved → {pred_path}")


if __name__ == "__main__":
    main()
