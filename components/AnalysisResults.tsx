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

import { AutoNotaryView } from './AutoNotaryView';

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
  const tabOptions = ['Översikt', 'Tidslinje', 'Beviskedja', 'MEGAINLAGA', 'Audit Log', 'Processnotarie', 'Analytics', 'Oracle Command'];
  const [selectedLegalRefId, setSelectedLegalRefId] = useState<string | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AnalysisDashboard analysis={props.analysis} />

      <div className="bg-[#111111] rounded-2xl border border-gray-800 p-2 shadow-sm">
          <Tabs tabs={tabOptions}>
            {(activeTab) => (
              <div className="p-6 md:p-8">
                {activeTab === 'Översikt' && <OverviewContent analysis={props.analysis} />}
                {activeTab === 'Tidslinje' && <TimelineView analysis={props.analysis} />}
                {activeTab === 'Processnotarie' && (
                    <div className="h-[600px] bg-[#0a0a0a] rounded-xl border border-gray-800 overflow-hidden">
                        <AutoNotaryView />
                    </div>
                )}
                {activeTab === 'Beviskedja' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card title="Faktaatomer (Låsta)" icon={<LightbulbIcon className="w-5 h-5" />}>
                            <div className="space-y-4">
                                {props.analysis.facts.map(f => (
                                    <div key={f.id} className="p-5 bg-[#161616] rounded-xl border border-gray-800 hover:border-cyan-500/40 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-medium text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">{f.category}</span>
                                            <span className="text-xs font-mono text-gray-500">#{f.id}</span>
                                        </div>
                                        <p className="text-gray-200 font-medium text-sm leading-relaxed">{f.subject}: {f.statement}</p>
                                        <div className="mt-3 p-3 bg-[#0a0a0a] rounded-lg border-l-2 border-gray-700 italic text-xs text-gray-400">
                                            "{f.source.snippet}"
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        <Card title="Juridiskt Ramverk (SFS)" icon={<LawIcon className="w-5 h-5" />}>
                            <div className="space-y-3">
                                {props.analysis.legalReferences.map(r => (
                                    <button 
                                        key={r.id} 
                                        onClick={() => setSelectedLegalRefId(r.id)}
                                        className="w-full text-left p-5 bg-[#161616] rounded-xl border border-gray-800 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-colors group flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-cyan-400">{r.rawText}</p>
                                            <p className="text-xs text-gray-500 italic mt-1 line-clamp-1">"{r.contextSnippet}"</p>
                                        </div>
                                        <LinkIcon className="w-4 h-4 text-gray-600 group-hover:text-cyan-400" />
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
                {activeTab === 'MEGAINLAGA' && (
                    <div className="space-y-6">
                        <div className="bg-[#161616] p-8 rounded-xl border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xl font-semibold text-gray-100">Mega-Aggregator v.7.2</h3>
                                <p className="text-sm text-gray-400 mt-1">Genererar en deterministisk rättsutredning baserad på 100% källspårbarhet.</p>
                            </div>
                            <button 
                                onClick={() => props.onGenerateSynthesis('FORENSIC_DETAILED_V1')}
                                disabled={props.isGeneratingSynthesis}
                                className="relative z-10 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-medium text-sm shadow-md transition-colors flex items-center space-x-2"
                            >
                                {props.isGeneratingSynthesis ? <Spinner className="h-4 w-4" /> : <SparklesIcon className="h-4 w-4" />}
                                <span>Kör Aggregator</span>
                            </button>
                        </div>
                        <div className="bg-[#0a0a0a] p-8 md:p-12 rounded-xl border border-gray-800 shadow-inner min-h-[600px]">
                            {props.analysis.synthesis ? (
                                <MarkdownRenderer content={props.analysis.synthesis} />
                            ) : (
                                <div className="text-center py-32 opacity-30 flex flex-col items-center">
                                    <CpuChipIcon className="w-16 h-16 mb-4 text-gray-500" />
                                    <p className="text-lg font-medium text-gray-500">Standby</p>
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
            <div className="bg-[#161616] p-8 rounded-xl border border-gray-800 relative overflow-hidden shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                    <BoltIcon className="w-5 h-5 text-cyan-500" />
                    <h3 className="text-sm font-semibold text-cyan-500 uppercase tracking-wider">Forensic Chain Summary</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatCard label="Aktiverat Lagrum" value={analysis.legalReferences.length} color="cyan" />
                    <StatCard label="Bevisatomer" value={analysis.facts.length} color="cyan" />
                    <StatCard label="Audit Checks" value={analysis.qaSummary.length} color="cyan" />
                </div>
            </div>
            <Card title="Verifierade Beviskategorier" icon={<TagIcon className="w-5 h-5" />}>
                <div className="flex flex-wrap gap-3">
                    {analysis.themes.map(t => (
                        <div key={t.id} className="bg-[#111111] px-4 py-3 rounded-lg border border-gray-800 flex flex-col items-center min-w-[100px]">
                            <span className="text-xs font-medium text-gray-500 mb-1">{t.label}</span>
                            <span className="text-xl font-semibold text-gray-200">{analysis.facts.filter(f => f.category === t.id).length}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
        <div className="lg:col-span-4">
            <Card title="QA-Revision" icon={<ShieldCheckIcon className="w-5 h-5" />}>
                <div className="space-y-3">
                    {analysis.qaSummary.map(check => (
                        <div key={check.id} className="p-4 rounded-xl border border-gray-800 bg-[#111111] flex items-start gap-3">
                            <div className={`p-1.5 rounded-md mt-0.5 ${check.status === 'pass' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                                <CheckCircleIcon className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-200 text-sm mb-0.5">{check.label}</p>
                                <p className="text-gray-500 text-xs leading-relaxed">{check.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    </div>
);

const StatCard: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
    <div className="text-center p-6 bg-[#111111] rounded-xl border border-gray-800 shadow-sm">
        <p className={`text-4xl font-semibold text-cyan-400 mb-2`}>{value}</p>
        <p className="text-xs font-medium text-gray-500">{label}</p>
    </div>
);

export default AnalysisResults;
