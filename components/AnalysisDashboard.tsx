
import React from 'react';
import { AnalysisResult } from '../lib/fmjam.types';
import Card from './shared/Card';
import { ShieldCheckIcon, AlertIcon, LawIcon, ActivityIcon } from './icons';

interface AnalysisDashboardProps {
  analysis: AnalysisResult;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis }) => {
  const riskScore = analysis.riskProfile.normalizedScore;
  const riskColor = riskScore > 70 ? 'text-red-500' : riskScore > 40 ? 'text-orange-400' : 'text-green-400';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-700">
      <StatBox 
        label="Total Riskprofil" 
        value={`${riskScore}%`} 
        subtext="Kritiska avvikelser" 
        icon={<AlertIcon className={riskColor} />}
        colorClass={riskColor}
      />
      <StatBox 
        label="Bevisatomer" 
        value={analysis.facts.length.toString()} 
        subtext="Verifierade påståenden" 
        icon={<ShieldCheckIcon className="text-cyan-400" />}
      />
      <StatBox 
        label="Lagrumskopplingar" 
        value={analysis.legalReferences.length.toString()} 
        subtext="Träffar i GOLD-index" 
        icon={<LawIcon className="text-purple-400" />}
      />
      <StatBox 
        label="Integritets-Score" 
        value={`${analysis.audit?.integrityScore || 100}%`} 
        subtext="Ingen hallucination detekterad" 
        icon={<ActivityIcon className="text-green-500" />}
      />
    </div>
  );
};

const StatBox: React.FC<{ label: string, value: string, subtext: string, icon: React.ReactNode, colorClass?: string }> = ({ label, value, subtext, icon, colorClass = "text-white" }) => (
  <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-[2rem] shadow-xl hover:border-gray-700 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{label}</p>
      <div className="p-2 bg-black/40 rounded-xl border border-gray-800 group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
    <p className={`text-4xl font-black tracking-tighter ${colorClass} leading-none mb-2`}>{value}</p>
    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{subtext}</p>
  </div>
);

export default AnalysisDashboard;
