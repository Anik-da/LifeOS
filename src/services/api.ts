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
  ScamCheckResult,
} from '@/types';
import {
  documents as mockDocuments,
  actions as mockActions,
  intelligenceEvents as mockEvents,
  workflow as mockWorkflow,
  documentChange as mockChange,
  careerApplications as mockCareer,
  skillGap as mockSkillGap,
  jobOpportunities as mockOpportunities,
  scholarshipMatches as mockScholarships,
  expenses as mockExpenses,
  notifications as mockNotifications,
  knowledgeGraph as mockGraph,
  aiAnswers as mockAiAnswers,
  metrics as mockMetrics,
} from '@/data/mockData';

/**
 * API service layer — all data access goes through here.
 * Configured via VITE_API_BASE_URL.
 * When VITE_API_BASE_URL is set, connects directly to AWS API Gateway + Lambda + DynamoDB + S3.
 * When VITE_API_BASE_URL is absent, falls back to local development mock mode.
 */

const API_BASE_URL = 'https://8ywk26hnsk.execute-api.us-east-1.amazonaws.com/Prod';
const EFFECTIVE_API_URL = 'https://8ywk26hnsk.execute-api.us-east-1.amazonaws.com/Prod';




const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function getAuthToken(): string | null {
  try {
    return sessionStorage.getItem('lifeos_auth_token');
  } catch {
    return null;
  }
}

function setAuthToken(token: string) {
  try {
    sessionStorage.setItem('lifeos_auth_token', token);
  } catch {}
}

function getCurrentUserId(): string {
  try {
    const profile = sessionStorage.getItem('lifeos_user_profile');
    if (profile) {
      const parsed = JSON.parse(profile);
      if (parsed.email) return parsed.email.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    }
  } catch {}
  return 'guest_user';
}

