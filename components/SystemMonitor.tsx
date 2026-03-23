
import React, { useState, useEffect } from 'react';
import { githubService, RepoStatus, SyncHealth } from '../services/githubService';
import { usageMonitorService, QuotaUsage } from '../services/usageMonitorService';
import { loggingService } from '../services/loggingService';
import { offlineService } from '../services/offlineService';
import { useLogging } from '../hooks/useLogging';
import { db } from '../lib/db';
import { 
    XMarkIcon, 
    ComputerDesktopIcon, 
    ShieldCheckIcon, 
    ActivityIcon, 
    GithubIcon, 
    ArrowPathIcon,
    ExclamationTriangleIcon,
    BoltIcon,
    CpuChipIcon,
    Spinner,
    TrashIcon,
    CodeBracketIcon,
    InformationCircleIcon,
    LinkIcon,
    CheckCircleIcon,
    SignalIcon
} from './icons';

interface SystemMonitorProps {
    isOpen: boolean;
    onClose: () => void;
}

const SystemMonitor: React.FC<SystemMonitorProps> = ({ isOpen, onClose }) => {
    const [repoStatus, setRepoStatus] = useState<RepoStatus | null>(null);
    const [syncHealth, setSyncHealth] = useState<SyncHealth | null>(null);
    const [quotaUsage, setQuotaUsage] = useState<QuotaUsage | null>(null);
    const [isOffline, setIsOffline] = useState(offlineService.getIsOffline());
    const { logs, refreshLogs, clearLogs } = useLogging(50);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [localMetadata, setLocalMetadata] = useState<any>(null);
    const [showNukePanel, setShowNukePanel] = useState(false);
    const [isRepairing, setIsRepairing] = useState(false);

    const refreshData = async () => {
        setIsRefreshing(true);
        try {
            const [status, health, metaRes] = await Promise.all([
                githubService.getRepoStatus(),
                githubService.getSyncHealth(),
                fetch('/metadata.json').then(r => r.json()).catch(() => null)
            ]);
            setRepoStatus(status);
            setSyncHealth(health);
            setLocalMetadata(metaRes);
            setQuotaUsage(usageMonitorService.getUsage());
            setIsOffline(offlineService.getIsOffline());
            refreshLogs();
        } catch (error: unknown) {
            console.error("Failed to refresh system monitor data:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleRepair = async () => {
        setIsRepairing(true);
        try {
            await db.repairPersistence();
            githubService.setIntegrityBypass(true);
            await refreshData();
            // Notifiering om lyckad bypass-aktivering
        } catch (error: unknown) {
            console.error("Repair failed:", error);
        } finally {
            setIsRepairing(false);
        }
    };

    const handleDeactivateBypass = () => {
        githubService.setIntegrityBypass(false);
        refreshData().catch(err => console.error("Failed to refresh data after deactivating bypass:", err));
    };

    const toggleOffline = () => {
        const newOffline = !isOffline;
        offlineService.setOffline(newOffline, newOffline ? 'MANUAL' : null);
        setIsOffline(newOffline);
    };

    useEffect(() => {
        if (isOpen) {
            refreshData().catch(err => console.error("Failed to refresh data on open:", err));
        }
    }, [isOpen]);

    useEffect(() => {
        const unsubscribe = offlineService.subscribe((offline) => {
            setIsOffline(offline);
        });
        return unsubscribe;
    }, []);

    if (!isOpen) return null;

    const isSyncOk = syncHealth && localMetadata && syncHealth.remoteSyncId === localMetadata.sync_id;
    const isOfflineGateway = repoStatus?.errorContext === 'API_GATEWAY_DOWN' || isOffline;
    const isBypassed = repoStatus?.isBypassed;

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 overflow-hidden transition-all">
            
            <header className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center relative overflow-hidden">
                    <div className="flex items-center space-x-4 relative z-10">
                        <div className={`p-2.5 rounded-xl border ${isOfflineGateway ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                            <BoltIcon className={`h-6 w-6 ${isOfflineGateway ? 'text-orange-600 animate-pulse' : 'text-slate-600 dark:text-slate-400'}`} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">System Oracle Monitor</h2>
                            <p className={`text-xs mt-0.5 flex items-center ${isOfflineGateway ? 'text-orange-600' : 'text-slate-500'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isOfflineGateway ? 'bg-orange-600 animate-ping' : 'bg-emerald-600'}`}></span>
                                {isOffline ? 'OFFLINE-LÄGE AKTIVT' : (isBypassed ? 'SÄKERHETSBypass AKTIV' : (isOfflineGateway ? 'Gateway-förbindelse förlorad' : 'GitHub-länk: Stabil'))}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 relative z-10">
                        <button 
                            onClick={toggleOffline}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${isOffline ? 'bg-orange-600 text-white border-orange-700' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
                        >
                            <SignalIcon className="h-3.5 w-3.5" />
                            <span>{isOffline ? 'GÅ ONLINE' : 'GÅ OFFLINE'}</span>
                        </button>
                        <button 
                            onClick={() => refreshData().catch(err => console.error("Manual refresh failed:", err))}
                            disabled={isRefreshing}
                            className="flex items-center space-x-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                            {isRefreshing ? <Spinner className="h-3.5 w-3.5 text-slate-400" /> : <ArrowPathIcon className="h-3.5 w-3.5 text-slate-400" />}
                            <span>Uppdatera</span>
                        </button>
                        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </header>

                <main className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50 dark:bg-slate-950/20">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatusCard label="Gateway API" status={isOffline ? 'OFFLINE' : (isBypassed ? 'BYPASSED' : (isOfflineGateway ? 'UNREACHABLE' : 'STABLE'))} color={isOfflineGateway ? 'red' : 'green'} details={isOffline ? 'MANUAL_OVERRIDE' : (repoStatus?.errorContext || 'READY')} />
                        <StatusCard label="Data Sync" status={isSyncOk ? 'ALIGNED' : 'CONFLICT'} color={isSyncOk ? 'green' : 'red'} details={syncHealth?.remoteSyncId?.substring(0,10) || 'LOCAL_ONLY'} />
                        <StatusCard 
                            label="API Quota (RPM)" 
                            status={`${quotaUsage?.rpm || 0} / ${quotaUsage?.limitRpm || 15}`} 
                            color={quotaUsage?.status === 'critical' ? 'red' : (quotaUsage?.status === 'warning' ? 'blue' : 'green')} 
                            details={`TPM Est: ${quotaUsage?.tpm.toLocaleString() || 0}`} 
                        />
                        <StatusCard label="Integrity" status={isBypassed ? 'BYPASSED' : 'SFB-GOLD-COMPLIANT'} color={isBypassed ? 'red' : 'blue'} details="MÅL SFB : Active Protection" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Emergency Panel */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className={`p-6 rounded-xl border ${isOffline ? 'bg-orange-50 border-orange-200' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                                <h3 className={`text-sm font-semibold mb-4 flex items-center ${isOffline ? 'text-orange-800' : 'text-slate-900 dark:text-white'}`}>
                                    <ShieldCheckIcon className="w-4 h-4 mr-2" />
                                    Säkerhetsåsidosättning
                                </h3>
                                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                                    Vid förlorad förbindelse kan du aktivera en nöd-bypass för att garantera skrivåtkomst.
                                </p>
                                <div className="space-y-3">
                                    {!isBypassed ? (
                                        <button 
                                            onClick={handleRepair}
                                            disabled={isRepairing}
                                            className="w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 font-medium py-2 rounded-lg transition-colors text-xs flex items-center justify-center gap-2"
                                        >
                                            {isRepairing ? <Spinner className="h-3.5 w-3.5" /> : <BoltIcon className="h-3.5 w-3.5" />}
                                            Aktivera Nöd-Bypass
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleDeactivateBypass}
                                            className="w-full bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 font-medium py-2 rounded-lg transition-colors text-xs flex items-center justify-center gap-2"
                                        >
                                            <CheckCircleIcon className="h-3.5 w-3.5" />
                                            Återställ Säkerhet
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setShowNukePanel(!showNukePanel)}
                                        className="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 font-medium py-1.5 rounded-lg transition-colors text-[10px]"
                                    >
                                        Visa Terminal-fix
                                    </button>
                                </div>
                            </div>

                            {showNukePanel && (
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl animate-in slide-in-from-top-2 duration-200">
                                    <h4 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">ÅTERSTÄLLNING</h4>
                                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-900 font-mono text-[10px] text-slate-600 dark:text-slate-400 space-y-1">
                                        <p>git add .</p>
                                        <p>git commit -m "FIX"</p>
                                        <p>git push origin main --force</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Logs Panel */}
                        <div className="lg:col-span-8">
                             <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden h-[400px] flex flex-col">
                                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center">
                                        <CodeBracketIcon className="w-3.5 h-3.5 mr-2 text-slate-400" />
                                        Systemtelemetri
                                    </h3>
                                    <button 
                                        onClick={clearLogs}
                                        className="text-[10px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center transition-colors uppercase tracking-wider"
                                    >
                                        <TrashIcon className="h-3 w-3 mr-1.5" />
                                        Töm
                                    </button>
                                </div>
                                <div className="flex-grow overflow-y-auto p-4 font-mono text-[10px] space-y-2 custom-scrollbar">
                                    {logs.length > 0 ? logs.map(log => (
                                        <div key={log.id} className="flex gap-4 border-l-2 border-slate-100 dark:border-slate-800 pl-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group rounded-r-lg">
                                            <span className="text-slate-400 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            <span className={`font-bold shrink-0 w-16 ${log.level === 'ERROR' ? 'text-red-600' : 'text-emerald-600'}`}>{log.mode.toUpperCase()}</span>
                                            <div className="flex-grow min-w-0">
                                                <p className="text-slate-700 dark:text-slate-300 truncate group-hover:text-slate-900 dark:group-hover:text-white">{log.message}</p>
                                                {log.level === 'ERROR' && log.details && <p className="text-red-600 mt-1 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">{JSON.stringify(log.details)}</p>}
                                            </div>
                                            <span className="text-slate-400 shrink-0 ml-auto">{log.duration ? `${log.duration}ms` : ''}</span>
                                        </div>
                                    )) : (
                                        <div className="text-center py-24 text-slate-400 flex flex-col items-center gap-4">
                                            <InformationCircleIcon className="w-8 h-8 opacity-20" />
                                            <p className="text-xs font-medium opacity-50">Inga anrop loggade</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="px-8 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <span className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${isOffline ? 'text-orange-600' : 'text-slate-400'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-orange-600 animate-pulse' : 'bg-emerald-600'}`}></div>
                            {isOffline ? 'Autonomt läge' : 'Molnanslutning: Stabil'}
                        </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Integritet: SFB-GOLD</span>
                </footer>
        </div>
    );
};

const StatusCard: React.FC<{ label: string, status: string, color: 'blue' | 'red' | 'green' | 'gray' | 'purple', details: string }> = ({ label, status, color, details }) => {
    const colors = {
        blue: 'text-blue-600 dark:text-blue-400',
        red: 'text-red-600 dark:text-red-400',
        green: 'text-emerald-600 dark:text-emerald-400',
        gray: 'text-slate-600 dark:text-slate-400',
        purple: 'text-purple-600 dark:text-purple-400'
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-sm">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">{label}</p>
            <p className={`text-lg font-bold mb-1 ${colors[color]}`}>{status}</p>
            <p className="text-[10px] text-slate-400 truncate">{details}</p>
        </div>
    );
};

export default SystemMonitor;
