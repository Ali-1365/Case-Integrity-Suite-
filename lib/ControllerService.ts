
import { CISCase, caseManagementService } from './CaseManagementService';
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
 * CIS ControllerService v.1.0
 * Utför deterministisk kvalitetskontroll av hela systemets ärendeflöde.
 */
export class ControllerService {
  
  async runFullControl(cases: CISCase[]): Promise<ControllerReport> {
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
    const integrityIssues = await integrityEngine.validateRepository(cases);

    // 6. Systemisk granskning (FAS 19 - GOLD)
    const systemicDeviations = this.detectSystemicErrors(cases);
    deviations.push(...systemicDeviations);

    // 7. Hallucinationskontroll [AUDIT-HALLUCINATION-01]
    const hallucinationRisks = this.detectHallucinationRisks(cases);
    deviations.push(...hallucinationRisks);

    // 8. Algoritmisk Regelefterlevnad [AUDIT-ALGO-COMPLIANCE]
    const complianceIssues = this.checkAlgoCompliance(cases);
    deviations.push(...complianceIssues);

    // 9. Journalför kritiska flaggor
    for (const dev of deviations) {
      if (dev.severity === 'CRITICAL') {
        await journalService.addEntry(
          dev.caseId, 
          'CONTROLLER_FLAG', 
          `Kritisk avvikelse detekterad (${dev.type}): ${(dev as { details?: unknown }).details}`,
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
      affectedLaws: ['CIS-CTRL'],
      provenanceHashes: [],
      resultSummary: `Controller Audit Executed: ${controllerEventId}. Found ${(deviations as { length: number }).length} deviations, ${(inconsistencies as { length: number }).length} inconsistencies.`,
      status: 'OK',
      metadata: { 
        controllerEventId, 
        deviationCount: (deviations as { length: number }).length,
        inconsistencyCount: (inconsistencies as { length: number }).length,
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

  /**
   * FMJAM Systemisk Granskning v.7.8-GOLD
   * Identifierar systematiska fel över hela ärendestocken.
   */
  private detectSystemicErrors(cases: CISCase[]): Deviation[] {
    const systemicDeviations: Deviation[] = [];
    
    // Scenario: Identifiera återkommande brister i utredningsskyldigheten (FL 23 §)
    const fl23Failures = cases.filter(c => {
      const markdown = c.activeResult?.fullMarkdown || '';
      return markdown.includes('FL 23') || 
             markdown.includes('utredningsskyldighet') ||
             markdown.includes('bristande utredning');
    });

    if ((fl23Failures as { length: number }).length >= 3) {
      systemicDeviations.push({
        caseId: 'SYSTEMIC-01',
        type: 'SYSTEMIC_INVESTIGATION_FAILURE',
        severity: 'CRITICAL',
        details: `SYSTEMISKT FEL DETEKTERAT: ${(fl23Failures as { length: number }).length} ärenden uppvisar brister i utredningsskyldigheten enligt FL 23 §. Detta indikerar en strukturell brist hos myndigheten.`,
        timestamp: new Date().toISOString()
      });
    }

    return systemicDeviations;
  }

  /**
   * [AUDIT-HALLUCINATION-01]
   * Verifierar att faktapunkter har direkt textstöd.
   */
  private detectHallucinationRisks(cases: CISCase[]): Deviation[] {
    const risks: Deviation[] = [];
    cases.forEach(c => {
        const facts = c.activeResult?.facts || [];
        const factsWithoutSnippet = facts.filter(f => !(f as { source: unknown }).source?.snippet || (f as { source: unknown }).source.(snippet as { length: number }).length < 10);
        
        if ((factsWithoutSnippet as { length: number }).length > 0) {
            risks.push({
                caseId: c.caseId,
                type: 'AUDIT-HALLUCINATION-01',
                severity: 'HIGH',
                details: `RISK FÖR HALLUCINATION: ${(factsWithoutSnippet as { length: number }).length} faktapunkter saknar direkt textstöd i källmaterialet. Verifiera ATOM-mappning.`,
                timestamp: new Date().toISOString()
            });
        }
    });
    return risks;
  }

  /**
   * [AUDIT-ALGO-COMPLIANCE]
   * Verifierar logikmotorns slutsatser.
   */
  private checkAlgoCompliance(cases: CISCase[]): Deviation[] {
    const issues: Deviation[] = [];
    cases.forEach(c => {
        const reasoning = c.activeResult?.reasoning;
        if (reasoning && reasoning.confidenceScore < 0.85) {
            issues.push({
                caseId: c.caseId,
                type: 'AUDIT-ALGO-COMPLIANCE',
                severity: 'MEDIUM',
                details: `LOGIKMOTORN OSÄKER: Konfidensgrad (${Math.round(reasoning.confidenceScore * 100)}%) understiger GOLD-tröskelvärdet. Logikmotorn har inte kunnat verifiera samtliga slutsatser deterministiskt.`,
                timestamp: new Date().toISOString()
            });
        }
    });
    return issues;
  }
}

export const controllerService = new ControllerService();
