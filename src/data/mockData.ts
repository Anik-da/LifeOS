import type {
  Document,
  Action,
  IntelligenceEvent,
  Workflow,
  DocumentChange,
  CareerApplication,
  SkillGap,
  JobOpportunity,
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
      summary: 'Official notification guidelines for the Higher Education Merit Scholarship Scheme. Eligible students must submit all required academic and financial verification documents prior to the October 15, 2026 deadline.',
      rawText: `MINISTRY OF EDUCATION — HIGHER EDUCATION SCHOLARSHIP SCHEME (2026-2027)

1. OVERVIEW & ELIGIBILITY
The Ministry of Education invites applications for the National Higher Education Merit Scholarship. This program offers financial support of ₹50,000 per academic year to eligible undergraduate and postgraduate students.

2. CRITICAL DEADLINES
• Application Window Opens: 01 September 2026
• Final Submission Deadline: 15 October 2026 (Strict)
• Results Announcement: 30 November 2026

3. MANDATORY DOCUMENTATION REQUIRED
Applicants must provide authentic copies of the following documents:
[X] Secondary School & Higher Secondary Marks Cards (Verified)
[X] Aadhaar Card / Identity Verification
[ ] Annual Family Income Certificate (Issued by competent revenue authority, annual income < ₹8,00,000)

4. APPLICATION COMMITTEE & INQUIRIES
For queries regarding eligibility or document verification, contact:
Dr. Rajesh Kumar (Scholarship Committee Chair)
Email: scholarship.support@gov.in | Phone: +91 11 2345 6789`,
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
    extractedInfo: {
      documentType: 'Scholarship Rules & Terms',
      summary: 'Updated guidelines for merit-cum-means scholarship disbursement, attendance requirements, and renewal terms.',
      rawText: `SCHOLARSHIP DISBURSEMENT & RENEWAL RULES (REVISED v2.0)

1. ATTENDANCE & PERFORMANCE STANDARDS
• Recipients must maintain a minimum of 75% attendance across all academic semesters.
• A minimum Cumulative Grade Point Average (CGPA) of 7.0 is required for annual scholarship renewal.

2. DISBURSEMENT SCHEDULE
• Funds will be credited directly to the student's Aadhaar-linked bank account in two equal installments.
• Installment 1 (₹25,000): November 2026
• Installment 2 (₹25,000): March 2027`,
      importantDates: [
        { label: 'First Installment', date: 'November 2026', priority: 'info' },
        { label: 'Second Installment', date: 'March 2027', priority: 'info' },
      ],
      requirements: [
        { name: 'Aadhaar-linked Bank Account', status: 'complete' },
        { name: 'Minimum 7.0 CGPA', status: 'complete' },
      ],
      amounts: [
        { label: 'Annual Total', value: '₹50,000' },
        { label: 'Per Semester Installment', value: '₹25,000' },
      ],
    },
  },
  {
    id: 'doc-3',
    name: 'Application Requirements.pdf',
    type: 'pdf',
    category: 'education',
    dateAdded: '2026-09-08',
    actionCount: 0,
    thumbnailColor: '#3b82f6',
    extractedInfo: {
      documentType: 'General Application Checklist',
      summary: 'Standard portal registration requirements and file formatting guidelines.',
      rawText: `APPLICATION PORTAL INSTRUCTIONS & FILE FORMAT GUIDELINES

1. FILE UPLOAD SPECIFICATIONS
• All document scans must be uploaded in PDF or JPEG format.
• Maximum file size per attachment: 5 MB.
• Ensure text and seal signatures are clearly legible.`,
      importantDates: [],
      requirements: [
        { name: 'PDF/JPEG Format', status: 'complete' },
        { name: 'Clear Legibility', status: 'complete' },
      ],
    },
  },
  {
    id: 'doc-4',
    name: 'laptop_receipt.jpg',
    type: 'receipt',
    category: 'personal',
    dateAdded: '2026-08-25',
    actionCount: 1,
    thumbnailColor: '#10b981',
    extractedInfo: {
      documentType: 'Tax Invoice / Purchase Receipt',
      summary: 'Purchase receipt for MacBook Air M3 with 1-year limited warranty.',
      rawText: `TECH WORLD RETAIL PVT LTD — TAX INVOICE
Invoice No: TW-2026-88421
Date: 25 August 2026

Item Description: Apple MacBook Air 15" (M3, 16GB RAM, 512GB SSD)
Serial Number: C02G4199Q05P
Amount Paid: ₹1,24,900 (GST Included)
Warranty: 1 Year Manufacturer Warranty (Expires: 25 August 2027)`,
      importantDates: [
        { label: 'Purchase Date', date: '25 August 2026', priority: 'info' },
        { label: 'Warranty Expiry', date: '25 August 2027', priority: 'warning' },
      ],
      amounts: [
        { label: 'Total Purchase Price', value: '₹1,24,900' },
      ],
    },
  },
  {
    id: 'doc-5',
    name: 'Interview_Invite.email',
    type: 'email',
    category: 'career',
    dateAdded: '2026-09-15',
    actionCount: 1,
    thumbnailColor: '#8b5cf6',
    extractedInfo: {
      documentType: 'Interview Invitation Email',
      summary: 'Technical interview invitation from TechCorp for Senior Product Engineer role.',
      rawText: `From: careers@techcorp.io
To: candidate@lifeos.app
Subject: Interview Invitation — Senior Product Engineer

Dear Candidate,

Thank you for your application for the Senior Product Engineer position. We were impressed with your background and would like to invite you for a 45-minute technical discussion with our Engineering Director.

Interview Details:
Date: 22 September 2026
Time: 4:00 PM IST
Format: Google Meet (link attached)

Please confirm your availability by replying to this email by September 19, 2026.`,
      importantDates: [
        { label: 'Confirmation Deadline', date: '19 September 2026', priority: 'urgent' },
        { label: 'Interview Date', date: '22 September 2026', priority: 'urgent' },
      ],
      people: [
        { name: 'TechCorp Hiring Team', role: 'Recruiter' },
      ],
    },
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

export const jobOpportunities: JobOpportunity[] = [
  {
    id: 'job-1',
    title: 'Cloud & Full Stack Engineer (React / AWS)',
    company: 'Stripe',
    location: 'Remote (US / Global / India)',
    workMode: 'Remote',
    type: 'Full-time',
    salary: '$135,000 – $165,000 / yr',
    source: 'LinkedIn',
    sourceUrl: 'https://www.linkedin.com/jobs',
    matchScore: 95,
    matchReason: 'Direct match with React, TypeScript, Cloud APIs, and AWS architecture.',
    postedDate: '2 hours ago',
    skills: ['React', 'TypeScript', 'AWS Lambda', 'DynamoDB', 'Node.js'],
    description: 'Build developer-first financial infrastructure with high scalability, zero downtime, and top-tier security standards.',
  },
  {
    id: 'job-2',
    title: 'Backend & AI Systems Engineer',
    company: 'Datadog',
    location: 'Bangalore / Remote',
    workMode: 'Hybrid',
    type: 'Full-time',
    salary: '₹28,00,000 – ₹38,00,000 / yr',
    source: 'Indeed',
    sourceUrl: 'https://www.indeed.com',
    matchScore: 91,
    matchReason: 'Matches your Python, microservices, and observability telemetry background.',
    postedDate: '5 hours ago',
    skills: ['Python', 'FastAPI', 'AWS Bedrock', 'Docker', 'PostgreSQL'],
    description: 'Scale real-time telemetry processing pipelines and integrate Generative AI assistants into production observability workloads.',
  },
  {
    id: 'job-3',
    title: 'Frontend Engineer (React / Next.js)',
    company: 'Vercel',
    location: 'Remote',
    workMode: 'Remote',
    type: 'Full-time',
    salary: '$120,000 – $150,000 / yr',
    source: 'Wellfound',
    sourceUrl: 'https://wellfound.com',
    matchScore: 89,
    matchReason: 'Perfect fit for modern UI component libraries, TailwindCSS, and state management.',
    postedDate: '1 day ago',
    skills: ['React', 'Next.js', 'TailwindCSS', 'TypeScript', 'Web Performance'],
    description: 'Create hyper-responsive user interfaces and developer tools that empower the global web ecosystem.',
  },
  {
    id: 'job-4',
    title: 'Associate Cloud Solutions Architect',
    company: 'Amazon Web Services (AWS)',
    location: 'Hyderabad / Remote',
    workMode: 'Hybrid',
    type: 'Full-time',
    salary: '₹22,00,000 – ₹32,00,000 / yr',
    source: 'LinkedIn',
    sourceUrl: 'https://www.linkedin.com/jobs',
    matchScore: 87,
    matchReason: 'Strong alignment with your AWS S3, DynamoDB, Bedrock, and Cognito cloud credentials.',
    postedDate: '1 day ago',
    skills: ['AWS Cloud', 'Serverless', 'System Architecture', 'DynamoDB', 'Security'],
    description: 'Partner with enterprise and high-growth startup engineering teams to design and implement cloud-native architectures.',
  },
  {
    id: 'job-5',
    title: 'Software Engineering Intern (Summer / Fall 2026)',
    company: 'Google',
    location: 'Remote / Bangalore / Mountain View',
    workMode: 'Hybrid',
    type: 'Internship',
    salary: '$52 – $65 / hr (₹1,20,000 / mo)',
    source: 'Glassdoor',
    sourceUrl: 'https://www.glassdoor.com',
    matchScore: 93,
    matchReason: 'Matches your core CS fundamentals, algorithms, and full-stack project portfolio.',
    postedDate: '2 days ago',
    skills: ['Data Structures', 'Python', 'Algorithms', 'Distributed Systems'],
    description: 'Work alongside world-class engineering teams building innovative products used by billions of people globally.',
  },
  {
    id: 'job-6',
    title: 'DevOps & Platform Engineer',
    company: 'GitHub',
    location: 'Remote',
    workMode: 'Remote',
    type: 'Full-time',
    salary: '$130,000 – $160,000 / yr',
    source: 'RemoteOK',
    sourceUrl: 'https://remoteok.com',
    matchScore: 85,
    matchReason: 'High relevance for CI/CD automation, Terraform, and cloud pipeline security.',
    postedDate: '3 days ago',
    skills: ['GitHub Actions', 'Docker', 'Kubernetes', 'AWS', 'Terraform'],
    description: 'Build the automated platform, CI/CD pipelines, and infrastructure that power millions of developers every day.',
  },
];

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
