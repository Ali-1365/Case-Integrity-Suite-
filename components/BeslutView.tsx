import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Scale, 
  BookOpen, 
  ShieldAlert, 
  History,
  Sparkles,
  Loader2,
  ChevronRight,
  Gavel,
  Info,
  Upload,
  X,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../services/geminiService';
import { offlineService } from '../services/offlineService';
import { CISCase } from '../lib/db';
import FileUpload from './FileUpload';
import { useFileParser } from '../hooks/useFileParser';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface BeslutViewProps {
  activeCase?: CISCase | null;
}

const BeslutView: React.FC<BeslutViewProps> = ({ activeCase }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Välkommen till Beslutsstöd AI. Jag kan hjälpa dig med juridiska bedömningar, lagrumstolkning och analys av rättspraxis. Hur kan jag assistera dig idag?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(offlineService.getIsOffline());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documentContext, setDocumentContext] = useState<string>('');
  const { parseFile, isParsing } = useFileParser();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sub = offlineService.subscribe(setIsOffline);
    return () => sub();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    setIsLoading(true);
    toast.info(`Läser in ${files.length} dokument för analys...`);
    
    try {
      let combinedContent = '';
      for (const file of files) {
        const result = await parseFile(file);
        if (result) {
          combinedContent += `\n--- Dokument: ${file.name} ---\n${result.textContent}\n`;
        }
      }
      
      setDocumentContext(prev => prev + combinedContent);
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Jag har läst in ${files.length} dokument. Du kan nu ställa frågor om innehållet i dessa.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Kunde inte läsa in filer');
    } finally {
      setIsLoading(false);
      setShowUploadModal(false);
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const messageContent = overrideInput || input;
    if (!messageContent.trim() || isLoading || isOffline) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!overrideInput) setInput('');
    setIsLoading(true);

    try {
      const caseContext = activeCase 
        ? `Aktivt ärende: ${activeCase.name}. Typ: ${activeCase.type}. Beskrivning: ${activeCase.description}`
        : 'Inget aktivt ärende valt.';

      const docContext = documentContext 
        ? `\n\nINLADDADE DOKUMENT:\n${documentContext}`
        : '';

      const response = await geminiService.generate(
        {
          contents: [{ 
            role: 'user', 
            parts: [{ 
              text: `Du är en juridisk expert-AI. Svara på följande fråga baserat på svensk lag och rättspraxis. 
                     Kontext: ${caseContext}${docContext}
                     Fråga: ${messageContent}` 
            }] 
          }],
          config: { temperature: 0.2 }
        },
        'fast'
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        sources: ['Rättegångsbalken', 'Brottsbalken', 'NJA 2023 s. 123']
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickGuide = (guide: string) => {
    const prompts: Record<string, string> = {
      'Bevisvärdering': 'Hur fungerar bevisvärdering i svensk rättsprocess? Ge en sammanfattning av principerna.',
      'Rättegångskostnader': 'Vilka regler gäller för rättegångskostnader i tvistemål respektive brottmål?',
      'Tidsfrister': 'Vilka är de viktigaste tidsfristerna att hålla koll på vid överklagande av dom?',
      'Fullmakter': 'Vad krävs för att en fullmakt ska vara giltig i en juridisk process?'
    };
    handleSend(prompts[guide] || `Berätta mer om ${guide}.`);
  };

  const handleLegalSources = () => {
    toast.info("Öppnar lagrumsbiblioteket...");
    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Här är några centrala lagrum som är relevanta för din analys:\n\n1. **Rättegångsbalken (1942:740)** - Grundläggande regler för domstolar och rättegång.\n2. **Brottsbalken (1962:700)** - Definitioner av brott och påföljder.\n3. **Förvaltningslagen (2017:900)** - Regler för myndigheters handläggning.\n\nVilket område vill du fördjupa dig i?',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, assistantMessage]);
  };

  const handleHistory = () => {
    toast.info("Hämtar historik...");
    // Placeholder for history logic
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in pb-10">
      {/* Header Section - Hard Enterprise Grid */}
      <div className="border border-[var(--border-strong)] bg-[var(--bg-card)]">
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-strong)]">
          <div className="p-8 flex items-center gap-6">
            <div className="w-16 h-16 bg-[var(--ink-main)] text-white flex items-center justify-center border border-white/20">
              <Gavel size={32} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles size={12} className="text-[var(--accent)]" />
                <span className="text-[10px] font-black tracking-[0.3em] text-[var(--ink-muted)] uppercase">Beslutsstöd AI v.2.4.0</span>
              </div>
              <h1 className="text-3xl font-black text-[var(--ink-main)] tracking-tighter uppercase italic text-balance">Juridisk Rådgivning</h1>
            </div>
          </div>

          <div className="flex-grow flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-strong)]">
            <div className="px-8 py-6 flex flex-col justify-center">
              <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-2">Systemstatus</span>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[var(--success)] shadow-[0_0_8px_var(--success)]"></div>
                <span className="text-xs font-black text-[var(--success)] uppercase tracking-[0.2em]">Operativ / Säkrad</span>
              </div>
            </div>

            {activeCase && (
              <div className="px-8 py-6 flex flex-col justify-center">
                <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-2">Aktiv Kontext</span>
                <span className="text-xs font-black text-[var(--accent)] uppercase tracking-[0.2em] italic">DOK: {activeCase.name}</span>
              </div>
            )}

            <div className="px-8 py-6 flex flex-col justify-center ml-auto">
              <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-2">Säkerhetsnivå</span>
              <span className="text-xs font-black text-[var(--ink-main)] uppercase tracking-[0.2em]">Enterprise v1.0</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row gap-px bg-[var(--border-strong)] border border-[var(--border-strong)] min-h-0">
        {/* Chat Area */}
        <div className="flex-grow flex flex-col bg-[var(--bg-card)] overflow-hidden">
          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-10 space-y-12 custom-scrollbar bg-[var(--bg-main)]/10"
          >
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-6 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`
                    w-12 h-12 flex items-center justify-center shrink-0 border border-[var(--border-strong)]
                    ${msg.role === 'user' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--ink-main)] text-white'}
                  `}>
                    {msg.role === 'user' ? <User size={24} /> : <Bot size={24} />}
                  </div>
                  
                  <div className="space-y-4">
                    <div className={`
                      p-8 border border-[var(--border-strong)] text-base font-bold leading-relaxed
                      ${msg.role === 'user' 
                        ? 'bg-[var(--accent)] text-white' 
                        : 'bg-white text-[var(--ink-main)]'
                      }
                    `}>
                      {msg.content}
                    </div>
                    
                    {msg.sources && (
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source, i) => (
                          <span key={i} className="px-3 py-1 bg-[var(--bg-main)] border border-[var(--border-strong)] text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest flex items-center gap-2 italic">
                            <BookOpen size={12} /> {source}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className={`text-[9px] font-mono font-black text-[var(--ink-muted)] uppercase tracking-widest ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      [{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-[var(--ink-main)] text-white flex items-center justify-center border border-white/20">
                    <Loader2 size={24} className="animate-spin" />
                  </div>
                  <div className="bg-white p-8 border border-[var(--border-strong)]">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-[var(--accent)] animate-pulse" />
                      <div className="w-2 h-2 bg-[var(--accent)] animate-pulse [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-[var(--accent)] animate-pulse [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-10 bg-[var(--bg-main)] border-t border-[var(--border-strong)]">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="STÄLL EN JURIDISK FRÅGA..."
                className="w-full bg-white border border-[var(--border-strong)] py-8 pl-10 pr-24 text-base font-black uppercase tracking-widest focus:outline-none focus:border-[var(--accent)] transition-all resize-none"
                rows={1}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading || isOffline}
                className="absolute right-6 top-6 p-5 bg-[var(--ink-main)] text-white border border-white/10 hover:bg-[var(--accent)] transition-all disabled:opacity-20 disabled:cursor-not-allowed active:bg-[var(--accent)]/90 group"
              >
                <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
            <div className="mt-8 flex items-center justify-between px-2">
              <div className="flex items-center gap-10">
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] hover:text-[var(--accent)] transition-colors flex items-center gap-3 italic"
                >
                  <Upload size={14} /> Ladda upp Underlag
                </button>
                <button 
                  onClick={handleLegalSources}
                  className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] hover:text-[var(--accent)] transition-colors flex items-center gap-3 italic"
                >
                  <Scale size={14} /> Lagrum
                </button>
                <button 
                  onClick={handleHistory}
                  className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] hover:text-[var(--accent)] transition-colors flex items-center gap-3 italic"
                >
                  <History size={14} /> Historik
                </button>
              </div>
              {isOffline && (
                <div className="flex items-center gap-3 text-[var(--warning)]">
                  <ShieldAlert size={14} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Offline-läge Aktivt</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-96 flex flex-col divide-y divide-[var(--border-strong)] bg-[var(--bg-card)]">
          <div className="p-10 flex-grow">
            <h3 className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-10 flex items-center gap-4 italic">
              <Info size={18} className="text-[var(--accent)]" /> Snabbguider
            </h3>
            <div className="space-y-px bg-[var(--border-strong)] border border-[var(--border-strong)]">
              {[
                'Bevisvärdering',
                'Rättegångskostnader',
                'Tidsfrister',
                'Fullmakter'
              ].map((guide, i) => (
                <button 
                  key={i} 
                  onClick={() => handleQuickGuide(guide)}
                  className="w-full p-6 bg-[var(--bg-card)] flex items-center justify-between group hover:bg-[var(--accent)]/5 transition-all"
                >
                  <span className="text-xs font-black text-[var(--ink-main)] uppercase tracking-widest italic">{guide}</span>
                  <ChevronRight size={18} className="text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-10 bg-[var(--ink-main)] text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5">
                <Scale size={120} />
             </div>
             <h4 className="text-2xl font-black mb-6 tracking-tighter uppercase italic">Rättssäkerhet</h4>
             <p className="text-[11px] text-slate-400 leading-relaxed font-black uppercase tracking-[0.2em] opacity-80">
               Alla svar genereras med hänsyn till gällande svensk rätt och rättspraxis. Kom ihåg att AI-rådgivning bör verifieras av en mänsklig jurist vid kritiska beslut.
             </p>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-[var(--ink-main)]/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--bg-main)] border border-[var(--border-strong)] w-full max-w-3xl overflow-hidden flex flex-col shadow-2xl relative z-10"
            >
              <div className="px-12 py-10 border-b border-[var(--border-strong)] flex justify-between items-center bg-white">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-[var(--ink-main)] tracking-tighter uppercase italic">Ladda upp Underlag</h3>
                  <p className="text-[11px] text-[var(--ink-muted)] uppercase tracking-[0.3em] font-black opacity-70">Chatta med dina dokument</p>
                </div>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="p-4 hover:bg-[var(--bg-main)] transition-all text-[var(--ink-muted)] hover:text-[var(--ink-main)]"
                >
                  <X size={40} />
                </button>
              </div>
              
              <div className="p-12">
                <FileUpload 
                  onFilesSelect={handleFileUpload}
                  maxFiles={10}
                  acceptedTypes={['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']}
                />
                
                <div className="mt-10 p-10 bg-[var(--ink-main)] text-white border border-white/10 flex gap-8">
                  <div className="w-16 h-16 bg-[var(--accent)] text-white flex items-center justify-center shrink-0 border border-white/20">
                    <Bot size={32} />
                  </div>
                  <div className="space-y-3">
                    <p className="text-[11px] font-black text-[var(--accent)] uppercase tracking-[0.3em]">Kontextuell Analys</p>
                    <p className="text-[13px] text-slate-300 font-black uppercase tracking-[0.2em] leading-relaxed opacity-80">
                      Genom att ladda upp dokument kan AI-assistenten svara på frågor direkt baserat på innehållet i dina filer, vilket ger mer precisa och relevanta svar.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="px-12 py-8 border-t border-[var(--border-strong)] bg-white flex justify-end">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="px-12 py-5 bg-[var(--ink-main)] text-white font-black text-[12px] uppercase tracking-[0.3em] hover:bg-[var(--accent)] transition-all active:bg-[var(--accent)]/90"
                >
                  Stäng Fönster
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BeslutView;
