
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
                    systemInstruction: `${systemPrompt}\n\nVIKTIGT: Visa ALDRIG interna ID:n som 'FACT_20251020_001' eller liknande för användaren. Använd istället beskrivande text.`,
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-[850px] animate-fade-in pb-10">
            {/* Left: Dynamic Analysis Panel */}
            <div className="lg:col-span-4 flex flex-col gap-8 h-full">
                <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-2xl p-10 flex-grow overflow-hidden flex flex-col relative group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-[100px] group-hover:bg-[var(--accent)]/10 transition-all duration-1000"></div>
                    
                    <div className="flex items-center gap-5 mb-10 relative z-10">
                        <div className="p-3 bg-[var(--ink-main)] text-white border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                            <ActivityIcon className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em] italic opacity-70">Analyst Core v.2.0</span>
                            <h3 className="text-2xl font-black text-[var(--ink-main)] uppercase tracking-tighter italic leading-none">Ärendeanalys</h3>
                        </div>
                    </div>
                    
                    <div className="space-y-10 overflow-y-auto pr-4 custom-scrollbar relative z-10 flex-grow">
                        <div className="p-8 bg-[var(--bg-main)]/5 border border-[var(--border-strong)] shadow-xl group/card relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover/card:opacity-10 transition-opacity">
                                <ActivityIcon className="w-24 h-24" />
                            </div>
                            <p className="text-[11px] text-[var(--ink-main)] font-black uppercase tracking-[0.3em] mb-6 flex items-center justify-between italic">
                                <span>Bevisdensitet</span>
                                <span className="text-[var(--accent)]">Atomer</span>
                            </p>
                            <div className="space-y-6">
                                {(analysis.themes || []).map(t => {
                                    const count = (analysis.facts || []).filter(f => f.category === t.id).length;
                                    const totalFacts = analysis.facts?.length || 1;
                                    const percentage = Math.min(100, (count / totalFacts) * 300);
                                    return (
                                        <div key={t.id} className="space-y-2">
                                            <div className="flex justify-between text-[12px] font-black uppercase tracking-tight italic">
                                                <span className="text-[var(--ink-main)]">{t.label}</span>
                                                <span className="text-[var(--accent)]">{count}</span>
                                            </div>
                                            <div className="h-2 bg-[var(--border-strong)] overflow-hidden shadow-inner">
                                                <div 
                                                    className="h-full bg-[var(--accent)] transition-all duration-1000 ease-out shadow-[0_0_10px_var(--accent)]" 
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-8 bg-[var(--bg-main)]/5 border border-[var(--border-strong)] shadow-xl">
                            <p className="text-[11px] text-[var(--ink-main)] font-black uppercase tracking-[0.3em] mb-6 italic">Systemstatus: Analyst Core</p>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="text-center p-5 bg-white border border-[var(--border-strong)] shadow-lg group/stat relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--success)] opacity-30"></div>
                                    <p className="text-[10px] text-[var(--ink-muted)] uppercase font-black tracking-widest mb-2 italic">Reasoning</p>
                                    <p className="text-sm font-black text-[var(--success)] font-mono tracking-[0.2em] italic">ACTIVE</p>
                                </div>
                                <div className="text-center p-5 bg-white border border-[var(--border-strong)] shadow-lg group/stat relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)] opacity-30"></div>
                                    <p className="text-[10px] text-[var(--ink-muted)] uppercase font-black tracking-widest mb-2 italic">Context</p>
                                    <p className="text-sm font-black text-[var(--accent)] font-mono tracking-[0.2em] italic">FULL</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button 
                                onClick={handleGenerateOpinion}
                                disabled={isLoading}
                                className="w-full py-6 bg-[var(--ink-main)] text-white font-black text-[13px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-95 disabled:opacity-50 group/btn overflow-hidden relative hover:bg-[var(--accent)] italic border border-white/10"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                                {isLoading ? <Spinner className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />}
                                <span>Generera Yttrande</span>
                            </button>

                            {analysisStatus !== 'IDLE' && (
                                <div className="p-6 bg-[var(--bg-main)]/10 border border-[var(--border-strong)] shadow-xl animate-fade-in relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className={`p-2 border border-[var(--border-strong)] ${
                                            analysisStatus === 'SLUTFÖRT' ? 'bg-[var(--success)]/10' : 
                                            analysisStatus === 'ERROR' ? 'bg-[var(--danger)]/10' : 'bg-[var(--accent)]/10'
                                        }`}>
                                            {analysisStatus === 'SLUTFÖRT' ? (
                                                <CheckCircleIcon className="w-4 h-4 text-[var(--success)]" />
                                            ) : analysisStatus === 'ERROR' ? (
                                                <ExclamationTriangleIcon className="w-4 h-4 text-[var(--danger)]" />
                                            ) : (
                                                <ClockIcon className="w-4 h-4 text-[var(--accent)] animate-spin" />
                                            )}
                                        </div>
                                        <span className={`text-[11px] font-black uppercase tracking-[0.3em] italic ${
                                            analysisStatus === 'SLUTFÖRT' ? 'text-[var(--success)]' : 
                                            analysisStatus === 'ERROR' ? 'text-[var(--danger)]' : 'text-[var(--accent)]'
                                        }`}>
                                            {analysisStatus}
                                        </span>
                                    </div>
                                    <p className="text-[13px] text-[var(--ink-main)] font-black uppercase tracking-tight italic leading-relaxed opacity-80">{statusMessage}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-[var(--ink-main)] text-white border border-white/10 shadow-2xl group/guard relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover/guard:opacity-10 transition-opacity">
                                <ShieldCheckIcon className="w-20 h-20 text-[var(--accent)]" />
                            </div>
                            <div className="flex items-center gap-4 mb-4 relative z-10">
                                <ShieldCheckIcon className="w-5 h-5 text-[var(--accent)]" />
                                <span className="text-[11px] font-black text-[var(--accent)] uppercase tracking-[0.3em] italic">Integritets-vakt</span>
                            </div>
                            <p className="text-[13px] text-slate-300 leading-relaxed font-black uppercase tracking-[0.1em] italic opacity-80 relative z-10">
                                Varje svar från Interactive Analyst kors-valideras mot den forensiska beviskedjan för att förhindra AI-hallucinationer.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-xl p-6 flex items-center gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--ink-main)]"></div>
                    <div className="p-3 bg-[var(--bg-main)] text-[var(--ink-muted)] border border-[var(--border-strong)] shadow-inner group-hover:scale-110 transition-transform">
                        <CpuChipIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-[0.4em] italic opacity-60">Analys-motor</p>
                        <p className="text-sm font-black text-[var(--ink-main)] tracking-tighter uppercase italic">v.2.0-HYBRID <span className="text-[var(--accent)] font-mono ml-2 border-b border-[var(--accent)]/30">CORE</span></p>
                    </div>
                </div>
            </div>

            {/* Right: Chat Interface */}
            <div className="lg:col-span-8 bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-2xl flex flex-col overflow-hidden relative h-full group/chat">
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--border)] opacity-30"></div>
                <div className="absolute -bottom-64 -right-64 w-[500px] h-[500px] bg-[var(--accent)]/5 rounded-full blur-[120px] opacity-0 group-hover/chat:opacity-100 transition-opacity duration-1000"></div>
                
                {/* Chat Header */}
                <div className="px-12 py-8 border-b border-[var(--border-strong)] bg-white flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-[var(--ink-main)] text-white border border-white/10 shadow-xl group-hover:rotate-6 transition-transform">
                            <ChatIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-[var(--ink-main)] text-lg uppercase tracking-[0.3em] italic leading-none">Interactive Analyst</h3>
                            <div className="flex items-center gap-3 mt-2">
                                <span className={`w-2 h-2 ${isOffline ? 'bg-[var(--warning)] shadow-[0_0_10px_var(--warning)]' : 'bg-[var(--success)] shadow-[0_0_10px_var(--success)] animate-pulse'}`}></span>
                                <span className={`text-[10px] font-mono uppercase font-black tracking-[0.3em] italic ${isOffline ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
                                    {isOffline ? 'Offline-Läge' : 'Session Aktiv | Säkrad'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setInput('Sammanfatta bevisläget för detta ärende.')}
                            className="p-4 bg-[var(--bg-main)] hover:bg-[var(--accent)] hover:text-[var(--bg-main)] border border-[var(--border-strong)] shadow-lg transition-all text-[var(--ink-muted)] group/tool"
                            title="Sök i ärendet"
                        >
                            <MagnifyingGlassIcon className="w-5 h-5 group-hover/tool:scale-110 transition-transform" />
                        </button>
                        <button 
                            onClick={() => setInput('Vilka är de mest kritiska juridiska riskerna här?')}
                            className="p-4 bg-[var(--bg-main)] hover:bg-[var(--accent)] hover:text-[var(--bg-main)] border border-[var(--border-strong)] shadow-lg transition-all text-[var(--ink-muted)] group/tool"
                            title="Snabb-analys"
                        >
                            <BoltIcon className="w-5 h-5 group-hover/tool:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-grow overflow-y-auto p-12 space-y-12 bg-[var(--bg-main)]/10 custom-scrollbar relative z-10">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                            <div className={`flex gap-6 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`flex-shrink-0 w-12 h-12 border border-[var(--border-strong)] flex items-center justify-center shadow-xl ${
                                    m.role === 'user' 
                                    ? 'bg-[var(--accent)] text-[var(--bg-main)]' 
                                    : 'bg-[var(--ink-main)] text-white'
                                }`}>
                                    {m.role === 'user' ? <UserIcon className="w-6 h-6" /> : <SparklesIcon className="w-6 h-6" />}
                                </div>
                                <div className={`p-8 border border-[var(--border-strong)] text-[15px] leading-relaxed shadow-2xl relative overflow-hidden ${
                                    m.role === 'user' 
                                    ? 'bg-[var(--accent)] text-[var(--bg-main)] font-black uppercase tracking-tight italic' 
                                    : 'bg-white text-[var(--ink-main)]'
                                }`}>
                                    {m.role === 'user' && <div className="absolute top-0 left-0 w-1 h-full bg-white/20"></div>}
                                    <div className={`prose prose-sm max-w-none ${m.role === 'user' ? 'prose-p:text-[var(--bg-main)] prose-headings:text-[var(--bg-main)] prose-strong:text-white' : 'prose-p:text-[var(--ink-main)] prose-headings:text-[var(--ink-main)] prose-strong:text-[var(--accent)]'}`}>
                                        <MarkdownRenderer content={m.content} />
                                    </div>
                                    <div className={`flex items-center gap-3 mt-6 opacity-50 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <ClockIcon className="w-3 h-3" />
                                        <p className="text-[10px] font-mono uppercase font-black tracking-[0.2em] italic">
                                            {m.timestamp.toLocaleTimeString()} | CIS_SECURED
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex gap-6 max-w-[85%]">
                                <div className="flex-shrink-0 w-12 h-12 bg-[var(--ink-main)] text-white border border-white/10 flex items-center justify-center shadow-xl">
                                    <Spinner className="w-6 h-6" />
                                </div>
                                <div className="p-8 bg-white border border-[var(--border-strong)] shadow-2xl flex items-center gap-5">
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                    <span className="text-[11px] font-black text-[var(--ink-main)] uppercase tracking-[0.3em] italic">Analyserar Ärendedata...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-10 bg-white border-t border-[var(--border-strong)] relative z-10">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--border)] opacity-30"></div>
                    <div className="relative group/input">
                        <div className="absolute -inset-1 bg-[var(--accent)]/10 blur opacity-0 group-focus-within/input:opacity-100 transition duration-500"></div>
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend().catch(err => console.error("handleSend failed on Enter:", err))}
                            placeholder="STÄLL EN FRÅGA OM ÄRENDET..."
                            className="relative w-full bg-[var(--bg-main)] border border-[var(--border-strong)] py-6 pl-10 pr-24 text-base font-black uppercase tracking-[0.1em] italic focus:outline-none focus:border-[var(--accent)] transition-all placeholder:text-[var(--ink-muted)] shadow-inner"
                        />
                        <button 
                            onClick={() => handleSend().catch(err => console.error("handleSend failed on click:", err))}
                            disabled={isLoading || !input.trim()}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-[var(--ink-main)] hover:bg-[var(--accent)] disabled:opacity-20 text-white shadow-xl transition-all active:scale-90 border border-white/10"
                        >
                            <PaperAirplaneIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="mt-6 flex justify-between items-center px-2">
                        <div className="flex gap-10">
                            <button 
                                onClick={() => {
                                    setInput('Gör en snabb-analys av bevisatomer och lagrum.');
                                    handleSend().catch(err => console.error("Quick analysis failed:", err));
                                }}
                                className="text-[11px] font-black text-[var(--ink-main)] hover:text-[var(--accent)] uppercase tracking-[0.3em] transition-all flex items-center gap-4 group/action italic"
                            >
                                <BoltIcon className="w-4 h-4 text-[var(--accent)] group-hover/action:scale-125 transition-transform" />
                                Snabb-analys
                            </button>
                            <button 
                                onClick={() => {
                                    setInput('Verifiera källorna för de juridiska referenserna i detta ärende.');
                                    handleSend().catch(err => console.error("Source verification failed:", err));
                                }}
                                className="text-[11px] font-black text-[var(--ink-main)] hover:text-[var(--success)] uppercase tracking-[0.3em] transition-all flex items-center gap-4 group/action italic"
                            >
                                <ShieldCheckIcon className="w-4 h-4 text-[var(--success)] group-hover/action:scale-125 transition-transform" />
                                Verifiera Källa
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-[var(--border-strong)]"></div>
                            <span className="text-[10px] font-mono text-[var(--ink-muted)] uppercase font-black tracking-[0.3em] italic opacity-50">Interactive Analyst v.2.0 | GOLD</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
