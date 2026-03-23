import test from 'node:test';
import assert from 'node:assert/strict';
import { geminiService, offlineService } from './geminiService';

test('GeminiService - checkApiStatus', async (t) => {
  await t.test('should return online status when generate succeeds', async (t) => {
    // Mock the generate method to resolve successfully
    const originalGenerate = geminiService.generate;
    const originalSetOffline = offlineService.setOffline;

    let setOfflineCalledWith: boolean | null = null;

    // Spying / Mocking
    geminiService.generate = async () => 'OK';
    offlineService.setOffline = (offline: boolean) => {
      setOfflineCalledWith = offline;
    };

    try {
      const result = await geminiService.checkApiStatus();

      assert.strictEqual(result.online, true, 'Expected online to be true');
      assert.strictEqual(result.message, 'API ansluten och operativ.', 'Expected success message');
      assert.ok(typeof result.latencyMs === 'number', 'Expected latencyMs to be a number');
      assert.ok(result.latencyMs >= 0, 'Expected latencyMs to be >= 0');
      assert.strictEqual(setOfflineCalledWith, false, 'Expected setOffline to be called with false');
    } finally {
      // Restore original methods
      geminiService.generate = originalGenerate;
      offlineService.setOffline = originalSetOffline;
    }
  });

  await t.test('should return offline status when generate throws an error', async (t) => {
    // Mock the generate method to throw an error
    const originalGenerate = geminiService.generate;

    // Spying / Mocking
    geminiService.generate = async () => {
      throw new Error('Network timeout');
    };

    try {
      const result = await geminiService.checkApiStatus();

      assert.strictEqual(result.online, false, 'Expected online to be false');
      assert.strictEqual(result.message, 'API ej tillgänglig: Network timeout', 'Expected error message');
      assert.strictEqual(result.latencyMs, undefined, 'Expected latencyMs to be undefined');
    } finally {
      // Restore original method
      geminiService.generate = originalGenerate;
    }
  });
});
