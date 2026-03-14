import { motion } from 'framer-motion'

export function LoadingSpinner({ size = 20, color = '#06b6d4' }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        border: `2px solid rgba(255,255,255,0.08)`,
        borderTopColor: color,
      }}
    />
  )
}

export function LoadingSkeleton({ rows = 3, height = 'h-8' }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`${height} rounded-lg shimmer`} style={{ opacity: 1 - i * 0.2 }} />
      ))}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <LoadingSpinner size={32} />
      <p className="text-sm text-slate-500 font-mono animate-pulse">Loading...</p>
    </div>
  )
}
