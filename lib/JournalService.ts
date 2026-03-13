
import { auditService } from './AuditService';

export interface JournalEntry {
  entryId: string;
  caseId: string;
  timestamp: string;
  event: 'ÄRENDE_SKAPAT' | 'BESLUT_VERSION_UPPDATERAD' | 'CONTROLLER_FLAG' | 'WORKFLOW_STARTED' | 'WORKFLOW_VALIDATION_PASS' | 'WORKFLOW_VALIDATION_FAIL' | 'WORKFLOW_COMPLETED' | 'PIPELINE_COMPLETED' | 'PIPELINE_ERROR';
  details: string;
  provenanceHashes: string[];
  actor: string;
}

/**
 * FMJAM JournalService v.1.1-GOLD
 * Ansvarar för deterministisk journalföring enligt FL 27 §.
 */
export class JournalService {
  async addEntry(
    caseId: string, 
    event: JournalEntry['event'], 
    details: string, 
    hashes: string[] = [], 
    actor: string = 'SYSTEM'
  ): Promise<JournalEntry> {
    const entryId = `JRN-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
    const entry: JournalEntry = {
      entryId,
      caseId,
      timestamp: new Date().toISOString(),
      event,
      details,
      provenanceHashes: hashes,
      actor
    };

    console.debug(`[JOURNAL_WRITE] ${entryId}: ${event}`);
    
    await auditService.log({
      operationType: 'RAG_QUERY',
      actor: actor === 'CONTROLLER_ENGINE' ? 'SYSTEM' : 'USER',
      affectedLaws: [],
      provenanceHashes: hashes,
      resultSummary: `Journal entry: ${event} for ${caseId}. Details: ${details.substring(0, 50)}...`,
      status: 'OK',
      metadata: { journalEntryId: entryId, caseId, eventType: event }
    });

    return entry;
  }
}

export const journalService = new JournalService();
