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
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[5rem] p-16 shadow-[0_40px_100px_rgba(0,0,0,0.06)] relative overflow-hidden group transition-all duration-1000 hover:shadow-[0_60px_150px_rgba(0,0,0,0.12)]">
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 opacity-80" />
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] group-hover:bg-indigo-500/15 transition-colors duration-1000" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-16 relative z-10">
              <div className="space-y-4">
                  <h2 className="text-5xl font-serif font-black text-slate-900 dark:text-white tracking-tighter leading-none">Systemstatus</h2>
                  <div className="flex items-center gap-6">
                    <div className="h-2 w-12 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    <p className="text-[13px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.5em] opacity-100">Intelligenskärna v.7.2.2-GOLD</p>
                  </div>
              </div>
              
              <div className="flex items-center gap-8">
                  <div className={`flex items-center space-x-6 px-8 py-4 border-2 rounded-[3rem] text-[12px] font-black uppercase tracking-[0.4em] transition-all shadow-md backdrop-blur-md ${integrityVerified ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'}`}>
                      {isVerifying ? (
                          <span className="animate-pulse flex items-center gap-4">
                            <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping" />
                            Validerar...
                          </span>
                      ) : integrityVerified ? (
                          <>
                              <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                              <span>Integritet Verifierad</span>
                          </>
                      ) : (
                          <span className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-amber-500 rounded-full" />
                            Integritet Väntar
                          </span>
                      )}
                  </div>
                  <div className="hidden lg:flex items-center space-x-6 text-[12px] text-slate-500 font-black bg-slate-50 dark:bg-slate-800 px-10 py-4 rounded-full uppercase tracking-[0.4em] overflow-hidden whitespace-nowrap border-2 border-slate-100 dark:border-slate-700 shadow-inner">
                      <div className="animate-marquee inline-block">
                          Systemnav • Monitor • Inventering • Beslutsmotor • Produktion • Analys • Oracle • Kontroll • Notarie • Logg • Juridik • SFB • Arkiv • Vitbok
                      </div>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-8 relative z-10">
            {stages.map((stageName) => {
                const statusValue = status.stages[stageName];
                const isActive = statusValue === 'active';
                const isSuccess = statusValue === 'success';
                const isError = statusValue === 'error';
                
                return (
                  <div key={stageName} className={`p-10 rounded-[3.5rem] border-2 transition-all duration-1000 hover:-translate-y-3 shadow-md relative overflow-hidden group/stage ${isActive ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-900/30 scale-110 z-20 shadow-[0_30px_70px_rgba(79,70,229,0.3)]' : isSuccess ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/20' : isError ? 'border-rose-200 bg-rose-50/50 dark:bg-rose-900/20' : 'border-slate-100 bg-slate-50/50 dark:bg-slate-800/50'}`}>
                      {isActive && (
                        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                      )}
                      <span className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4 block opacity-70 group-hover/stage:text-indigo-500 transition-colors duration-500">{stageName}</span>
                      <div className={`text-2xl font-serif font-black tracking-tighter leading-none ${isActive ? 'text-indigo-700 dark:text-indigo-400' : isSuccess ? 'text-emerald-700 dark:text-emerald-400' : isError ? 'text-rose-700 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                          {statusValue === 'active' ? 'KÖR' : statusValue === 'success' ? 'LÅST' : isError ? 'FEL' : 'VÄNTAR'}
                      </div>
                      {isActive && (
                          <div className="mt-6 h-2 w-full bg-indigo-200 dark:bg-indigo-800 rounded-full overflow-hidden shadow-inner">
                              <div className="h-full bg-indigo-500 animate-[loading_1.5s_ease-in-out_infinite] shadow-[0_0_15px_rgba(99,102,241,0.6)]" style={{ width: '40%' }} />
                          </div>
                      )}
                      {isSuccess && (
                        <div className="mt-5 flex justify-end">
                            <CheckCircleIcon className="w-7 h-7 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
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
