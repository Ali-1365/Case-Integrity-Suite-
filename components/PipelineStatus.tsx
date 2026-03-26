import React from 'react';
import { Spinner, CheckCircleIcon, ShieldCheckIcon, CpuChipIcon, BoltIcon, ArrowPathIcon } from './icons';

export type StageStatus = 'idle' | 'active' | 'success' | 'error';

export interface PipelineStatusState {
  status?: 'idle' | 'running' | 'completed' | 'error';
  currentStep?: string;
  progress?: number;
  stages: {
    normalisering: StageStatus;
    integritet: StageStatus;
    indata: StageStatus;
    'för-analys': StageStatus;
    'ai-analys': StageStatus;
    'kors-korrelering': StageStatus;
    syntes: StageStatus;
    resultat: StageStatus;
    säkerhet: StageStatus;
  };
  log: { stage: string; message: string, status: StageStatus, metadata?: any }[];
}

export const initialPipelineStatus: PipelineStatusState = {
  status: 'idle',
  currentStep: '',
  progress: 0,
  stages: {
    normalisering: 'idle',
    integritet: 'idle',
    indata: 'idle',
    'för-analys': 'idle',
    'ai-analys': 'idle',
    'kors-korrelering': 'idle',
    syntes: 'idle',
    resultat: 'idle',
    säkerhet: 'idle',
  },
  log: [],
};

const getStatusColor = (status: StageStatus) => {
    switch (status) {
        case 'active': return 'text-blue-700 border-blue-300 bg-blue-50';
        case 'success': return 'text-green-800 border-green-300 bg-green-50';
        case 'error': return 'text-red-800 border-red-300 bg-red-50';
        default: return 'text-slate-500 border-slate-200 bg-slate-50';
    }
};

const PipelineStatus: React.FC<{ status: PipelineStatusState }> = ({ status }) => {
    const [integrityVerified, setIntegrityVerified] = React.useState(false);
    const [isVerifying, setIsVerifying] = React.useState(false);

    React.useEffect(() => {
        const checkIntegrity = async () => {
            setIsVerifying(true);
            try {
                const response = await fetch('/api/verify-integrity');
                if (response.ok) {
                    setIntegrityVerified(true);
                }
            } catch (e) {
                console.error('Integrity check failed');
            } finally {
                setIsVerifying(false);
            }
        };
        checkIntegrity().catch(err => console.error("checkIntegrity failed:", err));
    }, []);

    const stages = Object.keys(status.stages) as (keyof PipelineStatusState['stages'])[];
  
    return (
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3.5rem] p-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
              <div>
                  <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Systemstatus</h2>
                  <p className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] opacity-80">Intelligenskärna v.7.2.2-GOLD</p>
              </div>
              
              <div className="flex items-center gap-4">
                  <div className={`flex items-center space-x-3 px-5 py-2.5 border-2 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${integrityVerified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'}`}>
                      {isVerifying ? (
                          <span className="animate-pulse">Validerar...</span>
                      ) : integrityVerified ? (
                          <>
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                              <span>Integritet Verifierad</span>
                          </>
                      ) : (
                          <span>Integritet Väntar</span>
                      )}
                  </div>
                  <div className="hidden lg:flex items-center space-x-3 text-[10px] text-slate-500 font-black bg-slate-50 dark:bg-slate-800 px-6 py-2.5 rounded-full uppercase tracking-widest overflow-hidden whitespace-nowrap border-2 border-slate-100 dark:border-slate-700 shadow-inner">
                      <div className="animate-marquee inline-block">
                          Systemnav • Monitor • Inventering • Beslutsmotor • Produktion • Analys • Oracle • Kontroll • Notarie • Logg • Juridik • SFB • Arkiv • Vitbok
                      </div>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-6">
            {stages.map((stageName) => {
                const statusValue = status.stages[stageName];
                const isActive = statusValue === 'active';
                const isSuccess = statusValue === 'success';
                
                return (
                  <div key={stageName} className={`p-6 rounded-[2.5rem] border-2 transition-all duration-500 hover:-translate-y-1 shadow-sm ${isActive ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 scale-105 z-10 shadow-indigo-500/10' : isSuccess ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-100 bg-slate-50 dark:bg-slate-800/50'}`}>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block opacity-70">{stageName}</span>
                      <div className={`text-sm font-serif font-bold tracking-tight ${isActive ? 'text-indigo-700 dark:text-indigo-400' : isSuccess ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                          {statusValue === 'active' ? 'KÖR' : statusValue === 'success' ? 'LÅST' : 'VÄNTAR'}
                      </div>
                      {isActive && (
                          <div className="mt-3 h-1 w-full bg-indigo-200 dark:bg-indigo-800 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
                          </div>
                      )}
                  </div>
                );
            })}
          </div>
      </div>
    );
};

export default PipelineStatus;
