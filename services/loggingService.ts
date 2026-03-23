
import { AppError, ErrorCode } from '../lib/errors';

export type LogMode = 'fast' | 'think' | 'system';
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface LogEntry {
  id: string;
  correlationId: string;
  timestamp: Date;
  level: LogLevel;
  mode: LogMode;
  message: string;
  details?: unknown;
  duration?: number; // in ms
  metadata?: Record<string, unknown>;
}

class LoggingService {
  private logs: LogEntry[] = [];
  private currentCorrelationId: string | null = null;

  setCorrelationId(id: string) {
    this.currentCorrelationId = id;
    this.log('DEBUG', 'system', `Trace Context Active: ${id}`);
  }

  log(level: LogLevel, mode: LogMode, message: string, details?: unknown, duration?: number, metadata?: Record<string, unknown>): void {
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
  info(message: string, details?: unknown) { this.log('INFO', 'system', message, details); }
  warn(message: string, details?: unknown) { this.log('WARN', 'system', message, details); }
  error(message: string, details?: unknown) {
    if (details instanceof Error) {
      this.handleError(details, message);
    } else {
      this.log('ERROR', 'system', message, details); 
    }
  }

  handleError(error: unknown, context?: string): void {
    const isAppErr = error instanceof AppError;
    const errorCode = isAppErr ? error.code : ErrorCode.UNKNOWN_ERROR;
    
    // Robust message extraction
    let errorMessage = "Okänt fel";
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      // @ts-expect-error
      errorMessage = (error as Error).message || error.reason?.message || JSON.stringify(error);
    }
    
    const message = context ? `${context}: ${errorMessage}` : errorMessage;
    
    this.log('ERROR', 'system', message, {
      // @ts-expect-error
      name: error?.name || (typeof error === 'string' ? 'StringError' : 'UnknownError'),
      code: errorCode,
      // @ts-expect-error
      stack: error?.stack,
      // @ts-expect-error
      details: isAppErr ? (error as Record<string, unknown>).details : (error?.details || error),
      timestamp: isAppErr ? error.timestamp : new Date(),
      isOperational: isAppErr ? error.isOperational : false
    });

    // Console output for developers
    console.group(`%c🚨 FMJAM_ERROR: ${errorCode}`, "color: #f44; font-weight: bold; font-size: 14px;");
    console.error("Context:", context || "N/A");
    console.error("Message:", errorMessage);
    console.error("Error Object:", error);
    if (isAppErr && error.details) {
      console.error("Details:", error.details);
    }
    console.groupEnd();
  }

  debug(message: string, details?: unknown) { this.log('DEBUG', 'system', message, details); }

  // Backward compatibility for LLM logs
  addLog(entry: { mode: LogMode; prompt: string; response: string | null; error: string | null; duration: number; metadata?: Record<string, unknown> }): void {
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
