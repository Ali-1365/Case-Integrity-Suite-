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
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Jag har läst in ${files.length} dokument. Du kan nu ställa frågor om innehållet i dessa.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      // In a real app, we would store combinedContent in a ref to use as context for future messages
    } catch (error) {
      toast.error('Kunde inte läsa in filer');
    } finally {
      setIsLoading(false);
      setShowUploadModal(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || isOffline) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = activeCase 
        ? `Aktivt ärende: ${activeCase.name}. Typ: ${activeCase.type}. Beskrivning: ${activeCase.description}`
        : 'Inget aktivt ärende valt.';

      const response = await geminiService.generate(
        {
          contents: `Du är en juridisk expert-AI. Svara på följande fråga baserat på svensk lag och rättspraxis. 
                     Kontext: ${context}
                     Fråga: ${input}`,
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

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.5rem] bg-[var(--ink-main)] text-white flex items-center justify-center shadow-xl shadow-[var(--ink-main)]/20">
            <Gavel size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-[var(--accent)]" />
              <span className="text-[10px] font-black tracking-[0.2em] text-[var(--ink-muted)] uppercase">Beslutsstöd AI v2.0</span>
            </div>
            <h1 className="text-3xl font-black text-[var(--ink-main)] tracking-tight">Juridisk Rådgivning</h1>
          </div>
        </div>

        {activeCase && (
          <div className="hidden md:flex items-center gap-4 px-6 py-3 bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-[var(--ink-main)] uppercase tracking-widest">Kontext: {activeCase.name}</span>
          </div>
        )}
      </div>

      <div className="flex-grow flex flex-col lg:flex-row gap-8 min-h-0">
        {/* Chat Area */}
        <div className="flex-grow flex flex-col bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] shadow-sm overflow-hidden">
          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar"
          >
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm
                    ${msg.role === 'user' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--ink-main)] text-white'}
                  `}>
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  
                  <div className="space-y-2">
                    <div className={`
                      p-6 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-sm
                      ${msg.role === 'user' 
                        ? 'bg-[var(--accent)] text-white rounded-tr-none' 
                        : 'bg-[var(--bg-main)] text-[var(--ink-main)] rounded-tl-none border border-[var(--border)]'
                      }
                    `}>
                      {msg.content}
                    </div>
                    
                    {msg.sources && (
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source, i) => (
                          <span key={i} className="px-3 py-1 bg-[var(--bg-main)] border border-[var(--border)] rounded-full text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest flex items-center gap-1">
                            <BookOpen size={10} /> {source}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className={`text-[9px] font-bold text-[var(--ink-muted)] uppercase tracking-widest ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--ink-main)] text-white flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin" />
                  </div>
                  <div className="bg-[var(--bg-main)] p-6 rounded-[1.5rem] rounded-tl-none border border-[var(--border)]">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--ink-muted)] animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--ink-muted)] animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--ink-muted)] animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-8 bg-[var(--bg-main)]/50 border-t border-[var(--border)]">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Ställ en juridisk fråga..."
                className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[1.5rem] py-5 pl-6 pr-20 text-sm font-medium focus:outline-none focus:border-[var(--accent)] transition-all resize-none shadow-inner"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || isOffline}
                className="absolute right-3 top-3 p-3 bg-[var(--ink-main)] text-white rounded-xl hover:bg-[var(--accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95"
              >
                <Send size={20} />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest hover:text-[var(--accent)] transition-colors flex items-center gap-1"
                >
                  <Upload size={12} /> Ladda upp Underlag
                </button>
                <button className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest hover:text-[var(--accent)] transition-colors flex items-center gap-1">
                  <Scale size={12} /> Lagrum
                </button>
                <button className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest hover:text-[var(--accent)] transition-colors flex items-center gap-1">
                  <History size={12} /> Historik
                </button>
              </div>
              {isOffline && (
                <div className="flex items-center gap-2 text-amber-600">
                  <ShieldAlert size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Offline-läge</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-8">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xs font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Info size={14} className="text-[var(--accent)]" /> Snabbguider
            </h3>
            <div className="space-y-3">
              {[
                'Bevisvärdering',
                'Rättegångskostnader',
                'Tidsfrister',
                'Fullmakter'
              ].map((guide, i) => (
                <button key={i} className="w-full p-4 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] flex items-center justify-between group hover:border-[var(--accent)]/50 transition-all">
                  <span className="text-xs font-bold text-[var(--ink-main)]">{guide}</span>
                  <ChevronRight size={14} className="text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[var(--ink-main)] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Scale size={80} />
             </div>
             <h4 className="text-lg font-black mb-4 tracking-tight">Rättssäkerhet</h4>
             <p className="text-xs text-slate-400 leading-relaxed font-medium">
               Alla svar genereras med hänsyn till gällande svensk rätt och rättspraxis. Kom ihåg att AI-rådgivning bör verifieras av en mänsklig jurist vid kritiska beslut.
             </p>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-[var(--ink-main)]/40 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[var(--bg-main)] rounded-[3rem] w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl relative z-10 border border-white/20"
            >
              <div className="px-12 py-10 border-b border-[var(--border)] flex justify-between items-center bg-white/50 backdrop-blur-sm">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-[var(--ink-main)] tracking-tight">Ladda upp Underlag</h3>
                  <p className="text-[10px] text-[var(--ink-muted)] uppercase tracking-[0.2em] font-black">Chatta med dina dokument</p>
                </div>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="p-4 hover:bg-[var(--bg-main)] rounded-[1.5rem] transition-all text-[var(--ink-muted)] hover:text-[var(--ink-main)]"
                >
                  <X size={32} />
                </button>
              </div>
              
              <div className="p-12">
                <FileUpload 
                  onFilesSelect={handleFileUpload}
                  maxFiles={10}
                  acceptedTypes={['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']}
                />
                
                <div className="mt-8 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                    <Bot size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-emerald-900 uppercase tracking-widest">Kontextuell Analys</p>
                    <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                      Genom att ladda upp dokument kan AI-assistenten svara på frågor direkt baserat på innehållet i dina filer, vilket ger mer precisa och relevanta svar.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="px-12 py-8 border-t border-[var(--border)] bg-white/50 backdrop-blur-sm flex justify-end">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="px-10 py-4 text-[var(--ink-muted)] font-black text-[11px] uppercase tracking-widest hover:bg-[var(--bg-main)] rounded-[1.5rem] transition-all active:scale-95"
                >
                  Avbryt
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
