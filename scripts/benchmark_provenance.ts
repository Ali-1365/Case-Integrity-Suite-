import { queryProvenanceService } from '../lib/QueryProvenanceService';
import { db } from '../lib/db';
import { corpusService } from '../lib/CorpusService';

// Disable noisy logging
const originalConsoleLog = console.log;
console.log = function(...args: any[]) {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('CORPUS')) {
    return;
  }
  // Also suppress the internal json logs which seem to be structured logging
  if (args[0] && typeof args[0] === 'string' && args[0].startsWith('{"id":')) {
    return;
  }
  originalConsoleLog.apply(console, args);
};

// Mock DB
const MOCK_QUERY_ID = 'perf_test_query';
const hitIds = [];
for (let i = 0; i < 20; i++) {
  hitIds.push(`sol_2025_1_${i}`);
  hitIds.push(`fb_1949_1_${i}`);
  hitIds.push(`rb_1942_1_${i}`);
  hitIds.push(`skl_1972_1_${i}`);
  hitIds.push(`ygl_1991_1_${i}`);
}

const mockAuditLog = {
  id: MOCK_QUERY_ID,
  timestamp: new Date().toISOString(),
  operationType: 'RAG_QUERY',
  userId: 'perf_tester',
  provenanceHashes: [],
  metadata: {
    query: "Performance test query",
    hitIds: hitIds
  }
};

db.getAuditLogs = async () => [mockAuditLog as any];

// Mock fetch for corpusService
global.fetch = async (url) => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 50));

  const lawId = url.toString().split('/').pop()?.split('_')[0] || 'test';

  // Create matching paragraphs so `found X sources` shows > 0
  const paragraphs = hitIds
    .filter(id => id.startsWith(lawId))
    .map(id => ({
      id: id,
      text: "Mock text for " + id,
      chapter: 1,
      section: id.split('_').pop()
    }));

  return {
    ok: true,
    json: async () => ({
      sourceCode: lawId,
      sfsNumber: "1234:56",
      paragraphs: paragraphs
    })
  } as any;
};

async function runBenchmark() {
  originalConsoleLog(`Starting benchmark with ${hitIds.length} hitIds...`);

  // Clear cache to ensure a fresh run
  corpusService.clearCache();

  const start = performance.now();
  const result = await queryProvenanceService.getChainForQuery(MOCK_QUERY_ID);
  const end = performance.now();

  originalConsoleLog(`Execution time: ${(end - start).toFixed(2)} ms`);
  originalConsoleLog(`Found ${result?.sources.length} sources`);
}

runBenchmark().catch(console.error);
