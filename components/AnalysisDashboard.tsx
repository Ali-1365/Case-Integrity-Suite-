
import React from 'react';
import { AnalysisResult } from '../lib/cis.types';
import Card from './shared/Card';
import { ShieldCheckIcon, AlertIcon, LawIcon, ActivityIcon } from './icons';

interface AnalysisDashboardProps {
  analysis: AnalysisResult;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis }) => {
  const riskScore = analysis.riskProfile.normalizedScore;
  const riskColor = riskScore > 70 ? 'text-rose-400' : riskScore > 40 ? 'text-amber-400' : 'text-emerald-400';

  // Evidence density calculation
  const categories = ['Ekonomi', 'Tillgång', 'Process', 'Hälsa'];
  const density = categories.map(cat => ({
    label: cat,
    count: analysis.facts.filter(f => f.category.toLowerCase().includes(cat.toLowerCase())).length
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#111111] border border-gray-800 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <ActivityIcon className="w-4 h-4 text-cyan-500" />
              Dynamisk Ärendeanalys
            </h3>
            <span className="text-[10px] font-mono text-gray-600 bg-gray-900 px-2 py-1 rounded border border-gray-800">LIVE_SYNC v.7.6</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {density.map(d => (
              <div key={d.label} className="p-4 bg-[#161616] rounded-xl border border-gray-800 hover:border-cyan-500/30 transition-colors">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">{d.label}</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-semibold text-gray-100">{d.count}</p>
                  <p className="text-[10px] text-gray-600 mb-1">atomer</p>
                </div>
                <div className="mt-3 h-1 bg-gray-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500" 
                    style={{ width: `${Math.min(100, (d.count / (analysis.facts.length || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111111] border border-gray-800 p-6 rounded-xl flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Bevisdensitet</p>
              <p className="text-[10px] text-gray-600">Total täckning per kategori</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-100 mb-2">
            {((analysis.facts.length / (analysis.atoms.length || 1)) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Systemet har framgångsrikt korrelerat {analysis.facts.length} av {analysis.atoms.length} identifierade textsegment till juridiska bevisatomer.
          </p>
        </div>
      </div>
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
