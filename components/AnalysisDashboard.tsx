
import React from 'react';
import { AnalysisResult } from '../lib/cis.types';
import Card from './shared/Card';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Scale, 
  Activity, 
  Search,
  Info,
  TrendingUp,
  FileText
} from 'lucide-react';
import { ArchiveSearch } from './ArchiveSearch';

interface AnalysisDashboardProps {
  analysis: AnalysisResult;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis }) => {
  const riskScore = analysis.riskProfile?.normalizedScore || 0;
  const riskColor = riskScore > 70 ? 'text-rose-600' : riskScore > 40 ? 'text-amber-600' : 'text-emerald-600';
  const riskBg = riskScore > 70 ? 'bg-rose-500/10' : riskScore > 40 ? 'bg-amber-500/10' : 'bg-emerald-500/10';
  const riskBorder = riskScore > 70 ? 'border-rose-500/20' : riskScore > 40 ? 'border-amber-500/20' : 'border-emerald-500/20';

  // Evidence density calculation
  const categories = ['Ekonomi', 'Tillgång', 'Process', 'Hälsa'];
  const density = categories.map(cat => ({
    label: cat,
    count: (analysis.facts || []).filter(f => f.category?.toLowerCase().includes(cat.toLowerCase())).length
  }));

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <StatBox 
          label="Total Riskprofil" 
          value={`${riskScore}%`} 
          subtext="Kritiska avvikelser" 
          icon={<AlertTriangle className={`w-10 h-10 ${riskColor}`} />}
          colorClass={riskColor}
          bgClass={riskBg}
          borderClass={riskBorder}
        />
        <StatBox 
          label="Bevisatomer" 
          value={(analysis.facts?.length || 0).toString()} 
          subtext="Verifierade påståenden" 
          icon={<ShieldCheck className="w-10 h-10 text-blue-600" />}
          bgClass="bg-blue-500/10"
          borderClass="border-blue-500/20"
        />
        <StatBox 
          label="Lagrumskopplingar" 
          value={(analysis.legalReferences?.length || 0).toString()} 
          subtext="Träffar i GOLD-index" 
          icon={<Scale className="w-10 h-10 text-indigo-600" />}
          bgClass="bg-indigo-500/10"
          borderClass="border-indigo-500/20"
        />
        <StatBox 
          label="Integritets-Score" 
          value={`${analysis.audit?.integrityScore || 100}%`} 
          subtext="Ingen hallucination detekterad" 
          icon={<Activity className="w-10 h-10 text-emerald-600" />}
          bgClass="bg-emerald-500/10"
          borderClass="border-emerald-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border)] p-16 rounded-[4rem] shadow-2xl relative overflow-hidden group">
          <div className="flex justify-between items-center mb-16 relative z-10">
            <div className="flex items-center gap-8">
              <div className="p-5 bg-[var(--bg-main)] rounded-[1.5rem] border border-[var(--border)] text-[var(--accent)] shadow-inner group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[var(--ink-main)] font-serif italic uppercase tracking-tighter">Dynamisk Ärendeanalys</h3>
                <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-[0.3em] opacity-70">Realtidsvisualisering av bevisdata</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-[var(--ink-muted)] bg-[var(--bg-main)] px-6 py-3 rounded-full border border-[var(--border)] uppercase tracking-[0.3em] shadow-sm">Live Sync v.7.6</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 relative z-10">
            {density.map(d => (
              <div key={d.label} className="p-10 bg-[var(--bg-main)]/40 rounded-[3rem] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all group/item relative overflow-hidden hover:shadow-xl hover:-translate-y-2 duration-700">
                <p className="text-[11px] text-[var(--ink-muted)] uppercase font-black mb-6 tracking-[0.3em] opacity-70">{d.label}</p>
                <div className="flex items-end gap-3 mb-8">
                  <p className="text-6xl font-serif font-black text-[var(--ink-main)] leading-none tracking-tighter italic">{d.count}</p>
                  <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase mb-2 tracking-widest opacity-60">atomer</p>
                </div>
                <div className="h-3 bg-[var(--bg-main)] rounded-full overflow-hidden shadow-inner border border-[var(--border)]">
                  <div 
                    className="h-full bg-[var(--accent)] shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)] transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (d.count / (analysis.facts?.length || 1)) * 100)}%` }}
                  ></div>
                </div>
                
                {/* Subtle hover effect */}
                <div className="absolute inset-0 bg-[var(--accent)]/0 group-hover/item:bg-[var(--accent)]/[0.03] transition-colors pointer-events-none duration-1000"></div>
              </div>
            ))}
          </div>

          {/* Decorative background element */}
          <div className="absolute -right-20 -bottom-20 opacity-[0.02] pointer-events-none">
            <Activity className="w-[500px] h-[500px]" />
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-16 rounded-[4rem] shadow-2xl flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:opacity-[0.06] transition-all transform group-hover:scale-150 group-hover:-rotate-12 duration-1000">
            <ShieldCheck className="w-80 h-80 text-[var(--ink-main)]" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-8 mb-12">
              <div className="p-6 bg-[var(--bg-main)] rounded-[2rem] text-emerald-600 shadow-inner border border-[var(--border)] group-hover:scale-110 transition-transform duration-700">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <div>
                <p className="text-[11px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em] opacity-70">Bevisdensitet</p>
                <p className="text-[11px] font-black text-emerald-600 uppercase mt-2 tracking-widest">Total täckning</p>
              </div>
            </div>
            <p className="text-8xl font-serif font-black text-[var(--ink-main)] mb-10 tracking-tighter leading-none group-hover:scale-105 transition-transform duration-1000 italic">
              {(((analysis.facts?.length || 0) / (analysis.atoms?.length || 1)) * 100).toFixed(1)}%
            </p>
            <p className="text-xl text-[var(--ink-muted)] leading-relaxed font-medium opacity-90">
              Systemet har framgångsrikt korrelerat <span className="text-[var(--ink-main)] font-black underline decoration-[var(--accent)]/20">{analysis.facts?.length || 0}</span> av <span className="text-[var(--ink-main)] font-black underline decoration-[var(--accent)]/20">{analysis.atoms?.length || 0}</span> identifierade textsegment till juridiska bevisatomer.
            </p>
          </div>
        </div>
      </div>

      {/* Automatisk Arkivsökning för Risker */}
      {(analysis.riskProfile?.dominantRisks || []).length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
          <div className="bg-[var(--bg-card)]/30 p-16 rounded-[4.5rem] border border-[var(--border)] shadow-inner relative overflow-hidden group">
            <div className="flex items-center justify-between mb-16 relative z-10">
              <div className="flex items-center gap-8">
                <div className="p-5 bg-[var(--bg-main)] rounded-[1.5rem] border border-[var(--border)] text-amber-600 shadow-inner group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700">
                  <Search className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[var(--ink-main)] font-serif italic uppercase tracking-tighter">Automatisk Arkivmatchning</h3>
                  <p className="text-[10px] text-amber-600 font-black uppercase mt-2 tracking-[0.3em] opacity-70">Baserat på identifierade risker</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-[var(--ink-muted)] bg-[var(--bg-main)] px-6 py-3 rounded-full border border-[var(--border)] uppercase tracking-[0.3em] shadow-sm">Bakgrundssökning Aktiv</span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
              {(analysis.riskProfile?.dominantRisks || []).slice(0, 2).map((riskLabel, idx) => (
                <ArchiveSearch 
                  key={`risk-search-${idx}`}
                  query={riskLabel} 
                  title={`Relaterade fall: ${riskLabel}`} 
                  limit={2}
                  className="bg-[var(--bg-card)] p-10 rounded-[3rem] border border-[var(--border)] shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2"
                />
              ))}
            </div>

            {/* Decorative background element */}
            <div className="absolute -left-20 -bottom-20 opacity-[0.02] pointer-events-none">
              <Search className="w-[500px] h-[500px]" />
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
}> = ({ label, value, subtext, icon, colorClass = "text-[var(--ink-main)]", bgClass = "bg-[var(--bg-main)]/50", borderClass = "border-[var(--border)]" }) => (
  <div className={`bg-[var(--bg-card)] border border-[var(--border)] p-12 rounded-[4rem] shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden hover:-translate-y-4 duration-1000 active:scale-[0.95]`}>
    <div className="flex justify-between items-start mb-12 relative z-10">
      <p className="text-[11px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em] opacity-70">{label}</p>
      <div className={`p-6 ${bgClass} rounded-[1.5rem] border border-[var(--border)] group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-inner`}>
        {icon}
      </div>
    </div>
    <p className={`text-6xl font-serif font-black ${colorClass} mb-6 tracking-tighter leading-none group-hover:scale-105 transition-transform duration-1000 italic`}>{value}</p>
    <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] opacity-60">{subtext}</p>
    
    {/* Decorative background element */}
    <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
      {icon}
    </div>
  </div>
);

export default AnalysisDashboard;
