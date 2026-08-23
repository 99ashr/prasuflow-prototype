import { ArrowUpRight, BriefcaseBusiness, Activity, AlertCircle, FileCheck2, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Card, Badge, ScoreRing, Sparkline, SectionHeader, TraceableNumber } from '@/components';
import { engagements, kpis } from '@/data';
import { useStore } from '@/store';
import type { Screen, Signal } from '@/types';

export function Overview({
  setScreen,
  onSignal,
}: {
  setScreen: (s: Screen) => void;
  onSignal: (s: Signal) => void;
}) {
  const { signals, auditEntries } = useStore();
  const openSignals = signals.filter((s) => !s.approved);
  const highRisk = openSignals.filter((s) => s.risk === 'High' || s.risk === 'Critical');
  const avgScore = Math.round(engagements.reduce((a, e) => a + e.score, 0) / engagements.length);

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="green">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live workspace
            </Badge>
            <span className="text-xs text-slate-400">Last synced 8 minutes ago</span>
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Good morning, Priya.</h2>
          <p className="mt-1 text-sm text-slate-500">Here is what needs your attention across delivery today.</p>
        </div>
        <button
          onClick={() => setScreen('intelligence')}
          className="flex items-center gap-2 rounded-lg bg-[#0b1e3d] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#183762]"
        >
          <Sparkles size={15} className="text-[#66c2ff]" /> Review signals <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active engagements</div>
              <TraceableNumber
                value={String(engagements.length).padStart(2, '0')}
                label="across 3 phases"
                formula="Count of engagements with status = active in the engagement register."
              />
              <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <ArrowUpRight size={13} /> 1 new this quarter
              </div>
            </div>
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><BriefcaseBusiness size={18} /></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Delivery health</div>
              <TraceableNumber
                value={`${avgScore}`}
                label="of 100"
                formula="Weighted composite of 6 KPIs: requirement clarity (25%), late-change ratio (20%), rework rate (20%), UAT recurrence (15%), scope-approval latency (10%), traceability (10%)."
              />
              <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <ArrowUpRight size={13} /> 4 pts vs last week
              </div>
            </div>
            <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600"><Activity size={18} /></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Open evidence cards</div>
              <TraceableNumber
                value={String(openSignals.length)}
                label="awaiting decision"
                formula="Count of EvidenceCards where approved = false. Includes all risk tiers."
              />
              <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                <ArrowUpRight size={13} /> {highRisk.length} need approval today
              </div>
            </div>
            <div className="rounded-lg bg-rose-50 p-2.5 text-rose-600"><AlertCircle size={18} /></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Value evidence</div>
              <TraceableNumber
                value="76%"
                label="traceability complete"
                formula="Items linked requirement→story→test ÷ all active items. Directional status."
              />
              <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <ArrowUpRight size={13} /> 18 pts vs baseline
              </div>
            </div>
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600"><FileCheck2 size={18} /></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-[1.55fr_1fr] gap-5">
        <Card className="p-5">
          <SectionHeader
            icon={<Activity size={16} className="text-blue-600" />}
            title="Combined delivery risk"
            subtitle="Priority handoffs · last 8 weeks"
            right={<Badge tone="green">Trending down</Badge>}
          />
          <div className="mt-5 h-40"><Sparkline color="#1685d8" height={140} /></div>
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            <span>Jun 24</span><span>Jul 08</span><span>Jul 22</span><span>Aug 05</span><span>Today</span>
          </div>
        </Card>
        <Card className="p-5">
          <SectionHeader icon={<ShieldCheck size={16} className="text-emerald-600" />} title="Delivery health score" />
          <div className="mt-4 flex items-center gap-5">
            <ScoreRing score={avgScore} />
            <div className="space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Risk posture</div>
                <div className="mt-1 text-sm font-semibold text-emerald-700">Controlled</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Confidence</div>
                <div className="mt-1 text-sm font-semibold text-slate-800">87%</div>
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3 text-[10px] text-slate-500">
            <span className="font-semibold text-slate-700">How calculated</span> · weighted composite of 6 evidence-backed KPIs
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-[1.2fr_1fr] gap-5">
        <Card className="p-5">
          <SectionHeader
            icon={<AlertCircle size={16} className="text-rose-500" />}
            title="Needs your decision"
            subtitle="Highest materiality signals, prioritized by risk"
            right={<button onClick={() => setScreen('intelligence')} className="text-xs font-bold text-blue-600">View all {openSignals.length}</button>}
          />
          <div className="mt-4 divide-y divide-slate-100">
            {openSignals.slice(0, 4).map((signal) => (
              <button
                onClick={() => onSignal(signal)}
                key={signal.id}
                className="flex w-full items-center gap-4 py-3 text-left transition hover:bg-slate-50"
              >
                <div className={`h-2 w-2 shrink-0 rounded-full ${signal.risk === 'High' || signal.risk === 'Critical' ? 'bg-rose-500' : 'bg-amber-400'}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-slate-800">{signal.title}</div>
                  <div className="mt-1 text-[10px] text-slate-400">{signal.caseId} · {signal.materiality}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-700">{signal.confidence}%</div>
                  <div className="text-[9px] uppercase text-slate-400">confidence</div>
                </div>
                <ChevronRight size={15} className="text-slate-300" />
              </button>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <SectionHeader icon={<BriefcaseBusiness size={16} className="text-blue-600" />} title="Active engagements" />
          <div className="mt-4 space-y-4">
            {engagements.map((e) => (
              <button onClick={() => setScreen('value')} key={e.code} className="flex w-full items-center gap-3 text-left">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold ${e.color}`}>{e.initials}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-slate-800">{e.name}</div>
                  <div className="mt-0.5 text-[10px] text-slate-400">{e.phase}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800">{e.score}</div>
                  <div className="text-[9px] text-slate-400">health</div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <SectionHeader
          icon={<ShieldCheck size={16} className="text-blue-600" />}
          title="Recent governance activity"
          subtitle="Live audit trail — updates as decisions are made"
          right={<button onClick={() => setScreen('governance')} className="text-xs font-bold text-blue-600">View all</button>}
        />
        <div className="mt-4 divide-y divide-slate-100">
          {auditEntries.slice(0, 5).map((entry) => (
            <div key={entry.id + entry.timestamp} className="flex items-center gap-3 py-3">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                entry.decision === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                entry.decision === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                entry.decision === 'Modified' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-500'
              }`}>
                {entry.decision === 'Approved' ? 'A' : entry.decision === 'Rejected' ? 'R' : entry.decision === 'Modified' ? 'M' : 'P'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-slate-800">{entry.suggestion}</div>
                <div className="mt-0.5 text-[10px] text-slate-400">{entry.by} · {entry.engagement} · {entry.timestamp}</div>
              </div>
              <Badge tone={entry.riskTier === 'High' || entry.riskTier === 'Critical' ? 'red' : entry.riskTier === 'Medium' ? 'amber' : 'blue'}>{entry.riskTier}</Badge>
            </div>
          ))}
          {auditEntries.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-400">No decisions recorded yet.</div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {[
          { screen: 'intelligence' as Screen, label: 'Friction intelligence', desc: '12 evidence-backed signals', icon: AlertCircle, color: 'text-rose-500' },
          { screen: 'portfolio' as Screen, label: 'Opportunity portfolio', desc: '5 ranked interventions', icon: Sparkles, color: 'text-blue-500' },
          { screen: 'value' as Screen, label: 'Value & client trust', desc: '8 KPIs with evidence', icon: FileCheck2, color: 'text-emerald-500' },
        ].map((nav) => (
          <button
            key={nav.screen}
            onClick={() => setScreen(nav.screen)}
            className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
          >
            <div className={`rounded-lg bg-slate-50 p-2.5 ${nav.color}`}><nav.icon size={20} /></div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">{nav.label}</div>
              <div className="mt-0.5 text-[10px] text-slate-400">{nav.desc}</div>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 group-hover:text-blue-500" />
          </button>
        ))}
      </div>
    </div>
  );
}
