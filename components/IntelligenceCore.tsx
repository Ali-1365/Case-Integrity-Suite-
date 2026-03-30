
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
import { ModuleConnector } from './shared/ModuleConnector';

interface ManualTriggerProps {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    isLoading?: boolean;
    status?: 'idle' | 'running' | 'completed' | 'error';
}

const ManualTrigger: React.FC<ManualTriggerProps> = ({ label, icon, onClick, isLoading, status = 'idle' }) => {
    const statusColors = {
        idle: 'border-[var(--border)] text-[var(--ink-muted)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5',
        running: 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10 animate-pulse',
        completed: 'border-[var(--success)] text-[var(--success)] bg-[var(--success)]/10',
        error: 'border-[var(--danger)] text-[var(--danger)] bg-[var(--danger)]/10'
    };

    return (
        <button 
            onClick={onClick}
            disabled={isLoading}
            className={`flex items-center justify-between p-5 rounded-none border transition-all group ${statusColors[status]}`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-2.5 ${status === 'running' ? 'bg-[var(--accent)]/20' : 'bg-[var(--bg-main)]'} border border-[var(--border)] group-hover:scale-110 transition-transform`}>
                    {isLoading ? <Spinner className="w-4 h-4" /> : icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">{label}</span>
            </div>
            {status === 'completed' && <CheckCircleIcon className="w-4 h-4 text-[var(--success)]" />}
        </button>
    );
};

export const IntelligenceCore: React.FC<{ analysis: any, onNavigate?: (moduleId: string) => void }> = ({ analysis, onNavigate }) => {
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
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Enterprise Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 bg-[var(--bg-card)] p-12 border border-[var(--border-strong)] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <CpuChipIcon className="w-48 h-48 text-[var(--accent)]" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <BoltIcon className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em]">Intelligence Core v.4.2-PRO</span>
          </div>
          <h3 className="text-5xl font-black text-[var(--ink-main)] tracking-tighter italic uppercase leading-none">Neural <span className="text-[var(--accent)]">Orchestrator</span></h3>
          <p className="text-[var(--ink-muted)] font-black mt-4 max-w-xl leading-relaxed uppercase text-[11px] tracking-widest opacity-70 italic">Central kontrollenhet för AI-pipelines, kognitiv bearbetning och juridisk logik-syntes.</p>
        </div>
        <div className="flex items-center gap-6 relative z-10">
            <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest italic">Systemstatus</p>
                <p className="text-xs font-black text-[var(--success)] uppercase tracking-widest mt-1">OPERATIONAL</p>
            </div>
            <div className="w-12 h-12 bg-[var(--bg-main)] border border-[var(--border-strong)] flex items-center justify-center shadow-inner">
                <div className="w-3 h-3 bg-[var(--success)] shadow-[0_0_10px_var(--success)] animate-pulse" />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Manual Pipeline Control */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] p-12 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em] flex items-center gap-4 italic">
                                <BoltIcon className="w-5 h-5 text-[var(--accent)]" />
                                Manuell Pipeline-exekvering
                            </h3>
                            <span className="text-[10px] font-mono font-black text-[var(--ink-muted)] opacity-30 tracking-widest">MANUELL_ÖVERSTYRNING_AKTIVERAD</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {pipelineSteps.map(step => (
                                <ManualTrigger 
                                    key={step.id}
                                    label={step.label}
                                    icon={step.icon}
                                    status={activeProcesses[step.id]}
                                    isLoading={activeProcesses[step.id] === 'running'}
                                    onClick={() => triggerProcess(step.id, step.label)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)] opacity-50"></div>
                        <h3 className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em] mb-12 flex items-center gap-4 italic">
                            <ActivityIcon className="w-5 h-5 text-[var(--accent)]" />
                            Systemåtgärder
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {systemActions.map(action => (
                                <ManualTrigger 
                                    key={action.id}
                                    label={action.label}
                                    icon={action.icon}
                                    status={activeProcesses[action.id]}
                                    isLoading={activeProcesses[action.id] === 'running'}
                                    onClick={() => triggerProcess(action.id, action.label)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Side Info Panel */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] p-12 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/5 to-transparent pointer-events-none"></div>
                        <h3 className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em] mb-10 italic">Forensisk Telemetri</h3>
                        <div className="space-y-10 relative z-10">
                            <TelemetryItem label="Entropinivå" value="0.88" sub="Optimal" />
                            <TelemetryItem label="Synkroniseringslatens" value="4ms" sub="Nominell" />
                            <TelemetryItem label="Neural Densitet" value="94%" sub="Hög" />
                            <TelemetryItem label="Kedjestabilitet" value="1.0" sub="Låst" />
                        </div>
                    </div>

                    <div className="bg-[var(--bg-main)] border border-[var(--border-strong)] p-10 font-mono text-[10px] relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--border-strong)]"></div>
                        <h3 className="text-[var(--ink-muted)] uppercase font-black mb-8 flex items-center gap-4 italic tracking-[0.2em]">
                            <CodeBracketIcon className="w-4 h-4 text-[var(--accent)]" />
                            Kärnloggar
                        </h3>
                        <div className="space-y-4 text-[var(--ink-muted)] max-h-80 overflow-y-auto custom-scrollbar pr-6">
                            {localLogs.length > 0 ? localLogs.map(log => (
                                <p key={log.id} className="animate-in slide-in-from-left duration-300 border-l-2 border-[var(--border)] pl-4 py-2 hover:bg-[var(--accent)]/5 transition-colors">
                                    <span className="text-[var(--accent)] font-black">[{log.time}]</span> <span className="text-[var(--ink-main)] font-black uppercase tracking-tighter">{log.msg}</span>
                                </p>
                            )) : (
                                <div className="space-y-4 opacity-60">
                                    <p className="border-l-2 border-[var(--border)] pl-4 py-2"><span className="text-[var(--accent)] font-black">[20:23:04]</span> CORE_INIT: v.7.2.2-GOLD aktiv</p>
                                    <p className="border-l-2 border-[var(--border)] pl-4 py-2"><span className="text-[var(--accent)] font-black">[20:23:05]</span> MONITOR: Forensisk kedja verifierad</p>
                                    <p className="border-l-2 border-[var(--border)] pl-4 py-2"><span className="text-[var(--accent)] font-black">[20:23:06]</span> READY: Manuella triggers standby</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ModuleConnector activeModule="oracle" onNavigate={onNavigate} />
        </div>
    );
};

const TelemetryItem: React.FC<{ label: string, value: string, sub: string }> = ({ label, value, sub }) => (
    <div className="flex justify-between items-end border-b border-[var(--border)] pb-6 group hover:border-[var(--accent)]/50 transition-colors">
        <div>
            <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase mb-2 tracking-widest italic">{label}</p>
            <p className="text-[10px] font-black text-[var(--accent)] uppercase italic">{sub}</p>
        </div>
        <div className="text-right">
            <p className="text-3xl font-black text-[var(--ink-main)] font-mono tracking-tighter italic">{value}</p>
        </div>
    </div>
);
