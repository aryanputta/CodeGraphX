import { motion } from 'framer-motion'
import {
  Activity, BarChart3, GitBranch, LayoutDashboard, Settings, Share2, Zap,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard'          },
  { to: '/graph',     icon: Share2,          label: 'Graph Analysis'     },
  { to: '/repos',     icon: GitBranch,       label: 'Repositories'       },
  { to: '/simulate',  icon: Activity,        label: 'Failure Simulation' },
  { to: '/settings',  icon: Settings,        label: 'Settings'           },
]

export default function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-full w-60 flex flex-col z-40"
      style={{ background: '#0a0a18', borderRight: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center glow-cyan">
            <Zap size={16} className="text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0a0a18]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100 tracking-wide">CodeGraphX</p>
          <p className="text-[10px] text-slate-500 font-mono">v2.0 · PRODUCTION</p>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-5 mb-2">
        <p className="text-[10px] font-semibold text-slate-600 tracking-widest uppercase">Navigation</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                  isActive
                    ? 'nav-active'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                }`}
              >
                <Icon size={15} />
                <span className="text-sm font-medium">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400"
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 m-3 rounded-xl" style={{ background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.08)' }}>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={12} className="text-cyan-500" />
          <p className="text-[11px] font-semibold text-slate-400">System Status</p>
        </div>
        <div className="space-y-1.5">
          <StatusRow label="API Server"  status="online" />
          <StatusRow label="ML Engine"   status="online" />
          <StatusRow label="Graph Store" status="online" />
        </div>
      </div>

      {/* User */}
      <div className="p-3 m-3 mt-0 rounded-xl flex items-center gap-3"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
          S
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-300 truncate">Srini</p>
          <p className="text-[10px] text-slate-600 truncate">Administrator</p>
        </div>
      </div>
    </motion.aside>
  )
}

function StatusRow({ label, status }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-slate-500">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
        <span className="text-[10px] text-emerald-400 font-mono">{status}</span>
      </div>
    </div>
  )
}
