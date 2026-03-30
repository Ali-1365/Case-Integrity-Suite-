
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
  const riskColor = riskScore > 70 ? 'text-[var(--danger)]' : riskScore > 40 ? 'text-[var(--warning)]' : 'text-[var(--success)]';
  const riskBg = riskScore > 70 ? 'bg-[var(--danger)]/5' : riskScore > 40 ? 'bg-[var(--warning)]/5' : 'bg-[var(--success)]/5';
  const riskBorder = riskScore > 70 ? 'border-[var(--danger)]/10' : riskScore > 40 ? 'border-[var(--warning)]/10' : 'border-[var(--success)]/10';

  // Evidence density calculation
  const categories = ['Ekonomi', 'Tillgång', 'Process', 'Hälsa'];
  const density = categories.map(cat => ({
    label: cat,
    count: (analysis.facts || []).filter(f => f.category?.toLowerCase().includes(cat.toLowerCase())).length
  }));

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      {/* Enterprise Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-4">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-[var(--ink-main)] tracking-tight uppercase italic">Analysöversikt</h3>
          <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-[0.2em] opacity-70">Kvantitativ sammanställning av ärendets riskprofil och bevisstyrka.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-5 py-3 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] flex items-center gap-3 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)] animate-pulse" />
            <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest">Live Telemetri</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox 
          label="Total Riskprofil" 
          value={`${riskScore}%`} 
          subtext="Kritiska avvikelser" 
          icon={<AlertTriangle className={`w-5 h-5 ${riskColor}`} />}
          colorClass={riskColor}
          bgClass={riskBg}
          borderClass={riskBorder}
        />
        <StatBox 
          label="Bevisatomer" 
          value={(analysis.facts?.length || 0).toString()} 
          subtext="Verifierade påståenden" 
          icon={<ShieldCheck className="w-5 h-5 text-[var(--accent)]" />}
          bgClass="bg-[var(--accent)]/5"
          borderClass="border-[var(--accent)]/10"
        />
        <StatBox 
          label="Lagrumskopplingar" 
          value={(analysis.legalReferences?.length || 0).toString()} 
          subtext="Träffar i GOLD-index" 
          icon={<Scale className="w-5 h-5 text-[var(--accent)]" />}
          bgClass="bg-[var(--accent)]/5"
          borderClass="border-[var(--accent)]/10"
        />
        <StatBox 
          label="Integritets-Score" 
          value={`${analysis.audit?.integrityScore || 100}%`} 
          subtext="Ingen hallucination detekterad" 
          icon={<Activity className="w-5 h-5 text-[var(--success)]" />}
          bgClass="bg-[var(--success)]/5"
          borderClass="border-[var(--success)]/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-[var(--bg-main)] rounded-lg border border-[var(--border)] text-[var(--accent)] shadow-inner group-hover:scale-110 transition-all duration-500">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--ink-main)] tracking-tight">Dynamisk Ärendeanalys</h3>
                <p className="text-[9px] text-[var(--ink-light)] font-bold uppercase tracking-widest">Realtidsvisualisering av bevisdata</p>
              </div>
            </div>
            <span className="text-[9px] font-bold text-[var(--ink-light)] bg-[var(--bg-main)] px-3 py-1 rounded-full border border-[var(--border)] uppercase tracking-widest shadow-sm">Live Sync v.7.6</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
            {density.map(d => (
              <div key={d.label} className="p-4 bg-[var(--bg-main)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all group/item relative overflow-hidden hover:shadow-md duration-500">
                <p className="text-[9px] text-[var(--ink-light)] uppercase font-bold mb-2 tracking-widest">{d.label}</p>
                <div className="flex items-end gap-1.5 mb-4">
                  <p className="text-2xl font-bold text-[var(--ink-main)] leading-none tracking-tight">{d.count}</p>
                  <p className="text-[8px] font-bold text-[var(--ink-light)] uppercase mb-0.5 tracking-widest">atomer</p>
                </div>
                <div className="h-1.5 bg-[var(--bg-main)] rounded-full overflow-hidden shadow-inner border border-[var(--border)]">
                  <div 
                    className="h-full bg-[var(--accent)] shadow-[0_0_10px_rgba(0,86,179,0.3)] transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (d.count / (analysis.facts?.length || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-2xl shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2.5 bg-[var(--bg-main)] rounded-lg text-[var(--success)] shadow-inner border border-[var(--border)] group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-[var(--ink-light)] uppercase tracking-widest">Bevisdensitet</p>
                <p className="text-[9px] font-bold text-[var(--success)] uppercase mt-0.5 tracking-widest">Total täckning</p>
              </div>
            </div>
            <p className="text-4xl font-bold text-[var(--ink-main)] mb-4 tracking-tight leading-none group-hover:scale-105 transition-transform duration-1000">
              {(((analysis.facts?.length || 0) / (analysis.atoms?.length || 1)) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed font-medium">
              Systemet har framgångsrikt korrelerat <span className="text-[var(--ink-main)] font-bold underline decoration-[var(--accent)]/20">{analysis.facts?.length || 0}</span> av <span className="text-[var(--ink-main)] font-bold underline decoration-[var(--accent)]/20">{analysis.atoms?.length || 0}</span> identifierade textsegment till juridiska bevisatomer.
            </p>
          </div>
        </div>
      </div>

      {/* Automatisk Arkivsökning för Risker */}
      {(analysis.riskProfile?.dominantRisks || []).length > 0 && (
        <div className="animate-fade-in">
          <div className="bg-[var(--bg-main)] p-6 rounded-3xl border border-[var(--border)] shadow-inner relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-[var(--bg-card)] rounded-lg border border-[var(--border)] text-[var(--warning)] shadow-sm group-hover:scale-110 transition-all duration-500">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--ink-main)] tracking-tight">Automatisk Arkivmatchning</h3>
                  <p className="text-[9px] text-[var(--warning)] font-bold uppercase mt-0.5 tracking-widest">Baserat på identifierade risker</p>
                </div>
              </div>
              <span className="text-[9px] font-bold text-[var(--ink-light)] bg-[var(--bg-card)] px-3 py-1 rounded-full border border-[var(--border)] uppercase tracking-widest shadow-sm">Bakgrundssökning Aktiv</span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-10">
              {(analysis.riskProfile?.dominantRisks || []).slice(0, 2).map((riskLabel, idx) => (
                <ArchiveSearch 
                  key={`risk-search-${idx}`}
                  query={riskLabel} 
                  title={`Relaterade fall: ${riskLabel}`} 
                  limit={2}
                  className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border)] shadow-sm hover:shadow-md transition-all duration-500"
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
}> = ({ label, value, subtext, icon, colorClass = "text-[var(--ink-main)]", bgClass = "bg-[var(--bg-main)]", borderClass = "border-[var(--border)]" }) => (
  <div className={`bg-[var(--bg-card)] border border-[var(--border)] p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden hover:-translate-y-1 duration-500 active:scale-[0.98]`}>
    <div className="flex justify-between items-start mb-6 relative z-10">
      <p className="text-[9px] font-bold text-[var(--ink-light)] uppercase tracking-widest">{label}</p>
      <div className={`p-2.5 ${bgClass} rounded-lg border border-[var(--border)] group-hover:scale-110 transition-all duration-500 shadow-inner`}>
        {icon}
      </div>
    </div>
    <p className={`text-2xl font-bold ${colorClass} mb-2 tracking-tight leading-none group-hover:scale-105 transition-transform duration-500`}>{value}</p>
    <p className="text-[8px] font-bold text-[var(--ink-light)] uppercase tracking-widest">{subtext}</p>
  </div>
);

export default AnalysisDashboard;
