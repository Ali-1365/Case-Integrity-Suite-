
import React, { useMemo } from 'react';
import { AnalysisResult } from '../lib/cis.types';
import Card from './shared/Card';
import { AlertIcon, LawIcon, TagIcon, CpuChipIcon } from './icons';

interface MasterDashboardProps {
  analysis: AnalysisResult;
}

const DonutChart: React.FC<{ score: number }> = ({ score }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    
    let colorClass = 'text-blue-500';
    if (score >= 70) colorClass = 'text-rose-500';
    else if (score >= 50) colorClass = 'text-amber-500';
    else if (score >= 30) colorClass = 'text-yellow-500';

    return (
        <div className="relative flex items-center justify-center w-64 h-64 group">
            <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-700"></div>
            <svg className="absolute w-full h-full drop-shadow-2xl" viewBox="0 0 120 120">
                <circle
                    className="text-slate-100 dark:text-slate-800/50"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    className={`${colorClass} transition-all duration-1000 ease-out`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                    style={{ filter: 'drop-shadow(0 0 12px currentColor)' }}
                />
            </svg>
            <div className="absolute flex flex-col items-center animate-in fade-in zoom-in duration-1000">
                <span className={`text-6xl font-black tracking-tighter ${colorClass} drop-shadow-sm`}>{score}</span>
                <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-3">Allvarlighetsgrad</span>
            </div>
        </div>
    );
};

const BarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const safeData = data || [];
    const maxValue = Math.max(...safeData.map(d => d.value), 1);
    const sortedData = [...safeData].sort((a,b) => b.value - a.value);

    return (
        <div className="space-y-8">
            {sortedData.map(({ label, value }) => (
                <div key={label} className="space-y-3 group">
                    <div className="flex justify-between items-end px-1">
                        <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">{label}</span>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">{value} Atomer</span>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800/50 rounded-full h-4 overflow-hidden border border-slate-200 dark:border-slate-700/50 shadow-inner relative">
                        <div
                            className="bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.4)] relative z-10"
                            style={{ width: `${(value / maxValue) * 100}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const MasterDashboard: React.FC<MasterDashboardProps> = ({ analysis }) => {
    const themeDistribution = useMemo(() => {
        const counts: Record<string, number> = {};
        (analysis.atoms || []).forEach(atom => {
            (atom.tags || []).forEach(tag => {
                counts[tag] = (counts[tag] || 0) + 1;
            });
        });
        return Object.entries(counts).map(([label, value]) => ({ label, value }));
    }, [analysis.atoms]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="lg:col-span-4 space-y-12">
                <Card title="Riskprofilering (v.6.5)" icon={<AlertIcon className="w-6 h-6" />}>
                    <div className="flex flex-col items-center space-y-12 py-10">
                        <DonutChart score={analysis.riskProfile?.normalizedScore || 0} />
                        <div className="w-full space-y-6 border-t border-slate-100 dark:border-slate-800 pt-10">
                            <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] text-center mb-8">Dominerande Riskfaktorer</h4>
                            <div className="grid grid-cols-1 gap-4">
                                {(analysis.riskProfile?.dominantRisks || []).map((risk, idx) => (
                                    <div key={risk} className="flex items-center space-x-5 bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-rose-500/40 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 group shadow-sm hover:shadow-md">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[11px] font-black text-rose-500 uppercase tracking-widest group-hover:scale-110 transition-transform">
                                            0{idx + 1}
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-tight">{risk}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 gap-12">
                <Card title="Tematisk Fördelning (Forensisk Atom-densitet)" icon={<TagIcon className="w-6 h-6" />}>
                    <div className="p-8">
                        <BarChart data={themeDistribution} />
                    </div>
                </Card>
                
                <Card title="Juridiskt Ramverk & Provenans" icon={<LawIcon className="w-6 h-6" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-2">
                        {(analysis.legalFrameworkLinks || []).map(link => (
                            <div key={link.id} className="bg-slate-50 dark:bg-slate-800/30 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 relative overflow-hidden group shadow-sm hover:shadow-xl hover:-translate-y-1">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.04] group-hover:opacity-[0.12] transition-all transform group-hover:scale-125 group-hover:rotate-12 duration-700">
                                    <CpuChipIcon className="w-24 h-24 text-blue-500" />
                                </div>
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <p className="font-black text-blue-600 dark:text-blue-400 text-lg tracking-tighter uppercase italic">{link.label}</p>
                                    <span className="bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-slate-200 dark:border-slate-700 tracking-[0.2em] shadow-sm">Låst</span>
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                        Stöds av bevis: <span className="text-slate-900 dark:text-white font-black bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800/50">{(link.relatedFactIds || []).join(', ')}</span>
                                    </p>
                                    {link.reasoning && (
                                        <div className="mt-6 p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                            <p className="text-xs text-slate-400 dark:text-slate-500 italic leading-relaxed font-medium">"{link.reasoning}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default MasterDashboard;
