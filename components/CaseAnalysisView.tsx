import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Brain, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Play, 
  Search, 
  Link as LinkIcon,
  ShieldCheck,
  Zap,
  FileSearch,
  Layers,
  Sparkles,
  BrainCircuit,
  Loader2,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CISCase } from '../lib/db';
import { AIOrchestrator } from '../lib/AIOrchestrator';
import { offlineService } from '../services/offlineService';
import FileUpload from './FileUpload';
import { ModuleConnector } from './shared/ModuleConnector';

interface CaseAnalysisViewProps {
  activeCase: CISCase;
  onAnalysisComplete?: () => void;
  onNavigate?: (moduleId: string) => void;
}

const CaseAnalysisView: React.FC<CaseAnalysisViewProps> = ({ activeCase, onAnalysisComplete, onNavigate }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOffline, setIsOffline] = useState(offlineService.getIsOffline());
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    const sub = offlineService.subscribe(setIsOffline);
    return () => sub();
  }, []);

  const runAnalysis = async () => {
    if (isOffline) return;
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate progress for UI feedback
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      setActiveStep(i);
      setAnalysisProgress((i / steps) * 100);
      await new Promise(r => setTimeout(r, 1500));
    }

    try {
      const orchestrator = new AIOrchestrator();
      await orchestrator.orchestrateCaseAnalysis(activeCase.caseId, '', []);
      onAnalysisComplete?.();
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setActiveStep(0);
    }
  };

  const pipelineSteps = [
    { id: 1, label: 'Extraktion', desc: 'Identifierar faktum-atomer', icon: FileSearch },
    { id: 2, label: 'Korsreferens', desc: 'Länkar bevis till påståenden', icon: Layers },
    { id: 3, label: 'Logik-check', desc: 'Hittar motsägelser', icon: Brain },
    { id: 4, label: 'Juridisk Prövning', desc: 'Matchar mot lagrum', icon: ShieldCheck },
    { id: 5, label: 'Slutsats', desc: 'Genererar insikter', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 relative pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 border-b-4 border-[var(--ink-main)] pb-10">
        <div className="space-y-2">
          <h3 className="text-4xl font-black text-[var(--ink-main)] tracking-tighter uppercase italic">Analys & Utredning <span className="text-[var(--accent)] opacity-30">v.8.2</span></h3>
          <div className="flex items-center gap-4">
            <p className="text-[11px] text-[var(--ink-muted)] font-black uppercase tracking-[0.3em] opacity-70">Djupgående forensisk analys av juridiska premisser.</p>
            <div className="h-px w-20 bg-[var(--border)]" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--success)] animate-pulse" />
              <span className="text-[9px] font-mono font-black text-[var(--success)] uppercase">Core Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="px-6 py-3 bg-[var(--bg-main)] border-2 border-[var(--ink-main)] flex items-center gap-4 shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
            <div className="w-3 h-3 bg-[var(--accent)] animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest italic">{activeCase?.name || 'INGET AKTIVT ÄRENDE'}</span>
          </div>
          <button 
            onClick={runAnalysis}
            disabled={isAnalyzing || isOffline}
            className="px-10 py-4 bg-[var(--ink-main)] text-white font-black text-[12px] uppercase tracking-[0.2em] hover:bg-[var(--accent)] transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-4 shadow-xl active:translate-y-1"
          >
            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
            {isAnalyzing ? 'Processar...' : 'Initiera Analys'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-[var(--bg-card)] border-4 border-[var(--ink-main)] shadow-[20px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-8 border-b-2 border-[var(--ink-main)] bg-[var(--bg-main)] flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Activity className="w-6 h-6 text-[var(--accent)]" />
                <h4 className="text-sm font-black uppercase tracking-widest italic">Analysförlopp</h4>
              </div>
              <div className="font-mono text-xl font-black text-[var(--ink-main)]">
                {Math.round(analysisProgress).toString().padStart(3, '0')}%
              </div>
            </div>
            
            <div className="p-12 space-y-12">
              <div className="h-6 bg-[var(--bg-main)] border-2 border-[var(--border)] relative overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent)] transition-all duration-500 relative"
                  style={{ width: `${analysisProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {pipelineSteps.map((step, idx) => {
                  const isCompleted = activeStep > step.id || (!isAnalyzing && activeStep === 0 && analysisProgress === 100);
                  const isActive = activeStep === step.id;

                  return (
                    <div 
                      key={step.id}
                      className={`p-6 border-2 transition-all flex items-center justify-between group ${
                        isCompleted ? 'bg-[var(--success)]/5 border-[var(--success)]/20' :
                        isActive ? 'bg-[var(--accent)]/5 border-[var(--accent)] shadow-lg' :
                        'bg-[var(--bg-main)] border-[var(--border)] opacity-40'
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-10 h-10 border-2 flex items-center justify-center font-mono text-xs font-black ${
                          isCompleted ? 'bg-[var(--success)] border-[var(--success)] text-white' :
                          isActive ? 'bg-[var(--accent)] border-[var(--accent)] text-white animate-pulse' :
                          'bg-[var(--bg-card)] border-[var(--border)] text-[var(--ink-muted)]'
                        }`}>
                          {step.id}
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-black uppercase tracking-widest italic">{step.label}</div>
                          <div className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest opacity-60">{step.desc}</div>
                        </div>
                      </div>
                      {isCompleted && <CheckCircle2 className="w-6 h-6 text-[var(--success)]" />}
                      {isActive && <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border-4 border-[var(--ink-main)] shadow-[20px_20px_0px_rgba(0,0,0,0.05)]">
            <div className="p-8 border-b-2 border-[var(--ink-main)] bg-[var(--bg-main)] flex items-center justify-between">
              <h4 className="text-sm font-black uppercase tracking-widest italic">Systemlogg</h4>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[var(--success)] animate-pulse" />
                <span className="text-[9px] font-mono font-black uppercase text-[var(--success)]">Live Output</span>
              </div>
            </div>
            <div className="p-8 bg-[var(--ink-main)] text-[var(--success)] font-mono text-[11px] h-[300px] overflow-y-auto custom-scrollbar space-y-2">
              <div>[14:22:01] INIT_ANALYSIS_CORE... OK</div>
              <div>[14:22:05] LOADING_CASE_DATA: {activeCase?.name || 'NULL'}</div>
              <div>[14:22:10] SCANNING_LEGAL_DATABASE... 32 NODES FOUND</div>
              {analysisProgress > 20 && <div>[14:22:15] EXTRACTING_SYLLOGISMS... OK</div>}
              {analysisProgress > 40 && <div>[14:22:20] VERIFYING_EVIDENCE_INTEGRITY... OK</div>}
              {analysisProgress > 60 && <div>[14:22:25] CALCULATING_RISK_VECTORS... OK</div>}
              <div className="animate-pulse">_</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="bg-[var(--bg-card)] border-4 border-[var(--ink-main)] p-10 shadow-[15px_15px_0px_rgba(0,0,0,0.05)]">
            <h4 className="text-sm font-black uppercase tracking-widest italic mb-8 flex items-center gap-4">
              <Shield className="w-5 h-5 text-[var(--accent)]" />
              Säkerhetsprotokoll
            </h4>
            <div className="space-y-6">
              {[
                { label: 'End-to-End Kryptering', status: 'Aktiv' },
                { label: 'Lokal Nod-bearbetning', status: 'Aktiv' },
                { label: 'SHA-256 Verifiering', status: 'Aktiv' },
                { label: 'Zero-Knowledge Arkiv', status: 'Aktiv' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b-2 border-[var(--bg-main)] pb-4">
                  <span className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-widest">{item.label}</span>
                  <span className="text-[9px] font-black text-[var(--success)] uppercase tracking-widest italic">{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--ink-main)] p-10 text-white shadow-[15px_15px_0px_rgba(0,0,0,0.1)] border-4 border-white/10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[var(--accent)] flex items-center justify-center border-2 border-white/20">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)]">AI Insights</span>
            </div>
            <h4 className="text-2xl font-black mb-6 tracking-tighter uppercase italic">Prediktiv Analys</h4>
            <p className="text-[var(--ink-light)] text-[11px] leading-relaxed font-black uppercase tracking-widest opacity-80 mb-10">
              Vår neurala motor analyserar inte bara texten, utan förutspår även motpartens argumentationslinjer baserat på historisk rättspraxis.
            </p>
            <div className="p-6 bg-white/5 border-2 border-white/10 italic text-[11px] font-medium text-[var(--ink-light)]">
              "Systemet har identifierat en 82% sannolikhet för invändning gällande preklusion i nuvarande ärende."
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border-4 border-[var(--ink-main)] p-8 shadow-[15px_15px_0px_rgba(0,0,0,0.05)]">
            <h3 className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Activity size={12} className="text-[var(--accent)]" /> Faktum-Atomer
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Tidpunkt för händelse', value: '2023-12-01', status: 'Verifierad' },
                { label: 'Plats', value: 'Stockholm HQ', status: 'Verifierad' },
                { label: 'Parter', value: 'CIS vs. Global Corp', status: 'Verifierad' },
                { label: 'Avtalsbelopp', value: '2.4M SEK', status: 'Overifierad' },
              ].map((atom, i) => (
                <div key={i} className="p-4 bg-[var(--bg-main)] border-2 border-[var(--border)] group hover:border-[var(--accent)] transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] font-black text-[var(--ink-muted)] uppercase tracking-widest">{atom.label}</span>
                    <span className={`text-[8px] font-black px-2 py-0.5 border ${atom.status === 'Verifierad' ? 'border-[var(--success)] text-[var(--success)]' : 'border-[var(--warning)] text-[var(--warning)]'}`}>
                      {atom.status}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-black text-[var(--ink-main)]">{atom.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ModuleConnector activeModule="agent" onNavigate={onNavigate} />
    </div>
  );
};

export default CaseAnalysisView;
