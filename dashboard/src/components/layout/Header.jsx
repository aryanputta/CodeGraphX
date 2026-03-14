import { motion } from 'framer-motion'
import { Bell, Search, Shield } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [query, setQuery] = useState('')

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="fixed top-0 right-0 left-60 h-14 z-30 flex items-center px-6 gap-4"
      style={{
        background: 'rgba(7,7,15,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
        <input
          type="text"
          placeholder="Search modules, repos, functions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 text-sm bg-white/[0.03] border border-white/[0.06] rounded-lg text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.05] transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-mono">⌘K</div>
      </div>

      <div className="flex-1" />

      {/* Health badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
        <Shield size={12} className="text-emerald-400" />
        <span className="text-xs font-medium text-emerald-400">All Systems Nominal</span>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
      </div>

      {/* Notifications */}
      <button className="relative p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
        <Bell size={15} className="text-slate-500" />
        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
      </button>

      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:ring-2 hover:ring-violet-500/40 transition-all">
        S
      </div>
    </motion.header>
  )
}
