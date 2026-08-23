import { useState } from 'react';
import { BookOpen, Sparkles, Download, ChevronRight } from 'lucide-react';
import { Card, Badge, SectionHeader, AITag, ExpandableNote } from '@/components';
import { generateCaseStudy } from '@/ai';
import { engagements } from '@/data';
import { useStore } from '@/store';

export function CaseStudy() {
  const { pushToast } = useStore();
  const [engagement, setEngagement] = useState(engagements[0].name);
  const [result, setResult] = useState<{ title: string; sections: { heading: string; body: string }[] } | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    const study = await generateCaseStudy(engagement);
    setResult(study);
    setLoading(false);
  }

  function exportStudy() {
    if (!result) return;
    const content = [result.title, ...result.sections.map((section) => `\n${section.heading}\n${section.body}`)].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${engagement.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-case-study.txt`;
    link.click();
    URL.revokeObjectURL(url);
    pushToast('Case study exported', 'success');
  }

  return (
    <div className="space-y-6 p-8">
      <Card className="p-6">
        <SectionHeader
          icon={<BookOpen size={16} className="text-blue-600" />}
          title="Post-Engagement Case Study Generator"
          subtitle="Generate a client-ready case study from engagement outcomes"
          right={<Badge tone="blue">Layer 5 · AI-drafted</Badge>}
        />
        <div className="mt-6 flex items-end gap-4">
          <label className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Engagement
            <select value={engagement} onChange={(e) => setEngagement(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 outline-none focus:border-blue-400">
              {engagements.map((e) => <option key={e.code}>{e.name}</option>)}
            </select>
          </label>
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-[#0b1e3d] px-4 py-3 text-xs font-bold text-white disabled:opacity-50"
          >
            <Sparkles size={14} /> {loading ? 'Generating...' : result ? 'Regenerate case study' : 'Generate case study'}
          </button>
        </div>
      </Card>

      {result && (
        <Card className="p-8">
          <div className="flex items-start justify-between border-b border-slate-100 pb-6">
            <div>
              <Badge tone="blue">Case study</Badge>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{result.title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <AITag approved={false} />
              <button onClick={exportStudy} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                <Download size={14} /> Export PDF
              </button>
            </div>
          </div>
          <article className="mt-6 space-y-7">
            {result.sections.map((s) => (
              <section key={s.heading}>
                <h3 className="mb-2 text-base font-semibold text-slate-900">{s.heading}</h3>
                <p className="text-sm leading-7 text-slate-600">{s.body}</p>
              </section>
            ))}
          </article>
          <div className="mt-8 border-t border-slate-100 pt-5">
            <ExpandableNote>
              <div>This case study is AI-drafted from the engagement's KPI evidence ledger. All numbers reference observed or modeled KPIs — none are invented. A human must review and approve before sharing with the client.</div>
            </ExpandableNote>
          </div>
        </Card>
      )}
    </div>
  );
}
