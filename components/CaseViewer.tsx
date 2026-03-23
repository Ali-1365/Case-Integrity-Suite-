
import React, { useState } from 'react';
import { CISCase } from '../lib/CaseManagementService';
import CaseTimeline from './CaseTimeline';
import DecisionDiffViewer from './DecisionDiffViewer';
import { 
  ShieldCheckIcon, 
  XMarkIcon, 
  BoltIcon, 
  ActivityIcon,
  CpuChipIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  LawIcon,
  SparklesIcon
} from './icons';

interface CaseViewerProps {
  caseData: CISCase;
  onClose: () => void;
}

const CaseViewer: React.FC<CaseViewerProps> = ({ caseData, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'journal' | 'versions'>('overview');
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BESLUTAT': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'KORRIGERAT': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      case 'UNDER_UTREDNING': return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      default: return 'text-gray-400 border-gray-700 bg-gray-800/40';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-950/98 backdrop-blur-2xl z-[500] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300 outline-none">
      <div className="bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-7xl h-full max-h-[92vh] flex flex-col border border-gray-800 overflow-hidden ring-1 ring-white/5">
        
        {/* CASE HEADER */}
        <header className="px-10 py-8 flex justify-between items-center border-b border-gray-800 bg-gray-900/50 relative">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-xl">
                <CpuChipIcon className="h-10 w-10 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{caseData.caseId}</h2>
              <div className="flex items-center space-x-3 mt-2">
                  <span className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusColor(caseData.status)}`}>
                      {caseData.status}
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Version v.{caseData.currentVersion - 1}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-gray-800 shadow-inner">
                <TabBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Överblick" />
                <TabBtn active={activeTab === 'journal'} onClick={() => setActiveTab('journal')} label="Händelselogg" />
                <TabBtn active={activeTab === 'versions'} onClick={() => setActiveTab('versions')} label="Beslutsjournal" count={caseData.(versions as { length: number }).length} />
            </div>
            <button onClick={onClose} className="p-3 text-gray-500 hover:text-white hover:bg-gray-800 rounded-2xl transition-all">
              <XMarkIcon className="h-8 w-8" />
            </button>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-12 custom-scrollbar bg-gray-950/20">
            <div className="max-w-6xl mx-auto">
                
                {activeTab === 'overview' && (
                    <div className="space-y-12">
                        <div className="bg-gray-900/40 p-10 rounded-[3rem] border border-gray-800 shadow-inner">
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mb-4">Aktuell Frågeställning</p>
                            <h3 className="text-3xl font-black text-white italic tracking-tighter leading-tight">
                                "{caseData.query}"
                            </h3>
                        </div>
                        
                        {caseData.activeResult && (
                            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-sm">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Senaste Analysresultat</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <SummaryCard label="Beslut" value={caseData.activeResult.proposal} color="cyan" />
                                    <SummaryCard label="Risk" value={caseData.activeResult.machineReadable.riskLevel} color="orange" />
                                    <SummaryCard label="Proportionalitet" value={caseData.activeResult.proportionality?.level || 'N/A'} color="emerald" />
                                </div>
                                <div className="mt-10 flex justify-center">
                                    <button 
                                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest text-[10px] px-10 py-4 rounded-2xl shadow-xl shadow-cyan-900/20 transition-all border border-cyan-400/20"
                                        onClick={() => setActiveTab('versions')}
                                    >
                                        Granska historik & diff
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'journal' && (
                    <div className="max-w-4xl mx-auto">
                        <CaseTimeline entries={caseData.journal} />
                    </div>
                )}

                {activeTab === 'versions' && (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 mb-6 ml-2">
                            <SparklesIcon className="w-5 h-5 text-cyan-400" />
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Kronologisk Beslutsutveckling</h3>
                        </div>
                        {caseData.versions.map((v) => (
                            <div key={v.versionId} className={`bg-gray-900 border rounded-[2rem] overflow-hidden transition-all ${expandedVersion === v.versionId ? 'border-cyan-500/50 ring-1 ring-cyan-500/20' : 'border-gray-800 hover:border-gray-700'}`}>
                                <button 
                                  onClick={() => setExpandedVersion(expandedVersion === v.versionId ? null : v.versionId)}
                                  className="w-full text-left p-8 flex justify-between items-center group"
                                >
                                    <div>
                                        <div className="flex items-center space-x-4 mb-2">
                                            <span className="text-lg font-black text-white uppercase italic">Version {v.versionId}</span>
                                            <span className="text-[10px] font-mono text-gray-600">{new Date(v.timestamp).toLocaleString('sv-SE')}</span>
                                        </div>
                                        <p className="text-sm font-bold text-cyan-400 uppercase tracking-tight">{v.changes}</p>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <span className={`text-xs font-black px-4 py-2 rounded-xl border border-gray-800 uppercase tracking-widest ${v.decisionSnapshot === 'JA' ? 'text-green-500 bg-green-500/5' : 'text-orange-500 bg-orange-500/5'}`}>
                                            Result: {v.decisionSnapshot}
                                        </span>
                                        <ArrowPathIcon className={`w-5 h-5 text-gray-700 transition-transform ${expandedVersion === v.versionId ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>
                                
                                {expandedVersion === v.versionId && v.journalEntry && (
                                    <div className="px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
                                        <div className="border-t border-gray-800 pt-8 space-y-8">
                                            <div className="bg-cyan-950/20 border border-cyan-500/20 p-6 rounded-2xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-5"><LawIcon className="w-20 h-20" /></div>
                                                <p className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mb-2">Rättslig Betydelse (Auto-genererad)</p>
                                                <p className="text-sm font-bold text-gray-200 italic">"{v.journalEntry.legalImpact}"</p>
                                            </div>
                                            
                                            <DecisionDiffViewer diff={v.journalEntry.diff} />
                                            
                                            <div className="flex justify-between items-center text-[9px] font-mono text-gray-600 pt-4 border-t border-gray-800/50">
                                                <span>Journal_ID: {v.journalEntry.journalDecisionId}</span>
                                                <span className="flex items-center gap-2">
                                                    <ShieldCheckIcon className="w-3 h-3" /> 
                                                    Locked Trace Verified
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </main>
        
        <footer className="px-10 py-6 border-t border-gray-800 bg-gray-900/50 flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            <div className="flex items-center space-x-4">
                <CheckCircleIcon className="h-4 w-4 text-green-500/50" />
                <span>Decision Intelligence: Active | Audit Cycle v.16</span>
            </div>
            <span>Case Integrity Suite Hub v.1.0</span>
        </footer>
      </div>
    </div>
  );
};

const TabBtn: React.FC<{ active: boolean, onClick: () => void, label: string, count?: number }> = ({ active, onClick, label, count }) => (
    <button onClick={onClick} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${active ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
        <span>{label}</span>
        {count !== undefined && <span className="bg-black/20 px-1.5 py-0.5 rounded-md text-[8px]">{count}</span>}
    </button>
);

const SummaryCard: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => {
    const colors: Record<string, string> = {
        cyan: 'text-cyan-400',
        orange: 'text-orange-400',
        emerald: 'text-emerald-400'
    };
    return (
        <div className="bg-gray-950 p-6 rounded-3xl border border-gray-800 flex flex-col items-center shadow-inner">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3">{label}</p>
            <p className={`text-2xl font-black italic tracking-tighter uppercase ${colors[color] || 'text-white'}`}>{value}</p>
        </div>
    );
};

export default CaseViewer;
