"""AGT-01 — Ingestion Agent: clone repos and parse Python AST into NodeMeta/EdgeMeta lists."""
from __future__ import annotations

import ast
import hashlib
import logging
import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import git

logger = logging.getLogger(__name__)

SKIP_DIRS = {"venv", ".venv", "__pycache__", "node_modules", ".git", "build", "dist"}
TEST_DIR_PATTERN = re.compile(r"(^|[\\/])(test|tests|testing)([\\/]|$)", re.IGNORECASE)


def _node_id(filepath: str, name: str) -> str:
    raw = f"{filepath}::{name}"
    sha = hashlib.sha1(raw.encode()).hexdigest()[:8]
    safe_name = re.sub(r"[^a-zA-Z0-9_]", "_", name)
    return f"{sha}_{safe_name}"


def _count_complexity(node: ast.AST) -> int:
    """McCabe complexity: count branches."""
    count = 1
    for child in ast.walk(node):
        if isinstance(child, (ast.If, ast.While, ast.For, ast.ExceptHandler,
                               ast.With, ast.Assert, ast.comprehension,
                               ast.BoolOp)):
            count += 1
    return count


@dataclass
class NodeMeta:
    node_id: str
    name: str
    kind: str          # "function" | "class" | "module"
    filepath: str
    lineno: int
    end_lineno: int
    loc: int
    complexity: int = 1


@dataclass
class EdgeMeta:
    src: str
    dst: str
    kind: str          # "calls" | "imports" | "inherits" | "defines"


@dataclass
class IngestionResult:
    repo_name: str
    repo_path: str
    nodes: list[NodeMeta] = field(default_factory=list)
    edges: list[EdgeMeta] = field(default_factory=list)


class _ASTVisitor(ast.NodeVisitor):
    """Walk one Python file and emit NodeMeta + EdgeMeta."""

    def __init__(self, filepath: str, rel_path: str, module_node_id: str):
        self.filepath = filepath
        self.rel_path = rel_path
        self.module_nid = module_node_id
        self.nodes: list[NodeMeta] = []
        self.edges: list[EdgeMeta] = []
        self._scope_stack: list[str] = [module_node_id]

    def _current_scope(self) -> str:
        return self._scope_stack[-1]

    def _add_node(self, n: NodeMeta):
        self.nodes.append(n)

    def _add_edge(self, src: str, dst: str, kind: str):
        if src != dst:
            self.edges.append(EdgeMeta(src=src, dst=dst, kind=kind))

    def visit_FunctionDef(self, node: ast.FunctionDef):
        nid = _node_id(self.rel_path, node.name)
        loc = (node.end_lineno or node.lineno) - node.lineno + 1
        fn = NodeMeta(
            node_id=nid, name=node.name, kind="function",
            filepath=self.rel_path,
            lineno=node.lineno, end_lineno=node.end_lineno or node.lineno,
            loc=loc, complexity=_count_complexity(node),
        )
        self._add_node(fn)
        self._add_edge(self._current_scope(), nid, "defines")
        self._scope_stack.append(nid)
        self.generic_visit(node)
        self._scope_stack.pop()

    visit_AsyncFunctionDef = visit_FunctionDef  # type: ignore[assignment]

    def visit_ClassDef(self, node: ast.ClassDef):
        nid = _node_id(self.rel_path, node.name)
        loc = (node.end_lineno or node.lineno) - node.lineno + 1
        cls = NodeMeta(
            node_id=nid, name=node.name, kind="class",
            filepath=self.rel_path,
            lineno=node.lineno, end_lineno=node.end_lineno or node.lineno,
            loc=loc, complexity=1,
        )
        self._add_node(cls)
        self._add_edge(self._current_scope(), nid, "defines")

        for base in node.bases:
            base_name = self._extract_name(base)
            if base_name:
                base_nid = _node_id(self.rel_path, base_name)
                self._add_edge(nid, base_nid, "inherits")

        self._scope_stack.append(nid)
        self.generic_visit(node)
        self._scope_stack.pop()

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            dst_nid = _node_id(alias.name, alias.name)
            self._add_edge(self._current_scope(), dst_nid, "imports")

    def visit_ImportFrom(self, node: ast.ImportFrom):
        module = node.module or ""
        for alias in node.names:
            full = f"{module}.{alias.name}" if module else alias.name
            dst_nid = _node_id(module, full)
            self._add_edge(self._current_scope(), dst_nid, "imports")

    def visit_Call(self, node: ast.Call):
        func_name = self._extract_name(node.func)
        if func_name:
            dst_nid = _node_id(self.rel_path, func_name)
            self._add_edge(self._current_scope(), dst_nid, "calls")
        self.generic_visit(node)

    @staticmethod
    def _extract_name(node: ast.expr) -> Optional[str]:
        if isinstance(node, ast.Name):
            return node.id
        if isinstance(node, ast.Attribute):
            return node.attr
        return None


