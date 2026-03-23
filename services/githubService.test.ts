import { test, describe } from 'node:test';
import assert from 'node:assert';
import { githubService } from './githubService';

describe('GithubService', () => {
  describe('safeFetch with timeout handling', () => {
    test('should reject on timeout', async (t) => {
      // Mock global fetch to simulate a slow request
      const originalFetch = global.fetch;
      t.after(() => {
        global.fetch = originalFetch;
      });

      global.fetch = async (url: any, options: any): Promise<Response> => {
        // Create an unresolved promise that will trigger the abort signal timeout
        return new Promise<Response>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                resolve(new Response('OK'));
            }, 100);

            if (options?.signal) {
                options.signal.addEventListener('abort', () => {
                    clearTimeout(timeoutId);
                    const e = new Error('AbortError');
                    e.name = 'AbortError';
                    reject(e);
                });
            }
        });
      };

      try {
        await (githubService as any).safeFetch('http://slow.example.com', 10, true); // very short timeout, force throw
        assert.fail('Should have timed out');
      } catch (error: any) {
        if (error.message === 'Should have timed out') {
            assert.fail('The fetch did not time out and throw an error as expected.');
        } else {
            assert.ok(error.name === 'AbortError' || error.message.includes('AbortError'), 'Error should be an abort error. Got: ' + error.message);
        }
      }
    });

    test('should resolve within timeout', async (t) => {
      const originalFetch = global.fetch;
      t.after(() => {
        global.fetch = originalFetch;
      });

      global.fetch = async (url: any, options: any): Promise<Response> => {
         return new Response(JSON.stringify({ test_key: 'test_value' }), { status: 200 });
      };

      const res = await (githubService as any).safeFetch('http://fast.example.com', 1000);
      assert.deepStrictEqual(res, { test_key: 'test_value' });
    });
  });
});
