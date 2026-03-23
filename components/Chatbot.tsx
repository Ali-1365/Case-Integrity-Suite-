
import React, { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon, 
  XMarkIcon, 
  Spinner, 
  UserIcon, 
  SparklesIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  BoltIcon,
  CpuChipIcon,
  LawIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ActivityIcon,
  CheckCircleIcon
} from './icons';
import { RagService, RagResult } from '../lib/ragService';
import { ReasoningResult, DecisionSupportResult } from '../lib/cis.types';
import { AnalysisResult } from '../lib/cis.types';
import { geminiService } from '../services/geminiService';
import ProvenanceViewer from './ProvenanceViewer';
import LegalReasoningViewer from './LegalReasoningViewer';
import DecisionSupportViewer from './DecisionSupportViewer';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  ragService: RagService | null;
  currentAnalysis: AnalysisResult | null;
}

type Message = {
  role: 'user' | 'model';
  text: string;
  queryId?: string;
  reasoning?: ReasoningResult;
  decisionSupport?: DecisionSupportResult;
};

const SafeChatText: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(\[ARKIV: [^\]]+\]|⚡TOTAL|🎯SNIPER|💀DESTROY|🌊FLOOD|🚀ESKALERA|⚖️MEGAINLAGA|📂BEVISPAKET|📊ANALYS|🧾EXPORT|🎪FULLATTACK)/g);
    
    return (
        <div className="text-sm whitespace-pre-wrap leading-relaxed font-sans">
            {parts.map((part, i) => {
                if (part.startsWith('[ARKIV:')) {
                    return <span key={i} className="text-cyan-400 font-mono font-bold bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/50 text-[10px] mx-1">{part}</span>;
                }
                if (['⚡TOTAL', '🎯SNIPER', '💀DESTROY', '🌊FLOOD', '🚀ESKALERA', '🎪FULLATTACK'].includes(part)) {
                    return <span key={i} className="text-red-500 font-black italic tracking-tighter bg-red-950/20 px-2 py-0.5 rounded border border-red-900/30 mx-1">{part}</span>;
                }
                if (['⚖️MEGAINLAGA', '📂BEVISPAKET', '📊ANALYS', '🧾EXPORT'].includes(part)) {
                    return <span key={i} className="text-purple-400 font-black tracking-widest bg-purple-950/20 px-2 py-0.5 rounded border border-purple-900/30 mx-1">{part}</span>;
                }
                return part;
            })}
        </div>
    );
};

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, ragService, currentAnalysis }) => {
  const [messages, setMessages] = useState<Message[]>([
      {
          role: 'model',
          text: 'SYSTEMSTATUS: AKTIVERAD - HÖGSTA NIVÅ GLOBAL JURIDISK AI v2.2-DECISION_READY.\n\nMission: Generera beslutsstöd med 100% källspårbarhet.\nRedo för AUTOMATISERAT BESLUTSSTÖD.'
      }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeQueryId, setActiveQueryId] = useState<string | null>(null);
  const [activeReasoning, setActiveReasoning] = useState<ReasoningResult | null>(null);
  const [activeDecision, setActiveDecision] = useState<DecisionSupportResult | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (forcedPrompt?: string) => {
    const queryText = forcedPrompt || input;
    if (!queryText.trim() || isLoading || !ragService) return;

    const newMessages: Message[] = [...messages, { role: 'user', text: queryText }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const ragRes: RagResult = await ragService.getContextForText(queryText, true);
      
      const analysisData = currentAnalysis ? JSON.stringify({
          caseId: currentAnalysis.caseId,
          facts: currentAnalysis.facts.map(f => f.statement),
          laws: currentAnalysis.legalReferences.map(l => l.rawText)
      }) : "Ingen aktiv analys.";

      const systemInstruction = `
        DU ÄR GLOBAL JURIDISK AI-SYSTEM v2.2 - DECISION ENGINE.
        Använd Ground Truth för att svara.
        
        NYA STRIKTA REGLER:
        - LAGRUMSUPPDATERING: Du måste ALLTID tillämpa gällande rätt baserat på datumet för händelsen. Om du upptäcker att rådatan eller myndighetens beslut använder gamla eller felaktiga lagrum (t.ex. den gamla Socialtjänstlagen), SKA du upplysa om detta fel och istället tillämpa det korrekta, uppdaterade lagrummet i din analys.
        - BRISTANALYS: Du måste PROAKTIVT granska rådatan för att hitta fel som myndigheten kan ha begått. Detta omfattar att identifiera om de har missat att upprätta rapporter, ignorerat bevis eller förgått andra handläggningsfel. Du SKA tydligt påtala dessa brister i din analys.
        
        AKTUELL KONTEXT:
        ${analysisData}
        
        GROUND TRUTH KÄLLOR:
        ${ragRes.context}
      `;

      const response = await geminiService.generate({
        contents: queryText,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          temperature: 0.1,
          thinkingConfig: { thinkingBudget: 32768 }
        }
      }, 'think');

      setMessages([...newMessages, { 
        role: 'model', 
        text: response, 
        queryId: ragRes.queryId,
        reasoning: ragRes.reasoning,
        decisionSupport: ragRes.decisionSupport
      }]);
    } catch (e: unknown) {
      setMessages([...newMessages, { role: 'model', text: `OMEGA_CORE_FAILURE: Fel i beslutsstödsmodulen.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full w-full animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
        <div className="bg-white dark:bg-slate-900 rounded-t-[2rem] border-x border-t border-slate-200 dark:border-slate-800 p-8 relative overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <LawIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">Beslutsmotor</h3>
                        <div className="flex items-center space-x-1.5 mt-1.5">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">v2.2 Active</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
        </div>

        <div className="flex-1 bg-white dark:bg-slate-900 overflow-y-auto p-6 space-y-6 custom-scrollbar border-x border-slate-200 dark:border-slate-800 shadow-inner">
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''} animate-in fade-in duration-500`}>
                    {msg.role === 'model' && (
                        <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <CpuChipIcon className="h-4 w-4"/>
                        </div>
                    )}
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                        msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-200 dark:border-slate-700'
                    }`}>
                        <SafeChatText text={msg.text} />
                        
                        {(msg.queryId || msg.reasoning || msg.decisionSupport) && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {msg.decisionSupport && (
                                    <button 
                                        onClick={() => setActiveDecision(msg.decisionSupport!)}
                                        className="flex items-center space-x-1.5 text-[8px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 px-2 py-1 rounded border border-green-200 dark:border-green-800 transition-all"
                                    >
                                        <CheckCircleIcon className="h-2.5 w-2.5" />
                                        <span>Beslutsstöd</span>
                                    </button>
                                )}
                                {msg.reasoning && (
                                    <button 
                                        onClick={() => setActiveReasoning(msg.reasoning!)}
                                        className="flex items-center space-x-1.5 text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2 py-1 rounded border border-indigo-200 dark:border-indigo-800 transition-all"
                                    >
                                        <SparklesIcon className="h-2.5 w-2.5" />
                                        <span>Motivering</span>
                                    </button>
                                )}
                                {msg.queryId && (
                                    <button 
                                        onClick={() => setActiveQueryId(msg.queryId!)}
                                        className="flex items-center space-x-1.5 text-[8px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded border border-blue-200 dark:border-blue-800 transition-all"
                                    >
                                        <ShieldCheckIcon className="h-2.5 w-2.5" />
                                        <span>Bevis</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {isLoading && (
                 <div className="flex items-start gap-3 animate-pulse">
                    <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400"><Spinner className="h-4 w-4"/></div>
                    <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="flex space-x-1.5">
                            <div className="h-1 w-1 bg-blue-600 rounded-full animate-bounce"></div>
                            <div className="h-1 w-1 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            <div className="h-1 w-1 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-b-2xl p-6 border-x border-b border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="relative group">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend().catch(err => console.error('Chat send failed:', err))}
                    placeholder="Skriv ett meddelande..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    disabled={isLoading}
                />
                <button
                    onClick={() => handleSend().catch(err => console.error('Chat send failed:', err))}
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-lg transition-all"
                >
                    <PaperAirplaneIcon className="h-4 w-4" />
                </button>
            </div>
        </div>

        {activeQueryId && (
            <ProvenanceViewer 
                queryId={activeQueryId} 
                onClose={() => setActiveQueryId(null)} 
            />
        )}

        {activeReasoning && (
            <LegalReasoningViewer 
                reasoning={activeReasoning} 
                onClose={() => setActiveReasoning(null)} 
                onViewProvenance={(id) => {
                    setActiveReasoning(null);
                    setActiveQueryId(id);
                }}
            />
        )}

        {activeDecision && (
            <DecisionSupportViewer 
                result={activeDecision} 
                onClose={() => setActiveDecision(null)}
                onViewDetails={(type) => {
                    if(type === 'reasoning') setActiveReasoning(activeDecision.reasoning);
                    if(type === 'provenance') setActiveQueryId(activeDecision.machineReadable.queryId);
                    // De andra vyerna kan läggas till vid behov
                }}
            />
        )}
    </div>
  );
};

export default Chatbot;
