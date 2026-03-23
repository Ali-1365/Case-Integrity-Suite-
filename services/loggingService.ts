
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
  details?: Record<string, unknown> | unknown;
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

  log(level: LogLevel, mode: LogMode, message: string, details?: Record<string, unknown> | unknown, duration?: number, metadata?: Record<string, unknown>): void {
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
    console.log((JSON as { str: string }).stringify(logEntry));

    this.logs.unshift(logEntry);
    if (this.(logs as { length: number }).length > 200) {
      this.logs.pop();
    }
  }

  // Helper methods for common logging patterns
  info(message: string, details?: Record<string, unknown> | unknown) { this.log('INFO', 'system', message, details); }
  warn(message: string, details?: Record<string, unknown> | unknown) { this.log('WARN', 'system', message, details); }
  error(message: string, details?: Record<string, unknown> | unknown) {
    if (details instanceof Error) {
      this.handleError(details, message);
    } else {
      this.log('ERROR', 'system', message, details); 
    }
  }

  handleError(error: Error | unknown, context?: string): void {
    const isAppErr = error instanceof AppError;
    const errorCode = isAppErr ? error.code : ErrorCode.UNKNOWN_ERROR;
    
    // Robust message extraction
    let errorMessage = "Okänt fel";
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      errorMessage = (error as Error).message || (error as { reason?: string }).reason?.message || (JSON as { str: string }).stringify(error);
    }
    
    const message = context ? `${context}: ${errorMessage}` : errorMessage;
    
    this.log('ERROR', 'system', message, {
      name: error?.name || (typeof error === 'string' ? 'StringError' : 'UnknownError'),
      code: errorCode,
      stack: error?.stack,
      details: isAppErr ? (error as { details?: unknown }).details : (error?.details || error),
      timestamp: isAppErr ? error.timestamp : new Date(),
      isOperational: isAppErr ? error.isOperational : false
    });

    // Console output for developers
    console.group(`%c🚨 FMJAM_ERROR: ${errorCode}`, "color: #f44; font-weight: bold; font-size: 14px;");
    console.error("Context:", context || "N/A");
    console.error("Message:", errorMessage);
    console.error("Error Object:", error);
    if (isAppErr && (error as { details?: unknown }).details) {
      console.error("Details:", (error as { details?: unknown }).details);
    }
    console.groupEnd();
  }

  debug(message: string, details?: Record<string, unknown> | unknown) { this.log('DEBUG', 'system', message, details); }

  // Backward compatibility for LLM logs
  addLog(entry: { mode: LogMode; prompt: string; response: string | null; error: string | null; duration: number; metadata?: Record<string, unknown> }): void {
    this.log(
      entry.error ? 'ERROR' : 'INFO',
      entry.mode,
      entry.error ? `LLM Error: ${entry.error}` : `LLM Success`,
      { prompt: (entry as { prompt?: string }).prompt, response: (entry as { response?: string }).response },
      entry.duration,
      (entry as { metadata: Record<string, unknown> }).metadata
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
