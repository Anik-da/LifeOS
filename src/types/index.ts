// ============= Core Types =============

export type Priority = 'urgent' | 'warning' | 'info' | 'success';
export type ActionStatus = 'pending' | 'in_progress' | 'completed';
export type WorkflowStageStatus = 'complete' | 'in_progress' | 'waiting' | 'needs_action';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

// ============= Documents =============

export type DocumentType = 'pdf' | 'image' | 'receipt' | 'certificate' | 'email';
export type DocumentCategory = 'education' | 'finance' | 'career' | 'legal' | 'medical' | 'personal';

export interface DocRequirement {
  name: string;
  status: 'complete' | 'missing';
}

export interface ImportantDate {
  label: string;
  date: string;
  priority?: Priority;
}

export interface ExtractedInfo {
  documentType: string;
  importantDates: ImportantDate[];
  requirements: DocRequirement[];
  people: { name: string; role: string }[];
  amounts: { label: string; value: string }[];
  actions: string[];
  relatedDocuments: { id: string; name: string }[];
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  category: DocumentCategory;
  dateAdded: string;
  actionCount: number;
  extractedInfo?: ExtractedInfo;
  thumbnailColor: string;
}

// ============= Actions =============

export interface Action {
  id: string;
  title: string;
  description: string;
  source: string;
  sourceId: string;
  deadline: string;
  daysLeft: number;
  priority: Priority;
  status: ActionStatus;
  relatedDocuments: string[];
}

// ============= Intelligence / Timeline =============

export interface IntelligenceEvent {
  id: string;
  title: string;
  description: string;
  source: string;
  sourceType: 'pdf' | 'email' | 'image' | 'receipt';
  timestamp: string;
  priority?: Priority;
  pageLink?: string;
}

// ============= Workflow =============

export interface WorkflowStage {
  id: string;
  name: string;
  status: WorkflowStageStatus;
  description?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  stages: WorkflowStage[];
  currentStageId: string;
  sourceEvidence: string[];
}

// ============= Changes =============

export type ChangeType = 'deadline' | 'requirement' | 'eligibility' | 'amount' | 'other';

export interface ChangeItem {
  id: string;
  type: ChangeType;
  label: string;
  oldValue: string;
  newValue: string;
  priority: Priority;
  whyItMatters: string;
}

export interface DocumentChange {
  id: string;
  documentName: string;
  version1: string;
  version2: string;
  changes: ChangeItem[];
  summary: string;
}

// ============= Career =============

export interface CareerApplication {
  id: string;
  company: string;
  role: string;
  appliedDate: string;
  currentStatus: string;
  stageIndex: number;
  stages: { name: string; status: 'complete' | 'current' | 'pending' }[];
  lastEmailDetected?: string;
}

export interface SkillItem {
  name: string;
  status: 'have' | 'partial' | 'missing';
}

export interface SkillGap {
  jobId: string;
  jobTitle: string;
  company: string;
  yourSkills: SkillItem[];
  jobRequirements: SkillItem[];
  gapDetected: boolean;
}

// ============= Finance =============

export interface ScholarshipMatch {
  id: string;
  name: string;
  deadline: string;
  amount: string;
  matchedInfo: string[];
  missingInfo: string[];
  matchStatus: 'potential' | 'strong' | 'weak';
}

export interface ExpenseItem {
  id: string;
  description: string;
  amount: string;
  date: string;
  category: string;
  source: string;
}

// ============= Security =============

export interface RiskIndicator {
  id: string;
  label: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

export interface VerificationStep {
  id: string;
  step: string;
}

export interface ScamCheckResult {
  inputType: 'message' | 'email' | 'screenshot' | 'website';
  riskIndicators: RiskIndicator[];
  verificationSteps: VerificationStep[];
  summary: string;
}

// ============= Notifications =============

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: Priority;
  link: string;
}

// ============= Knowledge Graph =============

export interface GraphNode {
  id: string;
  label: string;
  type: 'document' | 'person' | 'organization' | 'deadline' | 'application' | 'action';
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ============= AI Search =============

export interface SourceReference {
  id: string;
  name: string;
  type: DocumentType;
  page?: string;
}

export interface AIAnswer {
  question: string;
  answer: string;
  extractedInfo?: string[];
  sources: SourceReference[];
  suggestedAction?: string;
  actionLink?: string;
}

// ============= Metrics =============

export interface Metric {
  id: string;
  label: string;
  value: string;
  sublabel: string;
  icon: string;
  link: string;
  accent: Priority;
}
