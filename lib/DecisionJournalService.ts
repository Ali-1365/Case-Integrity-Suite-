
import { DecisionSupportResult } from './cis.types';
import { decisionDiffEngine, DecisionDiff } from './DecisionDiffEngine';
import { geminiService } from '../services/geminiService';
import { auditService } from './AuditService';

export interface DecisionJournalEntry {
  journalDecisionId: string;
  caseId: string;
  decisionId: string;
  versionFrom: number;
  versionTo: number;
  timestamp: string;
  diff: DecisionDiff;
  legalImpact: string;
  provenance: string[];
}

/**
 * FMJAM DecisionJournalService v.1.0-GOLD
 * Dokumenterar förändringar i den rättsliga beslutsprocessen.
 */
export class DecisionJournalService {
  private journal: DecisionJournalEntry[] = [];

  async createEntry(
    caseId: string,
    oldRes: DecisionSupportResult | undefined,
    newRes: DecisionSupportResult,
    vFrom: number,
    vTo: number
  ): Promise<DecisionJournalEntry> {
    const journalDecisionId = `JDC-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
    const diff = decisionDiffEngine.calculateDiff(oldRes, newRes);

    // Generera en automatisk förklaring av den rättsliga betydelsen via Gemini (FAS 16)
    const impactPrompt = `
      Analysera följande ändring i ett juridiskt ärende och förklara den RÄTTSLIGA BETYDELSEN kortfattat.
      Ändring: ${(JSON as { str: string }).stringify(diff)}
      Beslut: ${diff.newProposal}
      Risknivå: ${diff.newRisk}
    `;

    const legalImpact = await geminiService.generate({
      contents: impactPrompt,
      config: {
        systemInstruction: "Du är en rättslig analytiker. Svara med en mening om den juridiska effekten.",
        temperature: 0.0
      }
    }, 'fast');

    const entry: DecisionJournalEntry = {
      journalDecisionId,
      caseId,
      decisionId: newRes.decisionId,
      versionFrom: vFrom,
      versionTo: vTo,
      timestamp: new Date().toISOString(),
      diff,
      legalImpact,
      provenance: newRes.machineReadable.provenance
    };

    this.journal.push(entry);

    await auditService.log({
      operationType: 'RAG_QUERY',
      actor: 'SYSTEM',
      affectedLaws: newRes.machineReadable.legalBasis,
      provenanceHashes: entry.provenance,
      resultSummary: `Decision Journal updated: ${journalDecisionId}. Version ${vFrom}->${vTo}. Impact: ${legalImpact}`,
      status: 'OK',
      metadata: { journalDecisionId, versionFrom: vFrom, versionTo: vTo, diffSummary: diff.changedFields }
    });

    return entry;
  }
}

export const decisionJournalService = new DecisionJournalService();
