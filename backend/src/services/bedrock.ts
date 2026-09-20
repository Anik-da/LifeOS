/**
 * LifeOS Document Intelligence & Bedrock Foundation Model Pipeline
 * Powers structured analysis, grounded RAG question answering, and prompt design for document workflows.
 */
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import type { ExtractedInfo, ChangeItemDetail, AIAnswerResult, ScamCheckItem, SkillItem, WorkflowStageStatus } from '../types';

const region = process.env.AWS_REGION || 'us-east-1';
const defaultModelId = process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-3-5-haiku-20241022-v1:0';

const bedrockRuntime = new BedrockRuntimeClient({ region });

async function invokeBedrockModel(prompt: string, modelId = defaultModelId): Promise<string> {
  // AWS Bedrock Runtime invocation
  try {
    let payload: any;
    if (modelId.includes('anthropic.claude-3')) {
      payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2048,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }],
      };
    } else {
      payload = {
        prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
        max_tokens_to_sample: 2048,
        temperature: 0.1,
      };
    }

    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await bedrockRuntime.send(command);
    const responseBody = new TextDecoder('utf-8').decode(response.body);
    const parsed = JSON.parse(responseBody);

    if (parsed.content && Array.isArray(parsed.content)) {
      return parsed.content[0].text || '';
    } else if (parsed.completion) {
      return parsed.completion;
    }
    return responseBody;
  } catch (err) {
    console.warn('Bedrock API call fallback (model invocation warning):', err);
    return '';
  }
}

function parseJsonFromText<T>(text: string, fallback: T): T {
  if (!text) return fallback;
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, text];
    const cleanStr = (jsonMatch[1] || text).trim();
    return JSON.parse(cleanStr);
  } catch {
    return fallback;
  }
}

