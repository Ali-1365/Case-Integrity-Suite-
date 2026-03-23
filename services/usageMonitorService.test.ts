import { test, describe, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { usageMonitorService } from './usageMonitorService.js';
import { loggingService, LogEntry } from './loggingService.js';

describe('UsageMonitorService', () => {
    afterEach(() => {
        mock.restoreAll();
    });

    function createMockLog(mode: 'fast' | 'think' | 'system', prompt?: string, response?: string, ageMs: number = 0): LogEntry {
        return {
            id: 'test-id',
            correlationId: 'test-corr',
            timestamp: new Date(Date.now() - ageMs),
            level: 'INFO',
            mode,
            message: 'test',
            details: {
                prompt,
                response
            }
        };
    }

    test('getUsage calculates TPM correctly based on prompt and response lengths', () => {
        // Mock getLogs
        mock.method(loggingService, 'getLogs', () => {
            return [
                createMockLog('fast', '1234', '12345678'), // prompt: 4 chars (1 token), response: 8 chars (2 tokens). Total: 3 tokens
                createMockLog('think', '1', '12345'), // prompt: 1 char (1 token), response: 5 chars (2 tokens). Total: 3 tokens
            ];
        });

        const usage = usageMonitorService.getUsage();
        assert.strictEqual(usage.tpm, 6);
        assert.strictEqual(usage.rpm, 2);
    });

    test('getUsage handles missing details or missing prompt/response', () => {
        mock.method(loggingService, 'getLogs', () => {
            const logWithoutDetails = createMockLog('fast');
            delete logWithoutDetails.details;

            return [
                logWithoutDetails,
                createMockLog('fast', undefined, '1234'), // 1 token
                createMockLog('think', '1234', undefined) // 1 token
            ];
        });

        const usage = usageMonitorService.getUsage();
        assert.strictEqual(usage.tpm, 2);
        assert.strictEqual(usage.rpm, 3);
    });

    test('getUsage ignores logs older than 1 minute', () => {
        mock.method(loggingService, 'getLogs', () => {
            return [
                createMockLog('fast', '1234', '1234', 0), // Recent (2 tokens)
                createMockLog('fast', '1234', '1234', 65000), // 65 seconds old (should be ignored)
            ];
        });

        const usage = usageMonitorService.getUsage();
        assert.strictEqual(usage.tpm, 2);
        assert.strictEqual(usage.rpm, 1);
    });

    test('getUsage ignores non-LLM logs (mode = system)', () => {
        mock.method(loggingService, 'getLogs', () => {
            return [
                createMockLog('fast', '1234', '1234'), // Recent LLM (2 tokens)
                createMockLog('system', '1234', '1234'), // System log (should be ignored)
            ];
        });

        const usage = usageMonitorService.getUsage();
        assert.strictEqual(usage.tpm, 2);
        assert.strictEqual(usage.rpm, 1);
    });

    test('getUsage calculates status correctly (stable, warning, critical)', () => {
        // RPM limit is 15.
        // > 0.6 (i.e. > 9 RPM) -> warning
        // > 0.9 (i.e. > 13.5 RPM) -> critical

        // Test stable (9 RPM)
        mock.method(loggingService, 'getLogs', () => Array(9).fill(createMockLog('fast')));
        assert.strictEqual(usageMonitorService.getUsage().status, 'stable');

        // Test warning (10 RPM)
        mock.method(loggingService, 'getLogs', () => Array(10).fill(createMockLog('fast')));
        assert.strictEqual(usageMonitorService.getUsage().status, 'warning');

        // Test critical (14 RPM)
        mock.method(loggingService, 'getLogs', () => Array(14).fill(createMockLog('fast')));
        assert.strictEqual(usageMonitorService.getUsage().status, 'critical');
    });
});
