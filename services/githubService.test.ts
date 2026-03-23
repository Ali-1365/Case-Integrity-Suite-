import test, { describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { githubService } from './githubService';

describe('githubService.getSyncHealth', () => {
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
        originalFetch = global.fetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
        mock.restoreAll();
    });

    it('returns SyncHealth when metadata is valid', async () => {
        const mockMetadata = {
            version: '1.2.3',
            sync_id: 'sync-12345',
        };

        global.fetch = mock.fn(async () => {
            return {
                ok: true,
                json: async () => mockMetadata,
            } as Response;
        });

        const result = await githubService.getSyncHealth();

        assert.ok(result);
        assert.strictEqual(result.isAligned, true);
        assert.strictEqual(result.remoteVersion, '1.2.3');
        assert.strictEqual(result.remoteSyncId, 'sync-12345');
        assert.ok(result.latencyMs >= 0);
    });

    it('returns null when metadata is missing version', async () => {
        const mockMetadata = {
            sync_id: 'sync-12345',
        };

        global.fetch = mock.fn(async () => {
            return {
                ok: true,
                json: async () => mockMetadata,
            } as Response;
        });

        const result = await githubService.getSyncHealth();

        assert.strictEqual(result, null);
    });

    it('returns null when metadata is missing sync_id', async () => {
        const mockMetadata = {
            version: '1.2.3',
        };

        global.fetch = mock.fn(async () => {
            return {
                ok: true,
                json: async () => mockMetadata,
            } as Response;
        });

        const result = await githubService.getSyncHealth();

        assert.strictEqual(result, null);
    });

    it('returns null when metadata is empty', async () => {
        const mockMetadata = {};

        global.fetch = mock.fn(async () => {
            return {
                ok: true,
                json: async () => mockMetadata,
            } as Response;
        });

        const result = await githubService.getSyncHealth();

        assert.strictEqual(result, null);
    });

    it('returns null on fetch failure (non-ok response)', async () => {
        global.fetch = mock.fn(async () => {
            return {
                ok: false,
            } as Response;
        });

        const result = await githubService.getSyncHealth();

        assert.strictEqual(result, null);
    });

    it('returns null on fetch throw (network error)', async () => {
        global.fetch = mock.fn(async () => {
            throw new Error('Network error');
        });

        const result = await githubService.getSyncHealth();

        assert.strictEqual(result, null);
    });
});
