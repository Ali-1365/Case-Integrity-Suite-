
import React, { useEffect, useState } from 'react';
import { 
    XMarkIcon, 
    ChartBarSquareIcon, 
    ShieldCheckIcon, 
    CpuChipIcon, 
    databaseIcon as DatabaseIcon, 
    InformationCircleIcon, 
    SparklesIcon, 
    LawIcon, 
    ChatIcon, 
    BoltIcon,
    ArrowLeftIcon
} from './icons';
import SystemDocumentation from './SystemDocumentation';
import OracleCoreViewer from './OracleCoreViewer';
import ArchiveCoreViewer from './ArchiveCoreViewer';

declare const mermaid: any;

interface StaticArchitectureViewProps {
  isOpen: boolean;
  onClose: () => void;
}

type SubView = 'root' | 'oracle' | 'archive';
type DiagramType = 'conceptual' | 'detailed';

const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button 
        onClick={onClick}
        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
    >
        {children}
    </button>
);


const StaticArchitectureView: React.FC<StaticArchitectureViewProps> = ({ isOpen, onClose }) => {
    const [activeSubView, setActiveSubView] = useState<SubView>('root');
    const [activeDiagram, setActiveDiagram] = useState<DiagramType>('conceptual');
    
    useEffect(() => {
        if (!isOpen) {
            setActiveSubView('root');
            setActiveDiagram('conceptual');
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && activeSubView === 'root') {
            const timer = setTimeout(() => {
                try {
                    mermaid.initialize({
                        startOnLoad: false, 
                        theme: 'dark', 
                        securityLevel: 'loose',
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                        flowchart: { htmlLabels: true, curve: 'basis', useMaxWidth: true }
                    });
                    mermaid.run();
                } catch (e) {
                    console.error("Mermaid failure:", e);
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen, activeSubView, activeDiagram]);

    if (!isOpen) return null;

    const renderContent = () => {
        switch (activeSubView) {
            case 'oracle':
                return <OracleCoreViewer onBack={() => setActiveSubView('root')} />;
            case 'archive':
                return <ArchiveCoreViewer onBack={() => setActiveSubView('root')} />;
            default:
                return (
                    <div className="space-y-16 animate-in fade-in duration-300">
                        <div className="flex justify-start">
                            <button 
                                onClick={onClose}
                                className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded-2xl border border-gray-800 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95"
                            >
                                <ArrowLeftIcon className="h-4 w-4" />
                                <span>Återgå till Dashboard</span>
                            </button>
                        </div>

                        <section className="bg-gray-900/60 p-10 rounded-[2.5rem] border border-gray-800 shadow-inner overflow-hidden">
                            <div className="flex justify-between items-end mb-10">
                                <div>
                                    <h3 className="text-xs font-black text-cyan-500 uppercase tracking-[0.2em] flex items-center mb-2">
                                        <CpuChipIcon className="w-5 h-5 mr-3" />
                                        Systemarkitektur
                                    </h3>
                                    <p className="text-gray-400 text-sm">Forensiskt dataflöde och RAG-orkestrering.</p>
                                </div>
                                <div className="flex bg-gray-950 p-1.5 rounded-[1.2rem] border border-gray-800 shadow-inner">
                                    <TabButton active={activeDiagram === 'conceptual'} onClick={() => setActiveDiagram('conceptual')}>Konceptuell</TabButton>
                                    <TabButton active={activeDiagram === 'detailed'} onClick={() => setActiveDiagram('detailed')}>Detaljerad</TabButton>
                                </div>
                            </div>
                            
                            {activeDiagram === 'conceptual' && (
                                <div className="mermaid flex justify-center bg-black/40 p-10 rounded-[2rem] border border-cyan-500/10 shadow-2xl">
{`graph TD;
    subgraph Indata [INDATA]
        Lagfiler["Lagfiler (*.json)"];
        Praxis["Praxis"];
        Metadata["Metadata"];
        Faktajournal["Faktajournal (*.json)"];
    end

    Analysmotor("
        <b>Analysmotor</b>
        <br/>
        - Kopplar fakta-lag
        <br/>
        - Identifierar motstridigheter & gap
        <br/>
        - Formulerar slutsats
    ");

    subgraph Slutprodukt [OUTPUT]
        Markdown["Markdown"];
        JSON["JSON"];
        HTML["HTML"];
    end

    Indata --> Analysmotor;
    Analysmotor --> Slutprodukt;

    style Indata fill:#083344,stroke:#06b6d4,color:#fff
    style Analysmotor fill:#4c1d95,stroke:#a78bfa,color:#fff
    style Slutprodukt fill:#166534,stroke:#4ade80,color:#fff
`}
                                </div>
                            )}

                            {activeDiagram === 'detailed' && (
                                <div className="mermaid flex justify-center bg-black/40 p-10 rounded-[2rem] border border-cyan-500/10 shadow-2xl">
{`graph TD
    Files([30x Ärendefiler]) --> Parse[Forensisk Ingestion]
    Archive[(Ärende-Arkiv: 01-05)] --> RAG[RAG Hybrid Index]
    GOLD[(Legal Ground Truth)] --> RAG
    
    Parse --> Graph[Knowledge Graph]
    
    subgraph Core [ANALYSPROCESS]
        Graph --> AgentA[Agent A: Analytikern]
        AgentA --> AgentB{Agent B: ADJUDICATOR}
        AgentB -- VERIFIED --> Approved[Validerad Data]
    end

    subgraph Interaction [INTERAKTIVT LAGER]
        Approved --> Oracle[System Oracle: Logic Engine]
        RAG --> Oracle
        Oracle --> Chatbot{{Chatbot Interface}}
    end
    
    Interaction --> LockedDoc([LÅST SLUTRAPPORT])

    style Archive fill:#4c1d95,stroke:#a78bfa,color:#fff
    style Oracle fill:#164e63,stroke:#22d3ee,color:#fff
    style Chatbot fill:#0e7490,stroke:#22d3ee,color:#fff`}
                                </div>
                            )}
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="bg-cyan-500/5 border border-cyan-500/20 p-8 rounded-[2rem] group relative overflow-hidden">
                                <h3 className="text-xl font-black text-cyan-400 mb-6 flex items-center uppercase italic tracking-tighter">
                                    <SparklesIcon className="w-8 h-8 mr-4" />
                                    Oracle Core (Reasoning)
                                </h3>
                                <p className="text-gray-300 mb-8 text-sm leading-relaxed">Deep RAG-analys med deterministisk logik.</p>
                                <button 
                                    onClick={() => setActiveSubView('oracle')}
                                    className="flex items-center space-x-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase py-4 px-8 rounded-2xl transition-all text-[10px] tracking-widest shadow-xl shadow-cyan-900/20"
                                >
                                    <BoltIcon className="w-4 h-4" />
                                    <span>Konfigurera Oracle Core</span>
                                </button>
                            </div>

                            <div className="bg-purple-500/5 border border-purple-500/20 p-8 rounded-[2rem] group relative overflow-hidden">
                                <h3 className="text-xl font-black text-purple-400 mb-6 flex items-center uppercase italic tracking-tighter">
                                    <DatabaseIcon className="w-8 h-8 mr-4" />
                                    Archive Core (Ingestion)
                                </h3>
                                <p className="text-gray-300 mb-8 text-sm leading-relaxed">Ärendespecifik Ground Truth-hantering.</p>
                                <button 
                                    onClick={() => setActiveSubView('archive')}
                                    className="flex items-center space-x-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase py-4 px-8 rounded-2xl transition-all text-[10px] tracking-widest shadow-xl shadow-purple-900/20"
                                >
                                    <DatabaseIcon className="w-4 h-4" />
                                    <span>Hantera Ärendearkiv</span>
                                </button>
                            </div>
                        </div>

                        <SystemDocumentation />
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[250] flex items-center justify-center p-4 md:p-8 outline-none animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-7xl h-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden ring-1 ring-white/5 transition-all">
                <header className="px-10 py-8 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center space-x-6 relative z-10">
                        {activeSubView !== 'root' ? (
                            <button 
                                onClick={() => setActiveSubView('root')}
                                className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-4 rounded-2xl border border-gray-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                                <span>Tillbaka till nav</span>
                            </button>
                        ) : (
                            <div className="p-4 bg-cyan-500/10 rounded-[1.5rem] border border-cyan-500/20 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]">
                                <ChartBarSquareIcon className="h-10 w-10 text-cyan-400" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Systemarkitektur v.6.3</h2>
                            <p className="text-[10px] font-black text-gray-500 uppercase mt-2 tracking-[0.3em]">
                                {activeSubView === 'root' ? 'ARCHITECTURE_ROOT' : `${activeSubView.toUpperCase()}_CORE_VIEW`}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 text-gray-500 hover:text-white hover:bg-gray-800 rounded-2xl transition-all group">
                        <XMarkIcon className="h-8 w-8" />
                    </button>
                </header>
                
                <main className="flex-grow overflow-y-auto p-10 custom-scrollbar bg-gray-950/40">
                    {renderContent()}
                </main>

                <footer className="px-10 py-6 border-t border-gray-800 bg-gray-900/50 flex justify-between items-center">
                    <div className="flex items-center space-x-3 text-gray-600">
                        <InformationCircleIcon className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">FMJAM v.7.4.0 | TRACE_LOCKED</span>
                    </div>
                    <div className="flex items-center space-x-3 text-cyan-500/60 font-mono text-[9px] uppercase tracking-tighter font-bold bg-black/20 px-4 py-2 rounded-full border border-gray-800">
                        <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                        <span>SFS 2025:400 COMPLIANT</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default StaticArchitectureView;
