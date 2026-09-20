export type Priority = 'urgent' | 'warning' | 'info' | 'success';
export type ActionStatus = 'pending' | 'in_progress' | 'completed';
export type WorkflowStageStatus = 'complete' | 'in_progress' | 'waiting' | 'needs_action';
export type DocumentType = 'pdf' | 'image' | 'receipt' | 'certificate' | 'email';
export type DocumentCategory = 'education' | 'finance' | 'career' | 'legal' | 'medical' | 'personal';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ImportantDate {
  label: string;
  date: string;
  priority?: Priority;
  page?: number;
}

export interface DocRequirement {
  name: string;
  status: 'complete' | 'missing';
  page?: number;
}

export interface ExtractedInfo {
  documentType: string;
  title?: string;
  summary?: string;
  keyFacts?: { label: string; value: string; page?: number; evidence?: string }[];
  importantDates: (ImportantDate & { evidence?: string; section?: string })[];
  deadlines?: (ImportantDate & { evidence?: string; section?: string })[];
  requirements: (DocRequirement & { evidence?: string; section?: string })[];
  organizations?: { name: string; role?: string; page?: number; section?: string; evidence?: string }[];
  people: { name: string; role: string; page?: number; section?: string; evidence?: string }[];
  amounts: { label: string; value: string; page?: number; section?: string; evidence?: string }[];
  contactInformation?: { label: string; value: string; page?: number; evidence?: string }[];
  actions: string[];
  importantTerms?: string[];
  entities?: { name: string; category: string; page?: number }[];
  risks?: { label: string; severity: 'high' | 'medium' | 'low'; description: string; page?: number; section?: string; evidence?: string }[];
  warnings?: { label: string; severity?: 'high' | 'medium' | 'low'; description?: string; page?: number; evidence?: string }[];
  missingInformation?: string[];
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence?: { fact?: string; page?: number; sourceText?: string; text?: string }[];
  relatedDocuments: { id: string; name: string }[];
  isSyntheticDemo?: boolean;
  rawText?: string;
  pagesText?: { pageNumber: number; text: string }[];
}

export interface DocumentItem {
  userId: string;
  id: string;
  name: string;
  type: DocumentType;
  category: DocumentCategory;
  dateAdded: string;
  actionCount: number;
  extractedInfo?: ExtractedInfo;
  thumbnailColor: string;
  s3Key: string;
  status: 'processing' | 'ready' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export type ReminderStatus = 'SCHEDULED' | 'SENT' | 'SKIPPED' | 'CANCELLED' | 'FAILED';

export interface ActionItem {
  userId: string;
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
  createdAt: string;
  reminderEnabled?: boolean;
  reminderAt?: string;
  reminderScheduleId?: string;
  reminderStatus?: ReminderStatus;
  reminderSentAt?: string;
  reminderError?: string;
}

export interface IntelligenceEventItem {
  userId: string;
  id: string;
  title: string;
  description: string;
  source: string;
  sourceType: DocumentType;
  timestamp: string;
  priority?: Priority;
  pageLink?: string;
}

export interface WorkflowItem {
  userId: string;
  id: string;
  name: string;
  description: string;
  stages: { id: string; name: string; status: WorkflowStageStatus; description?: string }[];
  currentStageId: string;
  sourceEvidence: string[];
  createdAt: string;
}

export interface ChangeItemDetail {
  id: string;
  type: 'deadline' | 'requirement' | 'eligibility' | 'amount' | 'other';
  label: string;
  oldValue: string;
  newValue: string;
  priority: Priority;
  whyItMatters: string;
  sourcePages?: number[];
}

export interface ChangeItem {
  userId: string;
  id: string;
  documentName: string;
  version1: string;
  version2: string;
  summary: string;
  changes: ChangeItemDetail[];
  createdAt: string;
}

export interface CareerApplicationItem {
  userId: string;
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

export interface SkillGapItem {
  userId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  yourSkills: SkillItem[];
  jobRequirements: SkillItem[];
  gapDetected: boolean;
}

export interface ScholarshipMatchItem {
  userId: string;
  id: string;
  name: string;
  deadline: string;
  amount: string;
  matchedInfo: string[];
  missingInfo: string[];
  matchStatus: 'potential' | 'strong' | 'weak';
}

export interface ExpenseItem {
  userId: string;
  id: string;
  description: string;
  amount: string;
  date: string;
  category: string;
  source: string;
}

export interface ScamCheckItem {
  userId: string;
  id: string;
  inputType: 'message' | 'email' | 'screenshot' | 'website';
  riskIndicators: { id: string; label: string; severity: 'high' | 'medium' | 'low'; description: string }[];
  verificationSteps: { id: string; step: string }[];
  summary: string;
  createdAt: string;
}

export interface NotificationItem {
  userId: string;
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: Priority;
  link: string;
}

export interface PublicSourceReference {
  title: string;
  url: string;
  domain: string;
  sourceType: 'Official Portal' | 'Government' | 'Public Documentation' | 'Web Result';
  retrievedAt: string;
  snippet?: string;
}

export interface AIAnswerResult {
  question: string;
  answer: string;
  why?: string[];
  extractedInfo?: string[];
  sources: { id: string; name: string; type: DocumentType; page?: string }[];
  publicSources?: PublicSourceReference[];
  connectedInsight?: string;
  suggestedAction?: string;
  actionLink?: string;
}
