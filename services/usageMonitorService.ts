
import { loggingService, LogEntry } from './loggingService';

export interface QuotaUsage {
    rpm: number;
    tpm: number;
    limitRpm: number;
    limitTpm: number;
    status: 'stable' | 'warning' | 'critical';
}

class UsageMonitorService {
    private readonly RPM_LIMIT = 15; // Standard free tier RPM
    private readonly TPM_LIMIT = 1000000; // Standard free tier TPM (1M)
    
    public getUsage(): QuotaUsage {
        const logs = loggingService.getLogs();
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        // Filter logs from the last minute that are LLM calls
        const recentLlmLogs = logs.filter(log => 
            log.timestamp.getTime() > oneMinuteAgo && 
            (log.mode === 'fast' || log.mode === 'think')
        );
        
        const rpm = recentLlmLogs.length;
        
        // Estimate TPM (Tokens Per Minute)
        // Since we don't have a real tokenizer, we estimate 4 characters = 1 token
        let tpm = 0;
        recentLlmLogs.forEach(log => {
            if (log.details?.prompt) {
                tpm += Math.ceil(log.details.prompt.length / 4);
            }
            if (log.details?.response) {
                tpm += Math.ceil(log.details.response.length / 4);
            }
        });
        
        let status: QuotaUsage['status'] = 'stable';
        const rpmRatio = rpm / this.RPM_LIMIT;
        
        if (rpmRatio > 0.9) status = 'critical';
        else if (rpmRatio > 0.6) status = 'warning';
        
        return {
            rpm,
            tpm,
            limitRpm: this.RPM_LIMIT,
            limitTpm: this.TPM_LIMIT,
            status
        };
    }
}

export const usageMonitorService = new UsageMonitorService();
