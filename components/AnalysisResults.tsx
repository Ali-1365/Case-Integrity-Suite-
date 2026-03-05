import React, { useState } from 'react';
import { AnalysisResult } from '../lib/cis.types';
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
    ActivityIcon
} from './icons';
import AiReportTab from './ReportViewer';
import MasterDashboard from './MasterDashboard';
import LegalReferenceDetail from './LegalReferenceDetail';
import ForensicAuditView from './ForensicAuditView';
import TimelineView from './TimelineView';
import AnalysisDashboard from './AnalysisDashboard';
import { OpinionConfig, OpinionResult } from '../types';

import { AutoNotaryView } from './AutoNotaryView';
import { AgentView } from './AgentView';
import { AdversarialDuelView } from './AdversarialDuelView';
import { SystemArchitectureView } from './SystemArchitectureView';
import { FmjamController } from './FmjamController';

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
  const tabOptions = ['Översikt', 'FMJAM Controller', 'Systemarkitektur', 'Tidslinje', 'Beviskedja', 'MEGAINLAGA', 'Audit Log', 'Processnotarie', 'Advokatbyrå', 'Rättegångssimulator', 'Analytics', 'Oracle Command'];
  const [selectedLegalRefId, setSelectedLegalRefId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(tabOptions[0]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AnalysisDashboard analysis={props.analysis} />

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => setActiveTab('Beviskedja')}
          className="bg-[#161616] border border-indigo-500/30 p-4 rounded-xl flex items-center gap-4 hover:bg-indigo-500/10 transition-all group"
        >
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 group-hover:scale-110 transition-transform">
            <MagnifyingGlassIcon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Analysera Ärendearkiv</p>
            <p className="text-[10px] text-gray-500">Fråga mot {props.analysis.caseId}</p>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('Audit Log')}
          className="bg-[#161616] border border-emerald-500/30 p-4 rounded-xl flex items-center gap-4 hover:bg-emerald-500/10 transition-all group"
        >
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:scale-110 transition-transform">
            <ShieldCheckIcon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Integritetskontroll</p>
            <p className="text-[10px] text-gray-500">Verifiera SFS 2025:400</p>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('Analytics')}
          className="bg-[#161616] border border-purple-500/30 p-4 rounded-xl flex items-center gap-4 hover:bg-purple-500/10 transition-all group"
        >
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 group-hover:scale-110 transition-transform">
            <ActivityIcon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-white uppercase tracking-wider">System-telemetri</p>
            <p className="text-[10px] text-gray-500">Monitorera AI-pipeline</p>
          </div>
        </button>
      </div>

      <div className="bg-[#111111] rounded-2xl border border-gray-800 p-2 shadow-sm">
          <Tabs tabs={tabOptions} activeTab={activeTab} onTabChange={setActiveTab}>
            {(currentTab) => (
              <div className="p-6 md:p-8">
                {currentTab === 'Översikt' && <OverviewContent analysis={props.analysis} />}
                {currentTab === 'FMJAM Controller' && <FmjamController analysis={props.analysis} />}
                {currentTab === 'Systemarkitektur' && <SystemArchitectureView analysisId={props.analysis.caseId} onNavigate={setActiveTab} />}
                {currentTab === 'Tidslinje' && <TimelineView analysis={props.analysis} />}
                {currentTab === 'Processnotarie' && (
                    <div className="h-[600px] bg-[#0a0a0a] rounded-xl border border-gray-800 overflow-hidden">
                        <AutoNotaryView />
                    </div>
                )}
                {currentTab === 'Advokatbyrå' && (
                    <AgentView caseData={JSON.stringify(props.analysis)} />
                )}
                {currentTab === 'Rättegångssimulator' && (
                    <AdversarialDuelView caseData={JSON.stringify(props.analysis)} />
                )}
                {currentTab === 'Beviskedja' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <Card title={`Faktaatomer (Låsta: ${props.analysis.atoms.length})`} icon={<LightbulbIcon className="w-5 h-5" />}>
                                    <div className="space-y-4">
                                        {props.analysis.facts.map(f => {
                                            const relatedAtom = props.analysis.atoms.find(a => a.id === f.id.replace('FACT', 'ATOM'));
                                            return (
                                                <div key={f.id} className="p-5 bg-[#161616] rounded-xl border border-gray-800 hover:border-cyan-500/40 transition-colors group">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-medium text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">{f.category}</span>
                                                            {relatedAtom && (
                                                                <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">VERIFIERAD_ATOM</span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-mono text-gray-500">#{f.id}</span>
                                                    </div>
                                                    <p className="text-gray-200 font-medium text-sm leading-relaxed">{f.subject}: {f.statement}</p>
                                                    
                                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="p-3 bg-[#0a0a0a] rounded-lg border border-gray-800">
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Källprovenans</p>
                                                            <p className="text-xs text-gray-400 italic">"{f.source.snippet}"</p>
                                                            <p className="text-[9px] text-gray-600 mt-2 font-mono">DOK: {f.source.documentId} | POS: {relatedAtom?.position || 'N/A'}</p>
                                                        </div>
                                                        <div className="p-3 bg-[#0a0a0a] rounded-lg border border-gray-800">
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Juridisk Koppling</p>
                                                            {props.analysis.legalFrameworkLinks.filter(l => l.relatedFactIds.includes(f.id)).map(link => (
                                                                <div key={link.id} className="mb-2 last:mb-0">
                                                                    <p className="text-xs text-cyan-400 font-bold">{link.label}</p>
                                                                    <p className="text-[10px] text-gray-500 line-clamp-2">{link.reasoning}</p>
                                                                </div>
                                                            )) || <p className="text-xs text-gray-600 italic">Ingen direkt koppling identifierad.</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {props.analysis.facts.length === 0 && (
                                            <div className="py-12 text-center opacity-30">
                                                <CpuChipIcon className="w-12 h-12 mx-auto mb-4" />
                                                <p>Inga faktaatomer extraherade än.</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                            
                            <div className="space-y-8">
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
                                        {props.analysis.legalReferences.length === 0 && (
                                            <p className="text-center py-8 text-gray-600 text-sm italic">Inga lagrum identifierade.</p>
                                        )}
                                    </div>
                                </Card>

                                <Card title="Provenans-status" icon={<ShieldCheckIcon className="w-5 h-5" />}>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-emerald-400 uppercase">Vektor-matchning</span>
                                                <span className="text-xs font-mono text-emerald-500">100%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 w-full"></div>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-cyan-400 uppercase">Reasoning Chain</span>
                                                <span className="text-xs font-mono text-cyan-500">AKTIV</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-cyan-500 w-[85%]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
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

            <div className="bg-[#161616] p-8 rounded-xl border border-gray-800">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <LawIcon className="w-4 h-4 text-cyan-500" />
                    Juridiska Korpusar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <CorpusItem title="Socialtjänstlag" sfs="2025:400" source="SoL" />
                    <CorpusItem title="Förvaltningslag" sfs="2017:900" source="FL" />
                    <CorpusItem title="Barnkonventionen" sfs="2018:1197" source="BK" />
                </div>
            </div>
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

const CorpusItem: React.FC<{ title: string, sfs: string, source: string }> = ({ title, sfs, source }) => (
    <div className="flex flex-col p-4 bg-[#111111] rounded-xl border border-gray-800 hover:border-cyan-500/30 transition-all group">
        <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{title}</span>
            <LinkIcon className="w-3 h-3 text-gray-600 group-hover:text-cyan-500" />
        </div>
        <div className="flex gap-4">
            <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold">SFS</span>
                <span className="text-xs font-mono text-cyan-500/80">{sfs}</span>
            </div>
            <div className="flex flex-col border-l border-gray-800 pl-4">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Källa</span>
                <span className="text-xs font-mono text-white/70">{source}</span>
            </div>
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
