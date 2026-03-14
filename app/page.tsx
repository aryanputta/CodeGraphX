'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  ChevronRight,
  CircuitBoard,
  Database,
  GitBranch,
  Home,
  Settings,
  Shield,
  Sparkles
} from 'lucide-react';

import { cn } from '@/lib/utils';

type RiskRow = {
  module: string;
  kind: string;
  score: number;
  loc: number;
  complexity: number;
  io: string;
  status: 'Critical' | 'Risky' | 'Safe';
};

const riskRows: RiskRow[] = [
  { module: 'ApiDispatcher', kind: 'class', score: 92, loc: 412, complexity: 22, io: '31 / 8', status: 'Critical' },
  { module: 'CoreRouter', kind: 'class', score: 88, loc: 334, complexity: 19, io: '24 / 12', status: 'Critical' },
  { module: 'TelemetryIngest', kind: 'module', score: 72, loc: 290, complexity: 14, io: '16 / 11', status: 'Risky' },
  { module: 'MetricsCache', kind: 'function', score: 64, loc: 178, complexity: 11, io: '9 / 7', status: 'Risky' },
  { module: 'DepSnapshot', kind: 'class', score: 38, loc: 146, complexity: 7, io: '6 / 4', status: 'Safe' }
];

function useRevealOnScroll() {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const node = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.18 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function RevealSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useRevealOnScroll();

  return (
    <section
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out will-change-transform',
        visible ? 'translate-y-0 scale-100 opacity-100 blur-0' : 'translate-y-8 scale-[0.985] opacity-35 blur-[1px]',
        className
      )}
    >
      {children}
    </section>
  );
}

function MiniLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 via-stone-100 to-amber-200 shadow-[0_6px_18px_rgba(90,64,33,0.15)] ring-1 ring-amber-200">
        <CircuitBoard className="h-5 w-5 text-amber-900" />
      </div>
      <div>
        <p className="text-[1.05rem] font-semibold tracking-tight text-stone-900">CodeGraphX</p>
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Analysis Suite</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, tone }: { title: string; value: string; tone?: 'warm' | 'soft' | 'neutral' }) {
  const toneClass =
    tone === 'warm'
      ? 'from-amber-50 to-orange-50 border-amber-200'
      : tone === 'soft'
        ? 'from-stone-50 to-neutral-50 border-stone-200'
        : 'from-amber-50 to-stone-50 border-stone-200';

  return (
    <div className={cn('rounded-2xl border bg-gradient-to-br p-5 shadow-sm', toneClass)}>
      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-stone-900">{value}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f1e7] text-stone-900">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-5 px-4 py-5 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-amber-200 bg-[#f8f4ec] p-5 shadow-sm">
          <MiniLogo />

          <nav className="mt-8 space-y-2">
            {[
              { label: 'Dashboard', icon: Home },
              { label: 'Graph Analysis', icon: GitBranch, active: true },
              { label: 'Repositories', icon: Database },
              { label: 'Failure Simulation', icon: Activity },
              { label: 'Settings', icon: Settings }
            ].map((item) => (
              <button
                key={item.label}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                  item.active
                    ? 'bg-amber-100 text-amber-900 shadow-sm ring-1 ring-amber-200'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-amber-200 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-stone-500">System Status</p>
            <div className="mt-3 space-y-2 text-sm">
              {['API Server', 'ML Engine', 'Graph Store'].map((svc) => (
                <div key={svc} className="flex items-center justify-between">
                  <span className="text-stone-600">{svc}</span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Online
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-5">
          <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-amber-200 bg-[#fbf8f2] px-5 py-4 shadow-sm">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Graph Analysis</h1>
              <p className="text-sm text-stone-600">Interactive dependency risk map · core-telemetry-svc</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800 ring-1 ring-emerald-200">
              <Shield className="h-4 w-4" />
              All Systems Nominal
            </div>
          </header>

          <RevealSection className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Nodes" value="24" tone="neutral" />
            <StatCard title="Critical" value="4" tone="warm" />
            <StatCard title="Risky" value="8" tone="soft" />
            <StatCard title="Safe" value="12" tone="neutral" />
          </RevealSection>

          <RevealSection className="rounded-3xl border border-amber-200 bg-[#fbf8f2] p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 border-b border-amber-100 pb-4">
              <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-stone-700">
                <Boxes className="h-4 w-4" /> Search modules...
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-700">
                <BarChart3 className="h-4 w-4" /> Min risk: 0%
              </div>
              <div className="ml-auto inline-flex items-center gap-2 rounded-xl bg-stone-100 px-3 py-2 text-sm text-stone-700">
                <Sparkles className="h-4 w-4" /> Minimal Theme Enabled
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-100 bg-gradient-to-br from-[#f8f2e8] via-[#f5eee2] to-[#f1e8db] p-4">
              <div className="grid h-[420px] place-items-center rounded-xl border border-amber-200/70 bg-[#fbf8f2]">
                <div className="text-center">
                  <GitBranch className="mx-auto h-9 w-9 text-amber-800" />
                  <p className="mt-3 text-sm text-stone-700">Graph viewport with smooth scroll-in/away reveal</p>
                  <p className="mt-1 text-xs text-stone-500">Warm neutral palette · reduced boxy edges · professional minimal look</p>
                </div>
              </div>
            </div>
          </RevealSection>

          <RevealSection className="rounded-3xl border border-amber-200 bg-[#fbf8f2] shadow-sm">
            <div className="flex items-center justify-between border-b border-amber-100 px-5 py-4">
              <h2 className="text-lg font-semibold text-stone-900">Top Risk Modules</h2>
              <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Sorted by risk</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-stone-500">
                    {['Module', 'Kind', 'Risk Score', 'LOC', 'Complexity', 'In / Out', 'Status'].map((head) => (
                      <th key={head} className="px-5 py-3 font-medium">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {riskRows.map((row) => (
                    <tr key={row.module} className="border-t border-amber-100 text-stone-700">
                      <td className="px-5 py-3 font-medium text-stone-900">{row.module}</td>
                      <td className="px-5 py-3">{row.kind}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 rounded-full bg-amber-100">
                            <div className="h-full rounded-full bg-amber-700" style={{ width: `${row.score}%` }} />
                          </div>
                          <span>{row.score}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">{row.loc}</td>
                      <td className="px-5 py-3">{row.complexity}</td>
                      <td className="px-5 py-3">{row.io}</td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1',
                            row.status === 'Critical' && 'bg-red-50 text-red-700 ring-red-200',
                            row.status === 'Risky' && 'bg-amber-50 text-amber-800 ring-amber-200',
                            row.status === 'Safe' && 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                          )}
                        >
                          {row.status === 'Critical' ? <AlertTriangle className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </RevealSection>
        </div>
      </div>
    </main>
  );
}
