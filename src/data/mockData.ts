import type {
  Document,
  Action,
  IntelligenceEvent,
  Workflow,
  DocumentChange,
  CareerApplication,
  SkillGap,
  ScholarshipMatch,
  ExpenseItem,
  Notification,
  KnowledgeGraph,
  AIAnswer,
  Metric,
} from '@/types';

export const metrics: Metric[] = [
  { id: 'knowledge', label: 'Knowledge', value: '128', sublabel: 'sources', icon: 'BookOpen', link: '/knowledge', accent: 'info' },
  { id: 'actions', label: 'Actions', value: '7', sublabel: 'requiring attention', icon: 'Zap', link: '/actions', accent: 'urgent' },
  { id: 'processes', label: 'Processes', value: '3', sublabel: 'active', icon: 'GitBranch', link: '/workflows', accent: 'warning' },
  { id: 'changes', label: 'Changes', value: '2', sublabel: 'new changes', icon: 'RefreshCw', link: '/changes', accent: 'info' },
];

export const documents: Document[] = [
  {
    id: 'doc-1',
    name: 'Scholarship_Requirements.pdf',
    type: 'pdf',
    category: 'education',
    dateAdded: '2026-09-10',
    actionCount: 2,
    thumbnailColor: '#ef4444',
    extractedInfo: {
      documentType: 'Scholarship Application Requirements',
      importantDates: [
        { label: 'Application deadline', date: '15 October 2026', priority: 'urgent' },
        { label: 'Results announcement', date: '30 November 2026', priority: 'info' },
      ],
      requirements: [
        { name: 'Marks card', status: 'complete' },
        { name: 'Aadhaar card', status: 'complete' },
        { name: 'Income certificate', status: 'missing' },
      ],
      people: [
        { name: 'Dr. Rajesh Kumar', role: 'Scholarship Committee Chair' },
        { name: 'Ministry of Education', role: 'Issuing authority' },
      ],
      amounts: [
        { label: 'Scholarship amount', value: '₹50,000/year' },
        { label: 'Application fee', value: '₹0 (free)' },
      ],
      actions: ['Obtain income certificate', 'Submit application before deadline'],
      relatedDocuments: [
        { id: 'doc-2', name: 'Scholarship Rules v2.pdf' },
        { id: 'doc-3', name: 'Application Requirements.pdf' },
      ],
    },
  },
  {
    id: 'doc-2',
    name: 'Scholarship Rules v2.pdf',
    type: 'pdf',
    category: 'education',
    dateAdded: '2026-09-12',
    actionCount: 1,
    thumbnailColor: '#f59e0b',
  },
  {
    id: 'doc-3',
    name: 'Application Requirements.pdf',
    type: 'pdf',
    category: 'education',
    dateAdded: '2026-09-08',
    actionCount: 0,
    thumbnailColor: '#3b82f6',
  },
  {
    id: 'doc-4',
    name: 'laptop_receipt.jpg',
    type: 'receipt',
    category: 'personal',
    dateAdded: '2026-08-25',
    actionCount: 1,
    thumbnailColor: '#10b981',
  },
  {
    id: 'doc-5',
    name: 'Interview_Invite.email',
    type: 'email',
    category: 'career',
    dateAdded: '2026-09-15',
    actionCount: 1,
    thumbnailColor: '#8b5cf6',
  },
];

