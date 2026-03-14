"""Unit tests for AGT-01 — Ingestion Agent."""
from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, ".")

from src.ingestion.repo_ingester import (
    IngestionResult,
    NodeMeta,
    RepoIngester,
    _node_id,
)


# ------------------------------------------------------------------ helpers

def _write_py(tmp_path: Path, name: str, source: str) -> Path:
    p = tmp_path / name
    p.write_text(source)
    return p


# ------------------------------------------------------------------ _node_id

def test_node_id_format():
    nid = _node_id("some/path.py", "my_func")
    sha, *rest = nid.split("_", 1)
    assert len(sha) == 8
    assert "my_func" in rest[0]


def test_node_id_deterministic():
    assert _node_id("a.py", "foo") == _node_id("a.py", "foo")


def test_node_id_unique():
    assert _node_id("a.py", "foo") != _node_id("a.py", "bar")


# ------------------------------------------------------------------ parse

SAMPLE = '''\
import os
from pathlib import Path

class MyClass(object):
    def method_one(self):
        pass

def standalone(x):
    return x + 1
'''


def test_parse_nodes(tmp_path):
    repo = tmp_path / "repo"
    repo.mkdir()
    _write_py(repo, "main.py", SAMPLE)

    with patch.object(RepoIngester, "_clone_or_pull", return_value=repo):
        result = RepoIngester(workspace=str(tmp_path / "ws")).ingest("https://example.com/fake.git")

    names = {n.name for n in result.nodes}
    assert "MyClass" in names
    assert "method_one" in names
    assert "standalone" in names


def test_parse_edges(tmp_path):
    repo = tmp_path / "repo"
    repo.mkdir()
    _write_py(repo, "main.py", SAMPLE)

    with patch.object(RepoIngester, "_clone_or_pull", return_value=repo):
        result = RepoIngester(workspace=str(tmp_path / "ws")).ingest("https://example.com/fake.git")

    kinds = {e.kind for e in result.edges}
    assert kinds & {"imports", "defines"}


def test_dedup(tmp_path):
    repo = tmp_path / "repo"
    repo.mkdir()
    _write_py(repo, "a.py", "def foo(): pass\ndef foo(): pass\n")

    with patch.object(RepoIngester, "_clone_or_pull", return_value=repo):
        result = RepoIngester(workspace=str(tmp_path / "ws")).ingest("https://example.com/fake.git")

    node_ids = [n.node_id for n in result.nodes]
    assert len(node_ids) == len(set(node_ids)), "Duplicate node_ids found"


def test_syntax_error_handled(tmp_path):
    repo = tmp_path / "repo"
    repo.mkdir()
    _write_py(repo, "bad.py", "def broken(:\n    pass\n")
    _write_py(repo, "good.py", "def ok(): pass\n")

    with patch.object(RepoIngester, "_clone_or_pull", return_value=repo):
        result = RepoIngester(workspace=str(tmp_path / "ws")).ingest("https://example.com/fake.git")

    names = {n.name for n in result.nodes}
    assert "ok" in names


def test_skip_test_dirs(tmp_path):
    repo = tmp_path / "repo"
    repo.mkdir()
    (repo / "tests").mkdir()
    _write_py(repo / "tests", "test_foo.py", "def test_foo(): pass\n")
    _write_py(repo, "main.py", "def real(): pass\n")

    with patch.object(RepoIngester, "_clone_or_pull", return_value=repo):
        result = RepoIngester(workspace=str(tmp_path / "ws")).ingest("https://example.com/fake.git")

    names = {n.name for n in result.nodes}
    assert "real" in names
    assert "test_foo" not in names


def test_skip_venv(tmp_path):
    repo = tmp_path / "repo"
    repo.mkdir()
    (repo / "venv").mkdir()
    _write_py(repo / "venv", "lib.py", "def venv_func(): pass\n")
    _write_py(repo, "app.py", "def app_func(): pass\n")

    with patch.object(RepoIngester, "_clone_or_pull", return_value=repo):
        result = RepoIngester(workspace=str(tmp_path / "ws")).ingest("https://example.com/fake.git")

    names = {n.name for n in result.nodes}
    assert "app_func" in names
    assert "venv_func" not in names


def test_already_cloned(tmp_path):
    ws = tmp_path / "ws"
    ws.mkdir()
    dest = ws / "repo"
    dest.mkdir()
    _write_py(dest, "x.py", "def x(): pass\n")

    mock_repo = MagicMock()
    mock_repo.remotes.origin.pull = MagicMock()

    with patch("git.Repo", return_value=mock_repo):
        result = RepoIngester(workspace=str(ws)).ingest("https://example.com/repo.git")

    assert isinstance(result, IngestionResult)
