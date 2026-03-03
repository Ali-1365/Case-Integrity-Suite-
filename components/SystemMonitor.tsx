
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
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
            <div className={`bg-[#111111] rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col border overflow-hidden ${isOffline ? 'border-orange-500/40' : 'border-gray-800'}`}>
                
                <header className="px-8 py-6 border-b border-gray-800 bg-[#161616] flex justify-between items-center relative overflow-hidden">
                    <div className="flex items-center space-x-4 relative z-10">
                        <div className={`p-2.5 rounded-xl border ${isOffline ? 'bg-orange-500/10 border-orange-500/20' : 'bg-gray-800/50 border-gray-700/50'}`}>
                            <BoltIcon className={`h-6 w-6 ${isOffline ? 'text-orange-500 animate-pulse' : 'text-gray-300'}`} />
                        </div>
                        <div>
                            <h2 className="text-xl font-medium text-gray-100 tracking-tight">System Oracle Monitor</h2>
                            <p className={`text-sm mt-0.5 flex items-center ${isOffline ? 'text-orange-500' : 'text-gray-500'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isOffline ? 'bg-orange-500 animate-ping' : 'bg-emerald-500'}`}></span>
                                {isBypassed ? 'SECURITY OVERRIDE ACTIVE' : (isOffline ? 'Gateway Connectivity Loss: Resilient Mode' : 'GitHub Link: Stable')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 relative z-10">
                        <button 
                            onClick={refreshData}
                            disabled={isRefreshing}
                            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-sm font-medium text-gray-200 px-4 py-2 rounded-lg border border-gray-700 transition-colors"
                        >
                            {isRefreshing ? <Spinner className="h-4 w-4 text-gray-400" /> : <ArrowPathIcon className="h-4 w-4 text-gray-400" />}
                            <span>Uppdatera</span>
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </header>

                <main className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[#0a0a0a]">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatusCard label="Gateway API" status={isBypassed ? 'BYPASSED' : (isOffline ? 'UNREACHABLE' : 'STABLE')} color={isOffline ? 'red' : 'green'} details={repoStatus?.errorContext || 'READY'} />
                        <StatusCard label="Data Sync" status={isSyncOk ? 'ALIGNED' : 'CONFLICT'} color={isSyncOk ? 'green' : 'red'} details={syncHealth?.remoteSyncId?.substring(0,10) || 'LOCAL_ONLY'} />
                        <StatusCard label="Jules Workflow" status={repoStatus?.julesActive ? 'ACTIVE' : 'INACTIVE'} color={repoStatus?.julesActive ? 'purple' : 'gray'} details="Automation Status" />
                        <StatusCard label="Integrity" status={isBypassed ? 'BYPASSED' : 'v7.2.5-GOLD'} color={isBypassed ? 'red' : 'cyan'} details="Active Protection" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Emergency Panel */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className={`p-6 rounded-xl border ${isOffline ? 'bg-orange-950/20 border-orange-500/30' : 'bg-[#161616] border-gray-800'}`}>
                                <h3 className={`text-lg font-medium mb-4 flex items-center ${isOffline ? 'text-orange-400' : 'text-gray-200'}`}>
                                    <ShieldCheckIcon className="w-5 h-5 mr-2" />
                                    Security Override
                                </h3>
                                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                                    Vid förlorad förbindelse kan du aktivera en nöd-bypass för att garantera skrivåtkomst till den lokala databasen och bibehålla arbetsflödet.
                                </p>
                                <div className="space-y-3">
                                    {!isBypassed ? (
                                        <button 
                                            onClick={handleRepair}
                                            disabled={isRepairing}
                                            className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-medium py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                                        >
                                            {isRepairing ? <Spinner className="h-4 w-4" /> : <BoltIcon className="h-4 w-4" />}
                                            Aktivera Nöd-Bypass
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleDeactivateBypass}
                                            className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-medium py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                                        >
                                            <CheckCircleIcon className="h-4 w-4" />
                                            Återställ Säkerhet
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setShowNukePanel(!showNukePanel)}
                                        className="w-full bg-transparent hover:bg-gray-800 text-gray-500 font-medium py-2 rounded-lg transition-colors text-xs"
                                    >
                                        Visa Terminal-fix
                                    </button>
                                </div>
                            </div>

                            {showNukePanel && (
                                <div className="bg-[#161616] border border-gray-800 p-5 rounded-xl animate-in slide-in-from-top-2 duration-200">
                                    <h4 className="text-xs font-medium text-gray-400 mb-3">RECOVERY COMMANDS</h4>
                                    <div className="bg-[#0a0a0a] p-4 rounded-lg border border-gray-800 font-mono text-xs text-gray-300 space-y-1.5">
                                        <p className="text-gray-500"># För att återställa git-synk vid konflikt:</p>
                                        <p>git add .</p>
                                        <p>git commit -m "FIX: Resilient Sync v727"</p>
                                        <p>git push origin main --force</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Logs Panel */}
                        <div className="lg:col-span-8">
                             <div className="bg-[#111111] rounded-xl border border-gray-800 overflow-hidden h-[500px] flex flex-col">
                                <div className="px-6 py-4 border-b border-gray-800 bg-[#161616] flex justify-between items-center">
                                    <h3 className="text-sm font-medium text-gray-200 flex items-center">
                                        <CodeBracketIcon className="w-4 h-4 mr-2 text-gray-400" />
                                        System Telemetry Stream
                                    </h3>
                                    <button 
                                        onClick={() => { loggingService.clearLogs(); setLogs([]); }}
                                        className="text-xs font-medium text-gray-500 hover:text-gray-300 flex items-center transition-colors"
                                    >
                                        <TrashIcon className="h-3.5 w-3.5 mr-1.5" />
                                        Töm Buffert
                                    </button>
                                </div>
                                <div className="flex-grow overflow-y-auto p-4 font-mono text-xs space-y-2 custom-scrollbar">
                                    {logs.length > 0 ? logs.map(log => (
                                        <div key={log.id} className="flex gap-4 border-l-2 border-gray-800 pl-4 py-2 hover:bg-gray-800/30 transition-colors group rounded-r-lg">
                                            <span className="text-gray-500 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            <span className={`font-medium shrink-0 w-16 ${log.error ? 'text-rose-400' : 'text-emerald-400'}`}>{log.mode.toUpperCase()}</span>
                                            <div className="flex-grow min-w-0">
                                                <p className="text-gray-300 truncate group-hover:text-gray-100">{log.prompt}</p>
                                                {log.error && <p className="text-rose-400 mt-1.5 font-medium bg-rose-500/10 px-2 py-1 rounded">{log.error}</p>}
                                            </div>
                                            <span className="text-gray-500 shrink-0 ml-auto">{log.duration}ms</span>
                                        </div>
                                    )) : (
                                        <div className="text-center py-32 text-gray-500 flex flex-col items-center gap-4">
                                            <InformationCircleIcon className="w-8 h-8 opacity-20" />
                                            <p className="text-sm font-medium opacity-50">Inga anrop loggade</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="px-8 py-4 border-t border-gray-800 bg-[#161616] flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <span className={`flex items-center gap-2 text-xs font-medium ${isOffline ? 'text-orange-500' : 'text-gray-500'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                            {isOffline ? 'System Operating in Autonomous Local Mode' : 'Cloud Connectivity Verified: Stable'}
                        </span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Integrity Level: Gold (SFS 2025:400)</span>
                </footer>
            </div>
        </div>
    );
};

const StatusCard: React.FC<{ label: string, status: string, color: 'cyan' | 'red' | 'green' | 'gray' | 'purple', details: string }> = ({ label, status, color, details }) => {
    const colors = {
        cyan: 'text-cyan-400',
        red: 'text-rose-400',
        green: 'text-emerald-400',
        gray: 'text-gray-400',
        purple: 'text-purple-400'
    };

    return (
        <div className="bg-[#161616] border border-gray-800 p-5 rounded-xl flex flex-col justify-between">
            <p className="text-xs text-gray-500 font-medium mb-2">{label}</p>
            <p className={`text-xl font-semibold mb-1 ${colors[color]}`}>{status}</p>
            <p className="text-xs text-gray-600">{details}</p>
        </div>
    );
};

export default SystemMonitor;
