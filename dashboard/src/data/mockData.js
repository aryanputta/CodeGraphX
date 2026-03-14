// ── Metrics ──────────────────────────────────────────────────────────────────
export const mockMetrics = {
  totalRepos: 24,
  totalModules: 8432,
  highRiskModules: 312,
  avgDefectProb: 0.34,
  activeSimulations: 7,
  recentRuns: 18,
  criticalPaths: 43,
  graphDensity: 0.72,
}

// ── Repositories ─────────────────────────────────────────────────────────────
export const mockRepos = [
  { id: 'r1', name: 'core-telemetry-svc',   status: 'complete', nodes: 1243, edges: 3891, riskScore: 0.87, criticalNodes: 34, lastAnalyzed: '2026-03-14T10:23:00Z' },
  { id: 'r2', name: 'auth-gateway',          status: 'complete', nodes: 428,  edges: 1134, riskScore: 0.43, criticalNodes: 8,  lastAnalyzed: '2026-03-13T18:11:00Z' },
  { id: 'r3', name: 'signal-processor',      status: 'running',  nodes: 0,    edges: 0,    riskScore: 0,    criticalNodes: 0,  lastAnalyzed: null },
  { id: 'r4', name: 'mesh-orchestrator',     status: 'complete', nodes: 2891, edges: 7234, riskScore: 0.71, criticalNodes: 62, lastAnalyzed: '2026-03-12T09:44:00Z' },
  { id: 'r5', name: 'edge-inference-engine', status: 'complete', nodes: 634,  edges: 1892, riskScore: 0.29, criticalNodes: 4,  lastAnalyzed: '2026-03-11T14:55:00Z' },
  { id: 'r6', name: 'packet-classifier',     status: 'failed',   nodes: 0,    edges: 0,    riskScore: 0,    criticalNodes: 0,  lastAnalyzed: '2026-03-10T08:30:00Z' },
  { id: 'r7', name: 'telemetry-aggregator',  status: 'complete', nodes: 892,  edges: 2341, riskScore: 0.56, criticalNodes: 19, lastAnalyzed: '2026-03-09T22:10:00Z' },
]

// ── Risk Distribution (chart data) ───────────────────────────────────────────
export const riskDistribution = [
  { range: '0.0–0.1', count: 1823, fill: '#10b981' },
  { range: '0.1–0.2', count: 2341, fill: '#10b981' },
  { range: '0.2–0.3', count: 1432, fill: '#34d399' },
  { range: '0.3–0.4', count: 891,  fill: '#f59e0b' },
  { range: '0.4–0.5', count: 643,  fill: '#f59e0b' },
  { range: '0.5–0.6', count: 432,  fill: '#f97316' },
  { range: '0.6–0.7', count: 312,  fill: '#ef4444' },
  { range: '0.7–0.8', count: 289,  fill: '#ef4444' },
  { range: '0.8–0.9', count: 189,  fill: '#dc2626' },
  { range: '0.9–1.0', count: 80,   fill: '#dc2626' },
]

// ── Graph Density Trend ──────────────────────────────────────────────────────
export const densityTrend = [
  { date: 'Mar 8',  density: 0.61, nodes: 4231 },
  { date: 'Mar 9',  density: 0.63, nodes: 4512 },
  { date: 'Mar 10', density: 0.65, nodes: 5123 },
  { date: 'Mar 11', density: 0.68, nodes: 6234 },
  { date: 'Mar 12', density: 0.70, nodes: 7012 },
  { date: 'Mar 13', density: 0.71, nodes: 7891 },
  { date: 'Mar 14', density: 0.72, nodes: 8432 },
]

