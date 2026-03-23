import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeminiService } from '../services/geminiService';
import { offlineService } from '../services/geminiService';
import { ApiError } from '../lib/errors';

vi.mock('../services/geminiService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/geminiService')>();
  vi.spyOn(actual.offlineService, 'setOffline').mockImplementation(vi.fn());
  return actual;
});

describe('GeminiService.executeWithRetry', () => {
  let geminiService: GeminiService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    process.env.GEMINI_API_KEY = 'fake-key';
    geminiService = new GeminiService();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    delete process.env.GEMINI_API_KEY;
  });

  it('should pass on success without retries', async () => {
    const mockOperation = vi.fn().mockResolvedValue('success');
    const result = await (geminiService as any).executeWithRetry(mockOperation);
    expect(result).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(1);
    expect(geminiService.quotaState.isThrottled).toBe(false);
  });

  it('should throw immediately on auth error', async () => {
    const mockOperation = vi.fn().mockRejectedValue(new Error('unauthorized api access'));
    await expect((geminiService as any).executeWithRetry(mockOperation))
      .rejects.toThrow(ApiError);
    expect(offlineService.setOffline).toHaveBeenCalledWith(true, 'API_KEY_MISSING');
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });

  it('should retry on quota error and then succeed', async () => {
    const mockOperation = vi.fn()
      .mockRejectedValueOnce(new Error('quota exceeded'))
      .mockResolvedValueOnce('success');

    const promise = (geminiService as any).executeWithRetry(mockOperation, 3, 2000);

    // We only need one advance to get past the 2000ms delay of the 1st retry
    await vi.advanceTimersByTimeAsync(2000);

    const result = await promise;
    expect(result).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(2);
    expect(geminiService.quotaState.isThrottled).toBe(false);
  });

  it('should retry multiple times on quota error and exponential backoff, eventually failing', async () => {
    const mockOperation = vi.fn().mockRejectedValue(new Error('quota exceeded'));

    // Catch the error so it doesn't cause Unhandled Rejection
    const promise = (geminiService as any).executeWithRetry(mockOperation, 3, 2000).catch((e: any) => e);

    // Attempt 1 -> fails -> awaits 2000ms
    await vi.advanceTimersByTimeAsync(2000);

    // Attempt 2 -> fails -> awaits 4000ms
    await vi.advanceTimersByTimeAsync(4000);

    const error = await promise;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toContain('API-fel efter 3 försök: quota exceeded');

    expect(mockOperation).toHaveBeenCalledTimes(3);
    expect(offlineService.setOffline).toHaveBeenCalledWith(true, 'QUOTA_EXCEEDED');
  });

  it('should not retry on other errors', async () => {
    const mockOperation = vi.fn().mockRejectedValue(new Error('some random error'));
    await expect((geminiService as any).executeWithRetry(mockOperation))
      .rejects.toThrow('some random error');
    expect(mockOperation).toHaveBeenCalledTimes(1);
    expect(offlineService.setOffline).not.toHaveBeenCalled();
  });
});
