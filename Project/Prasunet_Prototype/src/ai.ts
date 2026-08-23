import type { Signal, Requirement, UATDefect, ChangeRequest, KPI } from './types';
import { signals, requirements, uatDefects, changeRequests, kpis, engagements } from './data';

// Reusable AI utility — currently returns realistic mocked responses.
// To swap for a real LLM, replace the body of callAI with a fetch to your endpoint.
// Example: const res = await fetch('/api/llm', { method: 'POST', body: JSON.stringify({ prompt, context }) }); return res.text();

export async function callAI(prompt: string, context?: Record<string, unknown>): Promise<string> {
  // Simulate network latency for realism
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));
  return mockAIResponse(prompt, context);
}

// --- Root-Cause Assistant logic ---

type ChatContext = {
  signals: Signal[];
  requirements: Requirement[];
  uatDefects: UATDefect[];
  changeRequests: ChangeRequest[];
  kpis: KPI[];
};

const chatContext: ChatContext = { signals, requirements, uatDefects, changeRequests, kpis };

function findSources(query: string): string[] {
  const q = query.toLowerCase();
  const sources: string[] = [];

  // Match signals
  chatContext.signals.forEach((s) => {
    if (
      q.includes('uat') && (s.type === 'Rework' || s.id.toLowerCase().includes('uat')) ||
      q.includes('rework') && s.type === 'Rework' ||
      q.includes('reopen') && s.type === 'Rework' ||
      q.includes('recurrence') && s.type === 'Rework' ||
      q.includes('scope') && s.type === 'Scope drift' ||
      q.includes('late change') && s.type === 'Late change' ||
      q.includes('sla') && s.type === 'SLA breach' ||
      q.includes('approval') && s.type === 'SLA breach' ||
      q.includes('acceptance criteria') && s.type === 'Requirement quality' ||
      q.includes('clarity') && s.type === 'Requirement quality' ||
      q.includes(s.id.toLowerCase())
    ) {
      sources.push(`${s.id} · ${s.title}`);
    }
  });

  // Match requirements
  chatContext.requirements.forEach((r) => {
    if (
      q.includes(r.id.toLowerCase()) ||
      (q.includes('acceptance criteria') && !r.hasAcceptanceCriteria) ||
      (q.includes('clarity') && r.clarityScore < 50)
    ) {
      sources.push(`${r.id} · clarity ${r.clarityScore}%${r.hasAcceptanceCriteria ? '' : ' · no AC'}`);
    }
  });

  // Match UAT defects
  chatContext.uatDefects.forEach((d) => {
    if (q.includes('uat') || q.includes('rework') || q.includes('reopen') || q.includes('recurrence') || q.includes(d.id.toLowerCase())) {
      sources.push(`${d.id} · ${d.description}${d.recurrence ? ' · recurrence: true' : ''}`);
    }
  });

  // Match change requests
  chatContext.changeRequests.forEach((c) => {
    if (q.includes('change') || q.includes('cr-') || q.includes(c.id.toLowerCase()) || q.includes('scope')) {
      sources.push(`${c.id} · ${c.description} · ${c.approvalStatus}`);
    }
  });

  return sources.slice(0, 5);
}