export const actions: Action[] = [
  {
    id: 'act-1',
    title: 'Obtain income certificate',
    description: 'Required for scholarship application. Visit your local revenue office or apply online.',
    source: 'Scholarship Requirements.pdf',
    sourceId: 'doc-1',
    deadline: '2026-09-20',
    daysLeft: 3,
    priority: 'urgent',
    status: 'pending',
    relatedDocuments: ['doc-1', 'doc-3'],
  },
  {
    id: 'act-2',
    title: 'Laptop warranty expires soon',
    description: 'Your laptop warranty expires in 23 days. Consider extending coverage.',
    source: 'laptop_receipt.jpg',
    sourceId: 'doc-4',
    deadline: '2026-10-10',
    daysLeft: 23,
    priority: 'warning',
    status: 'pending',
    relatedDocuments: ['doc-4'],
  },
  {
    id: 'act-3',
    title: 'Respond to interview invitation',
    description: 'Interview invitation detected from email. Confirm your availability.',
    source: 'Interview_Invite.email',
    sourceId: 'doc-5',
    deadline: '2026-09-19',
    daysLeft: 2,
    priority: 'warning',
    status: 'pending',
    relatedDocuments: ['doc-5'],
  },
  {
    id: 'act-4',
    title: 'Submit scholarship application',
    description: 'All required documents must be uploaded before the deadline.',
    source: 'Scholarship Requirements.pdf',
    sourceId: 'doc-1',
    deadline: '2026-10-15',
    daysLeft: 28,
    priority: 'info',
    status: 'pending',
    relatedDocuments: ['doc-1', 'doc-2', 'doc-3'],
  },
  {
    id: 'act-5',
    title: 'Update resume with latest project',
    description: 'Resume was last updated 2 months ago. Add recent work experience.',
    source: 'System suggestion',
    sourceId: '',
    deadline: '2026-09-25',
    daysLeft: 8,
    priority: 'info',
    status: 'completed',
    relatedDocuments: [],
  },
];

export const intelligenceEvents: IntelligenceEvent[] = [
  {
    id: 'evt-1',
    title: 'Scholarship deadline changed',
    description: 'Application deadline moved from 30 June to 15 October 2026',
    source: 'Scholarship Rules v2.pdf',
    sourceType: 'pdf',
    timestamp: '2026-09-17T14:30:00',
    priority: 'urgent',
    pageLink: '/changes',
  },
  {
    id: 'evt-2',
    title: 'Interview invitation detected',
    description: 'New email from TechCorp contains an interview invitation for Software Engineer Intern',
    source: 'Interview_Invite.email',
    sourceType: 'email',
    timestamp: '2026-09-16T10:15:00',
    priority: 'warning',
    pageLink: '/career',
  },
  {
    id: 'evt-3',
    title: 'Warranty information extracted',
    description: 'Laptop warranty details detected from receipt. Expires 10 October 2026.',
    source: 'laptop_receipt.jpg',
    sourceType: 'receipt',
    timestamp: '2026-09-15T09:00:00',
    priority: 'warning',
    pageLink: '/documents',
  },
  {
    id: 'evt-4',
    title: 'Income certificate requirement detected',
    description: 'New required document identified from Scholarship Requirements',
    source: 'Scholarship_Requirements.pdf',
    sourceType: 'pdf',
    timestamp: '2026-09-14T16:45:00',
    priority: 'urgent',
    pageLink: '/actions',
  },
  {
    id: 'evt-5',
    title: 'Application documents verified complete',
    description: 'Marks card and Aadhaar verified for scholarship application',
    source: 'Application Requirements.pdf',
    sourceType: 'pdf',
    timestamp: '2026-09-13T11:20:00',
    priority: 'success',
    pageLink: '/documents',
  },
];

export const workflow: Workflow = {
  id: 'wf-1',
  name: 'Scholarship Application',
  description: 'National Merit Scholarship 2026 application process',
  currentStageId: 'stage-3',
  sourceEvidence: ['Scholarship_Requirements.pdf', 'Scholarship Rules v2.pdf'],
  stages: [
    { id: 'stage-1', name: 'Eligibility', status: 'complete', description: 'Eligibility criteria verified' },
    { id: 'stage-2', name: 'Documents', status: 'in_progress', description: '2 of 3 documents collected' },
    { id: 'stage-3', name: 'Application', status: 'waiting', description: 'Waiting for income certificate' },
    { id: 'stage-4', name: 'College Verification', status: 'waiting', description: 'Waiting for institution verification' },
    { id: 'stage-5', name: 'Government Verification', status: 'waiting' },
    { id: 'stage-6', name: 'Bank', status: 'waiting', description: 'Disbursement to registered bank account' },
  ],
};

