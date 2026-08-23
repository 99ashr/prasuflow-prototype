import { useState } from 'react';
import { ShieldCheck, Download, Search, Filter } from 'lucide-react';
import { Card, Badge, SectionHeader } from '@/components';
import { engagements } from '@/data';
import { useStore } from '@/store';
import type { Risk } from '@/types';

export function Governance() {
  const { auditEntries, pushToast } = useStore();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | Risk>('All');
  const [decisionFilter, setDecisionFilter] = useState<'All' | 'Approved' | 'Rejected' | 'Modified' | 'Pending'>('All');

  let filtered = auditEntries;
  if (search) filtered = filtered.filter((e) =>
    e.suggestion.toLowerCase().includes(search.toLowerCase()) ||
    e.by.toLowerCase().includes(search.toLowerCase()) ||
    e.engagement.toLowerCase().includes(search.toLowerCase())
  );
  if (riskFilter !== 'All') filtered = filtered.filter((e) => e.riskTier === riskFilter);
  if (decisionFilter !== 'All') filtered = filtered.filter((e) => e.decision === decisionFilter);

  const approved = auditEntries.filter((e) => e.decision === 'Approved').length;
  const rejected = auditEntries.filter((e) => e.decision === 'Rejected').length;
  const modified = auditEntries.filter((e) => e.decision === 'Modified').length;

  function exportLog() {
    const headers = ['ID', 'Suggestion', 'Risk Tier', 'Decision', 'By', 'Engagement', 'Timestamp'];
    const rows = filtered.map((e) => [e.id, e.suggestion, e.riskTier, e.decision, e.by, e.engagement, e.timestamp]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `governance-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast('Audit log exported as CSV', 'success');
  }

  return (
    <div className="space-y-6 p-8">
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AI suggestions</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">{auditEntries.length}</div>
          <div className="mt-2 text-[11px] text-slate-500">Across {engagements.length} engagements</div>
        </Card>
        <Card className="p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Human-approved</div>
          <div className="mt-3 text-3xl font-semibold text-emerald-600">{approved}</div>
          <div className="mt-2 text-[11px] text-slate-500">{auditEntries.length > 0 ? Math.round((approved / auditEntries.length) * 100) : 0}% approval rate</div>
        </Card>
        <Card className="p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Modified</div>
          <div className="mt-3 text-3xl font-semibold text-amber-600">{modified}</div>
          <div className="mt-2 text-[11px] text-slate-500">Human changed AI draft</div>
        </Card>
        <Card className="p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Audit coverage</div>
          <div className="mt-3 text-3xl font-semibold text-blue-600">100%</div>
          <div className="mt-2 text-[11px] text-slate-500">Every action has a decision trail</div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <SectionHeader
            icon={<ShieldCheck size={16} className="text-emerald-600" />}
            title="Decision ledger"
            subtitle="A simple, credible record of how AI stays governed"
          />
          <button onClick={exportLog} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            <Download size={14} /> Export log
          </button>
        </div>

        <div className="flex items-center gap-3 border-b border-slate-100 p-4">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-400">
            <Search size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search suggestions, people, engagements..."
              className="w-56 bg-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as typeof riskFilter)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-500 outline-none"
            >
              <option value="All">All risks</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value as typeof decisionFilter)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-500 outline-none"
            >
              <option value="All">All decisions</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Modified">Modified</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[9px] font-bold uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-5 py-3">ID</th><th>Suggestion</th><th>Risk tier</th><th>Decision</th><th>By</th><th>Engagement</th><th>Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((row) => (
              <tr className="text-xs hover:bg-slate-50" key={row.id + row.timestamp}>
                <td className="px-5 py-4 text-[10px] font-semibold text-slate-400">{row.id}</td>
                <td className="font-semibold text-slate-800">{row.suggestion}</td>
                <td><Badge tone={row.riskTier === 'High' || row.riskTier === 'Critical' ? 'red' : row.riskTier === 'Medium' ? 'amber' : 'blue'}>{row.riskTier}</Badge></td>
                <td>
                  <span className={`font-semibold ${row.decision === 'Approved' ? 'text-emerald-600' : row.decision === 'Modified' ? 'text-amber-600' : row.decision === 'Rejected' ? 'text-rose-500' : 'text-slate-400'}`}>
                    {row.decision}
                  </span>
                </td>
                <td className="text-slate-600">{row.by}</td>
                <td className="text-slate-500">{row.engagement}</td>
                <td className="text-slate-400">{row.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-sm text-slate-400">No audit entries match your filters.</div>
        )}
      </Card>

      <Card className="p-5">
        <SectionHeader icon={<ShieldCheck size={16} className="text-emerald-600" />} title="Risk tier enforcement" subtitle="Hardcoded governance rules — not tunable thresholds" />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              <tr><th className="pb-2">Risk tier</th><th>Trigger</th><th>Who approves</th><th>AI acts alone?</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['Low', 'Wording clarification on AC', 'BA or product owner', 'No — draft only', 'blue'],
                ['Medium', 'Effort or workload changes', 'PM + product owner', 'No', 'amber'],
                ['High', 'New feature, material schedule/pricing impact', 'Client sponsor + PM + finance', 'Never', 'red'],
                ['Critical', 'Security, privacy, regulatory, production-release', 'Named governance authority', 'Never', 'red'],
              ].map(([tier, trigger, approver, alone, tone]) => (
                <tr key={tier}>
                  <td className="py-3"><Badge tone={tone as 'blue' | 'amber' | 'red'}>{tier}</Badge></td>
                  <td className="text-slate-600">{trigger}</td>
                  <td className="text-slate-600">{approver}</td>
                  <td className="font-semibold text-rose-600">{alone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
