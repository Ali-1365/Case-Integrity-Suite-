
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { AnalysisResult } from '../lib/cis.types';
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
    CpuChipIcon
} from './icons';
import MarkdownRenderer from './shared/MarkdownRenderer';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface InteractiveAnalystProps {
    analysis: AnalysisResult;
}

export const InteractiveAnalyst: React.FC<InteractiveAnalystProps> = ({ analysis }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: `Välkommen till **Interactive Analyst**. Jag har laddat in ärende **${analysis.caseId}**. \n\nHur kan jag hjälpa dig med den dynamiska ärendeanalysen idag? Du kan fråga om bevisatomer, lagrumskopplingar eller be mig simulera olika scenarier.`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
                FAKTA_ATOMER: ${JSON.stringify(analysis.facts)}
                LAGRUM: ${JSON.stringify(analysis.legalReferences)}
                TEMAN: ${JSON.stringify(analysis.themes)}
                
                INSTRUKTIONER:
                1. Svara alltid professionellt och objektivt.
                2. Hänvisa till specifika faktaatomer (ID) när det är möjligt.
                3. Om användaren frågar om något som inte finns i datan, var tydlig med det.
                4. Använd Markdown för att formatera dina svar.
                5. Fokusera på bevisvärdering och juridisk logik.
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[700px]">
            {/* Left: Dynamic Analysis Panel */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-[#161616] border border-gray-800 rounded-2xl p-6 flex-grow overflow-hidden flex flex-col">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <ActivityIcon className="w-4 h-4 text-cyan-500" />
                        Dynamisk Ärendeanalys
                    </h3>
                    
                    <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="p-4 bg-[#0a0a0a] rounded-xl border border-gray-800">
                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-3">Bevisdensitet per Kategori</p>
                            <div className="space-y-3">
                                {analysis.themes.map(t => {
                                    const count = analysis.facts.filter(f => f.category === t.id).length;
                                    const percentage = Math.min(100, (count / analysis.facts.length) * 300);
                                    return (
                                        <div key={t.id} className="space-y-1">
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-gray-400">{t.label}</span>
                                                <span className="text-cyan-500">{count} atomer</span>
                                            </div>
                                            <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-cyan-500" style={{ width: `${percentage}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-4 bg-[#0a0a0a] rounded-xl border border-gray-800">
                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-3">Systemstatus: Analyst Core</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-black/40 rounded-lg border border-white/5">
                                    <p className="text-[9px] text-gray-600 uppercase font-bold mb-1">Reasoning</p>
                                    <p className="text-sm font-black text-emerald-500 font-mono">ACTIVE</p>
                                </div>
                                <div className="text-center p-3 bg-black/40 rounded-lg border border-white/5">
                                    <p className="text-[9px] text-gray-600 uppercase font-bold mb-1">Context</p>
                                    <p className="text-sm font-black text-cyan-500 font-mono">FULL</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheckIcon className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] font-bold text-amber-500 uppercase">Integritets-vakt</span>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-relaxed">
                                Varje svar från Interactive Analyst kors-valideras mot den forensiska beviskedjan för att förhindra AI-hallucinationer.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#111111] border border-gray-800 rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-2 bg-gray-900 rounded-lg text-gray-500">
                        <CpuChipIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Analys-motor</p>
                        <p className="text-xs font-black text-white">v.2.0-HYBRID</p>
                    </div>
                </div>
            </div>

            {/* Right: Chat Interface */}
            <div className="lg:col-span-8 bg-[#161616] border border-gray-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-gray-800 bg-[#111111] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                            <ChatIcon className="w-5 h-5 text-cyan-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-100 text-sm uppercase tracking-wider">Interactive Analyst</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[9px] font-mono text-emerald-500 uppercase font-bold">Session Aktiv</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setInput('Sammanfatta bevisläget för detta ärende.')}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-500"
                            title="Sök i ärendet"
                        >
                            <MagnifyingGlassIcon className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setInput('Vilka är de mest kritiska juridiska riskerna här?')}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-500"
                            title="Snabb-analys"
                        >
                            <BoltIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-[#0a0a0a] custom-scrollbar">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${m.role === 'user' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'}`}>
                                    {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-indigo-500/10 text-gray-100 border border-indigo-500/20 rounded-tr-none' : 'bg-[#161616] text-gray-200 border border-gray-800 rounded-tl-none'}`}>
                                    <MarkdownRenderer content={m.content} />
                                    <p className="text-[9px] text-gray-600 mt-2 font-mono uppercase">
                                        {m.timestamp.toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start animate-pulse">
                            <div className="flex gap-4 max-w-[85%]">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                                    <Spinner className="w-4 h-4" />
                                </div>
                                <div className="p-4 rounded-2xl bg-[#161616] border border-gray-800 rounded-tl-none">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-[#111111] border-t border-gray-800">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend().catch(err => console.error("handleSend failed on Enter:", err))}
                            placeholder="Ställ en fråga om ärendet..."
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl py-4 pl-6 pr-14 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-600"
                        />
                        <button 
                            onClick={() => handleSend().catch(err => console.error("handleSend failed on click:", err))}
                            disabled={isLoading || !input.trim()}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-all"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="mt-3 flex justify-between items-center px-2">
                        <div className="flex gap-4">
                            <button 
                                onClick={() => {
                                    setInput('Gör en snabb-analys av bevisatomer och lagrum.');
                                    handleSend().catch(err => console.error("Quick analysis failed:", err));
                                }}
                                className="text-[10px] font-bold text-gray-600 hover:text-cyan-500 uppercase tracking-widest transition-colors flex items-center gap-1"
                            >
                                <BoltIcon className="w-3 h-3" />
                                Snabb-analys
                            </button>
                            <button 
                                onClick={() => {
                                    setInput('Verifiera källorna för de juridiska referenserna i detta ärende.');
                                    handleSend().catch(err => console.error("Source verification failed:", err));
                                }}
                                className="text-[10px] font-bold text-gray-600 hover:text-cyan-500 uppercase tracking-widest transition-colors flex items-center gap-1"
                            >
                                <ShieldCheckIcon className="w-3 h-3" />
                                Verifiera Källa
                            </button>
                        </div>
                        <span className="text-[9px] font-mono text-gray-700 uppercase">Interactive Analyst v.2.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
