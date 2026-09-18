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
  ScamCheckResult,
} from '@/types';
import {
  documents,
  actions,
  intelligenceEvents,
  workflow,
  documentChange,
  careerApplications,
  skillGap,
  scholarshipMatches,
  expenses,
  notifications,
  knowledgeGraph,
  aiAnswers,
  metrics,
} from '@/data/mockData';

/**
 * API service layer — all data access goes through here.
 * Currently returns mock data; designed to be swapped with real API calls
 * (Amazon API Gateway + Lambda + DynamoDB) without changing component code.
 */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const api = {
  auth: {
    async login(email: string, _password: string) {
      await delay(800);
      // Placeholder for Cognito integration
      if (!email || !email.includes('@')) throw new Error('Please enter a valid email address');
      return { id: 'user-1', email, name: email.split('@')[0] };
    },
    async signup(email: string, _password: string, name: string) {
      await delay(800);
      if (!email || !email.includes('@')) throw new Error('Please enter a valid email address');
      if (!name) throw new Error('Please enter your name');
      return { id: 'user-1', email, name };
    },
    async googleSignIn() {
      await delay(800);
      return { id: 'user-1', email: 'demo@lifeos.app', name: 'Demo User' };
    },
  },

  dashboard: {
    async getMetrics(): Promise<Metric[]> {
      await delay(300);
      return metrics;
    },
    async getRecentEvents(): Promise<IntelligenceEvent[]> {
      await delay(300);
      return intelligenceEvents;
    },
    async getActions(): Promise<Action[]> {
      await delay(300);
      return actions;
    },
  },

  documents: {
    async getAll(): Promise<Document[]> {
      await delay(400);
      return documents;
    },
    async getById(id: string): Promise<Document | undefined> {
      await delay(300);
      return documents.find((d) => d.id === id);
    },
    async upload(_file: { name: string; type: string }): Promise<Document> {
      await delay(1000);
      // Placeholder for S3 + Textract pipeline
      return {
        id: `doc-${Date.now()}`,
        name: _file.name,
        type: 'pdf',
        category: 'personal',
        dateAdded: new Date().toISOString().split('T')[0],
        actionCount: 0,
        thumbnailColor: '#3b82f6',
      };
    },
  },

  actions: {
    async getAll(): Promise<Action[]> {
      await delay(400);
      return actions;
    },
    async markComplete(id: string): Promise<void> {
      await delay(300);
      const a = actions.find((x) => x.id === id);
      if (a) a.status = 'completed';
    },
  },

  workflows: {
    async getAll(): Promise<Workflow[]> {
      await delay(400);
      return [workflow];
    },
  },

  changes: {
    async getAll(): Promise<DocumentChange[]> {
      await delay(400);
      return [documentChange];
    },
  },

  career: {
    async getApplications(): Promise<CareerApplication[]> {
      await delay(400);
      return careerApplications;
    },
    async getSkillGap(): Promise<SkillGap> {
      await delay(400);
      return skillGap;
    },
  },

  finance: {
    async getScholarships(): Promise<ScholarshipMatch[]> {
      await delay(400);
      return scholarshipMatches;
    },
    async getExpenses(): Promise<ExpenseItem[]> {
      await delay(400);
      return expenses;
    },
  },

  security: {
    async checkInput(input: string, inputType: 'message' | 'email' | 'screenshot' | 'website'): Promise<ScamCheckResult> {
      await delay(1500);
      // Evidence-based risk indicator detection (placeholder for Bedrock analysis)
      const indicators = [];
      const lower = input.toLowerCase();
      if (/urgent|immediately|right now|act now|expires? (today|in \d+)/.test(lower))
        indicators.push({ id: 'r1', label: 'Urgency language', severity: 'medium' as const, description: 'The message uses pressure tactics to force immediate action.' });
      if (/payment|pay|transfer|send money|wire|bitcoin|crypto|bank details|account number/.test(lower))
        indicators.push({ id: 'r2', label: 'Payment request', severity: 'high' as const, description: 'The message requests financial transactions or banking information.' });
      if (/otp|password|pin|ssn|social security|aadhaar|pan card/.test(lower))
        indicators.push({ id: 'r3', label: 'Sensitive information request', severity: 'high' as const, description: 'The message asks for sensitive personal or financial information.' });
      if (/click (here|the link)|bit\.ly|tinyurl|shorte\.st/.test(lower))
        indicators.push({ id: 'r4', label: 'Suspicious link', severity: 'medium' as const, description: 'The message contains shortened or unverifiable links.' });
      if (/winner|lottery|prize|selected|congratulations|free gift/.test(lower))
        indicators.push({ id: 'r5', label: 'Too-good-to-be-true offer', severity: 'medium' as const, description: 'The message promises rewards or prizes that seem unrealistic.' });
      if (indicators.length === 0)
        indicators.push({ id: 'r0', label: 'No strong risk indicators detected', severity: 'low' as const, description: 'No common scam patterns were found. This does not guarantee safety — always verify independently.' });

      return {
        inputType,
        riskIndicators: indicators,
        verificationSteps: [
          { id: 'v1', step: 'Verify the sender through an official channel (website, app, or known phone number).' },
          { id: 'v2', step: 'Confirm any request independently — do not use contact details from the message itself.' },
          { id: 'v3', step: 'Do not share sensitive information (OTP, password, banking details) until verified.' },
        ],
        summary: `${indicators.length} risk indicator${indicators.length !== 1 ? 's' : ''} detected. Review the evidence below before taking any action.`,
      };
    },
  },

  notifications: {
    async getAll(): Promise<Notification[]> {
      await delay(200);
      return notifications;
    },
    async markRead(id: string): Promise<void> {
      await delay(100);
      const n = notifications.find((x) => x.id === id);
      if (n) n.read = true;
    },
  },

  knowledge: {
    async getGraph(): Promise<KnowledgeGraph> {
      await delay(400);
      return knowledgeGraph;
    },
    async getEvents(): Promise<IntelligenceEvent[]> {
      await delay(300);
      return intelligenceEvents;
    },
  },

  ai: {
    async ask(question: string): Promise<AIAnswer> {
      await delay(1200);
      // Placeholder for Bedrock-powered search
      const ans = aiAnswers.default;
      return { ...ans, question };
    },
  },
};
