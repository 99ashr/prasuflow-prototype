import { useState } from 'react';
import { ClipboardCheck, Sparkles, Check, AlertCircle, ChevronRight, ShieldCheck } from 'lucide-react';
import { Card, Badge, SectionHeader, AITag, ExpandableNote } from '@/components';
import { generateReadinessChecklist } from '@/ai';

export function Readiness() {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<{ sections: { title: string; items: string[] }[]; unknowns: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  async function generate() {
    if (!description.trim()) return;
    setLoading(true);
    setChecked(new Set());
    const result = await generateReadinessChecklist(description);
    setResult(result);
    setLoading(false);
  }

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const totalItems = result?.sections.reduce((acc, s) => acc + s.items.length, 0) ?? 0;
  const checkedCount = checked.size;
  const readiness = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  return (
    <div className="space-y-6 p-8">
      <Card className="p-6">
        <SectionHeader
          icon={<ClipboardCheck size={16} className="text-blue-600" />}
          title="System Upgrade Readiness Checklist"
          subtitle="Generate a pre-upgrade checklist from a description of the change"
          right={<Badge tone="blue">Layer 5 · AI-drafted</Badge>}
        />
        <div className="mt-6 space-y-4">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Describe the upgrade
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 h-28 w-full resize-none rounded-lg border border-slate-200 p-3 text-xs leading-5 text-slate-600 outline-none focus:border-blue-400"
              placeholder="e.g. Upgrade Helios IAM from LDAP to OAuth 2.0 with SAML federation for partner portals..."
            />
          </label>
          <button
            onClick={generate}
            disabled={loading || !description.trim()}
            className="flex items-center gap-2 rounded-lg bg-[#0b1e3d] px-4 py-3 text-xs font-bold text-white disabled:opacity-50"
          >
            <Sparkles size={14} /> {loading ? 'Generating checklist...' : 'Generate readiness checklist'}
          </button>
        </div>
      </Card>

      {result && (
        <>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e8eef4" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={readiness >= 80 ? '#16a34a' : readiness >= 50 ? '#1685d8' : '#e11d48'}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 - (readiness / 100) * 2 * Math.PI * 42}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700">{readiness}%</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Readiness score</div>
                  <div className="text-[11px] text-slate-500">{checkedCount} of {totalItems} items checked</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AITag approved={false} />
                {readiness === 100 && <Badge tone="green"><ShieldCheck size={12} /> Ready for review</Badge>}
              </div>
            </div>
          </Card>

          {result.unknowns.length > 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 p-4 text-xs text-amber-700">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <div>{result.unknowns.join(' ')}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {result.sections.map((section) => (
              <Card key={section.title} className="p-5">
                <div className="mb-3 text-sm font-semibold text-slate-900">{section.title}</div>
                <div className="space-y-2">
                  {section.items.map((item, i) => {
                    const id = `${section.title}-${i}`;
                    const isChecked = checked.has(id);
                    return (
                      <button
                        key={id}
                        onClick={() => toggle(id)}
                        className="flex w-full items-start gap-2 rounded-lg border border-slate-200 p-2.5 text-left text-xs text-slate-600 transition hover:bg-slate-50"
                      >
                        <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isChecked ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                          {isChecked && <Check size={11} className="text-white" />}
                        </div>
                        <span className={isChecked ? 'line-through text-slate-400' : ''}>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>

          <ExpandableNote>
            <div>The checklist is AI-drafted from your upgrade description. Each item should be verified by the responsible team before sign-off. The readiness score updates as you check items off.</div>
          </ExpandableNote>
        </>
      )}
    </div>
  );
}
