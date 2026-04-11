
import React, { useState, useEffect } from 'react';
import { 
    DocumentTextIcon, 
    LawIcon, 
    LinkIcon, 
    AlertIcon, 
    BoltIcon, 
    ShieldCheckIcon, 
    PrinterIcon,
    Spinner,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon
} from './icons';
import { legalPipelineService, PipelineState, PipelineReport } from '../lib/LegalPipelineService';
import { AnalysisResult } from '../lib/cis.types';
import Markdown from 'react-markdown';
import { ModuleConnector } from './shared/ModuleConnector';

// Mock Chevron icons since they aren't in icons.tsx
const ChevronDown: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const ChevronUp: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
    </svg>
);

interface LegalPipelineViewProps {
    analysis: AnalysisResult;
    onNavigate?: (moduleId: string) => void;
}

export const LegalPipelineView: React.FC<LegalPipelineViewProps> = ({ analysis, onNavigate }) => {
    const [state, setState] = useState<PipelineState | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [expandedStep, setExpandedStep] = useState<string | null>(null);

    const runPipeline = async () => {
        setIsRunning(true);
        try {
            const caseData = JSON.stringify(analysis);
            await legalPipelineService.runFullPipeline(analysis.caseId, caseData, (newState) => {
                setState(newState);
            });
        } catch (error) {
            console.error("Legal pipeline failed:", error);
        } finally {
            setIsRunning(false);
        }
    };

    const getStepIcon = (stepId: string) => {
        switch (stepId) {
            case '1': return <DocumentTextIcon className="w-4 h-4" />;
            case '2': return <DocumentTextIcon className="w-4 h-4 text-[var(--accent)]" />;
            case '3': return <LawIcon className="w-4 h-4 text-purple-500" />;
            case '4': return <LinkIcon className="w-4 h-4 text-emerald-500" />;
            case '5': return <LawIcon className="w-4 h-4 text-indigo-500" />;
            case '6': return <AlertIcon className="w-4 h-4 text-[var(--warning)]" />;
            case '7': return <BoltIcon className="w-4 h-4 text-[var(--danger)]" />;
            case '8': return <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />;
            case '9': return <PrinterIcon className="w-4 h-4 text-[var(--ink-muted)]" />;
            default: return <DocumentTextIcon className="w-4 h-4" />;
        }
    };

    const getStatusIcon = (status: PipelineReport['status']) => {
        switch (status) {
            case 'pending': return <ClockIcon className="w-4 h-4 text-[var(--ink-light)]" />;
            case 'running': return <Spinner className="w-4 h-4 text-[var(--accent)]" />;
            case 'completed': return <CheckCircleIcon className="w-4 h-4 text-[var(--success)]" />;
            case 'error': return <XCircleIcon className="w-4 h-4 text-[var(--danger)]" />;
            case 'blocked': return <XCircleIcon className="w-4 h-4 text-[var(--ink-light)]" />;
        }
    };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      {/* Enterprise Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-[var(--ink-main)] tracking-tight uppercase italic">Beviskedja <span className="text-[var(--accent)] opacity-50">Pipeline v.1.4</span></h3>
          <p className="text-[9px] text-[var(--ink-muted)] font-black uppercase tracking-[0.2em] opacity-70">Visualisering av den forensiska beviskedjan och pipeline-status.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={runPipeline}
            disabled={isRunning}
            className={`px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl relative overflow-hidden group ${
              isRunning 
              ? 'bg-[var(--bg-main)] text-[var(--ink-light)] cursor-not-allowed border border-[var(--border)]' 
              : 'bg-[var(--ink-main)] text-white hover:bg-[var(--accent)] border border-transparent active:scale-95'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            {isRunning ? <Spinner className="w-4 h-4" /> : <BoltIcon className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
            <span>{isRunning ? 'Kör Pipeline...' : 'Starta Pipeline'}</span>
          </button>
          <div className="px-5 py-3 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] flex items-center gap-3 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)] animate-pulse" />
            <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest">Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Pipeline Steps */}
                <div className="lg:col-span-4 space-y-3">
                    {state?.reports.map((report) => (
                        <div 
                            key={report.stepId}
                            onClick={() => report.output && setExpandedStep(expandedStep === report.stepId ? null : report.stepId)}
                            className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                                expandedStep === report.stepId 
                                ? 'bg-[var(--accent)]/5 border-[var(--accent)]/50 shadow-sm' 
                                : 'bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--accent)]/30 hover:bg-[var(--bg-main)]'
                            }`}
                        >
                            {expandedStep === report.stepId && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
                            )}
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-lg transition-all duration-300 ${
                                        report.status === 'completed' 
                                        ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20' 
                                        : 'bg-[var(--bg-main)] text-[var(--ink-light)] border border-[var(--border)]'
                                    }`}>
                                        {getStepIcon(report.stepId)}
                                    </div>
                                    <div>
                                        <p className={`text-xs font-black transition-colors ${
                                            expandedStep === report.stepId ? 'text-[var(--ink-main)]' : 'text-[var(--ink-muted)] group-hover:text-[var(--ink-main)]'
                                        }`}>{report.label}</p>
                                        <p className="text-[9px] text-[var(--ink-light)] font-black uppercase tracking-widest mt-0.5">Steg {report.stepId}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="transition-transform duration-300 group-hover:scale-110">
                                        {getStatusIcon(report.status)}
                                    </div>
                                    {report.output && (
                                        <div className={`transition-transform duration-300 ${expandedStep === report.stepId ? 'rotate-180 text-[var(--accent)]' : 'text-[var(--ink-light)]'}`}>
                                            <ChevronDown className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {!state && (
                        <div className="p-8 border-2 border-dashed border-[var(--border)] rounded-2xl flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                            <div className="p-3 bg-[var(--bg-main)] rounded-full">
                                <ClockIcon className="w-6 h-6 text-[var(--ink-light)]" />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--ink-light)]">Väntar på initiering</p>
                        </div>
                    )}
                </div>

                {/* Output Display */}
                <div className="lg:col-span-8">
                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl h-full min-h-[600px] flex flex-col shadow-sm overflow-hidden relative group/display">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--accent)]/5 rounded-full blur-3xl group-hover/display:bg-[var(--accent)]/10 transition-all duration-1000"></div>
                        
                        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-main)]/50 backdrop-blur-md flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--accent)]/5 rounded-lg border border-[var(--accent)]/10">
                                    <DocumentTextIcon className="w-4 h-4 text-[var(--accent)]" />
                                </div>
                                <span className="text-[10px] font-black text-[var(--ink-main)] uppercase tracking-widest">
                                    {expandedStep ? state?.reports.find(r => r.stepId === expandedStep)?.label : 'System Output'}
                                </span>
                            </div>
                            {state?.isExportBlocked && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                                    <AlertIcon className="w-3 h-3" />
                                    Export Stoppad
                                </div>
                            )}
                        </div>
                        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative z-10">
                            {expandedStep ? (
                                <div className="animate-fade-in">
                                    <div className="prose prose-xs max-w-none prose-p:text-[var(--ink-muted)] prose-headings:text-[var(--ink-main)] prose-headings:uppercase prose-headings:tracking-widest prose-strong:text-[var(--accent)] prose-code:text-[var(--accent)] prose-code:bg-[var(--bg-main)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                                        <Markdown>
                                            {state?.reports.find(r => r.stepId === expandedStep)?.output || 'Ingen output tillgänglig.'}
                                        </Markdown>
                                    </div>
                                    {state?.reports.find(r => r.stepId === expandedStep)?.error && (
                                        <div className="mt-6 p-5 bg-[var(--danger)]/5 border border-[var(--danger)]/20 rounded-xl text-[var(--danger)]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <XCircleIcon className="w-4 h-4" />
                                                <p className="font-black uppercase tracking-widest text-[9px]">Kritiskt Fel i Pipeline</p>
                                            </div>
                                            <p className="text-xs font-medium opacity-80">{state?.reports.find(r => r.stepId === expandedStep)?.error}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-[var(--ink-light)] space-y-6 animate-fade-in">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse"></div>
                                        <div className="relative p-8 bg-[var(--bg-main)] rounded-full border border-[var(--border)]">
                                            <BoltIcon className="w-12 h-12 opacity-20 text-[var(--accent)]" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em]">Pipeline Inaktiv</p>
                                        <p className="text-[11px] font-medium text-[var(--ink-light)] max-w-xs leading-relaxed">
                                            Starta pipelinen för att generera och analysera det juridiska dokumentet steg för steg med <span className="text-[var(--accent)]">full forensic traceability</span>.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--bg-main)]/20 flex justify-between items-center relative z-10">
                            <span className="text-[8px] font-mono text-[var(--ink-light)] uppercase font-black tracking-widest">Legal Pipeline Engine v.1.4</span>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`w-1 h-1 rounded-full ${isRunning ? 'bg-[var(--accent)] animate-pulse' : 'bg-[var(--border)]'}`} style={{ animationDelay: `${i * 0.2}s` }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ModuleConnector activeModule="pipeline" onNavigate={onNavigate} />
        </div>
    );
};

export default LegalPipelineView;
