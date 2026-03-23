import { test, describe } from 'node:test';
import assert from 'node:assert';

import { ArchiveService } from './archiveService';
import { CASE_ARCHIVE } from '../archive/caseArchive';

describe('ArchiveService', () => {
    describe('searchByRisk', () => {
        test('should correctly find documents related to a risk label without mutating globals', (t) => {
            // The method `searchByRisk` calls `this.search(riskLabel, 3)`.
            // Instead of mutating the global CASE_ARCHIVE, we can spy on `search`
            // or simply test against real known values in the static dataset if any exist.
            // Since we don't know the exact data, the safest and cleanest way in Node test runner
            // without a robust module mocker is to mock `search` directly on the class.

            const originalSearch = ArchiveService.search.bind(ArchiveService);

            ArchiveService.search = (query: string, limit: number = 3) => {
                const mockArchive = [
                    {
                        document: { id: 'mock-1', title: 'High Risk', content: 'HIGH', date: '2026', category: 'cat', tags: [] },
                        relevanceScore: 100,
                        matchReason: 'mock'
                    },
                    {
                        document: { id: 'mock-2', title: 'Low Risk', content: 'LOW', date: '2026', category: 'cat', tags: [] },
                        relevanceScore: 50,
                        matchReason: 'mock'
                    }
                ];

                return mockArchive.filter(item => item.document.content === query);
            };

            t.after(() => {
                ArchiveService.search = originalSearch;
            });

            const highRiskResults = ArchiveService.searchByRisk('HIGH');
            assert.strictEqual(highRiskResults.length, 1);
            assert.strictEqual(highRiskResults[0].document.id, 'mock-1');

            const lowRiskResults = ArchiveService.searchByRisk('LOW');
            assert.strictEqual(lowRiskResults.length, 1);
            assert.strictEqual(lowRiskResults[0].document.id, 'mock-2');
        });
    });
});
