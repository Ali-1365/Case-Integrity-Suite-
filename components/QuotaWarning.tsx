
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { usageMonitorService } from '../services/usageMonitorService';
import { ExclamationTriangleIcon, KeyIcon, XMarkIcon } from './icons';

const QuotaWarning: React.FC = () => {
    const [isThrottled, setIsThrottled] = useState(false);
    const [hasCustomKey, setHasCustomKey] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const checkQuota = async () => {
            const usage = usageMonitorService.getUsage();
            setIsThrottled(geminiService.quotaState.isThrottled || usage.status === 'critical');
            const custom = await geminiService.hasCustomKey();
            setHasCustomKey(custom);
        };

        checkQuota();
        const interval = setInterval(checkQuota, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleSetupKey = async () => {
        await geminiService.openKeySelection();
        setIsVisible(false);
    };

    return (
        <div className={`fixed bottom-6 right-6 z-[9999] transition-all duration-500 transform ${(!isThrottled || !isVisible) ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100 translate-y-0'}`}>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6 shadow-2xl max-w-md backdrop-blur-md">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
                        <ExclamationTriangleIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-start">
                            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 uppercase tracking-tight">API-kvot överskriden</h3>
                            <button onClick={() => setIsVisible(false)} className="text-amber-400 hover:text-amber-600 transition-colors">
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-amber-800 dark:text-amber-400/80 mt-2 leading-relaxed">
                            Systemet har nått gränsen för gratis-användning av Gemini API. För att fortsätta med full prestanda rekommenderas att du ansluter din egen API-nyckel.
                        </p>
                        
                        {!hasCustomKey && (
                            <button 
                                onClick={handleSetupKey}
                                className="mt-4 w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-amber-900/20 active:scale-95"
                            >
                                <KeyIcon className="w-4 h-4" />
                                <span>Konfigurera egen API-nyckel</span>
                            </button>
                        )}
                        
                        <div className="mt-3 text-[9px] text-amber-600/60 dark:text-amber-400/40 font-medium">
                            Läs mer: <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-700">ai.google.dev/gemini-api/docs/billing</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuotaWarning;
