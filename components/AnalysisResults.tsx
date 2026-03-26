import React, { useState } from 'react';
import { AnalysisResult } from '../lib/cis.types';
import { LEGAL_SOURCES } from '../data/legalSources';
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
    CheckCircleIcon,
    MagnifyingGlassIcon,
    ActivityIcon,
    DocumentTextIcon
} from './icons';
import AiReportTab from './ReportViewer';
import MasterDashboard from './MasterDashboard';
import LegalReferenceDetail from './LegalReferenceDetail';
import ForensicAuditView from './ForensicAuditView';
import ForensicIntegrityView from './ForensicIntegrityView';
import TimelineView from './TimelineView';
import AnalysisDashboard from './AnalysisDashboard';
import { OpinionConfig, OpinionResult } from '../types';

import { AutoNotaryView } from './AutoNotaryView';
import { AgentView } from './AgentView';
import { AdversarialDuelView } from './AdversarialDuelView';
import { SystemArchitectureView } from './SystemArchitectureView';
import { FmjamController } from './FmjamController';
import { IntelligenceCore } from './IntelligenceCore';
import { InteractiveAnalyst } from './InteractiveAnalyst';
import { LegalPipelineView } from './LegalPipelineView';
import { QuickStartGuide } from './QuickStartGuide';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  onLegalReferenceSelect: (refId: string) => void;
  onGenerateOpinion: (config: OpinionConfig, mode: 'fast' | 'think') => void | Promise<void>;
  onGenerateSynthesis: (templateId: string) => Promise<void>;
  opinionResult: OpinionResult | null;
  isGeneratingOpinion: boolean;
  isGeneratingSynthesis: boolean;
  generationError: string | null;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = (props) => {
  const tabOptions = ['Snabbstartsguide', 'Översikt', 'Interactive Analyst', 'Dokument-Pipeline', 'Forensisk Integritet', 'Intelligence Core', 'FMJAM Controller', 'Systemarkitektur', 'Tidslinje', 'Beviskedja', 'MEGAINLAGA', 'Audit Log', 'Processnotarie', 'Advokatbyrå', 'Rättegångssimulator', 'Analytics', 'Oracle Command'];
  const [selectedLegalRefId, setSelectedLegalRefId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(tabOptions[0]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <AnalysisDashboard analysis={props.analysis} />

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-4 md:px-0">
        <button 
          onClick={() => setActiveTab('Interactive Analyst')}
          className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-12 rounded-[4rem] flex items-center gap-10 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-[0_40px_100px_-20px_rgba(99,102,241,0.15)] transition-all group active:scale-[0.98] relative overflow-hidden group/btn duration-500"
        >
          <div className="absolute inset-0 bg-indigo-500/0 group-hover/btn:bg-indigo-500/[0.03] transition-colors"></div>
          <div className="p-7 bg-indigo-500/10 rounded-[2rem] text-indigo-600 dark:text-indigo-400 group-hover/btn:scale-110 group-hover/btn:rotate-6 transition-all duration-500 shadow-xl shadow-indigo-500/10 border border-indigo-500/20">
            <MagnifyingGlassIcon className="w-10 h-10" />
          </div>
          <div className="text-left relative z-10">
            <p className="text-[11px] font-black text-indigo-600/60 dark:text-indigo-400/60 uppercase tracking-[0.3em] mb-3 opacity-70">Modul</p>
            <p className="text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">Interactive Analyst</p>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('Dokument-Pipeline')}
          className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-12 rounded-[4rem] flex items-center gap-10 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-[0_40px_100px_-20px_rgba(16,185,129,0.15)] transition-all group active:scale-[0.98] relative overflow-hidden group/btn duration-500"
        >
          <div className="absolute inset-0 bg-emerald-500/0 group-hover/btn:bg-emerald-500/[0.03] transition-colors"></div>
          <div className="p-7 bg-emerald-500/10 rounded-[2rem] text-emerald-600 dark:text-emerald-400 group-hover/btn:scale-110 group-hover/btn:-rotate-6 transition-all duration-500 shadow-xl shadow-emerald-500/10 border border-emerald-500/20">
            <DocumentTextIcon className="w-10 h-10" />
          </div>
          <div className="text-left relative z-10">
            <p className="text-[11px] font-black text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-[0.3em] mb-3 opacity-70">Process</p>
            <p className="text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">Dokument-Pipeline</p>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('Snabbstartsguide')}
          className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-12 rounded-[4rem] flex items-center gap-10 hover:border-rose-400 dark:hover:border-rose-600 hover:shadow-[0_40px_100px_-20px_rgba(244,63,94,0.15)] transition-all group active:scale-[0.98] relative overflow-hidden group/btn duration-500"
        >
          <div className="absolute inset-0 bg-rose-500/0 group-hover/btn:bg-rose-500/[0.03] transition-colors"></div>
          <div className="p-7 bg-rose-500/10 rounded-[2rem] text-rose-600 dark:text-rose-400 group-hover/btn:scale-110 group-hover/btn:rotate-6 transition-all duration-500 shadow-xl shadow-rose-500/10 border border-rose-500/20">
            <ActivityIcon className="w-10 h-10" />
          </div>
          <div className="text-left relative z-10">
            <p className="text-[11px] font-black text-rose-600/60 dark:text-rose-400/60 uppercase tracking-[0.3em] mb-3 opacity-70">Support</p>
            <p className="text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">Snabbstartsguide</p>
          </div>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          <Tabs tabs={tabOptions} activeTab={activeTab} onTabChange={setActiveTab}>
            {(currentTab) => (
              <div className="p-8 md:p-12 animate-in fade-in slide-in-from-top-4 duration-500">
                {currentTab === 'Snabbstartsguide' && <QuickStartGuide />}
                {currentTab === 'Översikt' && <OverviewContent analysis={props.analysis} />}
                {currentTab === 'Interactive Analyst' && <InteractiveAnalyst analysis={props.analysis} />}
                {currentTab === 'Dokument-Pipeline' && <LegalPipelineView analysis={props.analysis} />}
                {currentTab === 'Forensisk Integritet' && <ForensicIntegrityView analysis={props.analysis} />}
                {currentTab === 'Intelligence Core' && <IntelligenceCore analysis={props.analysis} />}
                {currentTab === 'FMJAM Controller' && <FmjamController analysis={props.analysis} />}
                {currentTab === 'Systemarkitektur' && <SystemArchitectureView analysisId={props.analysis.caseId} onNavigate={setActiveTab} />}
                {currentTab === 'Tidslinje' && <TimelineView analysis={props.analysis} />}
                {currentTab === 'Processnotarie' && (
                    <div className="h-[700px] bg-slate-950 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-inner">
                        <AutoNotaryView />
                    </div>
                )}
                {currentTab === 'Advokatbyrå' && (
                    <AgentView caseData={JSON.stringify(props.analysis)} caseId={props.analysis.caseId} />
                )}
                {currentTab === 'Rättegångssimulator' && (
                    <AdversarialDuelView caseData={JSON.stringify(props.analysis)} caseId={props.analysis.caseId} />
                )}
                {currentTab === 'Beviskedja' && (
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-2">
                                <Card title={`Faktaatomer (Låsta: ${props.analysis.atoms?.length || 0})`} icon={<LightbulbIcon className="w-5 h-5" />}>
                                    <div className="space-y-6">
                                        {(props.analysis.facts || []).map(f => {
                                            const relatedAtom = (props.analysis.atoms || []).find(a => a.id === f.id.replace('FACT', 'ATOM'));
                                            return (
                                                <div key={f.id} className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-200 dark:border-slate-700 hover:border-blue-500/40 transition-all group shadow-sm">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-[0.15em]">{f.category}</span>
                                                            {relatedAtom && (
                                                                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-[0.15em] flex items-center gap-1.5">
                                                                  <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                                                                  Verifierad
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-900 dark:text-slate-100 font-bold text-lg leading-relaxed mb-8">{f.subject}: {f.statement}</p>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 p-2 opacity-5">
                                                              <DocumentTextIcon className="w-12 h-12" />
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 uppercase font-black mb-4 tracking-[0.2em]">Källprovenans</p>
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed relative z-10">"{f.source.snippet}"</p>
                                                            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">DOK: {f.source.documentId}</span>
                                                                <span className="text-[10px] font-mono font-black text-blue-500 uppercase tracking-widest">POS: {relatedAtom?.position || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 p-2 opacity-5">
                                                              <LawIcon className="w-12 h-12" />
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 uppercase font-black mb-4 tracking-[0.2em]">Juridisk Koppling</p>
                                                            {(props.analysis.legalFrameworkLinks || []).filter(l => l.relatedFactIds?.includes(f.id)).map(link => (
                                                                <div key={link.id} className="mb-4 last:mb-0 relative z-10">
                                                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-black mb-1.5 uppercase tracking-wide">{link.label}</p>
                                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 font-medium">{link.reasoning}</p>
                                                                </div>
                                                            )) || <p className="text-xs text-slate-400 italic">Ingen direkt koppling identifierad.</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(props.analysis.facts?.length || 0) === 0 && (
                                            <div className="py-20 text-center opacity-20">
                                                <CpuChipIcon className="w-16 h-16 mx-auto mb-6 text-slate-400" />
                                                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Inga faktaatomer extraherade än</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                            
                            <div className="space-y-10">
                                <Card title="Juridiskt Ramverk & Lagrum" icon={<LawIcon className="w-5 h-5" />}>
                                    <div className="space-y-6">
                                        {/* AI-genererade kopplingar */}
                                        {(props.analysis.legalFrameworkLinks?.length || 0) > 0 && (
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">AI-identifierade kopplingar</p>
                                                {(props.analysis.legalFrameworkLinks || []).map(link => (
                                                    <div 
                                                        key={link.id}
                                                        className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl shadow-sm"
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <p className="text-sm font-black text-blue-600 dark:text-blue-400 tracking-tight italic uppercase">{link.label}</p>
                                                            <span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest">AI-Link</span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-4 italic">"{link.reasoning}"</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Extraherade lagreferenser */}
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Extraherade lagrum (SFS)</p>
                                            {(props.analysis.legalReferences || []).map(r => {
                                                const isVerified = LEGAL_SOURCES.some(s => 
                                                    s.reference === r.source || 
                                                    s.label.toLowerCase() === r.rawText.toLowerCase() ||
                                                    (s.sfsNumber && r.rawText.includes(s.sfsNumber))
                                                );
                                                return (
                                                    <button 
                                                        key={r.id} 
                                                        onClick={() => setSelectedLegalRefId(r.id)}
                                                        className="w-full text-left p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group flex justify-between items-center shadow-sm active:scale-[0.98]"
                                                    >
                                                        <div className="flex-grow">
                                                            <div className="flex items-center gap-3 mb-2.5">
                                                                <p className="text-sm font-black text-blue-600 dark:text-blue-400 tracking-tight">{r.rawText}</p>
                                                                {(r.valid || isVerified) && (
                                                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.15em]">
                                                                        <ShieldCheckIcon className="w-3 h-3" />
                                                                        Verifierad
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-1 leading-relaxed font-medium">"{r.contextSnippet}"</p>
                                                        </div>
                                                        <div className="ml-4 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 group-hover:border-blue-500/30 transition-all shadow-sm group-hover:shadow-md">
                                                            <LinkIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                            {(props.analysis.legalReferences?.length || 0) === 0 && (
                                                <div className="py-10 text-center opacity-30">
                                                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Inga lagrum identifierade</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>

                                <Card title="Provenans-status" icon={<ShieldCheckIcon className="w-5 h-5" />}>
                                    <div className="space-y-6">
                                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl shadow-sm">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Vektor-matchning</span>
                                                <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">100%</span>
                                            </div>
                                            <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 w-full shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl shadow-sm">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">Reasoning Chain</span>
                                                <span className="text-xs font-mono font-black text-blue-600 dark:text-blue-400 uppercase">Aktiv</span>
                                            </div>
                                            <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 w-[85%] shadow-[0_0_12px_rgba(59,130,246,0.5)]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'MEGAINLAGA' && (
                    <div className="space-y-10">
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden shadow-sm">
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                                    <CpuChipIcon className="w-5 h-5" />
                                  </div>
                                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mega-Aggregator v.7.2</h3>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-base leading-relaxed max-w-xl">Genererar en deterministisk rättsutredning baserad på 100% källspårbarhet och forensisk bevisföring.</p>
                            </div>
                            <button 
                                onClick={() => props.onGenerateSynthesis('FORENSIC_DETAILED_V1').catch(err => console.error('Synthesis generation failed:', err))}
                                disabled={props.isGeneratingSynthesis}
                                className="btn btn-primary !px-10 !py-5 !rounded-2xl shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all"
                            >
                                {props.isGeneratingSynthesis ? <Spinner className="h-5 w-5" /> : <SparklesIcon className="h-5 w-5" />}
                                <span className="font-black uppercase tracking-widest">Kör Aggregator</span>
                            </button>
                            
                            {/* Decorative background */}
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-10 md:p-20 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-inner min-h-[700px] relative flex flex-col">
                            {props.analysis.synthesis ? (
                                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-400 animate-in fade-in duration-1000">
                                    <MarkdownRenderer content={props.analysis.synthesis} />
                                </div>
                            ) : (
                                <div className="flex-grow flex flex-col items-center justify-center space-y-10">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-blue-500 blur-[6rem] opacity-10 animate-pulse"></div>
                                        <div className="relative p-12 bg-slate-50 dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl">
                                            <CpuChipIcon className="w-24 h-24 text-slate-300 dark:text-slate-700" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em] mb-4">Väntar på indata</p>
                                        <p className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-sm">Aggregatorn är redo för exekvering</p>
                                    </div>
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-16">
            <div className="bg-slate-50 dark:bg-slate-800/30 p-16 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 relative overflow-hidden shadow-sm group">
                <div className="flex items-center space-x-6 mb-12">
                    <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform duration-500 border border-indigo-500/20">
                        <ShieldCheckIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em] opacity-80">Forensic Chain Summary</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                    <StatCard label="Aktiverat Lagrum" value={analysis.legalReferences?.length || 0} color="indigo" />
                    <StatCard label="Bevisatomer" value={analysis.atoms?.length || 0} color="indigo" />
                    <StatCard label="Audit Verifierad" value={analysis.audit?.checks?.filter(c => c.status === 'ok').length || 0} color="indigo" />
                    <StatCard label="Beviskategorier" value={new Set((analysis.atoms || []).flatMap(a => a.tags || [])).size} color="indigo" />
                    <StatCard label="Lagrumskopplingar" value={analysis.legalFrameworkLinks?.length || 0} color="indigo" />
                    <StatCard label="Integritets-Score" value={analysis.audit?.integrityScore || 100} suffix="%" color="indigo" />
                </div>
            </div>
            <Card title="Verifierade Beviskategorier" icon={<TagIcon className="w-6 h-6" />}>
                <div className="flex flex-wrap gap-8">
                    {(analysis.themes || []).map(t => (
                        <div key={t.id} className="bg-slate-50 dark:bg-slate-800/50 px-10 py-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-700 flex flex-col items-center min-w-[160px] shadow-sm hover:border-indigo-400/40 transition-all hover:-translate-y-2 duration-300">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 opacity-70">{t.label}</span>
                            <span className="text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">{(analysis.facts || []).filter(f => f.category === t.id).length}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
        <div className="lg:col-span-4">
            <Card title="QA-Revision" icon={<ShieldCheckIcon className="w-6 h-6" />}>
                <div className="space-y-8">
                    {(analysis.qaSummary || []).map(check => (
                        <div key={check.id} className="p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-start gap-8 shadow-sm hover:border-emerald-400/40 transition-all group/qa">
                            <div className={`p-4 rounded-2xl mt-0.5 transition-all duration-500 group-hover/qa:scale-110 shadow-inner ${check.status === 'pass' ? 'text-emerald-600 bg-emerald-500/10 border border-emerald-500/20' : 'text-rose-600 bg-rose-500/10 border border-rose-500/20'}`}>
                                <CheckCircleIcon className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="font-serif font-bold text-slate-900 dark:text-white text-xl mb-2 tracking-tight">{check.label}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed font-medium">{check.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    </div>
);

const StatCard: React.FC<{ label: string, value: number, color: string, suffix?: string }> = ({ label, value, color, suffix = "" }) => (
    <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm group hover:border-indigo-400/50 hover:shadow-[0_30px_60px_-10px_rgba(99,102,241,0.15)] transition-all active:scale-95 duration-500 hover:-translate-y-2">
        <p className="text-7xl font-serif font-bold text-indigo-600 dark:text-indigo-400 mb-5 tracking-tight leading-none">{value}{suffix}</p>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-70">{label}</p>
    </div>
);

export default AnalysisResults;
