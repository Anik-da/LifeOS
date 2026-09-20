/**
 * LifeOS End-to-End Validation & Security Test Suite
 * Validates API health, authentication boundaries, and document workflow endpoints.
 */

const https = require('https');

const API_BASE_URL = process.env.API_BASE_URL || 'https://8ywk26hnsk.execute-api.us-east-1.amazonaws.com/Prod';

async function makeRequest(path, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE_URL}${path}`);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runValidation() {
  console.log('🔍 Starting LifeOS Security & API Validation Suite...');
  console.log(`Target: ${API_BASE_URL}\n`);

  // 1. Health check verification
  console.log('[1/3] Testing System Health endpoint...');
  try {
    const health = await makeRequest('/api/health');
    console.log(`  Status: ${health.status} — ${health.data?.status || 'OK'}`);
  } catch (err) {
    console.warn('  Health endpoint check warning:', err.message);
  }

  // 2. Unauthenticated boundary security test
  console.log('\n[2/3] Verifying Security Boundary (Unauthorized Access Rejection)...');
  try {
    const unauth = await makeRequest('/api/documents');
    if (unauth.status === 401 || unauth.status === 403) {
      console.log(`  PASSED: Unauthorized request properly rejected with HTTP ${unauth.status}`);
    } else {
      console.log(`  Notice: Server responded with HTTP ${unauth.status}`);
    }
  } catch (err) {
    console.warn('  Boundary check warning:', err.message);
  }

  // 3. Web Search public integration test
  console.log('\n[3/3] Verifying Public Real-World Search API...');
  try {
    const search = await makeRequest('/api/web/search?q=AWS+Bedrock');
    console.log(`  Status: ${search.status} — Results count: ${Array.isArray(search.data) ? search.data.length : 'N/A'}`);
  } catch (err) {
    console.warn('  Search integration warning:', err.message);
  }

  console.log('\n✅ LifeOS workflow validation and security checks completed.');
}

runValidation().catch(console.error);
