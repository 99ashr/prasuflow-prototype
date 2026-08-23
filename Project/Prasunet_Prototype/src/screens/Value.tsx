import { useState } from 'react';
import { Goal, Mail, Layers3, ChevronRight, FileText, CheckCircle2, Send, ShieldCheck, Download } from 'lucide-react';
import { Card, Badge, SectionHeader, AITag, ExpandableNote, Modal, ModalHeader } from '@/components';
import { kpis } from '@/data';
import { callAI } from '@/ai';
import { useStore } from '@/store';
import type { KPI, Screen } from '@/types';

export function Value({ setScreen }: { setScreen: (s: Screen) => void }) {
  const { addDraft, pushToast } = useStore();
  const [digest, setDigest] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<KPI | null>(null);

  async function generateDigest() {
    setLoading(true);
    const result = await callAI('Generate a weekly client trust digest for Northstar Retail summarizing delivery health, resolved evidence cards, and client-facing risk.');
    setDigest(result);
    setLoading(false);
  }

  function exportDigest() {
    const content = digest || 'Delivery health improved from 78 to 82 this week. Two evidence cards were resolved, while one scope-adjacent request remains under assessment. Requirement clarity is now at 79%, moving toward the 85% target.';
    const fullText = `Subject: Week 32 delivery update · Northstar Retail\n\n${content}`;
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client-trust-digest-w32.txt`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast('Digest exported as text file', 'success');
  }

  function saveToDrafts() {
    const content = digest || 'Delivery health improved from 78 to 82 this week. Two evidence cards were resolved, while one scope-adjacent request remains under assessment. Requirement clarity is now at 79%, moving toward the 85% target.';
    addDraft({
      subject: 'Week 32 delivery update · Northstar Retail',
      body: content,
      engagement: 'Northstar Retail',
      meetingDate: 'Week 32',
    });
    setScreen('meeting');
  }

  return (
    <div className="space-y-6 p-8">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-[#0b1e3d] p-5 text-white">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Client value confidence</div>
          <div className="mt-4 flex items-end justify-between">
            <div className="text-4xl font-semibold">76<span className="text-lg text-slate-400">%</span></div>
            <div className="text-right text-[10px] text-emerald-300">+18 pts<br /><span className="text-slate-400">since baseline</span></div>
          </div>
          <div className="mt-5 h-1.5 rounded-full bg-white/10"><div className="h-full w-[76%] rounded-full bg-[#4fb1ff]" /></div>
        </div>
        <Card className="p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Validated outcomes</div>
          <div className="mt-4 text-4xl font-semibold text-slate-900">03</div>
          <div className="mt-2 text-xs text-slate-500">KPIs with client evidence attached</div>
        </Card>
        <Card className="p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Digest status</div>
          <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 size={18} /> Ready for review</div>
          <div className="mt-2 text-xs text-slate-500">Week 32 · drafted 18 min ago</div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <SectionHeader
            icon={<Goal size={16} className="text-emerald-600" />}
            title="KPI evidence ledger"
            subtitle="Baseline → target → observed, never asserted value"
          />
          <button onClick={exportDigest} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            <Download size={14} /> Export digest
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[9px] font-bold uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-5 py-3">KPI</th><th>Baseline</th><th>Target</th><th>Observed</th><th>Status</th><th>Movement</th><th>Formula</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kpis.map((kpi) => (
                <tr key={kpi.name} className="group cursor-pointer text-xs hover:bg-blue-50/50" onClick={() => setSelectedKpi(kpi)}>
                  <td className="px-5 py-4 font-semibold text-slate-800">{kpi.name}</td>
                  <td className="text-slate-500">{kpi.baseline}</td>
                  <td className="font-semibold text-slate-700">{kpi.target}</td>
                  <td className="font-semibold text-slate-900">{kpi.observed}</td>
                  <td>
                    <Badge tone={
                      kpi.status === 'Client-validated' || kpi.status === 'Finance-validated' ? 'green' :
                      kpi.status === 'Observed' ? 'blue' :
                      kpi.status === 'Modeled' ? 'amber' :
                      kpi.status === 'Directional' ? 'slate' : 'red'
                    }>{kpi.status}</Badge>
                  </td>
                  <td className="font-semibold text-emerald-600">{kpi.movement}</td>
                  <td className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100">{kpi.formula}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-[1.3fr_1fr] gap-5">
        <Card className="p-5">
          <SectionHeader
            icon={<Mail size={16} className="text-blue-600" />}
            title="Weekly Client Trust Digest"
            right={<AITag approved={false} />}
          />
          {digest ? (
            <div className="mt-4 rounded-lg border border-slate-200 p-4">
              <div className="text-xs font-semibold text-slate-800">Subject: Week 32 delivery update · Northstar Retail</div>
              <p className="mt-3 text-xs leading-5 text-slate-600">{digest}</p>
              <div className="mt-4 flex items-center gap-2">
                <Badge tone="green">3 outcomes observed</Badge>
                <Badge tone="amber">1 risk to discuss</Badge>
              </div>
              <button onClick={saveToDrafts} className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600">
                <Send size={13} /> Save to Email Draft <ChevronRight size={14} />
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="text-xs font-semibold text-slate-800">Subject: Week 32 delivery update · Northstar Retail</div>
                <p className="mt-3 text-xs leading-5 text-slate-600">
                  Delivery health improved from 78 to 82 this week. Two evidence cards were resolved, while one scope-adjacent request remains under assessment. Requirement clarity is now at 79%, moving toward the 85% target.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Badge tone="green">3 outcomes observed</Badge>
                  <Badge tone="amber">1 risk to discuss</Badge>
                </div>
              </div>
              <button
                onClick={generateDigest}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 py-2.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
              >
                {loading ? 'Generating digest...' : 'Regenerate with AI'}
              </button>
            </div>
          )}
          <button onClick={() => setScreen('meeting')} className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600">
            Open in draft folder <ChevronRight size={14} />
          </button>
        </Card>

        <Card className="p-5">
          <SectionHeader icon={<Layers3 size={16} className="text-amber-500" />} title="Proof architecture" />
          <div className="mt-4 space-y-3 text-xs">
            {[
              ['Facts', 'Analytics', 'blue'],
              ['Evidence', 'Retrieval', 'green'],
              ['Explanation', 'AI draft', 'amber'],
              ['Decision', 'Named human', 'red'],
            ].map(([a, b, tone]) => (
              <div key={a} className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${tone === 'blue' ? 'bg-blue-500' : tone === 'green' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                <span className="w-20 font-semibold text-slate-700">{a}</span>
                <ChevronRight size={13} className="text-slate-300" />
                <span className="text-slate-500">{b}</span>
              </div>
            ))}
          </div>
          <ExpandableNote>
            <div>Every number on this dashboard traces back through this chain. Facts are computed from data (never from the LLM). Evidence is retrieved from source records. Explanations are AI-drafted from that evidence. Decisions are made by a named human.</div>
          </ExpandableNote>
        </Card>
      </div>

      {selectedKpi && (
        <Modal onClose={() => setSelectedKpi(null)} maxWidth="max-w-lg">
          <ModalHeader title={selectedKpi.name} subtitle="KPI evidence detail" onClose={() => setSelectedKpi(null)} />
          <div className="space-y-4 p-6">
            <div className="grid grid-cols-4 gap-3">
              {[
                ['Baseline', selectedKpi.baseline],
                ['Target', selectedKpi.target],
                ['Observed', selectedKpi.observed],
                ['Movement', selectedKpi.movement],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-3">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">Status</div>
              <Badge tone={
                selectedKpi.status === 'Client-validated' || selectedKpi.status === 'Finance-validated' ? 'green' :
                selectedKpi.status === 'Observed' ? 'blue' :
                selectedKpi.status === 'Modeled' ? 'amber' :
                selectedKpi.status === 'Directional' ? 'slate' : 'red'
              }>{selectedKpi.status}</Badge>
            </div>
            <div>
              <div className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">Formula</div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] text-slate-600">{selectedKpi.formula}</div>
            </div>
            <div>
              <div className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">Direction</div>
              <div className="text-xs text-slate-600">{selectedKpi.better}</div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
