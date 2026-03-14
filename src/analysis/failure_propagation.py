"""AGT-04 — Analysis Agent: deterministic and probabilistic cascade simulation."""
from __future__ import annotations

import logging
from dataclasses import dataclass, field

import networkx as nx

logger = logging.getLogger(__name__)


@dataclass
class CascadeResult:
    model: str
    initial_failures: list[str]
    propagation_waves: list[list[str]]
    final_failed_set: list[str]
    blast_radius: float
    cascade_depth: int


class DeterministicCascade:
    """A node fails when ALL in-neighbors have failed (hard-dependency)."""

    def __init__(self, G: nx.DiGraph):
        self.G = G

    def simulate(self, seed: list[str]) -> CascadeResult:
        failed: set[str] = set(seed)
        waves: list[list[str]] = [list(seed)]
        N = self.G.number_of_nodes()

        while True:
            wave: list[str] = []
            for node in self.G.nodes():
                if node in failed:
                    continue
                preds = list(self.G.predecessors(node))
                if preds and all(p in failed for p in preds):
                    wave.append(node)
            if not wave:
                break
            failed.update(wave)
            waves.append(wave)
            logger.debug("Wave %d: %s", len(waves), wave)

        return CascadeResult(
            model="deterministic",
            initial_failures=list(seed),
            propagation_waves=waves,
            final_failed_set=list(failed),
            blast_radius=len(failed) / N if N else 0.0,
            cascade_depth=len(waves) - 1,
        )


class ProbabilisticCascade:
    """Epidemic SIR-style: s_n(t+1) = clip(s_n(t) + β * Σ s_p(t), 0, 1)."""

    def __init__(self, G: nx.DiGraph, beta: float = 0.3, threshold: float = 0.5):
        self.G = G
        self.beta = beta
        self.threshold = threshold
        self._state: dict[str, float] = {}

    def simulate(self, seed: list[str]) -> CascadeResult:
        nodes = list(self.G.nodes())
        N = len(nodes)
        state = {n: 0.0 for n in nodes}
        for s in seed:
            if s in state:
                state[s] = 1.0

        waves: list[list[str]] = [list(seed)]
        previously_failed: set[str] = set(seed)

        for _ in range(N + 1):
            new_state = {}
            for n in nodes:
                preds = list(self.G.predecessors(n))
                influence = self.beta * sum(state.get(p, 0.0) for p in preds)
                new_state[n] = min(state[n] + influence, 1.0)
            delta = sum(abs(new_state[n] - state[n]) for n in nodes)
            state = new_state

            wave = [n for n in nodes
                    if state[n] >= self.threshold and n not in previously_failed]
            if wave:
                waves.append(wave)
                previously_failed.update(wave)
            if delta < 1e-4:
                break

        self._state = state
        final_failed = [n for n in nodes if state[n] >= self.threshold]
        return CascadeResult(
            model="probabilistic",
            initial_failures=list(seed),
            propagation_waves=waves,
            final_failed_set=final_failed,
            blast_radius=len(final_failed) / N if N else 0.0,
            cascade_depth=len(waves) - 1,
        )

    def state_vector(self) -> dict[str, float]:
        """Returns {node_id: infection_probability} for heatmap coloring."""
        return dict(self._state)
