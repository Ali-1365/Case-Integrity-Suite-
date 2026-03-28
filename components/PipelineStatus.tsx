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
      <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm relative overflow-hidden group transition-all duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 relative z-10">
              <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Systemstatus</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intelligenskärna v.7.2.2-GOLD</p>
              </div>
              
              <div className="flex items-center gap-4">
                  <div className={`flex items-center space-x-3 px-4 py-2 border rounded text-[10px] font-bold uppercase tracking-widest transition-all ${integrityVerified ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                      {isVerifying ? (
                          <span className="animate-pulse flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                            Validerar...
                          </span>
                      ) : integrityVerified ? (
                          <>
                              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                              <span>Integritet Verifierad</span>
                          </>
                      ) : (
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full" />
                            Integritet Väntar
                          </span>
                      )}
                  </div>
                  <div className="hidden lg:flex items-center space-x-4 text-[9px] text-slate-400 font-bold bg-slate-50 px-6 py-2 rounded uppercase tracking-widest border border-slate-100">
                      <div className="animate-marquee inline-block">
                          Systemnav • Monitor • Inventering • Beslutsmotor • Produktion • Analys • Oracle • Kontroll • Notarie • Logg • Juridik • SFB • Arkiv • Vitbok
                      </div>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4 relative z-10">
            {stages.map((stageName) => {
                const statusValue = status.stages[stageName];
                const isActive = statusValue === 'active';
                const isSuccess = statusValue === 'success';
                const isError = statusValue === 'error';
                
                return (
                  <div key={stageName} className={`p-4 rounded border transition-all duration-500 ${isActive ? 'border-slate-900 bg-slate-50' : isSuccess ? 'border-emerald-100 bg-emerald-50/30' : isError ? 'border-rose-100 bg-rose-50/30' : 'border-slate-100 bg-white'}`}>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">{stageName}</span>
                      <div className={`text-xs font-bold tracking-tight leading-none ${isActive ? 'text-slate-900' : isSuccess ? 'text-emerald-600' : isError ? 'text-rose-600' : 'text-slate-300'}`}>
                          {statusValue === 'active' ? 'KÖR' : statusValue === 'success' ? 'LÅST' : isError ? 'FEL' : 'VÄNTAR'}
                      </div>
                      {isActive && (
                          <div className="mt-3 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-900 animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
                          </div>
                      )}
                      {isSuccess && (
                        <div className="mt-2 flex justify-end">
                            <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
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
