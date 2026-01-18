import React from 'react';
import { Spinner, CheckCircleIcon, ShieldCheckIcon, CpuChipIcon, BoltIcon } from './icons';

export type StageStatus = 'idle' | 'active' | 'success' | 'error';

export interface PipelineStatusState {
  stages: {
    säkerhet: StageStatus;
    normalisering: StageStatus;
    integritet: StageStatus;
    indata: StageStatus;
    'för-analys': StageStatus;
    'ai-analys': StageStatus;
    'kors-korrelering': StageStatus; // Nytt steg för batch
    syntes: StageStatus;
    resultat: StageStatus;
  };
  log: { stage: string; message: string, status: StageStatus, metadata?: any }[];
}

export const initialPipelineStatus: PipelineStatusState = {
  stages: {
    säkerhet: 'idle',
    normalisering: 'idle',
    integritet: 'idle',
    indata: 'idle',
    'för-analys': 'idle',
    'ai-analys': 'idle',
    'kors-korrelering': 'idle',
    syntes: 'idle',
    resultat: 'idle',
  },
  log: [],
};

const getStatusColor = (status: StageStatus) => {
  switch (status) {
    case 'active': return 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_25px_rgba(34,211,238,0.25)]';
    case 'success': return 'text-green-400 border-green-500/30 bg-green-500/5';
    case 'error': return 'text-red-500 border-red-500/40 bg-red-500/10';
    default: return 'text-slate-700 border-slate-800 bg-transparent opacity-30';
  }
};

const PipelineStatus: React.FC<{ status: PipelineStatusState }> = ({ status }) => {
    const stages = Object.keys(status.stages) as (keyof PipelineStatusState['stages'])[];
    const activeStage = stages.find(s => status.stages[s] === 'active');
    const latestLog = status.log[status.log.length - 1];
    const isNormalizing = activeStage === 'normalisering' || (latestLog?.metadata?.noiseLevel > 0.15);
  
    return (
      <div className="bg-slate-950/60 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group ring-1 ring-white/5">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between px-10 py-5 border-b border-slate-800/50 bg-slate-900/20">
              <div className="flex items-center space-x-5">
                  <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                      <CpuChipIcon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] leading-none italic">Intelligence Core v.7.2.2-GOLD</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest">Real-time Forensic Monitoring</p>
                  </div>
              </div>
              <div className="flex items-center space-x-6">
                  {isNormalizing && (
                      <div className="flex items-center space-x-3 bg-yellow-500/10 px-5 py-2 rounded-full border border-yellow-500/20 animate-pulse">
                          <ArrowPathIcon className="w-4 h-4 text-yellow-400 animate-spin" />
                          <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest italic">Denoising Input...</span>
                      </div>
                  )}
                  <div className="flex items-center space-x-3 bg-indigo-500/10 px-5 py-2 rounded-full border border-indigo-500/20">
                      <BoltIcon className="w-4 h-4 text-indigo-400 animate-pulse" />
                      <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">BATCH_MODE_ACTIVE</span>
                  </div>
              </div>
          </div>

          {/* Logic Grid */}
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-1.5 p-2.5 bg-black/20">
            {stages.map((stageName) => {
                const colorClasses = getStatusColor(status.stages[stageName]);
                return (
                  <div key={stageName} className={`relative p-5 rounded-2xl border transition-all duration-700 ${colorClasses}`}>
                      <div className="flex justify-between items-start">
                          <span className="text-[9px] font-black uppercase tracking-widest opacity-80 italic">{stageName}</span>
                          {status.stages[stageName] === 'success' && <CheckCircleIcon className="h-4 w-4" />}
                          {status.stages[stageName] === 'active' && <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping shadow-[0_0_100px_rgba(34,211,238,1)]" />}
                      </div>
                      <div className="mt-3 text-[11px] font-mono font-black italic">
                          {status.stages[stageName] === 'active' ? 'RUNNING' : 
                           status.stages[stageName] === 'success' ? 'LOCKED' : 
                           status.stages[stageName] === 'error' ? 'FAILURE' : 'WAITING'}
                      </div>
                  </div>
                );
            })}
          </div>

          {/* Forensic Log Stream */}
          <div className="mx-3 mb-3 bg-black/60 rounded-[1.5rem] p-4 border border-slate-800/50 flex items-center justify-between shadow-inner">
              <div className="flex items-center space-x-5 text-xs font-mono text-slate-500">
                  <div className="flex items-center space-x-2">
                      <span className="text-cyan-800 font-black">#</span>
                      <span className="text-[10px] text-slate-600 font-bold">BATCH_065_SYNC</span>
                  </div>
                  {status.log.length > 0 ? (
                      <span className="animate-in slide-in-from-left duration-500 text-slate-300 font-medium">
                          {status.log[status.log.length - 1].message}
                      </span>
                  ) : (
                      <span className="opacity-30 italic">System initialization sequence complete. Waiting for batch ingest...</span>
                  )}
              </div>
              <div className="flex items-center space-x-3 px-4 py-1.5 bg-slate-900 rounded-full border border-slate-800">
                  <ShieldCheckIcon className="h-4 w-4 text-green-500/60" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Batch Chain</span>
              </div>
          </div>
      </div>
    );
};

const ArrowPathIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export default PipelineStatus;