function mockAIResponse(prompt: string, _context?: Record<string, unknown>): string {
  const q = prompt.toLowerCase();
  const sources = findSources(prompt);

  // UAT recurrence / rework
  if (q.includes('uat') && (q.includes('recurrence') || q.includes('high') || q.includes('rework') || q.includes('reopen'))) {
    const reworkSignals = chatContext.signals.filter((s) => s.type === 'Rework');
    const recurringDefects = chatContext.uatDefects.filter((d) => d.recurrence);
    return `UAT recurrence is ${kpis.find((k) => k.name === 'UAT defect recurrence')?.observed} this sprint, down from a baseline of ${kpis.find((k) => k.name === 'UAT defect recurrence')?.baseline}. The strongest contributing pattern is missing negative-path acceptance criteria — ${recurringDefects.length} recurring defect(s) trace back to requirements without AC. Specifically, DEF-044 and DEF-051 both link to REQ-172, which has a clarity score of 42% and no acceptance criteria on file.`;
  }

  // Scope drift
  if (q.includes('scope') && (q.includes('drift') || q.includes('new request') || q.includes('untracked'))) {
    const scopeSignals = chatContext.signals.filter((s) => s.type === 'Scope drift');
    return `I found ${scopeSignals.length} scope-drift signals across the workspace. The highest-confidence one is ${scopeSignals[0]?.id} (${scopeSignals[0]?.confidence}%) — "${scopeSignals[0]?.title}". This was detected from ${scopeSignals[0]?.source}. All candidate new scope requires human sign-off regardless of confidence — this is a hardcoded governance rule, not a tunable threshold.`;
  }

  // Late change
  if (q.includes('late change') || q.includes('edited after') || q.includes('sprint commitment')) {
    const lateSignals = chatContext.signals.filter((s) => s.type === 'Late change');
    return `There are ${lateSignals.length} late-change signals. The most material is ${lateSignals[0]?.id} — "${lateSignals[0]?.title}" with ${lateSignals[0]?.materiality} impact. The requirement definition was edited after sprint lock, and effort moved significantly. This is classified as High risk and requires client sponsor + PM + finance approval before any action.`;
  }

  // SLA / approval latency
  if (q.includes('sla') || q.includes('approval') && q.includes('latency') || q.includes('approval time')) {
    const slaSignals = chatContext.signals.filter((s) => s.type === 'SLA breach');
    return `I detected ${slaSignals.length} SLA breach signals. ${slaSignals[0]?.id} shows an approval that took 5.4 days against the SOP target of 2 days. The current scope-approval latency KPI is observed at ${kpis.find((k) => k.name === 'Scope-approval latency')?.observed}, down from ${kpis.find((k) => k.name === 'Scope-approval latency')?.baseline} baseline. This is client-validated evidence.`;
  }

  // Delivery health
  if (q.includes('delivery health') || q.includes('health score') || q.includes('overall')) {
    return `The overall Delivery Health Score is 82 out of 100, up 4 points from last week. It is a weighted composite of 6 evidence-backed KPIs: requirement clarity (79%, observed), late-change ratio (18%, modeled), rework rate (14%, observed), UAT recurrence (8%, observed), scope-approval latency (2.6d, client-validated), and traceability completeness (76%, directional). Risk posture is classified as Controlled.`;
  }

  // Engagement-specific
  const matchedEngagement = engagements.find((e) => q.includes(e.name.toLowerCase().split(' ')[0]));
  if (matchedEngagement) {
    const engSignals = chatContext.signals.filter((s) => s.caseId.includes(matchedEngagement.name.split(' ')[0]));
    return `${matchedEngagement.name} (${matchedEngagement.code}) is in ${matchedEngagement.phase} with a delivery health score of ${matchedEngagement.score}. There are ${engSignals.length} open signals linked to this engagement. The most pressing is ${engSignals[0]?.id || 'none'} — "${engSignals[0]?.title || 'no open signals'}".`;
  }

  // Recommendation
  if (q.includes('recommend') || q.includes('what should') || q.includes('action') || q.includes('intervention')) {
    return `Based on the deterministic scoring model, the top-ranked intervention is "Add requirement completeness gate" with a composite score of 84.2. It ranks highest because business impact (91) and AI/automation fit (88) are both strong, with good data readiness (79). It is classified as Medium risk and requires PM + product owner approval. This would directly address SIG-019 and SIG-011, the two highest-confidence signals in the workspace.`;
  }

  // KPI query
  if (q.includes('kpi') || q.includes('metric') || q.includes('clarity') || q.includes('traceability')) {
    const matchedKpi = kpis.find((k) => q.includes(k.name.toLowerCase().split(' ')[0]));
    if (matchedKpi) {
      return `${matchedKpi.name}: baseline ${matchedKpi.baseline}, target ${matchedKpi.target}, observed ${matchedKpi.observed}. Status: ${matchedKpi.status}. Formula: ${matchedKpi.formula}. Movement: ${matchedKpi.movement} (${matchedKpi.better} is better).`;
    }
    return `There are ${kpis.length} tracked KPIs. Three are Observed (real data), two are Modeled, one is Directional, one is Client-validated, and one is a Gap. The strongest improvement is traceability completeness at +18 pts. The formula for Delivery Health Score is a weighted composite of all these KPIs.`;
  }

  // Default
  return `I can help you understand delivery friction in this workspace. Try asking about UAT recurrence, scope drift, late changes, SLA breaches, delivery health, or specific engagements like Northstar, Meridian, or Atlas. I will always cite the evidence cards and requirements I used to answer.`;
}

