
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/db';
import { StoredDocument, ParsedDocument, LegalCorpus } from '../types';
import { useFileParser } from '../hooks/useFileParser';
import { ragService } from '../lib/ragService';
import { AIOrchestrator } from '../lib/AIOrchestrator';
import { NormalizationEngine } from '../lib/normalizationEngine';
import { SynthesizerEngine } from '../lib/synthesizerEngine';
import { QualityAssuranceEngine } from '../lib/qaEngine';
import { AuditEngine } from '../lib/auditEngine';
import { LEGAL_SOURCES } from '../data/legalSources';
import { legalFrameworkIndex } from '../data/legalFramework';
import { loadAllLegalCorpus } from '../lib/executionFlow';
import { DEFAULT_CONTEXT_WEIGHTS } from '../data/contextWeights';
import { riskTemplateRegistry } from '../data/riskTemplateRegistry';
import { LegalReferenceEngine } from '../lib/legalReferenceEngine';
import { KeywordEngine } from '../lib/keywordEngine';
import { usageMonitorService, QuotaUsage } from '../services/usageMonitorService';
import SystemOverview from './SystemOverview';
import AnalysisView from './AnalysisView';
import { initialPipelineStatus, PipelineStatusState } from './PipelineStatus';
import { 
    LogoIcon, 
    LogoutIcon, 
    Spinner, 
    CpuChipIcon, 
    ChatIcon, 
    ActivityIcon, 
    CodeBracketIcon, 
    ShieldCheckIcon,
    LawIcon,
    ChartBarSquareIcon,
    AdjustmentsHorizontalIcon,
    MagnifyingGlassIcon
} from './icons';

import Chatbot from './Chatbot';
import SystemMonitor from './SystemMonitor';
import AIDebugPanel from './AIDebugPanel';
import ControlPanel from './ControlPanel';
import LegalFrameworkView from './LegalFrameworkView';
import StaticArchitectureView from './StaticArchitectureView';
import AuditPanel from './AuditPanel';
import WhitebookViewer from './WhitebookViewer';
import ControllerDashboard from './ControllerDashboard';
import AgentWorkspace from './AgentWorkspace';
import SystemInventory from './SystemInventory';
import QuotaWarning from './QuotaWarning';
import SfbIntegrityPanel from './SfbIntegrityPanel';
import { ClipboardDocumentListIcon } from './icons';

