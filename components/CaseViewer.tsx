
import React, { useState } from 'react';
import { CISCase } from '../lib/CaseManagementService';
import CaseTimeline from './CaseTimeline';
import DecisionDiffViewer from './DecisionDiffViewer';
import { 
  ShieldCheck, 
  X, 
  Zap, 
  Activity,
  Cpu,
  Info,
  CheckCircle,
  RefreshCw,
  Settings2,
  Scale,
  Sparkles
} from 'lucide-react';

interface CaseViewerProps {
  caseData: CISCase;
  onClose: () => void;
}

const CaseViewer: React.FC<CaseViewerProps> = ({ caseData, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'journal' | 'versions'>('overview');
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BESLUTAT': return 'text-[var(--success)] border-[var(--success)]/30 bg-[var(--success)]/10';
      case 'KORRIGERAT': return 'text-[var(--warning)] border-[var(--warning)]/30 bg-[var(--warning)]/10';
      case 'UNDER_UTREDNING': return 'text-[var(--accent)] border-[var(--accent)]/30 bg-[var(--accent)]/10';
      default: return 'text-[var(--ink-muted)] border-[var(--border)] bg-[var(--bg-main)]';
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--ink-main)]/40 backdrop-blur-xl z-[500] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300 outline-none">
      <div className="bg-[var(--bg-card)] rounded-[3rem] shadow-2xl w-full max-w-7xl h-full max-h-[92vh] flex flex-col border border-[var(--border)] overflow-hidden">
        
        {/* CASE HEADER */}
        <header className="px-10 py-8 flex justify-between items-center border-b border-[var(--border)] bg-[var(--bg-card)] relative">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] shadow-sm">
                <Cpu className="h-10 w-10 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-[var(--ink-main)] tracking-tighter uppercase italic leading-none font-serif">{caseData.caseId}</h2>
              <div className="flex items-center space-x-3 mt-2">
                  <span className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusColor(caseData.status)}`}>
                      {caseData.status}
                  </span>
                  <span className="text-[10px] text-[var(--ink-muted)] font-bold uppercase tracking-widest">Version v.{caseData.currentVersion - 1}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex bg-[var(--bg-main)] p-1.5 rounded-2xl border border-[var(--border)] shadow-inner">
                <TabBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Överblick" />
                <TabBtn active={activeTab === 'journal'} onClick={() => setActiveTab('journal')} label="Händelselogg" />
                <TabBtn active={activeTab === 'versions'} onClick={() => setActiveTab('versions')} label="Beslutsjournal" count={caseData.versions.length} />
            </div>
            <button onClick={onClose} className="p-3 text-[var(--ink-muted)] hover:text-[var(--ink-main)] hover:bg-[var(--bg-main)] rounded-2xl transition-all">
              <X className="h-8 w-8" />
            </button>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-12 custom-scrollbar bg-[var(--bg-main)]/30">
            <div className="max-w-6xl mx-auto">
                
                {activeTab === 'overview' && (
                    <div className="space-y-12">
                        <div className="bg-[var(--bg-card)] p-10 rounded-[3rem] border border-[var(--border)] shadow-sm">
                            <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em] mb-4">Aktuell Frågeställning</p>
                            <h3 className="text-3xl font-black text-[var(--ink-main)] italic tracking-tighter leading-tight font-serif">
                                "{caseData.query}"
                            </h3>
                        </div>
                        
                        {caseData.activeResult && (
                            <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm">
                                <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest mb-6">Senaste Analysresultat</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <SummaryCard label="Beslut" value={caseData.activeResult.proposal} color="accent" />
                                    <SummaryCard label="Risk" value={caseData.activeResult.machineReadable.riskLevel} color="warning" />
                                    <SummaryCard label="Proportionalitet" value={caseData.activeResult.proportionality?.level || 'N/A'} color="success" />
                                </div>
                                <div className="mt-10 flex justify-center">
                                    <button 
                                        className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-black uppercase tracking-widest text-[10px] px-10 py-4 rounded-2xl shadow-xl shadow-[var(--accent)]/10 transition-all border border-[var(--accent)]/20"
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
                            <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                            <h3 className="text-xs font-black text-[var(--ink-muted)] uppercase tracking-widest">Kronologisk Beslutsutveckling</h3>
                        </div>
                        {caseData.versions.map((v) => (
                            <div key={v.versionId} className={`bg-[var(--bg-card)] border rounded-[2rem] overflow-hidden transition-all ${expandedVersion === v.versionId ? 'border-[var(--accent)] shadow-md' : 'border-[var(--border)] hover:border-[var(--accent)]/50'}`}>
                                <button 
                                  onClick={() => setExpandedVersion(expandedVersion === v.versionId ? null : v.versionId)}
                                  className="w-full text-left p-8 flex justify-between items-center group"
                                >
                                    <div>
                                        <div className="flex items-center space-x-4 mb-2">
                                            <span className="text-lg font-black text-[var(--ink-main)] uppercase italic font-serif">Version {v.versionId}</span>
                                            <span className="text-[10px] font-mono text-[var(--ink-muted)]">{new Date(v.timestamp).toLocaleString('sv-SE')}</span>
                                        </div>
                                        <p className="text-sm font-bold text-[var(--accent)] uppercase tracking-tight">{v.changes}</p>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <span className={`text-xs font-black px-4 py-2 rounded-xl border border-[var(--border)] uppercase tracking-widest ${v.decisionSnapshot === 'JA' ? 'text-[var(--success)] bg-[var(--success)]/5' : 'text-[var(--danger)] bg-[var(--danger)]/5'}`}>
                                            Resultat: {v.decisionSnapshot}
                                        </span>
                                        <RefreshCw className={`w-5 h-5 text-[var(--ink-muted)] transition-transform ${expandedVersion === v.versionId ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>
                                
                                {expandedVersion === v.versionId && v.journalEntry && (
                                    <div className="px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
                                        <div className="border-t border-[var(--border)] pt-8 space-y-8">
                                            <div className="bg-[var(--bg-main)] border border-[var(--border)] p-6 rounded-2xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-5"><Scale className="w-20 h-20" /></div>
                                                <p className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest mb-2">Rättslig Betydelse (Auto-genererad)</p>
                                                <p className="text-sm font-bold text-[var(--ink-main)] italic font-serif">"{v.journalEntry.legalImpact}"</p>
                                            </div>
                                            
                                            <DecisionDiffViewer diff={v.journalEntry.diff} />
                                            
                                            <div className="flex justify-between items-center text-[9px] font-mono text-[var(--ink-muted)] pt-4 border-t border-[var(--border)]">
                                                <span>Journal_ID: {v.journalEntry.journalDecisionId}</span>
                                                <span className="flex items-center gap-2">
                                                    <ShieldCheck className="w-3 h-3" /> 
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
        
        <footer className="px-10 py-6 border-t border-[var(--border)] bg-[var(--bg-card)] flex justify-between items-center text-[10px] text-[var(--ink-muted)] font-bold uppercase tracking-widest">
            <div className="flex items-center space-x-4">
                <CheckCircle className="h-4 w-4 text-[var(--success)]/50" />
                <span>Decision Intelligence: Active | Audit Cycle v.16</span>
            </div>
            <span>Case Integrity Suite Hub v.1.0</span>
        </footer>
      </div>
    </div>
  );
};

const TabBtn: React.FC<{ active: boolean, onClick: () => void, label: string, count?: number }> = ({ active, onClick, label, count }) => (
    <button onClick={onClick} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${active ? 'bg-[var(--bg-card)] text-[var(--ink-main)] shadow-sm border border-[var(--border)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink-main)]'}`}>
        <span>{label}</span>
        {count !== undefined && <span className="bg-[var(--ink-main)]/5 px-1.5 py-0.5 rounded-md text-[8px]">{count}</span>}
    </button>
);

const SummaryCard: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => {
    const colors: Record<string, string> = {
        accent: 'text-[var(--accent)]',
        warning: 'text-[var(--warning)]',
        success: 'text-[var(--success)]',
        danger: 'text-[var(--danger)]'
    };
    return (
        <div className="bg-[var(--bg-main)] p-6 rounded-3xl border border-[var(--border)] flex flex-col items-center shadow-inner">
            <p className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest mb-3">{label}</p>
            <p className={`text-2xl font-black italic tracking-tighter uppercase font-serif ${colors[color] || 'text-[var(--ink-main)]'}`}>{value}</p>
        </div>
    );
};

export default CaseViewer;
