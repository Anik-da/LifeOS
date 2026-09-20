# LifeOS — Personal Action Intelligence

> **Core Philosophy**: *"Your information is everywhere. LifeOS connects it."*  
> **AWS Hackathon Track**: First Commit | Bharat Builds Tour | WeMakeDevs × AWS (Ship It + Best UI Track)  
> **Live Shareable Web App**: [http://062577348302-us-east-1-lifeos-web.s3-website-us-east-1.amazonaws.com](http://062577348302-us-east-1-lifeos-web.s3-website-us-east-1.amazonaws.com)  
> **Live AWS API Gateway Endpoint**: `https://8ywk26hnsk.execute-api.us-east-1.amazonaws.com/Prod`

---

## 1. Executive Summary & Problem Statement

In today's digital life, an individual's most critical information is hopelessly scattered across silos:
- PDF scholarship notifications sitting in download folders.
- Tax and electronics purchase receipts trapped in email attachments.
- University circulars buried inside university portal pages.
- Job descriptions bookmarked on LinkedIn or job boards.
- Urgent emails that may or may not be malicious phishing attempts.

Most tools treat documents as **dead static storage** (like Google Drive or Dropbox) or **generic conversational chatbots** (which hallucinate, have no source verification, and cannot take real-world action).

**LifeOS solves this fundamentally**:
LifeOS is an **event-driven Personal Action Intelligence platform** powered by AWS. It unifies scattered personal documents, extracts deep structured intelligence, reconciles private facts against verified real-world public web data, detects changes across document versions, safeguards users against scams, and translates static text into **proactive, scheduled real-world actions**.

---

## 2. Signature Visual Concept: YOUR WORLD ↔ REAL WORLD

At the heart of LifeOS is the **Dual Knowledge Intelligence Engine**:

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│           YOUR WORLD            │           │           REAL WORLD            │
│       (Private Knowledge)       │           │       (Public Knowledge)        │
├─────────────────────────────────┤           ├─────────────────────────────────┤
│ • Uploaded PDFs & Receipts      │           │ • Verified Gov Portals (.gov)   │
│ • University / College Notices  │    VS     │ • University Examination Boards │
│ • Employment Offers & Resumes   │  ═══════  │ • Corporate Hiring Portals      │
│ • Private Deadlines & Clauses   │           │ • Live Regulatory Changes       │
│ • Isolated strictly by userId   │           │ • Real-time Web Search Grounding│
└─────────────────────────────────┘           └─────────────────────────────────┘
                                       │
                                       ▼
                   ┌───────────────────────────────────────┐
                   │       LIFEOS CONNECTED ENGINE         │
                   │ • Detects Deadline Extensions         │
                   │ • Identifies Missing Requirements     │
                   │ • Dual Grounded Citations (Page + URL)│
                   │ • Generates Scheduled Actions         │
                   └───────────────────────────────────────┘
```

Every claim produced by LifeOS features **Dual Citations**:
1. **Private Source Citation**: Exact document name and page number (e.g. `[Scholarship_Circular.pdf, Page 2]`).
2. **Public Real-World Reference**: Live domain and URL of the verified authority (e.g. `[ugc.gov.in/notifications]`).

---

## 3. The 5-Stage Intelligence Cycle

LifeOS does not wait for user prompts; it executes an autonomous 5-stage lifecycle upon document ingestion:

$$\textbf{UNDERSTAND} \longrightarrow \textbf{CONNECT} \longrightarrow \textbf{VERIFY} \longrightarrow \textbf{ACT} \longrightarrow \textbf{REMEMBER}$$

1. **UNDERSTAND (OCR & Extraction)**:
   - Private upload via short-lived Amazon S3 Pre-Signed URLs.
   - Amazon Textract analyzes multi-page documents, extracting text blocks, key-value pairs, and table hierarchies while strictly preserving physical page indexes.
   - Amazon Bedrock extracts structured metadata: document type, primary entities, monetary figures, effective dates, and critical deadlines.

2. **CONNECT (Dual RAG Correlation)**:
   - Correlates extracted private document claims with live public web indices.
   - Cross-references requirements against official sources to spot discrepancies, fee changes, or eligibility criteria.

3. **VERIFY (Diffing & Security Checks)**:
   - **Document Diff Engine**: Compares revision pairs (e.g., Notice v1 vs. Notice v2) to pinpoint exact clause additions, deadline shifts, and policy alterations.
   - **Heuristic Scam Scanner**: Analyzes incoming receipts or notices for payment fraud indicators, spoofed sender domains, urgency traps, and suspicious bank account numbers.

4. **ACT (Proactive Action Execution)**:
   - Synthesizes action items categorized by urgency: High (Action Required), Medium (Verification Needed), and Low (FYI).
   - Generates one-click workflow triggers (e.g., "Add Scholarship Application to Calendar", "File Laptop Warranty Claim").

5. **REMEMBER (Automated Event Delivery)**:
   - Amazon EventBridge Scheduler triggers automated reminders before critical deadlines.
   - Amazon SES delivers verified, branded email notifications directly to the user's inbox.

---

## 4. Specialized LifeOS Workspaces

LifeOS organizes personal intelligence into dedicated domain modules:

### 🎓 Academic & Institutional Workspace
- Ingests university notices, grade cards, and scholarship circulars.
- Automatic extraction of submission dates, minimum GPA criteria, and required annexures.
- Side-by-side version comparison showing exactly what changed between official revisions.

### 💼 Career & Skill Intelligence Hub
- Ingests candidate resumes and job postings.
- Deep skill gap analysis highlighting missing qualifications and recommended proficiencies.
- **Online Job Opportunities Engine**: Discovers live, real-world job openings across remote, hybrid, and on-site modes with direct "Track in LifeOS" workflow integration.

### 💳 Finance & Purchase Ledger
- Extracts merchant details, invoice numbers, tax breakdowns, and payment methods from receipts and bills.
- Calculates warranty expiration dates and generates proactive reminders before coverage lapses.
- Categorizes spending without exposing raw financial documents.

### 🛡️ Security & Anti-Phishing Guard
- Evaluates documents and notices against known phishing patterns and impersonation vectors.
- Flags suspicious sender headers, fraudulent payment links, and unverified bank details.
- Clear safety indicators: `VERIFIED`, `WARNING`, or `HIGH RISK FRAUD`.

### ⚡ Centralized Knowledge Command Center
- Instant keyboard navigation:
  - `Ctrl + K` or `Cmd + K`: Global Knowledge Search & Natural Language Query.
  - `Ctrl + U` or `Cmd + U`: Instant Document Ingestion.
- Natural language Q&A across the user's entire document archive with zero hallucination.

---

## 5. End-to-End AWS Serverless Architecture

LifeOS is built entirely on native AWS serverless primitives, ensuring enterprise-grade scalability, zero server maintenance, and cost efficiency.

```mermaid
flowchart TD
    subgraph Frontend["Client Tier (Web & Mobile)"]
        UI["React 18 + TypeScript + Vite SPA\n(Hosted on Amazon S3 Static Website)"]
        Theme["Dynamic Dark/Light Glassmorphism Design System"]
    end

    subgraph Auth["Identity & Access Management"]
        Cognito["Amazon Cognito User Pool\n(JWT Claims, Email Verification, Auto-Logout)"]
    end

    subgraph API["API & Ingress Layer"]
        APIGateway["Amazon API Gateway\n(Regional REST API / Prod Stage / CORS)"]
    end

    subgraph Compute["Serverless Compute Tier"]
        LambdaHandler["Unified AWS Lambda Handler\n(Node.js 22 Runtime / TypeScript)"]
        Middleware["Auth & Tenant Isolation Middleware\n(Extracts sub/userId from JWT)"]
    end

    subgraph AI["Artificial Intelligence & OCR Tier"]
        Textract["Amazon Textract\n(Multi-Page Layout & OCR Extraction)"]
        Bedrock["Amazon Bedrock\n(Claude 3.5 Haiku Foundation Model)"]
        WebCrawler["Public Grounding Engine\n(Real-World Search & Verification)"]
    end

    subgraph Storage["Persistence & Isolation Tier"]
        S3Storage["Amazon S3 Document Vault\n(Encrypted Private Objects / users/{userId}/*)"]
        DDB_Docs["DynamoDB: Documents Table"]
        DDB_Actions["DynamoDB: Actions Table"]
        DDB_Workflows["DynamoDB: Workflows Table"]
        DDB_Changes["DynamoDB: Changes Table"]
        DDB_Notifications["DynamoDB: Notifications Table"]
        DDB_Career["DynamoDB: Career Table"]
        DDB_Finance["DynamoDB: Finance Table"]
        DDB_Security["DynamoDB: Security Table"]
    end

    subgraph Async["Event-Driven Orchestration Tier"]
        EventBridge["Amazon EventBridge Custom Bus\n(DocumentLifecycle & Alert Events)"]
        Scheduler["Amazon EventBridge Scheduler\n(Time-Targeted Deadlines)"]
        SES["Amazon SES\n(Branded Email Notification Delivery)"]
        SQS["Amazon SQS Dead Letter & Buffer Queue"]
    end

    UI -->|1. Authenticate & Obtain Tokens| Cognito
    UI -->|2. HTTPS REST Requests with Bearer JWT| APIGateway
    APIGateway --> LambdaHandler
    LambdaHandler --> Middleware
    Middleware -->|3. Generate Pre-Signed S3 URL| S3Storage
    UI -->|4. Direct Binary Upload| S3Storage
    LambdaHandler -->|5. Trigger Multi-Page OCR| Textract
    Textract -->|6. Page Text & Geometry| LambdaHandler
    LambdaHandler -->|7. Grounded AI Reasoning| Bedrock
    LambdaHandler -->|8. Public Web Verification| WebCrawler
    LambdaHandler -->|9. Isolated Partition Queries (PK = userId)| Storage
    LambdaHandler -->|10. Schedule Reminders| Scheduler
    Scheduler -->|11. Trigger Alert| SES
    LambdaHandler -->|12. Publish System Events| EventBridge
    EventBridge --> SQS
```

---

## 6. AWS Services Used & Production Value

| AWS Service | Architectural Purpose | Production Value Provided |
| :--- | :--- | :--- |
| **Amazon Bedrock** | Foundation Model AI Layer | Analyzes raw OCR text, structures facts, executes RAG question answering, and detects document discrepancies using Anthropic Claude 3.5 Haiku. |
| **Amazon Textract** | Multi-Page OCR Engine | Extracts clean document text while preserving physical page boundaries, enabling exact page citations. |
| **Amazon DynamoDB** | Multi-Tenant Data Store | 8 serverless on-demand tables partitioned strictly by `userId`. Sub-millisecond reads/writes with zero operational overhead. |
| **Amazon Cognito** | Authentication & User Management | Issues cryptographic JWT tokens, manages email verification and password reset workflows, and guarantees tenant separation. |
| **Amazon S3** | Dual Object Storage | Hosts the production React web bundle via static website hosting, and provides encrypted private document storage with pre-signed URLs. |
| **AWS Lambda** | Unified Microservices Handler | Node.js 22 serverless compute hosting modular routes for documents, actions, workflows, AI chat, career, finance, and security. |
| **Amazon API Gateway** | Managed REST API Ingress | Provides regional HTTP entry points, handles CORS pre-flight, rate-limiting, and routes traffic directly to Lambda. |
| **Amazon EventBridge** | Event Routing & Scheduling | Powers scheduled deadline alerts (`EventBridge Scheduler`) and broadcasts asynchronous lifecycle events. |
| **Amazon SES** | Email Notification Service | Dispatches real-time verification codes, priority deadline alerts, and document processing summaries to users. |
| **Amazon SQS** | Asynchronous Buffering | Decouples document ingestion bursts and provides dead-letter queue resilience. |
| **Amazon CloudWatch** | Observability & Telemetry | Live execution logs, API response latency metrics, and error alarm tracking. |

---

## 7. Security, Privacy & Multi-Tenant Isolation

LifeOS is engineered with a strict **Privacy-First Security Architecture**:

1. **Zero Client Secrets**:
   - AWS access keys (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) are never embedded in the frontend bundle or client state.
   - The frontend communicates solely through authorized REST API calls using ephemeral Cognito JWTs.

2. **Server-Side Tenant Identity Derivation**:
   - Client requests cannot spoof another user's identity. The backend middleware derives `userId` directly from validated Cognito JWT claims (`event.requestContext.authorizer.claims.sub`).
   - Every DynamoDB query strictly enforces `KeyConditionExpression: 'userId = :uid'`. User A can never query or view User B's documents.

3. **Ephemeral Pre-Signed URL Transfers**:
   - Private documents are never made public. S3 buckets block all public reads. Uploads and downloads occur through cryptographic pre-signed URLs valid for minutes.

4. **Automatic Session Hygiene**:
   - The application automatically terminates local sessions on tab/browser restart, preventing unauthorized access on shared devices.

5. **Least-Privilege IAM Roles**:
   - Lambda execution roles are granted narrow permissions scoped specifically to the project's DynamoDB tables, S3 prefixes, and Bedrock model IDs.

---

## 8. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js 22, TypeScript, AWS SDK v3 (`@aws-sdk/client-bedrock-runtime`, `@aws-sdk/client-textract`, `@aws-sdk/client-dynamodb`, `@aws-sdk/client-cognito-identity-provider`, `@aws-sdk/client-s3`, `@aws-sdk/client-ses`, `@aws-sdk/client-scheduler`).
- **Cloud Infrastructure**: AWS CloudFormation / SAM (`template.yaml`), AWS CLI, Node.js deployment automation scripts.

---

## 9. Local Development & Deployment Guide

### Prerequisites
- Node.js 20+ and npm
- AWS CLI configured with administrator permissions (`aws configure`)

### Installation & Build
```bash
# Clone the repository
git clone https://github.com/Anik-da/LifeOS.git
cd LifeOS

# Install root dependencies
npm install

# Install backend dependencies
npm --prefix backend install

# Build frontend and backend bundles
npm run build
npm --prefix backend run build
```

### Full Cloud Deployment
```bash
# 1. Deploy AWS Backend Stack (Cognito, DynamoDB, S3, IAM, Lambda, API Gateway)
node backend/scripts/deploy.js

# 2. Deploy Frontend Application to S3 Website Hosting
node backend/scripts/deploy-web.js

# 3. (Optional) Run Security & API Validation Suite
node backend/scripts/test-validation.js
```

---

## 10. Demo Datasets & Reproducibility

The repository includes pre-built synthetic test documents in [`demo-data/`](./demo-data):
- `Sample_Scholarship_Notice_v1.txt` & `Sample_Scholarship_Notice_v2.txt`: Demonstrates version comparison, deadline extension detection, and clause diffing.
- `Sample_Job_Description.txt` & `Sample_Resume.txt`: Demonstrates career skill-gap analysis and resume alignment.
- `Sample_Laptop_Receipt.txt`: Demonstrates financial receipt parsing, tax extraction, and warranty reminders.
- `Sample_Phishing_Email.txt`: Demonstrates the security engine's scam detection and heuristic risk flagging.

To ingest the full demo dataset into your deployment with one command:
```bash
node backend/scripts/ingest-demo.js
```
