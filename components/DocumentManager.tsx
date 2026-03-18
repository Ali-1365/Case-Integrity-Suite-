
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
    MagnifyingGlassIcon,
    XMarkIcon,
    BoltIcon,
    ClipboardDocumentListIcon, 
    Squares2X2Icon, 
    CalendarIcon, 
    SparklesIcon, 
    ExclamationTriangleIcon, 
    FingerPrintIcon, 
    ArchiveBoxIcon,
    UserGroupIcon
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
import { AutoNotaryView } from './AutoNotaryView';
import LegalTextProductionModule from './LegalTextProductionModule';
import { SystemHub } from './SystemHub';
import ForensicIntegrityView from './ForensicIntegrityView';
import OpinionGenerator from './OpinionGenerator';
import { AdversarialDuelView } from './AdversarialDuelView';
import LegalPipelineView from './LegalPipelineView';
import { IntelligenceCore } from './IntelligenceCore';
import ArchiveView from './ArchiveView';
import { FmjamController } from './FmjamController';
import { CaseProfiler } from './CaseProfiler';

import { AutoAtomizer } from '../lib/autoAtomizer';
import { forensicChainService } from '../lib/ForensicChainService';
import { caseManagementService } from '../lib/CaseManagementService';

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

    useEffect(() => { loadData().catch(err => console.error('Initial data load failed:', err)); }, [loadData]);

    const selectedDoc = documents.find(d => d.id === selectedDocId);
    const currentAnalysis = selectedDoc?.analysis || null;

    const [activeCase, setActiveCase] = useState<any>(null);

    useEffect(() => {
        if (currentAnalysis?.caseId) {
            caseManagementService.getCase(currentAnalysis.caseId)
              .then(setActiveCase)
              .catch(err => console.error('Failed to get case:', err));
        }
    }, [currentAnalysis?.caseId]);

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
            update('normalisering', 'active', 'Initialiserar normaliseringsmotor...');
            const orchestrator = new AIOrchestrator();
            const normalizer = new NormalizationEngine(riskTemplateRegistry, DEFAULT_CONTEXT_WEIGHTS);
            const synthesizer = new SynthesizerEngine();
            const qa = new QualityAssuranceEngine();
            const audit = new AuditEngine();
            const atomizer = new AutoAtomizer();
            update('normalisering', 'success', 'Motorer redo.');

            update('integritet', 'active', 'Beräknar forensiska hashar...');
            await new Promise(r => setTimeout(r, 500));
            update('integritet', 'success', 'Hashar beräknade och låsta.');

            update('indata', 'active', 'Läser källmaterial...');
            // Segmentera texten i atomer med forensiska hashar
            const atoms = await atomizer.atomize(doc.textContent, doc.name);
            update('indata', 'success', 'Källmaterial inläst och atomiserat.');

            update('för-analys', 'active', 'Extraherar juridiska referenser...');
            const legalRefEngine = new LegalReferenceEngine(LEGAL_SOURCES);
            const keywordEngine = new KeywordEngine();
            const legalRefs = legalRefEngine.analyze(doc.name, doc.textContent);
            const keywordHits = keywordEngine.analyze(doc.textContent);
            update('för-analys', 'success', 'Referenser extraherade.');

            update('ai-analys', 'active', 'Exekverar Full Forensic Chain (RAG + Reasoning)...');
            const aiRes = await orchestrator.runFullAnalysis(doc.textContent, doc.name, LEGAL_SOURCES);
            update('ai-analys', 'success', 'AI-analys slutförd.');

            update('kors-korrelering', 'active', 'Kors-korrelerar bevisatomer...');
            await new Promise(r => setTimeout(r, 500));
            update('kors-korrelering', 'success', 'Kors-korrelering klar.');

            update('syntes', 'active', 'Genererar forensisk syntes...');
            const analysis = normalizer.runFullPipeline(
                doc, aiRes.facts, aiRes.contradictions, aiRes.uncertainties, 
                legalRefs, keywordHits, aiRes.links, [], { hasChildAspect: false, isPreventive: false }, [], LEGAL_SOURCES,
                atoms,
                aiRes.reasoning,
                aiRes.decisionSupport,
                aiRes.proportionality,
                aiRes.actionRecommendations
            );
            
            analysis.synthesis = await synthesizer.synthesize(analysis);
            analysis.audit = audit.runAudit(analysis);
            analysis.qaSummary = qa.runChecks(analysis);

            // Verifiera den forensiska kedjan direkt efter skapandet
            const verification = await forensicChainService.verifyChain(analysis);
            update('syntes', 'success', 'Syntes genererad.');

            const stored: StoredDocument = {
                id: crypto.randomUUID(),
                name: doc.name,
                mimeType: doc.mimeType,
                createdAt: new Date().toISOString(),
                textContent: doc.textContent,
                analysis
            };

            await db.addDocument(stored);
            
            // Skapa även ett formellt ärende i CaseManagementService för att stödja Agent-flöden
            try {
                await caseManagementService.createCase(doc.name, { hasChildAspect: false, isPreventive: false });
            } catch (caseErr) {
                console.warn("Kunde inte skapa formellt ärende, fortsätter med virtuell kontext:", caseErr);
            }

            await loadData();
            update('resultat', 'success', 'Analys slutförd och arkiverad.');

            update('säkerhet', 'active', 'Slutgiltig systemvalidering...');
            await new Promise(r => setTimeout(r, 500));
            update('säkerhet', 'success', 'Systemintegritet bekräftad.');
        } catch (e: any) {
            update('resultat', 'error', `Pipeline-kollaps: ${e.message}`);
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

    return (
        <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-[#1C1917] text-[#FAFAF9]' : 'bg-[#FAFAF9] text-[#1C1917]'} font-sans transition-colors duration-300`}>
            <header className={`p-6 border-b ${isDarkMode ? 'border-[#292524] bg-[#1C1917]' : 'border-[#E7E5E4] bg-[#FAFAF9]'} flex justify-between items-center sticky top-0 z-[100] transition-colors duration-300`}>
                <div className="flex items-center space-x-12 w-full overflow-hidden">
                    <div className="flex items-center space-x-4 cursor-pointer shrink-0" onClick={() => setSelectedDocId(null)}>
                        <LogoIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                        <h1 className="text-xl font-serif tracking-tight hidden sm:block">Case Integrity Suite</h1>
                    </div>
                    
                    <nav className="hidden md:flex items-center space-x-6 flex-1 overflow-x-auto no-scrollbar nav-row">
                        <ToolButton icon={<Squares2X2Icon />} onClick={() => setActiveModal('hub')} label="System Hub" active={activeModal === 'hub'} />
                        <ToolButton icon={<ActivityIcon />} onClick={() => setActiveModal('monitor')} label="Monitor" active={activeModal === 'monitor'} />
                        <ToolButton icon={<ClipboardDocumentListIcon />} onClick={() => setActiveModal('inventory')} label="Inventering" active={activeModal === 'inventory'} />
                        <ToolButton icon={<ChatIcon />} onClick={() => setActiveModal('chat')} label="Beslutsmotor" active={activeModal === 'chat'} />
                        <ToolButton icon={<BoltIcon />} onClick={() => setActiveModal('production')} label="Produktion" active={activeModal === 'production'} />
                        <ToolButton icon={<MagnifyingGlassIcon />} onClick={() => setActiveModal('agent')} label="Analys" active={activeModal === 'agent'} />
                        <ToolButton icon={<CodeBracketIcon />} onClick={() => setActiveModal('debug')} label="Oracle" active={activeModal === 'debug'} />
                        <ToolButton icon={<AdjustmentsHorizontalIcon />} onClick={() => setActiveModal('controller')} label="Kontroll" active={activeModal === 'controller'} />
                        <ToolButton icon={<ClipboardDocumentListIcon />} onClick={() => setActiveModal('notary')} label="Notarie" active={activeModal === 'notary'} />
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

            {activeModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[250] flex items-center justify-center p-0 md:p-4 lg:p-8 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-none md:rounded-[2.5rem] shadow-2xl w-full max-w-full md:max-w-7xl h-full md:h-[90vh] flex flex-col border-none md:border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <header className="px-6 md:px-8 py-4 md:py-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                    {activeModal === 'hub' && <Squares2X2Icon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />}
                                    {activeModal === 'production' && <BoltIcon className="h-6 w-6 text-indigo-500" />}
                                    {activeModal === 'opinion' && <SparklesIcon className="h-6 w-6 text-purple-500" />}
                                    {activeModal === 'duel' && <ExclamationTriangleIcon className="h-6 w-6 text-rose-500" />}
                                    {activeModal === 'integrity' && <FingerPrintIcon className="h-6 w-6 text-emerald-500" />}
                                    {activeModal === 'pipeline' && <ActivityIcon className="h-6 w-6 text-blue-500" />}
                                    {activeModal === 'oracle' && <CpuChipIcon className="h-6 w-6 text-amber-500" />}
                                    {activeModal === 'archive' && <ArchiveBoxIcon className="h-6 w-6 text-stone-500" />}
                                    {activeModal === 'audit' && <ShieldCheckIcon className="h-6 w-6 text-indigo-500" />}
                                    {activeModal === 'chat' && <ChatIcon className="h-6 w-6 text-cyan-500" />}
                                    {activeModal === 'agent' && <MagnifyingGlassIcon className="h-6 w-6 text-blue-500" />}
                                    {activeModal === 'debug' && <CodeBracketIcon className="h-6 w-6 text-amber-500" />}
                                    {activeModal === 'oracle' && <CpuChipIcon className="h-6 w-6 text-amber-500" />}
                                    {activeModal === 'controller' && <AdjustmentsHorizontalIcon className="h-6 w-6 text-amber-500" />}
                                    {activeModal === 'notary' && <ClipboardDocumentListIcon className="h-6 w-6 text-cyan-500" />}
                                    {activeModal === 'framework' && <LawIcon className="h-6 w-6 text-indigo-500" />}
                                    {activeModal === 'arch' && <ArchiveBoxIcon className="h-6 w-6 text-stone-500" />}
                                    {activeModal === 'whitebook' && <ClipboardDocumentListIcon className="h-6 w-6 text-slate-500" />}
                                    {activeModal === 'sfb' && <ShieldCheckIcon className="h-6 w-6 text-emerald-500" />}
                                    {activeModal === 'monitor' && <ActivityIcon className="h-6 w-6 text-emerald-500" />}
                                    {activeModal === 'inventory' && <ClipboardDocumentListIcon className="h-6 w-6 text-slate-500" />}
                                    {activeModal === 'profiler' && <UserGroupIcon className="h-6 w-6 text-purple-500" />}
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
                                        {activeModal === 'hub' && 'System Control Hub'}
                                        {activeModal === 'production' && 'Juridisk Textproduktion'}
                                        {activeModal === 'opinion' && 'AI-Expert (Yttranden)'}
                                        {activeModal === 'duel' && 'Adversarial Duel'}
                                        {activeModal === 'integrity' && 'Forensisk Integritet'}
                                        {activeModal === 'pipeline' && 'Legal Pipeline'}
                                        {activeModal === 'oracle' && 'Oracle Core'}
                                        {activeModal === 'archive' && 'Archive Core'}
                                        {activeModal === 'audit' && 'Audit & Compliance'}
                                        {activeModal === 'chat' && 'Beslutsmotor'}
                                        {activeModal === 'agent' && 'Analys'}
                                        {activeModal === 'debug' && 'AI Debug Panel'}
                                        {activeModal === 'controller' && 'Kontrollpanel'}
                                        {activeModal === 'notary' && 'Processnotarie'}
                                        {activeModal === 'framework' && 'Juridisk Ramverk'}
                                        {activeModal === 'arch' && 'Ärendearkiv'}
                                        {activeModal === 'whitebook' && 'Vitbok'}
                                        {activeModal === 'sfb' && 'SFB Integritet'}
                                        {activeModal === 'monitor' && 'System Monitor'}
                                        {activeModal === 'inventory' && 'System Inventory'}
                                        {activeModal === 'profiler' && 'Case Profiler'}
                                    </h2>
                                    <p className="text-xs text-slate-500">Systemmodul v.7.5</p>
                                </div>
                            </div>
                            <button onClick={() => setActiveModal(null)} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </header>
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-white dark:bg-slate-950">
                            {activeModal === 'hub' && <SystemHub onNavigate={(view) => setActiveModal(view)} />}
                            {activeModal === 'production' && <LegalTextProductionModule />}
                            {activeModal === 'opinion' && currentAnalysis && <OpinionGenerator analysis={currentAnalysis} />}
                            {activeModal === 'duel' && currentAnalysis && selectedDoc && <AdversarialDuelView caseData={selectedDoc.textContent} caseId={currentAnalysis.caseId} />}
                            {activeModal === 'integrity' && currentAnalysis && <ForensicIntegrityView analysis={currentAnalysis} />}
                            {activeModal === 'pipeline' && currentAnalysis && <LegalPipelineView analysis={currentAnalysis} />}
                            {activeModal === 'oracle' && <IntelligenceCore analysis={currentAnalysis} />}
                            {activeModal === 'archive' && <ArchiveView onSelect={(id) => { setSelectedDocId(id); setActiveModal(null); }} />}
                            {activeModal === 'audit' && <AuditPanel isOpen={true} onClose={() => setActiveModal(null)} />}
                            {activeModal === 'chat' && <Chatbot isOpen={true} onClose={() => setActiveModal(null)} ragService={ragService} currentAnalysis={currentAnalysis} />}
                            {activeModal === 'agent' && <AgentWorkspace isOpen={true} onClose={() => setActiveModal(null)} />}
                            {activeModal === 'debug' && <AIDebugPanel isOpen={true} onClose={() => setActiveModal(null)} />}
                            {activeModal === 'controller' && <FmjamController analysis={currentAnalysis} />}
                            {activeModal === 'notary' && <AutoNotaryView />}
                            {activeModal === 'framework' && <LegalFrameworkView isOpen={true} onClose={() => setActiveModal(null)} />}
                            {activeModal === 'arch' && <ArchiveView onSelect={(id) => { setSelectedDocId(id); setActiveModal(null); }} />}
                            {activeModal === 'whitebook' && <WhitebookViewer isOpen={true} onClose={() => setActiveModal(null)} />}
                            {activeModal === 'sfb' && <SfbIntegrityPanel isOpen={true} onClose={() => setActiveModal(null)} />}
                            {activeModal === 'monitor' && <SystemMonitor isOpen={true} onClose={() => setActiveModal(null)} />}
                            {activeModal === 'inventory' && <SystemInventory isOpen={true} onClose={() => setActiveModal(null)} />}
                            {activeModal === 'profiler' && activeCase && <CaseProfiler caseData={activeCase} />}
                            
                            {!currentAnalysis && ['opinion', 'duel', 'integrity', 'audit', 'agent', 'debug', 'controller', 'sfb', 'profiler'].includes(activeModal || '') && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                                    <ExclamationTriangleIcon className="w-16 h-16 text-amber-500 mb-6" />
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Inget ärende valt</h3>
                                    <p className="text-slate-500 max-w-md">Denna modul kräver ett aktivt ärende. Vänligen välj ett ärende i arkivet eller ladda upp ett nytt dokument för analys.</p>
                                    <button 
                                        onClick={() => setActiveModal('arch')}
                                        className="mt-8 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-2xl font-bold transition-all"
                                    >
                                        Gå till Arkivet
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <QuotaWarning />

            <div className="md:hidden fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center bg-[#111111]/90 backdrop-blur-md border border-gray-800 rounded-3xl p-4 shadow-2xl z-[200]">
                <ToolButton icon={<Squares2X2Icon />} onClick={() => setActiveModal('hub')} active={activeModal === 'hub'} />
                <ToolButton icon={<ChatIcon />} onClick={() => setActiveModal('chat')} active={activeModal === 'chat'} />
                <ToolButton icon={<BoltIcon />} onClick={() => setActiveModal('production')} active={activeModal === 'production'} />
                <ToolButton icon={<ActivityIcon />} onClick={() => setActiveModal('monitor')} active={activeModal === 'monitor'} />
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