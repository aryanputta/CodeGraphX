import { motion } from 'framer-motion'
import { Filter, Maximize2, RefreshCw, Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import NodeDetailDrawer from '../components/graph/NodeDetailDrawer.jsx'
import GraphContainer from '../components/graph/GraphContainer.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { mockGraphEdges, mockGraphNodes } from '../data/mockData.js'

const KIND_FILTERS = ['All', 'function', 'class', 'module', 'external']
const RISK_LABELS  = [
  { label: 'Critical ≥ 0.7', color: '#ef4444', min: 0.7 },
  { label: 'Risky 0.4–0.7',  color: '#f59e0b', min: 0.4 },
  { label: 'Safe < 0.4',     color: '#10b981', min: 0    },
  { label: 'External',       color: '#6b7280', min: -1   },
]

export default function GraphAnalysis() {
  const [selectedNode, setSelectedNode] = useState(null)
  const [riskFilter, setRiskFilter]     = useState(0)
  const [kindFilter, setKindFilter]     = useState('All')
  const [search, setSearch]             = useState('')

  const filteredNodes = useMemo(() => {
    return mockGraphNodes.filter((n) => {
      if (kindFilter !== 'All' && n.kind !== kindFilter) return false
      if (n.risk < riskFilter && n.kind !== 'external') return false
      if (search && !n.label.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [kindFilter, riskFilter, search])

  const highlightedIds = useMemo(() => {
    if (!search) return []
    return filteredNodes.filter((n) => n.label.toLowerCase().includes(search.toLowerCase())).map((n) => n.id)
  }, [search, filteredNodes])

  const stats = useMemo(() => ({
    total:    filteredNodes.length,
    critical: filteredNodes.filter((n) => n.risk >= 0.7).length,
    risky:    filteredNodes.filter((n) => n.risk >= 0.4 && n.risk < 0.7).length,
    safe:     filteredNodes.filter((n) => n.risk < 0.4 && n.risk > 0).length,
  }), [filteredNodes])

  return (
    <div className="max-w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Graph Analysis</h1>
          <p className="text-sm text-slate-500 mt-0.5">Interactive dependency graph · core-telemetry-svc</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors">
            <RefreshCw size={14} />
          </button>
          <button className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Nodes', value: stats.total,    color: 'text-slate-200' },
          { label: 'Critical',    value: stats.critical, color: 'text-red-400'   },
          { label: 'Risky',       value: stats.risky,    color: 'text-amber-400' },
          { label: 'Safe',        value: stats.safe,     color: 'text-emerald-400'},
        ].map((s) => (
          <div key={s.label} className="card px-4 py-3 text-center">
            <p className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 flex-wrap"
      >
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            placeholder="Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-4 py-2 text-xs bg-white/[0.03] border border-white/[0.06] rounded-lg text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 transition-all w-52"
          />
        </div>

        {/* Kind filter */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <Filter size={12} className="text-slate-500 ml-2" />
          {KIND_FILTERS.map((k) => (
            <button
              key={k}
              onClick={() => setKindFilter(k)}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                kindFilter === k ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Risk filter */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={13} className="text-slate-500" />
          <span className="text-xs text-slate-500">Min risk:</span>
          <input
            type="range" min={0} max={0.9} step={0.1} value={riskFilter}
            onChange={(e) => setRiskFilter(parseFloat(e.target.value))}
            className="w-24 accent-cyan-500"
          />
          <span className="text-xs font-mono text-cyan-400 w-8">{(riskFilter * 100).toFixed(0)}%</span>
        </div>

        {/* Legend */}
        <div className="ml-auto flex items-center gap-4">
          {RISK_LABELS.map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
              <span className="text-[10px] text-slate-500">{l.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Graph canvas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative rounded-xl overflow-hidden"
        style={{ height: '60vh', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <GraphContainer
          nodes={filteredNodes}
          edges={mockGraphEdges}
          onNodeSelect={setSelectedNode}
          riskFilter={riskFilter}
          highlightedNodes={highlightedIds}
        />
        <NodeDetailDrawer node={selectedNode} onClose={() => setSelectedNode(null)} />

        {/* Graph watermark */}
        <div className="absolute bottom-3 left-3 text-[10px] text-slate-700 font-mono pointer-events-none">
          CodeGraphX · core-telemetry-svc · {filteredNodes.length} nodes · {mockGraphEdges.length} edges
        </div>
      </motion.div>

      {/* Bottom module table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card overflow-hidden"
      >
        <div className="px-5 py-3 border-b border-white/[0.05] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">Top Risk Modules</h3>
          <span className="text-xs text-slate-500">{filteredNodes.filter((n) => n.risk > 0).length} nodes · sorted by risk</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.04] text-slate-500">
                <th className="text-left px-5 py-3 font-medium">Module</th>
                <th className="text-left px-4 py-3 font-medium">Kind</th>
                <th className="text-left px-4 py-3 font-medium">Risk Score</th>
                <th className="text-left px-4 py-3 font-medium">LOC</th>
                <th className="text-left px-4 py-3 font-medium">Complexity</th>
                <th className="text-left px-4 py-3 font-medium">In / Out</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...filteredNodes]
                .filter((n) => n.risk > 0)
                .sort((a, b) => b.risk - a.risk)
                .slice(0, 10)
                .map((n, i) => (
                  <tr
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-slate-200 font-medium">{n.label}</td>
                    <td className="px-4 py-3 text-slate-400">{n.kind}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${n.risk * 100}%`,
                              background: n.risk >= 0.7 ? '#ef4444' : n.risk >= 0.4 ? '#f59e0b' : '#10b981',
                            }}
                          />
                        </div>
                        <span className="font-mono" style={{ color: n.risk >= 0.7 ? '#f87171' : n.risk >= 0.4 ? '#fbbf24' : '#34d399' }}>
                          {(n.risk * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{n.loc}</td>
                    <td className="px-4 py-3 font-mono"
                      style={{ color: n.complexity > 15 ? '#f87171' : n.complexity > 8 ? '#fbbf24' : '#94a3b8' }}>
                      {n.complexity}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{n.inDegree} / {n.outDegree}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={n.risk >= 0.7 ? 'critical' : n.risk >= 0.4 ? 'risky' : 'safe'} size="xs" />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