export function getChatSources(prompt: string): string[] {
  return findSources(prompt);
}

// --- Meeting Minutes generation ---

export type MeetingMinutes = {
  date: string;
  attendees: string[];
  engagement: string;
  purpose: string;
  discussionPoints: string[];
  decisions: string[];
  actionItems: { owner: string; task: string; due: string; priority: string }[];
  risks: string[];
  newRequests: string[];
  nextSteps: string;
};

export async function generateMeetingMinutes(
  rawText: string,
  date: string,
  attendees: string[],
  engagement: string
): Promise<MeetingMinutes> {
  await new Promise((r) => setTimeout(r, 800));

  const text = rawText.toLowerCase();
  const discussionPoints: string[] = [];
  const decisions: string[] = [];
  const actionItems: MeetingMinutes['actionItems'] = [];
  const risks: string[] = [];
  const newRequests: string[] = [];

  // Extract discussion points (sentences with key delivery terms)
  const sentences = rawText.split(/[.\n]+/).map((s) => s.trim()).filter((s) => s.length > 10);
  sentences.forEach((s) => {
    const sl = s.toLowerCase();
    if (sl.includes('on track') || sl.includes('uat') || sl.includes('evidence') || sl.includes('test')) {
      discussionPoints.push(s.replace(/^(priya|ravi|sarah|client)\s*:\s*/i, ''));
    }
    if (sl.includes('not in the original scope') || sl.includes('new requirement') || sl.includes('need sso') || sl.includes('hard requirement')) {
      newRequests.push(s.replace(/^(priya|ravi|sarah|client)\s*:\s*/i, ''));
    }
  });

  // Extract decisions
  if (text.includes('on track')) decisions.push('Continue UAT for committed scope.');
  if (text.includes('not in the original scope') || text.includes('assess')) {
    decisions.push('Assess scope-adjacent requests separately through change control.');
  }
  if (text.includes('dependency')) decisions.push('Run impact assessment for newly added dependencies.');

  // Extract action items (look for names + verbs)
  const namePattern = /\b(priya|ravi|sarah|a\.\s*shah|v\.\s*rao)\b/gi;
  const lines = rawText.split('\n');
  lines.forEach((line) => {
    const ll = line.toLowerCase();
    if (namePattern.test(line) && (ll.includes('confirm') || ll.includes('share') || ll.includes('send') || ll.includes('draft') || ll.includes('to '))) {
      const nameMatch = line.match(/\b(Priya|Ravi|Sarah|A\.\s*Shah|V\.\s*Rao)\b/i);
      const owner = nameMatch ? nameMatch[0] : 'Unassigned';
      const cleaned = line.replace(/^(priya|ravi|sarah|a\.\s*shah|v\.\s*rao)\s*:\s*/i, '').trim();
      let due = 'Not specified';
      let priority = 'Medium';
      if (ll.includes('thursday') || ll.includes('thu')) due = 'Thursday';
      if (ll.includes('friday') || ll.includes('fri')) due = 'Friday';
      if (ll.includes('by ')) {
        const dueMatch = line.match(/by\s+(\w+)/i);
        if (dueMatch) due = dueMatch[1];
      }
      if (ll.includes('high')) priority = 'High';
      if (ll.includes('urgent')) priority = 'High';
      if (cleaned.length > 5) {
        actionItems.push({ owner, task: cleaned, due, priority });
      }
    }
  });

  // Extract risks
  if (text.includes('not in the original scope')) risks.push('Scope-adjacent request detected without linked CR — potential untracked scope growth.');
  if (text.includes('dependency') && text.includes('added')) risks.push('New dependency added after sprint lock — impact not assessed.');
  if (text.includes('negative-path') || text.includes('evidence')) risks.push('Negative-path test evidence missing — UAT closure may be blocked.');

  // Extract next steps
  let nextSteps = 'Schedule follow-up sync.';
  const nextMatch = rawText.match(/next sync\s*[:\-]?\s*(.+)/i);
  if (nextMatch) nextSteps = `Next sync: ${nextMatch[1].trim()}`;

  // Determine purpose
  let purpose = 'Delivery status review and alignment.';
  if (text.includes('uat')) purpose = 'UAT readiness and scope review.';
  if (text.includes('discovery')) purpose = 'Discovery and requirements gathering.';

  return {
    date,
    attendees,
    engagement,
    purpose,
    discussionPoints: discussionPoints.length > 0 ? discussionPoints : ['No specific discussion points extracted.'],
    decisions: decisions.length > 0 ? decisions : ['No explicit decisions recorded.'],
    actionItems: actionItems.length > 0 ? actionItems : [{ owner: 'Not specified', task: 'No action items extracted', due: 'Not specified', priority: 'Low' }],
    risks,
    newRequests,
    nextSteps,
  };
}

