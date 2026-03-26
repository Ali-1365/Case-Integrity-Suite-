
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-[800px] animate-in fade-in duration-700">
            {/* Left: Dynamic Analysis Panel */}
            <div className="lg:col-span-4 flex flex-col gap-8">
                <div className="bg-[#161616]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex-grow overflow-hidden flex flex-col shadow-2xl shadow-black/40 relative group">
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-1000"></div>
                    
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3 relative z-10">
                        <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                            <ActivityIcon className="w-4 h-4 text-cyan-400" />
                        </div>
                        Dynamisk Ärendeanalys
                    </h3>
                    
                    <div className="space-y-8 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                        <div className="p-6 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-500 group/card">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-5 flex items-center justify-between">
                                <span>Bevisdensitet per Kategori</span>
                                <ActivityIcon className="w-3 h-3 text-gray-700 group-hover/card:text-cyan-500 transition-colors" />
                            </p>
                            <div className="space-y-5">
                                {(analysis.themes || []).map(t => {
                                    const count = (analysis.facts || []).filter(f => f.category === t.id).length;
                                    const totalFacts = analysis.facts?.length || 1;
                                    const percentage = Math.min(100, (count / totalFacts) * 300);
                                    return (
                                        <div key={t.id} className="space-y-2">
                                            <div className="flex justify-between text-[11px] font-bold">
                                                <span className="text-gray-400">{t.label}</span>
                                                <span className="text-cyan-400">{count} atomer</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-900/50 rounded-full overflow-hidden p-[1px]">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all duration-1000 ease-out" 
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-6 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-500">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-5">Systemstatus: Analyst Core</p>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="text-center p-4 bg-black/60 rounded-xl border border-white/5 group/stat">
                                    <p className="text-[9px] text-gray-600 uppercase font-black tracking-tighter mb-2 group-hover/stat:text-emerald-500/50 transition-colors">Reasoning</p>
                                    <p className="text-sm font-black text-emerald-500 font-mono tracking-widest">ACTIVE</p>
                                </div>
                                <div className="text-center p-4 bg-black/60 rounded-xl border border-white/5 group/stat">
                                    <p className="text-[9px] text-gray-600 uppercase font-black tracking-tighter mb-2 group-hover/stat:text-cyan-500/50 transition-colors">Context</p>
                                    <p className="text-sm font-black text-cyan-400 font-mono tracking-widest">FULL</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button 
                                onClick={handleGenerateOpinion}
                                disabled={isLoading}
                                className="w-full py-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 group/btn overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                                {isLoading ? <Spinner className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />}
                                <span>Generera Yttrande</span>
                            </button>

                            {analysisStatus !== 'IDLE' && (
                                <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className={`p-2 rounded-lg ${
                                            analysisStatus === 'SLUTFÖRT' ? 'bg-emerald-500/10' : 
                                            analysisStatus === 'ERROR' ? 'bg-rose-500/10' : 'bg-blue-500/10'
                                        }`}>
                                            {analysisStatus === 'SLUTFÖRT' ? (
                                                <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                                            ) : analysisStatus === 'ERROR' ? (
                                                <ExclamationTriangleIcon className="w-4 h-4 text-rose-400" />
                                            ) : (
                                                <ClockIcon className="w-4 h-4 text-blue-400 animate-spin" />
                                            )}
                                        </div>
                                        <span className={`text-[11px] font-black uppercase tracking-widest ${
                                            analysisStatus === 'SLUTFÖRT' ? 'text-emerald-400' : 
                                            analysisStatus === 'ERROR' ? 'text-rose-400' : 'text-blue-400'
                                        }`}>
                                            {analysisStatus}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-bold leading-relaxed">{statusMessage}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl group/guard relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/guard:opacity-20 transition-opacity">
                                <ShieldCheckIcon className="w-12 h-12 text-amber-500" />
                            </div>
                            <div className="flex items-center gap-3 mb-3 relative z-10">
                                <ShieldCheckIcon className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Integritets-vakt</span>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed font-medium relative z-10">
                                Varje svar från Interactive Analyst kors-valideras mot den forensiska beviskedjan för att förhindra AI-hallucinationer.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#111111]/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex items-center gap-5 shadow-xl">
                    <div className="p-3 bg-gray-900/80 rounded-xl text-gray-400 border border-white/5">
                        <CpuChipIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Analys-motor</p>
                        <p className="text-sm font-black text-white tracking-tighter">v.2.0-HYBRID <span className="text-cyan-500 font-mono ml-1">CORE</span></p>
                    </div>
                </div>
            </div>

            {/* Right: Chat Interface */}
            <div className="lg:col-span-8 bg-[#161616]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] relative">
                <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px]"></div>
                
                {/* Chat Header */}
                <div className="px-10 py-7 border-b border-white/5 bg-[#111111]/40 backdrop-blur-md flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
                            <ChatIcon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-100 text-base uppercase tracking-[0.15em]">Interactive Analyst</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse'}`}></span>
                                <span className={`text-[10px] font-mono uppercase font-black tracking-widest ${isOffline ? 'text-orange-500' : 'text-emerald-500'}`}>
                                    {isOffline ? 'Offline-Läge' : 'Session Aktiv'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setInput('Sammanfatta bevisläget för detta ärende.')}
                            className="p-3 hover:bg-white/10 rounded-xl transition-all text-gray-500 hover:text-white group"
                            title="Sök i ärendet"
                        >
                            <MagnifyingGlassIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                        <button 
                            onClick={() => setInput('Vilka är de mest kritiska juridiska riskerna här?')}
                            className="p-3 hover:bg-white/10 rounded-xl transition-all text-gray-500 hover:text-white group"
                            title="Snabb-analys"
                        >
                            <BoltIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-grow overflow-y-auto p-10 space-y-10 bg-[#0a0a0a]/40 custom-scrollbar relative z-10">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
                            <div className={`flex gap-6 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                                    m.role === 'user' 
                                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-indigo-500/10' 
                                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-cyan-500/10'
                                }`}>
                                    {m.role === 'user' ? <UserIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                                </div>
                                <div className={`p-6 rounded-[2rem] text-[14px] leading-relaxed shadow-xl ${
                                    m.role === 'user' 
                                    ? 'bg-gradient-to-br from-indigo-600/20 to-violet-600/10 text-gray-100 border border-indigo-500/30 rounded-tr-none' 
                                    : 'bg-[#161616]/90 text-gray-200 border border-white/5 rounded-tl-none'
                                }`}>
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <MarkdownRenderer content={m.content} />
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 opacity-40 group">
                                        <ClockIcon className="w-3 h-3" />
                                        <p className="text-[10px] font-mono uppercase font-bold tracking-widest">
                                            {m.timestamp.toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex gap-6 max-w-[85%]">
                                <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                                    <Spinner className="w-5 h-5" />
                                </div>
                                <div className="p-6 rounded-[2rem] bg-[#161616]/90 border border-white/5 rounded-tl-none flex items-center gap-3">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 bg-cyan-500/40 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-cyan-500/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 bg-cyan-500/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Analyserar...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-10 bg-[#111111]/60 backdrop-blur-md border-t border-white/5 relative z-10">
                    <div className="relative group/input">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-focus-within/input:opacity-100 transition duration-500"></div>
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend().catch(err => console.error("handleSend failed on Enter:", err))}
                            placeholder="Ställ en fråga om ärendet..."
                            className="relative w-full bg-black/60 border border-white/10 rounded-2xl py-5 pl-8 pr-16 text-sm text-gray-100 focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-600 shadow-inner"
                        />
                        <button 
                            onClick={() => handleSend().catch(err => console.error("handleSend failed on click:", err))}
                            disabled={isLoading || !input.trim()}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-800 disabled:to-gray-900 disabled:text-gray-600 text-white rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-90"
                        >
                            <PaperAirplaneIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="mt-5 flex justify-between items-center px-2">
                        <div className="flex gap-6">
                            <button 
                                onClick={() => {
                                    setInput('Gör en snabb-analys av bevisatomer och lagrum.');
                                    handleSend().catch(err => console.error("Quick analysis failed:", err));
                                }}
                                className="text-[10px] font-black text-gray-600 hover:text-cyan-400 uppercase tracking-[0.2em] transition-all flex items-center gap-2 group/action"
                            >
                                <div className="p-1 bg-gray-900 rounded group-hover/action:bg-cyan-500/10 transition-colors">
                                    <BoltIcon className="w-3 h-3 group-hover/action:scale-110 transition-transform" />
                                </div>
                                Snabb-analys
                            </button>
                            <button 
                                onClick={() => {
                                    setInput('Verifiera källorna för de juridiska referenserna i detta ärende.');
                                    handleSend().catch(err => console.error("Source verification failed:", err));
                                }}
                                className="text-[10px] font-black text-gray-600 hover:text-emerald-400 uppercase tracking-[0.2em] transition-all flex items-center gap-2 group/action"
                            >
                                <div className="p-1 bg-gray-900 rounded group-hover/action:bg-emerald-500/10 transition-colors">
                                    <ShieldCheckIcon className="w-3 h-3 group-hover/action:scale-110 transition-transform" />
                                </div>
                                Verifiera Källa
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                            <span className="text-[10px] font-mono text-gray-700 uppercase font-black tracking-widest">Interactive Analyst v.2.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
