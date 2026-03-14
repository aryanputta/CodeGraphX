"""AGT-03 — ML Agent: 3-layer GCN for defect prediction."""
from __future__ import annotations

import torch
import torch.nn.functional as F
from torch import nn

try:
    from torch_geometric.nn import GCNConv
    HAS_PYG = True
except ImportError:
    HAS_PYG = False

FEATURE_DIM = 10
NUM_CLASSES = 3   # 0=safe, 1=risky, 2=critical


class CodeGraphGNN(nn.Module):
    """3-layer GCN for node-level risk classification."""

    def __init__(self, in_channels: int = FEATURE_DIM, num_classes: int = NUM_CLASSES):
        super().__init__()
        if not HAS_PYG:
            raise ImportError(
                "torch_geometric is required. "
                "Install with: pip install torch-geometric"
            )
        self.conv1 = GCNConv(in_channels, 64)
        self.conv2 = GCNConv(64, 64)
        self.conv3 = GCNConv(64, 32)
        self.classifier = nn.Linear(32, num_classes)
        self.drop = nn.Dropout(p=0.3)

    def forward(self, x: torch.Tensor, edge_index: torch.Tensor) -> torch.Tensor:
        x = F.relu(self.conv1(x, edge_index))
        x = self.drop(x)
        x = F.relu(self.conv2(x, edge_index))
        x = self.drop(x)
        x = F.relu(self.conv3(x, edge_index))
        x = self.classifier(x)
        return F.softmax(x, dim=-1)

    def embed(self, x: torch.Tensor, edge_index: torch.Tensor) -> torch.Tensor:
        """Return 32-dim node embeddings (before classifier)."""
        x = F.relu(self.conv1(x, edge_index))
        x = self.drop(x)
        x = F.relu(self.conv2(x, edge_index))
        x = self.drop(x)
        x = F.relu(self.conv3(x, edge_index))
        return x