// --- Legacy System Documentation generation ---

export async function generateLegacyDoc(
  systemName: string,
  systemType: string,
  rawNotes: string
): Promise<{ sections: { title: string; content: string }[]; confidence: string; unknowns: string[] }> {
  await new Promise((r) => setTimeout(r, 800));

  const notes = rawNotes.trim();
  const hasNotes = notes.length > 20;
  const unknowns: string[] = [];

  const sections = [
    {
      title: '1. System Overview',
      content: hasNotes
        ? `${systemName} is a ${systemType} system. ${notes.slice(0, 200)}`
        : `${systemName} is a ${systemType} system. Business function and criticality tier: Not documented — confirm with system owner.`,
    },
    {
      title: '2. Access & Authentication',
      content: hasNotes && notes.toLowerCase().includes('auth')
        ? `Authentication details from source: ${notes.slice(0, 150)}`
        : 'How to request access: Not documented — confirm with system owner. Authentication method: Not documented — confirm with system owner. Environment tiers: Not documented — confirm with system owner.',
    },
    {
      title: '3. Configuration Guide',
      content: 'Required environment variables: Not documented — confirm with system owner. Connection parameters: Not documented — confirm with system owner. Dependency prerequisites: Not documented — confirm with system owner.',
    },
    {
      title: '4. Setup & Integration Steps',
      content: '1. Request access from system owner. 2. Configure environment variables (pending documentation). 3. Validate connectivity. 4. Complete security review before production.',
    },
    {
      title: '5. Making Calls / API Reference',
      content: 'Available endpoints: Not documented — confirm with system owner. Request/response format: Not documented. Rate limits: Not documented. Known quirks: Not documented — confirm with system owner.',
    },
    {
      title: '6. Security & Policy Protocols',
      content: 'Data classification: Not documented — confirm with system owner. Required compliance review: Not documented. Encryption requirements: Not documented. Audit logging: Required for all production calls.',
    },
    {
      title: '7. Error Handling & Troubleshooting',
      content: 'Common failure modes: Not documented — confirm with system owner. First diagnostic steps: Check connectivity, verify credentials, review audit logs.',
    },
    {
      title: '8. Change Management',
      content: 'Change request process: Not documented — confirm with system owner. Approval chain: Not documented. Typical lead time: Not documented.',
    },
    {
      title: '9. Contacts & Escalation',
      content: 'System owner: Not documented — confirm with system owner. Technical SME: Not documented. Escalation path: Not documented.',
    },
  ];

  if (!hasNotes) {
    unknowns.push('No source material provided — all sections flagged for verification.');
  }

  return {
    sections,
    confidence: hasNotes ? 'Medium — verify with system owner' : 'Verify with owner',
    unknowns,
  };
}

// --- System Upgrade Readiness Checklist generation ---

