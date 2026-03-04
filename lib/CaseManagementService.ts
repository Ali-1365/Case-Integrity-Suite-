
import { DecisionSupportResult } from './DecisionSupportService';
import { journalService, JournalEntry } from './JournalService';
import { auditService } from './AuditService';
import { decisionJournalService, DecisionJournalEntry } from './DecisionJournalService';

export type CaseStatus = 'INITIERAT' | 'UNDER_UTREDNING' | 'BESLUTAT' | 'KORRIGERAT' | 'AVSLUTAT';

export interface CaseVersion {
  versionId: number;
  timestamp: string;
  changes: string;
  reason: string;
  decisionSnapshot: string;
  provenance: string[];
  journalEntry?: DecisionJournalEntry;
}

export interface CISCase {
  caseId: string;
  createdAt: string;
  updatedAt: string;
  status: CaseStatus;
  query: string;
  currentVersion: number;
  activeResult?: DecisionSupportResult;
  versions: CaseVersion[];
  journal: JournalEntry[];
  auditIds: string[];
  priorityFlags: { hasChildAspect: boolean; isPreventive: boolean; }; // Added for Bias Engine
}

export class CaseManagementService {
  private cases: Map<string, CISCase> = new Map();

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
    
    this.cases.set(caseId, newCase);
    return newCase;
  }

  async updateCaseWithResult(caseId: string, result: DecisionSupportResult, reason: string = 'Systemanalys slutförd'): Promise<CISCase> {
    const existing = this.cases.get(caseId);
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

    this.cases.set(caseId, existing);
    return existing;
  }

  getCase(caseId: string): CISCase | undefined {
    return this.cases.get(caseId);
  }

  getAllCases(): CISCase[] {
    return Array.from(this.cases.values());
  }
}

export const caseManagementService = new CaseManagementService();
