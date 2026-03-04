
export type LogMode = 'fast' | 'think' | 'system';
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface LogEntry {
  id: string;
  correlationId: string;
  timestamp: Date;
  level: LogLevel;
  mode: LogMode;
  message: string;
  details?: any;
  duration?: number; // in ms
  metadata?: Record<string, any>;
}

class LoggingService {
  private logs: LogEntry[] = [];
  private currentCorrelationId: string | null = null;

  setCorrelationId(id: string) {
    this.currentCorrelationId = id;
    this.log('DEBUG', 'system', `Trace Context Active: ${id}`);
  }

  log(level: LogLevel, mode: LogMode, message: string, details?: any, duration?: number, metadata?: Record<string, any>): void {
    const logEntry: LogEntry = {
      id: crypto.randomUUID(),
      correlationId: this.currentCorrelationId || 'N/A',
      timestamp: new Date(),
      level,
      mode,
      message,
      details,
      duration,
      metadata
    };
    
    // Structured JSON log output to console
    console.log(JSON.stringify(logEntry));

    this.logs.unshift(logEntry);
    if (this.logs.length > 200) {
      this.logs.pop();
    }
  }

  // Helper methods for common logging patterns
  info(message: string, details?: any) { this.log('INFO', 'system', message, details); }
  warn(message: string, details?: any) { this.log('WARN', 'system', message, details); }
  error(message: string, details?: any) { this.log('ERROR', 'system', message, details); }
  debug(message: string, details?: any) { this.log('DEBUG', 'system', message, details); }

  // Backward compatibility for LLM logs
  addLog(entry: { mode: LogMode; prompt: string; response: string | null; error: string | null; duration: number; metadata?: Record<string, any> }): void {
    this.log(
      entry.error ? 'ERROR' : 'INFO',
      entry.mode,
      entry.error ? `LLM Error: ${entry.error}` : `LLM Success`,
      { prompt: entry.prompt, response: entry.response },
      entry.duration,
      entry.metadata
    );
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const loggingService = new LoggingService();
