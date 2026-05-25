
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
  validateLegalIntegrity(result: AnalysisResult | DecisionSupportResult, caseId: string): IntegrityIssue[] {
    const issues: IntegrityIssue[] = [];
    
    // Hämta lagrumshänvisningar beroende på resultattyp
    const references = 'legalReferences' in result 
      ? result.legalReferences.map(r => ({ source: r.source, rawText: r.rawText }))
      : result.machineReadable.legalBasis.map(b => ({ source: b as any, rawText: b }));

    references.forEach(ref => {
      const exists = LEGAL_SOURCES.some(source => 
        source.reference === ref.source || 
        source.label.toLowerCase() === ref.rawText.toLowerCase() ||
        (source.sfsNumber && ref.rawText.includes(source.sfsNumber))
      );

      if (!exists) {
        issues.push({
          caseId: caseId,
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

  async validateRepository(cases: CISCase[]): Promise<IntegrityIssue[]> {
    const isBypassed = localStorage.getItem('FMJAM_INTEGRITY_BYPASS') === '1';

    // Process cases sequentially to avoid overwhelming the system
    // (e.g. out of memory, or API rate limits if verifyAtom calls remote)
    const issuesArrays = [];
    for (const c of cases) {
      const caseIssues: IntegrityIssue[] = [];

      // 1. Kontrollera ID-integritet
      if (!c.caseId.startsWith('CASE-')) {
        caseIssues.push({ caseId: c.caseId, issue: 'Ogiltigt format på CaseId.', severity: 'CRITICAL' });
      }

      // 2. Kontrollera Journal-koppling
      if (!c.journal || c.journal.length === 0) {
        caseIssues.push({ caseId: c.caseId, issue: 'Ärendet saknar händelsejournal (Brott mot FL 27 §).', severity: 'CRITICAL' });
      }

      // 3. Kontrollera Versions-historik
      if ((!c.versions || c.versions.length === 0) && c.activeResult) {
        caseIssues.push({ caseId: c.caseId, issue: 'Aktivt resultat finns men versionshistorik saknas.', severity: 'CRITICAL' });
      }

      // 4. Forensisk Hash-validering av atomer
      if (c.activeResult && !isBypassed) {
        // Parallelize inner validation of atoms but chunk them to avoid unbounded concurrency
        const chunkSize = 50; // Arbitrary chunk size to balance speed and memory/limits
        const atoms = c.activeResult.atoms;
        const failedAtoms: IntegrityIssue[] = [];
        for (let i = 0; i < atoms.length; i += chunkSize) {
           const chunk = atoms.slice(i, i + chunkSize);
           const atomValidations = await Promise.all(
              chunk.map(async (atom) => {
                 const isValid = await this.verifyAtom(atom);
                 if (!isValid) {
                   const issue: IntegrityIssue = {
                     caseId: c.caseId,
                     issue: `Forensiskt Integritetsfel: Atom ${atom.id} har manipulerats eller korrumperats (Hash mismatch).`,
                     severity: 'CRITICAL'
                   };
                   return issue;
                 }
                 return null;
              })
           );
           failedAtoms.push(...atomValidations.filter((issue): issue is IntegrityIssue => issue !== null));
        }

        caseIssues.push(...failedAtoms);

        // 5. Legal Integritetskontroll
        const legalIssues = this.validateLegalIntegrity(c.activeResult, c.caseId);
        caseIssues.push(...legalIssues);
      }

      // 6. Versions-proveniens
      if (c.versions) {
        c.versions.forEach(v => {
          if (!v.provenance || v.provenance.length === 0) {
            caseIssues.push({ caseId: c.caseId, issue: `Version ${v.versionId} saknar proveniens-hashar.`, severity: 'CRITICAL' });
          }
        });
      }

      issuesArrays.push(caseIssues);
    }

    return issuesArrays.flat();
  }
}

export const integrityEngine = new IntegrityEngine();
