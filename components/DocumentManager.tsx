
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
    UserGroupIcon,
    BanknotesIcon,
    ChevronDownIcon,
    DocumentTextIcon,
    DocumentDuplicateIcon,
    BriefcaseIcon
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
import EkonomiView from './EkonomiView';
import ProduktionView from './ProduktionView';
import BeslutView from './BeslutView';
import AnalysView from './AnalysView';
import { IntelligenceCore } from './IntelligenceCore';
import ArchiveView from './ArchiveView';
import { FmjamController } from './FmjamController';
import { CaseProfiler } from './CaseProfiler';
import { SystemHub } from './SystemHub';
import OpinionGenerator from './OpinionGenerator';
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
                const newUsage = usageMonitorService.getUsage();
                setQuotaUsage(prev => {
                    if (
                        prev.rpm === newUsage.rpm &&
                        prev.tpm === newUsage.tpm &&
                        prev.status === newUsage.status &&
                        prev.limitRpm === newUsage.limitRpm &&
                        prev.limitTpm === newUsage.limitTpm
                    ) {
                        return prev; // Bail out of re-render
                    }
                    return newUsage;
                });
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
        const items = [{ label: 'Hem', onClick: () => { setSelectedDocId(null); setActiveModal(null); setShowMoreMenu(false); }, icon: <Squares2X2Icon className="w-5 h-5" /> }];
        
        if (selectedDocId) {
            items.push({ 
                label: 'Analys', 
                onClick: () => { setActiveModal(null); setShowMoreMenu(false); },
                icon: <MagnifyingGlassIcon className="w-5 h-5" />
            });
            if (selectedDoc) {
                items.push({ 
                    label: selectedDoc.name, 
                    onClick: () => {},
                    icon: <DocumentTextIcon className="w-5 h-5" />
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
                monitor: 'System Monitor',
                inventory: 'System Inventory',
                debug: 'AI Debug Panel',
                profiler: 'Case Profiler'
            };
            items.push({ 
                label: modalLabels[activeModal] || 'Modul', 
                onClick: () => {},
                icon: <BoltIcon className="w-5 h-5" />
            });
        }

        return (
            <nav className="flex items-center space-x-6 text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400 mb-14 bg-white/60 dark:bg-slate-900/60 p-6 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl w-fit shadow-lg shadow-slate-200/20 dark:shadow-black/20" aria-label="Breadcrumb">
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <div className="w-2 h-2 rounded-full bg-indigo-500/30 dark:bg-indigo-500/20 mx-2" />}
                        <button 
                            onClick={item.onClick}
                            className={`flex items-center space-x-4 transition-all duration-500 group ${index === items.length - 1 ? 'text-indigo-600 dark:text-indigo-400' : 'hover:text-slate-900 dark:hover:text-white'}`}
                            aria-current={index === items.length - 1 ? 'page' : undefined}
                        >
                            <div className={`transition-all duration-700 ${index === items.length - 1 ? 'text-indigo-500 scale-125 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 group-hover:scale-125 group-hover:rotate-6'}`}>
                                {item.icon}
                            </div>
                            <span className="group-hover:translate-x-1 transition-transform">{item.label}</span>
                        </button>
                    </React.Fragment>
                ))}
            </nav>
        );
    };

    const PageHeader = ({ title, subtitle, icon }: { title: string, subtitle?: string, icon?: React.ReactNode }) => (
        <div className="mb-20 flex items-start justify-between animate-in fade-in slide-in-from-left-12 duration-1000">
            <div className="space-y-8">
                <div className="flex items-center gap-10">
                    {icon && <div className="p-7 bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800 rounded-[2.5rem] text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] border-2 border-white/20 group hover:scale-110 hover:rotate-6 transition-all duration-700">{icon}</div>}
                    <h2 className="text-7xl font-serif font-bold text-slate-900 dark:text-white tracking-tighter leading-none m-0">{title}</h2>
                </div>
                {subtitle && <p className="text-2xl text-slate-500 dark:text-slate-400 font-medium max-w-5xl leading-relaxed opacity-90">{subtitle}</p>}
            </div>
        </div>
    );

    if (isLoading) return (
        <div className="flex flex-col h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 space-y-8 animate-fade-in">
            <div className="relative">
                <Spinner className="h-20 w-20 text-blue-600 dark:text-blue-400" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <LogoIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
                </div>
            </div>
            <div className="text-center space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-slate-400 animate-pulse">Initialiserar Case Integrity Suite v1.0</p>
                <p className="text-[10px] text-slate-400 font-mono">Systemintegritet: Validerad</p>
            </div>
        </div>
    );

    return (
        <div className={`flex flex-col min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'} font-sans transition-colors duration-1000`}>
            <header className="h-40 px-16 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-slate-950/90 backdrop-blur-3xl flex justify-between items-center sticky top-0 z-[100] transition-all shadow-[0_15px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_15px_50px_rgba(0,0,0,0.3)]">
                <div className="flex items-center space-x-20 w-full overflow-hidden">
                    <div className="flex items-center space-x-8 cursor-pointer shrink-0 group" onClick={() => navigateTo('overview')}>
                        <div className="p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 rounded-[2.5rem] group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-[0_25px_50px_rgba(79,70,229,0.4)] dark:shadow-[0_25px_50px_rgba(79,70,229,0.2)] border-2 border-white/20 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <LogoIcon className="h-11 w-11 text-white relative z-10" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-4xl font-serif font-black tracking-tighter hidden sm:block m-0 leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Case Integrity</h1>
                            <div className="flex items-center gap-3 mt-3.5 hidden sm:flex">
                                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                                <span className="text-[12px] font-black text-indigo-500 uppercase tracking-[0.6em] opacity-100">Enterprise v1.0</span>
                            </div>
                        </div>
                    </div>
                    
                    <nav className="hidden xl:flex items-center space-x-4 flex-1 overflow-x-auto no-scrollbar py-4">
                        {/* Kärnfunktioner */}
                        <div className="flex items-center space-x-2 bg-slate-100/60 dark:bg-slate-900/40 p-2.5 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/40 backdrop-blur-xl shadow-inner">
                            <ToolButton icon={<Squares2X2Icon />} onClick={() => navigateTo('hub')} label="Hubb" active={currentView === 'hub'} color="indigo" />
                            <ToolButton icon={<DocumentDuplicateIcon />} onClick={() => navigateTo('overview')} label="Ärenden" active={currentView === 'overview' || currentView === 'analysis'} color="rose" />
                            <ToolButton icon={<MagnifyingGlassIcon />} onClick={() => navigateTo('agent')} label="Analys" active={activeModal === 'agent'} color="amber" />
                            <ToolButton icon={<BanknotesIcon />} onClick={() => navigateTo('ekonomi')} label="Ekonomi" active={activeModal === 'ekonomi'} color="teal" />
                        </div>

                        <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 mx-4 opacity-60"></div>

                        {/* Produktion & Beslut */}
                        <div className="flex items-center space-x-2 bg-slate-100/60 dark:bg-slate-900/40 p-2.5 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/40 backdrop-blur-xl shadow-inner">
                            <ToolButton icon={<ChatIcon />} onClick={() => navigateTo('chat')} label="Beslut" active={activeModal === 'chat'} color="blue" />
                            <ToolButton icon={<BoltIcon />} onClick={() => navigateTo('production')} label="Produktion" active={activeModal === 'production'} color="purple" />
                        </div>

                        <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 mx-4 opacity-60"></div>

                        {/* System & Logg */}
                        <div className="flex items-center space-x-2 relative">
                            <ToolButton icon={<ArchiveBoxIcon />} onClick={() => navigateTo('arch')} label="Arkiv" active={activeModal === 'arch' || activeModal === 'archive'} color="slate" />
                            
                            <div className="relative">
                                <button 
                                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                                    className={`px-8 py-4 rounded-[2rem] transition-all duration-500 flex items-center space-x-5 group cursor-pointer border-2 shadow-md ${
                                        showMoreMenu 
                                        ? 'bg-white dark:bg-slate-900 border-indigo-500/50 text-indigo-600 dark:text-indigo-400 shadow-indigo-500/20' 
                                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-white dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900/50'
                                    }`}
                                >
                                    <div className={`transition-all duration-700 ${showMoreMenu ? 'text-indigo-600 scale-125 rotate-12 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300 group-hover:scale-110'}`}>
                                        <AdjustmentsHorizontalIcon className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-black tracking-tight hidden lg:block uppercase tracking-[0.1em]">Mer</span>
                                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-700 ${showMoreMenu ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {showMoreMenu && (
                                    <>
                                        <div className="fixed inset-0 z-[105]" onClick={() => setShowMoreMenu(false)}></div>
                                        <div className="absolute right-0 mt-6 w-80 bg-white/98 dark:bg-slate-950/98 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-[0_35px_80px_rgba(0,0,0,0.25)] p-5 z-[110] animate-in fade-in zoom-in-95 duration-500 backdrop-blur-2xl ring-1 ring-black/5">
                                            <div className="px-6 py-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                                                <span className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">Avancerade Verktyg</span>
                                            </div>
                                            <div className="space-y-2">
                                                <MenuButton icon={<ShieldCheckIcon />} onClick={() => navigateTo('audit')} label="Systemlogg" active={activeModal === 'audit'} />
                                                <MenuButton icon={<LawIcon />} onClick={() => navigateTo('framework')} label="Juridiskt Ramverk" active={activeModal === 'framework'} />
                                                <div className="h-px bg-slate-100 dark:bg-slate-800 my-5 mx-6 opacity-50"></div>
                                                <MenuButton icon={<ActivityIcon />} onClick={() => navigateTo('monitor')} label="Systemövervakning" active={activeModal === 'monitor'} />
                                                <MenuButton icon={<ClipboardDocumentListIcon />} onClick={() => navigateTo('inventory')} label="Systeminventering" active={activeModal === 'inventory'} />
                                                <MenuButton icon={<CodeBracketIcon />} onClick={() => navigateTo('debug')} label="AI Debug Panel" active={activeModal === 'debug'} />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-3 opacity-40"></div>

                            {/* Case Selector */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowCaseMenu(!showCaseMenu)}
                                    className={`px-5 py-3 rounded-2xl transition-all flex items-center space-x-4 border-2 shadow-sm ${
                                        activeCase 
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-700/50 text-white shadow-lg shadow-blue-500/20' 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <div className={`p-1.5 rounded-lg ${activeCase ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                        <BriefcaseIcon className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-wider truncate max-w-[140px]">
                                        {activeCase ? activeCase.name || activeCase.caseId : 'Välj Ärende'}
                                    </span>
                                    <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-500 ${showCaseMenu ? 'rotate-180' : ''}`} />
                                </button>

                                {showCaseMenu && (
                                    <>
                                        <div className="fixed inset-0 z-[105]" onClick={() => setShowCaseMenu(false)}></div>
                                        <div className="absolute right-0 mt-4 w-96 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.15)] p-4 z-[110] animate-in fade-in zoom-in-95 duration-300 backdrop-blur-xl">
                                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 mb-4 flex justify-between items-center">
                                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Aktiva Ärenden</h3>
                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-bold text-slate-500">{cases.length}</span>
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto p-1 space-y-2 custom-scrollbar">
                                                {cases.length > 0 ? (
                                                    cases.map(c => (
                                                        <button
                                                            key={c.caseId}
                                                            onClick={() => {
                                                                setActiveCase(c);
                                                                setShowCaseMenu(false);
                                                            }}
                                                            className={`w-full text-left px-5 py-4 rounded-[1.5rem] transition-all flex flex-col gap-1.5 group ${
                                                                activeCase?.caseId === c.caseId
                                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-black tracking-tight truncate group-hover:translate-x-1 transition-transform">{c.name || 'Namnlöst Ärende'}</span>
                                                                {activeCase?.caseId === c.caseId && <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
                                                            </div>
                                                            <div className="flex items-center justify-between text-[10px] opacity-60 font-mono font-bold tracking-widest">
                                                                <span>{c.caseId}</span>
                                                                <span className={`px-2 py-0.5 rounded uppercase ${
                                                                    c.status === 'AVSLUTAT' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                                                                }`}>{c.status}</span>
                                                            </div>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-6 py-12 text-center text-slate-400 text-xs italic bg-slate-50/50 dark:bg-slate-800/20 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                                                        Inga ärenden hittades.
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 mt-4 border-t border-slate-100 dark:border-slate-800">
                                                <button 
                                                    onClick={() => {
                                                        // Logic to create new case could go here
                                                        setShowCaseMenu(false);
                                                    }}
                                                    className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all active:scale-95"
                                                >
                                                    + Skapa Nytt Ärende
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </nav>
                </div>

                <div className="flex items-center space-x-8 ml-8">
                    <div className="hidden lg:flex flex-col items-end mr-2 px-6 py-2.5 bg-white dark:bg-slate-800/40 rounded-[1.5rem] border border-slate-200 dark:border-slate-700/50 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Systemhälsa</span>
                            <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${
                                quotaUsage.status === 'critical' 
                                    ? 'bg-red-500 animate-pulse shadow-red-500/50' 
                                    : (quotaUsage.status === 'warning' ? 'bg-amber-500 shadow-amber-500/50' : 'bg-emerald-500 shadow-emerald-500/50')
                            }`}></div>
                        </div>
                        <span className={`text-sm font-mono font-black mt-1 ${quotaUsage.status === 'critical' ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>
                            {quotaUsage.rpm}/{quotaUsage.limitRpm} <span className="text-[10px] opacity-40 font-sans">RPM</span>
                        </span>
                    </div>
                    
                    <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-2 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 shadow-inner backdrop-blur-sm">
                        <button 
                            onClick={() => setIsDarkMode(!isDarkMode)} 
                            className="p-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md active:scale-90"
                            title={isDarkMode ? 'Växla till ljust läge' : 'Växla till mörkt läge'}
                            aria-label={isDarkMode ? 'Växla till ljust läge' : 'Växla till mörkt läge'}
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                        <button 
                            onClick={onLogout} 
                            className="p-3 text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-white dark:hover:bg-red-900/20 rounded-xl transition-all ml-2 active:scale-90"
                            title="Logga ut"
                            aria-label="Logga ut"
                        >
                            <LogoutIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
                <Breadcrumbs />
                
                {currentView === 'analysis' && selectedDocId ? (
                    <>
                        <PageHeader 
                            title="Ärendeanalys" 
                            subtitle="Djupgående granskning av bevisatomer, rättsliga kopplingar och riskprofiler."
                            icon={<MagnifyingGlassIcon className="w-6 h-6" />}
                        />
                        <AnalysisView 
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
                            icon={<Squares2X2Icon className="w-6 h-6" />}
                        />
                        <SystemHub onNavigate={navigateTo} />
                    </>
                ) : (
                    <>
                        <PageHeader 
                            title="Systemöversikt" 
                            subtitle="Välkommen till Case Integrity Suite. Här kan du hantera ärenden, utföra analyser och övervaka systemets integritet."
                            icon={<DocumentDuplicateIcon className="w-6 h-6" />}
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
                <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/90 backdrop-blur-xl z-[250] flex items-center justify-center p-0 md:p-6 lg:p-12 animate-in fade-in duration-500">
                    <div className="bg-white dark:bg-slate-900 rounded-none md:rounded-[3rem] shadow-2xl w-full max-w-7xl h-full md:h-[92vh] flex flex-col border-none md:border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-700">
                        <header className="px-12 py-8 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center shrink-0">
                            <div className="flex items-center space-x-8">
                                <div className="p-4 bg-slate-900 dark:bg-blue-600 rounded-[1.5rem] shadow-2xl shadow-slate-900/20 dark:shadow-blue-900/40">
                                    {activeModal === 'hub' && <Squares2X2Icon className="h-7 w-7 text-white" />}
                                    {activeModal === 'ekonomi' && <BanknotesIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'production' && <BoltIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'opinion' && <SparklesIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'duel' && <ExclamationTriangleIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'integrity' && <FingerPrintIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'pipeline' && <ActivityIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'oracle' && <CpuChipIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'archive' && <ArchiveBoxIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'audit' && <ShieldCheckIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'chat' && <ChatIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'agent' && <MagnifyingGlassIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'debug' && <CodeBracketIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'controller' && <AdjustmentsHorizontalIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'notary' && <ClipboardDocumentListIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'framework' && <LawIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'arch' && <ArchiveBoxIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'whitebook' && <ClipboardDocumentListIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'sfb' && <ShieldCheckIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'monitor' && <ActivityIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'inventory' && <ClipboardDocumentListIcon className="h-7 w-7 text-white" />}
                                    {activeModal === 'profiler' && <UserGroupIcon className="h-7 w-7 text-white" />}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter m-0">
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
                                        {activeModal === 'whitebook' && 'Vitbok'}
                                        {activeModal === 'sfb' && 'SFB Integritet'}
                                        {activeModal === 'monitor' && 'System Monitor'}
                                        {activeModal === 'inventory' && 'System Inventory'}
                                        {activeModal === 'profiler' && 'Case Profiler'}
                                    </h2>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 opacity-70">Säker anslutning • Modul v.7.5</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setActiveModal(null)} 
                                className="p-4 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[1.5rem] transition-all active:scale-90"
                                title="Stäng modul"
                            >
                                <XMarkIcon className="h-8 w-8" />
                            </button>
                        </header>
                        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-white dark:bg-slate-950">
                            {/* Moduler som kräver en aktiv analys/ärende */}
                            {!currentAnalysis && ['production', 'opinion', 'duel', 'integrity', 'pipeline', 'profiler', 'controller', 'oracle'].includes(activeModal || '') && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 dark:bg-slate-950/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                                    <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] flex items-center justify-center mb-8 border border-blue-100 dark:border-blue-800">
                                        <DocumentTextIcon className="w-12 h-12 text-blue-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight mb-4">Inget aktivt ärende</h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-md mb-10 font-medium">
                                        Denna modul kräver ett aktivt ärende för att fungera. Vänligen välj ett ärende från arkivet eller skapa ett nytt i analysvyn.
                                    </p>
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => setActiveModal('archive')}
                                            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                                        >
                                            Öppna Arkiv
                                        </button>
                                        <button 
                                            onClick={() => setActiveModal(null)}
                                            className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
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
                            {activeModal === 'agent' && <AnalysView activeCase={activeCase} />}
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
                        </div>
                    </div>
                </div>
            )}

            <QuotaWarning />

            <div className="md:hidden fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center bg-[#111111]/90 backdrop-blur-md border border-gray-800 rounded-3xl p-4 shadow-2xl z-[200]">
                <ToolButton icon={<Squares2X2Icon />} onClick={() => setActiveModal('hub')} active={activeModal === 'hub'} />
                <ToolButton icon={<BanknotesIcon />} onClick={() => setActiveModal('ekonomi')} active={activeModal === 'ekonomi'} />
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

const ToolButton: React.FC<ToolButtonProps & { color?: string }> = ({ icon, onClick, label, active, color = 'indigo' }) => {
    const colorClasses: Record<string, string> = {
        indigo: 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 border-indigo-400/50 shadow-[0_20px_50px_rgba(79,70,229,0.4)]',
        rose: 'bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 border-rose-400/50 shadow-[0_20px_50px_rgba(225,29,72,0.4)]',
        amber: 'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 border-amber-400/50 shadow-[0_20px_50px_rgba(245,158,11,0.4)]',
        teal: 'bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 border-teal-400/50 shadow-[0_20px_50px_rgba(20,184,166,0.4)]',
        blue: 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 border-blue-400/50 shadow-[0_20px_50px_rgba(37,99,235,0.4)]',
        purple: 'bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 border-purple-400/50 shadow-[0_20px_50px_rgba(147,51,234,0.4)]',
        slate: 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900 border-slate-400/50 shadow-[0_20px_50px_rgba(71,85,105,0.4)]'
    };

    return (
        <button 
            onClick={onClick}
            aria-label={label}
            className={`px-10 py-5 rounded-[2.5rem] transition-all duration-700 flex items-center space-x-6 group cursor-pointer border-2 relative overflow-hidden ${
                active 
                ? `${colorClasses[color]} text-white scale-110 ring-8 ring-white/10 z-10 rotate-1` 
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-white dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900/60 shadow-sm hover:shadow-2xl hover:-translate-y-1.5'
            }`}
        >
            {active && (
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent animate-pulse" />
            )}
            <div className={`transition-all duration-1000 relative z-10 ${active ? 'text-white scale-150 rotate-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:scale-150 group-hover:rotate-12'}`}>
                {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-7 h-7' }) : icon}
            </div>
            {label && <span className={`text-base font-black tracking-widest hidden lg:block relative z-10 uppercase ${active ? 'opacity-100 translate-x-1' : 'opacity-80 group-hover:opacity-100 group-hover:translate-x-1'}`}>{label}</span>}
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
        className={`w-full px-8 py-6 rounded-[2.5rem] transition-all duration-700 flex items-center space-x-6 group cursor-pointer border-2 relative overflow-hidden ${
            active 
            ? 'bg-gradient-to-r from-indigo-600 to-indigo-800 text-white border-indigo-400/50 shadow-2xl shadow-indigo-500/40 scale-[1.02]' 
            : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400'
        }`}
    >
        <div className={`transition-all duration-1000 relative z-10 ${active ? 'text-white scale-150 rotate-12' : 'text-slate-400 group-hover:text-indigo-500 group-hover:scale-150 group-hover:rotate-12'}`}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-7 h-7' }) : icon}
        </div>
        <span className={`text-base font-black uppercase tracking-[0.2em] relative z-10 transition-all duration-700 ${active ? 'opacity-100 translate-x-2' : 'opacity-80 group-hover:opacity-100 group-hover:translate-x-3'}`}>{label}</span>
        {!active && (
            <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        )}
    </button>
);

export default DocumentManager;