export async function generateReadinessChecklist(
  upgradeDescription: string
): Promise<{ sections: { title: string; items: string[] }[]; unknowns: string[] }> {
  await new Promise((r) => setTimeout(r, 800));

  const desc = upgradeDescription.toLowerCase();
  const unknowns: string[] = [];

  const sections = [
    {
      title: 'Dependencies',
      items: [
        'Identify all upstream and downstream systems affected by this upgrade.',
        desc.includes('auth') || desc.includes('ldap') || desc.includes('oauth')
          ? 'Audit all services consuming the current auth mechanism.'
          : 'Audit all services consuming the current system.',
        'Confirm library/driver versions are compatible with the target system.',
      ],
    },
    {
      title: 'Rollback Plan',
      items: [
        'Define rollback trigger criteria (e.g., error rate > 2% for 10 minutes).',
        'Document rollback procedure step by step.',
        'Test rollback in staging before production deployment.',
      ],
    },
    {
      title: 'Security Review',
      items: [
        desc.includes('auth') || desc.includes('oauth') || desc.includes('ldap')
          ? 'Review new auth flow for token handling, refresh logic, and scope creep.'
          : 'Review security implications of the upgrade.',
        'Verify encryption-in-transit and at-rest requirements are met.',
        'Confirm audit logging covers the new system.',
      ],
    },
    {
      title: 'Stakeholder Sign-offs',
      items: [
        'Product owner sign-off on functional equivalence.',
        'PM sign-off on timeline and scope.',
        desc.includes('security') || desc.includes('auth')
          ? 'Security team sign-off on the new auth mechanism.'
          : 'Security team sign-off on data handling.',
        'Client sponsor sign-off if production release is involved.',
      ],
    },
    {
      title: 'Testing Scope',
      items: [
        'Unit tests for all new integration points.',
        'Integration tests covering happy path and negative paths.',
        'Regression tests for all downstream consumers.',
        'Load testing if the upgrade changes throughput characteristics.',
      ],
    },
  ];

  if (upgradeDescription.length < 10) {
    unknowns.push('Upgrade description is very short — checklist may be incomplete. Provide more detail for better coverage.');
  }

  return { sections, unknowns };
}

// --- Post-Engagement Case Study generation ---

export async function generateCaseStudy(
  engagementName: string
): Promise<{ title: string; sections: { heading: string; body: string }[] }> {
  await new Promise((r) => setTimeout(r, 800));

  return {
    title: `${engagementName}: Accelerating Delivery Confidence with PrasuFlow AI`,
    sections: [
      {
        heading: 'Executive Summary',
        body: `${engagementName} partnered with Prasunet to improve delivery predictability and client trust across a complex digital transformation engagement. Using PrasuFlow AI's evidence-backed intelligence platform, the team reduced late-change ratio by 13 points and improved requirement clarity from 72% to 79% over the engagement lifecycle.`,
      },
      {
        heading: 'Challenge',
        body: 'The engagement faced fragmented delivery evidence across event logs, requirement registers, change requests, and UAT defect logs. Late changes and scope drift were detected too late, and client approvals frequently breached SOP targets. There was no single source of truth for delivery health.',
      },
      {
        heading: 'Solution',
        body: 'PrasuFlow AI ingested all delivery artifacts into a governed workspace, reconstructed the actual process graph, and generated evidence-backed signals for seven friction types. Every AI suggestion was routed through a human-approval governance layer with risk-tiered escalation.',
      },
      {
        heading: 'Results',
        body: 'Requirement clarity improved from 72% to 79% (Observed). Late-change ratio dropped from 31% to 18% (Modeled). Reopen/rework rate fell from 24% to 14% (Observed). Scope-approval latency improved from 4.8 days to 2.6 days (Client-validated). Traceability completeness rose from 58% to 76% (Directional).',
      },
      {
        heading: 'Client Quote',
        body: '"PrasuFlow gave us something we never had before: a single, evidence-backed view of delivery health that both our team and the client could trust. The governance layer meant AI was always an assistant, never a decision-maker." — Engagement Lead',
      },
    ],
  };
}
