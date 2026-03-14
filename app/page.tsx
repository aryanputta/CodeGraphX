'use client';

import { CircuitBoard, Menu, Sparkles } from 'lucide-react';

import { BentoDemo } from '@/components/ui/bento-demo';
import { FeaturesSectionWithHoverEffectsDemo } from '@/components/ui/feature-section-demo';
import { SplineSceneBasic } from '@/components/ui/spline-scene-demo';

const navItems = ['Dashboard', 'Graph Analysis', 'Repositories', 'Failure Simulation', 'Settings'];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6efe3] text-[#3c2a1d]">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 md:px-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-amber-200/80 bg-[#f9f3e8] p-5 shadow-[0_18px_40px_rgba(110,84,54,0.10)]">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-900 shadow-sm">
              <CircuitBoard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">CodeGraphX</p>
              <p className="text-xs uppercase tracking-[0.18em] text-amber-800/70">Minimal Intelligence</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item, index) => (
              <button
                key={item}
                className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  index === 1
                    ? 'bg-amber-200/60 font-medium text-amber-900 shadow-sm'
                    : 'text-[#6f5440] hover:bg-amber-100/70'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-amber-200 bg-white/60 p-4 text-sm text-[#6f5440]">
            <p className="mb-2 font-medium text-[#4f3828]">System Status</p>
            <div className="space-y-1">
              <p>API Server · online</p>
              <p>ML Engine · online</p>
              <p>Graph Store · online</p>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <header className="flex items-center justify-between rounded-3xl border border-amber-200/70 bg-[#fbf7f0] px-5 py-4 shadow-[0_10px_25px_rgba(110,84,54,0.08)]">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Graph Analysis</h1>
              <p className="text-sm text-[#7b5f48]">Less boxy. More modern. Better visual hierarchy.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm text-emerald-800">
              <Sparkles className="h-4 w-4" /> All Systems Nominal
            </div>
          </header>

          <SplineSceneBasic />

          <section className="rounded-3xl border border-amber-200/80 bg-[#fbf7f0] p-4 shadow-[0_10px_25px_rgba(110,84,54,0.08)]">
            <BentoDemo />
          </section>

          <section className="rounded-3xl border border-amber-200/80 bg-[#fbf7f0] p-4 shadow-[0_10px_25px_rgba(110,84,54,0.08)]">
            <FeaturesSectionWithHoverEffectsDemo />
          </section>
        </div>
      </div>

      <button className="fixed bottom-5 right-5 rounded-full border border-amber-300 bg-[#f9f3e8] p-3 text-[#6f5440] shadow-md lg:hidden">
        <Menu className="h-5 w-5" />
      </button>
    </main>
  );
}
