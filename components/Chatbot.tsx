
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
import { ReasoningResult } from '../lib/LegalReasoningService';
import { DecisionSupportResult } from '../lib/DecisionSupportService';
import { AnalysisResult } from '../lib/fmjam.types';
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
    } catch (e) {
      setMessages([...newMessages, { role: 'model', text: `OMEGA_CORE_FAILURE: Fel i beslutsstödsmodulen.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-full max-w-lg h-[80vh] max-h-[850px] z-[200] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
        <div className="bg-gray-950 rounded-t-[2.5rem] border-x border-t border-red-900/30 shadow-[0_-20px_50px_rgba(239,68,68,0.2)] p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-purple-600 to-red-600 animate-pulse"></div>
            <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center space-x-5">
                    <div className="p-4 bg-red-600/10 rounded-2xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                        <LawIcon className="h-8 w-8 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">v2.2 DECISION ENGINE</h3>
                        <div className="flex items-center space-x-2 mt-2">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                            <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.4em]">Auth Level: Decision Support</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-3 text-gray-500 hover:text-white transition-all bg-white/5 rounded-2xl border border-gray-800">
                    <XMarkIcon className="h-8 w-8" />
                </button>
            </div>
        </div>

        <div className="flex-1 bg-gray-950/98 backdrop-blur-3xl overflow-y-auto p-8 space-y-8 custom-scrollbar border-x border-gray-900 shadow-inner">
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-5 ${msg.role === 'user' ? 'justify-end' : ''} animate-in fade-in duration-500`}>
                    {msg.role === 'model' && (
                        <div className="flex-shrink-0 h-12 w-12 rounded-2xl bg-gray-900 border border-red-500/20 flex items-center justify-center text-red-500 shadow-2xl">
                            <CpuChipIcon className="h-6 w-6"/>
                        </div>
                    )}
                    <div className={`max-w-[88%] px-6 py-5 rounded-[2rem] shadow-2xl relative border ${
                        msg.role === 'user' 
                        ? 'bg-cyan-900/20 border-cyan-500/30 text-cyan-50 rounded-tr-none' 
                        : 'bg-gray-900/90 border-gray-800 text-gray-200 rounded-tl-none'
                    }`}>
                        <SafeChatText text={msg.text} />
                        
                        {(msg.queryId || msg.reasoning || msg.decisionSupport) && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {msg.decisionSupport && (
                                    <button 
                                        onClick={() => setActiveDecision(msg.decisionSupport!)}
                                        className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-green-400 hover:text-green-300 bg-green-950/30 px-3 py-1.5 rounded-lg border border-green-500/10 transition-all"
                                    >
                                        <CheckCircleIcon className="h-3 w-3" />
                                        <span>Visa Beslutsstöd</span>
                                    </button>
                                )}
                                {msg.reasoning && (
                                    <button 
                                        onClick={() => setActiveReasoning(msg.reasoning!)}
                                        className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 bg-indigo-950/30 px-3 py-1.5 rounded-lg border border-indigo-500/10 transition-all"
                                    >
                                        <SparklesIcon className="h-3 w-3" />
                                        <span>Visa Juridisk Motivering</span>
                                    </button>
                                )}
                                {msg.queryId && (
                                    <button 
                                        onClick={() => setActiveQueryId(msg.queryId!)}
                                        className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-cyan-500 hover:text-cyan-400 bg-cyan-950/30 px-3 py-1.5 rounded-lg border border-cyan-500/10 transition-all"
                                    >
                                        <ShieldCheckIcon className="h-3 w-3" />
                                        <span>Visa Beviskedja</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {isLoading && (
                 <div className="flex items-start gap-5 animate-pulse">
                    <div className="flex-shrink-0 h-12 w-12 rounded-2xl bg-gray-900 border border-red-500/20 flex items-center justify-center text-red-400"><Spinner className="h-6 w-6"/></div>
                    <div className="max-w-[88%] px-6 py-5 rounded-[2rem] bg-gray-900 border border-gray-800 shadow-xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 mb-2">Generating Decision Support...</p>
                        <div className="flex space-x-2">
                            <div className="h-1.5 w-1.5 bg-red-600 rounded-full animate-bounce"></div>
                            <div className="h-1.5 w-1.5 bg-red-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            <div className="h-1.5 w-1.5 bg-red-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <div className="bg-gray-950 rounded-b-[2.5rem] p-8 border-x border-b border-gray-900">
            <div className="relative group">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Fråga DECISION ENGINE..."
                    className="w-full bg-black/50 border border-gray-800 rounded-3xl py-5 pl-8 pr-20 text-sm text-white placeholder-gray-700 focus:ring-4 focus:ring-red-500/10 focus:border-red-500/40 outline-none transition-all shadow-inner"
                    disabled={isLoading}
                />
                <button
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className="absolute right-3 top-3 p-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-900 text-white rounded-2xl transition-all shadow-2xl active:scale-95 border border-red-400/20"
                >
                    <PaperAirplaneIcon className="h-6 w-6" />
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
