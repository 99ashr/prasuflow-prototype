import { useState } from 'react';
import { BrainCircuit, ChevronRight, FileText, Settings2, Zap, LockKeyhole, Users, X, Check, FileCheck2, Database } from 'lucide-react';
import { Card, Badge, AITag, ExpandableNote, Modal, ModalHeader } from '@/components';
import { useStore } from '@/store';
import type { Screen, Signal } from '@/types';

const FILTERS = ['All signals', 'Scope drift', 'Requirement quality', 'Late change', 'Rework', 'SLA breach'];

export function Intelligence({
  onSignal,
  onNavigate,
}: {
  onSignal: (s: Signal) => void;
  onNavigate: (s: Screen) => void;
}) {
  const { signals } = useStore();
  const [filter, setFilter] = useState('All signals');
  const [riskFilter, setRiskFilter] = useState<'All' | 'Low' | 'Medium' | 'High' | 'Critical'>('All');
  const [search, setSearch] = useState('');

  let filtered = filter === 'All signals' ? signals : signals.filter((s) => s.type === filter);
  if (riskFilter !== 'All') filtered = filtered.filter((s) => s.risk === riskFilter);
  if (search) filtered = filtered.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.caseId.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  const openCount = signals.filter((s) => !s.approved).length;
  const highCount = signals.filter((s) => s.risk === 'High' || s.risk === 'Critical').length;
  const approvedCount = signals.filter((s) => s.approved).length;
  const rejectedCount = signals.filter((s) => s.approvedBy && !s.approved).length;
  const pendingCount = signals.filter((s) => !s.approvedBy).length;

  return (
    <div className="space-y-6 p-8">
      <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-white p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-blue-600 p-2.5 text-white"><BrainCircuit size={20} /></div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Evidence-backed friction detection</h2>
              <Badge tone="blue">Layer 2 · deterministic analytics</Badge>
            </div>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-600">
              PrasuFlow identifies delivery friction from event logs, requirements, change requests, UAT defects, and meeting notes. Numbers come from analytics; explanations are drafted from retrieved evidence.
            </p>
          </div>
          <div className="flex gap-5 text-right">
            <div><div className="text-xl font-semibold text-slate-900">{openCount}</div><div className="text-[9px] uppercase tracking-wider text-slate-400">open signals</div></div>
            <div><div className="text-xl font-semibold text-rose-600">{highCount}</div><div className="text-[9px] uppercase tracking-wider text-slate-400">high risk</div></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Approved</div>
          <div className="mt-1 text-lg font-semibold text-emerald-600">{approvedCount}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Rejected</div>
          <div className="mt-1 text-lg font-semibold text-rose-500">{rejectedCount}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Pending</div>
          <div className="mt-1 text-lg font-semibold text-amber-500">{pendingCount}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total</div>
          <div className="mt-1 text-lg font-semibold text-slate-800">{signals.length}</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              onClick={() => setFilter(item)}
              key={item}
              className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                filter === item ? 'bg-[#0b1e3d] text-white' : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
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
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search signals..."
            className="w-48 rounded-lg border border-slate-200 px-3 py-2 text-[11px] outline-none focus:border-blue-400"
          />
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> 7 rules active <Settings2 size={13} />
          </span>
        </div>
      </div>

      <div className="text-xs text-slate-400">{filtered.length} signal{filtered.length !== 1 ? 's' : ''} matching filters</div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map((signal) => (
          <button
            onClick={() => onSignal(signal)}
            key={signal.id}
            className="group rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Badge tone={signal.risk === 'High' || signal.risk === 'Critical' ? 'red' : signal.risk === 'Medium' ? 'amber' : 'blue'}>
                  {signal.risk} risk
                </Badge>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{signal.type}</span>
              </div>
              <div className="flex items-center gap-2">
                {signal.approved && <Badge tone="green"><Check size={10} /> Approved</Badge>}
                <span className="text-[10px] font-semibold text-slate-400">{signal.id}</span>
              </div>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-900 group-hover:text-blue-700">{signal.title}</h3>
            <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold text-blue-700"><FileText size={12} />{signal.caseId}</div>
            <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{signal.evidence}</p>
            <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
              <div><div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Materiality</div><div className="mt-1 text-xs font-semibold text-slate-800">{signal.materiality}</div></div>
              <div className="text-right"><div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Confidence</div><div className="mt-1 text-sm font-semibold text-blue-700">{signal.confidence}%</div></div>
              <ChevronRight size={16} className="mb-1 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500" />
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-400">
          No signals match your current filters.
        </div>
      )}
    </div>
  );
}

