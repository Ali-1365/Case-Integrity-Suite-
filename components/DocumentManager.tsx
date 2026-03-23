
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
    UserGroupIcon,
    BanknotesIcon,
    ChevronDownIcon,
    DocumentTextIcon
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
import EconomicDashboard from './EconomicDashboard';
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
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
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
                legalFrameworkIndex as any,
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

            setPipelineStatus(prev => ({ ...prev, currentStep: 'Kör korskorrelering...', progress: 50 }));
            
            const correlations = await orchestrator.runCrossCorrelation(batchDocs);

            const aggregateDoc: StoredDocument = {
                id: `AGG-${Date.now()}`,
                name: `Batch-analys (${ids.length} dokument)`,
                textContent: `Korsanalys av: ${selectedDocs.map(d => d.name).join(', ')}`,
                mimeType: 'application/aggregate',
                createdAt: new Date().toISOString(),
                analysis: {
                    correlations
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
        const items = [{ label: 'Hem', onClick: () => { setSelectedDocId(null); setActiveModal(null); setShowMoreMenu(false); }, icon: <Squares2X2Icon className="w-3.5 h-3.5" /> }];
        
        if (selectedDocId) {
            items.push({ 
                label: 'Analys', 
                onClick: () => { setActiveModal(null); setShowMoreMenu(false); },
                icon: <MagnifyingGlassIcon className="w-3.5 h-3.5" />
            });
            if (selectedDoc) {
                items.push({ 
                    label: selectedDoc.name,
                    onClick: () => {},
                    icon: <DocumentTextIcon className="w-3.5 h-3.5" />
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
                icon: <BoltIcon className="w-3.5 h-3.5" />
            });
        }

        return (
            <nav className="flex items-center space-x-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 mb-8 bg-white/50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm w-fit" aria-label="Breadcrumb">
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <span className="text-slate-400 dark:text-slate-600 font-normal">/</span>}
                        <button 
                            onClick={item.onClick}
                            className={`flex items-center space-x-2.5 transition-all duration-300 ${index === items.length - 1 ? 'text-blue-600 dark:text-blue-400' : 'hover:text-slate-900 dark:hover:text-white hover:translate-x-0.5'}`}
                            aria-current={index === items.length - 1 ? 'page' : undefined}
                        >
                            <div className={`${index === items.length - 1 ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                {item.icon}
                            </div>
                            <span>{item.label}</span>
                        </button>
                    </React.Fragment>
                ))}
            </nav>
        );
    };

    const PageHeader = ({ title, subtitle, icon }: { title: string, subtitle?: string, icon?: React.ReactNode }) => (
        <div className="mb-10 flex items-start justify-between">
            <div className="space-y-2">
                <div className="flex items-center gap-4">
                    {icon && <div className="p-2.5 bg-blue-600/10 rounded-xl text-blue-600 dark:text-blue-400">{icon}</div>}
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{title}</h2>
                </div>
                {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-2xl">{subtitle}</p>}
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
        <div className={`flex flex-col min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'} font-sans transition-colors duration-700`}>
            <header className="h-24 px-10 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl flex justify-between items-center sticky top-0 z-[100] transition-all shadow-sm shadow-slate-200/20 dark:shadow-none">
                <div className="flex items-center space-x-12 w-full overflow-hidden">
                    <div className="flex items-center space-x-4 cursor-pointer shrink-0 group" onClick={() => { setSelectedDocId(null); setActiveModal(null); }}>
                        <div className="p-3 bg-slate-900 dark:bg-blue-600 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all shadow-xl shadow-slate-900/20 dark:shadow-blue-900/30">
                            <LogoIcon className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black tracking-tighter hidden sm:block m-0 leading-none text-slate-900 dark:text-white">Case Integrity Suite</h1>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5 hidden sm:block opacity-70">Enterprise v1.0</span>
                        </div>
                    </div>
                    
                    <nav className="hidden xl:flex items-center space-x-1 flex-1 overflow-x-auto no-scrollbar py-2">
                        {/* Kärnfunktioner */}
                        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                            <ToolButton icon={<Squares2X2Icon />} onClick={() => setActiveModal('hub')} label="Hubb" active={activeModal === 'hub'} />
                            <ToolButton icon={<MagnifyingGlassIcon />} onClick={() => setActiveModal('agent')} label="Analys" active={activeModal === 'agent'} />
                            <ToolButton icon={<BanknotesIcon />} onClick={() => setActiveModal('ekonomi')} label="Ekonomi" active={activeModal === 'ekonomi'} />
                        </div>

                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2 opacity-30"></div>

                        {/* Produktion & Beslut */}
                        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                            <ToolButton icon={<ChatIcon />} onClick={() => setActiveModal('chat')} label="Beslut" active={activeModal === 'chat'} />
                            <ToolButton icon={<BoltIcon />} onClick={() => setActiveModal('production')} label="Produktion" active={activeModal === 'production'} />
                        </div>

                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2 opacity-30"></div>

                        {/* System & Logg */}
                        <div className="flex items-center space-x-1 relative">
                            <ToolButton icon={<ArchiveBoxIcon />} onClick={() => { setActiveModal('arch'); setShowMoreMenu(false); }} label="Arkiv" active={activeModal === 'arch' || activeModal === 'archive'} />
                            
                            <div className="relative">
                                <button 
                                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                                    className={`px-6 py-3 rounded-[1.25rem] transition-all flex items-center space-x-3 group cursor-pointer border-2 ${
                                        showMoreMenu 
                                        ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white' 
                                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/50'
                                    }`}
                                >
                                    <div className={`transition-all duration-500 ${showMoreMenu ? 'text-blue-600 scale-110' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}`}>
                                        <AdjustmentsHorizontalIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-black tracking-tight hidden lg:block">Mer</span>
                                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${showMoreMenu ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {showMoreMenu && (
                                    <>
                                        <div className="fixed inset-0 z-[105]" onClick={() => setShowMoreMenu(false)}></div>
                                        <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl p-3 z-[110] animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                                            <div className="px-4 py-2 mb-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Avancerade Verktyg</span>
                                            </div>
                                            <MenuButton icon={<ShieldCheckIcon />} onClick={() => { setActiveModal('audit'); setShowMoreMenu(false); }} label="Systemlogg" active={activeModal === 'audit'} />
                                            <MenuButton icon={<LawIcon />} onClick={() => { setActiveModal('framework'); setShowMoreMenu(false); }} label="Juridiskt Ramverk" active={activeModal === 'framework'} />
                                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-3 mx-4"></div>
                                            <MenuButton icon={<ActivityIcon />} onClick={() => { setActiveModal('monitor'); setShowMoreMenu(false); }} label="Systemövervakning" active={activeModal === 'monitor'} />
                                            <MenuButton icon={<ClipboardDocumentListIcon />} onClick={() => { setActiveModal('inventory'); setShowMoreMenu(false); }} label="Systeminventering" active={activeModal === 'inventory'} />
                                            <MenuButton icon={<CodeBracketIcon />} onClick={() => { setActiveModal('debug'); setShowMoreMenu(false); }} label="AI Debug Panel" active={activeModal === 'debug'} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </nav>
                </div>

                <div className="flex items-center space-x-6 ml-8">
                    <div className="hidden lg:flex flex-col items-end mr-2 px-5 py-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-inner">
                        <div className="flex items-center gap-2.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Systemhälsa</span>
                            <div className={`w-2 h-2 rounded-full ${quotaUsage.status === 'critical' ? 'bg-red-500 animate-pulse' : (quotaUsage.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500')}`}></div>
                        </div>
                        <span className={`text-xs font-mono font-black mt-0.5 ${quotaUsage.status === 'critical' ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                            {quotaUsage.rpm}/{quotaUsage.limitRpm} <span className="text-[9px] opacity-50">RPM</span>
                        </span>
                    </div>
                    
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.25rem] border border-slate-200 dark:border-slate-700 shadow-inner">
                        <button 
                            onClick={() => setIsDarkMode(!isDarkMode)} 
                            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md active:scale-90"
                            title={isDarkMode ? 'Växla till ljust läge' : 'Växla till mörkt läge'}
                            aria-label={isDarkMode ? 'Växla till ljust läge' : 'Växla till mörkt läge'}
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                        <button 
                            onClick={onLogout} 
                            className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-white dark:hover:bg-red-900/20 rounded-xl transition-all ml-1.5 active:scale-90"
                            title="Logga ut"
                            aria-label="Logga ut"
                        >
                            <LogoutIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
                <Breadcrumbs />
                {selectedDocId ? (
                    <>
                        <PageHeader 
                            title="Ärendeanalys" 
                            subtitle="Djupgående granskning av bevisatomer, rättsliga kopplingar och riskprofiler."
                            icon={<MagnifyingGlassIcon className="w-6 h-6" />}
                        />
                        <AnalysisView 
                            documentId={selectedDocId} 
                            onBack={() => setSelectedDocId(null)} 
                            onDocumentUpdate={loadData} 
                            onLegalReferenceSelect={() => setActiveModal('control')} 
                        />
                    </>
                ) : (
                    <>
                        {!activeModal && (
                            <PageHeader 
                                title="Systemöversikt" 
                                subtitle="Välkommen till Case Integrity Suite. Här kan du hantera ärenden, utföra analyser och övervaka systemets integritet."
                                icon={<Squares2X2Icon className="w-6 h-6" />}
                            />
                        )}
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
                            onSelectDocument={setSelectedDocId}
                            onAggregateSelected={handleAggregateSelected}
                            onAction={setActiveModal}
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

                            {activeModal === 'hub' && <SystemHub onNavigate={(view) => setActiveModal(view)} />}
                            {activeModal === 'ekonomi' && <EconomicDashboard />}
                            {activeModal === 'production' && <LegalTextProductionModule />}
                            {activeModal === 'opinion' && currentAnalysis && <OpinionGenerator analysis={currentAnalysis} onComplete={() => setActiveModal(null)} />}
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

const ToolButton: React.FC<ToolButtonProps> = ({ icon, onClick, label, active }) => (
    <button 
        onClick={onClick}
        aria-label={label}
        className={`px-6 py-3 rounded-[1.25rem] transition-all flex items-center space-x-4 group cursor-pointer border-2 ${
            active 
            ? 'bg-slate-900 text-white border-slate-900 dark:bg-blue-600 dark:border-blue-600 dark:text-white shadow-2xl shadow-slate-900/20 dark:shadow-blue-900/40 scale-105' 
            : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/50'
        }`}
    >
        <div className={`transition-all duration-500 ${active ? 'text-white scale-110' : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300 group-hover:scale-110 group-hover:rotate-6'}`}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' }) : icon}
        </div>
        {label && <span className="text-sm font-black tracking-tight hidden lg:block">{label}</span>}
    </button>
);

interface MenuButtonProps {
    icon: React.ReactNode;
    onClick: () => void;
    label: string;
    active?: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({ icon, onClick, label, active }) => (
    <button 
        onClick={onClick}
        className={`w-full px-4 py-3 rounded-2xl transition-all flex items-center space-x-3 group cursor-pointer ${
            active 
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
        }`}
    >
        <div className={`transition-all duration-300 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-4 h-4' }) : icon}
        </div>
        <span className="text-xs font-bold tracking-tight">{label}</span>
    </button>
);

export default DocumentManager;