
export type LogMode = 'fast' | 'think';

export interface LogEntry {
  id: string;
  correlationId: string; // X-Correlation-ID representation
  timestamp: Date;
  mode: LogMode;
  prompt: string;
  response: string | null;
  error: string | null;
  duration: number; // in ms
  metadata?: Record<string, any>;
}

class LoggingService {
  private logs: LogEntry[] = [];
  private currentCorrelationId: string | null = null;

  setCorrelationId(id: string) {
    this.currentCorrelationId = id;
    console.debug(`[TELEMETRY] Trace Context Active: ${id}`);
  }

  addLog(entry: Omit<LogEntry, 'id' | 'timestamp' | 'correlationId'>): void {
    const logEntry: LogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      correlationId: this.currentCorrelationId || 'N/A',
      timestamp: new Date(),
    };
    
    // Structured JSON log output to console for external aggregation
    console.log(JSON.stringify({
      level: entry.error ? 'ERROR' : 'INFO',
      ...logEntry
    }));

    this.logs.unshift(logEntry);
    if (this.logs.length > 100) {
      this.logs.pop();
    }
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const loggingService = new LoggingService();
