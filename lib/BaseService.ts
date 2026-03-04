
import { loggingService } from '../services/loggingService';

export abstract class BaseService {
  protected abstract serviceName: string;

  protected async executeWithLogging<T>(
    operationName: string,
    params: any,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    loggingService.debug(`[${this.serviceName}] Starting ${operationName}`, { params });
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      loggingService.info(`[${this.serviceName}] Completed ${operationName}`, { 
        duration,
        result: this.sanitizeResult(result)
      });
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      loggingService.error(`[${this.serviceName}] Failed ${operationName}`, {
        duration,
        error: error.message,
        stack: error.stack,
        params
      });
      throw error;
    }
  }

  private sanitizeResult(result: any): any {
    if (result === null || result === undefined) return result;
    // Avoid logging huge objects
    if (Array.isArray(result)) return { count: result.length };
    if (typeof result === 'object' && result !== null) {
      const keys = Object.keys(result);
      if (keys.length > 10) return { keys: keys.slice(0, 10), total: keys.length };
    }
    return result;
  }
}
