
import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { StoredDocument } from '../types';
import { legalTextProductionEngine, ProductionRequest } from '../lib/LegalTextProductionEngine';
import { 
    Spinner, 
    DocumentTextIcon, 
    PlusIcon, 
    TrashIcon, 
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    BoltIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from './icons';
import MarkdownRenderer from './shared/MarkdownRenderer';

export interface ProductionContext {
    goal: string;
    facts: string;
    evidence: string;
    opponentPosition: string;
    proceduralContext: string;
    taskDescription: string;
}

const LegalTextProductionModule: React.FC = () => {
    const [documents, setDocuments] = useState<StoredDocument[]>([]);
    const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);
    const [context, setContext] = useState<ProductionContext>({
        goal: '',
        facts: '',
        evidence: '',
        opponentPosition: '',
        proceduralContext: '',
        taskDescription: ''
    });
    const [isProducing, setIsProducing] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isContextExpanded, setIsContextExpanded] = useState(true);

    useEffect(() => {
        const loadDocs = async () => {
            try {
                const allDocs = await db.getAllDocuments();
                setDocuments(allDocs);
            } catch (err) {
                console.error("Failed to load documents:", err);
            }
        };
        loadDocs().catch(err => console.error("Initial loadDocs failed:", err));
    }, []);

    const handleToggleDraft = (id: string) => {
        setSelectedDraftIds(prev => 
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const handleProduce = async () => {
        setIsProducing(true);
        setError(null);
        setResult(null);
        setLogs([
            'Initierar Advokat-agenten...',
            'Ärende DUEL-GEN saknas. Skapar virtuellt ärende för processen.',
            'Analyserar utkast och kontext...',
            'Verifierar RB-efterlevnad...'
        ]);

        try {
            const selectedDrafts = documents
                .filter(d => selectedDraftIds.includes(d.id))
                .map(d => ({
                    id: d.id,
                    content: d.textContent,
                    name: d.name
                }));

            const request: ProductionRequest = {
                caseId: 'PROD-' + Date.now(),
                drafts: selectedDrafts,
                order: selectedDraftIds, // Use selection order
                context
            };

            setLogs(prev => [...prev, 'Genererar domstolsklar processkrift...']);
            const output = await legalTextProductionEngine.produce(request);
            setLogs(prev => [...prev, 'Produktion slutförd.', 'Slutlig granskning klar.']);
            setResult(output);
            setIsContextExpanded(false);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg || 'Ett fel inträffade vid produktion.');
        } finally {
            setIsProducing(false);
        }
    };

    return (
        <div className="flex flex-col space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                        <BoltIcon className="w-8 h-8 text-indigo-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif font-medium text-slate-900 dark:text-white">Juridisk Textproduktion & Sammanfogning</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Exekverande verktyg för domstolsklara processkrifter</p>
                    </div>
                </div>
                <button 
                    onClick={() => handleProduce().catch(err => console.error("Manual produce failed:", err))}
                    disabled={isProducing}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-400 text-white px-6 py-3 rounded-2xl font-medium transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                    {isProducing ? <Spinner className="w-5 h-5" /> : <ArrowPathIcon className="w-5 h-5" />}
                    <span>{isProducing ? 'Producerar...' : 'Exekvera Produktion'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Drafts & Context */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Draft Selection */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center">
                                <DocumentTextIcon className="w-4 h-4 mr-2" />
                                Utkast & Underlag ({selectedDraftIds.length})
                            </h3>
                        </div>
                        <div className="p-4 max-h-64 overflow-y-auto custom-scrollbar space-y-2">
                            {documents.map(doc => (
                                <button
                                    key={doc.id}
                                    onClick={() => handleToggleDraft(doc.id)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                                        selectedDraftIds.includes(doc.id)
                                            ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800'
                                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                        <div className={`p-2 rounded-lg ${selectedDraftIds.includes(doc.id) ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                            <DocumentTextIcon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium truncate text-slate-700 dark:text-slate-300">{doc.name}</span>
                                    </div>
                                    {selectedDraftIds.includes(doc.id) && (
                                        <CheckCircleIcon className="w-5 h-5 text-indigo-500" />
                                    )}
                                </button>
                            ))}
                            {documents.length === 0 && (
                                <p className="text-center py-8 text-slate-400 text-sm italic">Inga dokument tillgängliga.</p>
                            )}
                        </div>
                    </div>

                    {/* Context Requirements */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <button 
                            onClick={() => setIsContextExpanded(!isContextExpanded)}
                            className="w-full px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center">
                                <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                                Underlagskrav (0 % Felpolicy)
                            </h3>
                            {isContextExpanded ? <ChevronUpIcon className="w-5 h-5 text-slate-400" /> : <ChevronDownIcon className="w-5 h-5 text-slate-400" />}
                        </button>
                        
                        {isContextExpanded && (
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Målbeskrivning (Målnummer & Parter)</label>
                                    <textarea 
                                        value={context.goal}
                                        onChange={e => setContext({...context, goal: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-20"
                                        placeholder="T.ex. Mål nr T 123-24, Stockholms tingsrätt..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Rättsfakta (Tidslinjer & Belopp)</label>
                                    <textarea 
                                        value={context.facts}
                                        onChange={e => setContext({...context, facts: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bevisning (Bilagebeteckningar)</label>
                                    <textarea 
                                        value={context.evidence}
                                        onChange={e => setContext({...context, evidence: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Motpartens ståndpunkt</label>
                                    <textarea 
                                        value={context.opponentPosition}
                                        onChange={e => setContext({...context, opponentPosition: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Processuell kontext</label>
                                    <textarea 
                                        value={context.proceduralContext}
                                        onChange={e => setContext({...context, proceduralContext: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-20"
                                        placeholder="Stadium, tidsfrister..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Uppdragsbeskrivning</label>
                                    <textarea 
                                        value={context.taskDescription}
                                        onChange={e => setContext({...context, taskDescription: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-20"
                                        placeholder="Vilken handling ska produceras?"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Result */}
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 h-full min-h-[800px] flex flex-col shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                            <h3 className="text-lg font-serif font-medium text-slate-900 dark:text-white">Domstolsklar Processkrift</h3>
                            {result && (
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(result)
                                            .then(() => console.log('Kopierat till urklipp'))
                                            .catch(err => console.error("Copy failed:", err));
                                    }}
                                    className="text-xs font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-500 transition-colors"
                                >
                                    Kopiera Text
                                </button>
                            )}
                        </div>
                        
                        <div className="flex-grow p-10 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950">
                            {isProducing ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-8">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse"></div>
                                        <Spinner className="w-16 h-16 text-indigo-500 relative z-10" />
                                    </div>
                                    <div className="w-full max-w-md space-y-3">
                                        {logs.map((log, idx) => (
                                            <div key={idx} className="flex items-center space-x-3 text-xs font-mono animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                                                <span className="text-indigo-500">›</span>
                                                <span className="text-slate-500 dark:text-slate-400">{log}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse mt-4">Exekverar juridisk textproduktion...</p>
                                </div>
                            ) : error ? (
                                <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-3xl text-red-600 dark:text-red-400 flex items-start space-x-4">
                                    <ExclamationTriangleIcon className="w-6 h-6 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold mb-1">Produktionsfel</h4>
                                        <p className="text-sm">{error}</p>
                                    </div>
                                </div>
                            ) : result ? (
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    <MarkdownRenderer content={result} />
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
                                    <BoltIcon className="w-24 h-24 text-slate-300 mb-6" />
                                    <p className="text-xl font-serif text-slate-400">Väntar på exekvering</p>
                                    <p className="text-sm text-slate-400 mt-2">Välj utkast och fyll i underlagskrav för att börja</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalTextProductionModule;
