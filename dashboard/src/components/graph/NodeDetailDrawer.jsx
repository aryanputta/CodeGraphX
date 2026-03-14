import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Code2, GitBranch, TrendingUp, X } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge.jsx'

function riskLabel(risk) {
  if (risk >= 0.7) return 'critical'
  if (risk >= 0.4) return 'risky'
  return 'safe'
}

function RiskBar({ value }) {
  const color = value >= 0.7 ? '#ef4444' : value >= 0.4 ? '#f59e0b' : '#10b981'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
      <span className="text-sm font-mono font-semibold" style={{ color }}>{(value * 100).toFixed(0)}%</span>
    </div>
  )
}

function StatRow({ icon: Icon, label, value, color = 'text-slate-300' }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
      <div className="flex items-center gap-2">
        <Icon size={13} className="text-slate-500" />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <span className={`text-xs font-mono font-medium ${color}`}>{value}</span>
    </div>
  )
}

export default function NodeDetailDrawer({ node, onClose }) {
  return (
    <AnimatePresence>
      {node && (
        <motion.div
          key={node.id}
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute top-0 right-0 h-full w-72 overflow-y-auto z-20 flex flex-col"
          style={{ background: '#0f0f1c', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06]">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Node Details</p>
              <h3 className="text-sm font-semibold text-slate-100 font-mono">{node.label}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Risk score */}
          <div className="px-4 py-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500">Defect Probability</p>
              <StatusBadge status={riskLabel(node.risk)} size="xs" />
            </div>
            <RiskBar value={node.risk} />
          </div>

          {/* Stats */}
          <div className="px-4 py-2">
            <StatRow icon={Code2}      label="Kind"       value={node.kind}       />
            <StatRow icon={TrendingUp} label="LOC"        value={node.loc ?? '—'} />
            <StatRow icon={AlertTriangle} label="Complexity" value={node.complexity ?? '—'}
              color={node.complexity > 15 ? 'text-red-400' : node.complexity > 8 ? 'text-amber-400' : 'text-emerald-400'} />
            <StatRow icon={GitBranch}  label="In-degree"  value={node.inDegree}   />
            <StatRow icon={GitBranch}  label="Out-degree" value={node.outDegree}  />
          </div>

          {/* Filepath */}
          {node.filepath && (
            <div className="px-4 py-3 border-t border-white/[0.04]">
              <p className="text-xs text-slate-500 mb-1">Source path</p>
              <p className="text-xs font-mono text-cyan-400 break-all">{node.filepath}</p>
            </div>
          )}

          {/* Risk insight */}
          <div className="mx-4 mt-auto mb-4 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {node.risk >= 0.7
                ? `High blast radius — ${node.inDegree} upstream dependents. Immediate review recommended.`
                : node.risk >= 0.4
                ? `Moderate risk. Monitor for regression during refactors.`
                : `Low defect probability. Stable and well-isolated.`}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
