
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
        const caseData = JSON.stringify(analysis);
        await legalPipelineService.runFullPipeline(analysis.caseId, caseData, (newState) => {
            setState(newState);
        });
        setIsRunning(false);
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Juridisk Dokumentpipeline</h2>
                    <p className="text-sm text-slate-500 dark:text-gray-400">8-stegs verifieringskedja för forensic integrity</p>
                </div>
                <button
                    onClick={runPipeline}
                    disabled={isRunning}
                    className={`px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                        isRunning 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
                    }`}
                >
                    {isRunning ? <Spinner className="w-4 h-4" /> : <BoltIcon className="w-4 h-4" />}
                    {isRunning ? 'Kör Pipeline...' : 'Starta Pipeline'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pipeline Steps */}
                <div className="lg:col-span-1 space-y-3">
                    {state?.reports.map((report) => (
                        <div 
                            key={report.stepId}
                            onClick={() => report.output && setExpandedStep(expandedStep === report.stepId ? null : report.stepId)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                expandedStep === report.stepId 
                                ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30' 
                                : 'bg-white border-gray-200 dark:bg-[#161616] dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-500/50'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        report.status === 'completed' ? 'bg-emerald-500/10' : 'bg-gray-100 dark:bg-gray-800'
                                    }`}>
                                        {getStepIcon(report.stepId)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{report.label}</p>
                                        <p className="text-[10px] text-slate-500 dark:text-gray-500 uppercase tracking-wider">Steg {report.stepId}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(report.status)}
                                    {report.output && (
                                        expandedStep === report.stepId ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Output Display */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-800 rounded-2xl h-full min-h-[600px] flex flex-col shadow-sm overflow-hidden">
                        <div className="p-4 border-bottom border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DocumentTextIcon className="w-5 h-5 text-indigo-500" />
                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                    {expandedStep ? state?.reports.find(r => r.stepId === expandedStep)?.label : 'Välj ett steg för att se output'}
                                </span>
                            </div>
                            {state?.isExportBlocked && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                    <AlertIcon className="w-3 h-3" />
                                    Export Stoppad
                                </div>
                            )}
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto font-mono text-sm">
                            {expandedStep ? (
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    <Markdown>
                                        {state?.reports.find(r => r.stepId === expandedStep)?.output || 'Ingen output tillgänglig.'}
                                    </Markdown>
                                    {state?.reports.find(r => r.stepId === expandedStep)?.error && (
                                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                                            <p className="font-bold mb-1">Felmeddelande:</p>
                                            <p>{state?.reports.find(r => r.stepId === expandedStep)?.error}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-gray-600 space-y-4">
                                    <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-full">
                                        <BoltIcon className="w-12 h-12 opacity-20" />
                                    </div>
                                    <p className="text-center max-w-xs">
                                        Starta pipelinen för att generera och analysera det juridiska dokumentet steg för steg.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalPipelineView;
