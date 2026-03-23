import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { githubService } from './githubService';

describe('GithubService.safeFetch', () => {
  const originalFetch = global.fetch;
  let fetchMock: any;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    vi.useFakeTimers();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should return null when the request times out', async () => {
    fetchMock.mockImplementation((url: string, options: RequestInit) => {
      return new Promise((resolve, reject) => {
        // Set up an abort listener to reject the promise if the signal aborts
        if (options?.signal) {
          options.signal.addEventListener('abort', () => {
            reject(new DOMException('The user aborted a request.', 'AbortError'));
          });
        }

        // This setTimeout is tracked by fake timers
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({ data: 'delayed' }),
          });
        }, 5000); // Intentionally delayed longer than the timeout
      });
    });

    const safeFetchPromise = (githubService as any).safeFetch('https://example.com/api', 2500);

    // Advance the timers by enough time to trigger the internal setTimeout
    // inside safeFetch (which aborts the signal)
    await vi.advanceTimersByTimeAsync(3000);

    const result = await safeFetchPromise;

    expect(result).toBeNull();
  });

  it('should return json data on successful fetch', async () => {
    const mockData = { id: 1, name: 'test' };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const safeFetchPromise = (githubService as any).safeFetch('https://example.com/api');
    await vi.runAllTimersAsync();
    const result = await safeFetchPromise;

    expect(result).toEqual(mockData);
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/api', expect.any(Object));
  });

  it('should return null when fetch response is not ok', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
    });

    const safeFetchPromise = (githubService as any).safeFetch('https://example.com/api');
    await vi.runAllTimersAsync();
    const result = await safeFetchPromise;

    expect(result).toBeNull();
  });

  it('should return null when fetch throws an error (e.g., network error)', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    const safeFetchPromise = (githubService as any).safeFetch('https://example.com/api');
    await vi.runAllTimersAsync();
    const result = await safeFetchPromise;

    expect(result).toBeNull();
  });
});