export function EvidenceModal({ signal, close, onNavigate }: { signal: Signal; close: () => void; onNavigate: (s: Screen) => void }) {
  const { decideSignal, role } = useStore();
  const [decision, setDecision] = useState<'none' | 'approved' | 'rejected' | 'modified'>(
    signal.approved ? 'approved' : 'none'
  );

  function handleApprove() {
    decideSignal(signal.id, 'Approved', role);
    setDecision('approved');
  }
  function handleReject() {
    decideSignal(signal.id, 'Rejected', role);
    setDecision('rejected');
  }
  function handleModify() {
    decideSignal(signal.id, 'Modified', role);
    setDecision('modified');
  }

  return (
    <Modal onClose={close} maxWidth="max-w-2xl">
      <ModalHeader title={signal.title} subtitle={signal.caseId} onClose={close} />
      <div className="space-y-5 p-6">
        <div className="grid grid-cols-4 gap-3">
          {[
            ['Classification', signal.type],
            ['Confidence', `${signal.confidence}%`],
            ['Materiality', signal.materiality],
            ['Risk tier', signal.risk],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-slate-50 p-3">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
              <div className="mt-1 text-xs font-semibold text-slate-800">{value}</div>
            </div>
          ))}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-800"><FileCheck2 size={14} className="text-blue-600" /> Linked evidence</div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-xs leading-5 text-slate-600">
            {signal.evidence}
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400"><Database size={12} />{signal.source}</div>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-800"><Zap size={14} className="text-amber-500" /> Recommended action</div>
          <p className="rounded-lg border-l-2 border-blue-500 bg-blue-50/50 p-3 text-xs leading-5 text-slate-700">{signal.action}</p>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50/50 p-4">
          <div className="flex items-center gap-3">
            <LockKeyhole size={17} className="text-rose-500" />
            <div>
              <div className="text-xs font-bold text-slate-800">Human sign-off required</div>
              <div className="mt-0.5 text-[10px] text-slate-500">AI cannot act alone on candidate scope or material delivery impact.</div>
            </div>
          </div>
          <Badge tone="red">Non-negotiable</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Required approver</div>
            <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-800">
              <Users size={14} className="text-slate-400" />
              {signal.risk === 'High' ? 'Client sponsor + PM + finance' : signal.risk === 'Critical' ? 'Named governance authority' : 'PM + product owner'}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Automation allowed?</div>
            <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-rose-600"><X size={14} /> No — draft only</div>
          </div>
        </div>

        <div>
          <div className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">Client-safe status line</div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
            "Change under assessment; delivery impact will be confirmed by 14 Aug 2025."
          </div>
        </div>

        <ExpandableNote>
          <div className="space-y-1">
            <div><b>Layer 1 — Ingestion:</b> {signal.source}</div>
            <div><b>Layer 2 — Analytics:</b> Rule "{signal.type}" matched against normalized event schema.</div>
            <div><b>Layer 4 — Retrieval:</b> Evidence retrieved from linked source record.</div>
            <div><b>Layer 5 — LLM explanation:</b> Plain-English summary drafted from retrieved evidence. No numbers invented.</div>
            <div><b>Layer 7 — Governance:</b> Risk tier = {signal.risk}. Human sign-off enforced.</div>
          </div>
        </ExpandableNote>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 p-5">
        <div className="flex items-center gap-2">
          <AITag approved={decision === 'approved'} approver={role} />
          <button onClick={() => onNavigate('governance')} className="text-[10px] text-blue-600 hover:underline">View in audit log</button>
        </div>
        {decision === 'approved' ? (
          <Badge tone="green"><Check size={12} /> Approved by {role}</Badge>
        ) : decision === 'rejected' ? (
          <Badge tone="red"><X size={12} /> Rejected by {role}</Badge>
        ) : decision === 'modified' ? (
          <Badge tone="amber">Modified by {role} — needs re-review</Badge>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleReject} className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50">Reject</button>
            <button onClick={handleModify} className="rounded-lg border border-amber-200 bg-white px-4 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50">Modify</button>
            <button onClick={handleApprove} className="rounded-lg bg-[#0b1e3d] px-4 py-2 text-xs font-bold text-white">Approve draft</button>
          </div>
        )}
      </div>
    </Modal>
  );
}
