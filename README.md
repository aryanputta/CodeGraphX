# CodeGraphX

This repository now includes a **Next.js + TypeScript + Tailwind + shadcn-style** structure and integrated UI components to reduce a rigid, “boxy” look.

## Project structure defaults

- Components: `components/ui`
- App routes/pages: `app`
- Global styles: `app/globals.css`
- Utilities: `lib/utils.ts`

Using `components/ui` matters because shadcn-generated components assume this location and import path conventions (`@/components/ui/...`). Keeping this structure avoids broken imports and keeps your design system components centralized.

## Added components

- `components/ui/splite.tsx`
- `components/ui/spotlight.tsx`
- `components/ui/card.tsx`
- `components/ui/button.tsx`
- `components/ui/bento-grid.tsx`
- `components/ui/feature-section-with-hover-effects.tsx`

## Dependencies installed

- `@splinetool/runtime`
- `@splinetool/react-spline`
- `framer-motion`
- `@tabler/icons-react`
- `@radix-ui/react-slot`
- `class-variance-authority`
- `@radix-ui/react-icons`
- `lucide-react`

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## If you need to reinitialize with shadcn CLI

```bash
npx shadcn@latest init
```

Then ensure:

1. TypeScript is enabled (`tsconfig.json` exists)
2. Tailwind is configured (`tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css`)
3. Alias `@/*` is mapped in `tsconfig.json`
4. Generated components target `components/ui`
<div align="center">

# ⬡ CodeGraphX 2.0

