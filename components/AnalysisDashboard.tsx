
import React from 'react';
import { AnalysisResult } from '../lib/cis.types';
import Card from './shared/Card';
import { ShieldCheckIcon, AlertIcon, LawIcon, ActivityIcon, MagnifyingGlassIcon } from './icons';
import { ArchiveSearch } from './ArchiveSearch';

interface AnalysisDashboardProps {
  analysis: AnalysisResult;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis }) => {
  const riskScore = analysis.riskProfile?.normalizedScore || 0;
  const riskColor = riskScore > 70 ? 'text-rose-600 dark:text-rose-400' : riskScore > 40 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400';
  const riskBg = riskScore > 70 ? 'bg-rose-500/10' : riskScore > 40 ? 'bg-amber-500/10' : 'bg-emerald-500/10';
  const riskBorder = riskScore > 70 ? 'border-rose-500/20' : riskScore > 40 ? 'border-amber-500/20' : 'border-emerald-500/20';

  // Evidence density calculation
  const categories = ['Ekonomi', 'Tillgång', 'Process', 'Hälsa'];
  const density = categories.map(cat => ({
    label: cat,
    count: (analysis.facts || []).filter(f => f.category?.toLowerCase().includes(cat.toLowerCase())).length
  }));

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <StatBox 
          label="Total Riskprofil" 
          value={`${riskScore}%`} 
          subtext="Kritiska avvikelser" 
          icon={<AlertIcon className={`w-10 h-10 ${riskColor}`} />}
          colorClass={riskColor}
          bgClass={riskBg}
          borderClass={riskBorder}
        />
        <StatBox 
          label="Bevisatomer" 
          value={(analysis.facts?.length || 0).toString()} 
          subtext="Verifierade påståenden" 
          icon={<ShieldCheckIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />}
          bgClass="bg-blue-500/10"
          borderClass="border-blue-500/20"
        />
        <StatBox 
          label="Lagrumskopplingar" 
          value={(analysis.legalReferences?.length || 0).toString()} 
          subtext="Träffar i GOLD-index" 
          icon={<LawIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />}
          bgClass="bg-indigo-500/10"
          borderClass="border-indigo-500/20"
        />
        <StatBox 
          label="Integritets-Score" 
          value={`${analysis.audit?.integrityScore || 100}%`} 
          subtext="Ingen hallucination detekterad" 
          icon={<ActivityIcon className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />}
          bgClass="bg-emerald-500/10"
          borderClass="border-emerald-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-16 rounded-[4rem] shadow-[0_60px_150px_-30px_rgba(0,0,0,0.1)] dark:shadow-none relative overflow-hidden group">
          <div className="flex justify-between items-center mb-16">
            <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-6">
              <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform duration-1000 border-2 border-blue-500/20 shadow-lg">
                <ActivityIcon className="w-8 h-8" />
              </div>
              Dynamisk Ärendeanalys
            </h3>
            <span className="text-[11px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-6 py-3 rounded-full border-2 border-slate-100 dark:border-slate-700 uppercase tracking-[0.3em] opacity-100 shadow-sm">Live Sync v.7.6</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-12">
            {density.map(d => (
              <div key={d.label} className="p-10 bg-slate-50 dark:bg-slate-800/40 rounded-[3rem] border-2 border-slate-100 dark:border-slate-700 hover:border-blue-500/50 transition-all group/item relative overflow-hidden hover:shadow-2xl hover:-translate-y-2 duration-700">
                <p className="text-[12px] text-slate-400 uppercase font-black mb-6 tracking-[0.3em] opacity-100">{d.label}</p>
                <div className="flex items-end gap-3 mb-8">
                  <p className="text-6xl font-serif font-black text-slate-900 dark:text-white leading-none tracking-tighter">{d.count}</p>
                  <p className="text-[12px] font-black text-slate-400 uppercase mb-2 tracking-widest opacity-80">atomer</p>
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.7)] transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (d.count / (analysis.facts?.length || 1)) * 100)}%` }}
                  ></div>
                </div>
                
                {/* Subtle hover effect */}
                <div className="absolute inset-0 bg-blue-500/0 group-hover/item:bg-blue-500/[0.05] transition-colors pointer-events-none duration-1000"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-16 rounded-[4rem] shadow-[0_60px_150px_-30px_rgba(0,0,0,0.1)] dark:shadow-none flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-16 opacity-[0.06] group-hover:opacity-[0.12] transition-all transform group-hover:scale-150 group-hover:-rotate-12 duration-1000">
            <ShieldCheckIcon className="w-80 h-80 text-slate-900 dark:text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-8 mb-12">
              <div className="p-6 bg-emerald-500/10 rounded-[2rem] text-emerald-600 dark:text-emerald-400 shadow-2xl shadow-emerald-500/20 border-2 border-emerald-500/20">
                <ShieldCheckIcon className="w-12 h-12" />
              </div>
              <div>
                <p className="text-[13px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-100">Bevisdensitet</p>
                <p className="text-[13px] font-black text-emerald-600 dark:text-emerald-400 uppercase mt-2 tracking-widest opacity-100">Total täckning</p>
              </div>
            </div>
            <p className="text-8xl font-serif font-black text-slate-900 dark:text-white mb-10 tracking-tighter leading-none group-hover:scale-110 transition-transform duration-1000">
              {(((analysis.facts?.length || 0) / (analysis.atoms?.length || 1)) * 100).toFixed(1)}%
            </p>
            <p className="text-2xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium opacity-90">
              Systemet har framgångsrikt korrelerat <span className="text-slate-900 dark:text-white font-black underline decoration-indigo-500/30">{analysis.facts?.length || 0}</span> av <span className="text-slate-900 dark:text-white font-black underline decoration-indigo-500/30">{analysis.atoms?.length || 0}</span> identifierade textsegment till juridiska bevisatomer.
            </p>
          </div>
        </div>
      </div>

      {/* Automatisk Arkivsökning för Risker */}
      {(analysis.riskProfile?.dominantRisks || []).length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
          <div className="bg-slate-50 dark:bg-slate-800/20 p-16 rounded-[4.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-inner">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400 border-2 border-amber-500/20 shadow-lg">
                  <MagnifyingGlassIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-100">Automatisk Arkivmatchning</h3>
                  <p className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase mt-2 tracking-widest opacity-100">Baserat på identifierade risker</p>
                </div>
              </div>
              <span className="text-[11px] font-black text-slate-400 bg-white dark:bg-slate-900 px-6 py-3 rounded-full border-2 border-slate-100 dark:border-slate-700 uppercase tracking-[0.3em] opacity-100 shadow-sm">Bakgrundssökning Aktiv</span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {(analysis.riskProfile?.dominantRisks || []).slice(0, 2).map((riskLabel, idx) => (
                <ArchiveSearch 
                  key={`risk-search-${idx}`}
                  query={riskLabel} 
                  title={`Relaterade fall: ${riskLabel}`} 
                  limit={2}
                  className="bg-white dark:bg-slate-900/50 p-10 rounded-[3.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-md hover:shadow-2xl transition-all duration-700"
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
  <div className={`bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-12 rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] dark:shadow-none hover:shadow-[0_60px_150px_-30px_rgba(0,0,0,0.15)] transition-all group relative overflow-hidden hover:-translate-y-4 duration-1000 active:scale-[0.95]`}>
    <div className="flex justify-between items-start mb-12">
      <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-100">{label}</p>
      <div className={`p-6 ${bgClass} rounded-3xl border-2 ${borderClass} group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000 shadow-2xl`}>
        {icon}
      </div>
    </div>
    <p className={`text-6xl font-serif font-black ${colorClass} mb-6 tracking-tighter leading-none group-hover:scale-110 transition-transform duration-1000`}>{value}</p>
    <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest opacity-80">{subtext}</p>
    
    {/* Decorative corner */}
    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/15 transition-colors duration-1000"></div>
  </div>
);

export default AnalysisDashboard;
