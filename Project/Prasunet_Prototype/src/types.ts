export type Screen =
  | 'overview'
  | 'intelligence'
  | 'portfolio'
  | 'blueprint'
  | 'value'
  | 'governance'
  | 'setup'
  | 'map'
  | 'meeting'
  | 'legacy'
  | 'impact'
  | 'readiness'
  | 'casestudy'
  | 'heatmap'
  | 'team';

export type Risk = 'Low' | 'Medium' | 'High' | 'Critical';

export type Signal = {
  id: string;
  type: string;
  title: string;
  caseId: string;
  confidence: number;
  materiality: string;
  risk: Risk;
  evidence: string;
  action: string;
  source: string;
  approved: boolean;
  approvedBy?: string;
};

export type Engagement = {
  name: string;
  code: string;
  phase: string;
  score: number;
  status: string;
  initials: string;
  color: string;
  startDate: string;
};

export type Requirement = {
  id: string;
  text: string;
  source: string;
  hasAcceptanceCriteria: boolean;
  owner: string;
  linkedStory: string;
  version: number;
  clarityScore: number;
  engagement: string;
};

export type ChangeRequest = {
  id: string;
  description: string;
  linkedRequirement: string;
  status: string;
  riskTier: Risk;
  hoursEstimate: number;
  approvalStatus: string;
  approver: string;
  engagement: string;
};

export type UATDefect = {
  id: string;
  description: string;
  linkedRequirement: string;
  recurrence: boolean;
  rootCauseHypothesis: string;
  engagement: string;
};

export type MeetingNote = {
  id: string;
  rawText: string;
  date: string;
  attendees: string[];
  engagement: string;
};

export type LegacySystem = {
  name: string;
  type: string;
  team: string;
  criticality: string;
  description: string;
  owner: string;
  lastUpdate: string;
  authMethod: string;
  environments: string[];
  endpoints: string[];
  dataClassification: string;
  quirks: string[];
  version: number;
  sourceMaterials: string[];
  generatedDate: string;
  confidence: string;
};

export type KPI = {
  name: string;
  baseline: string;
  target: string;
  observed: string;
  status: 'Observed' | 'Modeled' | 'Directional' | 'Client-validated' | 'Finance-validated' | 'Gap';
  movement: string;
  formula: string;
  better: string;
};

export type AuditEntry = {
  id: string;
  suggestion: string;
  riskTier: Risk;
  decision: 'Approved' | 'Rejected' | 'Modified' | 'Pending';
  by: string;
  timestamp: string;
  engagement: string;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: string;
};

export type Notification = {
  id: string;
  type: 'signal' | 'approval' | 'sla' | 'digest';
  title: string;
  detail: string;
  time: string;
  read: boolean;
};
