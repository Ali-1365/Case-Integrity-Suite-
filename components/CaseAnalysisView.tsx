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
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CISCase } from '../lib/db';
import { AIOrchestrator } from '../lib/AIOrchestrator';
import { offlineService } from '../services/offlineService';
import FileUpload from './FileUpload';

interface CaseAnalysisViewProps {
  activeCase: CISCase;
  onAnalysisComplete?: () => void;
}

const CaseAnalysisView: React.FC<CaseAnalysisViewProps> = ({ activeCase, onAnalysisComplete }) => {
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
    <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Activity size={200} className="text-[var(--accent)]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                <Sparkles size={20} />
              </div>
              <span className="text-[10px] font-black tracking-[0.2em] text-[var(--ink-muted)] uppercase">
                AI Analys-Pipeline v4.2
              </span>
            </div>
            <h1 className="text-4xl font-black text-[var(--ink-main)] tracking-tight">
              Ärendeanalys: <span className="text-[var(--accent)]">{activeCase.name}</span>
            </h1>
            <p className="text-sm font-medium text-[var(--ink-muted)] max-w-2xl leading-relaxed">
              Djupgående analys av ärendets struktur, bevisvärdering och juridiska hållbarhet. 
              Identifierar automatiskt svagheter och styrkor i argumentation.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setShowUpload(!showUpload)}
              className="px-8 py-4 bg-[var(--bg-main)] border border-[var(--border)] text-[var(--ink-main)] rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:border-[var(--accent)] transition-all flex items-center gap-3 active:scale-95"
            >
              <Search size={18} /> Komplettera bevis
            </button>
            <button 
              onClick={runAnalysis}
              disabled={isAnalyzing || isOffline}
              className="px-10 py-4 bg-[var(--ink-main)] text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-[var(--accent)] transition-all flex items-center gap-3 shadow-xl shadow-[var(--ink-main)]/10 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {isAnalyzing ? (
                <Activity className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
              {isAnalyzing ? 'Analyserar...' : 'Starta Analys'}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {isAnalyzing && (
          <div className="mt-10 space-y-3">
            <div className="flex justify-between text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest">
              <span>Bearbetar steg {activeStep} av 5</span>
              <span>{Math.round(analysisProgress)}%</span>
            </div>
            <div className="h-3 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border)]">
              <motion.div 
                className="h-full bg-[var(--accent)]"
                initial={{ width: 0 }}
                animate={{ width: `${analysisProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-inner">
              <FileUpload onFilesSelect={(files) => console.log('Files selected:', files)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Status */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xs font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Zap size={14} className="text-[var(--accent)]" /> Analyssteg
            </h3>
            
            <div className="space-y-4">
              {pipelineSteps.map((step, idx) => {
                const isCompleted = activeStep > step.id || (!isAnalyzing && activeStep === 0);
                const isActive = activeStep === step.id;

                return (
                  <div 
                    key={step.id}
                    className={`
                      flex items-center gap-6 p-6 rounded-[1.5rem] border transition-all duration-500
                      ${isActive ? 'border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.02]' : 'border-transparent bg-[var(--bg-main)]/50'}
                    `}
                  >
                    <div className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                      ${isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-[var(--accent)] text-white animate-pulse' : 'bg-[var(--bg-main)] text-[var(--ink-muted)]'}
                    `}>
                      {isCompleted ? <CheckCircle2 size={24} /> : <step.icon size={24} />}
                    </div>
                    
                    <div className="flex-grow">
                      <h4 className={`text-lg font-black tracking-tight ${isActive ? 'text-[var(--ink-main)]' : 'text-[var(--ink-muted)]'}`}>
                        {step.label}
                      </h4>
                      <p className="text-xs font-medium text-[var(--ink-muted)]">{step.desc}</p>
                    </div>

                    {isCompleted && (
                      <div className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                        Klar
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-[var(--ink-main)] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Brain size={120} />
            </div>
            <h3 className="text-2xl font-black mb-6 tracking-tight">Strategiska AI-Insikter</h3>
            <div className="space-y-6">
              <div className="flex gap-4 p-6 bg-white/5 rounded-[1.5rem] border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <AlertCircle size={20} />
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-300">
                  <span className="text-white font-bold block mb-1 uppercase text-[10px] tracking-widest">Bevisgap identifierat</span>
                  Det saknas skriftlig bekräftelse på det muntliga avtalet från 2023-11-14. Rekommenderar att begära ut loggar från kommunikationssystemet.
                </p>
              </div>
              <div className="flex gap-4 p-6 bg-white/5 rounded-[1.5rem] border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-300">
                  <span className="text-white font-bold block mb-1 uppercase text-[10px] tracking-widest">Stark korrelation</span>
                  Vittnesmål från expertvittne matchar teknisk data med 98% konfidensgrad. Detta stärker kausalitetssambandet avsevärt.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Fact Atoms & Links */}
        <div className="space-y-8">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xs font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Activity size={14} className="text-[var(--accent)]" /> Faktum-Atomer
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Tidpunkt för händelse', value: '2023-12-01', status: 'Verifierad' },
                { label: 'Plats', value: 'Stockholm HQ', status: 'Verifierad' },
                { label: 'Parter', value: 'CIS vs. Global Corp', status: 'Verifierad' },
                { label: 'Avtalsbelopp', value: '2.4M SEK', status: 'Overifierad' },
              ].map((atom, i) => (
                <div key={i} className="p-4 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] group hover:border-[var(--accent)]/50 transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest">{atom.label}</span>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${atom.status === 'Verifierad' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {atom.status}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-[var(--ink-main)]">{atom.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xs font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <LinkIcon size={14} className="text-[var(--accent)]" /> Länkade Anspråk
            </h3>
            <div className="space-y-4">
              <div className="p-5 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)]">
                <div className="text-xs font-black text-[var(--ink-main)] mb-2 uppercase tracking-tight">Skadeståndskrav #442</div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[var(--ink-muted)]">Status: Aktiv</span>
                  <ChevronRight size={14} className="text-[var(--ink-muted)]" />
                </div>
              </div>
              <button className="w-full py-4 border-2 border-dashed border-[var(--border)] rounded-2xl text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
                + Koppla nytt anspråk
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseAnalysisView;
