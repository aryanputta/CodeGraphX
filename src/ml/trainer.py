"""AGT-03 — ML Agent: training loop with early stopping + evaluation."""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Optional

import numpy as np
import torch
from sklearn.metrics import f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split

logger = logging.getLogger(__name__)

MODEL_OUT = Path("data/model_outputs")
LABEL_NAMES = {0: "safe", 1: "risky", 2: "critical"}


def _synthetic_labels(mat: np.ndarray) -> np.ndarray:
    """Generate labels from betweenness (col 3) + pagerank (col 5) + in_degree (col 0)."""
    score = 0.5 * mat[:, 3] + 0.3 * mat[:, 5] + 0.2 * mat[:, 0]
    labels = np.zeros(len(score), dtype=np.int64)
    th_critical = np.percentile(score, 90)
    th_risky = np.percentile(score, 70)
    labels[score >= th_critical] = 2
    labels[(score >= th_risky) & (score < th_critical)] = 1
    return labels


class GNNTrainer:
    def __init__(
        self,
        model,
        features: np.ndarray,
        edge_index: np.ndarray,
        node_ids: list[str],
        labels: Optional[np.ndarray] = None,
        epochs: int = 200,
        lr: float = 0.001,
        weight_decay: float = 5e-4,
        patience: int = 20,
        device: str = "cpu",
    ):
        self.model = model
        self.epochs = epochs
        self.patience = patience
        self.node_ids = node_ids

        if labels is None:
            labels = _synthetic_labels(features)
        self.labels = labels

        dev = torch.device(device)
        self.x = torch.tensor(features, dtype=torch.float32).to(dev)
        self.edge_index = torch.tensor(edge_index, dtype=torch.long).to(dev)
        self.y = torch.tensor(labels, dtype=torch.long).to(dev)

        counts = np.bincount(labels, minlength=3).astype(float)
        counts = np.where(counts == 0, 1, counts)
        weights = torch.tensor(counts.sum() / counts, dtype=torch.float32).to(dev)

        idx = np.arange(len(labels))
        train_idx, rest = train_test_split(idx, test_size=0.4, random_state=42, stratify=labels)
        val_idx, test_idx = train_test_split(rest, test_size=0.5, random_state=42)

        n = len(labels)
        self.train_mask = self._mask(train_idx, n)
        self.val_mask = self._mask(val_idx, n)
        self.test_mask = self._mask(test_idx, n)

        self.criterion = torch.nn.CrossEntropyLoss(weight=weights)
        self.optimizer = torch.optim.Adam(model.parameters(), lr=lr, weight_decay=weight_decay)
        model.to(dev)

        self.train_losses: list[float] = []
        self.val_losses: list[float] = []

    @staticmethod
    def _mask(idx: np.ndarray, n: int) -> torch.Tensor:
        m = torch.zeros(n, dtype=torch.bool)
        m[idx] = True
        return m

    def train(self) -> dict:
        best_val = float("inf")
        wait = 0
        best_state = None

        for epoch in range(1, self.epochs + 1):
            self.model.train()
            self.optimizer.zero_grad()
            out = self.model(self.x, self.edge_index)
            loss = self.criterion(out[self.train_mask], self.y[self.train_mask])
            loss.backward()
            self.optimizer.step()

            val_loss = self._val_loss()
            self.train_losses.append(loss.item())
            self.val_losses.append(val_loss)

            if val_loss < best_val:
                best_val = val_loss
                wait = 0
                best_state = {k: v.clone() for k, v in self.model.state_dict().items()}
            else:
                wait += 1
                if wait >= self.patience:
                    logger.info("Early stopping at epoch %d", epoch)
                    break

            if epoch % 20 == 0:
                logger.info("Epoch %d | train=%.4f | val=%.4f", epoch, loss.item(), val_loss)

        if best_state:
            self.model.load_state_dict(best_state)

        return self.evaluate()

    def _val_loss(self) -> float:
        self.model.eval()
        with torch.no_grad():
            out = self.model(self.x, self.edge_index)
            return self.criterion(out[self.val_mask], self.y[self.val_mask]).item()

    def evaluate(self) -> dict:
        self.model.eval()
        with torch.no_grad():
            out = self.model(self.x, self.edge_index)
            probs = out.cpu().numpy()
            preds = probs.argmax(axis=1)

        y_true = self.labels[self.test_mask.numpy()]
        y_pred = preds[self.test_mask.numpy()]

        metrics = {
            "precision": float(precision_score(y_true, y_pred, average="macro", zero_division=0)),
            "recall":    float(recall_score(y_true, y_pred, average="macro", zero_division=0)),
            "f1":        float(f1_score(y_true, y_pred, average="macro", zero_division=0)),
            "auc_roc":   0.0,
        }

        predictions = [
            {
                "node_id": nid,
                "risk_score": float(probs[i].max()),
                "label": LABEL_NAMES[int(preds[i])],
            }
            for i, nid in enumerate(self.node_ids)
        ]

        return {"metrics": metrics, "predictions": predictions, "probs": probs, "preds": preds}

    def save(self, repo_name: str, result: dict, output_dir: Path = MODEL_OUT) -> Path:
        output_dir.mkdir(parents=True, exist_ok=True)
        model_path = output_dir / f"{repo_name}_model.pt"
        torch.save(self.model.state_dict(), model_path)

        out = {
            "repo_name": repo_name,
            "model_path": str(model_path),
            "metrics": result["metrics"],
            "predictions": result["predictions"],
        }
        pred_path = output_dir / f"{repo_name}_predictions.json"
        pred_path.write_text(json.dumps(out, indent=2))
        logger.info("Saved model → %s, predictions → %s", model_path, pred_path)
        return pred_path

    def save_training_curve(self, repo_name: str, output_dir: Path = MODEL_OUT):
        try:
            import matplotlib.pyplot as plt  # type: ignore
            fig, ax = plt.subplots()
            ax.plot(self.train_losses, label="train")
            ax.plot(self.val_losses, label="val")
            ax.set_xlabel("Epoch")
            ax.set_ylabel("Loss")
            ax.legend()
            fig.savefig(output_dir / f"{repo_name}_training_curve.png")
            plt.close(fig)
        except Exception as exc:
            logger.warning("Could not save training curve: %s", exc)
