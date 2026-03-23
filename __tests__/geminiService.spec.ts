import { describe, it, expect, vi, beforeEach } from 'vitest';
import { geminiService, offlineService } from '../services/geminiService';

describe('GeminiService', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        // Since Gemini depends on env keys and offline service, let's reset it
        offlineService.setOffline(false);
    });

    describe('checkApiStatus', () => {
        it('should return online=true and a message for 200 OK', async () => {
            // Spy on this.generate to simulate a successful check without real API keys
            vi.spyOn(geminiService as any, 'getClient').mockReturnValue({
                models: { generateContent: vi.fn().mockResolvedValue({ text: 'OK' }) }
            });
            const status = await geminiService.checkApiStatus();
            expect(status.online).toBe(true);
            expect(status.message).toContain('operativ');
        });

        it('should return online=false for 500/Timeout scenarios', async () => {
            // Force generate to fail
            vi.spyOn(geminiService as any, 'getClient').mockReturnValue({
                models: { generateContent: vi.fn().mockRejectedValue(new Error('NetworkError')) }
            });
            const status = await geminiService.checkApiStatus();
            expect(status.online).toBe(false);
            expect(status.message).toContain('ej tillgänglig');
            expect(status.message).toContain('NetworkError');
        });
    });

    describe('Embedding Retry Loop', () => {
        it('should fallback to second model if the first fails', async () => {
            // To test embed's retry loop, we need to mock executeWithRetry or the underlying client.
            // Since executeWithRetry calls the inner function, let's spy on the client mock instead.
            // A simpler way is to spy on executeWithRetry
            let calls = 0;
            vi.spyOn(geminiService, 'executeWithRetry' as any).mockImplementation(async (fn) => {
                calls++;
                if (calls === 1) throw new Error('Model 1 Failed');
                return { embeddings: [{ values: [0.1, 0.2, 0.3] }] };
            });

            // Mock getClient to avoid missing API key errors
            vi.spyOn(geminiService, 'getClient' as any).mockReturnValue({});

            // Turn off offline mode so it actually attempts
            offlineService.setOffline(false);

            const res = await geminiService.embed('test text');
            expect(res).toEqual([0.1, 0.2, 0.3]);
            expect(calls).toBe(2);
        });
    });
});
