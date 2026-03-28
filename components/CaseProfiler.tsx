
import React from 'react';
import { CISCase as Case, DecisionSupportResult } from '../lib/cis.types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Scale,
  Users
} from 'lucide-react';
import Card from './shared/Card';

interface CaseProfilerProps {
  caseData: Case;
}

export const CaseProfiler: React.FC<CaseProfilerProps> = ({ caseData }) => {
  const result = caseData.activeResult;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'INITIERAT': return 'text-[var(--accent)] bg-[var(--bg-main)] border-[var(--accent)]/20';
      case 'UNDER_UTREDNING': return 'text-[var(--warning)] bg-[var(--bg-main)] border-[var(--warning)]/20';
      case 'BESLUTAT': return 'text-[var(--success)] bg-[var(--bg-main)] border-[var(--success)]/20';
      case 'AVSLUTAT': return 'text-[var(--ink-muted)] bg-[var(--bg-main)] border-[var(--border)]';
      default: return 'text-[var(--ink-muted)] bg-[var(--bg-main)] border-[var(--border)]';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'RÖD': return 'text-[var(--danger)]';
      case 'GUL': return 'text-[var(--warning)]';
      case 'GRÖN': return 'text-[var(--success)]';
      default: return 'text-[var(--ink-muted)]';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-[2rem] border flex flex-col items-center text-center shadow-sm ${getStatusColor(caseData.status)}`}>
          <Clock className="w-6 h-6 mb-2" />
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Status</span>
          <span className="text-sm font-black mt-1">{caseData.status}</span>
        </div>
        
        <div className="p-6 rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)] flex flex-col items-center text-center shadow-sm">
          <ShieldCheck className="w-6 h-6 mb-2 text-[var(--accent)]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)]">Version</span>
          <span className="text-sm font-black text-[var(--ink-main)] mt-1">v.{caseData.currentVersion}</span>
        </div>

        <div className="p-6 rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)] flex flex-col items-center text-center shadow-sm">
          <AlertTriangle className={`w-6 h-6 mb-2 ${result ? getRiskColor(result.machineReadable.riskLevel) : 'text-[var(--ink-muted)]/30'}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)]">Riskprofil</span>
          <span className={`text-sm font-black mt-1 ${result ? getRiskColor(result.machineReadable.riskLevel) : 'text-[var(--ink-muted)]/30'}`}>
            {result ? result.machineReadable.riskLevel : 'EJ ANALYSERAD'}
          </span>
        </div>
      </div>

      <Card title="Ärendeprofil & Nyckelinfo" icon={<FileText className="w-4 h-4"/>}>
        <div className="space-y-4">
          <div className="flex justify-between items-start border-b border-[var(--border)] pb-3">
            <div>
              <p className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-widest mb-1">Frågeställning</p>
              <p className="text-sm text-[var(--ink-main)] font-medium font-serif italic">"{caseData.query}"</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-widest mb-1">Skapat</p>
              <p className="text-xs text-[var(--ink-muted)] font-mono">{new Date(caseData.createdAt).toLocaleString('sv-SE')}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-widest mb-1">Senast ändrad</p>
              <p className="text-xs text-[var(--ink-muted)] font-mono">{new Date(caseData.updatedAt).toLocaleString('sv-SE')}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {caseData.priorityFlags.hasChildAspect && (
              <span className="px-3 py-1 bg-[var(--bg-main)] text-[var(--accent)] text-[9px] font-bold uppercase tracking-wider rounded-full border border-[var(--border)] flex items-center gap-1 shadow-sm">
                <Users className="w-3 h-3" /> Barnperspektiv
              </span>
            )}
            {caseData.priorityFlags.isPreventive && (
              <span className="px-3 py-1 bg-[var(--bg-main)] text-[var(--success)] text-[9px] font-bold uppercase tracking-wider rounded-full border border-[var(--border)] flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3 h-3" /> Förebyggande
              </span>
            )}
          </div>
        </div>
      </Card>

      {result && (
        <Card title="Beslutsstöd & Rekommendation" icon={<Scale className="w-4 h-4"/>}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] shadow-inner">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${result.proposal === 'JA' ? 'bg-[var(--success)]/10 text-[var(--success)]' : result.proposal === 'NEJ' ? 'bg-[var(--danger)]/10 text-[var(--danger)]' : 'bg-[var(--warning)]/10 text-[var(--warning)]'}`}>
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-widest">Förslag till beslut</p>
                  <p className="text-sm font-black text-[var(--ink-main)] font-serif uppercase italic">{result.proposal}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-sm">
              <p className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-widest mb-2">Sammanfattning</p>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed italic font-serif">
                "{result.summary}"
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
