
import { loggingService } from './loggingService';

/**
 * FMJAM Telemetry & Logger Service
 * Säkrar att alla systemavvikelser loggas för analys.
 */
export const logError = (message: string, error: Error | null, errorInfo?: any) => {
  loggingService.handleError(error || new Error(message), message);
  if (errorInfo) {
    loggingService.debug("React Component Stack Trace", errorInfo.componentStack);
  }
};