export const documentChange: DocumentChange = {
  id: 'chg-1',
  documentName: 'Scholarship Rules',
  version1: 'v1 (March 2026)',
  version2: 'v2 (September 2026)',
  summary: '3 important changes detected between versions',
  changes: [
    {
      id: 'c-1',
      type: 'deadline',
      label: 'Deadline',
      oldValue: '30 June 2026',
      newValue: '15 October 2026',
      priority: 'urgent',
      whyItMatters: 'The deadline has been extended by over 3 months, giving you more time to gather the income certificate. However, the new deadline is still firm — missing it means waiting until next year.',
    },
    {
      id: 'c-2',
      type: 'requirement',
      label: 'Required document',
      oldValue: 'Not required',
      newValue: 'Income certificate added',
      priority: 'warning',
      whyItMatters: 'A new mandatory document has been added. You must obtain an income certificate from your local revenue office before submitting the application. This typically takes 7-14 days.',
    },
    {
      id: 'c-3',
      type: 'eligibility',
      label: 'Eligibility',
      oldValue: 'Minimum 60% marks',
      newValue: 'Minimum 65% marks',
      priority: 'warning',
      whyItMatters: 'The minimum marks requirement has increased. Verify your marks card meets the new 65% threshold before applying.',
    },
  ],
};

export const careerApplications: CareerApplication[] = [
  {
    id: 'ca-1',
    company: 'TechCorp',
    role: 'Software Engineer Intern',
    appliedDate: '2026-09-01',
    currentStatus: 'Interview invitation received',
    stageIndex: 2,
    stages: [
      { name: 'Applied', status: 'complete' },
      { name: 'Assessment', status: 'complete' },
      { name: 'Interview', status: 'current' },
      { name: 'Decision', status: 'pending' },
    ],
    lastEmailDetected: 'Interview invitation — 16 September 2026',
  },
  {
    id: 'ca-2',
    company: 'DataSync',
    role: 'Backend Developer',
    appliedDate: '2026-08-20',
    currentStatus: 'Assessment completed',
    stageIndex: 1,
    stages: [
      { name: 'Applied', status: 'complete' },
      { name: 'Assessment', status: 'complete' },
      { name: 'Interview', status: 'pending' },
      { name: 'Decision', status: 'pending' },
    ],
    lastEmailDetected: 'Assessment results pending — 12 September 2026',
  },
];

export const skillGap: SkillGap = {
  jobId: 'ca-1',
  jobTitle: 'Software Engineer Intern',
  company: 'TechCorp',
  yourSkills: [
    { name: 'Python', status: 'have' },
    { name: 'SQL', status: 'have' },
    { name: 'AWS', status: 'partial' },
    { name: 'Docker', status: 'missing' },
    { name: 'React', status: 'have' },
    { name: 'System Design', status: 'partial' },
  ],
  jobRequirements: [
    { name: 'Python', status: 'have' },
    { name: 'SQL', status: 'have' },
    { name: 'AWS', status: 'partial' },
    { name: 'Docker', status: 'missing' },
    { name: 'React', status: 'have' },
    { name: 'System Design', status: 'missing' },
  ],
  gapDetected: true,
};

export const scholarshipMatches: ScholarshipMatch[] = [
  {
    id: 'sm-1',
    name: 'National Merit Scholarship 2026',
    deadline: '15 October 2026',
    amount: '₹50,000/year',
    matchedInfo: ['Course: B.Tech Computer Science', 'Academic requirement: 65% marks (met)'],
    missingInfo: ['Income certificate needed'],
    matchStatus: 'potential',
  },
  {
    id: 'sm-2',
    name: 'Tech Excellence Grant',
    deadline: '30 November 2026',
    amount: '₹25,000',
    matchedInfo: ['Field: Technology', 'Enrollment: Verified'],
    missingInfo: ['Project portfolio required', 'Recommendation letter'],
    matchStatus: 'weak',
  },
];

