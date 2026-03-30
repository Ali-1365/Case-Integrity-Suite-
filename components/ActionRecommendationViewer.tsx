
import React from 'react';
import { ActionRecommendationReport, ActionItem } from '../lib/cis.types';
import { 
  BoltIcon, 
  CheckCircleIcon, 
  InformationCircleIcon, 
  ArrowPathIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  LawIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon
} from './icons';

interface ActionRecommendationViewerProps {
  report: ActionRecommendationReport;
}

const ActionRecommendationViewer: React.FC<ActionRecommendationViewerProps> = ({ report }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MILDER_ALTERNATIVE': return <AdjustmentsHorizontalIcon className="w-8 h-8 text-[var(--accent)]" />;
      case 'FURTHER_INVESTIGATION': return <InformationCircleIcon className="w-8 h-8 text-[var(--accent)]" />;
      default: return <SparklesIcon className="w-8 h-8 text-[var(--accent)]" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'MILDER_ALTERNATIVE': return 'Mildare Alternativ';
      case 'FURTHER_INVESTIGATION': return 'Kompletterande Utredning';
      default: return 'Korrigerande Åtgärd';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      
      {/* IMPACT HEADER */}
      <div className="bg-[var(--bg-card)] border-l-8 border-[var(--accent)] p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
              <BoltIcon className="w-64 h-64 text-[var(--accent)]" />
          </div>
          <div className="relative z-10">
              <p className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.4em] mb-4 italic opacity-70">Påverkan på beslutet</p>
              <h3 className="text-2xl font-black text-[var(--ink-main)] italic leading-relaxed uppercase tracking-tighter">
                  "{report.impactOnDecision}"
              </h3>
          </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
          <div className="flex items-center justify-between px-4">
            <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] flex items-center italic opacity-60">
                <ArrowPathIcon className="w-4 h-4 mr-3 text-[var(--accent)]" />
                Rekommenderade Åtgärder ({report.recommendations.length})
            </p>
            <div className="h-[1px] flex-1 bg-[var(--border-strong)] mx-8 opacity-30"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {report.recommendations.map((action) => (
                  <div key={action.id} className="bg-[var(--bg-card)] border border-[var(--border-strong)] p-10 flex flex-col hover:border-[var(--accent)]/40 transition-all group shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex justify-between items-start mb-8">
                          <div className="p-4 bg-[var(--accent)]/10 border border-[var(--accent)]/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                              {getCategoryIcon(action.category)}
                          </div>
                          <span className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest opacity-40 font-mono italic">{action.id}</span>
                      </div>
                      
                      <p className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.2em] mb-3 italic">
                          {getCategoryLabel(action.category)}
                      </p>
                      
                      <h4 className="text-lg font-black text-[var(--ink-main)] mb-6 leading-tight uppercase italic tracking-tight">
                          {action.description}
                      </h4>
                      
                      <div className="flex-grow p-6 bg-[var(--bg-main)]/50 border border-[var(--border)] mb-8 group-hover:bg-[var(--bg-main)] transition-colors">
                          <p className="text-xs text-[var(--ink-muted)] leading-relaxed italic font-black uppercase tracking-tight opacity-80">
                              "{action.motivation}"
                          </p>
                      </div>

                      <div className="pt-6 border-t border-[var(--border)] mt-auto flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-[9px] font-black text-[var(--accent)] uppercase tracking-widest italic">
                              <LawIcon className="w-4 h-4" />
                              <span>{action.legalReference}</span>
                          </div>
                          <div className="p-1.5 rounded-full bg-[var(--success)]/10 border border-[var(--success)]/20">
                            <CheckCircleIcon className="w-4 h-4 text-[var(--success)] opacity-40 group-hover:opacity-100 transition-opacity" />
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] p-10 shadow-2xl flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]/30"></div>
          <div className="flex items-center space-x-6 relative z-10">
              <div className="p-3 bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                <CpuChipIcon className="w-10 h-10 text-[var(--accent)]" />
              </div>
              <div>
                  <p className="text-[10px] font-black text-[var(--ink-main)] uppercase tracking-[0.3em] italic">Action_Audit_Node</p>
                  <p className="text-[10px] font-mono text-[var(--ink-muted)] uppercase tracking-widest mt-1 opacity-50">{report.actionId}</p>
              </div>
          </div>
          <div className="text-right relative z-10">
              <span className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] italic opacity-40">Strategy Framework: FMJAM GOLD v1.4</span>
          </div>
          
          {/* Decorative background */}
          <div className="absolute right-0 bottom-0 opacity-[0.02] pointer-events-none">
            <CpuChipIcon className="w-48 h-48 text-[var(--accent)]" />
          </div>
      </div>
    </div>
  );
};


export default ActionRecommendationViewer;
