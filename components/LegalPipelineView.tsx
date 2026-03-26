
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
}

export const LegalPipelineView: React.FC<LegalPipelineViewProps> = ({ analysis }) => {
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
            case '1': return <DocumentTextIcon className="w-5 h-5" />;
            case '2': return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
            case '3': return <LawIcon className="w-5 h-5 text-purple-500" />;
            case '4': return <LinkIcon className="w-5 h-5 text-emerald-500" />;
            case '5': return <LawIcon className="w-5 h-5 text-indigo-500" />;
            case '6': return <AlertIcon className="w-5 h-5 text-amber-500" />;
            case '7': return <BoltIcon className="w-5 h-5 text-red-500" />;
            case '8': return <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />;
            case '9': return <PrinterIcon className="w-5 h-5 text-slate-700" />;
            default: return <DocumentTextIcon className="w-5 h-5" />;
        }
    };

    const getStatusIcon = (status: PipelineReport['status']) => {
        switch (status) {
            case 'pending': return <ClockIcon className="w-5 h-5 text-gray-400" />;
            case 'running': return <Spinner className="w-5 h-5 text-blue-500" />;
            case 'completed': return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />;
            case 'error': return <XCircleIcon className="w-5 h-5 text-red-500" />;
            case 'blocked': return <XCircleIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#161616]/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <LawIcon className="w-6 h-6 text-indigo-400" />
                        </div>
                        Juridisk Dokumentpipeline
                    </h2>
                    <p className="text-sm text-gray-400 mt-2 font-medium">8-stegs verifieringskedja för <span className="text-indigo-400 font-bold">forensic integrity</span></p>
                </div>
                <button
                    onClick={runPipeline}
                    disabled={isRunning}
                    className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-2xl relative overflow-hidden group ${
                        isRunning 
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5' 
                        : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/30 border border-indigo-400/20 active:scale-95'
                    }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    {isRunning ? <Spinner className="w-5 h-5" /> : <BoltIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                    <span>{isRunning ? 'Kör Pipeline...' : 'Starta Pipeline'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Pipeline Steps */}
                <div className="lg:col-span-4 space-y-4">
                    {state?.reports.map((report) => (
                        <div 
                            key={report.stepId}
                            onClick={() => report.output && setExpandedStep(expandedStep === report.stepId ? null : report.stepId)}
                            className={`p-5 rounded-2xl border transition-all duration-500 cursor-pointer group relative overflow-hidden ${
                                expandedStep === report.stepId 
                                ? 'bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
                                : 'bg-[#161616]/80 backdrop-blur-sm border-white/5 hover:border-indigo-500/30 hover:bg-[#1c1c1c] shadow-xl'
                            }`}
                        >
                            {expandedStep === report.stepId && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                            )}
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl transition-all duration-500 ${
                                        report.status === 'completed' 
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                        : 'bg-gray-900/80 text-gray-500 border border-white/5'
                                    }`}>
                                        {getStepIcon(report.stepId)}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-black transition-colors ${
                                            expandedStep === report.stepId ? 'text-white' : 'text-gray-300 group-hover:text-white'
                                        }`}>{report.label}</p>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">Steg {report.stepId}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="transition-transform duration-500 group-hover:scale-110">
                                        {getStatusIcon(report.status)}
                                    </div>
                                    {report.output && (
                                        <div className={`transition-transform duration-500 ${expandedStep === report.stepId ? 'rotate-180 text-indigo-400' : 'text-gray-600'}`}>
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {!state && (
                        <div className="p-10 border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                            <div className="p-4 bg-gray-900 rounded-full">
                                <ClockIcon className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-600">Väntar på initiering</p>
                        </div>
                    )}
                </div>

                {/* Output Display */}
                <div className="lg:col-span-8">
                    <div className="bg-[#161616]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] h-full min-h-[700px] flex flex-col shadow-2xl shadow-black/60 overflow-hidden relative group/display">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl group-hover/display:bg-indigo-500/10 transition-all duration-1000"></div>
                        
                        <div className="px-8 py-6 border-b border-white/5 bg-[#111111]/40 backdrop-blur-md flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                    <DocumentTextIcon className="w-5 h-5 text-indigo-400" />
                                </div>
                                <span className="text-sm font-black text-white uppercase tracking-widest">
                                    {expandedStep ? state?.reports.find(r => r.stepId === expandedStep)?.label : 'System Output'}
                                </span>
                            </div>
                            {state?.isExportBlocked && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg shadow-rose-500/10">
                                    <AlertIcon className="w-3 h-3" />
                                    Export Stoppad
                                </div>
                            )}
                        </div>
                        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar relative z-10">
                            {expandedStep ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:tracking-widest prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-indigo-400 prose-code:text-cyan-400 prose-code:bg-black/40 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                                        <Markdown>
                                            {state?.reports.find(r => r.stepId === expandedStep)?.output || 'Ingen output tillgänglig.'}
                                        </Markdown>
                                    </div>
                                    {state?.reports.find(r => r.stepId === expandedStep)?.error && (
                                        <div className="mt-8 p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-rose-400 animate-in shake duration-500">
                                            <div className="flex items-center gap-3 mb-3">
                                                <XCircleIcon className="w-5 h-5" />
                                                <p className="font-black uppercase tracking-widest text-xs">Kritiskt Fel i Pipeline</p>
                                            </div>
                                            <p className="text-sm font-medium opacity-80">{state?.reports.find(r => r.stepId === expandedStep)?.error}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-8 animate-in fade-in duration-1000">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
                                        <div className="relative p-10 bg-gray-900/50 rounded-full border border-white/5 shadow-inner">
                                            <BoltIcon className="w-20 h-20 opacity-10 text-indigo-500" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-3">
                                        <p className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Pipeline Inaktiv</p>
                                        <p className="text-xs font-medium text-gray-500 max-w-xs leading-relaxed">
                                            Starta pipelinen för att generera och analysera det juridiska dokumentet steg för steg med <span className="text-indigo-400">full forensic traceability</span>.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-8 py-4 border-t border-white/5 bg-[#111111]/20 flex justify-between items-center relative z-10">
                            <span className="text-[9px] font-mono text-gray-700 uppercase font-black tracking-widest">Legal Pipeline Engine v.1.4</span>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`w-1 h-1 rounded-full ${isRunning ? 'bg-indigo-500 animate-pulse' : 'bg-gray-800'}`} style={{ animationDelay: `${i * 0.2}s` }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalPipelineView;
