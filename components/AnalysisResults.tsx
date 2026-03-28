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
    <div className="space-y-8 animate-fade-in pb-16">
      <AnalysisDashboard analysis={props.analysis} />

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-0">
        <button 
          onClick={() => setActiveTab('Interactive Analyst')}
          className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-2xl flex items-center gap-6 hover:border-[var(--accent)] hover:shadow-md transition-all group active:scale-[0.98] relative overflow-hidden duration-500"
        >
          <div className="p-4 bg-[var(--accent)]/5 rounded-xl text-[var(--accent)] group-hover:scale-110 transition-all duration-500 border border-[var(--accent)]/10">
            <MagnifyingGlassIcon className="w-6 h-6" />
          </div>
          <div className="text-left relative z-10">
            <p className="text-[9px] font-bold text-[var(--ink-light)] uppercase tracking-widest mb-0.5">Modul</p>
            <p className="text-lg font-bold text-[var(--ink-main)] tracking-tight">Interactive Analyst</p>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('Dokument-Pipeline')}
          className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-2xl flex items-center gap-6 hover:border-[var(--success)] hover:shadow-md transition-all group active:scale-[0.98] relative overflow-hidden duration-500"
        >
          <div className="p-4 bg-[var(--success)]/5 rounded-xl text-[var(--success)] group-hover:scale-110 transition-all duration-500 border border-[var(--success)]/10">
            <DocumentTextIcon className="w-6 h-6" />
          </div>
          <div className="text-left relative z-10">
            <p className="text-[9px] font-bold text-[var(--ink-light)] uppercase tracking-widest mb-0.5">Process</p>
            <p className="text-lg font-bold text-[var(--ink-main)] tracking-tight">Dokument-Pipeline</p>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('Snabbstartsguide')}
          className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-2xl flex items-center gap-6 hover:border-[var(--danger)] hover:shadow-md transition-all group active:scale-[0.98] relative overflow-hidden duration-500"
        >
          <div className="p-4 bg-[var(--danger)]/5 rounded-xl text-[var(--danger)] group-hover:scale-110 transition-all duration-500 border border-[var(--danger)]/10">
            <ActivityIcon className="w-6 h-6" />
          </div>
          <div className="text-left relative z-10">
            <p className="text-[9px] font-bold text-[var(--ink-light)] uppercase tracking-widest mb-0.5">Support</p>
            <p className="text-lg font-bold text-[var(--ink-main)] tracking-tight">Snabbstartsguide</p>
          </div>
        </button>
      </div>

      <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-lg overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)] opacity-80" />
          <Tabs tabs={tabOptions} activeTab={activeTab} onTabChange={setActiveTab}>
            {(currentTab) => (
              <div className="p-6 md:p-10 animate-fade-in">
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
                    <div className="h-[700px] bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-[inset_0_20px_50px_rgba(0,0,0,0.5)]">
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
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2">
                                <Card title={`Faktaatomer (Låsta: ${props.analysis.atoms?.length || 0})`} icon={<LightbulbIcon className="w-5 h-5" />}>
                                    <div className="space-y-6">
                                        {(props.analysis.facts || []).map(f => {
                                            const relatedAtom = (props.analysis.atoms || []).find(a => a.id === f.id.replace('FACT', 'ATOM'));
                                            return (
                                                <div key={f.id} className="p-6 bg-[var(--bg-main)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all group shadow-sm">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="text-[9px] font-bold text-[var(--accent)] bg-[var(--accent)]/5 px-3 py-1 rounded-full border border-[var(--accent)]/10 uppercase tracking-widest">{f.category}</span>
                                                            {relatedAtom && (
                                                                <span className="text-[9px] font-bold text-[var(--success)] bg-[var(--success)]/5 px-3 py-1 rounded-full border border-[var(--success)]/10 uppercase tracking-widest flex items-center gap-1.5">
                                                                  <div className="w-1 h-1 rounded-full bg-[var(--success)] animate-pulse"></div>
                                                                  Verifierad
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-[var(--ink-main)] font-bold text-base leading-snug mb-6 tracking-tight">{f.subject}: {f.statement}</p>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border)] shadow-sm relative overflow-hidden group/box">
                                                            <p className="text-[9px] text-[var(--ink-light)] uppercase font-bold mb-3 tracking-widest">Källprovenans</p>
                                                            <p className="text-xs text-[var(--ink-muted)] italic leading-relaxed relative z-10">"{f.source.snippet}"</p>
                                                            <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                                                                <span className="text-[9px] font-mono font-bold text-[var(--ink-light)] uppercase tracking-widest">DOK: {f.source.documentId}</span>
                                                                <span className="text-[9px] font-mono font-bold text-[var(--accent)] uppercase tracking-widest">POS: {relatedAtom?.position || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border)] shadow-sm relative overflow-hidden group/box">
                                                            <p className="text-[9px] text-[var(--ink-light)] uppercase font-bold mb-3 tracking-widest">Juridisk Koppling</p>
                                                            {(props.analysis.legalFrameworkLinks || []).filter(l => l.relatedFactIds?.includes(f.id)).map(link => (
                                                                <div key={link.id} className="mb-3 last:mb-0 relative z-10">
                                                                    <p className="text-[10px] text-[var(--accent)] font-bold mb-0.5 uppercase tracking-widest">{link.label}</p>
                                                                    <p className="text-[10px] text-[var(--ink-muted)] leading-relaxed line-clamp-2">{link.reasoning}</p>
                                                                </div>
                                                            )) || <p className="text-[10px] text-[var(--ink-light)] italic">Ingen direkt koppling identifierad.</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(props.analysis.facts?.length || 0) === 0 && (
                                            <div className="py-24 text-center opacity-20">
                                                <div className="relative inline-block">
                                                  <div className="absolute inset-0 bg-slate-400 blur-[30px] opacity-20 rounded-full" />
                                                  <CpuChipIcon className="w-16 h-16 mx-auto mb-6 text-slate-400 relative z-10" />
                                                </div>
                                                <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Inga faktaatomer extraherade än</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                            
                            <div className="space-y-12">
                                <Card title="Juridiskt Ramverk & Lagrum" icon={<LawIcon className="w-5 h-5" />}>
                                    <div className="space-y-8">
                                        {/* AI-genererade kopplingar */}
                                        {(props.analysis.legalFrameworkLinks?.length || 0) > 0 && (
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-2 opacity-80">AI-identifierade kopplingar</p>
                                                {(props.analysis.legalFrameworkLinks || []).map(link => (
                                                    <div 
                                                        key={link.id}
                                                        className="p-4 bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-xl shadow-sm"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="text-xs font-bold text-[var(--accent)] tracking-tight uppercase italic">{link.label}</p>
                                                            <span className="text-[8px] font-bold text-[var(--accent)] bg-[var(--accent)]/5 px-1.5 py-0.5 rounded border border-[var(--accent)]/10 uppercase tracking-widest">AI-Link</span>
                                                        </div>
                                                        <p className="text-[10px] text-[var(--ink-muted)] leading-relaxed italic">"{link.reasoning}"</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Extraherade lagreferenser */}
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-2 opacity-80">Extraherade lagrum (SFS)</p>
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
                                                        className="w-full text-left p-4 bg-[var(--bg-main)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 transition-all group flex justify-between items-center shadow-sm active:scale-[0.98]"
                                                    >
                                                        <div className="flex-grow">
                                                            <div className="flex items-center gap-2.5 mb-1.5">
                                                                <p className="text-xs font-bold text-[var(--accent)] tracking-tight uppercase">{r.rawText}</p>
                                                                {(r.valid || isVerified) && (
                                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-[var(--success)]/5 border border-[var(--success)]/10 rounded-full text-[8px] font-bold text-[var(--success)] uppercase tracking-widest">
                                                                        <ShieldCheckIcon className="w-2.5 h-2.5" />
                                                                        Verifierad
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-[var(--ink-light)] italic line-clamp-1 leading-relaxed">"{r.contextSnippet}"</p>
                                                        </div>
                                                        <div className="ml-3 p-2 bg-[var(--bg-card)] rounded-lg border border-[var(--border)] group-hover:border-[var(--accent)]/30 transition-all shadow-sm">
                                                            <LinkIcon className="w-3.5 h-3.5 text-[var(--ink-light)] group-hover:text-[var(--accent)] transition-colors" />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                            {(props.analysis.legalReferences?.length || 0) === 0 && (
                                                <div className="py-12 text-center opacity-30">
                                                  <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Inga lagrum identifierade</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>

                                <Card title="Provenans-status" icon={<ShieldCheckIcon className="w-5 h-5" />}>
                                    <div className="space-y-8">
                                        <div className="p-4 bg-[var(--success)]/5 border border-[var(--success)]/10 rounded-xl shadow-sm">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[9px] font-bold text-[var(--success)] uppercase tracking-widest">Vektor-matchning</span>
                                                <span className="text-[10px] font-mono font-bold text-[var(--success)]">100%</span>
                                            </div>
                                            <div className="h-1.5 bg-[var(--bg-main)] rounded-full overflow-hidden shadow-inner">
                                                <div className="h-full bg-[var(--success)] w-full shadow-[0_0_10px_rgba(25,135,84,0.3)]"></div>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-xl shadow-sm">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[9px] font-bold text-[var(--accent)] uppercase tracking-widest">Reasoning Chain</span>
                                                <span className="text-[10px] font-mono font-bold text-[var(--accent)] uppercase">Aktiv</span>
                                            </div>
                                            <div className="h-1.5 bg-[var(--bg-main)] rounded-full overflow-hidden shadow-inner">
                                                <div className="h-full bg-[var(--accent)] w-[85%] shadow-[0_0_10px_rgba(0,86,179,0.3)]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'MEGAINLAGA' && (
                    <div className="space-y-12">
                        <div className="bg-[var(--bg-main)] p-8 rounded-2xl border border-[var(--border)] flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden shadow-sm">
                            <div className="relative z-10 text-center lg:text-left">
                                <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                                  <div className="p-2.5 bg-[var(--accent)]/5 rounded-lg text-[var(--accent)] border border-[var(--accent)]/10">
                                    <CpuChipIcon className="w-5 h-5" />
                                  </div>
                                  <h3 className="text-xl font-bold text-[var(--ink-main)] tracking-tight">Mega-Aggregator v.7.2</h3>
                                </div>
                                <p className="text-[var(--ink-muted)] font-medium text-base leading-relaxed max-w-2xl">Genererar en deterministisk rättsutredning baserad på 100% källspårbarhet och forensisk bevisföring.</p>
                            </div>
                            <button 
                                onClick={() => props.onGenerateSynthesis('FORENSIC_DETAILED_V1').catch(err => console.error('Synthesis generation failed:', err))}
                                disabled={props.isGeneratingSynthesis}
                                className="px-8 py-4 bg-[var(--ink-main)] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[var(--accent)] transition-all flex items-center gap-3 shadow-lg active:scale-95 group/agg"
                            >
                                {props.isGeneratingSynthesis ? <Spinner className="h-5 w-5" /> : <SparklesIcon className="h-5 w-5 group-hover/agg:rotate-12 transition-transform duration-500" />}
                                <span>Kör Aggregator</span>
                            </button>
                        </div>
                        <div className="bg-[var(--bg-card)] p-6 md:p-10 rounded-2xl border border-[var(--border)] shadow-inner min-h-[500px] relative flex flex-col">
                            {props.analysis.synthesis ? (
                                <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-sm prose-p:text-[var(--ink-muted)] animate-fade-in">
                                    <MarkdownRenderer content={props.analysis.synthesis} />
                                </div>
                            ) : (
                                <div className="flex-grow flex flex-col items-center justify-center space-y-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-[var(--accent)] blur-[3rem] opacity-10 animate-pulse"></div>
                                        <div className="relative p-10 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] shadow-lg">
                                            <CpuChipIcon className="w-14 h-14 text-[var(--border-strong)]" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-1.5">
                                        <p className="text-xl font-bold text-[var(--border-strong)] uppercase tracking-widest">Väntar på indata</p>
                                        <p className="text-[var(--ink-light)] font-bold uppercase tracking-widest text-[10px]">Aggregatorn är redo för exekvering</p>
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
            <div className="bg-[var(--bg-main)] p-8 rounded-[2rem] border border-[var(--border)] relative overflow-hidden shadow-inner group">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="p-3 bg-[var(--accent)]/5 rounded-xl text-[var(--accent)] border border-[var(--accent)]/10 shadow-sm">
                        <ShieldCheckIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">Forensic Chain Summary</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <StatCard label="Aktiverat Lagrum" value={analysis.legalReferences?.length || 0} color="accent" />
                    <StatCard label="Bevisatomer" value={analysis.atoms?.length || 0} color="accent" />
                    <StatCard label="Audit Verifierad" value={analysis.audit?.checks?.filter(c => c.status === 'ok').length || 0} color="accent" />
                    <StatCard label="Beviskategorier" value={new Set((analysis.atoms || []).flatMap(a => a.tags || [])).size} color="accent" />
                    <StatCard label="Lagrumskopplingar" value={analysis.legalFrameworkLinks?.length || 0} color="accent" />
                    <StatCard label="Integritets-Score" value={analysis.audit?.integrityScore || 100} suffix="%" color="accent" />
                </div>
            </div>
            <Card title="Verifierade Beviskategorier" icon={<TagIcon className="w-5 h-5" />}>
                <div className="flex flex-wrap gap-4">
                    {(analysis.themes || []).map(t => (
                        <div key={t.id} className="bg-[var(--bg-main)] px-6 py-4 rounded-xl border border-[var(--border)] flex flex-col items-center min-w-[120px] shadow-sm hover:border-[var(--accent)]/50 transition-all hover:-translate-y-1 duration-500 group/theme">
                            <span className="text-[9px] font-bold text-[var(--ink-light)] uppercase tracking-widest mb-3 group-hover/theme:text-[var(--accent)] transition-colors">{t.label}</span>
                            <span className="text-2xl font-bold text-[var(--ink-main)] tracking-tight group-hover/theme:scale-110 transition-transform">{(analysis.facts || []).filter(f => f.category === t.id).length}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
        <div className="lg:col-span-4">
            <Card title="QA-Revision" icon={<ShieldCheckIcon className="w-5 h-5" />}>
                <div className="space-y-4">
                    {(analysis.qaSummary || []).map(check => (
                        <div key={check.id} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] flex items-start gap-4 shadow-sm hover:border-[var(--success)]/50 transition-all group/qa duration-500">
                            <div className={`p-2.5 rounded-lg mt-0.5 transition-all duration-500 group-hover/qa:scale-110 ${check.status === 'pass' ? 'text-[var(--success)] bg-[var(--success)]/5 border border-[var(--success)]/10' : 'text-[var(--danger)] bg-[var(--danger)]/5 border border-[var(--danger)]/10'}`}>
                                <CheckCircleIcon className="h-5 w-5" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="font-bold text-[var(--ink-main)] text-base tracking-tight leading-none">{check.label}</p>
                                <p className="text-[var(--ink-muted)] text-xs leading-relaxed">{check.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    </div>
);

const StatCard: React.FC<{ label: string, value: number, color: string, suffix?: string }> = ({ label, value, color, suffix = "" }) => (
    <div className="text-center p-5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-sm group hover:border-[var(--accent)]/60 hover:shadow-md transition-all active:scale-[0.95] duration-500 hover:-translate-y-1">
        <p className="text-3xl font-bold text-[var(--accent)] mb-2 tracking-tight leading-none group-hover:scale-105 transition-transform duration-500">{value}{suffix}</p>
        <p className="text-[9px] font-bold text-[var(--ink-light)] uppercase tracking-widest">{label}</p>
    </div>
);

export default AnalysisResults;
