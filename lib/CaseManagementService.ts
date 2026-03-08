
import { DecisionSupportResult, CISCase, CaseVersion } from './cis.types';
import { journalService } from './JournalService';
import { auditService } from './AuditService';
import { decisionJournalService } from './DecisionJournalService';
export type { CISCase, CaseVersion };
import { db } from './db';

export class CaseManagementService {
  async createCase(query: string, priorityFlags = { hasChildAspect: false, isPreventive: false }): Promise<CISCase> {
    const caseId = `CASE-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
    const timestamp = new Date().toISOString();
    
    const newCase: CISCase = {
      caseId,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: 'INITIERAT',
      query,
      currentVersion: 1,
      versions: [],
      journal: [],
      auditIds: [],
      priorityFlags
    };

    const journal = await journalService.addEntry(caseId, 'ÄRENDE_SKAPAT', `Nytt ärende initierat med fråga: "${query}"`);
    newCase.journal.push(journal);
    
    await db.saveCase(newCase);
    return newCase;
  }

  async updateCaseWithResult(caseId: string, result: DecisionSupportResult, reason: string = 'Systemanalys slutförd'): Promise<CISCase> {
    const existing = await db.getCase(caseId);
    if (!existing) throw new Error("Ärende saknas.");

    const vFrom = Math.max(0, existing.currentVersion - 1);
    const vTo = existing.currentVersion;

    const journalEntry = await decisionJournalService.createEntry(
      caseId,
      existing.activeResult,
      result,
      vFrom,
      vTo
    );

    const timestamp = new Date().toISOString();
    const isMajorChange = existing.activeResult && existing.activeResult.proposal !== result.proposal;
    
    const version: CaseVersion = {
      versionId: vTo,
      timestamp,
      changes: isMajorChange ? `Beslutsändring: ${existing.activeResult?.proposal} -> ${result.proposal}` : 'Uppdatering av beslutsunderlag',
      reason,
      decisionSnapshot: result.proposal,
      provenance: result.machineReadable.provenance,
      journalEntry
    };

    existing.versions.push(version);
    existing.activeResult = result;
    existing.currentVersion++;
    existing.updatedAt = timestamp;
    existing.status = result.proposal === 'BEHÖVER UTREDNING' ? 'UNDER_UTREDNING' : 'BESLUTAT';
    
    const journal = await journalService.addEntry(
      caseId, 
      'BESLUT_VERSION_UPPDATERAD', 
      `Version ${vFrom} -> ${vTo} skapad. Påverkan: ${journalEntry.legalImpact}`, 
      result.machineReadable.provenance
    );
    existing.journal.push(journal);

    await db.saveCase(existing);
    return existing;
  }

  async getCase(caseId: string): Promise<CISCase | undefined> {
    return await db.getCase(caseId);
  }

  async getAllCases(): Promise<CISCase[]> {
    return await db.getAllCases();
  }
}

export const caseManagementService = new CaseManagementService();
