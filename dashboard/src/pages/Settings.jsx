import { motion } from 'framer-motion'
import { Bell, Database, Key, Shield, Sliders } from 'lucide-react'
import { useState } from 'react'
import GlowButton from '../components/ui/GlowButton.jsx'

function Section({ icon: Icon, title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.05]">
        <div className="p-2 rounded-lg bg-cyan-500/10">
          <Icon size={14} className="text-cyan-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </motion.div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="grid grid-cols-3 gap-6 items-start">
      <div>
        <p className="text-sm font-medium text-slate-300">{label}</p>
        {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
      </div>
      <div className="col-span-2">{children}</div>
    </div>
  )
}

function Input({ placeholder, defaultValue, type = 'text' }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue}
      className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-white/[0.07] rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
    />
  )
}

function Toggle({ defaultOn = false }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative w-10 h-5.5 rounded-full transition-all duration-200 ${on ? 'bg-cyan-500' : 'bg-white/[0.08]'}`}
      style={{ height: 22, width: 40 }}
    >
      <motion.div
        animate={{ x: on ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-md"
        style={{ width: 18, height: 18 }}
      />
    </button>
  )
}

export default function Settings() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Platform configuration and preferences</p>
      </div>

      <Section icon={Database} title="API Configuration">
        <Field label="Backend URL" hint="FastAPI server endpoint">
          <Input placeholder="http://localhost:8000" defaultValue="http://localhost:8000" />
        </Field>
        <Field label="Request Timeout" hint="In milliseconds">
          <Input placeholder="30000" defaultValue="30000" type="number" />
        </Field>
        <Field label="API Key" hint="Optional bearer token for authenticated endpoints">
          <Input placeholder="sk-••••••••••••••••" type="password" />
        </Field>
      </Section>

      <Section icon={Sliders} title="Analysis Defaults">
        <Field label="Default Branch" hint="Fallback branch for repo ingestion">
          <Input placeholder="main" defaultValue="main" />
        </Field>
        <Field label="GNN Epochs" hint="Training iterations for ML model">
          <Input placeholder="200" defaultValue="200" type="number" />
        </Field>
        <Field label="Risk Threshold" hint="Minimum score to flag a node as risky">
          <div className="flex items-center gap-3">
            <input type="range" min={0} max={1} step={0.05} defaultValue={0.4} className="flex-1 accent-cyan-500" />
            <span className="text-sm font-mono text-cyan-400 w-12 text-right">0.40</span>
          </div>
        </Field>
        <Field label="Cascade Model" hint="Default failure propagation model">
          <div className="flex gap-2">
            {['Deterministic', 'Probabilistic'].map((m) => (
              <button
                key={m}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                  m === 'Deterministic'
                    ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                    : 'border-white/[0.06] text-slate-500 hover:text-slate-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      <Section icon={Bell} title="Notifications">
        <Field label="Analysis complete" hint="Alert when a repo finishes processing">
          <Toggle defaultOn />
        </Field>
        <Field label="Critical node detected" hint="Alert when risk score exceeds threshold">
          <Toggle defaultOn />
        </Field>
        <Field label="Simulation finished" hint="Alert when cascade simulation completes">
          <Toggle />
        </Field>
        <Field label="Pipeline failure" hint="Alert on ingestion or ML errors">
          <Toggle defaultOn />
        </Field>
      </Section>

      <Section icon={Shield} title="Security">
        <Field label="CORS Origins" hint="Allowed frontend origins (comma-separated)">
          <Input placeholder="http://localhost:3000" defaultValue="http://localhost:3000" />
        </Field>
        <Field label="Audit logging" hint="Log all API calls with timestamps">
          <Toggle />
        </Field>
      </Section>

      <div className="flex justify-end gap-3 pb-4">
        <GlowButton variant="ghost">Reset to Defaults</GlowButton>
        <GlowButton variant="primary" icon={Key}>Save Configuration</GlowButton>
      </div>
    </div>
  )
}
