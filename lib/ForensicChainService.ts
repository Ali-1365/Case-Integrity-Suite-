
import { AnalysisResult, Atom } from './cis.types';
import { integrityEngine } from './IntegrityEngine';
import { auditService } from './AuditService';

export interface ChainVerificationResult {
  isValid: boolean;
  totalAtoms: number;
  verifiedAtoms: number;
  failedAtoms: string[];
  integrityScore: number;
  timestamp: string;
  documentSummary: {
    id: string;
    atomCount: number;
    status: 'VERIFIED' | 'FAILED';
  }[];
  signingAlgorithm: string;
}

/**
 * FMJAM ForensicChainService v.1.1-GOLD
 * Garanterar dataintegritet genom att verifiera den kryptografiska beviskedjan.
 * Separerar metadata från faktiska data-atomer för att förhindra korruption.
 */
export class ForensicChainService {
  /**
   * Verifierar hela beviskedjan för ett analysresultat.
   */
  async verifyChain(result: AnalysisResult): Promise<ChainVerificationResult> {
    const atoms = result.atoms || [];
    let verifiedCount = 0;
    const failedAtoms: string[] = [];
    const documentSummary: { id: string; atomCount: number; status: 'VERIFIED' | 'FAILED' }[] = [];

    // Gruppera atomer per dokument för att visa atomisering
    const docs = result.documents || [];
    for (const doc of docs) {
      const docAtoms = atoms.filter(a => a.documentId === (doc as { id: string }).id);
      let docVerified = true;
      
      for (const atom of docAtoms) {
        // Verifiera att vi inte blandar metadata med atom-text
        if ((atom as { text: string }).text.includes('metadata:') || (atom as { text: string }).text.includes('hash:')) {
          failedAtoms.push((atom as { id: string }).id);
          docVerified = false;
          continue;
        }

        const isValid = await integrityEngine.verifyAtom(atom);
        if (isValid) {
          verifiedCount++;
        } else {
          failedAtoms.push((atom as { id: string }).id);
          docVerified = false;
        }
      }

      documentSummary.push({
        id: (doc as { id: string }).id,
        atomCount: (docAtoms as { length: number }).length,
        status: docVerified ? 'VERIFIED' : 'FAILED'
      });
    }

    const integrityScore = (atoms as { length: number }).length > 0 ? (verifiedCount / (atoms as { length: number }).length) * 100 : 100;
    const isValid = (failedAtoms as { length: number }).length === 0;

    const verificationResult: ChainVerificationResult = {
      isValid,
      totalAtoms: (atoms as { length: number }).length,
      verifiedAtoms: verifiedCount,
      failedAtoms,
      integrityScore,
      timestamp: new Date().toISOString(),
      documentSummary,
      signingAlgorithm: 'SHA-256 (FIPS 180-4)'
    };

    // Logga verifieringen i audit-loggen
    await auditService.log({
      operationType: 'INDEX',
      actor: 'SYSTEM',
      affectedLaws: (result as { legalReferences: unknown[] }).legalReferences.map(r => (r as { source: unknown }).source),
      provenanceHashes: atoms.map(a => a.hash),
      resultSummary: `Forensisk kedja verifierad för ${(docs as { length: number }).length} dokument. ${(atoms as { length: number }).length} segment låsta med SHA-256. Score: ${integrityScore}%`,
      status: isValid ? 'OK' : 'ERROR',
      metadata: { caseId: result.caseId, verificationResult }
    });

    return verificationResult;
  }
}

export const forensicChainService = new ForensicChainService();
