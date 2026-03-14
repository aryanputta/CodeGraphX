import { motion } from 'framer-motion'

const GLOW = {
  cyan:    'rgba(6,182,212,0.12)',
  red:     'rgba(239,68,68,0.12)',
  amber:   'rgba(245,158,11,0.12)',
  emerald: 'rgba(16,185,129,0.12)',
  violet:  'rgba(139,92,246,0.12)',
}

const BORDER = {
  cyan:    'rgba(6,182,212,0.15)',
  red:     'rgba(239,68,68,0.15)',
  amber:   'rgba(245,158,11,0.15)',
  emerald: 'rgba(16,185,129,0.15)',
  violet:  'rgba(139,92,246,0.15)',
}

const TEXT = {
  cyan:    'text-cyan-400',
  red:     'text-red-400',
  amber:   'text-amber-400',
  emerald: 'text-emerald-400',
  violet:  'text-violet-400',
}

export default function MetricCard({ label, value, sub, icon: Icon, color = 'cyan', delay = 0, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="relative rounded-xl p-5 overflow-hidden cursor-default"
      style={{
        background: '#111120',
        border: `1px solid ${BORDER[color]}`,
        boxShadow: `0 0 30px ${GLOW[color]}`,
      }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${GLOW[color].replace('0.12)', '0.6)')}, transparent)` }}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2 tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-slate-100 tabular-nums">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <span>{trend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}% vs last week</span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            className="p-2.5 rounded-xl"
            style={{ background: GLOW[color], border: `1px solid ${BORDER[color]}` }}
          >
            <Icon size={18} className={TEXT[color]} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
