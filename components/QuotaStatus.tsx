import React, { useState, useEffect } from 'react';
import { usageMonitorService, QuotaUsage } from '../services/usageMonitorService';

export const QuotaStatus: React.FC = () => {
    const [quotaUsage, setQuotaUsage] = useState<QuotaUsage>(() => {
        try {
            return usageMonitorService.getUsage();
        } catch (e) {
            return { rpm: 0, tpm: 0, limitRpm: 15, limitTpm: 1000000, status: 'stable' };
        }
    });

    useEffect(() => {
        const interval = setInterval(() => {
            try {
                const newUsage = usageMonitorService.getUsage();
                // Bailout to prevent unnecessary re-renders
                setQuotaUsage(prev => {
                    if (
                        prev.rpm === newUsage.rpm &&
                        prev.tpm === newUsage.tpm &&
                        prev.status === newUsage.status
                    ) {
                        return prev;
                    }
                    return newUsage;
                });
            } catch (e) {
                console.warn("Usage monitor not available yet");
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center space-x-3 px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-[10px] font-mono text-white/70">
            <span className="uppercase tracking-widest opacity-50">API Status</span>
            <div className={`w-1.5 h-1.5 rounded-full ${
                quotaUsage.status === 'critical' ? 'bg-[var(--danger)]' : (quotaUsage.status === 'warning' ? 'bg-[var(--warning)]' : 'bg-[var(--success)]')
            } shadow-[0_0_8px_rgba(25,135,84,0.3)]`}></div>
            <span className="font-bold">{quotaUsage.rpm}/{quotaUsage.limitRpm}</span>
        </div>
    );
};
