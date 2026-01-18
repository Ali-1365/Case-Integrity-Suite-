
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/db';
import { StoredDocument, ParsedDocument } from '../types';
import { useFileParser } from '../hooks/useFileParser';
import { ragService } from '../lib/ragService';
import { AIOrchestrator } from '../lib/AIOrchestrator';
import { NormalizationEngine } from '../lib/normalizationEngine';
import { SynthesizerEngine } from '../lib/synthesizerEngine';
import { QualityAssuranceEngine } from '../lib/qaEngine';
import { AuditEngine } from '../lib/auditEngine';
import { LEGAL_SOURCES } from '../data/legalSources';
import { DEFAULT_CONTEXT_WEIGHTS } from '../data/contextWeights';
import { riskTemplateRegistry } from '../data/riskTemplateRegistry';
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
    AdjustmentsHorizontalIcon
} from './icons';

import Chatbot from './Chatbot';
import SystemMonitor from './SystemMonitor';
import AIDebugPanel from './AIDebugPanel';
import FMJAMControlPanel from './FMJAMControlPanel';
import LegalFrameworkView from './LegalFrameworkView';
import StaticArchitectureView from './StaticArchitectureView';
import AuditPanel from './AuditPanel';
import WhitebookViewer from './WhitebookViewer';
import ControllerDashboard from './ControllerDashboard';

const DocumentManager: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [documents, setDocuments] = useState<StoredDocument[]>([]);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [pipelineStatus, setPipelineStatus] = useState<PipelineStatusState>(initialPipelineStatus);
    const { parseFile, isParsing, parsingError } = useFileParser();

    const [activeModal, setActiveModal] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const docs = await db.getAllDocuments();
            setDocuments(docs);
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

            update('för-analys', 'active', 'Hämtar Ground Truth...');
            const context = await ragService.getContextForText(doc.textContent);

            update('ai-analys', 'active', 'Exekverar Adversarial Round...');
            const aiRes = await orchestrator.runFullAnalysis(doc.textContent, doc.name, LEGAL_SOURCES, context.context);

            update('normalisering', 'active', 'Låser beviskedja...');
            const analysis = normalizer.runFullPipeline(
                doc, aiRes.facts, aiRes.contradictions, aiRes.uncertainties, 
                [], [], aiRes.links, [], { hasChildAspect: false, isPreventive: false }, [], LEGAL_SOURCES
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
        <div className="flex flex-col h-screen items-center justify-center bg-gray-950 space-y-6">
            <Spinner className="h-16 w-16 text-cyan-500" />
            <p className="text-xs font-black uppercase tracking-[0.5em] text-cyan-500/50 animate-pulse">Initializing FMJAM Core v7.4...</p>
        </div>
    );

    const currentAnalysis = documents.find(d => d.id === selectedDocId)?.analysis || null;

    return (
        <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100 font-sans">
            <header className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950/80 backdrop-blur-xl sticky top-0 z-[100]">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setSelectedDocId(null)}>
                        <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-all">
                            <LogoIcon className="h-6 w-6 text-cyan-500" />
                        </div>
                        <h1 className="text-xl font-black uppercase tracking-tighter italic">FMJAM GOLD</h1>
                    </div>
                    
                    <div className="hidden md:flex items-center bg-black/40 border border-gray-800 rounded-2xl p-1 space-x-1">
                        <ToolButton icon={<ActivityIcon />} onClick={() => setActiveModal('monitor')} label="Monitor" active={activeModal === 'monitor'} />
                        <ToolButton icon={<ChatIcon />} onClick={() => setActiveModal('chat')} label="Oracle Chat" active={activeModal === 'chat'} />
                        <ToolButton icon={<CodeBracketIcon />} onClick={() => setActiveModal('debug')} label="System Oracle" active={activeModal === 'debug'} />
                        <ToolButton icon={<AdjustmentsHorizontalIcon />} onClick={() => setActiveModal('controller')} label="Controller" active={activeModal === 'controller'} />
                        <ToolButton icon={<ShieldCheckIcon />} onClick={() => setActiveModal('audit')} label="Audit" active={activeModal === 'audit'} />
                        <ToolButton icon={<LawIcon />} onClick={() => setActiveModal('framework')} label="Legal" active={activeModal === 'framework'} />
                        <ToolButton icon={<ChartBarSquareIcon />} onClick={() => setActiveModal('arch')} label="Arch" active={activeModal === 'arch'} />
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button onClick={onLogout} className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"><LogoutIcon className="h-5 w-5" /></button>
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

            <Chatbot isOpen={activeModal === 'chat'} onClose={() => setActiveModal(null)} ragService={ragService} currentAnalysis={currentAnalysis} />
            <SystemMonitor isOpen={activeModal === 'monitor'} onClose={() => setActiveModal(null)} />
            <AIDebugPanel isOpen={activeModal === 'debug'} onClose={() => setActiveModal(null)} />
            <AuditPanel isOpen={activeModal === 'audit'} onClose={() => setActiveModal(null)} />
            <FMJAMControlPanel isOpen={activeModal === 'control'} onClose={() => setActiveModal(null)} />
            <LegalFrameworkView isOpen={activeModal === 'framework'} onClose={() => setActiveModal(null)} />
            <StaticArchitectureView isOpen={activeModal === 'arch'} onClose={() => setActiveModal(null)} />
            <WhitebookViewer isOpen={activeModal === 'whitebook'} onClose={() => setActiveModal(null)} />
            <ControllerDashboard isOpen={activeModal === 'controller'} onClose={() => setActiveModal(null)} />

            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-gray-900/90 backdrop-blur-2xl border border-gray-800 rounded-3xl p-2 shadow-2xl z-[200]">
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
        className={`p-2.5 rounded-xl transition-all flex items-center space-x-2 group ${active ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-900/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
    >
        <div className={active ? 'text-white' : 'text-gray-400 group-hover:text-cyan-400'}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' }) : icon}
        </div>
        {label && <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">{label}</span>}
    </button>
);

export default DocumentManager;
