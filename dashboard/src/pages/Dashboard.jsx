import { motion } from 'framer-motion'
import {
  Activity, AlertTriangle, BarChart3, GitBranch, Network, Shield, Zap,
} from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import ChartCard from '../components/ui/ChartCard.jsx'
import MetricCard from '../components/ui/MetricCard.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import {
  activityFeed, densityTrend, mockMetrics, mockRepos, riskDistribution,
} from '../data/mockData.js'

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#161628', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, color: '#e2e8f0', fontSize: 12,
  },
  cursor: { fill: 'rgba(255,255,255,0.02)' },
}

const ACTIVITY_ICON = {
  analysis:   { icon: BarChart3,     color: 'text-cyan-400',    bg: 'bg-cyan-400/10'    },
  simulation: { icon: Activity,      color: 'text-violet-400',  bg: 'bg-violet-400/10'  },
  alert:      { icon: AlertTriangle, color: 'text-red-400',     bg: 'bg-red-400/10'     },
}

export default function Dashboard() {
  const navigate = useNavigate()

  const topRepos = useMemo(
    () => [...mockRepos].filter((r) => r.status === 'complete').sort((a, b) => b.riskScore - a.riskScore).slice(0, 5),
    []
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page title */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl font-bold text-slate-100">Executive Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Graph intelligence platform · real-time risk overview</p>
      </motion.div>

      {/* Hero metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Repositories Analyzed" value={mockMetrics.totalRepos}        icon={GitBranch}     color="cyan"    delay={0}    trend={12} />
        <MetricCard label="Modules Parsed"         value={mockMetrics.totalModules.toLocaleString()} icon={Network}  color="violet"  delay={0.05} trend={8}  />
        <MetricCard label="High-Risk Modules"      value={mockMetrics.highRiskModules}   icon={AlertTriangle} color="red"     delay={0.1}  trend={-3} />
        <MetricCard label="Active Simulations"     value={mockMetrics.activeSimulations} icon={Activity}      color="amber"   delay={0.15} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Avg Defect Probability" value={`${(mockMetrics.avgDefectProb * 100).toFixed(0)}%`} icon={Zap}    color="amber"   delay={0.2}  />
        <MetricCard label="Critical Paths"          value={mockMetrics.criticalPaths}                          icon={Shield} color="red"     delay={0.25} />
        <MetricCard label="Graph Density"           value={`${(mockMetrics.graphDensity * 100).toFixed(0)}%`}  icon={BarChart3} color="cyan" delay={0.3}  trend={5}  />
        <MetricCard label="Analysis Runs (7d)"      value={mockMetrics.recentRuns}                             icon={Activity} color="emerald" delay={0.35} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Risk distribution */}
        <ChartCard
          title="Defect Score Distribution"
          subtitle="Module count by risk bracket"
          delay={0.2}
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={riskDistribution} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="range" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {riskDistribution.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Density trend */}
        <ChartCard
          title="Graph Density Trend"
          subtitle="Total modules tracked over 7 days"
          delay={0.25}
        >
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={densityTrend}>
              <defs>
                <linearGradient id="nodeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="nodes" stroke="#06b6d4" strokeWidth={2} fill="url(#nodeFill)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Repo risk ranking */}
        <ChartCard title="Repository Risk Ranking" subtitle="Top 5 by defect score" delay={0.3} className="lg:col-span-2">
          <div className="space-y-2">
            {topRepos.map((repo, i) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                onClick={() => navigate(`/graph?repo=${repo.name}`)}
                className="flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all hover:bg-white/[0.03] group"
              >
                <span className="text-xs font-mono text-slate-600 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 group-hover:text-cyan-400 transition-colors truncate font-mono">{repo.name}</p>
                  <p className="text-xs text-slate-500">{repo.nodes.toLocaleString()} nodes · {repo.edges.toLocaleString()} edges</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${repo.riskScore * 100}%`,
                        background: repo.riskScore >= 0.7 ? '#ef4444' : repo.riskScore >= 0.4 ? '#f59e0b' : '#10b981',
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-400 w-8 text-right">{(repo.riskScore * 100).toFixed(0)}%</span>
                  <StatusBadge status={repo.status} size="xs" />
                </div>
              </motion.div>
            ))}
          </div>
        </ChartCard>

        {/* Activity feed */}
        <ChartCard title="System Activity" subtitle="Recent events" delay={0.35}>
          <div className="space-y-3">
            {activityFeed.slice(0, 5).map((item) => {
              const cfg = ACTIVITY_ICON[item.type] ?? ACTIVITY_ICON.analysis
              const Icon = cfg.icon
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + item.id * 0.05 }}
                  className="flex gap-3"
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${cfg.bg}`}>
                    <Icon size={11} className={cfg.color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-300 leading-relaxed">{item.msg}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-slate-600">{item.repo}</span>
                      <span className="text-[10px] text-slate-600">·</span>
                      <span className="text-[10px] text-slate-600">{item.time}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
