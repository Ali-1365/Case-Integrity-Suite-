
import { FMJAMCase, caseManagementService } from './CaseManagementService';
import { patternEngine, SystemPattern } from './PatternEngine';
import { deviationEngine, Deviation } from './DeviationEngine';
import { consistencyEngine, Inconsistency } from './ConsistencyEngine';
import { biasEngine, BiasIndicator } from './BiasEngine';
import { integrityEngine, IntegrityIssue } from './IntegrityEngine';
import { auditService } from './AuditService';
import { journalService } from './JournalService';

export interface ControllerReport {
  timestamp: string;
  patterns: SystemPattern[];
  deviations: Deviation[];
  inconsistencies: Inconsistency[];
  biasIndicators: BiasIndicator[];
  integrityIssues: IntegrityIssue[];
}

/**
 * FMJAM ControllerService v.1.0-GOLD
 * Utför deterministisk kvalitetskontroll av hela systemets ärendeflöde.
 */
export class ControllerService {
  
  async runFullControl(cases: FMJAMCase[]): Promise<ControllerReport> {
    const timestamp = new Date().toISOString();
    
    // 1. Identifiera mönster (Baslinje)
    const patterns = patternEngine.identifyPatterns(cases);
    
    // 2. Upptäck avvikelser
    const deviations = deviationEngine.detect(cases, patterns);
    
    // 3. Kontrollera inkonsekvens
    const inconsistencies = consistencyEngine.checkConsistency(cases);
    
    // 4. Analysera bias
    const biasIndicators = biasEngine.analyzeBias(cases, patterns);
    
    // 5. Verifiera teknisk integritet
    const integrityIssues = integrityEngine.validateRepository(cases);

    // 6. Journalför kritiska flaggor
    for (const dev of deviations) {
      if (dev.severity === 'CRITICAL') {
        await journalService.addEntry(
          dev.caseId, 
          'CONTROLLER_FLAG', 
          `Kritisk avvikelse detekterad (${dev.type}): ${dev.details}`,
          [], 
          'CONTROLLER_ENGINE'
        );
      }
    }

    // 7. Audit loggning
    const controllerEventId = `CTRL-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
    await auditService.log({
      operationType: 'RAG_QUERY', // Återanvänder befintlig typ för loggning
      actor: 'SYSTEM',
      affectedLaws: ['FMJAM-CTRL'],
      provenanceHashes: [],
      resultSummary: `Controller Audit Executed: ${controllerEventId}. Found ${deviations.length} deviations, ${inconsistencies.length} inconsistencies.`,
      status: 'OK',
      metadata: { 
        controllerEventId, 
        deviationCount: deviations.length,
        inconsistencyCount: inconsistencies.length,
        status: 'CONTROLLER_OK'
      }
    });

    return {
      timestamp,
      patterns,
      deviations,
      inconsistencies,
      biasIndicators,
      integrityIssues
    };
  }
}

export const controllerService = new ControllerService();
