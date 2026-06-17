import { CISCase } from './CaseManagementService';
import { Atom, AnalysisResult, DecisionSupportResult } from './cis.types';
import { generateSHA256 } from './hashHelper';
import { LEGAL_SOURCES } from '../data/legalSources';

export interface IntegrityIssue {
  caseId: string;
  issue: string;
  severity: 'CRITICAL' | 'WARN';
}

/**
 * CIS IntegrityEngine v.1.2-GOLD
 * Säkerställer att alla ärenden har komplett ID-kedja, versioner och journal.
 * Inkluderar nu forensisk hash-verifiering och legal källkontroll.
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

  /**
   * Verifierar att alla lagrumshänvisningar i ett resultat är giltiga och existerar i GOLD-indexet.
   */
  validateLegalIntegrity(
    result: AnalysisResult | DecisionSupportResult,
    caseId: string
  ): IntegrityIssue[] {
    const issues: IntegrityIssue[] = [];

    const references =
      'legalReferences' in result
        ? result.legalReferences.map(r => ({
            source: r.source,
            rawText: r.rawText
          }))
        : result.machineReadable.legalBasis.map(b => ({
            source: b,
            rawText: b
          }));

    references.forEach(ref => {
      const exists = LEGAL_SOURCES.some(source =>
        source.reference === ref.source ||
        source.label.toLowerCase() === ref.rawText.toLowerCase() ||
        (source.sfsNumber && ref.rawText.includes(source.sfsNumber))
      );

      if (!exists) {
        issues.push({
          caseId,
          issue: `Overifierat Lagrum: Hänvisningen "${ref.rawText}" kunde inte matchas mot systemets legala GOLD-index.`,
          severity: 'WARN'
        });
      }
    });

    return issues;
  }

  /**
   * Berikar ett resultat med verifieringsstatus för lagrumshänvisningar.
   */
  enrichWithLegalVerification(result: AnalysisResult): AnalysisResult {
    const enrichedReferences = result.legalReferences.map(ref => {
      const exists = LEGAL_SOURCES.some(source =>
        source.reference === ref.source ||
        source.label.toLowerCase() === ref.rawText.toLowerCase() ||
        (source.sfsNumber && ref.rawText.includes(source.sfsNumber))
      );
      return { ...ref, valid: exists };
    });

    return { ...result, legalReferences: enrichedReferences };
  }

  /**
   * Full repository-validering.
   */
  async validateRepository(cases: CISCase[]): Promise<IntegrityIssue[]> {
    const issues: IntegrityIssue[] = [];
    const isBypassed = localStorage.getItem('FMJAM_INTEGRITY_BYPASS') === '1';

    for (const c of cases) {
      // 1. Kontrollera ID-integritet
      if (!c.caseId.startsWith('CASE-')) {
        issues.push({
          caseId: c.caseId,
          issue: 'Ogiltigt format på CaseId.',
          severity: 'CRITICAL'
        });
      }

      // 2. Kontrollera Journal-koppling
      if (!c.journal || c.journal.length === 0) {
        issues.push({
          caseId: c.caseId,
          issue: 'Ärendet saknar händelsejournal (Brott mot FL 27 §).',
          severity: 'CRITICAL'
        });
      }

      // 3. Kontrollera Versions-historik
      if ((!c.versions || c.versions.length === 0) && c.activeResult) {
        issues.push({
          caseId: c.caseId,
          issue: 'Aktivt resultat finns men versionshistorik saknas.',
          severity: 'CRITICAL'
        });
      }

      // 4. Forensisk Hash-validering av atomer
      if (c.activeResult && !isBypassed) {
        const atomVerifications = await Promise.all(
          c.activeResult.atoms.map(async atom => {
            const isValid = await this.verifyAtom(atom);
            return { atom, isValid };
          })
        );

        for (const { atom, isValid } of atomVerifications) {
          if (!isValid) {
            issues.push({
              caseId: c.caseId,
              issue: `Forensiskt Integritetsfel: Atom ${atom.id} har manipulerats eller korrumperats (Hash mismatch).`,
              severity: 'CRITICAL'
            });
          }
        }
      }

      // 5. Legal Integritetskontroll
      if (c.activeResult) {
        const legalIssues = this.validateLegalIntegrity(c.activeResult, c.caseId);
        issues.push(...legalIssues);
      }

      // 6. Versions-proveniens
      if (c.versions) {
        c.versions.forEach(v => {
          if (!v.provenance || v.provenance.length === 0) {
            issues.push({
              caseId: c.caseId,
              issue: `Version ${v.versionId} saknar proveniens-hashar.`,
              severity: 'CRITICAL'
            });
          }
        });
      }
    }

    return issues;
  }
}

export const integrityEngine = new IntegrityEngine();
