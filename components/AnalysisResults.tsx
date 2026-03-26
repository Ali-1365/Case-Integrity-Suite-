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
    <div className="space-y-20 animate-in fade-in slide-in-from-bottom-10 duration-1000 pb-32">
      <AnalysisDashboard analysis={props.analysis} />

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-6 md:px-0">
        <button 
          onClick={() => setActiveTab('Interactive Analyst')}
          className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-16 rounded-[6rem] flex items-center gap-14 hover:border-indigo-500/60 dark:hover:border-indigo-400/60 hover:shadow-[0_80px_180px_-40px_rgba(99,102,241,0.3)] transition-all group active:scale-[0.95] relative overflow-hidden group/btn duration-1000"
        >
          <div className="absolute inset-0 bg-indigo-500/0 group-hover/btn:bg-indigo-500/[0.06] transition-colors duration-1000"></div>
          <div className="p-10 bg-indigo-500/10 rounded-[3rem] text-indigo-600 dark:text-indigo-400 group-hover/btn:scale-125 group-hover/btn:rotate-12 transition-all duration-1000 shadow-[0_20px_50px_rgba(99,102,241,0.2)] border-2 border-indigo-500/20">
            <MagnifyingGlassIcon className="w-14 h-14" />
          </div>
          <div className="text-left relative z-10 space-y-3">
            <p className="text-[13px] font-black text-indigo-600/60 dark:text-indigo-400/60 uppercase tracking-[0.5em] opacity-100">Modul</p>
            <p className="text-4xl font-serif font-black text-slate-900 dark:text-white tracking-tighter leading-none">Interactive Analyst</p>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('Dokument-Pipeline')}
          className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-16 rounded-[6rem] flex items-center gap-14 hover:border-emerald-500/60 dark:hover:border-emerald-400/60 hover:shadow-[0_80px_180px_-40px_rgba(16,185,129,0.3)] transition-all group active:scale-[0.95] relative overflow-hidden group/btn duration-1000"
        >
          <div className="absolute inset-0 bg-emerald-500/0 group-hover/btn:bg-emerald-500/[0.06] transition-colors duration-1000"></div>
          <div className="p-10 bg-emerald-500/10 rounded-[3rem] text-emerald-600 dark:text-emerald-400 group-hover/btn:scale-125 group-hover/btn:-rotate-12 transition-all duration-1000 shadow-[0_20px_50px_rgba(16,185,129,0.2)] border-2 border-emerald-500/20">
            <DocumentTextIcon className="w-14 h-14" />
          </div>
          <div className="text-left relative z-10 space-y-3">
            <p className="text-[13px] font-black text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-[0.5em] opacity-100">Process</p>
            <p className="text-4xl font-serif font-black text-slate-900 dark:text-white tracking-tighter leading-none">Dokument-Pipeline</p>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('Snabbstartsguide')}
          className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-16 rounded-[6rem] flex items-center gap-14 hover:border-rose-500/60 dark:hover:border-rose-400/60 hover:shadow-[0_80px_180px_-40px_rgba(244,63,94,0.3)] transition-all group active:scale-[0.95] relative overflow-hidden group/btn duration-1000"
        >
          <div className="absolute inset-0 bg-rose-500/0 group-hover/btn:bg-rose-500/[0.06] transition-colors duration-1000"></div>
          <div className="p-10 bg-rose-500/10 rounded-[3rem] text-rose-600 dark:text-rose-400 group-hover/btn:scale-125 group-hover/btn:rotate-12 transition-all duration-1000 shadow-[0_20px_50px_rgba(244,63,94,0.2)] border-2 border-rose-500/20">
            <ActivityIcon className="w-14 h-14" />
          </div>
          <div className="text-left relative z-10 space-y-3">
            <p className="text-[13px] font-black text-rose-600/60 dark:text-rose-400/60 uppercase tracking-[0.5em] opacity-100">Support</p>
            <p className="text-4xl font-serif font-black text-slate-900 dark:text-white tracking-tighter leading-none">Snabbstartsguide</p>
          </div>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[6rem] border-2 border-slate-100 dark:border-slate-800 shadow-[0_80px_200px_-40px_rgba(0,0,0,0.12)] dark:shadow-none overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 opacity-40" />
          <Tabs tabs={tabOptions} activeTab={activeTab} onTabChange={setActiveTab}>
            {(currentTab) => (
              <div className="p-12 md:p-24 animate-in fade-in slide-in-from-top-12 duration-1000">
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
                    <div className="h-[800px] bg-slate-950 rounded-[3.5rem] border-2 border-slate-800 overflow-hidden shadow-[inset_0_20px_50px_rgba(0,0,0,0.5)]">
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
                    <div className="space-y-16">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                            <div className="lg:col-span-2">
                                <Card title={`Faktaatomer (Låsta: ${props.analysis.atoms?.length || 0})`} icon={<LightbulbIcon className="w-6 h-6" />}>
                                    <div className="space-y-10">
                                        {(props.analysis.facts || []).map(f => {
                                            const relatedAtom = (props.analysis.atoms || []).find(a => a.id === f.id.replace('FACT', 'ATOM'));
                                            return (
                                                <div key={f.id} className="p-10 bg-slate-50 dark:bg-slate-800/40 rounded-[3rem] border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-500/40 transition-all group shadow-sm hover:shadow-xl hover:shadow-indigo-500/5">
                                                    <div className="flex justify-between items-start mb-8">
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-5 py-2 rounded-full border border-indigo-500/20 uppercase tracking-[0.2em]">{f.category}</span>
                                                            {relatedAtom && (
                                                                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-5 py-2 rounded-full border border-emerald-500/20 uppercase tracking-[0.2em] flex items-center gap-2.5">
                                                                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                                  Verifierad
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-900 dark:text-slate-100 font-serif font-bold text-2xl leading-snug mb-10 tracking-tight">{f.subject}: {f.statement}</p>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                        <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group/box">
                                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/box:opacity-10 transition-opacity duration-700">
                                                              <DocumentTextIcon className="w-16 h-16" />
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 uppercase font-black mb-5 tracking-[0.3em]">Källprovenans</p>
                                                            <p className="text-base text-slate-600 dark:text-slate-400 italic leading-relaxed relative z-10 font-medium">"{f.source.snippet}"</p>
                                                            <div className="mt-8 pt-8 border-t-2 border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                                                <span className="text-[11px] font-mono font-black text-slate-400 uppercase tracking-[0.2em]">DOK: {f.source.documentId}</span>
                                                                <span className="text-[11px] font-mono font-black text-indigo-500 uppercase tracking-[0.2em]">POS: {relatedAtom?.position || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group/box">
                                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/box:opacity-10 transition-opacity duration-700">
                                                              <LawIcon className="w-16 h-16" />
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 uppercase font-black mb-5 tracking-[0.3em]">Juridisk Koppling</p>
                                                            {(props.analysis.legalFrameworkLinks || []).filter(l => l.relatedFactIds?.includes(f.id)).map(link => (
                                                                <div key={link.id} className="mb-6 last:mb-0 relative z-10">
                                                                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-black mb-2 uppercase tracking-widest">{link.label}</p>
                                                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 font-medium">{link.reasoning}</p>
                                                                </div>
                                                            )) || <p className="text-sm text-slate-400 italic font-medium">Ingen direkt koppling identifierad.</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(props.analysis.facts?.length || 0) === 0 && (
                                            <div className="py-32 text-center opacity-20">
                                                <div className="relative inline-block">
                                                  <div className="absolute inset-0 bg-slate-400 blur-[40px] opacity-20 rounded-full" />
                                                  <CpuChipIcon className="w-24 h-24 mx-auto mb-8 text-slate-400 relative z-10" />
                                                </div>
                                                <p className="text-lg font-black uppercase tracking-[0.4em] text-slate-400">Inga faktaatomer extraherade än</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                            
                            <div className="space-y-16">
                                <Card title="Juridiskt Ramverk & Lagrum" icon={<LawIcon className="w-6 h-6" />}>
                                    <div className="space-y-10">
                                        {/* AI-genererade kopplingar */}
                                        {(props.analysis.legalFrameworkLinks?.length || 0) > 0 && (
                                            <div className="space-y-4">
                                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 px-3 opacity-80">AI-identifierade kopplingar</p>
                                                {(props.analysis.legalFrameworkLinks || []).map(link => (
                                                    <div 
                                                        key={link.id}
                                                        className="p-8 bg-indigo-500/5 border-2 border-indigo-500/10 rounded-[2rem] shadow-sm hover:border-indigo-500/30 transition-all"
                                                    >
                                                        <div className="flex justify-between items-start mb-4">
                                                            <p className="text-base font-black text-indigo-600 dark:text-indigo-400 tracking-tight italic uppercase">{link.label}</p>
                                                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20 uppercase tracking-[0.2em]">AI-Link</span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">"{link.reasoning}"</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Extraherade lagreferenser */}
                                        <div className="space-y-4">
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 px-3 opacity-80">Extraherade lagrum (SFS)</p>
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
                                                        className="w-full text-left p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group flex justify-between items-center shadow-sm active:scale-[0.97] duration-500"
                                                    >
                                                        <div className="flex-grow">
                                                            <div className="flex items-center gap-4 mb-3">
                                                                <p className="text-base font-black text-indigo-600 dark:text-indigo-400 tracking-tighter uppercase">{r.rawText}</p>
                                                                {(r.valid || isVerified) && (
                                                                    <span className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">
                                                                        <ShieldCheckIcon className="w-3.5 h-3.5" />
                                                                        Verifierad
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 italic line-clamp-1 leading-relaxed font-medium">"{r.contextSnippet}"</p>
                                                        </div>
                                                        <div className="ml-6 p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 group-hover:border-indigo-500/30 transition-all shadow-sm group-hover:shadow-xl group-hover:shadow-indigo-500/10">
                                                            <LinkIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                            {(props.analysis.legalReferences?.length || 0) === 0 && (
                                                <div className="py-16 text-center opacity-30">
                                                  <p className="text-base font-bold text-slate-400 uppercase tracking-[0.3em]">Inga lagrum identifierade</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>

                                <Card title="Provenans-status" icon={<ShieldCheckIcon className="w-6 h-6" />}>
                                    <div className="space-y-10">
                                        <div className="p-8 bg-emerald-500/5 border-2 border-emerald-500/10 rounded-[2.5rem] shadow-sm">
                                            <div className="flex justify-between items-center mb-5">
                                                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em]">Vektor-matchning</span>
                                                <span className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400">100%</span>
                                            </div>
                                            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                <div className="h-full bg-emerald-500 w-full shadow-[0_0_20px_rgba(16,185,129,0.7)]"></div>
                                            </div>
                                        </div>
                                        <div className="p-8 bg-indigo-500/5 border-2 border-indigo-500/10 rounded-[2.5rem] shadow-sm">
                                            <div className="flex justify-between items-center mb-5">
                                                <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">Reasoning Chain</span>
                                                <span className="text-sm font-mono font-black text-indigo-600 dark:text-indigo-400 uppercase">Aktiv</span>
                                            </div>
                                            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                <div className="h-full bg-indigo-500 w-[85%] shadow-[0_0_20px_rgba(79,70,229,0.7)]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'MEGAINLAGA' && (
                    <div className="space-y-16">
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-14 rounded-[3.5rem] border-2 border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row justify-between items-center gap-12 relative overflow-hidden shadow-sm">
                            <div className="relative z-10 text-center lg:text-left">
                                <div className="flex items-center justify-center lg:justify-start gap-5 mb-5">
                                  <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-500/10 border border-indigo-500/20">
                                    <CpuChipIcon className="w-8 h-8" />
                                  </div>
                                  <h3 className="text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tighter">Mega-Aggregator v.7.2</h3>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-xl leading-relaxed max-w-2xl">Genererar en deterministisk rättsutredning baserad på 100% källspårbarhet och forensisk bevisföring.</p>
                            </div>
                            <button 
                                onClick={() => props.onGenerateSynthesis('FORENSIC_DETAILED_V1').catch(err => console.error('Synthesis generation failed:', err))}
                                disabled={props.isGeneratingSynthesis}
                                className="group/agg flex items-center gap-5 px-14 py-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:shadow-[0_30px_70px_rgba(79,70,229,0.4)] active:scale-[0.96] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {props.isGeneratingSynthesis ? <Spinner className="h-8 w-8" /> : <SparklesIcon className="h-8 w-8 group-hover/agg:rotate-12 transition-transform duration-500" />}
                                <span className="text-xl font-black uppercase tracking-[0.2em]">Kör Aggregator</span>
                            </button>
                            
                            {/* Decorative background */}
                            <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]"></div>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-12 md:p-24 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-[inset_0_20px_60px_rgba(0,0,0,0.03)] min-h-[800px] relative flex flex-col">
                            {props.analysis.synthesis ? (
                                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tighter prose-p:leading-relaxed prose-p:text-lg prose-p:text-slate-600 dark:prose-p:text-slate-400 animate-in fade-in duration-1000">
                                    <MarkdownRenderer content={props.analysis.synthesis} />
                                </div>
                            ) : (
                                <div className="flex-grow flex flex-col items-center justify-center space-y-12">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-500 blur-[8rem] opacity-20 animate-pulse"></div>
                                        <div className="relative p-16 bg-slate-50 dark:bg-slate-900 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-2xl transition-transform duration-1000 hover:scale-105">
                                            <CpuChipIcon className="w-32 h-32 text-slate-300 dark:text-slate-700" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-4">
                                        <p className="text-4xl font-serif font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em]">Väntar på indata</p>
                                        <p className="text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.3em] text-base">Aggregatorn är redo för exekvering</p>
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        <div className="lg:col-span-8 space-y-20">
            <div className="bg-slate-50 dark:bg-slate-800/30 p-20 rounded-[5rem] border-2 border-slate-100 dark:border-slate-800 relative overflow-hidden shadow-inner group">
                <div className="flex items-center space-x-8 mb-16">
                    <div className="p-6 bg-indigo-500/10 rounded-3xl text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform duration-1000 border-2 border-indigo-500/20 shadow-lg">
                        <ShieldCheckIcon className="w-10 h-10" />
                    </div>
                    <h3 className="text-[13px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.5em] opacity-100">Forensic Chain Summary</h3>
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
            <Card title="Verifierade Beviskategorier" icon={<TagIcon className="w-8 h-8" />}>
                <div className="flex flex-wrap gap-10">
                    {(analysis.themes || []).map(t => (
                        <div key={t.id} className="bg-slate-50 dark:bg-slate-800/50 px-12 py-10 rounded-[3.5rem] border-2 border-slate-100 dark:border-slate-700 flex flex-col items-center min-w-[180px] shadow-md hover:border-indigo-500/50 transition-all hover:-translate-y-4 duration-700 group/theme">
                            <span className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 opacity-80 group-hover/theme:text-indigo-500 transition-colors">{t.label}</span>
                            <span className="text-6xl font-serif font-black text-slate-900 dark:text-white tracking-tighter leading-none group-hover/theme:scale-110 transition-transform">{(analysis.facts || []).filter(f => f.category === t.id).length}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
        <div className="lg:col-span-4">
            <Card title="QA-Revision" icon={<ShieldCheckIcon className="w-8 h-8" />}>
                <div className="space-y-10">
                    {(analysis.qaSummary || []).map(check => (
                        <div key={check.id} className="p-10 rounded-[3.5rem] border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-start gap-10 shadow-md hover:border-emerald-500/50 transition-all group/qa duration-700">
                            <div className={`p-6 rounded-3xl mt-1 transition-all duration-1000 group-hover/qa:scale-125 group-hover/qa:rotate-12 shadow-2xl ${check.status === 'pass' ? 'text-emerald-600 bg-emerald-500/10 border-2 border-emerald-500/20 shadow-emerald-500/10' : 'text-rose-600 bg-rose-500/10 border-2 border-rose-500/20 shadow-rose-500/10'}`}>
                                <CheckCircleIcon className="h-10 w-10" />
                            </div>
                            <div className="space-y-3">
                                <p className="font-serif font-black text-slate-900 dark:text-white text-3xl tracking-tighter leading-none">{check.label}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xl leading-relaxed font-medium opacity-90">{check.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    </div>
);

const StatCard: React.FC<{ label: string, value: number, color: string, suffix?: string }> = ({ label, value, color, suffix = "" }) => (
    <div className="text-center p-14 bg-white dark:bg-slate-900 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-md group hover:border-indigo-500/60 hover:shadow-[0_40px_100px_-20px_rgba(99,102,241,0.25)] transition-all active:scale-[0.93] duration-1000 hover:-translate-y-4">
        <p className="text-8xl font-serif font-black text-indigo-600 dark:text-indigo-400 mb-6 tracking-tighter leading-none group-hover:scale-110 transition-transform duration-1000">{value}{suffix}</p>
        <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-100">{label}</p>
    </div>
);

export default AnalysisResults;
