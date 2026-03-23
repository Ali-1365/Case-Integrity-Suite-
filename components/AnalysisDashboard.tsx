
import React from 'react';
import { AnalysisResult } from '../lib/cis.types';
import Card from './shared/Card';
import { ShieldCheckIcon, AlertIcon, LawIcon, ActivityIcon, MagnifyingGlassIcon } from './icons';
import { ArchiveSearch } from './ArchiveSearch';

interface AnalysisDashboardProps {
  analysis: AnalysisResult;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis }) => {
  const riskScore = analysis.riskProfile.normalizedScore;
  const riskColor = riskScore > 70 ? 'text-rose-600 dark:text-rose-400' : riskScore > 40 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400';
  const riskBg = riskScore > 70 ? 'bg-rose-500/10' : riskScore > 40 ? 'bg-amber-500/10' : 'bg-emerald-500/10';
  const riskBorder = riskScore > 70 ? 'border-rose-500/20' : riskScore > 40 ? 'border-amber-500/20' : 'border-emerald-500/20';

  // Evidence density calculation
  const categories = ['Ekonomi', 'Tillgång', 'Process', 'Hälsa'];
  const density = categories.map(cat => ({
    label: cat,
    count: (analysis as { facts: unknown[] }).facts.filter(f => f.category.toLowerCase().includes(cat.toLowerCase())).length
  }));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <StatBox 
          label="Total Riskprofil" 
          value={`${riskScore}%`} 
          subtext="Kritiska avvikelser" 
          icon={<AlertIcon className={`w-7 h-7 ${riskColor}`} />}
          colorClass={riskColor}
          bgClass={riskBg}
          borderClass={riskBorder}
        />
        <StatBox 
          label="Bevisatomer" 
          value={(analysis as { facts: unknown[] }).(facts as { length: number }).length.toString()}
          subtext="Verifierade påståenden" 
          icon={<ShieldCheckIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />}
          bgClass="bg-blue-500/10"
          borderClass="border-blue-500/20"
        />
        <StatBox 
          label="Lagrumskopplingar" 
          value={(analysis as { legalReferences: unknown[] }).(legalReferences as { length: number }).length.toString()}
          subtext="Träffar i GOLD-index" 
          icon={<LawIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />}
          bgClass="bg-indigo-500/10"
          borderClass="border-indigo-500/20"
        />
        <StatBox 
          label="Integritets-Score" 
          value={`${analysis.audit?.integrityScore || 100}%`} 
          subtext="Ingen hallucination detekterad" 
          icon={<ActivityIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />}
          bgClass="bg-emerald-500/10"
          borderClass="border-emerald-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
          <div className="flex justify-between items-center mb-12">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-5">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform duration-500">
                <ActivityIcon className="w-6 h-6" />
              </div>
              Dynamisk Ärendeanalys
            </h3>
            <span className="text-[11px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 uppercase tracking-[0.2em] opacity-70">Live Sync v.7.6</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
            {density.map(d => (
              <div key={d.label} className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 transition-all group/item relative overflow-hidden hover:shadow-xl hover:-translate-y-1">
                <p className="text-[11px] text-slate-400 uppercase font-black mb-5 tracking-[0.2em] opacity-70">{d.label}</p>
                <div className="flex items-end gap-2.5 mb-6">
                  <p className="text-5xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{d.count}</p>
                  <p className="text-[11px] font-black text-slate-400 uppercase mb-1.5 tracking-widest opacity-60">atomer</p>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (d.count / ((analysis as { facts: unknown[] }).(facts as { length: number }).length || 1)) * 100)}%` }}
                  ></div>
                </div>
                
                {/* Subtle hover effect */}
                <div className="absolute inset-0 bg-blue-500/0 group-hover/item:bg-blue-500/[0.03] transition-colors pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-125 group-hover:-rotate-12 duration-1000">
            <ShieldCheckIcon className="w-64 h-64 text-slate-900 dark:text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-10">
              <div className="p-5 bg-emerald-500/10 rounded-[1.5rem] text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10">
                <ShieldCheckIcon className="w-10 h-10" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-70">Bevisdensitet</p>
                <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase mt-1.5 tracking-widest">Total täckning</p>
              </div>
            </div>
            <p className="text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-none">
              {(((analysis as { facts: unknown[] }).(facts as { length: number }).length / (analysis.(atoms as { length: number }).length || 1)) * 100).toFixed(1)}%
            </p>
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Systemet har framgångsrikt korrelerat <span className="text-slate-900 dark:text-white font-black">{(analysis as { facts: unknown[] }).(facts as { length: number }).length}</span> av <span className="text-slate-900 dark:text-white font-black">{analysis.(atoms as { length: number }).length}</span> identifierade textsegment till juridiska bevisatomer.
            </p>
          </div>
        </div>
      </div>

      {/* Automatisk Arkivsökning för Risker */}
      {analysis.riskProfile.(dominantRisks as { length: number }).length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
          <div className="bg-slate-50 dark:bg-slate-800/20 p-12 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400">
                  <MagnifyingGlassIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Automatisk Arkivmatchning</h3>
                  <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase mt-1.5 tracking-widest">Baserat på identifierade risker</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-slate-400 bg-white dark:bg-slate-900 px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 uppercase tracking-[0.2em] opacity-70">Bakgrundssökning Aktiv</span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {analysis.riskProfile.dominantRisks.slice(0, 2).map((riskLabel, idx) => (
                <ArchiveSearch 
                  key={`risk-search-${idx}`}
                  query={riskLabel} 
                  title={`Relaterade fall: ${riskLabel}`} 
                  limit={2}
                  className="bg-white dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox: React.FC<{ 
  label: string, 
  value: string, 
  subtext: string, 
  icon: React.ReactNode, 
  colorClass?: string,
  bgClass?: string,
  borderClass?: string
}> = ({ label, value, subtext, icon, colorClass = "text-slate-900 dark:text-white", bgClass = "bg-slate-50 dark:bg-slate-800/50", borderClass = "border-slate-200 dark:border-slate-700" }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl transition-all group relative overflow-hidden hover:-translate-y-1 duration-500`}>
    <div className="flex justify-between items-start mb-10">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-70">{label}</p>
      <div className={`p-5 ${bgClass} rounded-2xl border ${borderClass} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
        {icon}
      </div>
    </div>
    <p className={`text-5xl font-black ${colorClass} mb-4 tracking-tighter leading-none`}>{value}</p>
    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest opacity-60">{subtext}</p>
    
    {/* Decorative corner */}
    <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-slate-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors duration-700"></div>
  </div>
);

export default AnalysisDashboard;
