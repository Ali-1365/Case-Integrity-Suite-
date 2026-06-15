
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
      const docAtoms = atoms.filter(a => a.documentId === doc.id);
      let docVerified = true;
      
      const verificationResults = await Promise.all(
        docAtoms.map(async (atom) => {
          // Verifiera att vi inte blandar metadata med atom-text
          if (atom.text.includes('metadata:') || atom.text.includes('hash:')) {
            return { atom, isValid: false, isMetadataError: true };
          }
          const isValid = await integrityEngine.verifyAtom(atom);
          return { atom, isValid, isMetadataError: false };
        })
      );

      for (const { atom, isValid, isMetadataError } of verificationResults) {
        if (isMetadataError) {
          failedAtoms.push(atom.id);
          docVerified = false;
        } else if (isValid) {
          verifiedCount++;
        } else {
          failedAtoms.push(atom.id);
          docVerified = false;
        }
      }

      documentSummary.push({
        id: doc.id,
        atomCount: docAtoms.length,
        status: docVerified ? 'VERIFIED' : 'FAILED'
      });
    }

    const integrityScore = atoms.length > 0 ? (verifiedCount / atoms.length) * 100 : 100;
    const isValid = failedAtoms.length === 0;

    const verificationResult: ChainVerificationResult = {
      isValid,
      totalAtoms: atoms.length,
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
      affectedLaws: result.legalReferences.map(r => r.source),
      provenanceHashes: atoms.map(a => a.hash),
      resultSummary: `Forensisk kedja verifierad för ${docs.length} dokument. ${atoms.length} segment låsta med SHA-256. Score: ${integrityScore}%`,
      status: isValid ? 'OK' : 'ERROR',
      metadata: { caseId: result.caseId, verificationResult }
    });

    return verificationResult;
  }
}

export const forensicChainService = new ForensicChainService();
