
import React, { useState, useEffect, useCallback } from 'react';
import { db, CISCase } from '../lib/db';
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
import DocumentAnalysisView from './DocumentAnalysisView';
import { initialPipelineStatus, PipelineStatusState } from './PipelineStatus';
import { 
    ShieldCheck,
    LogOut,
    Loader2,
    Cpu,
    MessageSquare,
    Code,
    Scale,
    BarChart3,
    Settings2,
    X,
    Zap,
    ClipboardList,
    LayoutDashboard,
    Calendar,
    Sparkles,
    AlertTriangle,
    Fingerprint,
    Archive,
    Users,
    Wallet,
    ChevronDown,
    FileText,
    Copy,
    Briefcase,
    Activity,
    Search,
    Settings,
    Shield
} from 'lucide-react';

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
import EkonomiView from './EkonomiView';
import ProduktionView from './ProduktionView';
import BeslutView from './BeslutView';
import CaseAnalysisView from './CaseAnalysisView';
import { IntelligenceCore } from './IntelligenceCore';
import ArchiveView from './ArchiveView';
import { FmjamController } from './FmjamController';
import { CaseProfiler } from './CaseProfiler';
import { SystemHub } from './SystemHub';
import OpinionGenerator from './OpinionGenerator';
import VisionView from './VisionView';
import { AdversarialDuelView } from './AdversarialDuelView';
import ForensicIntegrityView from './ForensicIntegrityView';
import { LegalPipelineView } from './LegalPipelineView';

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
    const [currentView, setCurrentView] = useState<'overview' | 'analysis' | 'hub'>('overview');
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const navigateTo = (view: string) => {
        if (['overview', 'analysis', 'hub'].includes(view)) {
            setCurrentView(view as any);
            setActiveModal(null);
        } else {
            setActiveModal(view);
            setShowMoreMenu(false);
        }
    };

    const [activeCase, setActiveCase] = useState<CISCase | null>(null);
    const [cases, setCases] = useState<CISCase[]>([]);
    const [showCaseMenu, setShowCaseMenu] = useState(false);
    const orchestrator = React.useMemo(() => new AIOrchestrator(), []);
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
            const [docs, corpora, allCases] = await Promise.all([
                db.getAllDocuments(),
                loadAllLegalCorpus(),
                db.getAllCases()
            ]);
            setDocuments(docs);
            setLegalCorpora(corpora);
            setCases(allCases);
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

    useEffect(() => {
        if (currentAnalysis?.caseId) {
            caseManagementService.getCase(currentAnalysis.caseId)
              .then(setActiveCase)
              .catch(err => console.error('Failed to get case:', err));
        }
    }, [currentAnalysis?.caseId]);

    const handleAnalyze = async (doc: any) => {
        setIsAnalyzing(true);
        setPipelineStatus({
            ...initialPipelineStatus,
            status: 'running',
            currentStep: 'Initierar analys...',
            progress: 10
        });

        try {
            // 1. Skapa ärende om det inte finns
            const caseId = `CASE-${doc.id?.substring(0, 8) || Date.now()}`;
            const existingCase = await caseManagementService.getCase(caseId);
            if (!existingCase) {
                await caseManagementService.createCase(doc.name, { hasChildAspect: false, isPreventive: false });
            }

            setPipelineStatus(prev => ({ ...prev, currentStep: 'Kör AI-orkestrering...', progress: 30 }));
            
            // 2. Kör full analys via AIOrchestrator
            const analysisResult = await orchestrator.runFullAnalysis(
                doc.content || doc.textContent || '', 
                doc.id || `DOC-${Date.now()}`, 
                LEGAL_SOURCES, 
                undefined, 
                caseId
            );

            setPipelineStatus(prev => ({ ...prev, currentStep: 'Slutför analys...', progress: 80 }));

            // 3. Uppdatera ärendet med analysresultat
            if (analysisResult.decisionSupport) {
                await caseManagementService.updateCaseWithResult(caseId, analysisResult.decisionSupport, 'Automatisk systemanalys');
            }

            // 4. Uppdatera dokumentet med analysresultat
            const updatedDoc: StoredDocument = {
                id: doc.id || `DOC-${Date.now()}`,
                name: doc.name,
                textContent: doc.content || doc.textContent || '',
                mimeType: doc.mimeType || 'text/plain',
                createdAt: doc.createdAt || new Date().toISOString(),
                analysis: analysisResult as any
            };

            await db.addDocument(updatedDoc);
            setDocuments(prev => {
                const exists = prev.find(d => d.id === updatedDoc.id);
                if (exists) {
                    return prev.map(d => d.id === updatedDoc.id ? updatedDoc : d);
                }
                return [updatedDoc, ...prev];
            });
            
            setSelectedDocId(updatedDoc.id);
            setCurrentView('analysis');

            setPipelineStatus({
                ...initialPipelineStatus,
                status: 'completed',
                currentStep: 'Analys slutförd',
                progress: 100
            });
        } catch (error) {
            console.error("Analysis failed:", error);
            setPipelineStatus({
                ...initialPipelineStatus,
                status: 'error',
                currentStep: 'Analys misslyckades',
                progress: 0
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAggregateSelected = async (ids: string[]) => {
        setIsAnalyzing(true);
        setPipelineStatus({
            ...initialPipelineStatus,
            status: 'running',
            currentStep: 'Initierar batch-analys...',
            progress: 10
        });

        try {
            const selectedDocs = documents.filter(d => ids.includes(d.id));
            const batchDocs = selectedDocs.map(d => ({
                id: d.id,
                name: d.name,
                facts: d.analysis?.facts || []
            }));

            // Samla in alla lagreferenser och kopplingar från källdokumenten
            const allLegalRefs = selectedDocs.flatMap(d => d.analysis?.legalReferences || []);
            const allLegalLinks = selectedDocs.flatMap(d => d.analysis?.legalFrameworkLinks || []);
            const allFacts = selectedDocs.flatMap(d => d.analysis?.facts || []);
            const allAtoms = selectedDocs.flatMap(d => d.analysis?.atoms || []);
            const allContradictions = selectedDocs.flatMap(d => d.analysis?.contradictions || []);
            const allUncertainties = selectedDocs.flatMap(d => d.analysis?.uncertainties || []);

            setPipelineStatus(prev => ({ ...prev, currentStep: 'Kör korskorrelering...', progress: 50 }));
            
            const correlations = await orchestrator.runCrossCorrelation(batchDocs);

            const aggregateDoc: StoredDocument = {
                id: `AGG-${Date.now()}`,
                name: `Batch-analys (${ids.length} dokument)`,
                textContent: `Korsanalys av: ${selectedDocs.map(d => d.name).join(', ')}`,
                mimeType: 'application/aggregate',
                createdAt: new Date().toISOString(),
                analysis: {
                    correlations,
                    legalReferences: allLegalRefs,
                    legalFrameworkLinks: allLegalLinks,
                    facts: allFacts,
                    atoms: allAtoms,
                    contradictions: allContradictions,
                    uncertainties: allUncertainties,
                    themes: selectedDocs.flatMap(d => d.analysis?.themes || []),
                    qaSummary: selectedDocs.flatMap(d => d.analysis?.qaSummary || []),
                } as any
            };

            await db.addDocument(aggregateDoc);
            setDocuments(prev => [aggregateDoc, ...prev]);
            setSelectedDocId(aggregateDoc.id);

            setPipelineStatus({
                ...initialPipelineStatus,
                status: 'completed',
                currentStep: 'Batch-analys slutförd',
                progress: 100
            });
        } catch (error) {
            console.error("Batch analysis failed:", error);
            setPipelineStatus({
                ...initialPipelineStatus,
                status: 'error',
                currentStep: 'Batch-analys misslyckades',
                progress: 0
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const Breadcrumbs = () => {
        const items = [{ label: 'Hem', onClick: () => { setSelectedDocId(null); setActiveModal(null); setShowMoreMenu(false); }, icon: <LayoutDashboard className="w-4 h-4" /> }];
        
        if (selectedDocId) {
            items.push({ 
                label: 'Analys', 
                onClick: () => { setActiveModal(null); setShowMoreMenu(false); },
                icon: <Search className="w-4 h-4" />
            });
            if (selectedDoc) {
                items.push({ 
                    label: selectedDoc.name, 
                    onClick: () => {},
                    icon: <FileText className="w-4 h-4" />
                });
            }
        } else if (activeModal) {
            const modalLabels: Record<string, string> = {
                hub: 'System Control Hub',
                ekonomi: 'Ekonomisk Motor',
                production: 'Juridisk Textproduktion',
                chat: 'Beslutsmotor',
                agent: 'Analys',
                audit: 'Audit & Compliance',
                framework: 'Juridiskt Ramverk',
                arch: 'Ärendearkiv',
                vision: 'Vision & Tillgänglighet',
                monitor: 'System Monitor',
                inventory: 'System Inventory',
                debug: 'AI Debug Panel',
                profiler: 'Case Profiler'
            };
            items.push({ 
                label: modalLabels[activeModal] || 'Modul', 
                onClick: () => {},
                icon: <Settings2 className="w-4 h-4" />
            });
        }

        return (
            <nav className="flex items-center space-x-4 text-[9px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-8" aria-label="Breadcrumb">
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <span className="text-[var(--border)]">/</span>}
                        <button 
                            onClick={item.onClick}
                            className={`flex items-center space-x-2 transition-all ${index === items.length - 1 ? 'text-[var(--ink-main)]' : 'hover:text-[var(--accent)]'}`}
                            aria-current={index === items.length - 1 ? 'page' : undefined}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    </React.Fragment>
                ))}
            </nav>
        );
    };

    const PageHeader = ({ title, subtitle, icon }: { title: string, subtitle?: string, icon?: React.ReactNode }) => (
        <div className="mb-12 animate-in fade-in duration-700">
            <div className="flex items-center gap-4 mb-2">
                {icon && <div className="text-[var(--ink-main)]">{icon}</div>}
                <h2 className="text-2xl font-bold text-[var(--ink-main)] tracking-tight m-0 font-serif">{title}</h2>
            </div>
            {subtitle && <p className="text-sm text-[var(--ink-muted)] font-medium max-w-3xl leading-relaxed">{subtitle}</p>}
        </div>
    );

    if (isLoading) return (
        <div className="flex flex-col h-screen items-center justify-center bg-[var(--bg-main)] space-y-8 animate-fade-in">
            <div className="relative">
                <Loader2 className="h-20 w-20 text-[var(--accent)] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck className="h-8 w-8 text-[var(--accent)] opacity-50" />
                </div>
            </div>
            <div className="text-center space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--ink-muted)] animate-pulse">Initialiserar Case Integrity Suite v1.0</p>
                <p className="text-[10px] text-[var(--ink-muted)] font-mono">Systemintegritet: Validerad</p>
            </div>
        </div>
    );

    return (
        <div className={`flex flex-col min-h-screen ${isDarkMode ? 'dark bg-[var(--bg-main)] text-[var(--ink-main)]' : 'bg-[var(--bg-main)] text-[var(--ink-main)]'} font-sans transition-colors duration-1000`}>
            <header className="h-16 px-6 border-b border-[var(--border)] bg-[var(--bg-card)] flex justify-between items-center sticky top-0 z-[100]">
                <div className="flex items-center space-x-8 w-full">
                    <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigateTo('overview')}>
                        <div className="p-2 bg-[var(--accent)] rounded-lg transition-all">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-sm font-bold tracking-tight m-0 leading-none text-[var(--ink-main)] font-serif">Case Integrity</h1>
                        </div>
                    </div>
                    
                    <nav className="hidden xl:flex items-center space-x-2 flex-1">
                        <button 
                            onClick={() => navigateTo('hub')}
                            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center space-x-2 shadow-sm ${
                                currentView === 'hub' 
                                ? 'bg-[var(--accent)] text-white' 
                                : 'bg-[var(--bg-card)] text-[var(--ink-main)] border border-[var(--border)] hover:border-[var(--accent)]'
                            }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>System Hub</span>
                        </button>
                        <div className="w-px h-6 bg-[var(--border)] mx-4"></div>
                        <ToolButton icon={<Copy />} onClick={() => navigateTo('overview')} label="Ärenden" active={currentView === 'overview' || currentView === 'analysis'} />
                        <ToolButton icon={<Search />} onClick={() => navigateTo('agent')} label="Analys" active={activeModal === 'agent'} />
                        <ToolButton icon={<Wallet />} onClick={() => navigateTo('ekonomi')} label="Ekonomi" active={activeModal === 'ekonomi'} />
                        <ToolButton icon={<MessageSquare />} onClick={() => navigateTo('chat')} label="Beslut" active={activeModal === 'chat'} />
                        <ToolButton icon={<Zap />} onClick={() => navigateTo('production')} label="Produktion" active={activeModal === 'production'} />
                        <ToolButton icon={<Archive />} onClick={() => navigateTo('arch')} label="Arkiv" active={activeModal === 'arch' || activeModal === 'archive'} />
                    </nav>
                </div>

                <div className="flex items-center space-x-4 ml-8">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-[var(--bg-main)] border border-[var(--border)] rounded text-[10px] font-mono">
                        <span className="text-[var(--ink-muted)] uppercase tracking-widest">System</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                            quotaUsage.status === 'critical' ? 'bg-red-500' : (quotaUsage.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500')
                        }`}></div>
                        <span className="text-[var(--ink-main)] font-bold">{quotaUsage.rpm}/{quotaUsage.limitRpm}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={onLogout} 
                            className="p-2 text-[var(--ink-muted)] hover:text-red-600 transition-all"
                            title="Logga ut"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
                <Breadcrumbs />
                
                {currentView === 'analysis' && selectedDocId ? (
                    <>
                        <PageHeader 
                            title="Ärendeanalys" 
                            subtitle="Djupgående granskning av bevisatomer, rättsliga kopplingar och riskprofiler."
                            icon={<Search className="w-6 h-6" />}
                        />
                        <DocumentAnalysisView 
                            documentId={selectedDocId} 
                            onBack={() => setCurrentView('overview')} 
                            onDocumentUpdate={loadData} 
                            onLegalReferenceSelect={() => setActiveModal('control')} 
                        />
                    </>
                ) : currentView === 'hub' ? (
                    <>
                        <PageHeader 
                            title="System Hub" 
                            subtitle="Centraliserad orkestrering av forensiska moduler och AI-experter."
                            icon={<LayoutDashboard className="w-6 h-6" />}
                        />
                        <SystemHub onNavigate={navigateTo} />
                    </>
                ) : (
                    <>
                        <PageHeader 
                            title="Systemöversikt" 
                            subtitle="Välkommen till Case Integrity Suite. Här kan du hantera ärenden, utföra analyser och övervaka systemets integritet."
                            icon={<Copy className="w-6 h-6" />}
                        />
                        <SystemOverview 
                            legalCorpus={legalCorpora}
                            pipelineStatus={pipelineStatus} 
                            documents={documents} 
                            onFilesSelect={async (files) => { 
                                try {
                                    for(const f of files) { 
                                        const p = await parseFile(f); 
                                        if(p) await handleAnalyze(p); 
                                    } 
                                } catch (err) {
                                    console.error('File selection processing failed:', err);
                                }
                            }}
                            onTextSubmit={async (t) => {
                                try {
                                    await handleAnalyze({ name: 'Manuell inmatning', textContent: t, mimeType: 'text/plain' });
                                } catch (err) {
                                    console.error('Text submission processing failed:', err);
                                }
                            }}
                            onSelectDocument={(id) => {
                                setSelectedDocId(id);
                                setCurrentView('analysis');
                            }}
                            onAggregateSelected={handleAggregateSelected}
                            onAction={navigateTo}
                            isProcessing={isAnalyzing || isParsing}
                            parsingError={parsingError}
                        />
                    </>
                )}
            </main>

            {activeModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xl z-[250] flex items-center justify-center p-0 md:p-6 lg:p-12 animate-in fade-in duration-500">
                    <div className="bg-[var(--bg-card)] rounded-none md:rounded-[3rem] shadow-2xl w-full max-w-7xl h-full md:h-[92vh] flex flex-col border-none md:border border-[var(--border)] overflow-hidden animate-in zoom-in-95 duration-700">
                        <header className="px-12 py-8 border-b border-[var(--border)] bg-[var(--bg-card)] flex justify-between items-center shrink-0">
                            <div className="flex items-center space-x-8">
                                <div className="p-4 bg-[var(--accent)] rounded-[1.5rem] shadow-2xl shadow-[var(--accent)]/20">
                                    {activeModal === 'hub' && <LayoutDashboard className="h-7 w-7 text-white" />}
                                    {activeModal === 'ekonomi' && <Wallet className="h-7 w-7 text-white" />}
                                    {activeModal === 'production' && <Zap className="h-7 w-7 text-white" />}
                                    {activeModal === 'opinion' && <Sparkles className="h-7 w-7 text-white" />}
                                    {activeModal === 'duel' && <AlertTriangle className="h-7 w-7 text-white" />}
                                    {activeModal === 'integrity' && <Fingerprint className="h-7 w-7 text-white" />}
                                    {activeModal === 'pipeline' && <Activity className="h-7 w-7 text-white" />}
                                    {activeModal === 'oracle' && <Cpu className="h-7 w-7 text-white" />}
                                    {activeModal === 'archive' && <Archive className="h-7 w-7 text-white" />}
                                    {activeModal === 'audit' && <ShieldCheck className="h-7 w-7 text-white" />}
                                    {activeModal === 'chat' && <MessageSquare className="h-7 w-7 text-white" />}
                                    {activeModal === 'agent' && <Search className="h-7 w-7 text-white" />}
                                    {activeModal === 'debug' && <Code className="h-7 w-7 text-white" />}
                                    {activeModal === 'controller' && <Settings2 className="h-7 w-7 text-white" />}
                                    {activeModal === 'notary' && <ClipboardList className="h-7 w-7 text-white" />}
                                    {activeModal === 'framework' && <Scale className="h-7 w-7 text-white" />}
                                    {activeModal === 'arch' && <Archive className="h-7 w-7 text-white" />}
                                    {activeModal === 'vision' && <Shield className="h-7 w-7 text-white" />}
                                    {activeModal === 'whitebook' && <ClipboardList className="h-7 w-7 text-white" />}
                                    {activeModal === 'sfb' && <Shield className="h-7 w-7 text-white" />}
                                    {activeModal === 'monitor' && <Activity className="h-7 w-7 text-white" />}
                                    {activeModal === 'inventory' && <ClipboardList className="h-7 w-7 text-white" />}
                                    {activeModal === 'profiler' && <Users className="h-7 w-7 text-white" />}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-[var(--ink-main)] tracking-tighter m-0 font-serif">
                                        {activeModal === 'hub' && 'System Control Hub'}
                                        {activeModal === 'ekonomi' && 'Ekonomisk Motor'}
                                        {activeModal === 'production' && 'Juridisk Textproduktion'}
                                        {activeModal === 'opinion' && 'AI-Expert (Yttranden)'}
                                        {activeModal === 'duel' && 'Adversarial Duel'}
                                        {activeModal === 'integrity' && 'Forensisk Integritet'}
                                        {activeModal === 'pipeline' && 'Legal Pipeline'}
                                        {activeModal === 'oracle' && 'Oracle Core'}
                                        {activeModal === 'archive' && 'Ärendearkiv'}
                                        {activeModal === 'audit' && 'Audit & Compliance'}
                                        {activeModal === 'chat' && 'Beslutsmotor'}
                                        {activeModal === 'agent' && 'Analys'}
                                        {activeModal === 'debug' && 'AI Debug Panel'}
                                        {activeModal === 'controller' && 'Kontrollpanel'}
                                        {activeModal === 'notary' && 'Processnotarie'}
                                        {activeModal === 'framework' && 'Juridisk Ramverk'}
                                        {activeModal === 'arch' && 'Ärendearkiv'}
                                        {activeModal === 'vision' && 'Vision & Tillgänglighet'}
                                        {activeModal === 'whitebook' && 'Vitbok'}
                                        {activeModal === 'sfb' && 'SFB Integritet'}
                                        {activeModal === 'monitor' && 'System Monitor'}
                                        {activeModal === 'inventory' && 'System Inventory'}
                                        {activeModal === 'profiler' && 'Case Profiler'}
                                    </h2>
                                    <p className="text-[11px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mt-2 opacity-70">Säker anslutning • Modul v.7.5</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setActiveModal(null)} 
                                className="p-4 text-[var(--ink-muted)] hover:text-[var(--ink-main)] hover:bg-[var(--bg-main)] rounded-[1.5rem] transition-all active:scale-90"
                                title="Stäng modul"
                            >
                                <X className="h-8 w-8" />
                            </button>
                        </header>
                        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[var(--bg-main)]/30">
                            {/* Moduler som kräver en aktiv analys/ärende */}
                            {!currentAnalysis && ['production', 'opinion', 'duel', 'integrity', 'pipeline', 'profiler', 'controller', 'oracle'].includes(activeModal || '') && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-[var(--bg-card)] rounded-[3rem] border-2 border-dashed border-[var(--border)]">
                                    <div className="w-24 h-24 bg-[var(--bg-main)] rounded-[2rem] flex items-center justify-center mb-8 border border-[var(--border)]">
                                        <FileText className="w-12 h-12 text-[var(--accent)]" />
                                    </div>
                                    <h3 className="text-2xl font-black text-[var(--ink-main)] uppercase italic tracking-tight mb-4 font-serif">Inget aktivt ärende</h3>
                                    <p className="text-[var(--ink-muted)] max-w-md mb-10 font-medium">
                                        Denna modul kräver ett aktivt ärende för att fungera. Vänligen välj ett ärende från arkivet eller skapa ett nytt i analysvyn.
                                    </p>
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => setActiveModal('archive')}
                                            className="px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-[var(--accent)]/20 active:scale-95"
                                        >
                                            Öppna Arkiv
                                        </button>
                                        <button 
                                            onClick={() => setActiveModal(null)}
                                            className="px-8 py-4 bg-[var(--bg-card)] text-[var(--ink-muted)] rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-[var(--border)] hover:bg-[var(--bg-main)]"
                                        >
                                            Avbryt
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'hub' && <SystemHub onNavigate={navigateTo} />}
                            {activeModal === 'ekonomi' && <EkonomiView activeCase={activeCase} />}
                            {activeModal === 'production' && <ProduktionView activeCase={activeCase} />}
                            {activeModal === 'opinion' && currentAnalysis && <OpinionGenerator analysis={currentAnalysis} onComplete={() => setActiveModal(null)} />}
                            {activeModal === 'duel' && currentAnalysis && selectedDoc && <AdversarialDuelView caseData={selectedDoc.textContent} caseId={currentAnalysis.caseId} />}
                            {activeModal === 'integrity' && currentAnalysis && <ForensicIntegrityView analysis={currentAnalysis} />}
                            {activeModal === 'pipeline' && currentAnalysis && <LegalPipelineView analysis={currentAnalysis} />}
                            {activeModal === 'oracle' && <IntelligenceCore analysis={currentAnalysis} />}
                            {activeModal === 'archive' && <ArchiveView onSelect={(id) => { setSelectedDocId(id); setActiveModal(null); }} />}
                            {activeModal === 'audit' && <AuditPanel isOpen={true} onClose={() => setActiveModal(null)} />}
                            {activeModal === 'chat' && <BeslutView activeCase={activeCase} />}
                            {activeModal === 'agent' && <CaseAnalysisView activeCase={activeCase} />}
                            {activeModal === 'debug' && <AIDebugPanel isOpen={true} onClose={() => setActiveModal(null)} />}
                            {activeModal === 'controller' && <FmjamController analysis={currentAnalysis} />}
                            {activeModal === 'notary' && <AutoNotaryView />}
                            {activeModal === 'framework' && <LegalFrameworkView isOpen={true} onClose={() => setActiveModal(null)} />}
                            {activeModal === 'arch' && <ArchiveView onSelect={(id) => { setSelectedDocId(id); setActiveModal(null); }} />}
                            {activeModal === 'vision' && <VisionView />}
                            {activeModal === 'whitebook' && <WhitebookViewer isOpen={true} onClose={() => setActiveModal(null)} />}
                            {activeModal === 'sfb' && <SfbIntegrityPanel isOpen={true} onClose={() => setActiveModal(null)} />}
                            {activeModal === 'monitor' && <SystemMonitor isOpen={true} onClose={() => setActiveModal(null)} />}
                            {activeModal === 'inventory' && <SystemInventory isOpen={true} onClose={() => setActiveModal(null)} />}
                            {activeModal === 'profiler' && activeCase && <CaseProfiler caseData={activeCase} />}
                        </div>
                    </div>
                </div>
            )}

            <QuotaWarning />

            <div className="md:hidden fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border)] rounded-3xl p-4 shadow-2xl z-[200]">
                <ToolButton icon={<LayoutDashboard />} onClick={() => setActiveModal('hub')} active={activeModal === 'hub'} />
                <ToolButton icon={<Wallet />} onClick={() => setActiveModal('ekonomi')} active={activeModal === 'ekonomi'} />
                <ToolButton icon={<MessageSquare />} onClick={() => setActiveModal('chat')} active={activeModal === 'chat'} />
                <ToolButton icon={<Zap />} onClick={() => setActiveModal('production')} active={activeModal === 'production'} />
                <ToolButton icon={<Activity />} onClick={() => setActiveModal('monitor')} active={activeModal === 'monitor'} />
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

const ToolButton: React.FC<ToolButtonProps> = ({ icon, onClick, label, active }) => {
    return (
        <button 
            onClick={onClick}
            aria-label={label}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center space-x-2 ${
                active 
                ? 'bg-[var(--accent)] text-white shadow-md' 
                : 'bg-[var(--bg-card)] text-[var(--ink-muted)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--ink-main)] hover:bg-[var(--bg-main)]'
            }`}
        >
            <div className="shrink-0">
                {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-4 h-4' }) : icon}
            </div>
            {label && <span className="hidden lg:block">{label}</span>}
        </button>
    );
};

interface MenuButtonProps {
    icon: React.ReactNode;
    onClick: () => void;
    label: string;
    active?: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({ icon, onClick, label, active }) => (
    <button 
        onClick={onClick}
        className={`w-full px-4 py-2 text-left transition-all flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest ${
            active 
            ? 'bg-[var(--bg-main)] text-[var(--ink-main)]' 
            : 'text-[var(--ink-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--ink-main)]'
        }`}
    >
        <div className="shrink-0">
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-4 h-4' }) : icon}
        </div>
        <span>{label}</span>
    </button>
);

export default DocumentManager;