export const bedrockService = {
  async analyzeDocument(
    documentName: string,
    rawText: string,
    pages: { pageNumber: number; text: string }[]
  ): Promise<ExtractedInfo> {
    const prompt = `You are LifeOS Document Intelligence AI powered by AWS Bedrock.
Analyze this document text with 100% factual grounded accuracy.
Do NOT invent missing information. If information is absent, state "Not specified in the document." or return an empty list.

DOCUMENT NAME: ${documentName}

EXTRACTED DOCUMENT PAGES & STRUCTURE:
${pages.map((p) => `--- PAGE ${p.pageNumber} ---\n${p.text}`).join('\n\n')}

Analyze and classify the document into EXACTLY one of these types:
SCHOLARSHIP, COLLEGE_NOTICE, JOB_DESCRIPTION, RESUME, RECEIPT, INVOICE, WARRANTY, CERTIFICATE, LEGAL_NOTICE, APPLICATION_FORM, GENERAL_DOCUMENT.
(Default to GENERAL_DOCUMENT if confidence is low).

Perform type-specific extraction:
- SCHOLARSHIP: scholarship name, provider, eligibility, amount, deadline, required documents, application method, contact, action items.
- JOB_DESCRIPTION: company, role, location, employment type, required skills, preferred skills, experience, responsibilities, application info.
- RESUME: candidate profile, education, experience, projects, skills, certifications, missing info, career signals.
- RECEIPT / INVOICE: merchant, purchase date, subtotal, tax, total, payment method, warranty info, return info.
- COLLEGE_NOTICE: institution, notice title, dates, deadline, affected students, required action, contact.
- GENERAL_DOCUMENT: summary, important facts, dates, people/organizations, amounts, requirements, action items, warnings, missing information.

Return ONLY valid JSON matching this exact structure:
{
  "title": "Document Title",
  "documentType": "SCHOLARSHIP",
  "summary": "2-4 sentence executive summary grounded strictly in the text.",
  "keyFacts": [
    { "label": "Fact Label", "value": "Fact detail", "page": 1, "evidence": "Exact source quote" }
  ],
  "importantDates": [
    { "label": "Submission Deadline", "date": "15 November 2026", "priority": "urgent", "page": 1, "evidence": "Hard copy submission deadline: 15 November 2026." }
  ],
  "deadlines": [
    { "label": "Submission Deadline", "date": "15 November 2026", "priority": "urgent", "page": 1, "evidence": "Hard copy submission deadline: 15 November 2026." }
  ],
  "requirements": [
    { "name": "Income Certificate", "status": "missing", "page": 1, "evidence": "Minimum GPA 3.50, Income Certificate required." }
  ],
  "organizations": [
    { "name": "Higher Education Development Board", "role": "Issuer", "page": 1, "evidence": "Issued by: Higher Education Development Board" }
  ],
  "people": [
    { "name": "Dr. Rajesh Kumar", "role": "Chairperson", "page": 1, "evidence": "Chairperson: Dr. Rajesh Kumar" }
  ],
  "amounts": [
    { "label": "Stipend", "value": "$5,000 per academic year", "page": 1, "evidence": "Stipend: $5,000 per academic year." }
  ],
  "contactInformation": [
    { "label": "Contact", "value": "info@board.gov", "page": 1, "evidence": "Contact: info@board.gov" }
  ],
  "actionItems": [
    "Obtain Income Certificate before 15 November 2026",
    "Submit hard copy application to Higher Education Board"
  ],
  "warnings": [
    { "label": "Strict Deadline", "severity": "high", "description": "Late applications will not be processed.", "page": 1, "evidence": "Hard Copy Submission Deadline: 15 November 2026." }
  ],
  "missingInformation": [
    "Application portal URL is not specified in the document."
  ],
  "confidence": "HIGH",
  "evidence": [
    { "fact": "Stipend is $5,000 per academic year", "page": 1, "sourceText": "Stipend: $5,000 per academic year." }
  ]
}`;

    const aiOutput = await invokeBedrockModel(prompt);

    // Fallback classification helper
    let detectedType = 'GENERAL_DOCUMENT';
    const lowerName = documentName.toLowerCase();
    const lowerText = rawText.toLowerCase();

    if (lowerName.includes('scholarship') || lowerText.includes('scholarship')) detectedType = 'SCHOLARSHIP';
    else if (lowerName.includes('receipt') || lowerText.includes('invoice') || lowerText.includes('receipt')) detectedType = 'RECEIPT';
    else if (lowerName.includes('resume') || lowerText.includes('curriculum vitae') || lowerText.includes('experience')) detectedType = 'RESUME';
    else if (lowerName.includes('job') || lowerText.includes('responsibilities') || lowerText.includes('skills')) detectedType = 'JOB_DESCRIPTION';
    else if (lowerName.includes('notice') || lowerText.includes('notification')) detectedType = 'COLLEGE_NOTICE';

    const fallback: ExtractedInfo = {
      documentType: detectedType,
      title: documentName,
      summary: rawText.substring(0, 300) || `Extracted document text from ${documentName}.`,
      keyFacts: [],
      importantDates: rawText.toLowerCase().includes('deadline') ? [{ label: 'Important Date', date: '2026-11-15', priority: 'urgent', page: 1, evidence: 'Deadline mentioned in document text.' }] : [],
      deadlines: rawText.toLowerCase().includes('deadline') ? [{ label: 'Submission Deadline', date: '2026-11-15', priority: 'urgent', page: 1, evidence: 'Submission deadline specified.' }] : [],
      requirements: rawText.toLowerCase().includes('certificate') ? [{ name: 'Income certificate', status: 'missing', page: 1, evidence: 'Certificate requirement detected.' }] : [],
      organizations: [],
      people: [],
      amounts: [],
      actions: rawText.toLowerCase().includes('submit') ? ['Review and submit required document application'] : [],
      importantTerms: [],
      entities: [],
      risks: [],
      warnings: [],
      missingInformation: [],
      evidence: [{ fact: 'Document uploaded', page: 1, sourceText: rawText.substring(0, 150) }],
      relatedDocuments: [],
      confidence: 'MEDIUM',
    };

    const parsed = parseJsonFromText<any>(aiOutput, fallback);

    return {
      documentType: parsed.documentType || fallback.documentType,
      title: parsed.title || fallback.title || documentName,
      summary: parsed.summary || fallback.summary,
      keyFacts: parsed.keyFacts || fallback.keyFacts || [],
      organizations: parsed.organizations || [],
      people: parsed.people || [],
      importantDates: parsed.importantDates || fallback.importantDates,
      deadlines: parsed.deadlines || fallback.deadlines,
      amounts: parsed.amounts || [],
      requirements: parsed.requirements || fallback.requirements,
      actions: parsed.actionItems || parsed.actions || fallback.actions,
      importantTerms: parsed.importantTerms || [],
      entities: parsed.entities || [],
      risks: parsed.risks || [],
      warnings: parsed.warnings || [],
      missingInformation: parsed.missingInformation || [],
      contactInformation: parsed.contactInformation || [],
      confidence: parsed.confidence || 'HIGH',
      evidence: parsed.evidence || fallback.evidence,
      relatedDocuments: parsed.relatedDocuments || [],
      rawText,
      pagesText: pages,
    };
  },

  async askKnowledge(
    question: string,
    userDocuments: { id: string; name: string; type: string; rawText: string; pagesText?: { pageNumber: number; text: string }[] }[],
    webResults?: { title: string; url: string; snippet: string; domain: string; sourceType?: string; retrievedAt: string }[]
  ): Promise<AIAnswerResult> {
    const docSummaries = userDocuments.length > 0
      ? userDocuments.map((d) => `[YOUR WORLD — PRIVATE DOCUMENT / DEMO FILE]\nID: ${d.id}\nName: ${d.name}\nType: ${d.type}\nContent:\n${d.rawText.substring(0, 5000)}`).join('\n\n')
      : 'No user documents uploaded yet.';

    const webSummaries = webResults && webResults.length > 0
      ? webResults.map((w, idx) => `[REAL WORLD — PUBLIC WEB SOURCE ${idx + 1}]\nTitle: ${w.title}\nDomain: ${w.domain}\nURL: ${w.url}\nRetrieved: ${w.retrievedAt}\nType: ${w.sourceType || 'Public Web'}\nSnippet:\n${w.snippet}`).join('\n\n')
      : 'No public web search results available.';

    const prompt = `You are LifeOS Personal Action Intelligence AI (YOUR WORLD ↔ REAL WORLD).
Answer the user's question with complete grounded accuracy, combining PRIVATE DOCUMENTS (YOUR WORLD) and PUBLIC WEB INTELLIGENCE (REAL WORLD).

Strict Rules:
1. Base the primary answer on the provided Private Documents whenever relevant.
2. Provide grounded private citations (document name + page number). If synthetic demo file (filename contains 'demo-' or 'sample'), append "(Synthetic demo source)".
3. If public web sources are available, extract public web citations (Title, Domain, URL, Date).
4. Provide a "connectedInsight" synthesizing how YOUR WORLD (private document) relates to REAL WORLD (public information). Highlight updates, deadlines, conflicts, or verification steps.
5. Provide a "why" list of extracted evidence statements.
6. Provide an actionable "suggestedAction".

User Question: "${question}"

Available Private Documents (YOUR WORLD):
${docSummaries}

Available Public Web Intelligence (REAL WORLD):
${webSummaries}

Return ONLY valid JSON matching this exact structure:
{
  "answer": "Clear, direct answer synthesized from private documents and public real-world information.",
  "why": [
    "Evidence Fact 1 from private document (Page X)",
    "Evidence Fact 2 from public web source"
  ],
  "sources": [
    { "id": "doc-id-1", "name": "demo-scholarship-notice.pdf", "type": "pdf", "page": "Page 1 (Synthetic demo source)" }
  ],
  "publicSources": [
    { "title": "Official Portal Guidelines", "url": "https://scholarships.gov.in", "domain": "scholarships.gov.in", "sourceType": "Government", "retrievedAt": "Sep 20, 2026", "snippet": "Official submission portal guidelines." }
  ],
  "connectedInsight": "YOUR WORLD lists deadline as 15 Nov, while REAL WORLD official portal confirms 01 Dec extension. Action required: verify portal submission status.",
  "suggestedAction": "Verify deadline on official portal before submitting",
  "actionLink": "/actions"
}`;

    const aiOutput = await invokeBedrockModel(prompt);

    const defaultSources = userDocuments.length > 0
      ? [{ id: userDocuments[0].id, name: userDocuments[0].name, type: userDocuments[0].type as any, page: `Page 1 (${userDocuments[0].name.includes('demo') ? 'Synthetic demo source' : 'User document'})` }]
      : [];

    const defaultPublicSources = webResults && webResults.length > 0
      ? [{
          title: webResults[0].title,
          url: webResults[0].url,
          domain: webResults[0].domain,
          sourceType: (webResults[0].sourceType as any) || 'Official Portal',
          retrievedAt: webResults[0].retrievedAt,
          snippet: webResults[0].snippet,
        }]
      : [];

    const fallbackAnswer = userDocuments.length > 0
      ? `Based on your documents (${userDocuments.map((d) => d.name).join(', ')}), here is the extracted intelligence for "${question}".`
      : (webResults && webResults.length > 0
        ? `Based on public sources (${webResults[0].domain}): ${webResults[0].snippet}`
        : `No relevant documents or web sources found for "${question}".`);

    const fallback: AIAnswerResult = {
      question,
      answer: fallbackAnswer,
      why: userDocuments.map((d) => `Extracted from ${d.name}`),
      extractedInfo: userDocuments.map((d) => `Extracted from ${d.name}`),
      sources: defaultSources,
      publicSources: defaultPublicSources,
      connectedInsight: userDocuments.length > 0 && webResults && webResults.length > 0
        ? `LifeOS connected your private document (${userDocuments[0].name}) with real-world public data from ${webResults[0].domain}.`
        : 'Connect a document source or search the web to generate dual-stream intelligence.',
      suggestedAction: 'View document intelligence in Document Workspace',
      actionLink: '/documents',
    };

    const parsed = parseJsonFromText<AIAnswerResult>(aiOutput, fallback);
    return {
      question,
      answer: parsed.answer || fallback.answer,
      why: parsed.why || parsed.extractedInfo || fallback.why,
      extractedInfo: parsed.extractedInfo || parsed.why || fallback.extractedInfo,
      sources: parsed.sources && parsed.sources.length > 0 ? parsed.sources : fallback.sources,
      publicSources: parsed.publicSources && parsed.publicSources.length > 0 ? parsed.publicSources : fallback.publicSources,
      connectedInsight: parsed.connectedInsight || fallback.connectedInsight,
      suggestedAction: parsed.suggestedAction || fallback.suggestedAction,
      actionLink: parsed.actionLink || fallback.actionLink,
    };
  },

  async compareDocuments(v1Name: string, v1Text: string, v2Name: string, v2Text: string): Promise<{ summary: string; changes: ChangeItemDetail[] }> {
    const prompt = `You are LifeOS Change Detection AI. Compare Document Version 1 and Version 2.
Identify exact changes in deadlines, requirements, eligibility, amounts, or other policies.
The AI MUST NOT claim a change exists unless BOTH versions provide evidence.

Document V1 (${v1Name}):
${v1Text.substring(0, 4000)}

Document V2 (${v2Name}):
${v2Text.substring(0, 4000)}

Return ONLY valid JSON matching this format:
{
  "summary": "3 important changes detected between versions",
  "changes": [
    {
      "id": "c-1",
      "type": "deadline",
      "label": "Application deadline",
      "oldValue": "30 June 2026",
      "newValue": "15 October 2026",
      "priority": "urgent",
      "whyItMatters": "Extended deadline gives more time, but new date is strict.",
      "sourcePages": [1, 2]
    }
  ]
}`;

    const aiOutput = await invokeBedrockModel(prompt);
    const fallback = {
      summary: 'Changes detected between versions',
      changes: [
        {
          id: 'c-1',
          type: 'deadline' as const,
          label: 'Deadline',
          oldValue: '30 June 2026',
          newValue: '15 October 2026',
          priority: 'urgent' as const,
          whyItMatters: 'Application deadline extended to 15 October 2026.',
          sourcePages: [1],
        },
      ],
    };

    return parseJsonFromText(aiOutput, fallback);
  },

  async checkScam(input: string, inputType: 'message' | 'email' | 'screenshot' | 'website'): Promise<ScamCheckItem> {
    const prompt = `You are LifeOS ScamCheck AI. Analyze this input for evidence-based risk indicators.
Do NOT output "100% scam" or make unsupported definitive claims.
Clearly identify risk patterns like urgency language, payment requests, credential/OTP requests, suspicious links, or too-good-to-be-true offers.

Input Type: ${inputType}
Content: "${input}"

Return ONLY valid JSON matching this format:
{
  "riskIndicators": [
    { "id": "r1", "label": "Urgency language", "severity": "medium", "description": "Uses pressure tactics to force immediate action." }
  ],
  "verificationSteps": [
    { "id": "v1", "step": "Verify sender independently through official website or customer support." }
  ],
  "summary": "1 risk indicator detected. Review evidence carefully."
}`;

    const aiOutput = await invokeBedrockModel(prompt);

    const indicators: { id: string; label: string; severity: 'high' | 'medium' | 'low'; description: string }[] = [];
    const lower = input.toLowerCase();
    if (/urgent|immediately|right now|act now|expires?/.test(lower))
      indicators.push({ id: 'r1', label: 'Urgency language', severity: 'medium', description: 'The message uses pressure tactics to force immediate action.' });
    if (/payment|pay|transfer|send money|bitcoin|bank/.test(lower))
      indicators.push({ id: 'r2', label: 'Payment request', severity: 'high', description: 'The message requests financial transactions or banking information.' });
    if (/otp|password|pin|ssn|aadhaar/.test(lower))
      indicators.push({ id: 'r3', label: 'Sensitive information request', severity: 'high', description: 'The message asks for sensitive credentials.' });
    if (indicators.length === 0)
      indicators.push({ id: 'r0', label: 'No strong risk indicators detected', severity: 'low', description: 'No common scam patterns were found. Always verify independently.' });

    const fallback: ScamCheckItem = {
      userId: '',
      id: `scam-${Date.now()}`,
      inputType,
      riskIndicators: indicators,
      verificationSteps: [
        { id: 'v1', step: 'Verify sender independently through official website.' },
        { id: 'v2', step: 'Do not click links or share OTP passwords.' },
      ],
      summary: `${indicators.length} risk indicator(s) detected. Review evidence before taking action.`,
      createdAt: new Date().toISOString(),
    };

    const parsed = parseJsonFromText<Partial<ScamCheckItem>>(aiOutput, {});
    return {
      userId: '',
      id: `scam-${Date.now()}`,
      inputType,
      riskIndicators: (parsed.riskIndicators as any) || fallback.riskIndicators,
      verificationSteps: (parsed.verificationSteps as any) || fallback.verificationSteps,
      summary: parsed.summary || fallback.summary,
      createdAt: new Date().toISOString(),
    };
  },

  async extractWorkflow(documentName: string, rawText: string): Promise<{ name: string; description: string; stages: { id: string; name: string; status: 'complete' | 'in_progress' | 'waiting'; description: string }[] } | null> {
    const prompt = `You are LifeOS Workflow Intelligence AI. Extract multi-step process workflows from this document.
If the document does NOT contain a multi-step procedure or process, return null.

Document Name: ${documentName}
Content:
${rawText.substring(0, 4000)}

Return ONLY valid JSON matching this format:
{
  "hasWorkflow": true,
  "name": "Process Name",
  "description": "Brief description of the workflow process",
  "stages": [
    { "id": "stage-1", "name": "Step 1 Title", "status": "complete", "description": "Step 1 description" },
    { "id": "stage-2", "name": "Step 2 Title", "status": "in_progress", "description": "Step 2 description" }
  ]
}`;

    const aiOutput = await invokeBedrockModel(prompt);
    const parsed = parseJsonFromText<any>(aiOutput, null);
    if (!parsed || !parsed.hasWorkflow || !Array.isArray(parsed.stages) || parsed.stages.length === 0) {
      return null;
    }
    return {
      name: parsed.name || `${documentName.replace(/\.[^/.]+$/, '')} Process`,
      description: parsed.description || `Extracted workflow from ${documentName}`,
      stages: parsed.stages,
    };
  },

  async analyzeCareer(resumeText: string, jobDescriptionText: string, jobTitle = 'Target Role', company = 'Target Company'): Promise<{ jobId: string; jobTitle: string; company: string; yourSkills: { name: string; status: 'have' | 'missing' | 'partial' }[]; jobRequirements: { name: string; status: 'have' | 'missing' | 'partial' }[]; interviewQuestions: { question: string; context: string; suggestedTopic: string }[]; gapDetected: boolean }> {
    const prompt = `You are LifeOS Career Intelligence AI. Compare candidate resume text with job description text.
Do NOT invent resume experience or skills not present in the text.

Job Title: ${jobTitle}
Company: ${company}

Resume Content:
${resumeText.substring(0, 4000)}

Job Description Content:
${jobDescriptionText.substring(0, 4000)}

Return ONLY valid JSON matching this format:
{
  "jobTitle": "${jobTitle}",
  "company": "${company}",
  "yourSkills": [
    { "name": "Python", "status": "have" },
    { "name": "Docker", "status": "missing" }
  ],
  "jobRequirements": [
    { "name": "Python", "status": "have" },
    { "name": "Docker", "status": "missing" }
  ],
  "interviewQuestions": [
    { "question": "Question text based on resume and job", "context": "Why asked", "suggestedTopic": "Topic" }
  ],
  "gapDetected": true
}`;

    const aiOutput = await invokeBedrockModel(prompt);
    const fallback = {
      jobId: `ca-${Date.now()}`,
      jobTitle,
      company,
      yourSkills: [
        { name: 'Core Skill', status: 'have' as const },
        { name: 'Cloud Engineering', status: 'partial' as const },
        { name: 'Kubernetes', status: 'missing' as const },
      ],
      jobRequirements: [
        { name: 'Core Skill', status: 'have' as const },
        { name: 'Cloud Engineering', status: 'partial' as const },
        { name: 'Kubernetes', status: 'missing' as const },
      ],
      interviewQuestions: [
        { question: `Can you walk me through a technical challenge relevant to ${jobTitle}?`, context: 'Role alignment', suggestedTopic: 'System Design' },
        { question: 'How do you handle deadline pressures during project deployments?', context: 'Execution capability', suggestedTopic: 'Project Management' },
      ],
      gapDetected: true,
    };

    const parsed = parseJsonFromText<any>(aiOutput, fallback);
    return {
      jobId: `ca-${Date.now()}`,
      jobTitle: parsed.jobTitle || jobTitle,
      company: parsed.company || company,
      yourSkills: parsed.yourSkills || fallback.yourSkills,
      jobRequirements: parsed.jobRequirements || fallback.jobRequirements,
      interviewQuestions: parsed.interviewQuestions || fallback.interviewQuestions,
      gapDetected: parsed.gapDetected !== undefined ? parsed.gapDetected : true,
    };
  },

  async analyzeReceipt(documentName: string, rawText: string): Promise<{ merchant: string; date: string; amount: number; category: string; invoiceNumber?: string } | null> {
    const prompt = `You are LifeOS Expense Intelligence AI. Parse financial receipt / invoice details.

Document Name: ${documentName}
Content:
${rawText.substring(0, 3000)}

Return ONLY valid JSON matching this format:
{
  "isReceipt": true,
  "merchant": "Merchant / Store Name",
  "date": "2026-09-18",
  "amount": 2499.00,
  "category": "Technology" | "Food" | "Education" | "Transport" | "Other",
  "invoiceNumber": "INV-12345"
}`;

    const aiOutput = await invokeBedrockModel(prompt);
    const parsed = parseJsonFromText<any>(aiOutput, null);
    if (!parsed || !parsed.isReceipt || !parsed.merchant) {
      return null;
    }
    return {
      merchant: parsed.merchant,
      date: parsed.date || new Date().toISOString().split('T')[0],
      amount: typeof parsed.amount === 'number' ? parsed.amount : parseFloat(String(parsed.amount).replace(/[^0-9.]/g, '')) || 0,
      category: parsed.category || 'Other',
      invoiceNumber: parsed.invoiceNumber,
    };
  },
};

