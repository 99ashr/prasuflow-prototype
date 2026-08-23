import { useState } from 'react';
import { Database, CheckCircle2, ChevronRight, Network, Upload, AlertCircle } from 'lucide-react';
import { Card, Badge, SectionHeader, Modal, ModalHeader } from '@/components';
import { requirements } from '@/data';
import { useStore } from '@/store';
import type { Screen, Requirement } from '@/types';

export function Setup({ setScreen }: { setScreen: (s: Screen) => void }) {
  const [step, setStep] = useState(3);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const { engineResult } = useStore();
  const blockedRequirements = requirements.filter((requirement) => !requirement.hasAcceptanceCriteria || requirement.clarityScore < 50);
  const steps: [string, string, string][] = [
    ['01', 'Connect sources', '5 files ready'],
    ['02', 'Map the process', '6 stages confirmed'],
    ['03', 'Validate signals', '12 signals detected'],
    ['04', 'Activate workspace', 'Ready to monitor'],
  ];
  const sources = [
    { name: 'Event log · 8,420 records', connected: true },
    { name: 'Requirement register · 56 items', connected: true },
    { name: 'Change request log · 18 items', connected: true },
    { name: 'UAT defect log · 27 items', connected: true },
    { name: 'SOP / policy docs · 4 files', connected: true },
    { name: 'Meeting notes · 12 records', connected: true },
  ];
  const stages = ['Onboarding', 'Requirement sign-off', 'Sprint execution', 'UAT', 'Go-live', 'Support handover'];

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Badge tone="blue">Ingestion wizard</Badge>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">Configure your delivery process</h2>
            <p className="mt-1 text-xs text-slate-500">Bring fragmented delivery evidence into one governed workspace.</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-4 text-blue-600"><Database size={24} /></div>
        </div>

        <div className="mb-10 grid grid-cols-4 gap-3">
          {steps.map(([num, label, detail], i) => (
            <button
              key={num}
              onClick={() => setStep(i)}
              className={`relative rounded-lg border p-4 text-left transition ${i <= step ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200'} ${i === step ? 'ring-2 ring-blue-400' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-600">{num}</span>
                {i < step && <CheckCircle2 size={14} className="text-emerald-500" />}
                {i === step && <span className="text-[9px] font-bold text-blue-600">CURRENT</span>}
              </div>
              <div className="mt-3 text-xs font-semibold text-slate-800">{label}</div>
              <div className="mt-1 text-[10px] text-slate-400">{detail}</div>
            </button>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Connect your data sources</div>
            <div className="grid grid-cols-2 gap-4">
              {sources.map((s) => (
                <div key={s.name} className="flex items-center gap-3 rounded-lg border border-slate-200 p-4">
                  <div className={`rounded-lg p-2 ${s.connected ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {s.connected ? <CheckCircle2 size={15} /> : <Upload size={15} />}
                  </div>
                  <div className="flex-1 text-xs font-semibold text-slate-700">{s.name}</div>
                  <span className="text-[10px] text-slate-400">{s.connected ? 'Normalized' : 'Pending'}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="flex items-center gap-2 rounded-lg bg-[#0b1e3d] px-4 py-3 text-xs font-bold text-white">
              Continue <ChevronRight size={14} />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Confirm the process being monitored</div>
            <div className="rounded-lg bg-slate-50 p-5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                {stages.map((s, i) => (
                  <div className="flex items-center gap-2" key={s}>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[10px] text-blue-600 shadow-sm">{i + 1}</span>
                    <span>{s}</span>
                    {i < 5 && <ChevronRight size={13} className="text-slate-300" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-bold text-slate-700"><Network size={14} className="text-blue-600" /> Normalized schema</div>
              <p className="mt-2">All sources are normalized into: <code className="rounded bg-white px-1.5 py-0.5 text-[11px] text-blue-700">case_id, activity, timestamp, actor_role, department, status, priority, linked_requirement_id</code></p>
            </div>
            <button onClick={() => setStep(2)} className="flex items-center gap-2 rounded-lg bg-[#0b1e3d] px-4 py-3 text-xs font-bold text-white">
              Continue <ChevronRight size={14} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Signal validation</div>
            <p className="text-xs text-slate-500">PrasuFlow ran {engineResult.ruleCount} detection rules against your normalized data. Here is what was found:</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Scope drift', '3 signals', 'red'],
                ['Requirement quality', '2 signals', 'amber'],
                ['Late change', '3 signals', 'red'],
                ['Rework', '2 signals', 'amber'],
                ['SLA breach', '2 signals', 'amber'],
                ['Effort change', '1 signal', 'blue'],
                ['Dependency added', '1 signal', 'blue'],
              ].map(([type, count, tone]) => (
                <div key={type} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <span className="text-xs font-semibold text-slate-700">{type}</span>
                  <Badge tone={tone as 'red' | 'amber' | 'blue'}>{count}</Badge>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800"><AlertCircle size={14} /> Requirement quality gate</div>
                  <p className="mt-1 text-[11px] text-amber-700">{blockedRequirements.length} of {requirements.length} requirements are blocked until acceptance criteria and clarity are verified.</p>
                </div>
                <Badge tone={blockedRequirements.length === 0 ? 'green' : 'amber'}>{blockedRequirements.length === 0 ? 'Pass' : 'Review required'}</Badge>
              </div>
              <div className="mt-3 divide-y divide-amber-100 rounded-lg border border-amber-100 bg-white">
                {blockedRequirements.map((requirement) => (
                  <button key={requirement.id} onClick={() => setSelectedRequirement(requirement)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-amber-50">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="flex-1 text-xs font-semibold text-slate-700">{requirement.id} · {requirement.text}</span>
                    <span className="text-[10px] text-amber-700">{requirement.clarityScore}% clarity</span>
                    <ChevronRight size={13} className="text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(3)} className="flex items-center gap-2 rounded-lg bg-[#0b1e3d] px-4 py-3 text-xs font-bold text-white">
              Continue <ChevronRight size={14} />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-6 text-center">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
              <h3 className="mt-3 text-base font-semibold text-slate-900">Workspace is ready</h3>
              <p className="mt-1 text-xs text-slate-500">6 sources connected · 6 stages mapped · 12 signals detected · 7 rules active</p>
              <button onClick={() => setScreen('map')} className="mt-5 flex items-center gap-2 rounded-lg bg-[#0b1e3d] px-4 py-3 text-xs font-bold text-white mx-auto">
                Go to delivery map <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
      {selectedRequirement && (
        <Modal onClose={() => setSelectedRequirement(null)} maxWidth="max-w-md">
          <ModalHeader title={selectedRequirement.id} subtitle="Requirement quality gate detail" onClose={() => setSelectedRequirement(null)} />
          <div className="space-y-4 p-6">
            <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-800">This requirement is blocked from sprint commitment until the quality conditions below are resolved.</div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3"><span className="text-slate-500">Acceptance criteria</span><Badge tone={selectedRequirement.hasAcceptanceCriteria ? 'green' : 'red'}>{selectedRequirement.hasAcceptanceCriteria ? 'Present' : 'Missing'}</Badge></div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3"><span className="text-slate-500">Clarity score</span><span className={`font-semibold ${selectedRequirement.clarityScore < 50 ? 'text-rose-600' : 'text-emerald-600'}`}>{selectedRequirement.clarityScore}%</span></div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3"><span className="text-slate-500">Owner</span><span className="font-semibold text-slate-700">{selectedRequirement.owner}</span></div>
            </div>
            <button onClick={() => setScreen('intelligence')} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b1e3d] py-3 text-xs font-bold text-white">Review related signals <ChevronRight size={14} /></button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function MapScreen() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const nodes: [string, number, number, number][] = [
    ['Requirement sign-off', 120, 90, 54],
    ['Sprint execution', 340, 70, 78],
    ['UAT', 560, 150, 62],
    ['Change review', 335, 230, 32],
    ['Go-live', 750, 105, 46],
    ['Support handover', 930, 190, 28],
  ];
  const nodeDetails: Record<string, { volume: string; wait: string; risk: string; description: string }> = {
    'Requirement sign-off': { volume: '54 cases', wait: '1.2 days average', risk: 'Low', description: 'Requirements are reviewed and linked to delivery stories before sprint commitment.' },
    'Sprint execution': { volume: '78 cases', wait: '6.8 days average', risk: 'Medium', description: 'The highest-volume stage. Late requirement edits and dependency changes create downstream pressure.' },
    UAT: { volume: '62 cases', wait: '3.1 days average', risk: 'High', description: 'Recurring defects and missing negative-path evidence are the main friction sources.' },
    'Change review': { volume: '32 cases', wait: '3.4 days average', risk: 'High', description: 'The longest wait in the process. Approval latency is the primary bottleneck.' },
    'Go-live': { volume: '46 cases', wait: '1.8 days average', risk: 'Medium', description: 'Release readiness depends on approved scope, completed UAT, and traceable evidence.' },
    'Support handover': { volume: '28 cases', wait: '2.2 days average', risk: 'Low', description: 'Handover records capture operational ownership, support contacts, and known limitations.' },
  };
  return (
    <div className="p-8">
      <Card className="p-5">
        <SectionHeader
          icon={<Network size={16} className="text-blue-600" />}
          title="Reconstructed process graph"
          subtitle="Node size = case volume · edge intensity = average wait time"
          right={
            <div className="flex gap-2">
              <Badge tone="green">Actual path</Badge>
              <Badge tone="amber">Friction path</Badge>
            </div>
          }
        />
        <div className="mt-6 overflow-hidden rounded-xl bg-[#f7fafc]">
          <svg viewBox="0 0 1100 360" className="w-full">
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#91a4b8" />
              </marker>
            </defs>
            <path d="M180 135 C250 95, 260 105, 300 120" stroke="#9cb3c8" strokeWidth="4" fill="none" markerEnd="url(#arrow)" />
            <path d="M410 120 C475 115, 500 150, 520 160" stroke="#4ea7df" strokeWidth="7" fill="none" markerEnd="url(#arrow)" />
            <path d="M590 195 C660 200, 670 150, 710 145" stroke="#9cb3c8" strokeWidth="3" fill="none" markerEnd="url(#arrow)" />
            <path d="M400 180 C450 225, 480 235, 510 220" stroke="#f4b844" strokeWidth="5" fill="none" strokeDasharray="8 6" markerEnd="url(#arrow)" />
            <path d="M590 220 C700 280, 780 260, 890 220" stroke="#f4b844" strokeWidth="4" fill="none" strokeDasharray="8 6" markerEnd="url(#arrow)" />
            {nodes.map(([label, x, y, size]) => (
              <g
                key={label}
                role="button"
                tabIndex={0}
                aria-label={`Inspect ${label}`}
                onClick={() => setSelectedNode(label)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') setSelectedNode(label);
                }}
                className="cursor-pointer"
              >
                <circle
                  cx={x}
                  cy={y}
                  r={size / 2 + (selectedNode === label ? 6 : 0)}
                  fill={label === 'Change review' ? '#fff3d6' : '#e4f2ff'}
                  stroke={selectedNode === label ? '#0b1e3d' : label === 'Change review' ? '#e5ad33' : '#4ea7df'}
                  strokeWidth={selectedNode === label ? '3' : '2'}
                />
                <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#19324f">{label}</text>
              </g>
            ))}
          </svg>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            ['Longest wait', 'Change review → UAT', '3.4 days average', 'amber'],
            ['Most volume', 'Sprint execution', '78 active cases', 'blue'],
            ['Rework loop', 'UAT → Sprint execution', '14 reopened items', 'red'],
          ].map(([label, value, detail, tone]) => (
            <div key={label} className="rounded-lg bg-slate-50 p-3">
              <div className="text-[9px] uppercase tracking-wider text-slate-400">{label}</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
              <div className={`mt-1 text-[10px] ${tone === 'amber' ? 'text-amber-600' : tone === 'blue' ? 'text-blue-600' : 'text-rose-600'}`}>{detail}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-800">
          Select any process node to inspect its volume, wait time, and delivery risk.
        </div>
      </Card>
      {selectedNode && (
        <Modal onClose={() => setSelectedNode(null)} maxWidth="max-w-md">
          <ModalHeader title={selectedNode} subtitle="Process stage detail" onClose={() => setSelectedNode(null)} />
          <div className="grid grid-cols-3 gap-3 p-6 pb-3">
            <div className="rounded-lg bg-slate-50 p-3"><div className="text-[9px] uppercase tracking-wider text-slate-400">Volume</div><div className="mt-1 text-sm font-semibold text-slate-800">{nodeDetails[selectedNode].volume}</div></div>
            <div className="rounded-lg bg-slate-50 p-3"><div className="text-[9px] uppercase tracking-wider text-slate-400">Avg wait</div><div className="mt-1 text-sm font-semibold text-slate-800">{nodeDetails[selectedNode].wait}</div></div>
            <div className="rounded-lg bg-slate-50 p-3"><div className="text-[9px] uppercase tracking-wider text-slate-400">Risk</div><div className="mt-1"><Badge tone={nodeDetails[selectedNode].risk === 'High' ? 'red' : nodeDetails[selectedNode].risk === 'Medium' ? 'amber' : 'green'}>{nodeDetails[selectedNode].risk}</Badge></div></div>
          </div>
          <p className="p-6 pt-3 text-xs leading-5 text-slate-600">{nodeDetails[selectedNode].description}</p>
        </Modal>
      )}
    </div>
  );
}