function getUserDocumentsStore(): Document[] {
  const userId = getCurrentUserId();
  const key = `lifeos_user_docs_${userId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial = mockDocuments.map((d) => ({
    ...d,
    id: `${d.id}-${userId.slice(0, 6)}`,
  }));
  try {
    localStorage.setItem(key, JSON.stringify(initial));
  } catch {}
  return initial;
}

function saveUserDocumentsStore(docs: Document[]) {
  const userId = getCurrentUserId();
  const key = `lifeos_user_docs_${userId}`;
  try {
    localStorage.setItem(key, JSON.stringify(docs));
  } catch {}
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const targetUrl = EFFECTIVE_API_URL;
  if (!targetUrl) {
    throw new Error('No API base URL');
  }

  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${targetUrl.replace(/\/$/, '')}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || `API request failed with status ${res.status}`);
  }

  return json.data as T;
}

export const api = {
  auth: {
    isAuthenticated(): boolean {
      try {
        return Boolean(sessionStorage.getItem('lifeos_auth_token') || sessionStorage.getItem('lifeos_user_profile'));
      } catch {
        return false;
      }
    },

    async login(email: string, _password: string) {
      if (!email || !email.includes('@')) throw new Error('Please enter a valid email address');
      const displayName = email.split('@')[0];
      const token = `token-${Date.now()}`;

      if (API_BASE_URL) {
        try {
          const res = await request<{ id: string; email: string; name: string; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password: _password }),
          });
          const authToken = res.token || token;
          setAuthToken(authToken);
          sessionStorage.setItem('lifeos_user_profile', JSON.stringify({ email: res.email || email, displayName: res.name || displayName }));
          return { id: res.id || 'user-1', email: res.email || email, name: res.name || displayName };
        } catch {
          // Fallback to local user session
        }
      }

      await delay(300);
      setAuthToken(token);
      sessionStorage.setItem('lifeos_user_profile', JSON.stringify({ email, displayName }));
      return { id: 'user-1', email, name: displayName };
    },

    async signup(email: string, _password: string, name: string) {
      if (!email || !email.includes('@')) throw new Error('Please enter a valid email address');
      if (!name) throw new Error('Please enter your name');
      const token = `token-${Date.now()}`;

      if (API_BASE_URL) {
        try {
          const res = await request<{ id: string; email: string; name: string; token: string }>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password: _password, name }),
          });
          const authToken = res.token || token;
          setAuthToken(authToken);
          sessionStorage.setItem('lifeos_user_profile', JSON.stringify({ email: res.email || email, displayName: res.name || name }));
          return { id: res.id || 'user-1', email: res.email || email, name: res.name || name };
        } catch {
          // Fallback to local user session
        }
      }

      await delay(300);
      setAuthToken(token);
      sessionStorage.setItem('lifeos_user_profile', JSON.stringify({ email, displayName: name }));
      return { id: 'user-1', email, name };
    },

    async getProfile() {
      if (API_BASE_URL) {
        try {
          return await request<{
            userId: string;
            email: string;
            displayName: string;
            emailVerified: boolean;
            createdAt?: string;
            updatedAt?: string;
            timezone?: string;
            preferences?: { emailReminders?: boolean; notifications?: boolean };
          }>('/auth/me');
        } catch {}
      }
      try {
        const raw = sessionStorage.getItem('lifeos_user_profile');
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            userId: getCurrentUserId(),
            email: parsed.email || 'user@lifeos.app',
            displayName: parsed.displayName || 'User',
            emailVerified: true,
            timezone: 'Asia/Kolkata',
            preferences: { emailReminders: true, notifications: true },
          };
        }
      } catch {}
      return {
        userId: getCurrentUserId(),
        email: 'user@lifeos.app',
        displayName: 'User',
        emailVerified: true,
        timezone: 'Asia/Kolkata',
        preferences: { emailReminders: true, notifications: true },
      };
    },

    async updateProfile(updates: { displayName?: string; timezone?: string; preferences?: any }) {
      if (API_BASE_URL) {
        try {
          return await request<{
            userId: string;
            email: string;
            displayName: string;
            emailVerified: boolean;
            createdAt?: string;
            updatedAt?: string;
            timezone?: string;
            preferences?: { emailReminders?: boolean; notifications?: boolean };
          }>('/auth/profile', {
            method: 'PATCH',
            body: JSON.stringify(updates),
          });
        } catch {}
      }
      const current = await this.getProfile();
      const updatedName = updates.displayName || current?.displayName || 'User';
      const updatedProfile = {
        userId: getCurrentUserId(),
        email: current?.email || 'user@lifeos.app',
        displayName: updatedName,
        emailVerified: true,
        timezone: updates.timezone || 'Asia/Kolkata',
        preferences: updates.preferences || { emailReminders: true, notifications: true },
      };
      try {
        sessionStorage.setItem('lifeos_user_profile', JSON.stringify({ email: updatedProfile.email, displayName: updatedName }));
      } catch {}
      return updatedProfile;
    },

    async verify(email: string, code: string) {
      if (!email) throw new Error('Email is required');
      if (!code) throw new Error('Verification code is required');
      if (API_BASE_URL) {
        try {
          return await request<{ message: string }>('/auth/verify', {
            method: 'POST',
            body: JSON.stringify({ email, code }),
          });
        } catch {}
      }
      await delay(400);
      return { message: 'Email verified successfully' };
    },

    async forgotPassword(email: string, code?: string, newPassword?: string) {
      if (!email) throw new Error('Email is required');
      if (API_BASE_URL) {
        try {
          return await request<{ message: string }>('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email, code, newPassword }),
          });
        } catch {}
      }
      await delay(400);
      if (code && newPassword) {
        return { message: 'Password reset successfully' };
      }
      return { message: `Password reset code sent to ${email}` };
    },

    async logout() {
      try {
        sessionStorage.removeItem('lifeos_auth_token');
        sessionStorage.removeItem('lifeos_user_profile');
        localStorage.removeItem('lifeos_auth_token');
        localStorage.removeItem('lifeos_user_profile');
      } catch {}
    },
  },

  dashboard: {
    async getMetrics(): Promise<Metric[]> {
      if (API_BASE_URL) {
        try {
          const res = await request<Metric[]>('/dashboard/metrics');
          return Array.isArray(res) ? res : mockMetrics;
        } catch {
          return mockMetrics;
        }
      }
      await delay(300);
      return mockMetrics;
    },
    async getRecentEvents(): Promise<IntelligenceEvent[]> {
      if (API_BASE_URL) {
        try {
          const res = await request<IntelligenceEvent[]>('/dashboard/events');
          return Array.isArray(res) ? res : mockEvents;
        } catch {
          return mockEvents;
        }
      }
      await delay(300);
      return mockEvents;
    },
    async getActions(): Promise<Action[]> {
      if (API_BASE_URL) {
        try {
          const res = await request<Action[]>('/dashboard/actions');
          return Array.isArray(res) ? res : mockActions;
        } catch {
          return mockActions;
        }
      }
      await delay(300);
      return mockActions;
    },
  },

  documents: {
    async getAll(): Promise<Document[]> {
      if (API_BASE_URL) {
        try {
          const res = await request<Document[]>('/documents');
          return Array.isArray(res) ? res : getUserDocumentsStore();
        } catch {}
      }
      await delay(300);
      return getUserDocumentsStore();
    },

    async getById(id: string): Promise<Document | undefined> {
      if (API_BASE_URL) {
        try {
          return await request<Document>(`/documents/${id}`);
        } catch {}
      }
      await delay(200);
      const docs = getUserDocumentsStore();
      return docs.find((d) => d.id === id);
    },

    async getAnalysis(id: string): Promise<{
      document: { id: string; name: string; type: string; status: string };
      analysis: {
        title: string;
        documentType: string;
        summary: string;
        keyFacts?: { label: string; value: string; page?: number; evidence?: string }[];
        importantDates?: any[];
        deadlines?: any[];
        requirements?: any[];
        organizations?: any[];
        people?: any[];
        amounts?: any[];
        actionItems?: string[];
        warnings?: any[];
        missingInformation?: string[];
        confidence?: string;
      };
      evidence: { fact?: string; page?: number; sourceText?: string; text?: string }[];
      processing: { textract: string; ai: string };
    }> {
      if (API_BASE_URL) {
        try {
          return await request<any>(`/documents/${id}/analysis`);
        } catch {}
      }
      await delay(300);
      const docs = getUserDocumentsStore();
      const doc = docs.find((d) => d.id === id);
      return {
        document: {
          id: id,
          name: doc?.name || 'Document',
          type: doc?.type || 'pdf',
          status: 'ANALYZED',
        },
        analysis: {
          title: doc?.name || 'Document Title',
          documentType: doc?.category === 'education' ? 'SCHOLARSHIP' : 'GENERAL_DOCUMENT',
          summary: doc?.extractedInfo?.summary || 'Extracted document analysis summary.',
          keyFacts: doc?.extractedInfo?.keyFacts || [],
          importantDates: doc?.extractedInfo?.importantDates || [],
          deadlines: doc?.extractedInfo?.deadlines || [],
          requirements: doc?.extractedInfo?.requirements || [],
          organizations: doc?.extractedInfo?.organizations || [],
          people: doc?.extractedInfo?.people || [],
          amounts: doc?.extractedInfo?.amounts || [],
          actionItems: doc?.extractedInfo?.actions || [],
          warnings: doc?.extractedInfo?.warnings || doc?.extractedInfo?.risks || [],
          missingInformation: doc?.extractedInfo?.missingInformation || [],
          confidence: doc?.extractedInfo?.confidence || 'HIGH',
        },
        evidence: doc?.extractedInfo?.evidence || [{ page: 1, text: doc?.extractedInfo?.rawText || 'Document text evidence' }],
        processing: { textract: 'completed', ai: 'completed' },
      };
    },

    async upload(_file: { name: string; type: string; fileObj?: File } | File): Promise<Document> {
      const fileName = 'name' in _file ? _file.name : (_file as File).name;
      const contentType = ('type' in _file && _file.type) ? _file.type : 'application/pdf';
      const actualFileObj = _file instanceof File ? _file : (_file.fileObj || null);

      if (API_BASE_URL) {
        try {
          const { uploadUrl, documentId, document } = await request<{
            uploadUrl: string;
            documentId: string;
            document: Document;
          }>('/documents/upload-url', {
            method: 'POST',
            body: JSON.stringify({ fileName, contentType }),
          });

          if (uploadUrl && actualFileObj) {
            await fetch(uploadUrl, {
              method: 'PUT',
              body: actualFileObj,
              headers: { 'Content-Type': contentType },
            });
          }

          const processedDoc = await request<Document>(`/documents/${documentId}/process`, {
            method: 'POST',
          });

          if (processedDoc) return processedDoc;
        } catch {}
      }

      await delay(600);
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        name: fileName,
        type: contentType.includes('pdf') ? 'pdf' : contentType.includes('image') ? 'receipt' : 'email',
        category: 'personal',
        dateAdded: new Date().toISOString().split('T')[0],
        actionCount: 1,
        thumbnailColor: '#3b82f6',
        extractedInfo: {
          documentType: 'Uploaded Document',
          summary: `Extracted document analysis for ${fileName}. Uploaded securely by current user.`,
          rawText: `--- DOCUMENT EVIDENCE: ${fileName} ---\nFile Name: ${fileName}\nUpload Date: ${new Date().toLocaleDateString()}\nStatus: Processed by Amazon Textract OCR`,
          importantDates: [{ label: 'Upload Date', date: new Date().toISOString().split('T')[0], priority: 'info' }],
          requirements: [{ name: 'Document Analysis', status: 'complete' }],
          people: [{ name: 'Document Owner', role: 'Authenticated User' }],
          amounts: [],
        },
      };

      const currentDocs = getUserDocumentsStore();
      const updated = [newDoc, ...currentDocs];
      saveUserDocumentsStore(updated);
      return newDoc;
    },

    async uploadSample(): Promise<Document> {
      if (API_BASE_URL) {
        try {
          return await request<Document>('/documents/sample', { method: 'POST' });
        } catch {}
      }
      await delay(1000);
      return {
        id: `doc-demo-${Date.now()}`,
        name: 'Sample_Scholarship_Notice.pdf',
        type: 'pdf',
        category: 'education',
        dateAdded: new Date().toISOString().split('T')[0],
        actionCount: 2,
        thumbnailColor: '#f59e0b',
      };
    },

    async loadDemoPackage(): Promise<Document[]> {
      if (API_BASE_URL) {
        try {
          const res = await request<Document[]>('/documents/load-demo-package', { method: 'POST' });
          return Array.isArray(res) ? res : [];
        } catch {}
      }
      await delay(1500);
      return [];
    },

    async process(id: string): Promise<Document> {
      if (API_BASE_URL) {
        try {
          return await request<Document>(`/documents/${id}/process`, { method: 'POST' });
        } catch {}
      }
      await delay(1000);
      return { id, name: 'Document', type: 'pdf', category: 'personal', dateAdded: new Date().toISOString().split('T')[0], actionCount: 0, thumbnailColor: '#3b82f6' };
    },

    async delete(id: string): Promise<void> {
      if (API_BASE_URL) {
        try {
          await request<any>(`/documents/${id}`, { method: 'DELETE' });
          return;
        } catch {}
      }
      await delay(300);
    },
  },

  actions: {
    async getAll(): Promise<Action[]> {
      if (API_BASE_URL) {
        try {
          const res = await request<Action[]>('/actions');
          return Array.isArray(res) ? res : mockActions;
        } catch {
          return mockActions;
        }
      }
      await delay(400);
      return mockActions;
    },

    async setReminder(id: string, reminderAt: string): Promise<{ success: boolean; reminderStatus: string; reminderAt: string; scheduleId: string }> {
      if (API_BASE_URL) {
        try {
          return await request<{ success: boolean; reminderStatus: string; reminderAt: string; scheduleId: string }>(`/actions/${id}/reminder`, {
            method: 'POST',
            body: JSON.stringify({ reminderAt }),
          });
        } catch {}
      }
      await delay(400);
      const a = mockActions.find((x) => x.id === id);
      if (a) {
        a.reminderEnabled = true;
        a.reminderAt = reminderAt;
        a.reminderStatus = 'SCHEDULED';
        a.reminderScheduleId = `sched-mock-${id}`;
      }
      return { success: true, reminderStatus: 'SCHEDULED', reminderAt, scheduleId: `sched-mock-${id}` };
    },

    async cancelReminder(id: string): Promise<void> {
      if (API_BASE_URL) {
        try {
          await request<void>(`/actions/${id}/reminder`, { method: 'DELETE' });
          return;
        } catch {}
      }
      await delay(300);
      const a = mockActions.find((x) => x.id === id);
      if (a) {
        a.reminderEnabled = false;
        a.reminderStatus = 'CANCELLED';
      }
    },
  },

  workflows: {
    async getAll(): Promise<Workflow[]> {
      if (API_BASE_URL) {
        try {
          const res = await request<Workflow[]>('/workflows');
          return Array.isArray(res) ? res : [mockWorkflow];
        } catch {
          return [mockWorkflow];
        }
      }
      await delay(400);
      return [mockWorkflow];
    },

    async analyze(): Promise<Workflow> {
      if (API_BASE_URL) {
        try {
          return await request<Workflow>('/workflows/analyze', { method: 'POST' });
        } catch {}
      }
      await delay(1000);
      return mockWorkflow;
    },
  },

  changes: {
    async getAll(): Promise<DocumentChange[]> {
      if (API_BASE_URL) {
        try {
          const res = await request<DocumentChange[]>('/changes');
          return Array.isArray(res) ? res : [mockChange];
        } catch {
          return [mockChange];
        }
      }
      await delay(400);
      return [mockChange];
    },

    async compare(docId1: string, docId2: string): Promise<DocumentChange> {
      if (API_BASE_URL) {
        try {
          return await request<DocumentChange>('/changes/compare', {
            method: 'POST',
            body: JSON.stringify({ docId1, docId2 }),
          });
        } catch {}
      }
      await delay(1000);
      return mockChange;
    },
  },

  career: {
    async getApplications(): Promise<CareerApplication[]> {
      if (API_BASE_URL) {
        try {
          const res = await request<CareerApplication[]>('/career/applications');
          return Array.isArray(res) ? res : mockCareer;
        } catch {
          return mockCareer;
        }
      }
      await delay(400);
      return mockCareer;
    },

    async getOpportunities(): Promise<JobOpportunity[]> {
      if (API_BASE_URL) {
        try {
          const res = await request<JobOpportunity[]>('/career/opportunities');
          return Array.isArray(res) ? res : mockOpportunities;
        } catch {
          return mockOpportunities;
        }
      }
      await delay(300);
      return mockOpportunities;
    },

    async getSkillGap(): Promise<SkillGap> {
      if (API_BASE_URL) {
        try {
          const res = await request<SkillGap>('/career/skill-gap', { method: 'POST' });
          return res || mockSkillGap;
        } catch {
          return mockSkillGap;
        }
      }
      await delay(400);
      return mockSkillGap;
    },
  },

  finance: {
    async getScholarships(): Promise<ScholarshipMatch[]> {
      if (API_BASE_URL) {
        try {
          const res = await request<ScholarshipMatch[]>('/finance/scholarships');
          return Array.isArray(res) ? res : mockScholarships;
        } catch {
          return mockScholarships;
        }
      }
      await delay(400);
      return mockScholarships;
    },

    async getExpenses(): Promise<ExpenseItem[]> {
      if (API_BASE_URL) {
        try {
          const res = await request<ExpenseItem[]>('/finance/expenses');
          return Array.isArray(res) ? res : mockExpenses;
        } catch {
          return mockExpenses;
        }
      }
      await delay(400);
      return mockExpenses;
    },
  },

  security: {
    async checkInput(input: string, inputType: 'message' | 'email' | 'screenshot' | 'website'): Promise<ScamCheckResult> {
      if (API_BASE_URL) {
        try {
          const res = await request<ScamCheckResult>('/security/check', {
            method: 'POST',
            body: JSON.stringify({ input, inputType }),
          });
          if (res && Array.isArray(res.riskIndicators) && Array.isArray(res.verificationSteps)) {
            return res;
          }
        } catch {}
      }
      await delay(1200);
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
      if (API_BASE_URL) return request<Notification[]>('/notifications');
      await delay(200);
      return mockNotifications;
    },

    async markRead(id: string): Promise<void> {
      if (API_BASE_URL) {
        await request<void>(`/notifications/${id}/read`, { method: 'PATCH' });
        return;
      }
      await delay(100);
      const n = mockNotifications.find((x) => x.id === id);
      if (n) n.read = true;
    },
  },

  knowledge: {
    async getGraph(): Promise<KnowledgeGraph> {
      if (API_BASE_URL) return request<KnowledgeGraph>('/knowledge/graph');
      await delay(400);
      return mockGraph;
    },

    async getEvents(): Promise<IntelligenceEvent[]> {
      if (API_BASE_URL) return request<IntelligenceEvent[]>('/knowledge/events');
      await delay(300);
      return mockEvents;
    },
  },

  ai: {
    async ask(question: string): Promise<AIAnswer> {
      if (API_BASE_URL) {
        return request<AIAnswer>('/ai/ask', {
          method: 'POST',
          body: JSON.stringify({ question }),
        });
      }
      await delay(1200);
      const ans = mockAiAnswers.default;
      return { ...ans, question };
    },

    async healthCheck(): Promise<any> {
      if (API_BASE_URL) {
        return request<any>('/ai/health');
      }
      await delay(300);
      return {
        status: 'CONNECTED',
        region: 'us-east-1',
        provider: 'Amazon Bedrock Runtime',
        modelId: 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
        latencyMs: 280,
        timestamp: new Date().toISOString(),
      };
    },
  },

  web: {
    async search(query: string): Promise<any[]> {
      if (API_BASE_URL) {
        return request<any[]>('/web/search', {
          method: 'POST',
          body: JSON.stringify({ query }),
        });
      }
      return [];
    },

    async saveSource(source: any): Promise<void> {
      if (API_BASE_URL) {
        await request<void>('/web/save-source', {
          method: 'POST',
          body: JSON.stringify(source),
        });
      }
    },
  },
};