export const expenses: ExpenseItem[] = [
  { id: 'e-1', description: 'Laptop purchase', amount: '₹65,000', date: '2026-08-25', category: 'Electronics', source: 'laptop_receipt.jpg' },
  { id: 'e-2', description: 'Application fee waiver', amount: '₹0', date: '2026-09-10', category: 'Education', source: 'Scholarship_Requirements.pdf' },
  { id: 'e-3', description: 'College tuition', amount: '₹1,20,000', date: '2026-07-15', category: 'Education', source: 'tuition_receipt.pdf' },
];

export const notifications: Notification[] = [
  {
    id: 'n-1',
    title: 'Scholarship deadline changed',
    description: 'Application deadline moved from 30 June to 15 October',
    timestamp: '2026-09-17T14:30:00',
    read: false,
    type: 'urgent',
    link: '/changes',
  },
  {
    id: 'n-2',
    title: 'New interview email detected',
    description: 'TechCorp sent an interview invitation',
    timestamp: '2026-09-16T10:15:00',
    read: false,
    type: 'warning',
    link: '/career',
  },
  {
    id: 'n-3',
    title: 'Warranty expires soon',
    description: 'Your laptop warranty expires in 23 days',
    timestamp: '2026-09-15T09:00:00',
    read: false,
    type: 'warning',
    link: '/documents',
  },
  {
    id: 'n-4',
    title: 'New document requirement detected',
    description: 'Income certificate required for scholarship',
    timestamp: '2026-09-14T16:45:00',
    read: true,
    type: 'urgent',
    link: '/actions',
  },
];

export const knowledgeGraph: KnowledgeGraph = {
  nodes: [
    { id: 'n1', label: 'Scholarship.pdf', type: 'document', x: 50, y: 50 },
    { id: 'n2', label: 'Scholarship Application', type: 'application', x: 50, y: 150 },
    { id: 'n3', label: 'Income Certificate', type: 'document', x: 50, y: 250 },
    { id: 'n4', label: 'Deadline: 15 Oct', type: 'deadline', x: 50, y: 350 },
    { id: 'n5', label: 'Obtain certificate', type: 'action', x: 50, y: 450 },
    { id: 'n6', label: 'Ministry of Education', type: 'organization', x: 200, y: 100 },
    { id: 'n7', label: 'Dr. Rajesh Kumar', type: 'person', x: 200, y: 200 },
    { id: 'n8', label: 'Interview Email', type: 'document', x: 200, y: 300 },
    { id: 'n9', label: 'TechCorp', type: 'organization', x: 200, y: 400 },
  ],
  edges: [
    { from: 'n1', to: 'n2' },
    { from: 'n2', to: 'n3' },
    { from: 'n2', to: 'n4' },
    { from: 'n4', to: 'n5' },
    { from: 'n1', to: 'n6' },
    { from: 'n1', to: 'n7' },
    { from: 'n8', to: 'n9' },
  ],
};

export const aiAnswers: Record<string, AIAnswer> = {
  default: {
    question: '',
    answer: 'You need an income certificate and marks card for this application. The income certificate must be obtained from your local revenue office, and your marks card should show a minimum of 65% to meet the updated eligibility criteria.',
    extractedInfo: [
      'Required documents: Marks card, Aadhaar, Income certificate',
      'Minimum marks: 65% (updated from 60%)',
      'Application deadline: 15 October 2026',
    ],
    sources: [
      { id: 'doc-1', name: 'Scholarship Rules.pdf', type: 'pdf' },
      { id: 'doc-3', name: 'Application Requirements.pdf', type: 'pdf' },
    ],
    suggestedAction: 'Obtain income certificate before deadline',
    actionLink: '/actions',
  },
};

export const aiSuggestions: string[] = [
  'What documents do I need for my scholarship?',
  'What changed in the latest scholarship rules?',
  'Which applications are waiting for a response?',
  'When does my laptop warranty expire?',
  'Where did I see the income requirement?',
];
