
import React, { useState } from 'react';
import { 
  ShieldCheckIcon, 
  BoltIcon, 
  CpuChipIcon, 
  CheckCircleIcon, 
  MagnifyingGlassIcon,
  ActivityIcon,
  SparklesIcon,
  LinkIcon,
  CodeBracketIcon,
  FingerPrintIcon,
  Spinner,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon
} from './icons';

interface ManualTriggerProps {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    isLoading?: boolean;
    status?: 'idle' | 'running' | 'completed' | 'error';
}

const ManualTrigger: React.FC<ManualTriggerProps> = ({ label, icon, onClick, isLoading, status = 'idle' }) => {
    const statusColors = {
        idle: 'border-gray-800 text-gray-400 hover:border-amber-500/50 hover:bg-amber-500/5',
        running: 'border-amber-500 text-amber-500 bg-amber-500/10 animate-pulse',
        completed: 'border-emerald-500 text-emerald-500 bg-emerald-500/10',
        error: 'border-rose-500 text-rose-500 bg-rose-500/10'
    };

    return (
        <button 
            onClick={onClick}
            disabled={isLoading}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all group ${statusColors[status]}`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${status === 'running' ? 'bg-amber-500/20' : 'bg-gray-900'} group-hover:scale-110 transition-transform`}>
                    {isLoading ? <Spinner className="w-4 h-4" /> : icon}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
            </div>
            {status === 'completed' && <CheckCircleIcon className="w-4 h-4" />}
        </button>
    );
};

