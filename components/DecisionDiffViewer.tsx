import React from 'react';
import { DecisionDiff } from '../lib/DecisionDiffEngine';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  BoltIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  TrashIcon
} from './icons';

interface DecisionDiffViewerProps {
  diff: DecisionDiff;
}

const DecisionDiffViewer: React.FC<DecisionDiffViewerProps> = ({ diff }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* GRID FOR CHANGES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* PROPOSAL DIFF */}
        <DiffCard 
          label="Beslutsförslag" 
          changed={diff.proposalChanged}
          oldValue={diff.oldProposal}
          newValue={diff.newProposal}
          icon={<BoltIcon />}
        />

        {/* RISK DIFF */}
        <DiffCard 
          label="Risknivå" 
          changed={diff.riskLevelChanged}
          oldValue={diff.oldRisk}
          newValue={diff.newRisk}
          icon={<ExclamationTriangleIcon />}
          colorScale
        />

        {/* PROP DIFF */}
        <DiffCard 
          label="Proportionalitet" 
          changed={diff.proportionalityChanged}
          oldValue={diff.oldProp}
          newValue={diff.newProp}
          icon={<AdjustmentsHorizontalIcon />}
        />
      </div>

      {/* ACTIONS DIFF */}
      {(diff.(addedActions as { length: number }).length > 0 || diff.(removedActions as { length: number }).length > 0) && (
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Förändringar i Åtgärdsplan</p>
          <div className="space-y-3">
            {diff.addedActions.map((a, i) => (
              <div key={`add-${i}`} className="flex items-center space-x-3 text-emerald-400 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
                <PlusIcon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold">{a}</span>
              </div>
            ))}
            {diff.removedActions.map((a, i) => (
              <div key={`rem-${i}`} className="flex items-center space-x-3 text-red-400 bg-red-500/5 p-3 rounded-xl border border-red-500/20">
                <TrashIcon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold line-through opacity-50">{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DiffCard: React.FC<{ label: string, changed: boolean, oldValue?: string, newValue: string, icon: React.ReactNode, colorScale?: boolean }> = ({ label, changed, oldValue, newValue, icon, colorScale }) => {
  const getValColor = (val: string) => {
    if (!colorScale) return 'text-white';
    if (val === 'RÖD' || val === 'HIGH') return 'text-red-500';
    if (val === 'GUL' || val === 'MEDIUM') return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <div className={`p-6 rounded-3xl border transition-all ${changed ? 'bg-cyan-500/5 border-cyan-500/30 shadow-[inset_0_0_20px_rgba(34,211,238,0.05)]' : 'bg-gray-950 border-gray-800'}`}>
      <div className="flex items-center space-x-3 mb-4 text-gray-500">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      
      <div className="flex items-center justify-between">
        {oldValue && (
          <>
            <span className={`text-sm font-bold opacity-40 ${getValColor(oldValue)}`}>{oldValue}</span>
            <ArrowRightIcon className="w-4 h-4 text-gray-700" />
          </>
        )}
        <span className={`text-lg font-black italic tracking-tighter ${getValColor(newValue)}`}>{newValue}</span>
      </div>
      
      {changed && (
        <div className="mt-4 flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
            <span className="text-[8px] font-black text-cyan-600 uppercase tracking-tighter">Ändring Detekterad</span>
        </div>
      )}
    </div>
  );
};

// Added ArrowRightIcon since it's used in DiffCard but not imported
const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
);

export default DecisionDiffViewer;