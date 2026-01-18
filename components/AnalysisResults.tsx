import React, { useState } from 'react';
import { AnalysisResult } from '../lib/fmjam.types';
import Card from './shared/Card';
import Tabs from './shared/Tabs';
import MarkdownRenderer from './shared/MarkdownRenderer';
import { 
    TagIcon, 
    LawIcon, 
    LightbulbIcon, 
    ShieldCheckIcon, 
    Spinner, 
    SparklesIcon, 
    PrinterIcon,
    LinkIcon,
    CpuChipIcon,
    BoltIcon,
    CheckCircleIcon
} from './icons';
import AiReportTab from './ReportViewer';
import MasterDashboard from './MasterDashboard';
import LegalReferenceDetail from './LegalReferenceDetail';
import ForensicAuditView from './ForensicAuditView';
import TimelineView from './TimelineView';
import AnalysisDashboard from './AnalysisDashboard';
import { OpinionConfig, OpinionResult } from '../types';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  onLegalReferenceSelect: (refId: string) => void;
  onGenerateOpinion: (config: OpinionConfig, mode: 'fast' | 'think') => void;
  onGenerateSynthesis: (templateId: string) => Promise<void>;
  opinionResult: OpinionResult | null;
  isGeneratingOpinion: boolean;
  isGeneratingSynthesis: boolean;
  generationError: string | null;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = (props) => {
  const tabOptions = ['Översikt', 'Tidslinje', 'Beviskedja', 'MEGAINLAGA', 'Audit Log', 'Analytics', 'Oracle Command'];
  const [selectedLegalRefId, setSelectedLegalRefId] = useState<string | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <AnalysisDashboard analysis={props.analysis} />

      <div className="bg-slate-950/40 rounded-[3rem] border border-slate-800 p-2 shadow-inner">
          <Tabs tabs={tabOptions}>
            {(activeTab) => (
              <div className="p-8">
                {activeTab === 'Översikt' && <OverviewContent analysis={props.analysis} />}
                {activeTab === 'Tidslinje' && <TimelineView analysis={props.analysis} />}
                {activeTab === 'Beviskedja' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <Card title="Faktaatomer (Låsta)" icon={<LightbulbIcon />}>
                            <div className="space-y-6">
                                {props.analysis.facts.map(f => (
                                    <div key={f.id} className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800 hover:border-cyan-500/40 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">{f.category}</span>
                                            <span className="text-[9px] font-mono text-gray-700">#{f.id}</span>
                                        </div>
                                        <p className="text-gray-100 font-bold text-base leading-snug">{f.subject}: {f.statement}</p>
                                        <div className="mt-4 p-4 bg-black/40 rounded-2xl border-l-2 border-slate-700 italic text-[11px] text-gray-500">
                                            "{f.source.snippet}"
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        <Card title="Juridiskt Ramverk (SFS)" icon={<LawIcon />}>
                            <div className="space-y-4">
                                {props.analysis.legalReferences.map(r => (
                                    <button 
                                        key={r.id} 
                                        onClick={() => setSelectedLegalRefId(r.id)}
                                        className="w-full text-left p-6 bg-slate-900/60 rounded-3xl border border-slate-800 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all group flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="text-base font-black text-cyan-400 uppercase tracking-tighter">{r.rawText}</p>
                                            <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-1">"{r.contextSnippet}"</p>
                                        </div>
                                        <LinkIcon className="w-5 h-5 text-slate-700 group-hover:text-cyan-400" />
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
                {activeTab === 'MEGAINLAGA' && (
                    <div className="space-y-8">
                        <div className="bg-gradient-to-r from-red-600/20 via-slate-900 to-slate-900 p-10 rounded-[3rem] border border-red-500/20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Mega-Aggregator v.7.2</h3>
                                <p className="text-base text-slate-400 mt-2">Genererar en deterministisk rättsutredning baserad på 100% källspårbarhet.</p>
                            </div>
                            <button 
                                onClick={() => props.onGenerateSynthesis('FORENSIC_DETAILED_V1')}
                                disabled={props.isGeneratingSynthesis}
                                className="relative z-10 bg-red-600 hover:bg-red-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl transition-all flex items-center space-x-4 border border-red-400/30"
                            >
                                {props.isGeneratingSynthesis ? <Spinner className="h-5 w-5" /> : <SparklesIcon className="h-5 w-5" />}
                                <span>Kör Aggregator</span>
                            </button>
                        </div>
                        <div className="bg-slate-950/80 p-16 rounded-[4rem] border border-slate-800 shadow-2xl min-h-[600px]">
                            {props.analysis.synthesis ? (
                                <MarkdownRenderer content={props.analysis.synthesis} />
                            ) : (
                                <div className="text-center py-48 opacity-10 flex flex-col items-center">
                                    <CpuChipIcon className="w-32 h-32 mb-8" />
                                    <p className="text-2xl font-black uppercase italic tracking-[0.4em]">Standby</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'Audit Log' && <ForensicAuditView analysis={props.analysis} />}
                {activeTab === 'Analytics' && <MasterDashboard analysis={props.analysis} />}
                {activeTab === 'Oracle Command' && <AiReportTab analysis={props.analysis} onGenerate={props.onGenerateOpinion} opinionResult={props.opinionResult} isGenerating={props.isGeneratingOpinion} error={props.generationError} />}
              </div>
            )}
          </Tabs>
      </div>

      {selectedLegalRefId && (
          <LegalReferenceDetail referenceId={selectedLegalRefId} analysis={props.analysis} onClose={() => setSelectedLegalRefId(null)} />
      )}
    </div>
  );
};

const OverviewContent: React.FC<{ analysis: AnalysisResult }> = ({ analysis }) => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-10 rounded-[3rem] border border-slate-800 relative overflow-hidden shadow-2xl">
                <div className="flex items-center space-x-4 mb-10">
                    <BoltIcon className="w-6 h-6 text-cyan-500" />
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-cyan-500">Forensic Chain Summary</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <StatCard label="Aktiverat Lagrum" value={analysis.legalReferences.length} color="cyan" />
                    <StatCard label="Bevisatomer" value={analysis.facts.length} color="cyan" />
                    <StatCard label="Audit Checks" value={analysis.qaSummary.length} color="cyan" />
                </div>
            </div>
            <Card title="Verifierade Beviskategorier" icon={<TagIcon />}>
                <div className="flex flex-wrap gap-4">
                    {analysis.themes.map(t => (
                        <div key={t.id} className="bg-slate-800/50 px-6 py-4 rounded-[1.5rem] border border-slate-700 flex flex-col items-center min-w-[120px]">
                            <span className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">{t.label}</span>
                            <span className="text-2xl font-black text-white">{analysis.facts.filter(f => f.category === t.id).length}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
        <div className="lg:col-span-4">
            <Card title="QA-Revision" icon={<ShieldCheckIcon />}>
                <div className="space-y-4">
                    {analysis.qaSummary.map(check => (
                        <div key={check.id} className="p-5 rounded-3xl border border-slate-800 bg-slate-900/40 flex items-start gap-4">
                            <div className={`p-2 rounded-xl mt-1 ${check.status === 'pass' ? 'text-green-500 bg-green-500/10' : 'text-orange-500 bg-orange-500/10'}`}>
                                <CheckCircleIcon className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-black text-white uppercase tracking-widest text-[10px] mb-1">{check.label}</p>
                                <p className="text-slate-500 font-medium text-[11px] leading-relaxed">{check.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    </div>
);

const StatCard: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
    <div className="text-center p-8 bg-black/40 rounded-[2rem] border border-slate-800 shadow-inner group hover:border-slate-600 transition-all">
        <p className={`text-6xl font-black text-cyan-400 tracking-tighter group-hover:scale-110 transition-transform`}>{value}</p>
        <p className="text-[10px] font-black uppercase text-slate-500 mt-4 tracking-[0.3em]">{label}</p>
    </div>
);

export default AnalysisResults;