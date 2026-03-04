import React from 'react';
import { Spinner, CheckCircleIcon, ShieldCheckIcon, CpuChipIcon, BoltIcon, ArrowPathIcon } from './icons';

export type StageStatus = 'idle' | 'active' | 'success' | 'error';

export interface PipelineStatusState {
  stages: {
    säkerhet: StageStatus;
    normalisering: StageStatus;
    integritet: StageStatus;
    indata: StageStatus;
    'för-analys': StageStatus;
    'ai-analys': StageStatus;
    'kors-korrelering': StageStatus;
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
        case 'active': return 'text-blue-700 border-blue-300 bg-blue-50';
        case 'success': return 'text-green-800 border-green-300 bg-green-50';
        case 'error': return 'text-red-800 border-red-300 bg-red-50';
        default: return 'text-slate-500 border-slate-200 bg-slate-50';
    }
};

const PipelineStatus: React.FC<{ status: PipelineStatusState }> = ({ status }) => {
    const stages = Object.keys(status.stages) as (keyof PipelineStatusState['stages'])[];
  
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-serif font-medium text-slate-900">Systemstatus: Intelligence Core v.7.2.2-GOLD</h2>
              <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
                  <span>Real-time Forensic Monitoring</span>
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
                          {statusValue === 'active' ? 'RUNNING' : statusValue === 'success' ? 'LOCKED' : 'WAITING'}
                      </div>
                  </div>
                );
            })}
          </div>
      </div>
    );
};

export default PipelineStatus;
