
import React, { useState, useEffect } from 'react';
import { githubService, RepoStatus, SyncHealth } from '../services/githubService';
import { loggingService, LogEntry } from '../services/loggingService';
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
    CheckCircleIcon
} from './icons';

interface SystemMonitorProps {
    isOpen: boolean;
    onClose: () => void;
}

const SystemMonitor: React.FC<SystemMonitorProps> = ({ isOpen, onClose }) => {
    const [repoStatus, setRepoStatus] = useState<RepoStatus | null>(null);
    const [syncHealth, setSyncHealth] = useState<SyncHealth | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
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
            setLogs([...loggingService.getLogs()]);
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
        } finally {
            setIsRepairing(false);
        }
    };

    const handleDeactivateBypass = () => {
        githubService.setIntegrityBypass(false);
        refreshData();
    };

    useEffect(() => {
        if (isOpen) refreshData();
    }, [isOpen]);

    if (!isOpen) return null;

    const isSyncOk = syncHealth && localMetadata && syncHealth.remoteSyncId === localMetadata.sync_id;
    const isOffline = repoStatus?.errorContext === 'API_GATEWAY_DOWN';
    const isBypassed = repoStatus?.isBypassed;

    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col border overflow-hidden ${isOffline ? 'border-orange-200' : 'border-gray-200'}`}>
                
                <header className="px-8 py-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center relative overflow-hidden">
                    <div className="flex items-center space-x-4 relative z-10">
                        <div className={`p-2.5 rounded-xl border ${isOffline ? 'bg-orange-50 border-orange-200' : 'bg-gray-100 border-gray-200'}`}>
                            <BoltIcon className={`h-6 w-6 ${isOffline ? 'text-orange-600 animate-pulse' : 'text-gray-600'}`} />
                        </div>
                        <div>
                            <h2 className="text-xl font-medium text-[#1A202C] tracking-tight">System Oracle Monitor</h2>
                            <p className={`text-sm mt-0.5 flex items-center ${isOffline ? 'text-orange-600' : 'text-gray-500'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isOffline ? 'bg-orange-600 animate-ping' : 'bg-emerald-600'}`}></span>
                                {isBypassed ? 'SÄKERHETSBypass AKTIV' : (isOffline ? 'Gateway-förbindelse förlorad: Resilient läge' : 'GitHub-länk: Stabil')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 relative z-10">
                        <button 
                            onClick={refreshData}
                            disabled={isRefreshing}
                            className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 px-4 py-2 rounded-lg border border-gray-200 transition-colors"
                        >
                            {isRefreshing ? <Spinner className="h-4 w-4 text-gray-400" /> : <ArrowPathIcon className="h-4 w-4 text-gray-400" />}
                            <span>Uppdatera</span>
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </header>

                <main className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[#FCFCFC]">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatusCard label="Gateway API" status={isBypassed ? 'BYPASSED' : (isOffline ? 'UNREACHABLE' : 'STABLE')} color={isOffline ? 'red' : 'green'} details={repoStatus?.errorContext || 'READY'} />
                        <StatusCard label="Data Sync" status={isSyncOk ? 'ALIGNED' : 'CONFLICT'} color={isSyncOk ? 'green' : 'red'} details={syncHealth?.remoteSyncId?.substring(0,10) || 'LOCAL_ONLY'} />
                        <StatusCard label="Jules Workflow" status={repoStatus?.julesActive ? 'ACTIVE' : 'INACTIVE'} color={repoStatus?.julesActive ? 'blue' : 'gray'} details="Automation Status" />
                        <StatusCard label="Integrity" status={isBypassed ? 'BYPASSED' : 'v7.2.5-GOLD'} color={isBypassed ? 'red' : 'blue'} details="Active Protection" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Emergency Panel */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className={`p-6 rounded-xl border ${isOffline ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}>
                                <h3 className={`text-lg font-medium mb-4 flex items-center ${isOffline ? 'text-orange-800' : 'text-[#1A202C]'}`}>
                                    <ShieldCheckIcon className="w-5 h-5 mr-2" />
                                    Säkerhetsåsidosättning
                                </h3>
                                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                    Vid förlorad förbindelse kan du aktivera en nöd-bypass för att garantera skrivåtkomst till den lokala databasen och bibehålla arbetsflödet.
                                </p>
                                <div className="space-y-3">
                                    {!isBypassed ? (
                                        <button 
                                            onClick={handleRepair}
                                            disabled={isRepairing}
                                            className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-medium py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                                        >
                                            {isRepairing ? <Spinner className="h-4 w-4" /> : <BoltIcon className="h-4 w-4" />}
                                            Aktivera Nöd-Bypass
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleDeactivateBypass}
                                            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                                        >
                                            <CheckCircleIcon className="h-4 w-4" />
                                            Återställ Säkerhet
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setShowNukePanel(!showNukePanel)}
                                        className="w-full bg-transparent hover:bg-gray-100 text-gray-500 font-medium py-2 rounded-lg transition-colors text-xs"
                                    >
                                        Visa Terminal-fix
                                    </button>
                                </div>
                            </div>

                            {showNukePanel && (
                                <div className="bg-white border border-gray-200 p-5 rounded-xl animate-in slide-in-from-top-2 duration-200">
                                    <h4 className="text-xs font-medium text-gray-500 mb-3">ÅTERSTÄLLNINGSKOMMANDON</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 font-mono text-xs text-gray-700 space-y-1.5">
                                        <p className="text-gray-400"># För att återställa git-synk vid konflikt:</p>
                                        <p>git add .</p>
                                        <p>git commit -m "FIX: Resilient Sync v727"</p>
                                        <p>git push origin main --force</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Logs Panel */}
                        <div className="lg:col-span-8">
                             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-[500px] flex flex-col">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                    <h3 className="text-sm font-medium text-[#1A202C] flex items-center">
                                        <CodeBracketIcon className="w-4 h-4 mr-2 text-gray-400" />
                                        Systemtelemetri-ström
                                    </h3>
                                    <button 
                                        onClick={() => { loggingService.clearLogs(); setLogs([]); }}
                                        className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center transition-colors"
                                    >
                                        <TrashIcon className="h-3.5 w-3.5 mr-1.5" />
                                        Töm Buffert
                                    </button>
                                </div>
                                <div className="flex-grow overflow-y-auto p-4 font-mono text-xs space-y-2 custom-scrollbar">
                                    {logs.length > 0 ? logs.map(log => (
                                        <div key={log.id} className="flex gap-4 border-l-2 border-gray-200 pl-4 py-2 hover:bg-gray-50 transition-colors group rounded-r-lg">
                                            <span className="text-gray-400 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            <span className={`font-medium shrink-0 w-16 ${log.error ? 'text-red-600' : 'text-emerald-600'}`}>{log.mode.toUpperCase()}</span>
                                            <div className="flex-grow min-w-0">
                                                <p className="text-gray-700 truncate group-hover:text-gray-900">{log.prompt}</p>
                                                {log.error && <p className="text-red-600 mt-1.5 font-medium bg-red-50 px-2 py-1 rounded">{log.error}</p>}
                                            </div>
                                            <span className="text-gray-400 shrink-0 ml-auto">{log.duration}ms</span>
                                        </div>
                                    )) : (
                                        <div className="text-center py-32 text-gray-400 flex flex-col items-center gap-4">
                                            <InformationCircleIcon className="w-8 h-8 opacity-20" />
                                            <p className="text-sm font-medium opacity-50">Inga anrop loggade</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <span className={`flex items-center gap-2 text-xs font-medium ${isOffline ? 'text-orange-600' : 'text-gray-500'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-orange-600 animate-pulse' : 'bg-emerald-600'}`}></div>
                            {isOffline ? 'Systemet körs i autonomt lokalt läge' : 'Molnanslutning verifierad: Stabil'}
                        </span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Integritetsnivå: Gold (SFS 2025:400)</span>
                </footer>
            </div>
        </div>
    );
};

const StatusCard: React.FC<{ label: string, status: string, color: 'blue' | 'red' | 'green' | 'gray' | 'purple', details: string }> = ({ label, status, color, details }) => {
    const colors = {
        blue: 'text-blue-800',
        red: 'text-red-600',
        green: 'text-emerald-600',
        gray: 'text-gray-600',
        purple: 'text-purple-800'
    };

    return (
        <div className="bg-white border border-gray-200 p-5 rounded-xl flex flex-col justify-between shadow-sm">
            <p className="text-xs text-gray-500 font-medium mb-2">{label}</p>
            <p className={`text-xl font-semibold mb-1 ${colors[color]}`}>{status}</p>
            <p className="text-xs text-gray-600">{details}</p>
        </div>
    );
};

export default SystemMonitor;
