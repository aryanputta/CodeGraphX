const CONFIG = {
  complete: { text: 'Complete', dot: 'bg-emerald-400', cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  running:  { text: 'Running',  dot: 'bg-cyan-400 animate-pulse',     cls: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20'    },
  pending:  { text: 'Pending',  dot: 'bg-slate-400',  cls: 'text-slate-400 bg-slate-400/10 border-slate-400/20'  },
  failed:   { text: 'Failed',   dot: 'bg-red-400',    cls: 'text-red-400 bg-red-400/10 border-red-400/20'        },
  critical: { text: 'Critical', dot: 'bg-red-400 animate-pulse',      cls: 'text-red-400 bg-red-400/10 border-red-400/20'        },
  warning:  { text: 'Warning',  dot: 'bg-amber-400',  cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20'  },
  info:     { text: 'Info',     dot: 'bg-blue-400',   cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20'     },
  safe:     { text: 'Safe',     dot: 'bg-emerald-400',cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  risky:    { text: 'Risky',    dot: 'bg-amber-400',  cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20'  },
}

export default function StatusBadge({ status, label, size = 'sm' }) {
  const cfg = CONFIG[status] ?? CONFIG.info
  const text = label ?? cfg.text
  const padding = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium font-mono ${padding} ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {text}
    </span>
  )
}
