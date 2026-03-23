
import { loggingService } from '../services/loggingService';

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public details?: unknown,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handleError = (error: unknown, context: string) => {
  const message = error instanceof Error ? error.message : String(error);
  loggingService.error(`[ERROR_HANDLER] Context: ${context}`, {
    message,
    error,
    timestamp: new Date().toISOString()
  });

  // Return a user-friendly message or fallback
  return {
    success: false,
    message: `Ett fel uppstod i ${context}: ${message}`,
    fallback: true,
    originalError: error
  };
};
