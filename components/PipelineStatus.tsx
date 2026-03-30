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
        case 'active': return 'text-[var(--accent)] border-[var(--accent)]/30 bg-[var(--accent)]/5';
        case 'success': return 'text-[var(--success)] border-[var(--success)]/30 bg-[var(--success)]/5';
        case 'error': return 'text-[var(--danger)] border-[var(--danger)]/30 bg-[var(--danger)]/5';
        default: return 'text-[var(--ink-muted)] border-[var(--border)] bg-[var(--bg-main)]';
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
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8 shadow-sm relative overflow-hidden group transition-all duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 relative z-10">
              <div className="space-y-1">
                  <h2 className="text-xl font-bold text-[var(--ink-main)] tracking-tight">Systemstatus</h2>
                  <p className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-widest">Intelligenskärna v.7.2.2-GOLD</p>
              </div>
              
              <div className="flex items-center gap-4">
                  <div className={`flex items-center space-x-3 px-4 py-2 border rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${integrityVerified ? 'bg-[var(--success)]/5 border-[var(--success)]/20 text-[var(--success)]' : 'bg-[var(--warning)]/5 border-[var(--warning)]/20 text-[var(--warning)]'}`}>
                      {isVerifying ? (
                          <span className="animate-pulse flex items-center gap-2">
                            <div className="w-2 h-2 bg-[var(--warning)] rounded-full animate-ping" />
                            Validerar...
                          </span>
                      ) : integrityVerified ? (
                          <>
                              <div className="w-2 h-2 bg-[var(--success)] rounded-full" />
                              <span>Integritet Verifierad</span>
                          </>
                      ) : (
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[var(--warning)] rounded-full" />
                            Integritet Väntar
                          </span>
                      )}
                  </div>
                  <div className="hidden lg:flex items-center space-x-4 text-[9px] text-[var(--ink-muted)] font-bold bg-[var(--bg-main)] px-6 py-2 rounded-lg uppercase tracking-widest border border-[var(--border)]">
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
                  <div key={stageName} className={`p-4 rounded-xl border transition-all duration-500 ${isActive ? 'border-[var(--accent)] bg-[var(--accent)]/5' : isSuccess ? 'border-[var(--success)]/20 bg-[var(--success)]/5' : isError ? 'border-[var(--danger)]/20 bg-[var(--danger)]/5' : 'border-[var(--border)] bg-[var(--bg-card)]'}`}>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-2 block">{stageName}</span>
                      <div className={`text-xs font-bold tracking-tight leading-none ${isActive ? 'text-[var(--accent)]' : isSuccess ? 'text-[var(--success)]' : isError ? 'text-[var(--danger)]' : 'text-[var(--ink-light)]'}`}>
                          {statusValue === 'active' ? 'KÖR' : statusValue === 'success' ? 'LÅST' : isError ? 'FEL' : 'VÄNTAR'}
                      </div>
                      {isActive && (
                          <div className="mt-3 h-1 w-full bg-[var(--border)] rounded-full overflow-hidden">
                              <div className="h-full bg-[var(--accent)] animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
                          </div>
                      )}
                      {isSuccess && (
                        <div className="mt-2 flex justify-end">
                            <CheckCircleIcon className="w-4 h-4 text-[var(--success)]" />
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
