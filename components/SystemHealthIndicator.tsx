import React, { useState, useEffect } from 'react';
import { usageMonitorService, QuotaUsage } from '../services/usageMonitorService';

/**
 * ⚡ Bolt: React Rendering Optimization
 *
 * 💡 What: Extracted the SystemHealthIndicator logic out of the main DocumentManager component.
 * 🎯 Why: The previous implementation ran a `setInterval` that called `setQuotaUsage` every 5 seconds
 *        in the root layout component (`DocumentManager`). This forced the entire application tree—including
 *        complex views like `AnalysisView` and `SystemOverview`—to perform a full React render cycle every
 *        5 seconds, even when idle.
 * 📊 Impact: Prevents global application re-renders every 5000ms. CPU usage during idle states should drop
 *        significantly, and interaction latency during the polling tick will be eliminated.
 * 🔬 Measurement: Open React Profiler, record an idle session for 10 seconds. Observe 0 renders in
 *        DocumentManager compared to 2 previously.
 */
export const SystemHealthIndicator: React.FC = () => {
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
                setQuotaUsage(usageMonitorService.getUsage());
            } catch (e) {
                console.warn("Usage monitor not available yet");
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="hidden lg:flex flex-col items-end mr-2 px-5 py-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-inner">
            <div className="flex items-center gap-2.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Systemhälsa</span>
                <div className={`w-2 h-2 rounded-full ${quotaUsage.status === 'critical' ? 'bg-red-500 animate-pulse' : (quotaUsage.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500')}`}></div>
            </div>
            <span className={`text-xs font-mono font-black mt-0.5 ${quotaUsage.status === 'critical' ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                {quotaUsage.rpm}/{quotaUsage.limitRpm} <span className="text-[9px] opacity-50">RPM</span>
            </span>
        </div>
    );
};
