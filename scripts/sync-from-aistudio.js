// scripts/sync-from-aistudio.js
const DEFAULT_ENDPOINT = process.env.AI_STUDIO_ENDPOINT || 'https://aistudio.google.com/app/api/sync';
const TOKEN = process.env.AI_STUDIO_TOKEN;

if (!TOKEN) {
  console.error('FEL: AI_STUDIO_TOKEN saknas i GitHub Secrets.');
  process.exit(2);
}

async function postWithRetry(url, body, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Försök ${i + 1} -> POST ${url}`);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const text = await res.text();
      console.log('STATUS:', res.status);
      
      if (res.ok) return JSON.parse(text);
      
      if (res.status === 429 || res.status >= 500) {
        const wait = Math.pow(2, i) * 1000;
        console.warn(`Väntar ${wait}ms...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      
      throw new Error(`HTTP ${res.status}: ${text}`);
    } catch (err) {
      console.error(`Fel vid försök ${i + 1}:`, err.message);
      if (i === maxRetries - 1) throw err;
    }
  }
}

async function main() {
  console.log('--- STARTAR DEBUG SYNC ---');
  try {
    const result = await postWithRetry(DEFAULT_ENDPOINT, {
      timestamp: new Date().toISOString(),
      source: 'github-action-debug'
    });
    console.log('SUCCESS:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('SYNC FATAL ERROR:', err.message);
    process.exit(1);
  }
}

main();