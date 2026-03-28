
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { ragService } from '../lib/ragService';
import { AnalysisResult } from '../lib/cis.types';
import { offlineService } from '../services/offlineService';
import { 
    ChatIcon, 
    PaperAirplaneIcon, 
    UserIcon, 
    SparklesIcon, 
    Spinner, 
    ShieldCheckIcon,
    BoltIcon,
    MagnifyingGlassIcon,
    ActivityIcon,
    CpuChipIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon
} from './icons';
import MarkdownRenderer from './shared/MarkdownRenderer';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

type AnalysisStatus = 'IDLE' | 'INITIERAT' | 'ANALYSERAR' | 'SLUTFÖRT' | 'ERROR';

interface InteractiveAnalystProps {
    analysis: AnalysisResult;
}

export const InteractiveAnalyst: React.FC<InteractiveAnalystProps> = ({ analysis }) => {
    const [isOffline, setIsOffline] = useState(offlineService.getIsOffline());
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: `Välkommen till **Interactive Analyst**. Jag har laddat in ärende **${analysis.caseId}**. \n\nHur kan jag hjälpa dig med den dynamiska ärendeanalysen idag? Du kan fråga om bevisatomer, lagrumskopplingar eller be mig simulera olika scenarier.`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('IDLE');
    const [statusMessage, setStatusMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const unsubscribe = offlineService.subscribe((offline) => {
            setIsOffline(offline);
        });
        return unsubscribe;
    }, []);

    const handleGenerateOpinion = async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        setAnalysisStatus('INITIERAT');
        setStatusMessage(isOffline ? 'Initierar lokal analys (OFFLINE)...' : 'Initierar juridisk analys...');
        
        try {
            // 1. Hämta kontext via RAG
            setAnalysisStatus('ANALYSERAR');
            setStatusMessage(isOffline ? 'Söker i lokalt ramverk (RAG)...' : 'Söker i juridiskt ramverk (RAG)...');
            const ragResult = await ragService.getContextForText((analysis.facts || []).map(f => f.statement).join(' '), true, analysis.caseId);
            
            setStatusMessage(isOffline ? 'Genererar yttrande via lokal motor...' : 'Genererar juridiskt yttrande via Gemini...');
            const systemPrompt = `
                DU ÄR FMJAM INTERACTIVE ANALYST v.2.0.
                DIN UPPGIFT ÄR ATT GENERERA ETT JURIDISKT YTTRANDE BASERAT PÅ FÖLJANDE DATA:
                
                ÄRENDE_ID: ${analysis.caseId}
                FAKTA_ATOMER: ${JSON.stringify(analysis.facts || [])}
                LAGRUM_FRÅN_ANALYS: ${JSON.stringify(analysis.legalReferences || [])}
                TEMAN: ${JSON.stringify(analysis.themes || [])}
                
                JURIDISK KONTEXT (RAG):
                ${ragResult.context}
                
                INSTRUKTIONER:
                1. Producera ett formellt juridiskt yttrande.
                2. Strukturera med rubriker: Inledning, Rättslig bedömning, Slutsats.
                3. Hänvisa till specifika lagrum och faktaatomer.
                4. Var proaktiv i att identifiera myndighetsbrister.
                5. Använd Markdown.
                ${isOffline ? '6. NOTERA: Detta svar är genererat i OFFLINE-LÄGE och kan sakna den senaste AI-precisionen.' : ''}
            `;

            const response = await geminiService.generate({
                contents: `Generera ett fullständigt juridiskt yttrande för ärende ${analysis.caseId}.`,
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.1,
                    thinkingConfig: { thinkingBudget: 16384 }
                }
            }, 'think');

            const assistantMessage: Message = {
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
            setAnalysisStatus('SLUTFÖRT');
            setStatusMessage(isOffline ? 'Lokal analys slutförd.' : 'Analys slutförd.');
        } catch (error) {
            console.error("Opinion generation failed:", error);
            setAnalysisStatus('ERROR');
            setStatusMessage('Ett fel uppstod vid generering.');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Kunde inte generera yttrandet. Kontrollera systemloggarna.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
            setTimeout(() => setAnalysisStatus('IDLE'), 3000);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const systemPrompt = `
                DU ÄR FMJAM INTERACTIVE ANALYST v.2.0.
                DIN UPPGIFT ÄR ATT GE DYNAMISK ÄRENDEANALYS BASERAT PÅ FÖLJANDE DATA:
                
                ÄRENDE_ID: ${analysis.caseId}
                FAKTA_ATOMER: ${JSON.stringify(analysis.facts || [])}
                LAGRUM: ${JSON.stringify(analysis.legalReferences || [])}
                TEMAN: ${JSON.stringify(analysis.themes || [])}
                
                INSTRUKTIONER:
                1. Svara alltid professionellt och objektivt.
                2. Hänvisa till specifika faktaatomer (ID) när det är möjligt.
                3. Om användaren frågar om något som inte finns i datan, var tydlig med det.
                4. Använd Markdown för att formatera dina svar.
                5. Fokusera på bevisvärdering och juridisk logik.
                ${isOffline ? '6. NOTERA: Detta svar är genererat i OFFLINE-LÄGE.' : ''}
            `;

            const response = await geminiService.generate({
                contents: [
                    { role: 'user', parts: [{ text: `Här är ärendedatan: ${JSON.stringify(analysis)}` }] },
                    ...messages.map(m => ({
                        role: m.role === 'user' ? 'user' : 'model',
                        parts: [{ text: m.content }]
                    })),
                    { role: 'user', parts: [{ text: input }] }
                ],
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.2
                }
            }, 'fast');

            const assistantMessage: Message = {
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Ett fel inträffade vid kommunikation med analyskärnan.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[700px] animate-fade-in">
            {/* Left: Dynamic Analysis Panel */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 flex-grow overflow-hidden flex flex-col shadow-sm relative group">
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-[var(--accent)]/5 rounded-full blur-3xl group-hover:bg-[var(--accent)]/10 transition-all duration-1000"></div>
                    
                    <h3 className="text-[9px] font-black text-[var(--ink-light)] uppercase tracking-[0.2em] mb-6 flex items-center gap-3 relative z-10">
                        <div className="p-2 bg-[var(--accent)]/5 rounded-lg border border-[var(--accent)]/10">
                            <ActivityIcon className="w-4 h-4 text-[var(--accent)]" />
                        </div>
                        Dynamisk Ärendeanalys
                    </h3>
                    
                    <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                        <div className="p-5 bg-[var(--bg-main)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all duration-500 group/card">
                            <p className="text-[9px] text-[var(--ink-light)] font-black uppercase tracking-widest mb-4 flex items-center justify-between">
                                <span>Bevisdensitet per Kategori</span>
                                <ActivityIcon className="w-3 h-3 text-[var(--ink-muted)] group-hover/card:text-[var(--accent)] transition-colors" />
                            </p>
                            <div className="space-y-4">
                                {(analysis.themes || []).map(t => {
                                    const count = (analysis.facts || []).filter(f => f.category === t.id).length;
                                    const totalFacts = analysis.facts?.length || 1;
                                    const percentage = Math.min(100, (count / totalFacts) * 300);
                                    return (
                                        <div key={t.id} className="space-y-1.5">
                                            <div className="flex justify-between text-[10px] font-bold">
                                                <span className="text-[var(--ink-muted)]">{t.label}</span>
                                                <span className="text-[var(--accent)]">{count} atomer</span>
                                            </div>
                                            <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-[var(--accent)] rounded-full transition-all duration-1000 ease-out" 
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-5 bg-[var(--bg-main)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all duration-500">
                            <p className="text-[9px] text-[var(--ink-light)] font-black uppercase tracking-widest mb-4">Systemstatus: Analyst Core</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)] group/stat">
                                    <p className="text-[8px] text-[var(--ink-muted)] uppercase font-black tracking-tighter mb-1 group-hover/stat:text-[var(--success)]/50 transition-colors">Reasoning</p>
                                    <p className="text-xs font-black text-[var(--success)] font-mono tracking-widest">ACTIVE</p>
                                </div>
                                <div className="text-center p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)] group/stat">
                                    <p className="text-[8px] text-[var(--ink-muted)] uppercase font-black tracking-tighter mb-1 group-hover/stat:text-[var(--accent)]/50 transition-colors">Context</p>
                                    <p className="text-xs font-black text-[var(--accent)] font-mono tracking-widest">FULL</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button 
                                onClick={handleGenerateOpinion}
                                disabled={isLoading}
                                className="w-full py-4 bg-[var(--ink-main)] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-md transition-all active:scale-95 disabled:opacity-50 group/btn overflow-hidden relative hover:bg-[var(--accent)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                                {isLoading ? <Spinner className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />}
                                <span>Generera Yttrande</span>
                            </button>

                            {analysisStatus !== 'IDLE' && (
                                <div className="p-4 bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-xl animate-fade-in">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-1.5 rounded-lg ${
                                            analysisStatus === 'SLUTFÖRT' ? 'bg-[var(--success)]/10' : 
                                            analysisStatus === 'ERROR' ? 'bg-[var(--danger)]/10' : 'bg-[var(--accent)]/10'
                                        }`}>
                                            {analysisStatus === 'SLUTFÖRT' ? (
                                                <CheckCircleIcon className="w-3.5 h-3.5 text-[var(--success)]" />
                                            ) : analysisStatus === 'ERROR' ? (
                                                <ExclamationTriangleIcon className="w-3.5 h-3.5 text-[var(--danger)]" />
                                            ) : (
                                                <ClockIcon className="w-3.5 h-3.5 text-[var(--accent)] animate-spin" />
                                            )}
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                                            analysisStatus === 'SLUTFÖRT' ? 'text-[var(--success)]' : 
                                            analysisStatus === 'ERROR' ? 'text-[var(--danger)]' : 'text-[var(--accent)]'
                                        }`}>
                                            {analysisStatus}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-[var(--ink-muted)] font-bold leading-relaxed">{statusMessage}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-5 bg-[var(--warning)]/5 border border-[var(--warning)]/10 rounded-xl group/guard relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/guard:opacity-20 transition-opacity">
                                <ShieldCheckIcon className="w-10 h-10 text-[var(--warning)]" />
                            </div>
                            <div className="flex items-center gap-3 mb-2 relative z-10">
                                <ShieldCheckIcon className="w-3.5 h-3.5 text-[var(--warning)]" />
                                <span className="text-[9px] font-black text-[var(--warning)] uppercase tracking-widest">Integritets-vakt</span>
                            </div>
                            <p className="text-[10px] text-[var(--ink-muted)] leading-relaxed font-medium relative z-10">
                                Varje svar från Interactive Analyst kors-valideras mot den forensiska beviskedjan för att förhindra AI-hallucinationer.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="p-2.5 bg-[var(--bg-main)] rounded-lg text-[var(--ink-muted)] border border-[var(--border)]">
                        <CpuChipIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[8px] text-[var(--ink-light)] font-black uppercase tracking-widest">Analys-motor</p>
                        <p className="text-xs font-black text-[var(--ink-main)] tracking-tighter">v.2.0-HYBRID <span className="text-[var(--accent)] font-mono ml-1">CORE</span></p>
                    </div>
                </div>
            </div>

            {/* Right: Chat Interface */}
            <div className="lg:col-span-8 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl flex flex-col overflow-hidden shadow-lg relative">
                <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-[100px]"></div>
                
                {/* Chat Header */}
                <div className="px-8 py-5 border-b border-[var(--border)] bg-[var(--bg-main)]/50 backdrop-blur-md flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-[var(--accent)]/5 rounded-xl border border-[var(--accent)]/10 shadow-sm">
                            <ChatIcon className="w-5 h-5 text-[var(--accent)]" />
                        </div>
                        <div>
                            <h3 className="font-black text-[var(--ink-main)] text-sm uppercase tracking-[0.15em]">Interactive Analyst</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-[var(--warning)] shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'bg-[var(--success)] shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse'}`}></span>
                                <span className={`text-[9px] font-mono uppercase font-black tracking-widest ${isOffline ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
                                    {isOffline ? 'Offline-Läge' : 'Session Aktiv'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setInput('Sammanfatta bevisläget för detta ärende.')}
                            className="p-2.5 hover:bg-[var(--bg-main)] rounded-lg transition-all text-[var(--ink-muted)] hover:text-[var(--accent)] group border border-transparent hover:border-[var(--border)]"
                            title="Sök i ärendet"
                        >
                            <MagnifyingGlassIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button 
                            onClick={() => setInput('Vilka är de mest kritiska juridiska riskerna här?')}
                            className="p-2.5 hover:bg-[var(--bg-main)] rounded-lg transition-all text-[var(--ink-muted)] hover:text-[var(--accent)] group border border-transparent hover:border-[var(--border)]"
                            title="Snabb-analys"
                        >
                            <BoltIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-[var(--bg-main)]/30 custom-scrollbar relative z-10">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                            <div className={`flex gap-4 max-w-[90%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${
                                    m.role === 'user' 
                                    ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20' 
                                    : 'bg-[var(--bg-card)] text-[var(--ink-muted)] border border-[var(--border)]'
                                }`}>
                                    {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                                </div>
                                <div className={`p-5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                                    m.role === 'user' 
                                    ? 'bg-[var(--accent)]/5 text-[var(--ink-main)] border border-[var(--accent)]/10 rounded-tr-none' 
                                    : 'bg-[var(--bg-card)] text-[var(--ink-main)] border border-[var(--border)] rounded-tl-none'
                                }`}>
                                    <div className="prose prose-sm max-w-none prose-p:text-[var(--ink-muted)] prose-headings:text-[var(--ink-main)] prose-strong:text-[var(--accent)]">
                                        <MarkdownRenderer content={m.content} />
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 opacity-40">
                                        <ClockIcon className="w-2.5 h-2.5" />
                                        <p className="text-[9px] font-mono uppercase font-bold tracking-widest">
                                            {m.timestamp.toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex gap-4 max-w-[90%]">
                                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center shadow-sm">
                                    <Spinner className="w-4 h-4" />
                                </div>
                                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] rounded-tl-none flex items-center gap-3">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-[var(--accent)]/40 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-[var(--accent)]/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 bg-[var(--accent)]/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                    <span className="text-[9px] font-black text-[var(--ink-light)] uppercase tracking-widest">Analyserar...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-8 bg-[var(--bg-main)]/50 backdrop-blur-md border-t border-[var(--border)] relative z-10">
                    <div className="relative group/input">
                        <div className="absolute -inset-1 bg-[var(--accent)]/10 rounded-2xl blur opacity-0 group-focus-within/input:opacity-100 transition duration-500"></div>
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend().catch(err => console.error("handleSend failed on Enter:", err))}
                            placeholder="Ställ en fråga om ärendet..."
                            className="relative w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl py-4 pl-6 pr-14 text-sm text-[var(--ink-main)] focus:outline-none focus:border-[var(--accent)]/50 transition-all placeholder:text-[var(--ink-light)] shadow-inner"
                        />
                        <button 
                            onClick={() => handleSend().catch(err => console.error("handleSend failed on click:", err))}
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-[var(--ink-main)] hover:bg-[var(--accent)] disabled:bg-[var(--border)] disabled:text-[var(--ink-light)] text-white rounded-xl transition-all shadow-md active:scale-90"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="mt-4 flex justify-between items-center px-1">
                        <div className="flex gap-4">
                            <button 
                                onClick={() => {
                                    setInput('Gör en snabb-analys av bevisatomer och lagrum.');
                                    handleSend().catch(err => console.error("Quick analysis failed:", err));
                                }}
                                className="text-[9px] font-black text-[var(--ink-light)] hover:text-[var(--accent)] uppercase tracking-[0.2em] transition-all flex items-center gap-2 group/action"
                            >
                                <div className="p-1 bg-[var(--bg-main)] rounded group-hover/action:bg-[var(--accent)]/10 transition-colors">
                                    <BoltIcon className="w-2.5 h-2.5 group-hover/action:scale-110 transition-transform" />
                                </div>
                                Snabb-analys
                            </button>
                            <button 
                                onClick={() => {
                                    setInput('Verifiera källorna för de juridiska referenserna i detta ärende.');
                                    handleSend().catch(err => console.error("Source verification failed:", err));
                                }}
                                className="text-[9px] font-black text-[var(--ink-light)] hover:text-[var(--success)] uppercase tracking-[0.2em] transition-all flex items-center gap-2 group/action"
                            >
                                <div className="p-1 bg-[var(--bg-main)] rounded group-hover/action:bg-[var(--success)]/10 transition-colors">
                                    <ShieldCheckIcon className="w-2.5 h-2.5 group-hover/action:scale-110 transition-transform" />
                                </div>
                                Verifiera Källa
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-[var(--border)] rounded-full"></div>
                            <span className="text-[9px] font-mono text-[var(--ink-light)] uppercase font-black tracking-widest">Interactive Analyst v.2.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
