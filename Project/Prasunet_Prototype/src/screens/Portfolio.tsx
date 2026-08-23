import { useState } from 'react';
import { Target, Zap, ChevronRight, GitBranch, ShieldCheck, Check } from 'lucide-react';
import { Card, Badge, SectionHeader, AITag, ExpandableNote } from '@/components';
import { portfolioActions } from '@/data';
import { useStore } from '@/store';
import type { Screen } from '@/types';

export function Portfolio({ setScreen }: { setScreen: (s: Screen) => void }) {
  const [selected, setSelected] = useState(0);
  const action = portfolioActions[selected];

  return (
    <div className="space-y-6 p-8">
      <div className="grid grid-cols-[1.25fr_1fr] gap-5">
        <Card className="p-5">
          <SectionHeader
            icon={<Target size={16} className="text-blue-600" />}
            title="Impact vs feasibility"
            subtitle="Deterministic scoring model · 5 ranked actions"
            right={<Badge tone="blue">Transparent model</Badge>}
          />
          <div className="relative mt-6 h-[340px] border-b border-l border-slate-200">
            <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-slate-200" />
            <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-slate-200" />
            <div className="absolute -left-8 top-1/2 -rotate-90 text-[9px] font-bold uppercase tracking-widest text-slate-400">Business impact</div>
            <div className="absolute bottom-[-24px] left-1/2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Feasibility →</div>
            {portfolioActions.map((a, i) => (
              <button
                key={a.name}
                onClick={() => setSelected(i)}
                className="absolute transition hover:z-10"
                style={{ left: `${a.feasibility}%`, bottom: `${a.impact}%`, transform: 'translate(-50%, 50%)' }}
              >
                <div className={`relative ${selected === i ? 'scale-125' : ''} transition`}>
                  <div className={`h-4 w-4 rounded-full ${a.color} shadow-md shadow-slate-300 ring-4 ring-white`} />
                  <div className={`absolute left-5 top-[-3px] whitespace-nowrap text-[10px] font-semibold ${selected === i ? 'text-blue-700' : 'text-slate-600'}`}>{a.name}</div>
                </div>
              </button>
            ))}
            <div className="absolute right-5 top-5 rounded-lg border border-blue-100 bg-blue-50 p-2 text-[9px] font-bold text-blue-700">HIGH IMPACT<br />HIGH FEASIBILITY</div>
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader icon={<Zap size={16} className="text-amber-500" />} title={`Recommended: #${selected + 1}`} />
          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <Badge tone="blue">Score {action.score}</Badge>
            <h3 className="mt-3 text-base font-semibold text-slate-900">{action.name}</h3>
            <p className="mt-2 text-xs leading-5 text-slate-600">{action.description}</p>
            <div className="mt-4 flex items-center gap-2">
              <Badge tone={action.risk === 'High' ? 'red' : action.risk === 'Medium' ? 'amber' : 'blue'}>{action.risk} risk</Badge>
              <span className="text-[10px] text-slate-500">{action.approver}</span>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {action.dimensions.map((d) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="w-28 text-[10px] text-slate-500">{d.name}</span>
                <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${d.score}%` }} />
                </div>
                <span className="w-7 text-right text-[10px] font-bold text-slate-700">{d.weight}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setScreen('blueprint')}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b1e3d] py-2.5 text-xs font-bold text-white"
          >
            Open transformation blueprint <ChevronRight size={14} />
          </button>
        </Card>
      </div>

      <Card className="p-5">
        <SectionHeader icon={<Target size={16} className="text-blue-600" />} title="All ranked actions" subtitle="Click any row to see its scoring breakdown" />
        <table className="mt-4 w-full text-left text-xs">
          <thead className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            <tr>
              <th className="pb-2">Action</th><th>Score</th><th>Impact</th><th>Feasibility</th><th>Risk</th><th>Approver</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {portfolioActions.map((a, i) => (
              <tr key={a.name} className={`cursor-pointer transition hover:bg-slate-50 ${selected === i ? 'bg-blue-50/50' : ''}`} onClick={() => setSelected(i)}>
                <td className="py-3 font-semibold text-slate-800">{a.name}</td>
                <td className="font-bold text-blue-700">{a.score}</td>
                <td>{a.impact}</td>
                <td>{a.feasibility}</td>
                <td><Badge tone={a.risk === 'High' ? 'red' : a.risk === 'Medium' ? 'amber' : 'blue'}>{a.risk}</Badge></td>
                <td className="text-slate-500">{a.approver}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function Blueprint({ setScreen }: { setScreen: (s: Screen) => void }) {
  const { adoptedActions, toggleAdopted, role } = useStore();
  const actionName = 'Add requirement completeness gate before sprint entry';
  const adopted = Boolean(adoptedActions[actionName]);
  const beforeSteps = ['Requirement created', 'Sprint commitment', 'Development', 'UAT', 'Go-live'];
  const afterSteps = ['Requirement created', 'Completeness gate ✓', 'Sprint commitment', 'Development', 'UAT', 'Go-live'];

  return (
    <div className="space-y-6 p-8">
      <Card className="p-6">
        <SectionHeader
          icon={<GitBranch size={16} className="text-blue-600" />}
          title="Transformation blueprint"
          subtitle="Add requirement completeness gate before sprint entry"
          right={<Badge tone="blue">Intervention #1</Badge>}
        />

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-rose-400">Before — current state</div>
            <div className="space-y-2">
              {beforeSteps.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">{i + 1}</div>
                  <span className="text-xs font-semibold text-slate-600">{step}</span>
                  {i < beforeSteps.length - 1 && <div className="h-px flex-1 border-t border-dashed border-slate-200" />}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50/50 p-3 text-[11px] text-rose-700">
              Stories enter development without acceptance criteria → 3 downstream UAT defects on REQ-172
            </div>
          </div>
          <div>
            <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-emerald-400">After — proposed state</div>
            <div className="space-y-2">
              {afterSteps.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${step.includes('✓') ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{step.includes('✓') ? <Check size={13} /> : i + 1}</div>
                  <span className={`text-xs font-semibold ${step.includes('✓') ? 'text-emerald-700' : 'text-slate-700'}`}>{step.replace(' ✓', '')}</span>
                  {i < afterSteps.length - 1 && <div className="h-px flex-1 border-t border-dashed border-slate-200" />}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-[11px] text-emerald-700">
              Gate blocks sprint entry if acceptance criteria or traceability links are missing → prevents downstream rework
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-[1fr_1fr] gap-5">
        <Card className="p-5">
          <SectionHeader icon={<ShieldCheck size={16} className="text-emerald-600" />} title="Risk tier & approval" />
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50 p-3">
              <span className="text-xs font-semibold text-slate-700">Risk tier</span>
              <Badge tone="amber">Medium</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <span className="text-xs font-semibold text-slate-700">Required approver</span>
              <span className="text-xs font-bold text-slate-800">PM + product owner</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <span className="text-xs font-semibold text-slate-700">AI can act alone?</span>
              <span className="text-xs font-bold text-rose-600">No — draft only</span>
            </div>
          </div>
          <div className="mt-5">
            <AITag approved={adopted} approver={role} />
          </div>
          <button
            onClick={() => toggleAdopted(actionName, role)}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-xs font-bold transition ${
              adopted ? 'bg-emerald-600 text-white' : 'bg-[#0b1e3d] text-white hover:bg-[#183762]'
            }`}
          >
            {adopted ? <><Check size={14} /> Adopted by {role}</> : 'Mark as adopted'}
          </button>
        </Card>

        <Card className="p-5">
          <SectionHeader icon={<Zap size={16} className="text-amber-500" />} title="Expected impact" />
          <div className="mt-4 space-y-3">
            {[
              ['Requirement clarity', '72% → 85%', '↑ 13 pts'],
              ['Reopen/rework rate', '24% → 10%', '↓ 14 pts'],
              ['UAT defect recurrence', '18% → 5%', '↓ 13 pts'],
              ['Traceability completeness', '58% → 90%', '↑ 32 pts'],
            ].map(([kpi, change, movement]) => (
              <div key={kpi} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <span className="text-xs font-semibold text-slate-700">{kpi}</span>
                <span className="text-xs text-slate-500">{change}</span>
                <Badge tone="green">{movement}</Badge>
              </div>
            ))}
          </div>
          <ExpandableNote>
            <div>Expected impact is modeled (Layer 6 deterministic scoring), not asserted. Each KPI projection is based on historical correlation between acceptance-criteria presence and downstream defect rates in the synthetic dataset.</div>
          </ExpandableNote>
        </Card>
      </div>

      <button onClick={() => setScreen('value')} className="flex items-center gap-2 text-xs font-bold text-blue-600">
        See projected KPI impact on the Value Dashboard <ChevronRight size={14} />
      </button>
    </div>
  );
}
