import { test, describe } from 'node:test';
import assert from 'node:assert';
import { geminiService, offlineService } from './geminiService';

describe('GeminiService', () => {
  describe('checkApiStatus', () => {
    test('should return status valid and latency on 200 OK', async (t) => {
      // Force online mode temporarily to avoid synthetic fallback intercepting
      const originalIsOffline = offlineService.getIsOffline.bind(offlineService);
      offlineService.getIsOffline = () => false;

      // Mock generate
      const originalGenerate = geminiService.generate.bind(geminiService);
      geminiService.generate = async () => {
         // simulate a small delay to get latency > 0
         await new Promise(r => setTimeout(r, 5));
         return 'OK';
      };

      t.after(() => {
        offlineService.getIsOffline = originalIsOffline;
        geminiService.generate = originalGenerate;
      });

      const status = await geminiService.checkApiStatus();
      assert.strictEqual(status.online, true);
      assert.ok(status.latencyMs !== undefined && status.latencyMs > 0);
      assert.strictEqual(status.message, 'API ansluten och operativ.');
    });

    test('should handle 500/Timeout scenarios properly', async (t) => {
      const originalGenerate = geminiService.generate.bind(geminiService);
      const originalIsOffline = offlineService.getIsOffline.bind(offlineService);
      offlineService.getIsOffline = () => false;

      geminiService.generate = async () => {
        throw new Error('500 Internal Server Error');
      };

      t.after(() => {
        geminiService.generate = originalGenerate;
        offlineService.getIsOffline = originalIsOffline;
      });

      const status = await geminiService.checkApiStatus();
      assert.strictEqual(status.online, false);
      assert.strictEqual(status.message, 'API ej tillgänglig: 500 Internal Server Error');
    });
  });

  describe('Embedding Retry Loop', () => {
    test('should force a failure on first model and automatically fallback to second', async (t) => {
       // Mock executeWithRetry to simulate the first model failing and second succeeding
       const originalExecuteWithRetry = (geminiService as any).executeWithRetry;
       t.after(() => {
         (geminiService as any).executeWithRetry = originalExecuteWithRetry;
       });

       let callCount = 0;
       (geminiService as any).executeWithRetry = async (operation: any) => {
         callCount++;
         if (callCount === 1) {
             throw new Error("First model failed");
         } else {
             return { embeddings: [{ values: [0.1, 0.2, 0.3] }] };
         }
       };

       // Also need to temporarily clear offline mode to run embed
       const originalIsOffline = offlineService.getIsOffline.bind(offlineService);
       offlineService.getIsOffline = () => false;

       // And mock getClient to bypass the actual API key check
       const originalGetClient = (geminiService as any).getClient.bind(geminiService);
       (geminiService as any).getClient = () => ({
          models: {
             embedContent: async () => { /* won't be called because executeWithRetry is mocked */ }
          }
       });

       t.after(() => {
          offlineService.getIsOffline = originalIsOffline;
          (geminiService as any).getClient = originalGetClient;
       });

       const result = await geminiService.embed('Test content');
       assert.deepStrictEqual(result, [0.1, 0.2, 0.3]);
       assert.strictEqual(callCount, 2);
    });
  });
});
