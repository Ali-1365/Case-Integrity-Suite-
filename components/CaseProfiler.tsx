
import React from 'react';
import { CISCase as Case, DecisionSupportResult } from '../lib/cis.types';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  DocumentTextIcon,
  ScaleIcon,
  UserGroupIcon
} from './icons';
import Card from './shared/Card';

interface CaseProfilerProps {
  caseData: Case;
}

export const CaseProfiler: React.FC<CaseProfilerProps> = ({ caseData }) => {
  const result = caseData.activeResult;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'INITIERAT': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'UNDER_UTREDNING': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'BESLUTAT': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
      case 'AVSLUTAT': return 'text-slate-500 bg-slate-50 dark:bg-slate-900/20';
      default: return 'text-slate-500 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'RÖD': return 'text-rose-500';
      case 'GUL': return 'text-amber-500';
      case 'GRÖN': return 'text-emerald-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center ${getStatusColor(caseData.status)}`}>
          <ClockIcon className="w-6 h-6 mb-2" />
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Status</span>
          <span className="text-sm font-black mt-1">{caseData.status}</span>
        </div>
        
        <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center text-center">
          <ShieldCheckIcon className="w-6 h-6 mb-2 text-indigo-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Version</span>
          <span className="text-sm font-black text-slate-900 dark:text-white mt-1">v.{caseData.currentVersion}</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center text-center">
          <ExclamationTriangleIcon className={`w-6 h-6 mb-2 ${result ? getRiskColor(result.machineReadable.riskLevel) : 'text-slate-300'}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Riskprofil</span>
          <span className={`text-sm font-black mt-1 ${result ? getRiskColor(result.machineReadable.riskLevel) : 'text-slate-300'}`}>
            {result ? result.machineReadable.riskLevel : 'EJ ANALYSERAD'}
          </span>
        </div>
      </div>

      <Card title="Ärendeprofil & Nyckelinfo" icon={<DocumentTextIcon className="w-4 h-4"/>}>
        <div className="space-y-4">
          <div className="flex justify-between items-start border-b border-slate-50 dark:border-slate-800 pb-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Frågeställning</p>
              <p className="text-sm text-slate-900 dark:text-white font-medium">{caseData.query}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Skapat</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{new Date(caseData.createdAt).toLocaleString('sv-SE')}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Senast ändrad</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{new Date(caseData.updatedAt).toLocaleString('sv-SE')}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {caseData.priorityFlags.hasChildAspect && (
              <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[9px] font-bold uppercase tracking-wider rounded-md border border-purple-100 dark:border-purple-800 flex items-center gap-1">
                <UserGroupIcon className="w-3 h-3" /> Barnperspektiv
              </span>
            )}
            {caseData.priorityFlags.isPreventive && (
              <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider rounded-md border border-emerald-100 dark:border-emerald-800 flex items-center gap-1">
                <ShieldCheckIcon className="w-3 h-3" /> Förebyggande
              </span>
            )}
          </div>
        </div>
      </Card>

      {result && (
        <Card title="Beslutsstöd & Rekommendation" icon={<ScaleIcon className="w-4 h-4"/>}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${result.proposal === 'JA' ? 'bg-emerald-500/10 text-emerald-500' : result.proposal === 'NEJ' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  <CheckCircleIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Förslag till beslut</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{result.proposal}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sammanfattning</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                "{result.summary}"
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