export const IntelligenceCore: React.FC<{ analysis: import("../lib/cis.types").AnalysisResult }> = ({ analysis }) => {
    const [activeProcesses, setActiveProcesses] = useState<Record<string, 'idle' | 'running' | 'completed' | 'error'>>({});
    const [localLogs, setLocalLogs] = useState<{ id: string, msg: string, time: string }[]>([]);

    const addLog = (msg: string) => {
        const time = new Date().toLocaleTimeString();
        setLocalLogs(prev => [{ id: Math.random().toString(36).substr(2, 9), msg, time }, ...prev].slice(0, 10));
    };

    const triggerProcess = (id: string, label: string) => {
        setActiveProcesses(prev => ({ ...prev, [id]: 'running' }));
        addLog(`Initierar ${label}...`);
        
        setTimeout(() => {
            setActiveProcesses(prev => ({ ...prev, [id]: 'completed' }));
            addLog(`${label.charAt(0).toUpperCase() + label.slice(1)} slutförd.`);
            setTimeout(() => {
                setActiveProcesses(prev => ({ ...prev, [id]: 'idle' }));
            }, 3000);
        }, 2000);
    };

    const pipelineSteps = [
        { id: 'normalization', label: 'normalisering', icon: <ArrowPathIcon className="w-4 h-4" /> },
        { id: 'integrity', label: 'integritet', icon: <FingerPrintIcon className="w-4 h-4" /> },
        { id: 'input', label: 'indata', icon: <LinkIcon className="w-4 h-4" /> },
        { id: 'pre-analysis', label: 'för-analys', icon: <MagnifyingGlassIcon className="w-4 h-4" /> },
        { id: 'ai-analysis', label: 'ai-analys', icon: <SparklesIcon className="w-4 h-4" /> },
        { id: 'cross-correlation', label: 'kors-korrelering', icon: <AdjustmentsHorizontalIcon className="w-4 h-4" /> },
        { id: 'synthesis', label: 'syntes', icon: <CpuChipIcon className="w-4 h-4" /> },
        { id: 'results', label: 'resultat', icon: <CheckCircleIcon className="w-4 h-4" /> },
        { id: 'security', label: 'säkerhet', icon: <ShieldCheckIcon className="w-4 h-4" /> },
    ];

    const systemActions = [
        { id: 'archive', label: 'Analysera Ärendearkiv', icon: <CodeBracketIcon className="w-4 h-4" /> },
        { id: 'select', label: 'Välj ärende för analys', icon: <ActivityIcon className="w-4 h-4" /> },
        { id: 'integrity-check', label: 'Integritetskontroll', icon: <ShieldCheckIcon className="w-4 h-4" /> },
        { id: 'telemetry', label: 'System-telemetri', icon: <BoltIcon className="w-4 h-4" /> },
        { id: 'monitor', label: 'Monitorera AI-pipeline', icon: <ActivityIcon className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="bg-[#1a1a1a] border border-amber-500/30 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.05)]">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <CpuChipIcon className="w-48 h-48 text-amber-500" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded border border-amber-500/20 uppercase tracking-widest">Systemstatus</span>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-mono text-emerald-500 font-bold">AKTIV</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                            Intelligenskärna <span className="text-amber-500">v.7.2.2-GOLD</span>
                        </h2>
                        <div className="text-[10px] font-mono text-gray-500 mt-2 uppercase tracking-[0.3em] overflow-hidden whitespace-nowrap w-full max-w-md">
                            <div className="animate-marquee inline-block">
                                Systemnav • Monitor • Inventering • Beslutsmotor • Produktion • Analys • Oracle • Kontroll • Notarie • Logg • Juridik • SFB • Arkiv • Vitbok
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="px-6 py-3 bg-black/40 border border-white/5 rounded-xl text-center min-w-[120px]">
                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Belastningsfaktor</p>
                            <p className="text-xl font-black text-amber-500 font-mono">0.042</p>
                        </div>
                        <div className="px-6 py-3 bg-black/40 border border-white/5 rounded-xl text-center min-w-[120px]">
                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Integritet</p>
                            <p className="text-xl font-black text-emerald-500 font-mono">SÄKER</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Manual Pipeline Control */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <BoltIcon className="w-4 h-4 text-amber-500" />
                                Manuell Pipeline-exekvering
                            </h3>
                            <span className="text-[10px] font-mono text-gray-600">MANUELL_ÖVERSTYRNING_AKTIVERAD</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {pipelineSteps.map(step => (
                                <ManualTrigger 
                                    key={(step as { id: string }).id}
                                    label={step.label}
                                    icon={step.icon}
                                    status={activeProcesses[(step as { id: string }).id]}
                                    isLoading={activeProcesses[(step as { id: string }).id] === 'running'}
                                    onClick={() => triggerProcess((step as { id: string }).id, step.label)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                            <ActivityIcon className="w-4 h-4 text-cyan-500" />
                            Systemåtgärder
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {systemActions.map(action => (
                                <ManualTrigger 
                                    key={(action as { id: string }).id}
                                    label={action.label}
                                    icon={action.icon}
                                    status={activeProcesses[(action as { id: string }).id]}
                                    isLoading={activeProcesses[(action as { id: string }).id] === 'running'}
                                    onClick={() => triggerProcess((action as { id: string }).id, action.label)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Side Info Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none"></div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Forensisk Telemetri</h3>
                        <div className="space-y-6 relative z-10">
                            <TelemetryItem label="Entropinivå" value="0.88" sub="Optimal" />
                            <TelemetryItem label="Synkroniseringslatens" value="4ms" sub="Nominell" />
                            <TelemetryItem label="Neural Densitet" value="94%" sub="Hög" />
                            <TelemetryItem label="Kedjestabilitet" value="1.0" sub="Låst" />
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 font-mono text-[10px]">
                        <h3 className="text-gray-600 uppercase font-bold mb-4 flex items-center gap-2">
                            <CodeBracketIcon className="w-3 h-3" />
                            Kärnloggar
                        </h3>
                        <div className="space-y-2 text-gray-500 max-h-40 overflow-y-auto custom-scrollbar">
                            {(localLogs as { length: number }).length > 0 ? localLogs.map(log => (
                                <p key={(log as { id: string }).id} className="animate-in slide-in-from-left duration-300">
                                    <span className="text-amber-500/50">[{log.time}]</span> {log.msg}
                                </p>
                            )) : (
                                <>
                                    <p><span className="text-amber-500/50">[20:23:04]</span> CORE_INIT: v.7.2.2-GOLD aktiv</p>
                                    <p><span className="text-cyan-500/50">[20:23:05]</span> MONITOR: Forensisk kedja verifierad</p>
                                    <p><span className="text-emerald-500/50">[20:23:06]</span> READY: Manuella triggers standby</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TelemetryItem: React.FC<{ label: string, value: string, sub: string }> = ({ label, value, sub }) => (
    <div className="flex justify-between items-end border-b border-white/5 pb-4">
        <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">{label}</p>
            <p className="text-xs font-bold text-gray-400 uppercase">{sub}</p>
        </div>
        <div className="text-right">
            <p className="text-2xl font-black text-white font-mono tracking-tighter">{value}</p>
        </div>
    </div>
);
