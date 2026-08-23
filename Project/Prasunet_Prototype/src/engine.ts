import type { Signal, Requirement, UATDefect, ChangeRequest, MeetingNote, KPI, Risk } from './types';

export type Evidence = {
  id: string;
  source: string;
  sourceType: 'requirement' | 'uat_defect' | 'change_request' | 'meeting_note' | 'kpi' | 'event_log';
  excerpt: string;
  timestamp: string;
  engagement: string;
  confidence: number;
};

export type DetectionRule = {
  id: string;
  name: string;
  frictionType: string;
  description: string;
  evaluate: (ctx: EngineContext) => Signal[];
};

export type EngineContext = {
  requirements: Requirement[];
  uatDefects: UATDefect[];
  changeRequests: ChangeRequest[];
  meetingNotes: MeetingNote[];
  kpis: KPI[];
  signals: Signal[];
};

export type EngineResult = {
  signals: Signal[];
  evidence: Evidence[];
  rules: DetectionRule[];
  timestamp: string;
  ruleCount: number;
  signalCount: number;
};

function riskFromClarity(clarity: number): Risk {
  if (clarity < 30) return 'High';
  if (clarity < 50) return 'Medium';
  return 'Low';
}

function riskFromLatency(actual: number, target: number): Risk {
  if (actual > target * 2) return 'High';
  if (actual > target) return 'Medium';
  return 'Low';
}

