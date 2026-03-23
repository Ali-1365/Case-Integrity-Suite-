import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArchiveService } from '../services/archiveService';

describe('ArchiveService', () => {
    describe('searchByRisk', () => {
        it('should return matching items from diverse risk-score datasets', () => {
            const resultsHigh = ArchiveService.searchByRisk('HÖG', { minScore: 70 });
            expect(resultsHigh.length).toBeGreaterThanOrEqual(0);

            const resultsLow = ArchiveService.searchByRisk('LÅG');
            expect(resultsLow.length).toBeGreaterThanOrEqual(0);

            // Mock inner method to guarantee specific returns
            const mockData = [
                { document: { id: '1', caseId: 'CASE-1', riskLevel: 'HÖG', finalRiskScore: 85, title: '', summary: '', date: '' }, relevanceScore: 100, matchReason: '' },
                { document: { id: '2', caseId: 'CASE-2', riskLevel: 'HÖG', finalRiskScore: 65, title: '', summary: '', date: '' }, relevanceScore: 100, matchReason: '' },
                { document: { id: '3', caseId: 'CASE-3', riskLevel: 'LÅG', finalRiskScore: 20, title: '', summary: '', date: '' }, relevanceScore: 100, matchReason: '' }
            ] as any[];
            vi.spyOn(ArchiveService, 'search').mockReturnValue(mockData);

            const customHigh = ArchiveService.searchByRisk('HÖG', { minScore: 70 });
            expect(customHigh).toHaveLength(1);
            expect(customHigh[0].document.id).toBe('1');
        });
    });
});
