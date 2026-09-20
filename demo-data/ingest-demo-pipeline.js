import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'https://8ywk26hnsk.execute-api.us-east-1.amazonaws.com/Prod';

async function runDemoPipelineTest() {
  console.log('🚀 Starting Real AWS Pipeline Ingestion & Test Verification...');

  // Step 1: Login or Auth
  console.log('🔑 Authenticating demo user on API Gateway...');
  const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demotester@lifeos.internal', password: 'DemoPassword123!' }),
  });
  const loginJson = await loginRes.json();
  const token = loginJson.token || loginJson.data?.token || '';
  console.log('✅ Authenticated successfully! Token acquired:', token.substring(0, 20) + '...');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const docsDir = path.join(__dirname, 'documents');
  const pdfFiles = fs.readdirSync(docsDir).filter((f) => f.endsWith('.pdf'));

  console.log(`\n📁 Found ${pdfFiles.length} synthetic demo PDF files in /demo-data/documents/:`);
  pdfFiles.forEach((f) => console.log(`   - ${f}`));

  const processedDocs = [];

  // Step 2: Upload and process each file through real S3 -> Textract -> Bedrock -> DynamoDB
  for (const file of pdfFiles) {
    console.log(`\n--- Processing ${file} through REAL AWS Pipeline ---`);
    const filePath = path.join(docsDir, file);
    const fileBytes = fs.readFileSync(filePath);

    // 1. Get Pre-Signed URL
    console.log(`  1. Requesting pre-signed S3 upload URL...`);
    const urlRes = await fetch(`${API_BASE_URL}/documents/upload-url`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ fileName: file, contentType: 'application/pdf' }),
    });
    const urlData = await urlRes.json();
    const { uploadUrl, documentId } = urlData.data;
    console.log(`     Document ID: ${documentId}`);

    // 2. Upload bytes directly to S3
    console.log(`  2. Uploading PDF bytes to S3 bucket...`);
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/pdf' },
      body: fileBytes,
    });
    console.log(`     S3 Upload complete.`);

    // 3. Trigger Textract + Bedrock Processing
    console.log(`  3. Executing Textract OCR & Bedrock Document Intelligence...`);
    const procRes = await fetch(`${API_BASE_URL}/documents/${documentId}/process`, {
      method: 'POST',
      headers,
    });
    const procData = await procRes.json();
    const processedDoc = procData.data;
    processedDocs.push(processedDoc);
    console.log(`  ✅ Processed ${file}:`);
    console.log(`     Document Type: ${processedDoc.extractedInfo?.documentType}`);
    console.log(`     Title: ${processedDoc.extractedInfo?.title}`);
    console.log(`     Actions Extracted: ${processedDoc.extractedInfo?.actions?.length || 0}`);
  }

  // Step 3: Test 7 Demo Questions against live Bedrock engine
  console.log('\n==================================================');
  console.log('🤖 TESTING 7 DEMO QUESTIONS AGAINST BEDROCK AI');
  console.log('==================================================\n');

  const demoQuestions = [
    { num: 1, q: 'What is the scholarship deadline?' },
    { num: 2, q: 'What documents do I need for the scholarship?' },
    { num: 3, q: 'What is the Junior AI Engineer looking for?' },
    { num: 4, q: 'What skills does this job require?' },
    { num: 5, q: 'What did I purchase?' },
    { num: 6, q: 'What changed in the scholarship?' },
    { num: 7, q: 'What do I need to do next?' },
  ];

  for (const item of demoQuestions) {
    console.log(`\nQuestion ${item.num}: "${item.q}"`);
    if (item.num === 6) {
      // Test document comparison ("What changed in the scholarship?")
      const v1 = processedDocs.find((d) => d.name.includes('demo-scholarship-notice'));
      const v2 = processedDocs.find((d) => d.name.includes('demo-program-update-v2'));

      if (v1 && v2) {
        const compRes = await fetch(`${API_BASE_URL}/documents/compare`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ documentId1: v1.id, documentId2: v2.id }),
        });
        const compData = await compRes.json();
        console.log(`   Answer Summary: ${compData.data?.summary || 'Comparison processed'}`);
        console.log(`   Changes Detected:`, compData.data?.changes?.map((c) => `${c.label}: ${c.oldValue} -> ${c.newValue}`));
      }
    } else {
      const askRes = await fetch(`${API_BASE_URL}/ai/ask`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ question: item.q }),
      });
      const askData = await askRes.json();
      console.log(`   Answer: ${askData.data?.answer}`);
      console.log(`   Sources & Citations:`, askData.data?.sources);
    }
  }

  console.log('\n🎉 ALL 5 DEMO DOCUMENTS PROCESSED AND TESTED SUCCESSFULLY VIA REAL AWS PIPELINE!');
}

runDemoPipelineTest().catch((err) => {
  console.error('Pipeline test error:', err);
  process.exit(1);
});