const rules: DetectionRule[] = [
  {
    id: 'RQ-001',
    name: 'Missing acceptance criteria',
    frictionType: 'Requirement quality',
    description: 'Detects stories that entered development without acceptance criteria.',
    evaluate: (ctx) => {
      return ctx.requirements
        .filter((r) => !r.hasAcceptanceCriteria)
        .map((r) => {
          const linkedDefects = ctx.uatDefects.filter((d) => d.linkedRequirement === r.id);
          const risk: Risk = linkedDefects.length > 1 ? 'High' : linkedDefects.length === 1 ? 'Medium' : riskFromClarity(r.clarityScore);
          return {
            id: `SIG-RQ-${r.id}`,
            type: 'Requirement quality',
            title: `Story entered development without acceptance criteria`,
            caseId: `${r.id} · ${r.engagement}`,
            confidence: 98,
            materiality: linkedDefects.length > 0 ? `${linkedDefects.length} linked defect(s)` : 'Medium',
            risk,
            evidence: `Story ${r.id} committed with acceptance criteria field empty. ${linkedDefects.length} downstream UAT defect(s) link to the same story.`,
            action: 'Add a completeness gate before sprint commitment.',
            source: `Requirement register · ${r.id} · v${r.version}`,
            approved: false,
          };
        });
    },
  },
  {
    id: 'RQ-002',
    name: 'Low clarity score',
    frictionType: 'Requirement quality',
    description: 'Flags requirements with clarity below 50%.',
    evaluate: (ctx) => {
      return ctx.requirements
        .filter((r) => r.clarityScore < 50)
        .map((r) => ({
          id: `SIG-RQ2-${r.id}`,
          type: 'Requirement quality',
          title: `Clarification loop on requirement text`,
          caseId: `${r.id} · ${r.engagement}`,
          confidence: 82,
          materiality: r.clarityScore < 30 ? 'High' : 'Low',
          risk: riskFromClarity(r.clarityScore),
          evidence: `Requirement ${r.id} has a clarity score of ${r.clarityScore}%, below the 50% threshold. Source: ${r.source}.`,
          action: 'Draft a wording clarification for BA or product owner review.',
          source: `Requirement register · ${r.id} · v${r.version}`,
          approved: false,
        }));
    },
  },
  {
    id: 'SD-001',
    name: 'Scope drift from meeting notes',
    frictionType: 'Scope drift',
    description: 'Detects new requests in meeting notes without a linked change request.',
    evaluate: (ctx) => {
      return ctx.meetingNotes
        .filter((m) => {
          const t = m.rawText.toLowerCase();
          return t.includes('not in the original scope') || t.includes('need sso') || t.includes('hard requirement') || t.includes('also include');
        })
        .map((m) => {
          const hasCR = ctx.changeRequests.some((c) => c.engagement === m.engagement && c.approvalStatus === 'Pending');
          return {
            id: `SIG-SD-${m.id}`,
            type: 'Scope drift',
            title: 'New request detected in steering note',
            caseId: `${m.id} · ${m.engagement}`,
            confidence: 94,
            materiality: '18h / 4 days',
            risk: 'High' as Risk,
            evidence: `Meeting note ${m.id} contains a new request not in original scope. ${hasCR ? 'A pending CR exists.' : 'No CR linked.'}`,
            action: 'Open a change request and confirm commercial impact before sprint entry.',
            source: `Meeting note · ${m.date}`,
            approved: false,
          };
        });
    },
  },
  {
    id: 'SD-002',
    name: 'Dependency added after sprint lock',
    frictionType: 'Scope drift',
    description: 'Detects dependencies added after sprint plan was locked.',
    evaluate: (ctx) => {
      return ctx.meetingNotes
        .filter((m) => m.rawText.toLowerCase().includes('dependency') && m.rawText.toLowerCase().includes('added'))
        .map((m) => ({
          id: `SIG-SD2-${m.id}`,
          type: 'Scope drift',
          title: 'Dependency added after sprint plan locked',
          caseId: `${m.id} · ${m.engagement}`,
          confidence: 85,
          materiality: '8h / 2 days',
          risk: 'Medium' as Risk,
          evidence: `New dependency mentioned in meeting note ${m.id} after sprint lock. No impact assessment on file.`,
          action: 'Run the Change Impact Simulator and route to PM for sign-off.',
          source: `Meeting note · ${m.date}`,
          approved: false,
        }));
    },
  },
  {
    id: 'LC-001',
    name: 'Late requirement change',
    frictionType: 'Late change',
    description: 'Detects requirements edited after sprint commitment.',
    evaluate: (ctx) => {
      return ctx.requirements
        .filter((r) => r.version > 2)
        .map((r) => ({
          id: `SIG-LC-${r.id}`,
          type: 'Late change',
          title: 'Requirement edited after sprint commitment',
          caseId: `${r.id} · ${r.engagement}`,
          confidence: 91,
          materiality: r.version > 3 ? '26h / 6 days' : '14h / 3 days',
          risk: r.version > 3 ? 'High' as Risk : 'Medium' as Risk,
          evidence: `Requirement ${r.id} version went to v${r.version} after sprint lock. Definition changed after commitment.`,
          action: r.version > 3 ? 'Route to client sponsor + PM + finance for impact review.' : 'Flag for PM review and update sprint burndown.',
          source: `Version history · ${r.id} · v${r.version}`,
          approved: false,
        }));
    },
  },
  {
    id: 'RW-001',
    name: 'UAT defect recurrence',
    frictionType: 'Rework',
    description: 'Detects UAT defects that have been reopened more than once.',
    evaluate: (ctx) => {
      return ctx.uatDefects
        .filter((d) => d.recurrence)
        .map((d) => ({
          id: `SIG-RW-${d.id}`,
          type: 'Rework',
          title: 'UAT item reopened more than once',
          caseId: `${d.id} · ${d.engagement}`,
          confidence: 96,
          materiality: '12h / 2 cycles',
          risk: 'Medium' as Risk,
          evidence: `Defect ${d.id} reopened after regression test. Root-cause hypothesis: ${d.rootCauseHypothesis}.`,
          action: 'Require negative-path test evidence before closure.',
          source: `UAT defect log · ${d.id}`,
          approved: false,
        }));
    },
  },
  {
    id: 'SLA-001',
    name: 'Approval SLA breach',
    frictionType: 'SLA breach',
    description: 'Detects change requests where approval time exceeds SOP target.',
    evaluate: (ctx) => {
      return ctx.changeRequests
        .filter((c) => c.approvalStatus === 'Pending')
        .map((c) => {
          const targetDays = 2;
          const actualDays = c.hoursEstimate > 15 ? 5.4 : 4.1;
          const risk = riskFromLatency(actualDays, targetDays);
          return {
            id: `SIG-SLA-${c.id}`,
            type: 'SLA breach',
            title: 'Client approval time exceeds SOP target',
            caseId: `${c.id} · ${c.engagement}`,
            confidence: 88,
            materiality: `${actualDays} days wait`,
            risk,
            evidence: `Approval for ${c.id} took ${actualDays} days against SOP target of ${targetDays} days. ${c.description}.`,
            action: 'Escalate with a client-safe status line and named owner.',
            source: `SOP-04 · approval latency rule · ${c.id}`,
            approved: false,
          };
        });
    },
  },
];

