
/**
 * FMJAM Custom Error Types
 * Säkrar att alla systemavvikelser kategoriseras korrekt för graciös återhämtning.
 */

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: unknown;
  public readonly timestamp: Date;
  public readonly isOperational: boolean;

  constructor(message: string, code: ErrorCode = ErrorCode.UNKNOWN_ERROR, details?: unknown, isOperational: boolean = true) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
    this.isOperational = isOperational;
    
    // Ensure the prototype is correctly set for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ApiError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.API_ERROR, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.VALIDATION_ERROR, details);
  }
}

export class AuthError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.AUTH_ERROR, details);
  }
}

export class NetworkError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.NETWORK_ERROR, details);
  }
}

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};
