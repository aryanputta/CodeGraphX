import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, CheckCircle2, Circle, Code2, FileBarChart2, GitBranch,
  Loader2, Network, Play, Share2, XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GlowButton from '../components/ui/GlowButton.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { mockRepos } from '../data/mockData.js'

const STEPS = [
  { id: 1, label: 'Cloning repository',       icon: GitBranch    },
  { id: 2, label: 'Parsing source code',       icon: Code2        },
  { id: 3, label: 'Extracting graph features', icon: Network      },
  { id: 4, label: 'Building dependency graph', icon: Share2       },
  { id: 5, label: 'Running ML inference',      icon: Brain        },
  { id: 6, label: 'Generating risk report',    icon: FileBarChart2},
]

function StepRow({ step, status, duration }) {
  const Icon = step.icon
  const isDone    = status === 'done'
  const isActive  = status === 'active'
  const isPending = status === 'pending'

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 py-3.5 border-b border-white/[0.04] last:border-0"
    >
      <div className={`p-2 rounded-lg ${isDone ? 'bg-emerald-400/10' : isActive ? 'bg-cyan-400/10' : 'bg-white/[0.03]'}`}>
        <Icon size={14} className={isDone ? 'text-emerald-400' : isActive ? 'text-cyan-400' : 'text-slate-600'} />
      </div>
      <div className="flex-1">
        <p className={`text-sm ${isDone ? 'text-slate-300' : isActive ? 'text-slate-200' : 'text-slate-500'}`}>
          {step.label}
        </p>
        {isActive && (
          <div className="mt-1.5 h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '75%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
          </div>
        )}
      </div>
      <div className="shrink-0">
        {isDone && <CheckCircle2 size={16} className="text-emerald-400" />}
        {isActive && (
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Loader2 size={16} className="text-cyan-400" />
          </motion.div>
        )}
        {isPending && <Circle size={16} className="text-slate-700" />}
        {duration && <span className="text-[10px] font-mono text-slate-600 ml-2">{duration}ms</span>}
      </div>
    </motion.div>
  )
}

export default function RepositoryAnalysis() {
  const navigate    = useNavigate()
  const [url, setUrl]       = useState('')
  const [branch, setBranch] = useState('main')
  const [running, setRunning]   = useState(false)
  const [activeStep, setActiveStep] = useState(-1)
  const [done, setDone]     = useState(false)
  const [error, setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!url.trim()) return
    setRunning(true)
    setDone(false)
    setError('')

    // Simulate pipeline progression
    for (let i = 0; i < STEPS.length; i++) {
      setActiveStep(i)
      await new Promise((r) => setTimeout(r, 900 + Math.random() * 600))
    }
    setActiveStep(-1)
    setDone(true)
    setRunning(false)
  }

  const stepStatus = (idx) => {
    if (!running && !done) return 'pending'
    if (done) return 'done'
    if (idx < activeStep) return 'done'
    if (idx === activeStep) return 'active'
    return 'pending'
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Repository Analysis</h1>
        <p className="text-sm text-slate-500 mt-0.5">Submit a repository to run the full ingestion pipeline</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 space-y-5"
        >
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <GitBranch size={14} className="text-cyan-400" />
            Repository Configuration
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Repository URL</label>
              <input
                type="text"
                placeholder="https://github.com/org/repo.git"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white/[0.03] border border-white/[0.07] rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Branch</label>
              <input
                type="text"
                placeholder="main"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white/[0.03] border border-white/[0.07] rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'GNN inference',      key: 'ml'      },
                { label: 'Cascade analysis',   key: 'cascade' },
                { label: 'Synthetic labels',   key: 'synth'   },
                { label: 'Skip test files',    key: 'notest'  },
              ].map((opt) => (
                <label key={opt.key} className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4 h-4 rounded border border-white/[0.12] bg-white/[0.03] flex items-center justify-center group-hover:border-cyan-500/40 transition-colors">
                    <div className="w-2 h-2 rounded-sm bg-cyan-500" />
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">{opt.label}</span>
                </label>
              ))}
            </div>

            <GlowButton
              type="submit"
              disabled={running || !url.trim()}
              icon={running ? Loader2 : Play}
              className="w-full justify-center"
              size="lg"
            >
              {running ? 'Analyzing…' : 'Run Analysis'}
            </GlowButton>
          </form>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <XCircle size={14} className="text-red-400" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
        </motion.div>

        {/* Pipeline progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Pipeline Status</h2>
            {running && <StatusBadge status="running" label="In Progress" />}
            {done && <StatusBadge status="complete" label="Complete" />}
            {!running && !done && <StatusBadge status="pending" label="Awaiting Input" />}
          </div>

          <div>
            {STEPS.map((step, idx) => (
              <StepRow key={step.id} step={step} status={stepStatus(idx)} />
            ))}
          </div>

          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 rounded-xl text-center"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
              >
                <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-emerald-400">Analysis Complete</p>
                <p className="text-xs text-slate-500 mt-1">Graph and risk report ready</p>
                <GlowButton
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/graph')}
                  icon={Share2}
                >
                  View Dependency Graph
                </GlowButton>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Recent analyses */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-white/[0.05]">
          <h2 className="text-sm font-semibold text-slate-200">Recent Analyses</h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {mockRepos.map((repo) => (
            <div key={repo.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
              <div className="p-2 rounded-lg bg-white/[0.03]">
                <GitBranch size={13} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono font-medium text-slate-200 truncate">{repo.name}</p>
                <p className="text-xs text-slate-500">
                  {repo.nodes > 0 ? `${repo.nodes.toLocaleString()} nodes · ${repo.edges.toLocaleString()} edges` : 'No data yet'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {repo.riskScore > 0 && (
                  <span className="text-xs font-mono" style={{ color: repo.riskScore >= 0.7 ? '#f87171' : repo.riskScore >= 0.4 ? '#fbbf24' : '#34d399' }}>
                    {(repo.riskScore * 100).toFixed(0)}% risk
                  </span>
                )}
                <StatusBadge status={repo.status} size="xs" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
