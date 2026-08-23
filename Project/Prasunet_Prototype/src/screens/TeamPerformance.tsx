import { useState } from 'react';
import { Users, TrendingUp, TrendingDown, Award, Clock, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { Card, Badge, SectionHeader, ScoreRing, Sparkline } from '@/components';
import { useStore } from '@/store';
import type { Screen } from '@/types';

type TeamMember = {
  name: string;
  role: string;
  initials: string;
  color: string;
  engagement: string;
  signalsResolved: number;
  signalsOpen: number;
  avgApprovalTime: string;
  onTimeRate: number;
  trend: number[];
};

const teamMembers: TeamMember[] = [
  { name: 'Priya Menon', role: 'Project Manager', initials: 'PM', color: 'bg-blue-100 text-blue-700', engagement: 'Northstar Retail', signalsResolved: 8, signalsOpen: 3, avgApprovalTime: '1.2 days', onTimeRate: 92, trend: [65, 70, 68, 74, 80, 85, 92] },
  { name: 'Ravi Kapoor', role: 'Business Analyst', initials: 'RK', color: 'bg-emerald-100 text-emerald-700', engagement: 'Meridian Health', signalsResolved: 6, signalsOpen: 2, avgApprovalTime: '0.8 days', onTimeRate: 88, trend: [60, 64, 70, 72, 78, 82, 88] },
  { name: 'Sarah Iyer', role: 'QA Lead', initials: 'SI', color: 'bg-amber-100 text-amber-700', engagement: 'Meridian Health', signalsResolved: 5, signalsOpen: 1, avgApprovalTime: '1.5 days', onTimeRate: 85, trend: [70, 72, 75, 73, 80, 83, 85] },
  { name: 'Aarav Shah', role: 'Client Sponsor', initials: 'AS', color: 'bg-rose-100 text-rose-700', engagement: 'Atlas Finance', signalsResolved: 4, signalsOpen: 2, avgApprovalTime: '2.1 days', onTimeRate: 78, trend: [72, 74, 70, 75, 76, 77, 78] },
  { name: 'Vikram Rao', role: 'Governance Authority', initials: 'VR', color: 'bg-slate-200 text-slate-700', engagement: 'Atlas Finance', signalsResolved: 3, signalsOpen: 1, avgApprovalTime: '1.8 days', onTimeRate: 90, trend: [82, 84, 86, 85, 88, 89, 90] },
];

export function TeamPerformance({ setScreen }: { setScreen: (s: Screen) => void }) {
  const { auditEntries, signals } = useStore();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const totalResolved = teamMembers.reduce((a, m) => a + m.signalsResolved, 0);
  const totalOpen = teamMembers.reduce((a, m) => a + m.signalsOpen, 0);
  const avgOnTime = Math.round(teamMembers.reduce((a, m) => a + m.onTimeRate, 0) / teamMembers.length);
  const topPerformer = [...teamMembers].sort((a, b) => b.onTimeRate - a.onTimeRate)[0];

  const memberAuditEntries = selectedMember
    ? auditEntries.filter((e) => e.by.includes(selectedMember.name.split(' ')[0]))
    : [];

  const memberSignals = selectedMember
    ? signals.filter((s) => s.caseId.includes(selectedMember.engagement.split(' ')[0]))
    : [];

  if (selectedMember) {
    return (
      <div className="space-y-6 p-8">
        <button onClick={() => setSelectedMember(null)} className="flex items-center gap-2 text-xs font-bold text-blue-600">
          <ChevronRight size={13} className="rotate-180" /> Back to team overview
        </button>

        <Card className="p-7">
          <div className="flex items-start justify-between border-b border-slate-100 pb-5">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold ${selectedMember.color}`}>
                {selectedMember.initials}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{selectedMember.name}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">{selectedMember.role}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-400">{selectedMember.engagement}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ScoreRing score={selectedMember.onTimeRate} />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">On-time rate</div>
                <div className="text-sm font-semibold text-emerald-700">{selectedMember.onTimeRate}%</div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Signals resolved</div>
              <div className="mt-2 text-2xl font-semibold text-emerald-600">{selectedMember.signalsResolved}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Signals open</div>
              <div className="mt-2 text-2xl font-semibold text-amber-600">{selectedMember.signalsOpen}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Avg approval time</div>
              <div className="mt-2 text-2xl font-semibold text-slate-800">{selectedMember.avgApprovalTime}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">On-time rate</div>
              <div className="mt-2 text-2xl font-semibold text-blue-600">{selectedMember.onTimeRate}%</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Performance trend (7 weeks)</div>
            <div className="h-32"><Sparkline color="#1685d8" height={120} /></div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-5">
          <Card className="p-5">
            <SectionHeader icon={<CheckCircle2 size={16} className="text-emerald-600" />} title="Recent decisions" subtitle="Audit trail for this team member" />
            <div className="mt-4 divide-y divide-slate-100">
              {memberAuditEntries.length > 0 ? memberAuditEntries.map((entry) => (
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
                    <div className="mt-0.5 text-[10px] text-slate-400">{entry.engagement} · {entry.timestamp}</div>
                  </div>
                  <Badge tone={entry.riskTier === 'High' || entry.riskTier === 'Critical' ? 'red' : entry.riskTier === 'Medium' ? 'amber' : 'blue'}>{entry.riskTier}</Badge>
                </div>
              )) : (
                <div className="py-6 text-center text-xs text-slate-400">No decisions recorded yet for this team member.</div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeader icon={<AlertCircle size={16} className="text-amber-500" />} title="Open signals on their engagement" subtitle="Signals needing attention" />
            <div className="mt-4 divide-y divide-slate-100">
              {memberSignals.filter((s) => !s.approved).slice(0, 5).map((signal) => (
                <div key={signal.id} className="flex items-center gap-3 py-3">
                  <div className={`h-2 w-2 shrink-0 rounded-full ${signal.risk === 'High' || signal.risk === 'Critical' ? 'bg-rose-500' : 'bg-amber-400'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-slate-800">{signal.title}</div>
                    <div className="mt-0.5 text-[10px] text-slate-400">{signal.caseId}</div>
                  </div>
                  <Badge tone={signal.risk === 'High' || signal.risk === 'Critical' ? 'red' : 'amber'}>{signal.risk}</Badge>
                </div>
              ))}
              {memberSignals.filter((s) => !s.approved).length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">No open signals on this engagement.</div>
              )}
            </div>
            <button onClick={() => setScreen('intelligence')} className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600">
              View all signals <ChevronRight size={13} />
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Team size</div>
              <div className="mt-3 text-3xl font-semibold text-slate-900">{teamMembers.length}</div>
              <div className="mt-2 text-[11px] text-slate-500">Across {new Set(teamMembers.map((m) => m.engagement)).size} engagements</div>
            </div>
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Users size={18} /></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Signals resolved</div>
              <div className="mt-3 text-3xl font-semibold text-emerald-600">{totalResolved}</div>
              <div className="mt-2 text-[11px] text-slate-500">By the full team</div>
            </div>
            <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600"><CheckCircle2 size={18} /></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Signals open</div>
              <div className="mt-3 text-3xl font-semibold text-amber-600">{totalOpen}</div>
              <div className="mt-2 text-[11px] text-slate-500">Awaiting decisions</div>
            </div>
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600"><AlertCircle size={18} /></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Avg on-time rate</div>
              <div className="mt-3 text-3xl font-semibold text-blue-600">{avgOnTime}%</div>
              <div className="mt-2 text-[11px] text-slate-500">Across all roles</div>
            </div>
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Clock size={18} /></div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <SectionHeader
          icon={<Award size={16} className="text-amber-500" />}
          title="Top performer this week"
          subtitle="Highest on-time decision rate"
          right={<Badge tone="green">{topPerformer.onTimeRate}%</Badge>}
        />
        <div className="mt-4 flex items-center gap-4 rounded-xl border border-amber-100 bg-amber-50/50 p-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold ${topPerformer.color}`}>
            {topPerformer.initials}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-900">{topPerformer.name}</div>
            <div className="text-xs text-slate-500">{topPerformer.role} · {topPerformer.engagement}</div>
          </div>
          <div className="flex items-center gap-2 text-emerald-600">
            <TrendingUp size={16} />
            <span className="text-xs font-bold">+{topPerformer.trend[topPerformer.trend.length - 1] - topPerformer.trend[0]} pts</span>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <SectionHeader icon={<Users size={16} className="text-blue-600" />} title="Team members" subtitle="Click any member to see their performance detail" />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              <tr>
                <th className="pb-2">Member</th><th>Role</th><th>Engagement</th><th>Resolved</th><th>Open</th><th>Avg approval</th><th>On-time</th><th>Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamMembers.map((m) => (
                <tr key={m.name} className="cursor-pointer transition hover:bg-slate-50" onClick={() => setSelectedMember(m)}>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold ${m.color}`}>{m.initials}</div>
                      <span className="font-semibold text-slate-800">{m.name}</span>
                    </div>
                  </td>
                  <td className="text-slate-500">{m.role}</td>
                  <td className="text-slate-500">{m.engagement}</td>
                  <td className="font-semibold text-emerald-600">{m.signalsResolved}</td>
                  <td className="font-semibold text-amber-600">{m.signalsOpen}</td>
                  <td className="text-slate-600">{m.avgApprovalTime}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${m.onTimeRate >= 85 ? 'bg-emerald-500' : m.onTimeRate >= 75 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${m.onTimeRate}%` }} />
                      </div>
                      <span className="font-bold text-slate-700">{m.onTimeRate}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {m.trend[m.trend.length - 1] >= m.trend[0] ? (
                        <TrendingUp size={13} className="text-emerald-500" />
                      ) : (
                        <TrendingDown size={13} className="text-rose-500" />
                      )}
                      <span className={`text-[10px] font-semibold ${m.trend[m.trend.length - 1] >= m.trend[0] ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {m.trend[m.trend.length - 1] - m.trend[0] > 0 ? '+' : ''}{m.trend[m.trend.length - 1] - m.trend[0]}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <button onClick={() => setScreen('governance')} className="flex items-center gap-2 text-xs font-bold text-blue-600">
        View full audit log <ChevronRight size={14} />
      </button>
    </div>
  );
}
