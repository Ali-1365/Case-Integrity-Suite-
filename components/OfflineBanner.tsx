
import React, { useState, useEffect } from 'react';
import { offlineService, OfflineReason } from '../services/offlineService';
import { ExclamationTriangleIcon, SignalIcon, WifiIcon, XMarkIcon, BoltIcon } from './icons';
import { motion, AnimatePresence } from 'motion/react';

const OfflineBanner: React.FC = () => {
    const [isOffline, setIsOffline] = useState(offlineService.getIsOffline());
    const [reason, setReason] = useState<OfflineReason | null>(offlineService.getReason());
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const unsubscribe = offlineService.subscribe((offline, r) => {
            setIsOffline(offline);
            setReason(r);
            if (offline) setIsVisible(true);
        });
        return unsubscribe;
    }, []);

    if (!isOffline || !isVisible) return null;

    const getReasonText = () => {
        switch (reason) {
            case 'QUOTA_EXCEEDED': return 'API-kvoten är slut (429).';
            case 'NETWORK_ERROR': return 'Anslutningsfel till Gemini API.';
            case 'API_KEY_MISSING': return 'API-nyckel saknas eller är ogiltig.';
            case 'MANUAL': return 'Manuellt aktiverat.';
            default: return 'Okänt systemfel.';
        }
    };

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-orange-600 text-white overflow-hidden relative z-50 shadow-lg"
            >
                <div className="max-w-7xl mx-auto px-4 py-2 md:py-3 flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-1.5 rounded-lg">
                            <ExclamationTriangleIcon className="w-5 h-5 text-white animate-pulse" />
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase tracking-wider">OFFLINE-LÄGE — Lokala data används</p>
                            <p className="text-[10px] opacity-90 font-medium">
                                {getReasonText()} AI-generering är inaktiverad. Systemet använder cachad juridisk korpus och lokala ärendedata.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full border border-white/10">
                            <span className="flex items-center gap-1 text-[9px] font-bold uppercase">
                                <BoltIcon className="w-3 h-3" />
                                RAG: LOCAL
                            </span>
                            <span className="w-px h-3 bg-white/20"></span>
                            <span className="flex items-center gap-1 text-[9px] font-bold uppercase">
                                <SignalIcon className="w-3 h-3" />
                                API: DISCONNECTED
                            </span>
                        </div>
                        
                        <button 
                            onClick={() => setIsVisible(false)}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OfflineBanner;
