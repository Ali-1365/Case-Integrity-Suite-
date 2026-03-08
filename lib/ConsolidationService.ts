
import { ProvenanceChain } from './QueryProvenanceService';
import { praxisService } from './PraxisService';
import { auditService } from './AuditService';
import { QUALITY_PROFILE } from './QualityProfile';
import { riskConflictService } from './RiskConflictService';

import { ConsolidationResult, RiskReport } from './cis.types';

export class ConsolidationService {
  async consolidate(query: string, chain: ProvenanceChain): Promise<ConsolidationResult> {
    const consolidationId = `CONS-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
    
    const lawRefs = chain.sources.map(s => `${s.sourceCode} ${s.chapter ? s.chapter + ':' : ''}${s.section}`);
    const relevantPraxis = await praxisService.getRelevantPraxis(lawRefs);

    // FAS 11: Kör riskanalys
    const riskReport = await riskConflictService.analyzeConflicts(chain, relevantPraxis);

    const result: ConsolidationResult = {
      consolidationId,
      hierarchy: {
        // FAS 8: Lex Superior - BK/EKMR > RF > Praxis > SFS
        constitution: chain.sources.filter(s => ['BK', 'RF', 'TF', 'YGL'].includes(s.sourceCode)).sort((a, b) => {
          if (a.sourceCode === 'BK') return -1;
          if (b.sourceCode === 'BK') return 1;
          return 0;
        }),
        law: chain.sources.filter(s => !['BK', 'RF', 'TF', 'YGL'].includes(s.sourceCode)),
        regulation: [],
        praxis: relevantPraxis
      },
      interplayAnalysis: "Hierarkisk analys initierad enligt Oracle v.7.6-GOLD (Lex Superior).",
      affectedNorms: Array.from(new Set(chain.sources.map(s => s.sourceCode))),
      provenanceHashes: [
        ...chain.sources.map(s => s.provenanceHash),
        ...relevantPraxis.map(p => p.provenanceHash)
      ],
      riskReport
    };

    await auditService.log({
      operationType: 'RAG_QUERY',
      actor: 'SYSTEM',
      affectedLaws: chain.sources.map(s => `${s.sourceCode} ${s.sfsNumber}`),
      provenanceHashes: result.provenanceHashes,
      resultSummary: `Consolidation complete: ${consolidationId}. Risk Level: ${riskReport.level}.`,
      status: 'OK',
      metadata: { 
        queryId: chain.queryId, 
        consolidationId,
        riskId: riskReport.riskId 
      }
    });

    return result;
  }
}

export const consolidationService = new ConsolidationService();
