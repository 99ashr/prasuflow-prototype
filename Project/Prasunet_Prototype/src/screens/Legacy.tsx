import { useState } from 'react';
import { Database, Search, Plus, Users, ChevronRight, FileText, Sparkles, X, Check, AlertCircle } from 'lucide-react';
import { Card, Badge, SectionHeader, AITag, ExpandableNote, Modal, ModalHeader } from '@/components';
import { legacySystems } from '@/data';
import { generateLegacyDoc } from '@/ai';
import { useStore } from '@/store';
import type { LegacySystem } from '@/types';

export function Legacy() {
  const { pushToast } = useStore();
  const [selected, setSelected] = useState<LegacySystem | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [generated, setGenerated] = useState<{ sections: { title: string; content: string }[]; confidence: string; unknowns: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = legacySystems.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.type.toLowerCase().includes(search.toLowerCase()) ||
      s.team.toLowerCase().includes(search.toLowerCase())
  );

  async function handleGenerate() {
    if (!newName.trim()) return;
    setLoading(true);
    const result = await generateLegacyDoc(newName, newType || 'Legacy system', newNotes);
    setGenerated(result);
    setLoading(false);
  }

  if (selected) {
    return (
      <div className="space-y-6 p-8">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-xs font-bold text-blue-600">
          <ChevronRight size={13} className="rotate-180" /> Back to knowledge base
        </button>
        <Card className="p-7">
          <div className="flex items-start justify-between border-b border-slate-100 pb-5">
            <div>
              <Badge tone="green">System reference v{selected.version}</Badge>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">{selected.name}</h2>
              <p className="mt-1 text-xs text-slate-500">{selected.description}</p>
            </div>
            <button onClick={() => {
                if (!selected) return;
                const md = `# ${selected.name}\n\n${selected.description}\n\n## Access & Authentication\n${selected.authMethod}\n\n## Environments\n${selected.environments.join(', ')}\n\n## Endpoints\n${selected.endpoints.map((e) => '- ' + e).join('\n')}\n\n## Known Quirks\n${selected.quirks.map((q) => '- ' + q).join('\n')}\n`;
                const blob = new Blob([md], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${selected.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
                a.click();
                URL.revokeObjectURL(url);
                pushToast('Markdown exported', 'success');
              }} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              <FileText size={14} /> Export markdown
            </button>
          </div>
          <div className="grid grid-cols-[1fr_280px] gap-10 pt-6">
            <article className="space-y-7 text-xs leading-5 text-slate-600">
              <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">1. System Overview</h3>
                <p>{selected.description} System owner: {selected.owner}. Last known update: {selected.lastUpdate}.</p>
              </section>
              <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">2. Access & Authentication</h3>
                <p>Access requires a service request approved by the system owner and security reviewer. Environment access is available for {selected.environments.join(', ')}. Authentication method: {selected.authMethod}.</p>
              </section>
              <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">3. Configuration Guide</h3>
                <div className="rounded-lg bg-slate-50 p-3 font-mono text-[11px] text-slate-600">
                  {selected.endpoints.map((e) => <div key={e}>{e}</div>)}
                  <div className="mt-2 text-slate-400">Network allowlist and client certificate required.</div>
                </div>
              </section>
              <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">4. Setup & Integration Steps</h3>
                <ol className="list-decimal space-y-1 pl-5">
                  <li>Request non-production access from {selected.owner}.</li>
                  <li>Configure the environment variables listed above.</li>
                  <li>Validate connectivity using the health check integration point.</li>
                  <li>Complete security review before production promotion.</li>
                </ol>
              </section>
              <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">5. Known quirks / gotchas</h3>
                <div className="space-y-2">
                  {selected.quirks.map((q, i) => (
                    <p key={i} className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-amber-800">{q}</p>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">6. Security & Policy Protocols</h3>
                <p>Data classification: {selected.dataClassification}. Audit logs are required for all production calls.</p>
              </section>
            </article>
            <aside className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Document metadata</div>
                <div className="mt-3 space-y-3 text-xs">
                  <div><div className="text-slate-400">Confidence</div><div className="font-semibold text-slate-700">{selected.confidence}</div></div>
                  <div><div className="text-slate-400">Source material</div><div className="font-semibold text-slate-700">{selected.sourceMaterials.join(', ')}</div></div>
                  <div><div className="text-slate-400">Generated</div><div className="font-semibold text-slate-700">{selected.generatedDate}</div></div>
                  <div><div className="text-slate-400">Criticality</div><div className="font-semibold text-slate-700">{selected.criticality}</div></div>
                </div>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-800"><Sparkles size={14} /> Agent traceability</div>
                <p className="mt-2 text-[11px] leading-5 text-blue-700">Unknowns are explicitly flagged instead of invented. Update this document with new notes to create a new version.</p>
                <button onClick={() => { setSelected(null); setShowForm(true); setNewName(selected.name); setNewType(selected.type); setNewNotes(''); }} className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-bold text-white">Regenerate with new notes</button>
              </div>
              <ExpandableNote>
                <div className="space-y-1">
                  <div><b>Layer 1 — Ingestion:</b> {selected.sourceMaterials.join(', ')}</div>
                  <div><b>Layer 4 — Retrieval:</b> Source records retrieved and chunked.</div>
                  <div><b>Layer 5 — LLM:</b> Structured document drafted. Unknowns explicitly flagged.</div>
                  <div><b>Layer 7 — Governance:</b> Confidence = {selected.confidence}. Human verification required for production use.</div>
                </div>
              </ExpandableNote>
            </aside>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-400">
          <Search size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 outline-none"
            placeholder="Search systems, teams, protocols..."
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-[#0b1e3d] px-4 py-2.5 text-xs font-bold text-white"
        >
          <Plus size={14} /> Document legacy system
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((system) => (
          <button
            onClick={() => setSelected(system)}
            key={system.name}
            className="group rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-slate-100 p-2 text-slate-600"><Database size={18} /></div>
              <Badge tone={system.criticality === 'Critical' ? 'red' : system.criticality === 'High' ? 'amber' : 'blue'}>{system.criticality}</Badge>
            </div>
            <h3 className="mt-5 text-sm font-semibold text-slate-900 group-hover:text-blue-700">{system.name}</h3>
            <div className="mt-1 text-[10px] text-slate-400">{system.type}</div>
            <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-3 text-[10px] text-slate-500">
              <Users size={12} /> {system.team}
              <ChevronRight size={13} className="ml-auto text-slate-300" />
            </div>
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-400">No systems match your search.</div>
      )}

      {showForm && (
        <Modal onClose={() => { setShowForm(false); setGenerated(null); }} maxWidth="max-w-2xl">
          <ModalHeader title="Document a legacy system" subtitle="The AI will generate a developer-ready reference from your notes" onClose={() => { setShowForm(false); setGenerated(null); }} />
          <div className="space-y-4 p-6">
            <div className="grid grid-cols-2 gap-4">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                System name
                <input value={newName} onChange={(e) => setNewName(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 outline-none focus:border-blue-400" placeholder="e.g. Phoenix CRM" />
              </label>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                System type
                <input value={newType} onChange={(e) => setNewType(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 outline-none focus:border-blue-400" placeholder="e.g. On-prem CRM" />
              </label>
            </div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Raw notes / documentation fragments
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="mt-2 h-40 w-full resize-none rounded-lg border border-slate-200 p-3 text-xs leading-5 text-slate-600 outline-none focus:border-blue-400"
                placeholder="Paste any notes, README excerpts, config snippets, or tribal knowledge..."
              />
            </label>
            <button
              onClick={handleGenerate}
              disabled={loading || !newName.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b1e3d] py-3 text-xs font-bold text-white disabled:opacity-50"
            >
              <Sparkles size={14} /> {loading ? 'Generating documentation...' : 'Generate system reference'}
            </button>
            {generated && (
              <div className="space-y-3 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                <div className="flex items-center gap-2"><AITag approved={false} /><Badge tone="amber">{generated.confidence}</Badge></div>
                {generated.unknowns.length > 0 && (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 p-2 text-[11px] text-amber-700">
                    <AlertCircle size={13} className="mt-0.5 shrink-0" /> {generated.unknowns.join(' ')}
                  </div>
                )}
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {generated.sections.map((s) => (
                    <div key={s.title}>
                      <div className="text-[10px] font-bold text-slate-700">{s.title}</div>
                      <p className="mt-1 text-[11px] leading-5 text-slate-600">{s.content}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setShowForm(false); setGenerated(null); setNewName(''); setNewType(''); setNewNotes(''); pushToast('System reference saved to knowledge base', 'success'); }} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-xs font-bold text-white">
                  <Check size={13} /> Save to knowledge base
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
