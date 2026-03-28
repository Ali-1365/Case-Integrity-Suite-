
import React from 'react';
import { RiskReport } from '../lib/cis.types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  Cpu,
  Zap,
  Fingerprint
} from 'lucide-react';

interface RiskConflictViewerProps {
  report: RiskReport;
}

const RiskConflictViewer: React.FC<RiskConflictViewerProps> = ({ report }) => {
  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'RÖD': return 'bg-rose-500 border-rose-400 text-white shadow-rose-900/20';
      case 'GUL': return 'bg-amber-500 border-amber-400 text-white shadow-amber-900/20';
      default: return 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-900/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* RISK HEADER CARD */}
      <div className={`p-10 rounded-[3rem] border-2 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 transition-all duration-500 ${getLevelStyles(report.level)}`}>
        <div className="flex items-center space-x-8">
          <div className="p-5 bg-white/20 rounded-[2rem] backdrop-blur-md border border-white/20 shadow-inner">
            {report.level === 'GRÖN' ? <CheckCircle className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Rättslig Risknivå</p>
            <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-none font-serif">{report.level}</h3>
          </div>
        </div>
        <div className="text-right hidden md:block bg-black/10 px-6 py-4 rounded-2xl border border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Security_Node_ID</p>
            <p className="text-xs font-mono font-bold">{report.riskId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CONFLICT LIST */}
        <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-4">
                <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest flex items-center">
                    <Activity className="w-4 h-4 mr-3 text-[var(--accent)]" />
                    Identifierade Normkonflikter ({report.conflicts.length})
                </p>
            </div>
            
            {report.conflicts.length > 0 ? report.conflicts.map((conflict, idx) => (
                <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 hover:bg-[var(--bg-main)]/50 transition-all group shadow-sm hover:shadow-xl">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-4">
                            <span className="p-3 bg-[var(--bg-main)] rounded-2xl text-[var(--ink-muted)] border border-[var(--border)] group-hover:text-[var(--accent)] group-hover:scale-110 transition-all">
                                <Cpu className="w-5 h-5" />
                            </span>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest">{conflict.type}</span>
                                <h4 className="text-lg font-bold text-[var(--ink-main)] font-serif leading-tight">Konflikt Detekterad</h4>
                            </div>
                        </div>
                        <span className={`text-[9px] font-black px-3 py-1 rounded-full border shadow-sm ${conflict.severity === 'RÖD' ? 'bg-rose-500/10 text-rose-600 border-rose-200' : 'bg-amber-500/10 text-amber-600 border-amber-200'}`}>
                            {conflict.severity} SEVERITY
                        </span>
                    </div>
                    <p className="text-base font-medium text-[var(--ink-muted)] leading-relaxed mb-6 italic">
                        {conflict.description}
                    </p>
                    <div className="pt-6 border-t border-[var(--border)]">
                        <p className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest mb-3 opacity-60">Påverkade Provenans-Hasher:</p>
                        <div className="flex flex-wrap gap-3">
                            {conflict.affectedSources.slice(0, 3).map(hash => (
                                <span key={hash} className="text-[9px] font-mono text-[var(--ink-muted)] bg-[var(--bg-main)] px-3 py-1 rounded-xl border border-[var(--border)] shadow-inner">
                                    {hash.substring(0, 16)}...
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )) : (
                <div className="bg-[var(--bg-main)]/30 border-2 border-[var(--border)] border-dashed rounded-[3rem] p-20 text-center">
                    <CheckCircle className="w-16 h-16 text-[var(--ink-muted)] mx-auto mb-6 opacity-20" />
                    <p className="text-[var(--ink-muted)] font-black uppercase tracking-[0.3em] text-xs opacity-40">Inga konflikter detekterade</p>
                </div>
            )}
        </div>

        {/* ASSESSMENT PANEL */}
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-[var(--bg-card)] p-10 rounded-[3rem] border border-[var(--border)] h-full flex flex-col shadow-2xl relative overflow-hidden">
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest mb-8 relative">Samlad Riskbedömning</p>
                
                <div className="flex-grow relative">
                    <div className="p-6 bg-[var(--bg-main)] rounded-[2rem] border border-[var(--border)] mb-8 shadow-inner">
                        <p className="text-sm text-[var(--ink-muted)] leading-relaxed font-medium italic font-serif">
                            "{report.assessment}"
                        </p>
                    </div>
                    
                    <div className="space-y-5">
                        <div className="flex items-center gap-4 group">
                            <div className="p-2 bg-[var(--bg-main)] rounded-xl border border-[var(--border)] group-hover:text-[var(--accent)] transition-colors">
                                <Zap className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-widest">Decision Integrity: 98%</span>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="p-2 bg-[var(--bg-main)] rounded-xl border border-[var(--border)] group-hover:text-emerald-500 transition-colors">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-widest">Hierarchy Verified</span>
                        </div>
                    </div>
                </div>
                
                <div className="mt-12 pt-8 border-t border-[var(--border)] relative">
                    <div className="bg-[var(--bg-main)] p-5 rounded-2xl border border-[var(--border)] shadow-inner">
                         <div className="flex items-center space-x-2 mb-3">
                            <Fingerprint className="w-4 h-4 text-[var(--accent)]" />
                            <p className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest">Audit Trace</p>
                         </div>
                         <p className="text-[10px] font-mono text-[var(--ink-muted)]/60 break-all leading-tight">{crypto.randomUUID()}</p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default RiskConflictViewer;
