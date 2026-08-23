import { useState } from 'react';
import { Grid3x3, ChevronRight, AlertTriangle, TrendingDown, ShieldAlert } from 'lucide-react';
import { Card, Badge, SectionHeader } from '@/components';
import { engagements } from '@/data';
import { useStore } from '@/store';
import type { Screen, Signal } from '@/types';

type Cell = { likelihood: number; impact: number; label: string };

const likelihoodLabels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost certain'];
const impactLabels = ['Negligible', 'Minor', 'Moderate', 'Major', 'Severe'];

function riskScore(s: Signal): { likelihood: number; impact: number } {
  const riskMap: Record<string, number> = { Low: 1, Medium: 2, High: 3, Critical: 4 };
  const base = riskMap[s.risk] ?? 2;
  const confAdj = s.confidence > 90 ? 1 : 0;
  const likelihood = Math.min(4, base + confAdj);
  const impact = Math.min(4, base);
  return { likelihood, impact };
}

function cellTone(likelihood: number, impact: number): string {
  const score = likelihood + impact;
  if (score >= 7) return 'bg-rose-100 hover:bg-rose-200 border-rose-300';
  if (score >= 5) return 'bg-amber-100 hover:bg-amber-200 border-amber-300';
  if (score >= 3) return 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200';
  return 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200';
}

function cellBadge(likelihood: number, impact: number): string {
  const score = likelihood + impact;
  if (score >= 7) return 'text-rose-700';
  if (score >= 5) return 'text-amber-700';
  if (score >= 3) return 'text-yellow-700';
  return 'text-emerald-700';
}

