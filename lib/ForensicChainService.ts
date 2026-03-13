
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
}

/**
 * FMJAM ForensicChainService v.1.0
 * Garanterar dataintegritet genom att verifiera den kryptografiska beviskedjan.
 */
export class ForensicChainService {
  /**
   * Verifierar hela beviskedjan för ett analysresultat.
   */
  async verifyChain(result: AnalysisResult): Promise<ChainVerificationResult> {
    const atoms = result.atoms || [];
    let verifiedCount = 0;
    const failedAtoms: string[] = [];

    for (const atom of atoms) {
      const isValid = await integrityEngine.verifyAtom(atom);
      if (isValid) {
        verifiedCount++;
      } else {
        failedAtoms.push(atom.id);
      }
    }

    const integrityScore = atoms.length > 0 ? (verifiedCount / atoms.length) * 100 : 100;
    const isValid = failedAtoms.length === 0;

    const verificationResult: ChainVerificationResult = {
      isValid,
      totalAtoms: atoms.length,
      verifiedAtoms: verifiedCount,
      failedAtoms,
      integrityScore,
      timestamp: new Date().toISOString()
    };

    // Logga verifieringen i audit-loggen
    await auditService.log({
      operationType: 'INDEX', // Eller lämplig typ
      actor: 'SYSTEM',
      affectedLaws: [],
      provenanceHashes: atoms.map(a => a.hash),
      resultSummary: `Forensisk verifiering slutförd. Score: ${integrityScore}%. Valid: ${isValid}`,
      status: isValid ? 'OK' : 'ERROR',
      metadata: { caseId: result.caseId, verificationResult }
    });

    return verificationResult;
  }
}

export const forensicChainService = new ForensicChainService();