**Graph-based machine learning for software repository analysis**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-Geometric-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)](https://pytorch-geometric.readthedocs.io)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

*Turns any Git repository into a dependency graph, then uses a GNN to find what breaks first.*

[Quickstart](#-quickstart) · [API Reference](#-api-reference) · [Architecture](#-architecture) · [Dashboard](#-dashboard)

</div>

---

## What Is This?

CodeGraphX ingests Python repositories, builds directed dependency graphs, and runs a **Graph Convolutional Network** to classify every function, class, and module by defect probability. It then simulates how failures cascade through the dependency graph — so you know exactly which nodes to harden before they take everything else down.

**Designed for:** 5G microservices · aerospace control pipelines · cloud edge infrastructure

---

## How It Works

```
Git Repo  →  AST Parser  →  Dependency Graph  →  GCN Model  →  Cascade Sim  →  Dashboard
  (AGT-01)     (AGT-01)        (AGT-02)           (AGT-03)      (AGT-04)       (AGT-06)
                                                                    ↑
                                                              FastAPI REST
                                                               (AGT-05)
```

| Step | Agent | What It Does |
|------|-------|-------------|
| **Ingest** | AGT-01 | Clones repo, parses Python AST into nodes + edges |
| **Graph** | AGT-02 | Builds NetworkX DiGraph, computes 10-feature matrix |
| **ML** | AGT-03 | Trains 3-layer GCN → labels each node `safe / risky / critical` |
| **Analyze** | AGT-04 | Simulates failure cascades, ranks critical nodes by blast radius |
| **Serve** | AGT-05 | FastAPI REST service with 13 endpoints + async job queue |
| **Visualize** | AGT-06 | React + D3 interactive dashboard with cascade animation |

---

## Quickstart

### Prerequisites

- Python 3.11+
- Node.js 20+
- Git

### 1 — Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn backend.main:app --reload --port 8000
```

> API docs auto-generated at **http://localhost:8000/docs**

### 2 — Dashboard

```bash
cd dashboard
npm install
npm start
```

> Opens at **http://localhost:3000**

### 3 — Analyze a Repository

Submit any public Git repo via the dashboard UI, or hit the API directly:

```bash
curl -X POST http://localhost:8000/api/repos/analyze \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/org/repo.git"}'
```

### 4 — CLI Tools

```bash
# Run cascade analysis on an existing graph
python scripts/run_analysis.py --graph data/graphs/myrepo_graph.json

# Train the GNN (requires torch-geometric)
python scripts/train_model.py --graphs data/graphs/ --epochs 200

# Run tests
pytest tests/
```

---

## Project Structure

```
CodeGraphX/
│
├── src/
│   ├── ingestion/              # AGT-01 · repo cloning + AST parsing
│   │   └── repo_ingester.py
│   ├── graph/                  # AGT-02 · graph construction + features
│   │   ├── builder.py
│   │   └── features.py
│   ├── ml/                     # AGT-03 · GCN model + trainer
│   │   ├── model.py
│   │   └── trainer.py
│   └── analysis/               # AGT-04 · cascade simulation + risk scoring
│       ├── failure_propagation.py
│       └── risk_scorer.py
│
├── backend/                    # AGT-05 · FastAPI REST service
│   ├── main.py
│   ├── worker.py
│   ├── routes/                 # repos · graphs · predictions · cascade · system
│   ├── models/schemas.py       # Pydantic v2 request/response models
│   ├── db/schema.sql           # PostgreSQL table definitions
│   └── Dockerfile
│
├── dashboard/                  # AGT-06 · React 18 + TypeScript + D3
│   └── src/
│       ├── api/client.ts       # Single Axios instance
│       ├── store/useStore.ts   # Zustand global state
│       ├── types/              # Strict TypeScript interfaces
│       ├── components/         # Layout · ErrorBoundary · NodeSidePanel · RiskBadge
│       └── pages/              # RepoOverview · DependencyGraph · RiskAnalysis · FailureCascade
│
├── data/
│   ├── graphs/                 # graph JSON + feature CSVs (git-ignored)
│   └── model_outputs/          # model weights + predictions (git-ignored)
│
├── scripts/
│   ├── train_model.py
│   └── run_analysis.py
│
├── tests/
│   └── test_ingestion.py       # 7 unit tests for AGT-01
│
└── requirements.txt
```

---

## Architecture

### GNN Model

A 3-layer Graph Convolutional Network for node-level risk classification:

```
Input (10 features per node)
  └─ GCNConv(10 → 64) → ReLU → Dropout(0.3)
  └─ GCNConv(64 → 64) → ReLU → Dropout(0.3)
  └─ GCNConv(64 → 32) → ReLU
  └─ Linear(32 → 3)   → Softmax
         ↓
  [ safe | risky | critical ]
```

- **Optimizer:** Adam · lr=0.001 · weight_decay=5e-4
- **Loss:** CrossEntropyLoss with class-imbalance weighting
- **Training:** 200 epochs · early stopping (patience=20) · 60/20/20 split
- **No labels?** Synthetic labels generated from betweenness + PageRank heuristic

### Node Feature Matrix

Each node gets a 10-column float32 feature vector, normalized to [0, 1]:

| Col | Feature | Description |
|-----|---------|-------------|
| 0 | `in_degree` | Incoming edges |
| 1 | `out_degree` | Outgoing edges |
| 2 | `degree_centrality` | Normalized degree (undirected) |
| 3 | `betweenness_centrality` | Fraction of shortest paths through node |
| 4 | `clustering_coeff` | Local clustering coefficient |
| 5 | `pagerank` | PageRank score (α=0.85) |
| 6 | `hub_score` | HITS hub score |
| 7 | `authority_score` | HITS authority score |
| 8 | `loc` | Lines of code |
| 9 | `complexity` | McCabe cyclomatic complexity |

### Cascade Models

**Deterministic** — A node fails when *all* in-neighbors have failed. Models hard dependencies (safety-critical systems, aerospace).

**Probabilistic (SIR)** — `s(t+1) = clip(s(t) + β · Σ s_predecessors(t), 0, 1)`. Node is "failed" when score > 0.5. Models soft dependencies (microservices, cloud). β is configurable from 0.1 → 1.0.

---

## API Reference

### Repositories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/repos/analyze` | Submit a repo URL for analysis |
| `GET` | `/api/repos` | List all analyzed repositories |
| `GET` | `/api/repos/{repo_name}` | Get status for a specific repo |

### Graph Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/graphs/{repo_name}` | Full graph (nodes + edges) |
| `GET` | `/api/graphs/{repo_name}/features` | Feature matrix as CSV |
| `GET` | `/api/graphs/{repo_name}/subgraph` | Filter graph by node kind |

### Predictions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/predictions/{repo_name}` | All node predictions |
| `GET` | `/api/predictions/{repo_name}/top?k=20` | Top-k riskiest nodes |

### Cascade & Risk

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/cascade/{repo_name}/simulate` | Run a cascade simulation |
| `GET` | `/api/cascade/{repo_name}/critical` | Critical node ranking |
| `GET` | `/api/risk/{repo_name}/heatmap` | Risk scores per node |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/metrics` | Prometheus-compatible metrics |

All responses use a consistent envelope:
```json
{ "data": { ... }, "error": null, "timestamp": "2026-03-14T..." }
```

---

## Dashboard

Four pages, dark navy/cyan engineering aesthetic, monospace font throughout:

| Page | Route | Description |
|------|-------|-------------|
| **Repository Overview** | `/` | Repo list with status badges, submit new repo |
| **Dependency Graph** | `/graph/:repo` | Interactive D3 force-directed graph — zoom, pan, drag, click nodes |
| **Risk Analysis** | `/risk/:repo` | Top-20 table, risk histogram, precision/recall cards |
| **Failure Cascade** | `/cascade/:repo` | Seed selection, model toggle, β slider, wave-by-wave animation |

Graph visualization features:
- Node **color** = risk score (green → yellow → red)
- Node **size** = lines of code / betweenness
- Edge **thickness** = relationship type (`inherits` > `calls` > `imports`)
- Filter by kind · filter by minimum risk score
- Click any node → side panel with full metadata + risk label

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Ingestion | Python `ast` · GitPython |
| Graph | NetworkX |
| ML | PyTorch · PyTorch Geometric |
| Backend | FastAPI · Uvicorn · Pydantic v2 |
| Database | PostgreSQL |
| Frontend | React 18 · TypeScript · D3.js v7 · Recharts · Tailwind CSS |
| State | Zustand |
| Containers | Docker (backend + dashboard) |

---

## Docker

```bash
# Backend
docker build -t codegraphx-backend -f backend/Dockerfile .
docker run -p 8000:8000 codegraphx-backend

# Dashboard
docker build -t codegraphx-dashboard -f dashboard/Dockerfile dashboard/
docker run -p 3000:80 codegraphx-dashboard
```

---

<div align="center">

Built with Python · FastAPI · React · PyTorch Geometric · D3.js

</div>
