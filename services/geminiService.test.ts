import { test, describe, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { geminiService, offlineService } from './geminiService';

describe('GeminiService.embed', () => {
  let originalGetClient: any;
  let mockEmbedContent: any;

  beforeEach(() => {
    // Force online mode for testing the loop
    offlineService.setOffline(false);

    // Setup our mock embedContent function
    mockEmbedContent = mock.fn();

    // We need to bypass the real getClient which throws without API_KEY
    // by mocking it on the service instance.
    originalGetClient = (geminiService as any).getClient;
    (geminiService as any).getClient = () => ({
      models: {
        embedContent: mockEmbedContent
      }
    });
  });

  afterEach(() => {
    // Restore original
    (geminiService as any).getClient = originalGetClient;
    mock.restoreAll();
  });

  test('Scenario 1: Success on first model (text-embedding-004)', async () => {
    mockEmbedContent.mock.mockImplementation(async (params: any) => {
      assert.strictEqual(params.model, 'text-embedding-004');
      return { embeddings: [{ values: [0.1, 0.2, 0.3] }] };
    });

    const result = await geminiService.embed('test text');

    assert.deepStrictEqual(result, [0.1, 0.2, 0.3]);
    assert.strictEqual(mockEmbedContent.mock.callCount(), 1);
  });

  test('Scenario 2: Failure on first model, success on second (gemini-embedding-001)', async () => {
    let callCount = 0;
    mockEmbedContent.mock.mockImplementation(async (params: any) => {
      callCount++;
      if (callCount === 1) {
        assert.strictEqual(params.model, 'text-embedding-004');
        throw new Error('First model failed');
      } else {
        assert.strictEqual(params.model, 'gemini-embedding-001');
        return { embeddings: [{ values: [0.4, 0.5, 0.6] }] };
      }
    });

    const result = await geminiService.embed('test text');

    assert.deepStrictEqual(result, [0.4, 0.5, 0.6]);
    assert.strictEqual(mockEmbedContent.mock.callCount(), 2);
  });

  test('Scenario 3: Failure on both models, returning pseudo-embedding', async () => {
    mockEmbedContent.mock.mockImplementation(async () => {
      throw new Error('Model failed');
    });

    const result = await geminiService.embed('test text');

    // Pseudo-embedding returns an array of length 768
    assert.strictEqual(result.length, 768);
    assert.strictEqual(mockEmbedContent.mock.callCount(), 2);

    // Basic check that it returned actual numbers from the pseudo fallback
    assert.ok(result.every((val) => typeof val === 'number'));
  });
});
