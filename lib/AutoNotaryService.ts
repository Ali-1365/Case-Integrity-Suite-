
import { db } from './db';
import { generateId } from './utils';

export interface NotaryEvent {
  id: string;
  traceId: string;
  timestamp: string;
  module: string;
  action: string;
  data?: any;
  status: 'PENDING' | 'SUCCESS' | 'FAILURE' | 'INFO';
  duration?: number;
}

/**
 * FMJAM AutoNotaryService v.1.0
 * Automatisk modul som noterar hela internarbetet och arvet i systemet.
 * Fungerar som en "svart låda" för detaljerad exekveringsspårning.
 */
export class AutoNotaryService {
  private activeTraces: Map<string, number> = new Map();

  /**
   * Startar en ny spårning för en process.
   */
  startTrace(traceId: string, module: string, action: string): void {
    this.activeTraces.set(`${traceId}:${module}:${action}`, performance.now());
    this.log({
      traceId,
      module,
      action,
      status: 'PENDING',
      data: { message: 'Process startad' }
    });
  }

  /**
   * Avslutar en spårning och loggar tidsåtgång.
   */
  endTrace(traceId: string, module: string, action: string, status: 'SUCCESS' | 'FAILURE', data?: any): void {
    const key = `${traceId}:${module}:${action}`;
    const startTime = this.activeTraces.get(key);
    const duration = startTime ? performance.now() - startTime : 0;
    this.activeTraces.delete(key);

    this.log({
      traceId,
      module,
      action,
      status,
      duration,
      data
    });
  }

  /**
   * Loggar en enskild händelse (info/notering).
   */
  info(traceId: string, module: string, message: string, data?: any): void {
    this.log({
      traceId,
      module,
      action: 'INFO',
      status: 'INFO',
      data: { message, ...data }
    });
  }

  /**
   * Huvudmetod för att spara en händelse.
   */
  private async log(event: Omit<NotaryEvent, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: NotaryEvent = {
      ...event,
      id: generateId('NOTE'),
      timestamp: new Date().toISOString()
    };

    // Persistera i IndexedDB (om vi hade en tabell för detta, annars console/memory)
    // För nu, vi använder konsolen och ett eventuellt in-memory lager för UI
    console.log(`[AUTO_NOTARY] ${fullEvent.timestamp} | ${fullEvent.module} -> ${fullEvent.action} (${fullEvent.status})`, fullEvent.data);
    
    // Vi kan spara detta i en global state eller DB om vi vill visa det i UI
    // Låt oss anta att vi har en metod i db.ts eller en lokal lyssnare
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fmjam-notary-event', { detail: fullEvent }));
    }
  }
}

export const autoNotary = new AutoNotaryService();
