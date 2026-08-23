import { useState } from 'react';
import { GitBranch, AlertCircle, CheckCircle2, Clock, TrendingUp, ChevronRight, Zap } from 'lucide-react';
import { Card, Badge, SectionHeader, AITag, ExpandableNote } from '@/components';
import { requirements, changeRequests, engagements } from '@/data';
import type { Screen } from '@/types';

export function Impact() {
  const [reqId, setReqId] = useState(requirements[0].id);
  const [hours, setHours] = useState(20);
  const [sprint, setSprint] = useState('Sprint 08');
  const [result, setResult] = useState<null | {
    riskLevel: string;
    affectedSystems: string[];
    downstream: string[];
    timeline: string;
    recommendation: string;
  }>(null);
  const [loading, setLoading] = useState(false);

  const req = requirements.find((r) => r.id === reqId)!;
  const cr = changeRequests.find((c) => c.linkedRequirement === reqId);

  async function simulate() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const riskLevel = hours > 30 || req.clarityScore < 40 ? 'High' : hours > 15 ? 'Medium' : 'Low';
    const affectedSystems = engagements
      .filter((e) => e.name === req.engagement)
      .map((e) => `${e.name} (${e.phase})`);
    const downstream: string[] = [];
    if (!req.hasAcceptanceCriteria) downstream.push('No acceptance criteria — UAT defects likely');
    if (req.clarityScore < 50) downstream.push(`Low clarity score (${req.clarityScore}%) — clarification loops expected`);
    if (hours > 20) downstream.push(`Effort (${hours}h) exceeds sprint capacity buffer`);
    if (cr && cr.approvalStatus === 'Pending') downstream.push(`Linked CR (${cr.id}) still pending approval`);

    setResult({
      riskLevel,
      affectedSystems,
      downstream,
      timeline: hours > 20 ? '2–3 sprints' : hours > 10 ? '1–2 sprints' : 'Within current sprint',
      recommendation: riskLevel === 'High'
        ? 'Route to client sponsor + PM + finance for impact review. Do not commit without sign-off.'
        : riskLevel === 'Medium'
        ? 'PM + product owner review required. Update sprint burndown and capacity plan.'
        : 'BA or product owner can approve. Proceed with sprint commitment.',
    });
    setLoading(false);
  }

  return (
    <div className="space-y-6 p-8">
      <Card className="p-6">
        <SectionHeader
          icon={<GitBranch size={16} className="text-blue-600" />}
          title="Change Impact Simulator"
          subtitle="Model the delivery impact of a proposed change before committing it"
          right={<Badge tone="blue">Layer 6 · deterministic scoring</Badge>}
        />
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Requirement
              <select value={reqId} onChange={(e) => setReqId(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 outline-none focus:border-blue-400">
                {requirements.map((r) => <option key={r.id} value={r.id}>{r.id} · {r.text}</option>)}
              </select>
            </label>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Estimated effort (hours)
              <input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="mt-2 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 outline-none focus:border-blue-400" />
            </label>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Target sprint
              <select value={sprint} onChange={(e) => setSprint(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 outline-none">
                <option>Sprint 08</option><option>Sprint 09</option><option>Sprint 10</option>
              </select>
            </label>
            <button
              onClick={simulate}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b1e3d] py-3 text-xs font-bold text-white disabled:opacity-50"
            >
              <Zap size={14} /> {loading ? 'Simulating...' : 'Run impact simulation'}
            </button>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Requirement context</div>
            <div className="mt-3 space-y-2 text-xs">
              <div><span className="text-slate-400">Text:</span> <span className="font-semibold text-slate-700">{req.text}</span></div>
              <div><span className="text-slate-400">Engagement:</span> <span className="font-semibold text-slate-700">{req.engagement}</span></div>
              <div><span className="text-slate-400">Owner:</span> <span className="font-semibold text-slate-700">{req.owner}</span></div>
              <div><span className="text-slate-400">Clarity:</span> <span className="font-semibold text-slate-700">{req.clarityScore}%</span></div>
              <div><span className="text-slate-400">Acceptance criteria:</span> {req.hasAcceptanceCriteria ? <Badge tone="green">Present</Badge> : <Badge tone="red">Missing</Badge>}</div>
              <div><span className="text-slate-400">Linked CR:</span> <span className="font-semibold text-slate-700">{cr ? `${cr.id} (${cr.approvalStatus})` : 'None'}</span></div>
            </div>
          </div>
        </div>
      </Card>

      {result && (
        <Card className="p-6">
          <SectionHeader
            icon={<TrendingUp size={16} className="text-blue-600" />}
            title="Simulation results"
            right={
              <Badge tone={result.riskLevel === 'High' ? 'red' : result.riskLevel === 'Medium' ? 'amber' : 'green'}>
                {result.riskLevel} risk
              </Badge>
            }
          />
          <div className="mt-5 grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400"><AlertCircle size={12} /> Downstream impact</div>
                <div className="space-y-2">
                  {result.downstream.length > 0 ? result.downstream.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 p-2.5 text-[11px] text-amber-700">
                      <AlertCircle size={12} className="mt-0.5 shrink-0" /> {d}
                    </div>
                  )) : (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-2.5 text-[11px] text-emerald-700">
                      <CheckCircle2 size={12} /> No downstream impact detected
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400"><Clock size={12} /> Estimated timeline</div>
                <div className="rounded-lg bg-slate-50 p-3 text-xs font-semibold text-slate-700">{result.timeline}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Affected systems</div>
                <div className="space-y-1.5">
                  {result.affectedSystems.map((s) => (
                    <div key={s} className="rounded-lg border border-slate-200 p-2.5 text-xs font-semibold text-slate-700">{s}</div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Recommendation</div>
                <div className="rounded-lg border-l-2 border-blue-500 bg-blue-50/50 p-3 text-xs leading-5 text-slate-700">{result.recommendation}</div>
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <AITag approved={false} />
            <span className="text-[10px] text-slate-400">Simulation is deterministic — no LLM involved in risk scoring</span>
          </div>
          <ExpandableNote>
            <div>Risk level is computed from: effort hours vs sprint capacity, requirement clarity score, acceptance criteria presence, and linked CR approval status. No LLM is involved — this is pure rule-based scoring.</div>
          </ExpandableNote>
        </Card>
      )}
    </div>
  );
}
