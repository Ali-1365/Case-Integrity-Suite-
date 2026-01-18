
import React from 'react';
import { ActionRecommendationReport, ActionItem } from '../lib/ActionRecommendationService';
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
      case 'MILDER_ALTERNATIVE': return <AdjustmentsHorizontalIcon className="w-6 h-6 text-cyan-400" />;
      case 'FURTHER_INVESTIGATION': return <InformationCircleIcon className="w-6 h-6 text-indigo-400" />;
      default: return <SparklesIcon className="w-6 h-6 text-emerald-400" />;
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
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* IMPACT HEADER */}
      <div className="bg-gray-800/40 border-l-8 border-indigo-600 p-8 rounded-r-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
              <BoltIcon className="w-48 h-48 text-indigo-500" />
          </div>
          <div className="relative z-10">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2">Påverkan på beslutet</p>
              <h3 className="text-xl font-black text-white italic leading-relaxed">
                  "{report.impactOnDecision}"
              </h3>
          </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center ml-2">
              <ArrowPathIcon className="w-3 h-3 mr-2" />
              Rekommenderade Åtgärder ({report.recommendations.length})
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {report.recommendations.map((action) => (
                  <div key={action.id} className="bg-gray-900 border border-gray-800 rounded-[2rem] p-8 flex flex-col hover:border-indigo-500/30 transition-all group">
                      <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-gray-950 rounded-2xl border border-gray-800 group-hover:scale-110 transition-transform">
                              {getCategoryIcon(action.category)}
                          </div>
                          <span className="text-[9px] font-mono text-gray-700 font-bold uppercase">{action.id}</span>
                      </div>
                      
                      <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2">
                          {getCategoryLabel(action.category)}
                      </p>
                      
                      <h4 className="text-base font-bold text-white mb-4 leading-tight">
                          {action.description}
                      </h4>
                      
                      <div className="flex-grow p-4 bg-black/40 rounded-xl mb-6 border border-white/5">
                          <p className="text-xs text-gray-400 leading-relaxed italic">
                              "{action.motivation}"
                          </p>
                      </div>

                      <div className="pt-4 border-t border-gray-800 mt-auto flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-[9px] font-black text-cyan-500 uppercase tracking-tighter">
                              <LawIcon className="w-3 h-3" />
                              <span>{action.legalReference}</span>
                          </div>
                          <CheckCircleIcon className="w-4 h-4 text-gray-700 group-hover:text-green-500 transition-colors" />
                      </div>
                  </div>
              ))}
          </div>
      </div>

      <div className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-[2rem] flex items-center justify-between">
          <div className="flex items-center space-x-4">
              <CpuChipIcon className="w-8 h-8 text-indigo-400" />
              <div>
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Action_Audit_Node</p>
                  <p className="text-xs font-mono text-gray-500">{report.actionId}</p>
              </div>
          </div>
          <div className="text-right">
              <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Strategy Framework: FMJAM GOLD v1.4</span>
          </div>
      </div>
    </div>
  );
};

export default ActionRecommendationViewer;