const DocumentManager: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [documents, setDocuments] = useState<StoredDocument[]>([]);
    const [legalCorpora, setLegalCorpora] = useState<LegalCorpus[]>([]);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [pipelineStatus, setPipelineStatus] = useState<PipelineStatusState>(initialPipelineStatus);
    const { parseFile, isParsing, parsingError } = useFileParser();

    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [quotaUsage, setQuotaUsage] = useState<QuotaUsage>(() => {
        try {
            return usageMonitorService.getUsage();
        } catch (e) {
            return { rpm: 0, tpm: 0, limitRpm: 15, limitTpm: 1000000, status: 'stable' };
        }
    });

    useEffect(() => {
        const interval = setInterval(() => {
            try {
                setQuotaUsage(usageMonitorService.getUsage());
            } catch (e) {
                console.warn("Usage monitor not available yet");
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [docs, corpora] = await Promise.all([
                db.getAllDocuments(),
                loadAllLegalCorpus()
            ]);
            setDocuments(docs);
            setLegalCorpora(corpora);
            await ragService.initialize();
        } catch (e) {
            console.error("[BOOT] Data load failure:", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAnalyze = async (doc: ParsedDocument) => {
        setIsAnalyzing(true);
        const update = (stage: keyof PipelineStatusState['stages'], status: any, msg: string) => {
            setPipelineStatus(prev => ({
                ...prev,
                stages: { ...prev.stages, [stage]: status },
                log: [...prev.log, { stage, message: msg, status }]
            }));
        };

        try {
            update('indata', 'active', 'Läser källmaterial...');
            const orchestrator = new AIOrchestrator();
            const normalizer = new NormalizationEngine(riskTemplateRegistry, DEFAULT_CONTEXT_WEIGHTS);
            const synthesizer = new SynthesizerEngine();
            const qa = new QualityAssuranceEngine();
            const audit = new AuditEngine();

            // Kör de klassiska motorerna för referens- och nyckelordsextraktion
            const legalRefEngine = new LegalReferenceEngine(LEGAL_SOURCES);
            const keywordEngine = new KeywordEngine();
            const legalRefs = legalRefEngine.analyze(doc.name, doc.textContent);
            const keywordHits = keywordEngine.analyze(doc.textContent);

            update('ai-analys', 'active', 'Exekverar Full Forensic Chain (RAG + Reasoning)...');
            // Let AIOrchestrator handle the RAG context fetching internally to ensure full chain execution
            const aiRes = await orchestrator.runFullAnalysis(doc.textContent, doc.name, LEGAL_SOURCES);

            update('normalisering', 'active', 'Låser beviskedja...');
            const analysis = normalizer.runFullPipeline(
                doc, aiRes.facts, aiRes.contradictions, aiRes.uncertainties, 
                legalRefs, keywordHits, aiRes.links, [], { hasChildAspect: false, isPreventive: false }, [], LEGAL_SOURCES,
                [], // atoms
                aiRes.reasoning,
                aiRes.decisionSupport,
                aiRes.proportionality,
                aiRes.actionRecommendations
            );
            
            update('syntes', 'active', 'Genererar forensisk syntes...');
            analysis.synthesis = await synthesizer.synthesize(analysis);
            analysis.audit = audit.runAudit(analysis);
            analysis.qaSummary = qa.runChecks(analysis);

            const stored: StoredDocument = {
                id: crypto.randomUUID(),
                name: doc.name,
                mimeType: doc.mimeType,
                createdAt: new Date().toISOString(),
                textContent: doc.textContent,
                analysis
            };

            await db.addDocument(stored);
            await loadData();
            update('resultat', 'success', 'Analys slutförd och arkiverad.');
        } catch (e: any) {
            update('resultat', 'error', 'Pipeline-kollaps.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (isLoading) return (
        <div className="flex flex-col h-screen items-center justify-center bg-[#FAFAF9] dark:bg-[#1C1917] space-y-6">
            <Spinner className="h-16 w-16 text-slate-800 dark:text-slate-200" />
            <p className="text-xs font-black uppercase tracking-[0.5em] text-slate-800/50 dark:text-slate-200/50 animate-pulse">Initializing Case Integrity Suite v1.0...</p>
        </div>
    );

    const currentAnalysis = documents.find(d => d.id === selectedDocId)?.analysis || null;

    return (
        <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-[#1C1917] text-[#FAFAF9]' : 'bg-[#FAFAF9] text-[#1C1917]'} font-sans transition-colors duration-300`}>
            <header className={`p-6 border-b ${isDarkMode ? 'border-[#292524] bg-[#1C1917]' : 'border-[#E7E5E4] bg-[#FAFAF9]'} flex justify-between items-center sticky top-0 z-[100] transition-colors duration-300`}>
                <div className="flex items-center space-x-12 w-full overflow-hidden">
                    <div className="flex items-center space-x-4 cursor-pointer shrink-0" onClick={() => setSelectedDocId(null)}>
                        <img src="/assets/Logo.png" alt="CIS Logo" className="h-[32px] w-auto" referrerPolicy="no-referrer" />
                        <h1 className="text-xl font-serif tracking-tight hidden sm:block">Case Integrity Suite</h1>
                    </div>
                    
                    <nav className="hidden md:flex items-center space-x-6 flex-1 overflow-x-auto no-scrollbar nav-row">
                        <ToolButton icon={<ActivityIcon />} onClick={() => setActiveModal('monitor')} label="Monitor" active={activeModal === 'monitor'} />
                        <ToolButton icon={<ClipboardDocumentListIcon />} onClick={() => setActiveModal('inventory')} label="Inventering" active={activeModal === 'inventory'} />
                        <ToolButton icon={<ChatIcon />} onClick={() => setActiveModal('chat')} label="Beslutsmotor" active={activeModal === 'chat'} />
                        <ToolButton icon={<MagnifyingGlassIcon />} onClick={() => setActiveModal('agent')} label="Analys" active={activeModal === 'agent'} />
                        <ToolButton icon={<CodeBracketIcon />} onClick={() => setActiveModal('debug')} label="Oracle" active={activeModal === 'debug'} />
                        <ToolButton icon={<AdjustmentsHorizontalIcon />} onClick={() => setActiveModal('controller')} label="Kontroll" active={activeModal === 'controller'} />
                        <ToolButton icon={<ShieldCheckIcon />} onClick={() => setActiveModal('audit')} label="Logg" active={activeModal === 'audit'} />
                        <ToolButton icon={<LawIcon />} onClick={() => setActiveModal('framework')} label="Juridik" active={activeModal === 'framework'} />
                        <ToolButton icon={<ShieldCheckIcon />} onClick={() => setActiveModal('sfb')} label="SFB" active={activeModal === 'sfb'} />
                        <ToolButton icon={<ChartBarSquareIcon />} onClick={() => setActiveModal('arch')} label="Arkiv" active={activeModal === 'arch'} />
                        <ToolButton icon={<ClipboardDocumentListIcon />} onClick={() => setActiveModal('whitebook')} label="Vitbok" active={activeModal === 'whitebook'} />
                    </nav>
                </div>

                <div className="flex items-center space-x-6 ml-6">
                    <div className="hidden lg:flex flex-col items-end mr-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">API RPM</span>
                            <div className={`w-2 h-2 rounded-full ${quotaUsage.status === 'critical' ? 'bg-red-500 animate-pulse' : (quotaUsage.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500')}`}></div>
                        </div>
                        <span className={`text-[10px] font-mono ${quotaUsage.status === 'critical' ? 'text-red-500' : 'text-slate-500'}`}>
                            {quotaUsage.rpm}/{quotaUsage.limitRpm}
                        </span>
                    </div>
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-3 rounded-full transition-colors ${isDarkMode ? 'bg-[#292524] text-[#FAFAF9]' : 'bg-[#E7E5E4] text-[#1C1917]'}`}>
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    <button onClick={onLogout} className="p-3 text-slate-400 hover:text-red-700 rounded-xl transition-all clickable"><LogoutIcon className="h-6 w-6" /></button>
                </div>
            </header>

            <main className="flex-grow p-6 lg:p-10">
                {selectedDocId ? (
                    <AnalysisView 
                        documentId={selectedDocId} 
                        onBack={() => setSelectedDocId(null)} 
                        onDocumentUpdate={loadData} 
                        onLegalReferenceSelect={() => setActiveModal('control')} 
                    />
                ) : (
                    <SystemOverview 
                        legalCorpus={legalCorpora}
                        pipelineStatus={pipelineStatus} 
                        documents={documents} 
                        onFilesSelect={async (files) => { for(const f of files) { const p = await parseFile(f); if(p) await handleAnalyze(p); } }}
                        onTextSubmit={async (t) => await handleAnalyze({ name: 'Manuell inmatning', textContent: t, mimeType: 'text/plain' })}
                        onSelectDocument={setSelectedDocId}
                        onAggregateSelected={() => {}}
                        isProcessing={isAnalyzing || isParsing}
                        parsingError={parsingError}
                    />
                )}
            </main>

            <AgentWorkspace isOpen={activeModal === 'agent'} onClose={() => setActiveModal(null)} />
            <Chatbot isOpen={activeModal === 'chat'} onClose={() => setActiveModal(null)} ragService={ragService} currentAnalysis={currentAnalysis} />
            <SystemMonitor isOpen={activeModal === 'monitor'} onClose={() => setActiveModal(null)} />
            <AIDebugPanel isOpen={activeModal === 'debug'} onClose={() => setActiveModal(null)} />
            <AuditPanel isOpen={activeModal === 'audit'} onClose={() => setActiveModal(null)} />
            <ControlPanel isOpen={activeModal === 'control'} onClose={() => setActiveModal(null)} />
            <LegalFrameworkView isOpen={activeModal === 'framework'} onClose={() => setActiveModal(null)} />
            <StaticArchitectureView isOpen={activeModal === 'arch'} onClose={() => setActiveModal(null)} />
            <WhitebookViewer isOpen={activeModal === 'whitebook'} onClose={() => setActiveModal(null)} />
            <ControllerDashboard isOpen={activeModal === 'controller'} onClose={() => setActiveModal(null)} />
            <SystemInventory isOpen={activeModal === 'inventory'} onClose={() => setActiveModal(null)} />
            <SfbIntegrityPanel isOpen={activeModal === 'sfb'} onClose={() => setActiveModal(null)} />
            <QuotaWarning />

            <div className="md:hidden fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center bg-[#111111]/90 backdrop-blur-md border border-gray-800 rounded-3xl p-4 shadow-2xl z-[200]">
                <ToolButton icon={<ChatIcon />} onClick={() => setActiveModal('chat')} active={activeModal === 'chat'} />
                <ToolButton icon={<ActivityIcon />} onClick={() => setActiveModal('monitor')} active={activeModal === 'monitor'} />
                <ToolButton icon={<AdjustmentsHorizontalIcon />} onClick={() => setActiveModal('controller')} active={activeModal === 'controller'} />
            </div>
        </div>
    );
};

interface ToolButtonProps {
    icon: React.ReactNode;
    onClick: () => void;
    label?: string;
    active?: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon, onClick, label, active }) => (
    <button 
        onClick={onClick}
        className={`p-4 rounded-2xl transition-colors flex items-center space-x-4 group cursor-pointer ${active ? 'bg-blue-100 text-blue-800 dark:bg-[#292524] dark:text-[#FAFAF9]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:text-[#A8A29E] dark:hover:text-[#FAFAF9] dark:hover:bg-[#292524]'}`}
    >
        <div className={active ? 'text-blue-800 dark:text-[#FAFAF9]' : 'text-gray-500 group-hover:text-gray-900 dark:text-[#A8A29E] dark:group-hover:text-[#FAFAF9]'}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-6 h-6' }) : icon}
        </div>
        {label && <span className="text-sm font-medium hidden lg:block">{label}</span>}
    </button>
);

export default DocumentManager;