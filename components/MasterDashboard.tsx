
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
    if (score >= 70) colorClass = 'text-rose-500';
    else if (score >= 50) colorClass = 'text-amber-400';
    else if (score >= 30) colorClass = 'text-yellow-400';

    return (
        <div className="relative flex items-center justify-center w-48 h-48">
            <svg className="absolute w-full h-full" viewBox="0 0 120 120">
                <circle
                    className="text-gray-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    className={`${colorClass} transition-all duration-1000 ease-out`}
                    strokeWidth="8"
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
                <span className={`text-4xl font-semibold ${colorClass}`}>{score}</span>
                <span className="text-xs font-medium text-gray-500 mt-1">Severity</span>
            </div>
        </div>
    );
};

const BarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const sortedData = [...data].sort((a,b) => b.value - a.value);

    return (
        <div className="space-y-4">
            {sortedData.map(({ label, value }) => (
                <div key={label} className="space-y-1.5 group">
                    <div className="flex justify-between items-end">
                        <span className="text-sm font-medium text-gray-300 group-hover:text-cyan-400 transition-colors">{label}</span>
                        <span className="text-xs font-mono text-gray-500">{value} Atomer</span>
                    </div>
                    <div className="bg-[#111111] rounded-full h-1.5 overflow-hidden border border-gray-800">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-4 space-y-8">
                <Card title="Risköversikt (v.6.5)" icon={<AlertIcon className="w-5 h-5" />}>
                    <div className="flex flex-col items-center space-y-6 py-4">
                        <DonutChart score={analysis.riskProfile.normalizedScore} />
                        <div className="w-full space-y-3 border-t border-gray-800 pt-6">
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center mb-4">Dominerande Risker</h4>
                            {analysis.riskProfile.dominantRisks.map((risk, idx) => (
                                <div key={risk} className="flex items-center space-x-3 bg-[#111111] p-3 rounded-xl border border-gray-800 hover:border-rose-500/20 transition-colors">
                                    <span className="text-xs font-mono text-rose-400 font-medium">0{idx + 1}</span>
                                    <span className="text-sm font-medium text-gray-200">{risk}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 gap-8">
                <Card title="Tematisk Fördelning (Forensisk Atom-densitet)" icon={<TagIcon className="w-5 h-5" />}>
                    <div className="p-2">
                        <BarChart data={themeDistribution} />
                    </div>
                </Card>
                
                <Card title="Juridiskt Ramverk & Provenans" icon={<LawIcon className="w-5 h-5" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysis.legalFrameworkLinks.map(link => (
                            <div key={link.id} className="bg-[#111111] p-5 rounded-xl border border-gray-800 hover:bg-[#161616] transition-colors relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                    <CpuChipIcon className="w-16 h-16 text-cyan-400" />
                                </div>
                                <div className="flex justify-between items-start mb-3">
                                    <p className="font-medium text-cyan-400 text-sm">{link.label}</p>
                                    <span className="bg-[#0a0a0a] text-gray-500 px-2 py-0.5 rounded text-[10px] font-medium uppercase border border-gray-800">LOCKED</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    Stöds av: <span className="text-gray-400">{link.relatedFactIds.join(', ')}</span>
                                </p>
                                {link.reasoning && (
                                    <p className="mt-3 text-xs text-gray-400 italic line-clamp-2">"{link.reasoning}"</p>
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
