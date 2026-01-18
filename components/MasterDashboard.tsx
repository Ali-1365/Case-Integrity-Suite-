
import React, { useMemo } from 'react';
import { AnalysisResult } from '../lib/fmjam.types';
import Card from './shared/Card';
import { AlertIcon, LawIcon, TagIcon, CpuChipIcon } from './icons';

interface MasterDashboardProps {
  analysis: AnalysisResult;
}

const DonutChart: React.FC<{ score: number }> = ({ score }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    
    let colorClass = 'text-cyan-400';
    if (score >= 70) colorClass = 'text-red-500';
    else if (score >= 50) colorClass = 'text-orange-400';
    else if (score >= 30) colorClass = 'text-yellow-400';

    return (
        <div className="relative flex items-center justify-center w-56 h-56">
            <svg className="absolute w-full h-full drop-shadow-2xl" viewBox="0 0 120 120">
                <circle
                    className="text-slate-800"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    className={`${colorClass} transition-all duration-1000 ease-out`}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className={`text-6xl font-black tracking-tighter ${colorClass}`}>{score}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Severity</span>
            </div>
        </div>
    );
};

const BarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const sortedData = [...data].sort((a,b) => b.value - a.value);

    return (
        <div className="space-y-6">
            {sortedData.map(({ label, value }) => (
                <div key={label} className="space-y-2 group">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-black text-slate-300 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">{label}</span>
                        <span className="text-[10px] font-mono text-slate-500">{value} Atomer</span>
                    </div>
                    <div className="bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                        <div
                            className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${(value / maxValue) * 100}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const MasterDashboard: React.FC<MasterDashboardProps> = ({ analysis }) => {
    const themeDistribution = useMemo(() => {
        const counts: Record<string, number> = {};
        analysis.atoms.forEach(atom => {
            atom.tags.forEach(tag => {
                counts[tag] = (counts[tag] || 0) + 1;
            });
        });
        return Object.entries(counts).map(([label, value]) => ({ label, value }));
    }, [analysis.atoms]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-700">
            <div className="lg:col-span-4 space-y-10">
                <Card title="Risköversikt (v.6.5)" icon={<AlertIcon />}>
                    <div className="flex flex-col items-center space-y-8 py-6">
                        <DonutChart score={analysis.riskProfile.normalizedScore} />
                        <div className="w-full space-y-4 border-t border-slate-800 pt-8">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center mb-6">Dominerande Risker</h4>
                            {analysis.riskProfile.dominantRisks.map((risk, idx) => (
                                <div key={risk} className="flex items-center space-x-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 hover:border-red-500/20 transition-all">
                                    <span className="text-[10px] font-mono text-red-500 font-black italic">0{idx + 1}</span>
                                    <span className="text-xs font-bold text-slate-200 uppercase tracking-tight">{risk}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 gap-10">
                <Card title="Tematisk Fördelning (Forensisk Atom-densitet)" icon={<TagIcon />}>
                    <div className="p-4">
                        <BarChart data={themeDistribution} />
                    </div>
                </Card>
                
                <Card title="Juridiskt Ramverk & Provenans" icon={<LawIcon />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {analysis.legalFrameworkLinks.map(link => (
                            <div key={link.id} className="bg-slate-900/60 p-6 rounded-[2rem] border border-slate-800 hover:bg-slate-800/40 transition-all relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <CpuChipIcon className="w-24 h-24 text-cyan-400" />
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <p className="font-black text-cyan-400 font-mono text-sm tracking-tighter uppercase">{link.label}</p>
                                    <span className="bg-slate-950 text-slate-600 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-slate-800">LOCKED</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest leading-relaxed">
                                    Stöds av: <span className="text-slate-400">{link.relatedFactIds.join(', ')}</span>
                                </p>
                                {link.reasoning && (
                                    <p className="mt-4 text-[11px] text-slate-400 italic line-clamp-2 font-medium">"{link.reasoning}"</p>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default MasterDashboard;
