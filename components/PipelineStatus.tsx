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
  log: { stage: string; message: string, status: StageStatus, metadata?: Record<string, unknown> }[];
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
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-serif font-medium text-slate-900">Systemstatus: Intelligenskärna v.7.2.2-GOLD</h2>
              <div className="flex items-center gap-2">
                  <div className={`flex items-center space-x-2 px-3 py-1 border rounded text-[9px] font-bold uppercase tracking-widest transition-all ${integrityVerified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                      {isVerifying ? (
                          <span className="animate-pulse">Validerar...</span>
                      ) : integrityVerified ? (
                          <>
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              <span>Integritet Verifierad</span>
                          </>
                      ) : (
                          <span>Integritet Väntar</span>
                      )}
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-bold bg-slate-100 px-4 py-1.5 rounded-full uppercase tracking-widest overflow-hidden whitespace-nowrap">
                      <div className="animate-marquee inline-block">
                          Systemnav • Monitor • Inventering • Beslutsmotor • Produktion • Analys • Oracle • Kontroll • Notarie • Logg • Juridik • SFB • Arkiv • Vitbok
                      </div>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4">
            {stages.map((stageName) => {
                const statusValue = status.stages[stageName];
                const isActive = statusValue === 'active';
                const isSuccess = statusValue === 'success';
                
                return (
                  <div key={stageName} className={`p-4 rounded-xl border ${isActive ? 'border-blue-300 bg-blue-50' : isSuccess ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stageName}</span>
                      <div className={`mt-1 text-xs font-semibold ${isActive ? 'text-blue-800' : isSuccess ? 'text-green-800' : 'text-slate-700'}`}>
                          {statusValue === 'active' ? 'KÖR' : statusValue === 'success' ? 'LÅST' : 'VÄNTAR'}
                      </div>
                  </div>
                );
            })}
          </div>
      </div>
    );
};

export default PipelineStatus;
