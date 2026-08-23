import { describe, expect, it } from 'vitest';
import { changeRequests, kpis, meetingNotes, requirements, signals, uatDefects } from './data';
import { collectEvidence, getEvidenceForSignal, runDetectionEngine } from './engine';

const context = { requirements, uatDefects, changeRequests, meetingNotes, kpis, signals };

describe('intelligence engine', () => {
  it('collects traceable evidence from every source type', () => {
    const evidence = collectEvidence(context);
    const sourceTypes = new Set(evidence.map((item) => item.sourceType));
    expect(sourceTypes).toEqual(new Set(['requirement', 'uat_defect', 'change_request', 'meeting_note', 'kpi']));
    expect(evidence.length).toBe(requirements.length + uatDefects.length + changeRequests.length + meetingNotes.length + kpis.length);
  });

  it('detects missing acceptance criteria and recurring defects', () => {
    const result = runDetectionEngine(context);
    expect(result.ruleCount).toBe(7);
    expect(result.signals.some((signal) => signal.caseId.startsWith('REQ-172') && signal.type === 'Requirement quality')).toBe(true);
    expect(result.signals.some((signal) => signal.caseId.startsWith('DEF-044') && signal.type === 'Rework')).toBe(true);
  });

  it('keeps evidence linked to a detected signal', () => {
    const result = runDetectionEngine(context);
    const signal = result.signals.find((item) => item.caseId.startsWith('REQ-172'));
    expect(signal).toBeDefined();
    expect(getEvidenceForSignal(signal!, result.evidence).some((item) => item.source.includes('REQ-172'))).toBe(true);
  });

  it('flags pending change requests as SLA breaches', () => {
    const result = runDetectionEngine(context);
    const slaSignals = result.signals.filter((signal) => signal.type === 'SLA breach');
    expect(slaSignals.length).toBeGreaterThan(0);
    expect(slaSignals.every((signal) => signal.source.includes('SOP-04'))).toBe(true);
  });
});
