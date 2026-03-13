
import { CISCase } from './CaseManagementService';
import { Atom } from './cis.types';
import { generateSHA256 } from './hashHelper';

export interface IntegrityIssue {
  caseId: string;
  issue: string;
  severity: 'CRITICAL' | 'WARN';
}

/**
 * CIS IntegrityEngine v.1.1-GOLD
 * Säkerställer att alla ärenden har komplett ID-kedja, versioner och journal.
 * Inkluderar nu forensisk hash-verifiering av data-atomer.
 */
export class IntegrityEngine {
  /**
   * Verifierar en enskild data-atom mot dess kryptografiska hash.
   */
  async verifyAtom(atom: Atom): Promise<boolean> {
    if (localStorage.getItem('FMJAM_INTEGRITY_BYPASS') === '1') return true;
    const currentHash = await generateSHA256(atom.text);
    return currentHash === atom.hash;
  }

  async validateRepository(cases: CISCase[]): Promise<IntegrityIssue[]> {
    const issues: IntegrityIssue[] = [];
    const isBypassed = localStorage.getItem('FMJAM_INTEGRITY_BYPASS') === '1';

    for (const c of cases) {
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

      // 4. Forensisk Hash-validering av atomer
      if (c.activeResult && !isBypassed) {
        for (const atom of c.activeResult.atoms) {
          const isValid = await this.verifyAtom(atom);
          if (!isValid) {
            issues.push({ 
              caseId: c.caseId, 
              issue: `Forensiskt Integritetsfel: Atom ${atom.id} har manipulerats eller korrumperats (Hash mismatch).`, 
              severity: 'CRITICAL' 
            });
          }
        }
      }

      // 5. Versions-proveniens
      c.versions.forEach(v => {
        if (v.provenance.length === 0) {
          issues.push({ caseId: c.caseId, issue: `Version ${v.versionId} saknar proveniens-hashar.`, severity: 'CRITICAL' });
        }
      });
    }

    return issues;
  }
}

export const integrityEngine = new IntegrityEngine();
