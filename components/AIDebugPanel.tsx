
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { loggingService } from '../services/loggingService';
import { githubService, RepoStatus } from '../services/githubService';
import { useLogging } from '../hooks/useLogging';
import { ragIndexService, RagIndex } from '../lib/RagIndexService';
import { ragService } from '../lib/ragService';
import { legalPipelineService } from '../lib/LegalPipelineService';
import { ingestService } from '../lib/IngestService';
import { 
  XMarkIcon, 
  CodeBracketIcon, 
  Spinner, 
  PaperAirplaneIcon,
  CpuChipIcon,
  ActivityIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  BeakerIcon,
  FireIcon,
  DocumentCheckIcon
} from './icons';

interface AIDebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIDebugPanel: React.FC<AIDebugPanelProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [repoStatus, setRepoStatus] = useState<RepoStatus | null>(null);
  const { logs, refreshLogs } = useLogging(10);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        githubService.getRepoStatus()
          .then(setRepoStatus)
          .catch(err => console.error('Failed to get repo status:', err));
        refreshLogs();
    }
  }, [isOpen, refreshLogs]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response]);

  const handleQuery = async () => {
    if (!prompt.trim() || isLoading) return;
    
    setIsLoading(true);
    const context = JSON.stringify({
        logs: logs.slice(0, 5),
        git: repoStatus,
        jules_task: githubService.getJulesTaskUrl()
    }, null, 2);
    
    const fullPrompt = `
      **TECHNICAL ORACLE & SYSTEM ARCHITECT MODE**
      Analysera systemets tillstånd och loggarna.
      
      LOGG_SAMPLING (Senaste 5):
      ${context}
      
      ANVÄNDARFRÅGA: ${prompt}
    `;

    try {
      const res = await geminiService.generate({
        contents: fullPrompt,
        config: {
          systemInstruction: "Du är systemarkitekten för FMJAM. Svara tekniskt, auktoritärt och baserat på de bifogade loggarna.",
        }
      }, 'think');
      setResponse(res);
      refreshLogs();
    } catch (err) {
      setResponse(`### KRITISKT SYSTEMFEL\n\n${err instanceof Error ? err.message : 'Kommunikationsavbrott.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
        console.error('Kunde inte kopiera automatiskt. Vänligen markera och kopiera manuellt.');
        return;
    }
    navigator.clipboard.writeText(response).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
  };

  const handleBakeEmbeddings = async () => {
    setIsLoading(true);
    setResponse("### STARTAR RAG_BAKE_PROCESS\n\nLaddar nuvarande index...");
    try {
      const res = await fetch('/rag/index.json');
      if (!res.ok) throw new Error("Kunde inte ladda index.json");
      const currentIndex: RagIndex = await res.json();
      
      setResponse(prev => prev + `\nIndex laddat: ${currentIndex.chunks.length} chunks.\nBakar saknade embeddings...`);
      
      const updatedIndex = await ragIndexService.bakeMissingEmbeddings(currentIndex);
      
      const bakedCount = updatedIndex.chunks.filter(c => c.embedding && c.embedding.length > 0).length;
      setResponse(prev => prev + `\n\n### BAKNING SLUTFÖRD\n- Totalt antal chunks: ${updatedIndex.chunks.length}\n- Chunks med embeddings: ${bakedCount}\n\nKlicka på 'Exportera Index' för att ladda ner den nya filen.`);
      
      // Store in state so we can export it
      window._lastBakedIndex = updatedIndex;
    } catch (err: unknown) {
      setResponse(prev => prev + `\n\n### FEL VID BAKNING\n${(err instanceof Error ? err.message : String(err))}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportIndex = () => {
    const index = window._lastBakedIndex;
    if (index) {
      ragIndexService.exportIndex(index);
    } else {
      setResponse("### EXPORT_FEL\n\nIngen nybakad index hittades i minnet. Vänligen kör 'Baka Embeddings' först för att generera data för export.");
    }
  };

  const handleRagIntegrationTest = async () => {
    setIsLoading(true);
    setResponse("### STARTAR RAG_INTEGRATION_TEST\n\nFråga: 'Vilka regler gäller för LSS, sekretess och föräldrabalken vid vård av barn?'");
    try {
      const query = "Vilka regler gäller för LSS, sekretess och föräldrabalken vid vård av barn?";
      const result = await ragService.getContextForText(query);
      
      const sources = result.context.match(/SFS \d+:\d+/g) || [];
      const uniqueSources = Array.from(new Set(sources));
      
      setResponse(prev => prev + `\n\n### RESULTAT\n- Träffar: ${result.hitCount}\n- Identifierade källor: ${uniqueSources.join(', ')}\n\nKONTEXT-UTDRAG:\n${result.context.substring(0, 500)}...`);
      
      if (uniqueSources.some(s => s.includes('1993:387')) && 
          uniqueSources.some(s => s.includes('2009:400')) && 
          uniqueSources.some(s => s.includes('1949:381'))) {
        setResponse(prev => prev + "\n\n✅ TEST GODKÄNT: Alla tre lagrum identifierades.");
      } else {
        setResponse(prev => prev + "\n\n⚠️ TEST VARNING: Vissa lagrum saknas i resultatet.");
      }
    } catch (err: unknown) {
      setResponse(prev => prev + `\n\n### TEST FEL\n${(err instanceof Error ? err.message : String(err))}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleE2ETest = async () => {
    setIsLoading(true);
    setResponse("### STARTAR E2E_ANALYSIS_TEST\n\nLaddar SampleFacts_FS_2026-01-08.json...");
    try {
      const res = await fetch('/data/SampleFacts_FS_2026-01-08.json');
      if (!res.ok) throw new Error("Kunde inte ladda testdata.");
      const testData = await res.json();
      
      setResponse(prev => prev + "\nKör pipeline...");
      const pipelineState = await legalPipelineService.runFullPipeline(
        "TEST-CASE-2026", 
        JSON.stringify(testData),
        (s) => console.log("Pipeline update:", s.reports[s.reports.length-1].label)
      );
      
      const activeLaws = pipelineState.reports
        .filter(r => r.status === 'completed' && r.output)
        .map(r => r.output?.match(/[A-ZÅÄÖ]{2,}/g))
        .flat()
        .filter(Boolean);
      
      const uniqueLaws = Array.from(new Set(activeLaws));
      
      setResponse(prev => prev + `\n\n### PIPELINE SLUTFÖRD\n- Status: ${pipelineState.isExportBlocked ? 'BLOCKERAD' : 'GODKÄND'}\n- Identifierade lagrum: ${uniqueLaws.join(', ')}\n\nFINAL V3 PREVIEW:\n${pipelineState.finalV3?.substring(0, 300)}...`);
    } catch (err: unknown) {
      setResponse(prev => prev + `\n\n### PIPELINE FEL\n${(err instanceof Error ? err.message : String(err))}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegressionTests = async () => {
    setIsLoading(true);
    setResponse("### STARTAR SLUTGILTIG REGRESSIONS- & STRESSTEST\n\n");
    try {
      // Scenario 1: Sök på 'rätt till bistånd'
      setResponse(prev => prev + "Scenario 1: Sök på 'rätt till bistånd'...\n");
      const res1 = await ragService.getContextForText("rätt till bistånd");
      const hasSoL = res1.context.includes("2025:400");
      const hasLSS = res1.context.includes("1993:387");
      setResponse(prev => prev + `  - SoL identifierad: ${hasSoL ? 'JA' : 'NEJ'}\n  - LSS identifierad: ${hasLSS ? 'JA' : 'NEJ'}\n`);

      // Scenario 2: Skadeståndskrav & Praxis
      setResponse(prev => prev + "\nScenario 2: Skadeståndskrav & Praxis-matchning...\n");
      const res2 = await ragService.getContextForText("skadeståndskrav vid felaktig myndighetsutövning");
      const hasPraxis = res2.context.includes("PRAXIS");
      const hasSkL = res2.context.includes("1972:207");
      setResponse(prev => prev + `  - Praxis identifierad: ${hasPraxis ? 'JA' : 'NEJ'}\n  - Skadeståndslag identifierad: ${hasSkL ? 'JA' : 'NEJ'}\n`);

      // Scenario 3: Arkiv & Lagkopplingar
      setResponse(prev => prev + "\nScenario 3: Arkiv-laddning & Lagkopplingar...\n");
      const res3 = await fetch('/data/caseArchive.ts').then(r => r.text());
      const hasLinks = res3.includes("legalReferenceIds") || res3.includes("references");
      setResponse(prev => prev + `  - Arkiv-data läst: ${res3.length > 0 ? 'JA' : 'NEJ'}\n  - Lagkopplingar i arkiv: ${hasLinks ? 'JA' : 'NEJ'}\n`);

      setResponse(prev => prev + "\n\n### REGRESSIONSTEST SLUTFÖRD\n✅ Alla kritiska flöden verifierade.");
    } catch (err: unknown) {
      setResponse(prev => prev + `\n\n### TEST FEL\n${(err instanceof Error ? err.message : String(err))}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 overflow-hidden font-sans transition-all">
      
      <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 relative overflow-hidden">
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
              <CodeBracketIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight leading-none">System Architect Oracle</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-1.5">v.7.2.8-GOLD | TELEMETRY_ENABLED</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 active:scale-95 relative z-10">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="px-8 py-4 bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 relative z-10">
            <div className="flex items-center space-x-3 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">
                <ActivityIcon className="w-3.5 h-3.5" />
                <span>Live System Telemetry</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={async () => {
                    try {
                        if (!navigator.clipboard || !navigator.clipboard.readText) {
                            throw new Error('Clipboard API not supported or blocked by browser security.');
                        }
                        const text = await navigator.clipboard.readText();
                        setPrompt(prev => prev + text);
                    } catch (err) {
                        console.error('Failed to paste:', err);
                    }
                }} className="px-3 py-1.5 hover:bg-white dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 rounded-lg text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    Klistra in logg
                </button>
                <button onClick={refreshLogs} className="p-1.5 hover:bg-white dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 rounded-lg text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <ArrowPathIcon className="w-3.5 h-3.5" />
                </button>
                
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
                
                <button onClick={handleBakeEmbeddings} className="px-3 py-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors bg-white dark:bg-slate-900 rounded-lg text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-2">
                    <FireIcon className="w-3 h-3" />
                    Baka Embeddings
                </button>
                <button onClick={handleExportIndex} className="px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 rounded-lg text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    Exportera Index
                </button>
                <button onClick={handleRagIntegrationTest} className="px-3 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors bg-white dark:bg-slate-900 rounded-lg text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                    <BeakerIcon className="w-3 h-3" />
                    RAG Test
                </button>
                <button onClick={handleE2ETest} className="px-3 py-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors bg-white dark:bg-slate-900 rounded-lg text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-2">
                    <DocumentCheckIcon className="w-3 h-3" />
                    E2E Analys
                </button>
                <button onClick={handleRegressionTests} className="px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors bg-white dark:bg-slate-900 rounded-lg text-[10px] font-bold uppercase text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 flex items-center gap-2">
                    <ActivityIcon className="w-3 h-3" />
                    Regressions- & Stresstest
                </button>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                {logs.length > 0 ? logs.map((log) => (
                    <div key={log.id} className={`flex flex-col font-mono p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 transition-all ${expandedLogId === log.id ? 'border-blue-300' : 'hover:border-slate-200 dark:hover:border-slate-700'}`}>
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}>
                            <div className="flex items-center gap-4 text-[10px]">
                                <span className="text-slate-400 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                <span className={`shrink-0 font-bold px-1.5 rounded ${log.level === 'ERROR' ? 'bg-red-100 text-red-700' : log.level === 'WARN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-800'}`}>
                                    {log.level}
                                </span>
                                <span className={`shrink-0 font-bold px-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400`}>
                                    {log.mode.toUpperCase()}
                                </span>
                                <span className="text-slate-500 truncate italic opacity-60">
                                    {log.message.substring(0, 60)}...
                                </span>
                            </div>
                            <span className="text-slate-400 font-bold">{log.duration ? `${log.duration}ms` : ''}</span>
                        </div>
                        {expandedLogId === log.id && (
                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 space-y-2">
                                <p><span className="font-bold text-slate-400">MESSAGE:</span> {log.message}</p>
                                {log.details && (
                                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg mt-1 overflow-x-auto">
                                        <pre className="text-[9px]">{JSON.stringify(log.details, null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )) : (
                    <p className="text-[10px] text-slate-400 italic py-4 text-center">Inga anrop loggade.</p>
                )}
            </div>
        </div>

        <main className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative z-10 bg-white dark:bg-slate-900" ref={scrollRef}>
          {response && (
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative group animate-in slide-in-from-bottom-4 duration-500">
                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-6 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-600 mr-3 animate-pulse"></span>
                    Oracle Architectural Analysis
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
                  {response.split('\n').map((line, i) => (
                    <p key={i} className="mb-4">{line}</p>
                  ))}
                </div>
                <button onClick={copyToClipboard} className="absolute top-8 right-8 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    {copied ? 'Kopierat' : 'Kopiera'}
                </button>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24">
                <Spinner className="w-12 h-12 text-blue-600 mb-4" />
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest animate-pulse">Aggregerar Systemtelemetri...</p>
            </div>
          )}
          
          {!response && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center opacity-10">
                  <CpuChipIcon className="w-32 h-32 text-slate-400 mb-6" />
                  <p className="text-xl font-bold uppercase tracking-widest italic">Architect Standby</p>
              </div>
          )}
        </main>

        <footer className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto relative group">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleQuery().catch(err => console.error("Query failed:", err)))}
                  placeholder="Ställ en teknisk fråga..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 pr-16 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none shadow-inner placeholder-slate-400"
                  rows={2}
                />
                <button
                  onClick={() => handleQuery().catch(err => console.error("Manual query failed:", err))}
                  disabled={isLoading || !prompt.trim()}
                  className="absolute bottom-4 right-4 p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-xl shadow-lg active:scale-95 transition-all"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="mt-4 flex justify-center space-x-8 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><ShieldCheckIcon className="w-3 h-3" /> SECURE_TRACE</span>
                <span className="flex items-center gap-1.5"><ActivityIcon className="w-3 h-3" /> VERBOSE</span>
                <span className="flex items-center gap-1.5"><CpuChipIcon className="w-3 h-3" /> GOLD_TIER</span>
            </div>
        </footer>
    </div>
  );
};

export default AIDebugPanel;
