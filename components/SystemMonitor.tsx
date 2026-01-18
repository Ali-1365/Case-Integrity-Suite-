
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
        <div className="fixed inset-0 bg-gray-950/98 backdrop-blur-3xl z-[150] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div className={`bg-gray-900 rounded-[3rem] shadow-[0_0_150px_rgba(255,0,0,0.2)] w-full max-w-7xl h-full max-h-[94vh] flex flex-col border overflow-hidden ring-1 ring-white/5 ${isOffline ? 'border-orange-500/40' : 'border-cyan-500/20'}`}>
                
                <header className="px-10 py-10 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                        <CpuChipIcon className="w-64 h-64 text-red-500" />
                    </div>
                    
                    <div className="flex items-center space-x-8 relative z-10">
                        <div className={`p-5 rounded-3xl border shadow-[0_0_30px_rgba(239,68,68,0.2)] ${isOffline ? 'bg-orange-500/10 border-orange-500/20' : 'bg-cyan-500/10 border-cyan-500/20'}`}>
                            <BoltIcon className={`h-10 w-10 ${isOffline ? 'text-orange-500 animate-pulse' : 'text-cyan-500'}`} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">System Oracle Monitor</h2>
                            <p className={`text-[11px] font-black uppercase mt-3 tracking-[0.4em] flex items-center ${isOffline ? 'text-orange-500' : 'text-cyan-500'}`}>
                                <span className={`w-2 h-2 rounded-full mr-3 ${isOffline ? 'bg-orange-500 animate-ping' : 'bg-green-500'}`}></span>
                                {isBypassed ? 'SECURITY_OVERRIDE_ACTIVE' : (isOffline ? 'Gateway Connectivity Loss: Resilient Mode' : 'GitHub Link: Stable')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 relative z-10">
                        <button 
                            onClick={refreshData}
                            disabled={isRefreshing}
                            className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 text-[11px] font-black uppercase text-gray-300 px-6 py-3 rounded-2xl border border-gray-700 transition-all active:scale-95"
                        >
                            {isRefreshing ? <Spinner className="h-4 w-4" /> : <ArrowPathIcon className="h-4 w-4" />}
                            <span>Uppdatera</span>
                        </button>
                        <button onClick={onClose} className="p-4 text-gray-500 hover:text-white hover:bg-gray-800 rounded-3xl transition-all">
                            <XMarkIcon className="h-8 w-8" />
                        </button>
                    </div>
                </header>

                <main className="flex-grow overflow-y-auto p-12 space-y-12 custom-scrollbar bg-black/20">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <StatusCard label="Gateway API" status={isBypassed ? 'BYPASSED' : (isOffline ? 'UNREACHABLE' : 'STABLE')} color={isOffline ? 'red' : 'green'} details={repoStatus?.errorContext || 'READY'} />
                        <StatusCard label="Data Sync" status={isSyncOk ? 'ALIGNED' : 'CONFLICT'} color={isSyncOk ? 'green' : 'red'} details={syncHealth?.remoteSyncId?.substring(0,10) || 'LOCAL_ONLY'} />
                        <StatusCard label="Jules Workflow" status={repoStatus?.julesActive ? 'ACTIVE' : 'INACTIVE'} color={repoStatus?.julesActive ? 'purple' : 'gray'} details="Automation Status" />
                        <StatusCard label="Integrity" status={isBypassed ? 'BYPASSED' : 'v7.2.5-GOLD'} color={isBypassed ? 'red' : 'cyan'} details="Active Protection" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Emergency Panel */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className={`p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden border-2 ${isOffline ? 'bg-orange-950/30 border-orange-500/50' : 'bg-gray-900 border-gray-800'}`}>
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                    <ExclamationTriangleIcon className="w-32 h-32 text-orange-500" />
                                </div>
                                <h3 className={`text-2xl font-black uppercase italic tracking-tighter mb-8 flex items-center ${isOffline ? 'text-orange-500' : 'text-gray-400'}`}>
                                    <ShieldCheckIcon className="w-8 h-8 mr-4" />
                                    Security Override
                                </h3>
                                <p className="text-sm text-gray-200 mb-8 font-bold leading-relaxed">
                                    Vid förlorad förbindelse kan du aktivera en nöd-bypass för att garantera skrivåtkomst till den lokala databasen och bibehålla arbetsflödet.
                                </p>
                                <div className="space-y-4">
                                    {!isBypassed ? (
                                        <button 
                                            onClick={handleRepair}
                                            disabled={isRepairing}
                                            className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase py-5 rounded-2xl shadow-xl transition-all active:scale-95 text-sm tracking-widest flex items-center justify-center gap-3"
                                        >
                                            {isRepairing ? <Spinner className="h-5 w-5" /> : <BoltIcon className="h-5 w-5" />}
                                            Aktivera Nöd-Bypass
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleDeactivateBypass}
                                            className="w-full bg-green-600 hover:bg-green-500 text-white font-black uppercase py-5 rounded-2xl shadow-xl transition-all active:scale-95 text-sm tracking-widest flex items-center justify-center gap-3"
                                        >
                                            <CheckCircleIcon className="h-5 w-5" />
                                            Återställ Säkerhet
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setShowNukePanel(!showNukePanel)}
                                        className="w-full bg-transparent hover:bg-white/5 text-gray-500 font-black uppercase py-3 rounded-xl transition-all text-[10px] tracking-[0.3em]"
                                    >
                                        Visa Terminal-fix
                                    </button>
                                </div>
                            </div>

                            {showNukePanel && (
                                <div className="bg-black/60 border border-red-500/30 p-8 rounded-[2rem] animate-in slide-in-from-top-4 duration-300">
                                    <h4 className="text-xs font-black text-red-400 uppercase tracking-[0.2em] mb-4">RECOVERY COMMANDS</h4>
                                    <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 font-mono text-[10px] text-cyan-400 space-y-2">
                                        <p># För att återställa git-synk vid konflikt:</p>
                                        <p>git add .</p>
                                        <p>git commit -m "FIX: Resilient Sync v727"</p>
                                        <p>git push origin main --force</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Logs Panel */}
                        <div className="lg:col-span-7">
                             <div className="bg-black/60 rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl h-[600px] flex flex-col">
                                <div className="p-8 border-b border-gray-800 bg-gray-900/40 flex justify-between items-center">
                                    <h3 className="text-xs font-black text-cyan-500 uppercase tracking-[0.3em] flex items-center">
                                        <CodeBracketIcon className="w-5 h-5 mr-4" />
                                        System Telemetry Stream
                                    </h3>
                                    <button 
                                        onClick={() => { loggingService.clearLogs(); setLogs([]); }}
                                        className="text-[10px] font-black text-gray-600 hover:text-red-400 uppercase tracking-widest flex items-center transition-colors"
                                    >
                                        <TrashIcon className="h-4 w-4 mr-2" />
                                        Töm Buffert
                                    </button>
                                </div>
                                <div className="flex-grow overflow-y-auto p-8 font-mono text-[10px] space-y-4 custom-scrollbar">
                                    {logs.length > 0 ? logs.map(log => (
                                        <div key={log.id} className="flex gap-6 border-l-2 border-gray-800 pl-6 py-3 hover:bg-white/5 transition-colors group">
                                            <span className="text-gray-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            <span className={`font-black shrink-0 w-16 ${log.error ? 'text-red-500' : 'text-cyan-600'}`}>{log.mode.toUpperCase()}</span>
                                            <div className="flex-grow">
                                                <p className="text-gray-400 truncate group-hover:text-gray-200">{log.prompt.substring(0, 150)}</p>
                                                {log.error && <p className="text-red-400 mt-2 font-bold italic bg-red-900/10 p-2 rounded">{log.error}</p>}
                                            </div>
                                            <span className="text-gray-700 shrink-0 ml-auto font-bold">{log.duration}ms</span>
                                        </div>
                                    )) : (
                                        <div className="text-center py-40 text-gray-700 italic flex flex-col items-center gap-6">
                                            <InformationCircleIcon className="w-16 h-16 opacity-10" />
                                            <p className="text-lg font-black uppercase tracking-widest opacity-20">Inga anrop loggade</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="px-10 py-8 border-t border-gray-800 bg-gray-950/80 flex justify-between items-center">
                    <div className="flex items-center space-x-6">
                        <span className={`flex items-center gap-3 text-[11px] font-black uppercase tracking-widest ${isOffline ? 'text-orange-500' : 'text-green-500'}`}>
                            <div className={`w-2 h-2 rounded-full animate-ping ${isOffline ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                            {isOffline ? 'System Operating in Autonomous Local Mode' : 'Cloud Connectivity Verified: Stable'}
                        </span>
                    </div>
                    <span className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Integrity Level: Gold (SFS 2025:400)</span>
                </footer>
            </div>
        </div>
    );
};

const StatusCard: React.FC<{ label: string, status: string, color: 'cyan' | 'red' | 'green' | 'gray' | 'purple', details: string }> = ({ label, status, color, details }) => {
    const colors = {
        cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
        red: 'text-red-500 border-red-500/30 bg-red-500/5',
        green: 'text-green-500 border-green-500/30 bg-green-500/5',
        gray: 'text-gray-500 border-gray-800 bg-transparent',
        purple: 'text-purple-400 border-purple-500/30 bg-purple-500/5'
    };

    return (
        <div className={`p-8 rounded-[2.5rem] border transition-all hover:scale-[1.02] ${colors[color]}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-4">{label}</p>
            <p className="text-2xl font-black italic tracking-tighter leading-none mb-3">{status}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{details}</p>
        </div>
    );
};

export default SystemMonitor;