export function RiskHeatmap({ setScreen, onSignal }: { setScreen: (s: Screen) => void; onSignal: (s: Signal) => void }) {
  const { signals } = useStore();
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [engagementFilter, setEngagementFilter] = useState('All');

  const filtered = engagementFilter === 'All' ? signals : signals.filter((s) => s.caseId.includes(engagementFilter));

  const cellSignals = selectedCell
    ? filtered.filter((s) => {
        const rs = riskScore(s);
        return rs.likelihood === selectedCell.likelihood && rs.impact === selectedCell.impact;
      })
    : [];

  const highRiskCount = filtered.filter((s) => {
    const rs = riskScore(s);
    return rs.likelihood + rs.impact >= 7;
  }).length;
  const mediumRiskCount = filtered.filter((s) => {
    const rs = riskScore(s);
    return rs.likelihood + rs.impact >= 5 && rs.likelihood + rs.impact < 7;
  }).length;
  const lowRiskCount = filtered.filter((s) => {
    const rs = riskScore(s);
    return rs.likelihood + rs.impact < 5;
  }).length;

  return (
    <div className="space-y-6 p-8">
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Critical risks</div>
              <div className="mt-3 text-3xl font-semibold text-rose-600">{highRiskCount}</div>
              <div className="mt-2 text-[11px] text-slate-500">Need immediate attention</div>
            </div>
            <div className="rounded-lg bg-rose-50 p-2.5 text-rose-600"><ShieldAlert size={18} /></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Elevated risks</div>
              <div className="mt-3 text-3xl font-semibold text-amber-600">{mediumRiskCount}</div>
              <div className="mt-2 text-[11px] text-slate-500">Monitor and plan mitigation</div>
            </div>
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600"><AlertTriangle size={18} /></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Managed risks</div>
              <div className="mt-3 text-3xl font-semibold text-emerald-600">{lowRiskCount}</div>
              <div className="mt-2 text-[11px] text-slate-500">Within acceptable threshold</div>
            </div>
            <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600"><TrendingDown size={18} /></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total signals mapped</div>
              <div className="mt-3 text-3xl font-semibold text-slate-900">{filtered.length}</div>
              <div className="mt-2 text-[11px] text-slate-500">Across all engagements</div>
            </div>
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Grid3x3 size={18} /></div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <SectionHeader
            icon={<Grid3x3 size={16} className="text-blue-600" />}
            title="Risk likelihood vs impact matrix"
            subtitle="Click any cell to see the signals in that risk band"
          />
          <select
            value={engagementFilter}
            onChange={(e) => setEngagementFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-500 outline-none"
          >
            <option value="All">All engagements</option>
            {engagements.map((e) => <option key={e.code} value={e.name.split(' ')[0]}>{e.name}</option>)}
          </select>
        </div>

        <div className="mt-8 flex">
          <div className="flex flex-col items-center justify-center pr-3">
            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              Likelihood →
            </div>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, impactIdx) => (
                <div key={impactIdx} className="space-y-2">
                  <div className="text-center text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    {impactLabels[impactIdx]}
                  </div>
                  {Array.from({ length: 5 }).map((_, likelihoodIdx) => {
                    const count = filtered.filter((s) => {
                      const rs = riskScore(s);
                      return rs.likelihood === likelihoodIdx && rs.impact === impactIdx;
                    }).length;
                    return (
                      <button
                        key={likelihoodIdx}
                        onClick={() => count > 0 && setSelectedCell({ likelihood: likelihoodIdx, impact: impactIdx, label: `${likelihoodLabels[likelihoodIdx]} × ${impactLabels[impactIdx]}` })}
                        className={`relative flex h-[72px] items-center justify-center rounded-lg border-2 transition ${cellTone(likelihoodIdx, impactIdx)} ${count === 0 ? 'cursor-default opacity-40' : 'cursor-pointer'}`}
                      >
                        {count > 0 && (
                          <span className={`text-lg font-bold ${cellBadge(likelihoodIdx, impactIdx)}`}>{count}</span>
                        )}
                        {selectedCell?.likelihood === likelihoodIdx && selectedCell?.impact === impactIdx && (
                          <span className="absolute inset-0 rounded-lg ring-2 ring-blue-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="mt-3 text-center text-[9px] font-bold uppercase tracking-widest text-slate-400">Impact →</div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4 text-[10px] text-slate-500">
          <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-emerald-100 border border-emerald-200" /> Low risk</div>
          <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-yellow-50 border border-yellow-200" /> Minor risk</div>
          <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-amber-100 border border-amber-300" /> Elevated risk</div>
          <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-rose-100 border border-rose-300" /> Critical risk</div>
        </div>
      </Card>

      {selectedCell && (
        <Card className="p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <SectionHeader
              icon={<AlertTriangle size={16} className="text-amber-500" />}
              title={`Signals in: ${selectedCell.label}`}
              subtitle={`${cellSignals.length} signal${cellSignals.length !== 1 ? 's' : ''} in this risk band`}
            />
            <button onClick={() => setSelectedCell(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Clear selection</button>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {cellSignals.map((signal) => (
              <button
                key={signal.id}
                onClick={() => onSignal(signal)}
                className="flex w-full items-center gap-4 py-3 text-left transition hover:bg-slate-50"
              >
                <div className={`h-2 w-2 shrink-0 rounded-full ${signal.risk === 'High' || signal.risk === 'Critical' ? 'bg-rose-500' : signal.risk === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-slate-800">{signal.title}</div>
                  <div className="mt-1 text-[10px] text-slate-400">{signal.caseId} · {signal.type}</div>
                </div>
                <Badge tone={signal.risk === 'High' || signal.risk === 'Critical' ? 'red' : signal.risk === 'Medium' ? 'amber' : 'blue'}>{signal.risk}</Badge>
                {signal.approved && <Badge tone="green">Approved</Badge>}
                <ChevronRight size={15} className="text-slate-300" />
              </button>
            ))}
            {cellSignals.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">No signals in this risk band for the selected engagement.</div>
            )}
          </div>
        </Card>
      )}

      <button onClick={() => setScreen('intelligence')} className="flex items-center gap-2 text-xs font-bold text-blue-600">
        View all signals in intelligence <ChevronRight size={14} />
      </button>
    </div>
  );
}