class RepoIngester:
    """Clone or update a Git repo then extract all structural metadata."""

    def __init__(self, workspace: str = "workspace"):
        self.workspace = Path(workspace)
        self.workspace.mkdir(parents=True, exist_ok=True)

    def ingest(self, repo_url: str, branch: str = "HEAD") -> IngestionResult:
        repo_path = self._clone_or_pull(repo_url, branch)
        repo_name = repo_path.name
        result = IngestionResult(repo_name=repo_name, repo_path=str(repo_path))

        all_nodes: dict[str, NodeMeta] = {}
        all_edges: list[EdgeMeta] = []

        for py_file in self._iter_python_files(repo_path):
            rel = str(py_file.relative_to(repo_path))
            mod_name = rel.replace(os.sep, ".").removesuffix(".py")
            mod_nid = _node_id(rel, mod_name)
            loc = self._count_lines(py_file)

            mod_node = NodeMeta(
                node_id=mod_nid, name=mod_name, kind="module",
                filepath=rel, lineno=1, end_lineno=loc, loc=loc,
            )
            all_nodes[mod_nid] = mod_node

            try:
                source = py_file.read_text(encoding="utf-8", errors="replace")
                tree = ast.parse(source, filename=str(py_file))
            except SyntaxError as exc:
                logger.warning("SyntaxError in %s — skipping: %s", rel, exc)
                continue
            except Exception as exc:
                logger.warning("Failed to parse %s — skipping: %s", rel, exc)
                continue

            visitor = _ASTVisitor(str(py_file), rel, mod_nid)
            visitor.visit(tree)

            for n in visitor.nodes:
                all_nodes[n.node_id] = n
            all_edges.extend(visitor.edges)

        result.nodes = list(all_nodes.values())
        result.edges = all_edges
        logger.info("Ingested %s: %d nodes, %d edges",
                    repo_name, len(result.nodes), len(result.edges))
        return result

    def _clone_or_pull(self, repo_url: str, branch: str) -> Path:
        name = repo_url.rstrip("/").split("/")[-1].removesuffix(".git")
        dest = self.workspace / name
        if dest.exists():
            try:
                repo = git.Repo(dest)
                repo.remotes.origin.pull()
                logger.info("Pulled latest for %s", name)
            except Exception as exc:
                logger.warning("Pull failed for %s: %s — using cached", name, exc)
        else:
            logger.info("Cloning %s into %s", repo_url, dest)
            git.Repo.clone_from(repo_url, dest)
        return dest

    def _iter_python_files(self, root: Path):
        for path in root.rglob("*.py"):
            parts = set(path.parts)
            if parts & SKIP_DIRS:
                continue
            rel = str(path.relative_to(root))
            if TEST_DIR_PATTERN.search(rel):
                continue
            yield path

    @staticmethod
    def _count_lines(path: Path) -> int:
        try:
            return sum(1 for _ in path.open("rb"))
        except Exception:
            return 0
