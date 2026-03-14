import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity, AlertTriangle, ChevronRight, Crosshair, Play, RotateCcw, Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import GlowButton from '../components/ui/GlowButton.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { mockGraphNodes } from '../data/mockData.js'

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#161628', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, color: '#e2e8f0', fontSize: 12,
  },
}

function generateWaves(seedIds, model, beta, nodes) {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const waves   = [seedIds]
  const failed  = new Set(seedIds)

  if (model === 'deterministic') {
    for (let w = 0; w < 6; w++) {
      const wave = nodes
        .filter((n) => !failed.has(n.id) && n.inDegree > 0)
        .filter((n) => Math.random() < (0.4 + beta * 0.3) * (n.risk + 0.1))
        .slice(0, Math.floor(Math.random() * 4) + 1)
        .map((n) => n.id)
      if (!wave.length) break
      waves.push(wave)
      wave.forEach((id) => failed.add(id))
    }
  } else {
    const state = Object.fromEntries(nodes.map((n) => [n.id, failed.has(n.id) ? 1 : 0]))
    for (let t = 0; t < 8; t++) {
      const wave = []
      nodes.forEach((n) => {
        if (failed.has(n.id)) return
        const influence = beta * n.inDegree * 0.05 * (Math.random() + 0.2)
        state[n.id] = Math.min(state[n.id] + influence, 1)
        if (state[n.id] > 0.5) { wave.push(n.id); failed.add(n.id) }
      })
      if (wave.length) waves.push(wave)
      else if (t > 2) break
    }
  }

  return { waves, failed: [...failed] }
}

