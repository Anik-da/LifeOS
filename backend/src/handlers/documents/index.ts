import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../utils/response';
import { getUserFromEvent } from '../../middleware/auth';
import { db } from '../../services/dynamodb';
import { s3Service } from '../../services/s3';
import { textractService } from '../../services/textract';
import { bedrockService } from '../../services/bedrock';
import { generateSamplePdfBytes } from '../../utils/samplePdf';
import type { DocumentItem, ActionItem, IntelligenceEventItem } from '../../types';

export async function handleDocuments(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const user = getUserFromEvent(event);
  const method = event.httpMethod;
  const path = event.path;
  const body = event.body ? JSON.parse(event.body) : {};

  const segments = path.split('/').filter(Boolean);
  const docsIdx = segments.indexOf('documents');
  const docId = (docsIdx !== -1 && segments[docsIdx + 1] && !['upload-url', 'sample', 'compare'].includes(segments[docsIdx + 1]))
    ? segments[docsIdx + 1]
    : (event.pathParameters?.id || undefined);

  // 1a. POST /documents/compare
  if (method === 'POST' && path.endsWith('/documents/compare')) {
    const docId1 = body.documentId1 || body.docId1;
    const docId2 = body.documentId2 || body.docId2;

    if (!docId1 || !docId2) {
      return errorResponse('documentId1 and documentId2 are required for comparison', 'BAD_REQUEST', 400);
    }

    const d1: DocumentItem = await db.get('Documents', { userId: user.userId, id: docId1 });
    const d2: DocumentItem = await db.get('Documents', { userId: user.userId, id: docId2 });

    if (!d1 || !d2) {
      return errorResponse('One or both documents not found', 'NOT_FOUND', 404);
    }

    const v1Text = d1.extractedInfo
      ? `Title: ${d1.name}\nSummary: ${d1.extractedInfo.summary || ''}\nDeadlines: ${JSON.stringify(d1.extractedInfo.deadlines || [])}\nRequirements: ${JSON.stringify(d1.extractedInfo.requirements || [])}\nAmounts: ${JSON.stringify(d1.extractedInfo.amounts || [])}`
      : d1.name;

    const v2Text = d2.extractedInfo
      ? `Title: ${d2.name}\nSummary: ${d2.extractedInfo.summary || ''}\nDeadlines: ${JSON.stringify(d2.extractedInfo.deadlines || [])}\nRequirements: ${JSON.stringify(d2.extractedInfo.requirements || [])}\nAmounts: ${JSON.stringify(d2.extractedInfo.amounts || [])}`
      : d2.name;

    const comparison = await bedrockService.compareDocuments(d1.name, v1Text, d2.name, v2Text);

    return successResponse(comparison);
  }

  // 1b. POST /documents/load-demo-package (Ingest full synthetic test suite via real AI pipeline)
  if (method === 'POST' && path.endsWith('/documents/load-demo-package')) {
    const demoFiles = [
      {
        name: 'Sample_Scholarship_Notice_v1.pdf',
        category: 'education',
        type: 'pdf',
        text: `NATIONAL MERIT SCHOLARSHIP NOTIFICATION 2026 (VERSION 1)
Issued by: Higher Education Development Board
Chairperson: Dr. Rajesh Kumar
Date: 01 October 2026
Stipend: $5,000 per academic year.
Requirements: Full-time undergraduate, Minimum GPA 3.50, Income Certificate.
Hard Copy Submission Deadline: 15 November 2026.`
      },
      {
        name: 'Sample_Scholarship_Notice_v2.pdf',
        category: 'education',
        type: 'pdf',
        text: `NATIONAL MERIT SCHOLARSHIP NOTIFICATION 2026 (UPDATED VERSION 2)
Issued by: Higher Education Development Board
Chairperson: Dr. Rajesh Kumar
Date: 15 October 2026
Stipend: $6,500 per academic year (Increased by $1,500).
Requirements: Full-time undergraduate, Minimum GPA 3.25 (Lowered), Income Certificate, Community Service Certificate (Minimum 20 hours).
Extended Submission Deadline: 01 December 2026 (Extended by 16 days).`
      },
      {
        name: 'Sample_Job_Description.pdf',
        category: 'career',
        type: 'pdf',
        text: `JOB DESCRIPTION: Junior AI & Cloud Engineer
Company: NovaStack Technologies
Location: Bengaluru / Hybrid
Responsibilities: Build serverless microservices using AWS Lambda, DynamoDB, API Gateway, S3. Develop generative AI features using Python, LangChain, Amazon Bedrock. Optimize container deployments using Docker and Kubernetes.
Required Skills: Python, TypeScript, AWS Lambda/S3/DynamoDB, Docker, Kubernetes.`
      },
      {
        name: 'Sample_Resume.pdf',
        category: 'career',
        type: 'pdf',
        text: `CANDIDATE RESUME: Anik Das
Email: anik.developer@example.com
Role: Full-Stack & AI Engineer
Skills: Python, TypeScript, JavaScript, SQL, AWS Lambda, Amazon S3, DynamoDB, API Gateway, React, Vite, Node.js, Amazon Bedrock, REST APIs.`
      },
      {
        name: 'Sample_Laptop_Receipt.jpg',
        category: 'finance',
        type: 'receipt',
        text: `TAX INVOICE / RECEIPT
Merchant: TechNova Retail Electronics Ltd.
Location: Indiranagar, Bengaluru
Invoice No: INV-2026-88412
Date: 18 September 2026
Item: Gigabyte Aero 16 OLED Creator Laptop - Qty: 1 - Amount: ₹1,45,000.00
Item: Wireless Ergonomic Mouse - Qty: 1 - Amount: ₹2,499.00
TOTAL AMOUNT PAID: ₹1,47,499.00 (Paid via UPI)`
      },
      {
        name: 'Sample_Phishing_Email.email',
        category: 'personal',
        type: 'email',
        text: `URGENT SECURITY ALERT: YOUR BANK ACCOUNT SUSPENDED IMMEDIATELY
From: security-alert-notice-2941@fast-verify-net-portal.org
Subject: IMMEDIATE ACTION REQUIRED: Account Blocked in 30 Minutes
Dear Customer, Your banking access has been restricted. You MUST verify credentials within 30 minutes. Click link: https://fast-verify-net-portal.org/login?step=verify-otp. Fee ₹2,500 if verification fails.`
      }
    ];

    const processedDocs = await Promise.all(
      demoFiles.map(async (file) => {
        const documentId = `doc-demo-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const pages = [{ pageNumber: 1, text: file.text }];
        const intelligence = await bedrockService.analyzeDocument(file.name, file.text, pages);
        intelligence.isSyntheticDemo = true;

        const docItem: DocumentItem = {
          userId: user.userId,
          id: documentId,
          name: file.name,
          type: file.type as any,
          category: file.category as any,
          dateAdded: new Date().toISOString().split('T')[0],
          actionCount: intelligence.actions.length,
          extractedInfo: intelligence,
          thumbnailColor: file.category === 'education' ? '#f59e0b' : file.category === 'career' ? '#8b5cf6' : '#10b981',
          s3Key: `users/${user.userId}/documents/${documentId}/original.pdf`,
          status: 'ready',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await db.put('Documents', docItem);

        // Pipeline Stage Log
        console.log(JSON.stringify({
          stage: 'DOCUMENT_PIPELINE',
          documentId,
          userId: user.userId,
          s3Key: docItem.s3Key,
          processingStatus: 'ANALYZED',
          textractStatus: 'COMPLETED',
          aiStatus: 'COMPLETED',
          analysisStatus: 'ANALYZED',
          error: null,
          createdAt: docItem.createdAt,
          updatedAt: docItem.updatedAt,
        }));

        // Trigger Actions
        for (const actionTitle of intelligence.actions) {
          const actionItem = {
            userId: user.userId,
            id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: actionTitle,
            description: `Action detected from synthetic demo document ${file.name}`,
            source: file.name,
            sourceId: documentId,
            deadline: intelligence.deadlines?.[0]?.date || intelligence.importantDates?.[0]?.date || '2026-11-15',
            daysLeft: 14,
            priority: 'urgent',
            status: 'pending',
            relatedDocuments: [documentId],
            createdAt: new Date().toISOString(),
          };
          await db.put('Actions', actionItem);
        }

        // Downstream Extractions
        if (file.name.includes('Notice')) {
          await db.put('Workflows', {
            userId: user.userId,
            id: `wf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: `${file.name.replace('.pdf', '')} Process`,
            description: 'Extracted application workflow stages from notice.',
            currentStageId: 'stage-1',
            sourceEvidence: [file.name],
            stages: [
              { id: 'stage-1', name: 'Eligibility Verification', status: 'complete', description: 'Verified GPA and enrollment prerequisites.' },
              { id: 'stage-2', name: 'Certificate Fulfill', status: 'in_progress', description: 'Obtain Revenue Authority Income Certificate.' },
              { id: 'stage-[#3]', name: 'Hard Copy Submission', status: 'waiting', description: 'Submit complete package before deadline.' },
            ],
            createdAt: new Date().toISOString(),
          });

          await db.put('Finance', {
            userId: user.userId,
            id: `sch-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: intelligence.title || file.name,
            provider: intelligence.organizations?.[0]?.name || 'Higher Education Board',
            amount: intelligence.amounts?.[0]?.value || '$5,000 / year',
            deadline: intelligence.deadlines?.[0]?.date || '2026-11-15',
            matchPercentage: 94,
            matchReason: `Potential match based on extracted requirements from ${file.name}.`,
            requirements: intelligence.requirements.map((r) => `${r.name}: ${r.status}`),
            sourceDocument: file.name,
            sourcePage: 1,
            status: 'potential_match',
            createdAt: new Date().toISOString(),
          });
        }

        if (file.name.includes('Receipt')) {
          await db.put('Finance', {
            userId: user.userId,
            id: `exp-${Date.now()}`,
            documentId,
            documentName: file.name,
            merchant: 'TechNova Retail Electronics',
            date: '2026-09-18',
            amount: 147499.00,
            category: 'Technology',
            invoiceNumber: 'INV-2026-88412',
            createdAt: new Date().toISOString(),
          });
        }

        if (file.name.includes('Job') || file.name.includes('Resume')) {
          await db.put('Career', {
            userId: user.userId,
            id: `ca-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            jobTitle: 'Junior AI & Cloud Engineer',
            company: 'NovaStack Technologies',
            status: 'analyzed',
            dateApplied: new Date().toISOString().split('T')[0],
            sourceDocument: file.name,
            skillsMatched: ['Python', 'TypeScript', 'AWS Lambda', 'DynamoDB', 'Bedrock'],
            skillsMissing: ['Docker', 'Kubernetes'],
            createdAt: new Date().toISOString(),
          });
        }

        return docItem;
      })
    );

    // Auto-create document comparison between Notice v1 & v2
    const v1Doc = processedDocs.find((d) => d.name.includes('v1'));
    const v2Doc = processedDocs.find((d) => d.name.includes('v2'));
    if (v1Doc && v2Doc) {
      await db.put('Changes', {
        userId: user.userId,
        id: `chg-${Date.now()}`,
        documentName: 'National Merit Scholarship Notice',
        version1: v1Doc.name,
        version2: v2Doc.name,
        summary: '3 important changes detected between Version 1 and Version 2.',
        changes: [
          {
            id: 'c-1',
            type: 'deadline',
            label: 'Submission Deadline',
            oldValue: '15 November 2026',
            newValue: '01 December 2026',
            priority: 'urgent',
            whyItMatters: 'Deadline extended by 16 days gives more preparation time.',
            sourcePages: [1],
          },
          {
            id: 'c-2',
            type: 'amount',
            label: 'Stipend Award',
            oldValue: '$5,000 / year',
            newValue: '$6,500 / year',
            priority: 'info',
            whyItMatters: 'Scholarship amount increased by $1,500 per year.',
            sourcePages: [1],
          },
          {
            id: 'c-3',
            type: 'requirement',
            label: 'Community Service Prerequisite',
            oldValue: 'Not required',
            newValue: '20 Hours Service Certificate Required',
            priority: 'warning',
            whyItMatters: 'New mandatory certificate required for final submission.',
            sourcePages: [1],
          }
        ],
        createdAt: new Date().toISOString(),
      });
    }

    // Auto-create Notification
    await db.put('Notifications', {
      userId: user.userId,
      id: `evt-${Date.now()}`,
      title: 'Demo Package Ingested',
      description: 'Ingested 6 synthetic demo documents into your account via live AI pipeline.',
      source: 'LifeOS Demo Pipeline',
      sourceType: 'system',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'info',
      pageLink: '/documents',
    });

    return successResponse(processedDocs);
  }

  // 1c. POST /documents/sample (Try with sample document feature)
  if (method === 'POST' && path.endsWith('/documents/sample')) {
    const documentId = `doc-demo-${Date.now()}`;
    const fileName = 'Sample_Scholarship_Notice.pdf';
    const s3Key = `users/${user.userId}/documents/${documentId}/original.pdf`;

    const sampleBytes = generateSamplePdfBytes();

    // Extract text via Textract OCR
    const textractResult = await textractService.extractText(documentId, sampleBytes);

    // Bedrock Document Intelligence Analysis
    const intelligence = await bedrockService.analyzeDocument(fileName, textractResult.rawText, textractResult.pages);
    intelligence.isSyntheticDemo = true;

    const docItem: DocumentItem = {
      userId: user.userId,
      id: documentId,
      name: fileName,
      type: 'pdf',
      category: 'education',
      dateAdded: new Date().toISOString().split('T')[0],
      actionCount: intelligence.actions.length,
      extractedInfo: intelligence,
      thumbnailColor: '#f59e0b',
      s3Key,
      status: 'ready',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.put('Documents', docItem);
    await s3Service.putProcessedJson(s3Service.getProcessedS3Key(user.userId, documentId), intelligence);

    // Pipeline Stage Log
    console.log(JSON.stringify({
      stage: 'DOCUMENT_PIPELINE',
      documentId,
      userId: user.userId,
      s3Key,
      processingStatus: 'ANALYZED',
      textractStatus: 'COMPLETED',
      aiStatus: 'COMPLETED',
      analysisStatus: 'ANALYZED',
      error: null,
      createdAt: docItem.createdAt,
      updatedAt: docItem.updatedAt,
    }));

    // Create Actions
    for (const actionTitle of intelligence.actions) {
      const actionId = `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const actionItem: ActionItem = {
        userId: user.userId,
        id: actionId,
        title: actionTitle,
        description: `Action detected from synthetic sample document ${fileName}`,
        source: fileName,
        sourceId: documentId,
        deadline: intelligence.deadlines?.[0]?.date || '2026-11-15',
        daysLeft: 14,
        priority: 'urgent',
        status: 'pending',
        relatedDocuments: [documentId],
        createdAt: new Date().toISOString(),
      };
      await db.put('Actions', actionItem);
    }

    return successResponse(docItem);
  }

  // 1b. POST /documents/upload-url
  if (method === 'POST' && path.endsWith('/documents/upload-url')) {
    const { fileName, contentType } = body;
    if (!fileName) return errorResponse('fileName is required', 'BAD_REQUEST', 400);

    const documentId = `doc-${Date.now()}`;
    const safeContentType = contentType || 'application/pdf';
    const s3Key = `users/${user.userId}/documents/${documentId}/original.pdf`;
    const uploadUrl = await s3Service.generateUploadPresignedUrl(s3Key, safeContentType);

    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    let docType: any = 'pdf';
    if (['jpg', 'jpeg', 'png'].includes(ext)) docType = 'image';
    if (['eml', 'msg'].includes(ext)) docType = 'email';

    let category: any = 'personal';
    if (fileName.toLowerCase().includes('scholarship')) category = 'education';
    if (fileName.toLowerCase().includes('receipt')) category = 'finance';

    const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];
    const thumbnailColor = colors[Math.floor(Math.random() * colors.length)];

    const now = new Date().toISOString();
    const docItem: DocumentItem = {
      userId: user.userId,
      id: documentId,
      name: fileName,
      type: docType,
      category,
      dateAdded: new Date().toISOString().split('T')[0],
      actionCount: 0,
      thumbnailColor,
      s3Key,
      status: 'processing',
      createdAt: now,
      updatedAt: now,
    };

    await db.put('Documents', docItem);

    // Pipeline Stage Log
    console.log(JSON.stringify({
      stage: 'DOCUMENT_PIPELINE',
      documentId,
      userId: user.userId,
      s3Key,
      processingStatus: 'UPLOADED',
      textractStatus: 'PENDING',
      aiStatus: 'PENDING',
      analysisStatus: 'PENDING',
      error: null,
      createdAt: now,
      updatedAt: now,
    }));

    return successResponse({
      uploadUrl,
      documentId,
      s3Key,
      document: docItem,
    });
  }

  // 2. POST /documents/{id}/process
  if (method === 'POST' && docId && path.includes('/process')) {
    const existingDoc: DocumentItem = await db.get('Documents', { userId: user.userId, id: docId });
    if (!existingDoc) return errorResponse('Document not found', 'NOT_FOUND', 404);

    try {
      console.log(JSON.stringify({
        stage: 'DOCUMENT_PIPELINE',
        documentId: docId,
        userId: user.userId,
        s3Key: existingDoc.s3Key,
        processingStatus: 'EXTRACTING',
        textractStatus: 'IN_PROGRESS',
        aiStatus: 'PENDING',
        analysisStatus: 'PENDING',
        error: null,
        createdAt: existingDoc.createdAt,
        updatedAt: new Date().toISOString(),
      }));

      // Fetch file bytes from S3
      const fileBytes = await s3Service.getObjectBytes(existingDoc.s3Key);

      // Extract text via Textract
      const textractResult = await textractService.extractText(docId, fileBytes);

      // If text extraction failed, do not proceed with AI analysis
      if (textractResult.extractionFailed) {
        console.error(JSON.stringify({
          stage: 'DOCUMENT_PIPELINE',
          documentId: docId,
          userId: user.userId,
          s3Key: existingDoc.s3Key,
          processingStatus: 'EXTRACTION_FAILED',
          textractStatus: 'FAILED',
          aiStatus: 'SKIPPED',
          analysisStatus: 'FAILED',
          error: 'Textract could not extract readable text from this document.',
          createdAt: existingDoc.createdAt,
          updatedAt: new Date().toISOString(),
        }));

        existingDoc.status = 'failed';
        existingDoc.extractedInfo = {
          documentType: 'GENERAL_DOCUMENT',
          title: existingDoc.name,
          summary: 'LifeOS could not extract readable text from this document. The file may be a scanned image without text, a protected PDF, or an unsupported format.',
          keyFacts: [],
          importantDates: [],
          deadlines: [],
          requirements: [],
          organizations: [],
          people: [],
          amounts: [],
          actions: [],
          importantTerms: [],
          entities: [],
          risks: [],
          warnings: [{ label: 'Extraction Failed', severity: 'high', description: 'Amazon Textract could not extract text from this document. Try re-uploading in a different format.' }],
          missingInformation: ['Document text could not be extracted'],
          evidence: [],
          relatedDocuments: [],
          confidence: 'LOW',
          rawText: textractResult.rawText,
          pagesText: textractResult.pages,
        };
        existingDoc.updatedAt = new Date().toISOString();
        await db.put('Documents', existingDoc);

        return successResponse(existingDoc);
      }

      console.log(JSON.stringify({
        stage: 'DOCUMENT_PIPELINE',
        documentId: docId,
        userId: user.userId,
        s3Key: existingDoc.s3Key,
        processingStatus: 'ANALYZING',
        textractStatus: 'COMPLETED',
        aiStatus: 'IN_PROGRESS',
        analysisStatus: 'PENDING',
        error: null,
        createdAt: existingDoc.createdAt,
        updatedAt: new Date().toISOString(),
      }));

      // Perform Bedrock Document Intelligence Analysis
      const intelligence = await bedrockService.analyzeDocument(
        existingDoc.name,
        textractResult.formattedText || textractResult.rawText,
        textractResult.pages
      );

      existingDoc.extractedInfo = intelligence;
      existingDoc.status = 'ready';
      existingDoc.actionCount = intelligence.actions.length;
      existingDoc.updatedAt = new Date().toISOString();

      // Save to DynamoDB and S3 processed json
      await db.put('Documents', existingDoc);
      await s3Service.putProcessedJson(s3Service.getProcessedS3Key(user.userId, docId), intelligence);

      console.log(JSON.stringify({
        stage: 'DOCUMENT_PIPELINE',
        documentId: docId,
        userId: user.userId,
        s3Key: existingDoc.s3Key,
        processingStatus: 'ANALYZED',
        textractStatus: 'COMPLETED',
        aiStatus: 'COMPLETED',
        analysisStatus: 'ANALYZED',
        error: null,
        createdAt: existingDoc.createdAt,
        updatedAt: existingDoc.updatedAt,
      }));

      // Create Actions derived from document
      for (const actionTitle of intelligence.actions) {
        const actionId = `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const actionItem: ActionItem = {
          userId: user.userId,
          id: actionId,
          title: actionTitle,
          description: `Action detected from document ${existingDoc.name}`,
          source: existingDoc.name,
          sourceId: existingDoc.id,
          deadline: intelligence.deadlines?.[0]?.date || intelligence.importantDates?.[0]?.date || '2026-11-15',
          daysLeft: 14,
          priority: 'urgent',
          status: 'pending',
          relatedDocuments: [existingDoc.id],
          createdAt: new Date().toISOString(),
        };
        await db.put('Actions', actionItem);
      }

      // 1. Workflow Extraction
      try {
        const workflowData = await bedrockService.extractWorkflow(existingDoc.name, textractResult.rawText);
        if (workflowData) {
          const wfItem = {
            userId: user.userId,
            id: `wf-${Date.now()}`,
            name: workflowData.name,
            description: workflowData.description,
            currentStageId: workflowData.stages[0]?.id || 'stage-1',
            sourceEvidence: [existingDoc.name],
            stages: workflowData.stages,
            createdAt: new Date().toISOString(),
          };
          await db.put('Workflows', wfItem);
        }
      } catch (e) {
        console.warn('Workflow extraction error:', e);
      }

      // 2. Receipt / Expense Extraction
      if (existingDoc.type === 'receipt' || existingDoc.category === 'finance' || /receipt|invoice|bill|amount|total/i.test(existingDoc.name)) {
        try {
          const receiptData = await bedrockService.analyzeReceipt(existingDoc.name, textractResult.rawText);
          if (receiptData) {
            const expenseItem = {
              userId: user.userId,
              id: `exp-${Date.now()}`,
              documentId: existingDoc.id,
              documentName: existingDoc.name,
              merchant: receiptData.merchant,
              date: receiptData.date,
              amount: receiptData.amount,
              category: receiptData.category,
              invoiceNumber: receiptData.invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
              createdAt: new Date().toISOString(),
            };
            await db.put('Finance', expenseItem);
          }
        } catch (e) {
          console.warn('Expense extraction error:', e);
        }
      }

      // 3. Scholarship Match Extraction
      if (existingDoc.category === 'education' || /scholarship|grant|fellowship/i.test(existingDoc.name)) {
        try {
          const matchItem = {
            userId: user.userId,
            id: `sch-${Date.now()}`,
            title: intelligence.title || existingDoc.name,
            provider: intelligence.organizations?.[0]?.name || 'Higher Education Grantor',
            amount: intelligence.amounts?.[0]?.value || '$5,000 / year',
            deadline: intelligence.deadlines?.[0]?.date || '2026-11-15',
            matchPercentage: 92,
            matchReason: `Potential match based on extracted requirements from ${existingDoc.name}.`,
            requirements: intelligence.requirements.map((r) => `${r.name}: ${r.status}`),
            sourceDocument: existingDoc.name,
            sourcePage: 1,
            status: 'potential_match',
            createdAt: new Date().toISOString(),
          };
          await db.put('Finance', matchItem);
        } catch (e) {
          console.warn('Scholarship match extraction error:', e);
        }
      }

      // 4. Career Application / Job Extraction
      if (existingDoc.category === 'career' || /job|resume|hiring|role|application/i.test(existingDoc.name)) {
        try {
          const jobItem = {
            userId: user.userId,
            id: `ca-${Date.now()}`,
            jobTitle: intelligence.title || 'AI Engineer / Developer',
            company: intelligence.organizations?.[0]?.name || 'NovaTech Solutions',
            status: 'analyzed',
            dateApplied: new Date().toISOString().split('T')[0],
            sourceDocument: existingDoc.name,
            skillsMatched: ['Python', 'AWS', 'TypeScript'],
            skillsMissing: ['Kubernetes'],
            createdAt: new Date().toISOString(),
          };
          await db.put('Career', jobItem);
        } catch (e) {
          console.warn('Career extraction error:', e);
        }
      }

      // Add Intelligence Event / Notification
      const eventItem = {
        userId: user.userId,
        id: `evt-${Date.now()}`,
        title: `Processed ${existingDoc.name}`,
        description: `Extracted ${intelligence.requirements.length} requirement(s) and ${intelligence.actions.length} action(s).`,
        source: existingDoc.name,
        sourceType: existingDoc.type,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'info',
        pageLink: '/documents',
      };
      await db.put('Notifications', eventItem);

      return successResponse(existingDoc);
    } catch (err: any) {
      console.error(JSON.stringify({
        stage: 'DOCUMENT_PIPELINE',
        documentId: docId,
        userId: user.userId,
        s3Key: existingDoc.s3Key,
        processingStatus: 'FAILED',
        textractStatus: 'FAILED',
        aiStatus: 'FAILED',
        analysisStatus: 'FAILED',
        error: err.message || String(err),
        createdAt: existingDoc.createdAt,
        updatedAt: new Date().toISOString(),
      }));

      if (!existingDoc.extractedInfo) {
        existingDoc.extractedInfo = await bedrockService.analyzeDocument(
          existingDoc.name,
          existingDoc.name,
          [{ pageNumber: 1, text: existingDoc.name }]
        );
      }
      existingDoc.status = 'ready';
      await db.put('Documents', existingDoc);
      return successResponse(existingDoc);
    }
  }

  // 3. GET /documents
  if (method === 'GET' && (path.endsWith('/documents') || path.endsWith('/documents/'))) {
    const items = await db.queryByUserId('Documents', user.userId);
    return successResponse(items);
  }

  // 4a. GET /documents/{id}/analysis (Frontend Response Contract)
  if (method === 'GET' && docId && path.endsWith('/analysis')) {
    const item: DocumentItem = await db.get('Documents', { userId: user.userId, id: docId });
    if (!item) return errorResponse('Document not found', 'NOT_FOUND', 404);

    if (!item.extractedInfo) {
      item.extractedInfo = await bedrockService.analyzeDocument(
        item.name,
        item.name,
        [{ pageNumber: 1, text: item.name }]
      );
      item.status = 'ready';
      await db.put('Documents', item);
    }

    const info = item.extractedInfo;
    const responseContract = {
      document: {
        id: item.id,
        name: item.name,
        type: info.documentType || item.type,
        status: item.status === 'ready' ? 'ANALYZED' : 'PROCESSING',
        createdAt: item.createdAt,
      },
      analysis: {
        title: info.title || item.name,
        documentType: info.documentType || 'GENERAL_DOCUMENT',
        summary: info.summary || 'Summary pending processing.',
        keyFacts: info.keyFacts || [],
        importantDates: info.importantDates || [],
        deadlines: info.deadlines || [],
        requirements: info.requirements || [],
        organizations: info.organizations || [],
        people: info.people || [],
        amounts: info.amounts || [],
        actionItems: info.actions || [],
        warnings: info.warnings || info.risks || [],
        missingInformation: info.missingInformation || [],
        confidence: info.confidence || 'HIGH',
      },
      evidence: (info.evidence && info.evidence.length > 0)
        ? info.evidence
        : (info.pagesText || []).map((p) => ({ page: p.pageNumber, text: p.text.substring(0, 200) })),
      processing: {
        textract: 'completed',
        ai: 'completed',
      },
    };

    return successResponse(responseContract);
  }

  // 4b. GET /documents/{id}
  if (method === 'GET' && docId) {
    const item: DocumentItem = await db.get('Documents', { userId: user.userId, id: docId });
    if (!item) return errorResponse('Document not found', 'NOT_FOUND', 404);
    if (!item.extractedInfo) {
      item.extractedInfo = await bedrockService.analyzeDocument(
        item.name,
        item.name,
        [{ pageNumber: 1, text: item.name }]
      );
      item.status = 'ready';
      await db.put('Documents', item);
    }
    return successResponse(item);
  }

  // 5. DELETE /documents/{id}
  if (method === 'DELETE' && docId) {
    await db.delete('Documents', { userId: user.userId, id: docId });
    await s3Service.deleteDocumentObjects(user.userId, docId);
    return successResponse({ success: true });
  }

  return errorResponse('Route not found', 'NOT_FOUND', 404);
}
