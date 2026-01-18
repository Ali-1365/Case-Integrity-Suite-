
import { FMJAMCase } from './CaseManagementService';

export interface IntegrityIssue {
  caseId: string;
  issue: string;
  severity: 'CRITICAL';
}

/**
 * FMJAM IntegrityEngine v.1.0
 * Säkerställer att alla ärenden har komplett ID-kedja, versioner och journal.
 */
export class IntegrityEngine {
  validateRepository(cases: FMJAMCase[]): IntegrityIssue[] {
    const issues: IntegrityIssue[] = [];

    cases.forEach(c => {
      // 1. Kontrollera ID-integritet
      if (!c.caseId.startsWith('CASE-')) {
        issues.push({ caseId: c.caseId, issue: 'Ogiltigt format på CaseId.', severity: 'CRITICAL' });
      }

      // 2. Kontrollera Journal-koppling
      if (c.journal.length === 0) {
        issues.push({ caseId: c.caseId, issue: 'Ärendet saknar händelsejournal (Brott mot FL 27 §).', severity: 'CRITICAL' });
      }

      // 3. Kontrollera Versions-historik
      if (c.versions.length === 0 && c.activeResult) {
        issues.push({ caseId: c.caseId, issue: 'Aktivt resultat finns men versionshistorik saknas.', severity: 'CRITICAL' });
      }

      // 4. Hash-validering (Simulerad: skulle i produktion kolla SHA256)
      c.versions.forEach(v => {
        if (v.provenance.length === 0) {
          issues.push({ caseId: c.caseId, issue: `Version ${v.versionId} saknar proveniens-hashar.`, severity: 'CRITICAL' });
        }
      });
    });

    return issues;
  }
}

export const integrityEngine = new IntegrityEngine();
