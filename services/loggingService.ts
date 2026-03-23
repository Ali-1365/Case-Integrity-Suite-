
import { AppError, ErrorCode } from '../lib/errors';
import { generateId } from '../lib/utils';

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
      id: generateId('LOG'),
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
  error(message: string, details?: any) { 
    if (details instanceof Error) {
      this.handleError(details, message);
    } else {
      this.log('ERROR', 'system', message, details); 
    }
  }

  handleError(error: any, context?: string): void {
    const isAppErr = error instanceof AppError;
    const errorCode = isAppErr ? error.code : ErrorCode.UNKNOWN_ERROR;
    
    // Robust message extraction
    let errorMessage = "Okänt fel";
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      errorMessage = error.message || error.reason?.message || JSON.stringify(error);
    }
    
    const message = context ? `${context}: ${errorMessage}` : errorMessage;
    
    this.log('ERROR', 'system', message, {
      name: error?.name || (typeof error === 'string' ? 'StringError' : 'UnknownError'),
      code: errorCode,
      stack: error?.stack,
      details: isAppErr ? error.details : (error?.details || error),
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