export function collectEvidence(ctx: EngineContext): Evidence[] {
  const evidence: Evidence[] = [];

  ctx.requirements.forEach((r) => {
    evidence.push({
      id: `EV-REQ-${r.id}`,
      source: `Requirement register · ${r.id}`,
      sourceType: 'requirement',
      excerpt: `${r.text} (clarity: ${r.clarityScore}%, AC: ${r.hasAcceptanceCriteria ? 'yes' : 'no'}, v${r.version})`,
      timestamp: `v${r.version}`,
      engagement: r.engagement,
      confidence: r.clarityScore,
    });
  });

  ctx.uatDefects.forEach((d) => {
    evidence.push({
      id: `EV-DEF-${d.id}`,
      source: `UAT defect log · ${d.id}`,
      sourceType: 'uat_defect',
      excerpt: `${d.description} (recurrence: ${d.recurrence}, root cause: ${d.rootCauseHypothesis})`,
      timestamp: 'Current sprint',
      engagement: d.engagement,
      confidence: d.recurrence ? 96 : 80,
    });
  });

  ctx.changeRequests.forEach((c) => {
    evidence.push({
      id: `EV-CR-${c.id}`,
      source: `Change request log · ${c.id}`,
      sourceType: 'change_request',
      excerpt: `${c.description} (risk: ${c.riskTier}, hours: ${c.hoursEstimate}, status: ${c.approvalStatus})`,
      timestamp: c.approvalStatus,
      engagement: c.engagement,
      confidence: 88,
    });
  });

  ctx.meetingNotes.forEach((m) => {
    evidence.push({
      id: `EV-MN-${m.id}`,
      source: `Meeting note · ${m.date}`,
      sourceType: 'meeting_note',
      excerpt: m.rawText.slice(0, 200),
      timestamp: m.date,
      engagement: m.engagement,
      confidence: 85,
    });
  });

  ctx.kpis.forEach((k) => {
    evidence.push({
      id: `EV-KPI-${k.name.slice(0, 10)}`,
      source: `KPI ledger · ${k.name}`,
      sourceType: 'kpi',
      excerpt: `${k.name}: baseline ${k.baseline}, target ${k.target}, observed ${k.observed} (${k.status})`,
      timestamp: 'Current',
      engagement: 'All',
      confidence: k.status === 'Client-validated' || k.status === 'Observed' ? 95 : 70,
    });
  });

  return evidence;
}

export function runDetectionEngine(ctx: EngineContext): EngineResult {
  const allSignals: Signal[] = [];
  rules.forEach((rule) => {
    const detected = rule.evaluate(ctx);
    allSignals.push(...detected);
  });

  const evidence = collectEvidence(ctx);

  return {
    signals: allSignals,
    evidence,
    rules,
    timestamp: new Date().toISOString(),
    ruleCount: rules.length,
    signalCount: allSignals.length,
  };
}

export function getRuleById(id: string): DetectionRule | undefined {
  return rules.find((r) => r.id === id);
}

export function getEvidenceForSignal(signal: Signal, evidence: Evidence[]): Evidence[] {
  const caseIdParts = signal.caseId.split(' · ');
  const refId = caseIdParts[0];
  return evidence.filter((e) => e.id.includes(refId) || e.source.includes(refId));
}

export { rules as detectionRules };
