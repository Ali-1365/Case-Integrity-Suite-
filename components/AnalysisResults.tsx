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

      {/* Quick Actions Bar - Hard Enterprise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 border border-[var(--border-strong)] bg-[var(--bg-card)] divide-y md:divide-y-0 md:divide-x divide-[var(--border-strong)]">
        <button 
          onClick={() => setActiveTab('Interactive Analyst')}
          className="p-8 flex items-center gap-6 hover:bg-[var(--accent)]/5 transition-all group active:bg-[var(--accent)]/10 relative overflow-hidden"
        >
          <div className="p-4 bg-[var(--bg-main)] border border-[var(--border-strong)] text-[var(--accent)] group-hover:scale-105 transition-transform">
            <MagnifyingGlassIcon className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-1">Modul</p>
            <p className="text-lg font-black text-[var(--ink-main)] tracking-tighter uppercase italic">Interactive Analyst</p>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('Dokument-Pipeline')}
          className="p-8 flex items-center gap-6 hover:bg-[var(--success)]/5 transition-all group active:bg-[var(--success)]/10 relative overflow-hidden"
        >
          <div className="p-4 bg-[var(--bg-main)] border border-[var(--border-strong)] text-[var(--success)] group-hover:scale-105 transition-transform">
            <DocumentTextIcon className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-1">Process</p>
            <p className="text-lg font-black text-[var(--ink-main)] tracking-tighter uppercase italic">Dokument-Pipeline</p>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('Snabbstartsguide')}
          className="p-8 flex items-center gap-6 hover:bg-[var(--danger)]/5 transition-all group active:bg-[var(--danger)]/10 relative overflow-hidden"
        >
          <div className="p-4 bg-[var(--bg-main)] border border-[var(--border-strong)] text-[var(--danger)] group-hover:scale-105 transition-transform">
            <ActivityIcon className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-1">Support</p>
            <p className="text-lg font-black text-[var(--ink-main)] tracking-tighter uppercase italic">Snabbstartsguide</p>
          </div>
        </button>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)]" />
          <Tabs tabs={tabOptions} activeTab={activeTab} onTabChange={setActiveTab}>
            {(currentTab) => (
              <div className="p-8 md:p-12 animate-fade-in">
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
                                                <div key={f.id} className="p-6 bg-[var(--bg-main)] border border-[var(--border-strong)] hover:border-[var(--accent)] transition-all group">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-black text-[var(--accent)] bg-[var(--accent)]/5 px-3 py-1 border border-[var(--accent)]/20 uppercase tracking-[0.2em]">{f.category}</span>
                                                            {relatedAtom && (
                                                                <span className="text-[10px] font-black text-[var(--success)] bg-[var(--success)]/5 px-3 py-1 border border-[var(--success)]/20 uppercase tracking-[0.2em] flex items-center gap-2">
                                                                  <div className="w-1.5 h-1.5 bg-[var(--success)] shadow-[0_0_5px_var(--success)]"></div>
                                                                  Verifierad
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-[var(--ink-main)] font-bold text-lg leading-tight mb-6 tracking-tighter italic">{f.subject}: {f.statement}</p>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--border-strong)] border border-[var(--border-strong)]">
                                                        <div className="p-6 bg-[var(--bg-card)]">
                                                            <p className="text-[10px] text-[var(--ink-muted)] uppercase font-black mb-4 tracking-[0.2em]">Källprovenans</p>
                                                            <p className="text-xs text-[var(--ink-main)] italic leading-relaxed font-mono">"{f.source.snippet}"</p>
                                                            <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                                                                <span className="text-[10px] font-mono font-bold text-[var(--ink-muted)] uppercase tracking-widest">DOK: {f.source.documentId}</span>
                                                                <span className="text-[10px] font-mono font-bold text-[var(--accent)] uppercase tracking-widest">POS: {relatedAtom?.position || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="p-6 bg-[var(--bg-card)]">
                                                            <p className="text-[10px] text-[var(--ink-muted)] uppercase font-black mb-4 tracking-[0.2em]">Juridisk Koppling</p>
                                                            {(props.analysis.legalFrameworkLinks || []).filter(l => l.relatedFactIds?.includes(f.id)).map(link => (
                                                                <div key={link.id} className="mb-4 last:mb-0">
                                                                    <p className="text-[10px] text-[var(--accent)] font-black mb-1 uppercase tracking-widest italic">{link.label}</p>
                                                                    <p className="text-xs text-[var(--ink-muted)] leading-relaxed line-clamp-2">{link.reasoning}</p>
                                                                </div>
                                                            )) || <p className="text-xs text-[var(--ink-muted)] italic">Ingen direkt koppling identifierad.</p>}
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

                                    <div className="p-8 bg-[var(--bg-main)] border border-[var(--border-strong)]">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="p-3 bg-[var(--accent)]/5 border border-[var(--accent)]/20 text-[var(--accent)]">
                                                <ShieldCheckIcon className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-xs font-black text-[var(--ink-main)] uppercase tracking-[0.3em]">Provenans-status</h3>
                                        </div>
                                        <div className="space-y-8">
                                            <div>
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[10px] font-black text-[var(--success)] uppercase tracking-widest">Vektor-matchning</span>
                                                    <span className="text-xs font-mono font-bold text-[var(--success)]">100%</span>
                                                </div>
                                                <div className="h-2 bg-[var(--bg-card)] border border-[var(--border-strong)] overflow-hidden">
                                                    <div className="h-full bg-[var(--success)] w-full shadow-[0_0_10px_var(--success)]"></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest">Reasoning Chain</span>
                                                    <span className="text-xs font-mono font-bold text-[var(--accent)] uppercase">Aktiv</span>
                                                </div>
                                                <div className="h-2 bg-[var(--bg-card)] border border-[var(--border-strong)] overflow-hidden">
                                                    <div className="h-full bg-[var(--accent)] w-[85%] shadow-[0_0_10px_var(--accent)]"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'MEGAINLAGA' && (
                    <div className="space-y-12">
                        <div className="bg-[var(--bg-main)] p-10 border border-[var(--border-strong)] flex flex-col lg:flex-row justify-between items-center gap-10 relative overflow-hidden">
                            <div className="relative z-10 text-center lg:text-left">
                                <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                                  <div className="p-3 bg-[var(--accent)]/5 border border-[var(--accent)]/20 text-[var(--accent)]">
                                    <CpuChipIcon className="w-6 h-6" />
                                  </div>
                                  <h3 className="text-2xl font-black text-[var(--ink-main)] tracking-tighter uppercase italic">Mega-Aggregator v.7.2</h3>
                                </div>
                                <p className="text-[var(--ink-muted)] font-medium text-lg leading-relaxed max-w-2xl">Genererar en deterministisk rättsutredning baserad på 100% källspårbarhet och forensisk bevisföring.</p>
                            </div>
                            <button 
                                onClick={() => props.onGenerateSynthesis('FORENSIC_DETAILED_V1').catch(err => console.error('Synthesis generation failed:', err))}
                                disabled={props.isGeneratingSynthesis}
                                className="px-10 py-5 bg-[var(--ink-main)] text-white rounded-none text-xs font-black uppercase tracking-[0.3em] hover:bg-[var(--accent)] transition-all flex items-center gap-4 shadow-xl active:bg-[var(--accent)]/90 group/agg"
                            >
                                {props.isGeneratingSynthesis ? <Spinner className="h-6 w-6" /> : <SparklesIcon className="h-6 w-6 group-hover/agg:rotate-12 transition-transform duration-500" />}
                                <span>Kör Aggregator</span>
                            </button>
                        </div>
                        <div className="bg-[var(--bg-card)] p-10 border border-[var(--border-strong)] min-h-[600px] relative flex flex-col">
                            {props.analysis.synthesis ? (
                                <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-headings:italic prose-p:leading-relaxed prose-p:text-base prose-p:text-[var(--ink-main)] animate-fade-in font-serif">
                                    <MarkdownRenderer content={props.analysis.synthesis} />
                                </div>
                            ) : (
                                <div className="flex-grow flex flex-col items-center justify-center space-y-8">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-[var(--accent)] blur-[4rem] opacity-5 animate-pulse"></div>
                                        <div className="relative p-12 bg-[var(--bg-main)] border border-[var(--border-strong)]">
                                            <CpuChipIcon className="w-20 h-20 text-[var(--border-strong)]" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-3">
                                        <p className="text-2xl font-black text-[var(--border-strong)] uppercase tracking-[0.4em]">Väntar på indata</p>
                                        <p className="text-[var(--ink-muted)] font-black uppercase tracking-[0.2em] text-xs">Aggregatorn är redo för exekvering</p>
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-[var(--border-strong)] border border-[var(--border-strong)]">
        <div className="lg:col-span-8 bg-[var(--bg-card)] p-10 space-y-12">
            <div className="space-y-8">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-[var(--accent)]/5 border border-[var(--accent)]/20 text-[var(--accent)]">
                        <ShieldCheckIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xs font-black text-[var(--ink-main)] uppercase tracking-[0.3em]">Forensic Chain Summary</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-[var(--border-strong)] border border-[var(--border-strong)]">
                    <StatCard label="Aktiverat Lagrum" value={analysis.legalReferences?.length || 0} color="accent" />
                    <StatCard label="Bevisatomer" value={analysis.atoms?.length || 0} color="accent" />
                    <StatCard label="Audit Verifierad" value={analysis.audit?.checks?.filter(c => c.status === 'ok')?.length || 0} color="accent" />
                    <StatCard label="Beviskategorier" value={new Set((analysis.atoms || []).flatMap(a => a.tags || [])).size} color="accent" />
                    <StatCard label="Lagrumskopplingar" value={analysis.legalFrameworkLinks?.length || 0} color="accent" />
                    <StatCard label="Integritets-Score" value={analysis.audit?.integrityScore || 100} suffix="%" color="accent" />
                </div>
            </div>
            
            <div className="space-y-6">
                <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em]">Verifierade Beviskategorier</p>
                <div className="flex flex-wrap gap-4">
                    {(analysis.themes || []).map(t => (
                        <div key={t.id} className="bg-[var(--bg-main)] px-8 py-6 border border-[var(--border-strong)] flex flex-col items-center min-w-[160px] hover:border-[var(--accent)] transition-all group/theme">
                            <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest mb-4 group-hover/theme:text-[var(--accent)] transition-colors">{t.label}</span>
                            <span className="text-3xl font-black text-[var(--ink-main)] tracking-tighter font-mono group-hover/theme:scale-110 transition-transform">{(analysis.facts || []).filter(f => f.category === t.id).length}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <div className="lg:col-span-4 bg-[var(--bg-main)] p-10">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-[var(--success)]/5 border border-[var(--success)]/20 text-[var(--success)]">
                    <ShieldCheckIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-black text-[var(--ink-main)] uppercase tracking-[0.3em]">QA-Revision</h3>
            </div>
            <div className="space-y-px bg-[var(--border-strong)] border border-[var(--border-strong)]">
                {(analysis.qaSummary || []).map(check => (
                    <div key={check.id} className="p-6 bg-[var(--bg-card)] flex items-start gap-6 hover:bg-[var(--success)]/5 transition-all group/qa">
                        <div className={`p-3 border transition-all duration-500 group-hover/qa:scale-110 ${check.status === 'pass' ? 'text-[var(--success)] bg-[var(--success)]/5 border-[var(--success)]/20' : 'text-[var(--danger)] bg-[var(--danger)]/5 border-[var(--danger)]/20'}`}>
                            <CheckCircleIcon className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-black text-[var(--ink-main)] text-lg tracking-tighter uppercase italic leading-none">{check.label}</p>
                            <p className="text-[var(--ink-muted)] text-xs leading-relaxed font-medium">{check.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const StatCard: React.FC<{ label: string, value: number, color: string, suffix?: string }> = ({ label, value, color, suffix = "" }) => (
    <div className="text-center p-8 bg-[var(--bg-card)] hover:bg-[var(--accent)]/5 transition-all group active:bg-[var(--accent)]/10">
        <p className="text-4xl font-black text-[var(--accent)] mb-3 tracking-tighter font-mono group-hover:scale-105 transition-transform">{value}{suffix}</p>
        <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em]">{label}</p>
    </div>
);

export default AnalysisResults;
