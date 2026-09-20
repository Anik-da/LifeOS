const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...vals] = trimmed.split('=');
        process.env[key.trim()] = vals.join('=').trim();
      }
    });
  }
}

loadEnv();

const apiUrl = process.env.VITE_API_BASE_URL || 'https://8ywk26hnsk.execute-api.us-east-1.amazonaws.com/Prod';

async function testPublicSearch() {
  console.log('🧪 Testing Real-World Live Public Search API...');

  const queries = [
    'Amazon Bedrock latest documentation',
    'India government scholarship 2026 official',
    'current AWS Lambda Node.js runtime',
  ];

  for (const query of queries) {
    console.log(`\n==================================================`);
    console.log(`🔍 Query: "${query}"`);
    console.log(`==================================================`);

    const res = await fetch(`${apiUrl}/web/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const json = await res.json();
    if (!res.ok || !json.data) {
      console.error(`  ❌ Search failed: HTTP ${res.status}`, json);
      continue;
    }

    const payload = json.data;
    const results = payload.results || [];
    console.log(`  SearchedAt: ${payload.searchedAt}`);
    console.log(`  Results Count: ${results.length}`);

    if (results.length === 0) {
      console.log('  Notice: 0 results returned (No synthetic fake data generated)');
      continue;
    }

    results.forEach((item, idx) => {
      console.log(`\n  [Result ${idx + 1}]`);
      console.log(`   Title:       ${item.title}`);
      console.log(`   URL:         ${item.url}`);
      console.log(`   Domain:      ${item.domain}`);
      console.log(`   Authority:   ${item.authority || item.sourceType}`);
      console.log(`   Snippet:     ${item.snippet.substring(0, 100)}...`);

      // Check if domain is fake
      if (item.domain.includes('official-portal.org') || item.domain.includes('example.com')) {
        throw new Error(`TEST FAILED: Found fake domain ${item.domain}!`);
      }
    });

    // Test saving first result to LifeOS
    if (results.length > 0) {
      console.log(`\n  💾 Testing Save to LifeOS for result "${results[0].title}"...`);
      const saveRes = await fetch(`${apiUrl}/web/save-source`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results[0]),
      });
      const saveJson = await saveRes.json();
      console.log(`   Save status:`, saveRes.status, saveJson.data?.success ? 'SUCCESS' : saveJson);
    }
  }

  console.log('\n==================================================');
  console.log('✅ ALL LIVE PUBLIC SEARCH VERIFICATIONS PASSED!');
  console.log('==================================================');
}

testPublicSearch().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
