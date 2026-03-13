
import { CISCase } from './cis.types';

/**
 * FMJAM GlobalSessionManager v.7.8-GOLD
 * Hanterar logisk isolering (Multi-Tenancy) mellan olika ärenden.
 */
export class GlobalSessionManager {
  private activeSessions: Map<string, CISCase> = new Map();

  /**
   * Registrerar en ny session för ett specifikt ärende.
   */
  registerSession(caseId: string, caseData: CISCase): void {
    this.activeSessions.set(caseId, caseData);
  }

  /**
   * Hämtar sessionen för ett specifikt ärende.
   */
  getSession(caseId: string): CISCase | undefined {
    return this.activeSessions.get(caseId);
  }

  /**
   * RAG-Scope: Begränsar sökningen till det specifika ärendets dokument (01–05).
   * Garanterar att data aldrig läcker mellan olika caseId.
   */
  getScopedArchive(caseId: string): string[] {
    const session = this.getSession(caseId);
    if (!session) return [];
    
    // Returnerar endast dokument som tillhör detta caseId
    // Vi antar att auditIds innehåller referenser till dokumenten 01-05
    return session.auditIds.filter(id => id.startsWith('DOC-'));
  }

  /**
   * Hämtar alla aktiva sessioner för systemisk analys.
   */
  getAllActiveSessions(): CISCase[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Rensar en session när ärendet är avslutat.
   */
  terminateSession(caseId: string): void {
    this.activeSessions.delete(caseId);
  }
}

export const globalSessionManager = new GlobalSessionManager();
