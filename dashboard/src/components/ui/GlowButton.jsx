import { motion } from 'framer-motion'

const VARIANTS = {
  primary: {
    base: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white',
    hover: 'hover:from-cyan-400 hover:to-blue-500',
    shadow: '0 0 20px rgba(6,182,212,0.3)',
    hoverShadow: '0 0 35px rgba(6,182,212,0.5)',
  },
  danger: {
    base: 'bg-gradient-to-r from-red-500 to-rose-600 text-white',
    hover: 'hover:from-red-400 hover:to-rose-500',
    shadow: '0 0 20px rgba(239,68,68,0.3)',
    hoverShadow: '0 0 35px rgba(239,68,68,0.5)',
  },
  ghost: {
    base: 'bg-white/[0.04] text-slate-300 border border-white/[0.08]',
    hover: 'hover:bg-white/[0.08] hover:text-slate-100',
    shadow: 'none',
    hoverShadow: 'none',
  },
  outline: {
    base: 'bg-transparent text-cyan-400 border border-cyan-500/30',
    hover: 'hover:bg-cyan-500/10 hover:border-cyan-500/60',
    shadow: 'none',
    hoverShadow: '0 0 20px rgba(6,182,212,0.15)',
  },
}

export default function GlowButton({ children, variant = 'primary', size = 'md', onClick, disabled, className = '', icon: Icon }) {
  const v = VARIANTS[variant]
  const padding = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-3 text-sm' : 'px-4 py-2 text-sm'

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`relative inline-flex items-center gap-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${padding} ${v.base} ${v.hover} ${className}`}
      style={{ boxShadow: v.shadow }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.boxShadow = v.hoverShadow)}
      onMouseLeave={(e) => !disabled && (e.currentTarget.style.boxShadow = v.shadow)}
    >
      {Icon && <Icon size={14} />}
      {children}
    </motion.button>
  )
}