// ── Activity Feed ────────────────────────────────────────────────────────────
export const activityFeed = [
  { id: 1, type: 'analysis',   repo: 'core-telemetry-svc',   msg: 'Analysis complete — 34 critical nodes detected',    time: '2 min ago',  severity: 'critical' },
  { id: 2, type: 'simulation', repo: 'mesh-orchestrator',    msg: 'Cascade simulation finished — 71% blast radius',     time: '14 min ago', severity: 'warning'  },
  { id: 3, type: 'analysis',   repo: 'auth-gateway',         msg: 'Re-analysis triggered on branch feature/oauth2',     time: '38 min ago', severity: 'info'     },
  { id: 4, type: 'alert',      repo: 'core-telemetry-svc',   msg: 'ApiDispatcher risk score exceeded threshold (0.91)', time: '1 hr ago',   severity: 'critical' },
  { id: 5, type: 'analysis',   repo: 'telemetry-aggregator', msg: 'Analysis complete — 19 critical nodes detected',    time: '3 hr ago',   severity: 'warning'  },
  { id: 6, type: 'simulation', repo: 'edge-inference-engine','msg': 'Probabilistic cascade run — low blast radius (12%)',time: '5 hr ago',   severity: 'info'     },
]

// ── Graph Nodes (Cytoscape) ──────────────────────────────────────────────────
export const mockGraphNodes = [
  // Critical nodes
  { id: 'n01', label: 'ApiDispatcher',       kind: 'class',    risk: 0.92, loc: 412, complexity: 22, inDegree: 31, outDegree: 8  },
  { id: 'n02', label: 'CoreRouter',          kind: 'class',    risk: 0.88, loc: 334, complexity: 19, inDegree: 24, outDegree: 12 },
  { id: 'n03', label: 'EventBus',            kind: 'class',    risk: 0.85, loc: 289, complexity: 17, inDegree: 28, outDegree: 6  },
  { id: 'n04', label: 'StateManager',        kind: 'class',    risk: 0.79, loc: 521, complexity: 28, inDegree: 19, outDegree: 15 },
  // Risky nodes
  { id: 'n05', label: 'AuthMiddleware',      kind: 'function', risk: 0.65, loc: 134, complexity: 11, inDegree: 14, outDegree: 4  },
  { id: 'n06', label: 'SessionHandler',      kind: 'function', risk: 0.61, loc: 98,  complexity: 9,  inDegree: 12, outDegree: 3  },
  { id: 'n07', label: 'CacheLayer',          kind: 'class',    risk: 0.57, loc: 203, complexity: 13, inDegree: 9,  outDegree: 7  },
  { id: 'n08', label: 'MetricsCollector',    kind: 'class',    risk: 0.53, loc: 178, complexity: 10, inDegree: 8,  outDegree: 11 },
  { id: 'n09', label: 'RequestValidator',    kind: 'function', risk: 0.49, loc: 89,  complexity: 8,  inDegree: 16, outDegree: 2  },
  { id: 'n10', label: 'RateLimiter',         kind: 'class',    risk: 0.45, loc: 145, complexity: 12, inDegree: 7,  outDegree: 3  },
  // Safe nodes
  { id: 'n11', label: 'LogFormatter',        kind: 'function', risk: 0.18, loc: 42,  complexity: 3,  inDegree: 4,  outDegree: 1  },
  { id: 'n12', label: 'HealthCheck',         kind: 'function', risk: 0.12, loc: 38,  complexity: 2,  inDegree: 2,  outDegree: 1  },
  { id: 'n13', label: 'ConfigLoader',        kind: 'module',   risk: 0.22, loc: 67,  complexity: 5,  inDegree: 6,  outDegree: 3  },
  { id: 'n14', label: 'EnvParser',           kind: 'function', risk: 0.09, loc: 28,  complexity: 2,  inDegree: 3,  outDegree: 1  },
  { id: 'n15', label: 'RetryPolicy',         kind: 'class',    risk: 0.31, loc: 92,  complexity: 7,  inDegree: 5,  outDegree: 4  },
  { id: 'n16', label: 'CircuitBreaker',      kind: 'class',    risk: 0.41, loc: 167, complexity: 14, inDegree: 6,  outDegree: 5  },
  { id: 'n17', label: 'PayloadSerializer',   kind: 'function', risk: 0.15, loc: 55,  complexity: 4,  inDegree: 8,  outDegree: 2  },
  { id: 'n18', label: 'ErrorBoundary',       kind: 'class',    risk: 0.27, loc: 78,  complexity: 6,  inDegree: 4,  outDegree: 3  },
  { id: 'n19', label: 'TraceExporter',       kind: 'class',    risk: 0.38, loc: 134, complexity: 9,  inDegree: 3,  outDegree: 6  },
  { id: 'n20', label: 'NetworkAdapter',      kind: 'module',   risk: 0.62, loc: 234, complexity: 16, inDegree: 11, outDegree: 8  },
  // External
  { id: 'n21', label: 'redis.client',        kind: 'external', risk: 0,    loc: 0,   complexity: 0,  inDegree: 3,  outDegree: 0  },
  { id: 'n22', label: 'grpc.server',         kind: 'external', risk: 0,    loc: 0,   complexity: 0,  inDegree: 5,  outDegree: 0  },
  { id: 'n23', label: 'prometheus.client',   kind: 'external', risk: 0,    loc: 0,   complexity: 0,  inDegree: 2,  outDegree: 0  },
  { id: 'n24', label: 'opentelemetry',       kind: 'external', risk: 0,    loc: 0,   complexity: 0,  inDegree: 4,  outDegree: 0  },
]

