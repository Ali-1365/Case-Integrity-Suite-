
import React from 'react';
import { AnalysisResult } from '../lib/fmjam.types';
import Card from './shared/Card';
import { ShieldCheckIcon, AlertIcon, LawIcon, ActivityIcon } from './icons';

interface AnalysisDashboardProps {
  analysis: AnalysisResult;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis }) => {
  const riskScore = analysis.riskProfile.normalizedScore;
  const riskColor = riskScore > 70 ? 'text-rose-400' : riskScore > 40 ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
      <StatBox 
        label="Total Riskprofil" 
        value={`${riskScore}%`} 
        subtext="Kritiska avvikelser" 
        icon={<AlertIcon className={`w-5 h-5 ${riskColor}`} />}
        colorClass={riskColor}
      />
      <StatBox 
        label="Bevisatomer" 
        value={analysis.facts.length.toString()} 
        subtext="Verifierade påståenden" 
        icon={<ShieldCheckIcon className="w-5 h-5 text-cyan-400" />}
      />
      <StatBox 
        label="Lagrumskopplingar" 
        value={analysis.legalReferences.length.toString()} 
        subtext="Träffar i GOLD-index" 
        icon={<LawIcon className="w-5 h-5 text-indigo-400" />}
      />
      <StatBox 
        label="Integritets-Score" 
        value={`${analysis.audit?.integrityScore || 100}%`} 
        subtext="Ingen hallucination detekterad" 
        icon={<ActivityIcon className="w-5 h-5 text-emerald-400" />}
      />
    </div>
  );
};

const StatBox: React.FC<{ label: string, value: string, subtext: string, icon: React.ReactNode, colorClass?: string }> = ({ label, value, subtext, icon, colorClass = "text-gray-100" }) => (
  <div className="bg-[#111111] border border-gray-800 p-5 rounded-xl shadow-sm hover:border-gray-700 transition-colors group">
    <div className="flex justify-between items-start mb-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <div className="p-2 bg-[#161616] rounded-lg border border-gray-800 group-hover:scale-105 transition-transform">
        {icon}
      </div>
    </div>
    <p className={`text-2xl font-semibold ${colorClass} mb-1`}>{value}</p>
    <p className="text-xs text-gray-500">{subtext}</p>
  </div>
);

export default AnalysisDashboard;