export default function FailureSimulation() {
  const [selected, setSelected]   = useState([])
  const [model, setModel]         = useState('deterministic')
  const [beta, setBeta]           = useState(0.3)
  const [running, setRunning]     = useState(false)
  const [result, setResult]       = useState(null)
  const [animWave, setAnimWave]   = useState(-1)

  const selectableNodes = mockGraphNodes.filter((n) => n.kind !== 'external')

  const toggleNode = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const runSimulation = async () => {
    if (!selected.length) return
    setRunning(true)
    setResult(null)
    setAnimWave(-1)
    await new Promise((r) => setTimeout(r, 800))
    const { waves, failed } = generateWaves(selected, model, beta, mockGraphNodes)
    setResult({ waves, failed, blastRadius: failed.length / mockGraphNodes.length, depth: waves.length - 1 })

    for (let i = 0; i < waves.length; i++) {
      await new Promise((r) => setTimeout(r, 500))
      setAnimWave(i)
    }
    setRunning(false)
  }

  const waveTrend = result?.waves.map((w, i) => ({ wave: `W${i}`, affected: w.length, cumulative: result.waves.slice(0, i + 1).flat().length })) ?? []

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Failure Propagation Simulator</h1>
        <p className="text-sm text-slate-500 mt-0.5">Model cascade failure across dependency graph</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Control panel */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-5 space-y-5"
        >
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Crosshair size={14} className="text-red-400" />
            Simulation Controls
          </h2>

          {/* Model selector */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Cascade Model</p>
            <div className="grid grid-cols-2 gap-2">
              {['deterministic', 'probabilistic'].map((m) => (
                <button
                  key={m}
                  onClick={() => setModel(m)}
                  className={`py-2 text-xs rounded-lg border font-medium capitalize transition-all ${
                    model === m
                      ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                      : 'border-white/[0.06] text-slate-500 hover:border-white/10 hover:text-slate-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Beta slider */}
          {model === 'probabilistic' && (
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-xs text-slate-500">Propagation Rate (β)</p>
                <span className="text-xs font-mono text-cyan-400">{beta.toFixed(2)}</span>
              </div>
              <input
                type="range" min={0.1} max={1.0} step={0.05} value={beta}
                onChange={(e) => setBeta(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-slate-600">Low</span>
                <span className="text-[10px] text-slate-600">High</span>
              </div>
            </div>
          )}

          {/* Seed node selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">Seed Failure Nodes</p>
              <span className="text-[10px] text-cyan-400 font-mono">{selected.length} selected</span>
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {selectableNodes.sort((a, b) => b.risk - a.risk).map((n) => (
                <label
                  key={n.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                    selected.includes(n.id)
                      ? 'bg-red-500/10 border border-red-500/20'
                      : 'hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(n.id)}
                    onChange={() => toggleNode(n.id)}
                    className="accent-red-500 shrink-0"
                  />
                  <span className="text-xs font-mono text-slate-300 truncate flex-1">{n.label}</span>
                  <span className="text-[10px] font-mono shrink-0"
                    style={{ color: n.risk >= 0.7 ? '#f87171' : n.risk >= 0.4 ? '#fbbf24' : '#34d399' }}>
                    {(n.risk * 100).toFixed(0)}%
                  </span>
                </label>
              ))}
            </div>
          </div>

          <GlowButton
            variant="danger"
            disabled={!selected.length || running}
            onClick={runSimulation}
            icon={running ? Activity : Play}
            className="w-full justify-center"
            size="lg"
          >
            {running ? 'Simulating…' : 'Run Simulation'}
          </GlowButton>

          {result && (
            <button
              onClick={() => { setResult(null); setSelected([]); setAnimWave(-1) }}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </motion.div>

        {/* Results panel */}
        <div className="lg:col-span-2 space-y-5">
          {/* Impact cards */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-3 gap-4"
              >
                <ImpactCard
                  icon={Zap}
                  label="Blast Radius"
                  value={`${(result.blastRadius * 100).toFixed(1)}%`}
                  sub={`${result.failed.length} nodes affected`}
                  color="red"
                />
                <ImpactCard
                  icon={ChevronRight}
                  label="Cascade Depth"
                  value={result.depth}
                  sub={`${result.waves.length} propagation waves`}
                  color="amber"
                />
                <ImpactCard
                  icon={AlertTriangle}
                  label="Critical Nodes"
                  value={result.failed.filter((id) => {
                    const n = mockGraphNodes.find((x) => x.id === id)
                    return n?.risk >= 0.7
                  }).length}
                  sub="high-risk nodes failed"
                  color="red"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Propagation waves */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-200">Propagation Waves</h3>
                  <StatusBadge status="complete" label="Simulation Complete" />
                </div>
                <div className="space-y-2 mb-5">
                  {result.waves.map((wave, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: i <= animWave ? 1 : 0.25, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                        i <= animWave
                          ? 'border border-red-500/20 bg-red-500/05'
                          : 'border border-white/[0.04]'
                      }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        i <= animWave ? 'bg-red-500/20 text-red-400' : 'bg-white/[0.04] text-slate-600'
                      }`}>
                        {i}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 font-mono">
                          {wave.slice(0, 4).map((id) => {
                            const n = mockGraphNodes.find((x) => x.id === id)
                            return n?.label ?? id
                          }).join(' · ')}
                          {wave.length > 4 && <span className="text-slate-600"> +{wave.length - 4} more</span>}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">{wave.length} nodes</span>
                    </motion.div>
                  ))}
                </div>

                {/* Wave chart */}
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={waveTrend}>
                    <defs>
                      <linearGradient id="cascadeFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="wave" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Area type="monotone" dataKey="cumulative" stroke="#ef4444" strokeWidth={2} fill="url(#cascadeFill)" dot={false} name="Cumulative failed" />
                    <Area type="monotone" dataKey="affected"   stroke="#f59e0b" strokeWidth={1.5} fill="none"               dot={false} name="Wave size" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!result && !running && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card p-12 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Activity size={24} className="text-red-400" />
              </div>
              <p className="text-sm font-semibold text-slate-300 mb-1">No Simulation Running</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">Select seed failure nodes from the control panel and click Run Simulation to visualize cascade propagation.</p>
            </motion.div>
          )}

          {running && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card p-12 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4"
              >
                <Activity size={24} className="text-red-400" />
              </motion.div>
              <p className="text-sm font-semibold text-slate-300 mb-1">Simulating Cascade…</p>
              <p className="text-xs text-slate-500">Running {model} propagation model</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function ImpactCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    red:   { text: 'text-red-400',   bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.15)'   },
    amber: { text: 'text-amber-400', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.15)'  },
  }
  const c = colors[color] ?? colors.red

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl p-4"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} className={c.text} />
        <p className="text-xs text-slate-500">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${c.text} tabular-nums`}>{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </motion.div>
  )
}