export const mockGraphEdges = [
  { id: 'e1',  src: 'n01', dst: 'n02', kind: 'calls'   },
  { id: 'e2',  src: 'n01', dst: 'n05', kind: 'calls'   },
  { id: 'e3',  src: 'n01', dst: 'n09', kind: 'calls'   },
  { id: 'e4',  src: 'n01', dst: 'n03', kind: 'calls'   },
  { id: 'e5',  src: 'n02', dst: 'n04', kind: 'calls'   },
  { id: 'e6',  src: 'n02', dst: 'n07', kind: 'calls'   },
  { id: 'e7',  src: 'n02', dst: 'n10', kind: 'calls'   },
  { id: 'e8',  src: 'n03', dst: 'n04', kind: 'calls'   },
  { id: 'e9',  src: 'n03', dst: 'n08', kind: 'calls'   },
  { id: 'e10', src: 'n04', dst: 'n07', kind: 'calls'   },
  { id: 'e11', src: 'n04', dst: 'n15', kind: 'calls'   },
  { id: 'e12', src: 'n04', dst: 'n16', kind: 'calls'   },
  { id: 'e13', src: 'n05', dst: 'n06', kind: 'calls'   },
  { id: 'e14', src: 'n05', dst: 'n09', kind: 'calls'   },
  { id: 'e15', src: 'n06', dst: 'n07', kind: 'calls'   },
  { id: 'e16', src: 'n07', dst: 'n21', kind: 'imports' },
  { id: 'e17', src: 'n08', dst: 'n23', kind: 'imports' },
  { id: 'e18', src: 'n08', dst: 'n11', kind: 'calls'   },
  { id: 'e19', src: 'n08', dst: 'n19', kind: 'calls'   },
  { id: 'e20', src: 'n09', dst: 'n17', kind: 'calls'   },
  { id: 'e21', src: 'n10', dst: 'n15', kind: 'calls'   },
  { id: 'e22', src: 'n11', dst: 'n24', kind: 'imports' },
  { id: 'e23', src: 'n13', dst: 'n14', kind: 'defines' },
  { id: 'e24', src: 'n13', dst: 'n02', kind: 'imports' },
  { id: 'e25', src: 'n15', dst: 'n18', kind: 'inherits'},
  { id: 'e26', src: 'n16', dst: 'n15', kind: 'calls'   },
  { id: 'e27', src: 'n19', dst: 'n24', kind: 'imports' },
  { id: 'e28', src: 'n20', dst: 'n22', kind: 'imports' },
  { id: 'e29', src: 'n20', dst: 'n01', kind: 'calls'   },
  { id: 'e30', src: 'n20', dst: 'n02', kind: 'calls'   },
  { id: 'e31', src: 'n12', dst: 'n13', kind: 'imports' },
  { id: 'e32', src: 'n17', dst: 'n18', kind: 'calls'   },
]

// ── Pipeline steps ───────────────────────────────────────────────────────────
export const pipelineSteps = [
  { id: 1, label: 'Cloning repository',          icon: 'GitBranch'      },
  { id: 2, label: 'Parsing source code',          icon: 'Code2'          },
  { id: 3, label: 'Extracting graph features',    icon: 'Network'        },
  { id: 4, label: 'Building dependency graph',    icon: 'Share2'         },
  { id: 5, label: 'Running ML inference',         icon: 'Brain'          },
  { id: 6, label: 'Generating risk report',       icon: 'FileBarChart'   },
]
