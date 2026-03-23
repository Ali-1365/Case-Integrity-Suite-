
import { db, AuditLogEntry } from './db';

/**
 * FMJAM AuditService v.7.6.0
 * Ansvarar för revisionssäker loggning av hela systemkedjan.
 */
export class AuditService {
  /**
   * Loggar en operation till systemets audit-trail.
   * Accepterar ett valfritt ID för synkronisering mellan tjänster i DRIFT-läge.
   */
  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>, manualId?: string): Promise<void> {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: manualId || `AUDIT-${crypto.randomUUID().substring(0, 8).toUpperCase()}`,
      timestamp: new Date().toISOString()
    };
    
    // 1. Persistera i IndexedDB (Vår motsvarighet till rag.log.json i webbmiljö)
    await db.addAuditLog(fullEntry);
    
    // 2. Skriv till konsol för realtidsövervakning (Oracle-vänligt)
    console.log(`[AUDIT_LOG_WRITE] -> audit/rag.log.json | ID: ${(fullEntry as { id: string }).id} | ${fullEntry.resultSummary}`);
  }

  /**
   * Exporterar loggar som JSON-filer för extern granskning.
   */
  async exportLogs(type: 'INGEST' | 'INDEX' | 'RAG_QUERY' | 'ALL'): Promise<void> {
    const allLogs = await db.getAuditLogs();
    const filtered = type === 'ALL' ? allLogs : allLogs.filter(l => l.operationType === type);
    
    const data = (JSON as { str: string }).stringify(filtered, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fmjam_audit_${type.toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const auditService = new AuditService();
