
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
                    return <span key={i} className="text-[var(--accent)] font-mono font-bold bg-[var(--accent)]/10 px-1.5 py-0.5 rounded border border-[var(--accent)]/20 text-[10px] mx-1">{part}</span>;
                }
                if (['⚡TOTAL', '🎯SNIPER', '💀DESTROY', '🌊FLOOD', '🚀ESKALERA', '🎪FULLATTACK'].includes(part)) {
                    return <span key={i} className="text-[var(--danger)] font-black italic tracking-tighter bg-[var(--danger)]/10 px-2 py-0.5 rounded border border-[var(--danger)]/20 mx-1">{part}</span>;
                }
                if (['⚖️MEGAINLAGA', '📂BEVISPAKET', '📊ANALYS', '🧾EXPORT'].includes(part)) {
                    return <span key={i} className="text-[var(--accent)] font-black tracking-widest bg-[var(--accent)]/10 px-2 py-0.5 rounded border border-[var(--accent)]/20 mx-1">{part}</span>;
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
    } catch (e) {
      setMessages([...newMessages, { role: 'model', text: `OMEGA_CORE_FAILURE: Fel i beslutsstödsmodulen.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full w-full animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
        <div className="bg-[var(--bg-main)] dark:bg-[var(--bg-nav)] rounded-t-[2rem] border-x border-t border-[var(--border)] dark:border-[var(--border-strong)] p-8 relative overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[var(--accent)]/10 dark:bg-[var(--accent)]/20 rounded-lg border border-[var(--accent)]/20 dark:border-[var(--accent)]/30">
                        <LawIcon className="h-5 w-5 text-[var(--accent)]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[var(--ink-main)] dark:text-[var(--accent-foreground)] uppercase tracking-tight leading-none">Beslutsmotor</h3>
                        <div className="flex items-center space-x-1.5 mt-1.5">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse"></span>
                            <span className="text-[8px] font-bold text-[var(--ink-muted)] uppercase tracking-widest">v2.2 Active</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink-main)] dark:hover:text-[var(--accent-foreground)] transition-all hover:bg-[var(--bg-main)] dark:hover:bg-[var(--bg-nav)]/50 rounded-lg">
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
        </div>

        <div className="flex-1 bg-[var(--bg-main)] dark:bg-[var(--bg-nav)] overflow-y-auto p-6 space-y-6 custom-scrollbar border-x border-[var(--border)] dark:border-[var(--border-strong)] shadow-inner">
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''} animate-in fade-in duration-500`}>
                    {msg.role === 'model' && (
                        <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-[var(--bg-main)] dark:bg-[var(--bg-nav)]/50 border border-[var(--border)] dark:border-[var(--border-strong)] flex items-center justify-center text-[var(--accent)]">
                            <CpuChipIcon className="h-4 w-4"/>
                        </div>
                    )}
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                        msg.role === 'user' 
                        ? 'bg-[var(--bg-nav)] text-[var(--accent-foreground)] rounded-tr-none border border-[var(--accent)]/30' 
                        : 'bg-[var(--bg-main)] dark:bg-[var(--bg-nav)]/30 text-[var(--ink-main)] dark:text-[var(--ink-light)] rounded-tl-none border border-[var(--border)] dark:border-[var(--border-strong)]'
                    }`}>
                        <SafeChatText text={msg.text} />
                        
                        {(msg.queryId || msg.reasoning || msg.decisionSupport) && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {msg.decisionSupport && (
                                    <button 
                                        onClick={() => setActiveDecision(msg.decisionSupport!)}
                                        className="flex items-center space-x-1.5 text-[8px] font-bold uppercase tracking-wider text-[var(--success)] hover:bg-[var(--success)]/10 px-2 py-1 rounded border border-[var(--success)]/20 transition-all"
                                    >
                                        <CheckCircleIcon className="h-2.5 w-2.5" />
                                        <span>Beslutsstöd</span>
                                    </button>
                                )}
                                {msg.reasoning && (
                                    <button 
                                        onClick={() => setActiveReasoning(msg.reasoning!)}
                                        className="flex items-center space-x-1.5 text-[8px] font-bold uppercase tracking-wider text-[var(--accent)] hover:bg-[var(--accent)]/10 px-2 py-1 rounded border border-[var(--accent)]/20 transition-all"
                                    >
                                        <SparklesIcon className="h-2.5 w-2.5" />
                                        <span>Motivering</span>
                                    </button>
                                )}
                                {msg.queryId && (
                                    <button 
                                        onClick={() => setActiveQueryId(msg.queryId!)}
                                        className="flex items-center space-x-1.5 text-[8px] font-bold uppercase tracking-wider text-[var(--accent)] hover:bg-[var(--accent)]/10 px-2 py-1 rounded border border-[var(--accent)]/20 transition-all"
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
                    <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-[var(--bg-main)] dark:bg-[var(--bg-nav)]/50 border border-[var(--border)] dark:border-[var(--border-strong)] flex items-center justify-center text-[var(--accent)]"><Spinner className="h-4 w-4"/></div>
                    <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-[var(--bg-main)] dark:bg-[var(--bg-nav)]/30 border border-[var(--border)] dark:border-[var(--border-strong)]">
                        <div className="flex space-x-1.5">
                            <div className="h-1 w-1 bg-[var(--accent)] rounded-full animate-bounce"></div>
                            <div className="h-1 w-1 bg-[var(--accent)] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            <div className="h-1 w-1 bg-[var(--accent)] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <div className="bg-[var(--bg-main)] dark:bg-[var(--bg-nav)] rounded-b-2xl p-6 border-x border-b border-[var(--border)] dark:border-[var(--border-strong)] shadow-xl">
            <div className="relative group">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend().catch(err => console.error('Chat send failed:', err))}
                    placeholder="Skriv ett meddelande..."
                    className="w-full bg-[var(--bg-main)] dark:bg-[var(--bg-nav)]/50 border border-[var(--border)] dark:border-[var(--border-strong)] rounded-xl py-3 pl-4 pr-12 text-sm text-[var(--ink-main)] dark:text-[var(--accent-foreground)] placeholder-[var(--ink-muted)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none transition-all"
                    disabled={isLoading}
                />
                <button
                    onClick={() => handleSend().catch(err => console.error('Chat send failed:', err))}
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 top-2 p-2 bg-[var(--accent)] hover:bg-[var(--accent)]/80 disabled:bg-[var(--border)] dark:disabled:bg-[var(--bg-nav)] text-[var(--accent-foreground)] rounded-lg transition-all"
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
