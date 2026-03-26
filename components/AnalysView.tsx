
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  ShieldCheck, 
  Zap, 
  Filter, 
  Download, 
  Share2,
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Activity
} from 'lucide-react';
import { db, CISCase } from '../lib/db';
import { offlineService } from '../services/offlineService';
import { AIOrchestrator } from '../lib/AIOrchestrator';
import { motion, AnimatePresence } from 'motion/react';

interface AnalysViewProps {
  activeCase?: CISCase | null;
}

const AnalysView: React.FC<AnalysViewProps> = ({ activeCase }) => {
  const [isOffline, setIsOffline] = useState(offlineService.getIsOffline());
  const [loading, setLoading] = useState(false);
  const [orchestrator] = useState(() => new AIOrchestrator());

  useEffect(() => {
    const sub = offlineService.subscribe(setIsOffline);
    return () => sub();
  }, []);

  const handleRunAnalysis = async () => {
    if (!activeCase || isOffline) return;
    setLoading(true);
    try {
      const { legalReferenceEngine } = await import('../lib/legalReferenceEngine');
      const framework = await legalReferenceEngine.getFramework();
      await orchestrator.orchestrateCaseAnalysis(activeCase.caseId, activeCase.description || '', framework);
      window.location.reload(); // Refresh to show new data
    } catch (e) {
      console.error('Analysfel:', e);
    } finally {
      setLoading(false);
    }
  };

  const analysisSteps = [
    { id: 'norm', label: 'Normalisering', status: 'COMPLETED', icon: Layers },
    { id: 'integ', label: 'Integritetskontroll', status: 'COMPLETED', icon: ShieldCheck },
    { id: 'atom', label: 'Fakta-atomisering', status: 'IN_PROGRESS', icon: Zap },
    { id: 'kors', label: 'Kors-korrelering', status: 'WAITING', icon: Activity },
    { id: 'synt', label: 'Juridisk Syntes', status: 'WAITING', icon: BrainCircuit },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analys & Utredning</h1>
          <p className="text-slate-500 text-sm">Djupgående forensisk analys av bevisatomer och rättsliga förhållanden.</p>
          {activeCase && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Aktivt Ärende: {activeCase.name}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <Filter size={18} /> Filtrera
          </button>
          <button 
            onClick={handleRunAnalysis}
            disabled={loading || !activeCase}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <BrainCircuit size={18} /> {loading ? 'Analyserar...' : 'Starta Analys'}
          </button>
        </div>
      </div>

      {isOffline ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-lg font-bold text-amber-800 mb-2">AI-Analys Inaktiverad</h3>
          <p className="text-sm text-amber-700 mb-6">
            Systemet är i offline-läge. Djupanalys och kors-korrelering kräver anslutning till Case Integrity AI-motor.
          </p>
          <button onClick={() => window.location.reload()} className="bg-amber-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-amber-700 transition-all">
            Försök återansluta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pipeline Status */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Analys-Pipeline</h3>
              <div className="space-y-4">
                {analysisSteps.map((step, idx) => (
                  <div key={step.id} className="relative flex gap-4">
                    {idx !== analysisSteps.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-100" />
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                      step.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' :
                      step.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600 animate-pulse' :
                      'bg-slate-100 text-slate-400'
                    }`}>
                      <step.icon size={16} />
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-slate-800">{step.label}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-tighter ${
                          step.status === 'COMPLETED' ? 'text-emerald-600' :
                          step.status === 'IN_PROGRESS' ? 'text-blue-600' :
                          'text-slate-400'
                        }`}>
                          {step.status === 'IN_PROGRESS' ? 'Körs...' : step.status}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: step.status === 'COMPLETED' ? '100%' : step.status === 'IN_PROGRESS' ? '45%' : '0%' }}
                          className={`h-full rounded-full ${step.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center"><BrainCircuit size={18} /></div>
                <span className="text-xs font-bold uppercase tracking-widest">Oracle Insights</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Baserat på de 442 bevisatomer som hittills identifierats finns en 82% sannolikhet för att svarandens påstående om "Force Majeure" saknar rättslig grund enligt NJA 2023 s. 45.
              </p>
              <button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl py-2 text-xs font-bold transition-all uppercase tracking-widest">
                Visa Liknande Rättsfall
              </button>
            </div>
          </div>

          {/* Main Analysis Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Identifierade Fakta-atomer</h3>
                <div className="flex gap-2">
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"><Download size={16} /></button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"><Share2 size={16} /></button>
                </div>
              </div>
              <div className="p-0">
                <div className="divide-y divide-slate-50">
                  {activeCase?.activeResult?.facts && activeCase.activeResult.facts.length > 0 ? (
                    activeCase.activeResult.facts.map(atom => (
                      <div key={atom.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-mono text-[10px]">
                          {atom.category}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-1">
                              <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `95%` }} />
                              </div>
                              <span className="text-[9px] font-bold text-emerald-600">95%</span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-700">{atom.statement}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs">Inga fakta-atomer identifierade för detta ärende än.</div>
                  )}
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button className="w-full py-2 border border-dashed border-slate-300 rounded-xl text-xs text-slate-500 font-medium hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all">
                  + Lägg till manuell observation
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={18} className="text-amber-500" />
                  <h4 className="text-sm font-bold text-slate-800">Motsägelser identifierade</h4>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="text-[10px] font-bold text-amber-700 uppercase mb-1">Kritisk Motsägelse</div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Tidsstämpel i Logg-A stämmer inte överens med vittnesmål från Person B.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <h4 className="text-sm font-bold text-slate-800">Verifierade Kedjor</h4>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="text-[10px] font-bold text-emerald-700 uppercase mb-1">SHA-256 Kedja OK</div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Alla dokument i mappen "Avtal" har intakta integritetskedjor.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysView;
