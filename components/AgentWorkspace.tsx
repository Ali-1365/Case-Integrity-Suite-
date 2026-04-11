
import React, { useState, useEffect, useMemo } from 'react';
import { legalAIAgent } from '../services/LegalAIAgent';
import { caseManagementService } from '../lib/CaseManagementService';
import { CISCase as Case } from '../lib/cis.types';
import { githubService, RepoStatus, SyncHealth } from '../services/githubService';
import { offlineService } from '../services/offlineService';
import { 
  XMarkIcon, 
  SparklesIcon, 
  MagnifyingGlassIcon, 
  Spinner, 
  PaperAirplaneIcon, 
  FileIcon,
  ChatIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BoltIcon
} from './icons';
import Card from './shared/Card';
import MarkdownRenderer from './shared/MarkdownRenderer';
import { CaseProfiler } from './CaseProfiler';
import { ModuleConnector } from './shared/ModuleConnector';

interface AgentWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (moduleId: string) => void;
}

type TabType = 'analys' | 'historik' | 'profil';

const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({ isOpen, onClose, onNavigate }) => {
  const [isReady, setIsReady] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [opinion, setOpinion] = useState<string>('');
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('analys');
  const [isOffline, setIsOffline] = useState(offlineService.getIsOffline());
  
  const [repoStatus, setRepoStatus] = useState<RepoStatus | null>(null);
  const [syncHealth, setSyncHealth] = useState<SyncHealth | null>(null);

  const activeCase = useMemo(() => cases.find(c => c.caseId === activeCaseId), [cases, activeCaseId]);

  useEffect(() => {
    const unsubscribe = offlineService.subscribe((offline) => {
        setIsOffline(offline);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isOpen) {
      const init = async () => {
        setIsReady(false);
        setOpinion('');
        setQueryResult(null);
        
        try {
          const [status, health] = await Promise.all([
              githubService.getRepoStatus(),
              githubService.getSyncHealth()
          ]);
          setRepoStatus(status);
          setSyncHealth(health);

          await legalAIAgent.initialize();
          
          const allCases = await caseManagementService.getAllCases();
          allCases.forEach(c => legalAIAgent.addCase(c));
          
          setCases(allCases);
          if (allCases.length > 0 && !activeCaseId) {
              setActiveCaseId(allCases[0].caseId);
          }
        } catch (err) {
          console.error('AgentWorkspace initialization failed:', err);
        } finally {
          setIsReady(true);
        }
      };
      init();
    }
  }, [isOpen]);

  const handleGenerateOpinion = async () => {
    if (activeCaseId) {
      setIsGenerating(true);
      setOpinion('');
      setQueryResult(null);
      setActiveTab('analys');
      try {
        const result = await legalAIAgent.generateOpinion(activeCaseId);
        setOpinion(result);
        
        // Refresh cases to get updated versions/journal
        const allCases = await caseManagementService.getAllCases();
        setCases(allCases);
      } catch (e) {
        setOpinion("### Kritiskt fel vid generering\n\nDet gick inte att generera ett yttrande för detta ärende. Kontrollera att ärendet har tillräckligt med data.");
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleQuery = () => {
    if (!query.trim() || !activeCaseId) return;
    
    setIsQuerying(true);
    setOpinion('');
    setQueryResult(null);
    setActiveTab('analys');

    const lowerQuery = query.toLowerCase();
    let result: any;
    if (lowerQuery.startsWith('fakta om')) {
        const keyword = lowerQuery.replace('fakta om', '').trim();
        result = legalAIAgent.queryFacts(activeCaseId, keyword);
    } else if (lowerQuery.includes('lagrum') || lowerQuery.includes('lagar')) {
        result = legalAIAgent.queryLaws(activeCaseId);
    } else if (lowerQuery.includes('motstridigheter') || lowerQuery.includes('konflikt')) {
        result = legalAIAgent.queryContradictions(activeCaseId);
    } else {
        result = { error: "Okänd fråga. Prova 'fakta om [nyckelord]', 'lagrum' eller 'motstridigheter'." };
    }
    
    setTimeout(() => {
        setQueryResult(result);
        setIsQuerying(false);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-main)] overflow-hidden font-sans transition-all pb-20">
      
      <header className="px-8 py-6 flex justify-between items-center border-b border-[var(--border-strong)] bg-[var(--bg-card)] sticky top-0 z-10 shadow-xl">
          <div className="flex items-center space-x-5">
            <div className="p-3 bg-[var(--accent)]/10 border border-[var(--accent)]/30 shadow-inner">
              <MagnifyingGlassIcon className="h-6 w-6 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--ink-main)] uppercase italic tracking-tighter leading-none">Interactive Analyst <span className="text-[var(--accent)] opacity-50">GOLD</span></h2>
              <div className="flex items-center space-x-3 mt-2">
                <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-[0.3em] italic opacity-70">Dynamisk Ärendeanalys | Reasoning Layer</p>
                <span className="text-slate-700 hidden sm:inline">•</span>
                <div className="hidden sm:flex items-center space-x-3">
                    <span className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest italic ${isOffline ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
                        {isOffline ? <ExclamationTriangleIcon className="w-3 h-3" /> : <ShieldCheckIcon className="w-3 h-3" />}
                        {isOffline ? 'OFFLINE_MODE' : 'INTEGRITY: OK'}
                    </span>
                    <span className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest italic ${syncHealth ? 'text-[var(--accent)]' : 'text-[var(--ink-muted)]'}`}>
                        <ArrowPathIcon className="w-3 h-3" />
                        {syncHealth ? 'SYNC: ACTIVE' : 'LOCAL_ONLY'}
                    </span>
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-[var(--ink-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-main)] border border-transparent hover:border-[var(--border-strong)] transition-all active:scale-90 italic">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </header>
        
        <main className="flex flex-col md:grid md:grid-cols-12 flex-grow overflow-hidden">
          {/* Sidebar - Control Panel */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-[var(--border-strong)] p-8 flex flex-col bg-[var(--bg-card)] overflow-y-auto shadow-inner relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)] opacity-20"></div>
              <h3 className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em] mb-6 italic opacity-60">Kontrollpanel</h3>
              {!isReady ? <div className="flex justify-center py-12"><Spinner className="h-10 w-10 text-[var(--accent)]"/></div> : (
                  <div className="space-y-8">
                    <div>
                        <label className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.3em] mb-3 block italic">Aktivt Ärende</label>
                        <select 
                            value={activeCaseId || ''}
                            onChange={(e) => setActiveCaseId(e.target.value)}
                            className="w-full bg-[var(--bg-main)] border border-[var(--border-strong)] p-4 text-xs text-[var(--ink-main)] font-black uppercase tracking-widest italic outline-none focus:border-[var(--accent)] transition-colors shadow-inner"
                            disabled={isGenerating || isQuerying}>
                            {cases.map(c => <option key={c.caseId} value={c.caseId}>{c.caseId}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col space-y-3">
                        <button 
                          onClick={() => handleGenerateOpinion().catch(err => console.error('Opinion generation failed:', err))} 
                          disabled={isGenerating || isQuerying} 
                          className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-main)] font-black py-4 px-6 uppercase tracking-[0.2em] italic flex items-center justify-center disabled:bg-[var(--bg-main)] disabled:text-[var(--ink-muted)] disabled:border-[var(--border)] border border-[var(--accent)] transition-all shadow-lg active:scale-95"
                        >
                            {isGenerating ? <Spinner className="h-4 w-4 mr-3" /> : <SparklesIcon className="h-4 w-4 mr-3" />}
                            <span className="text-[10px]">{isGenerating ? 'Genererar...' : 'Generera Yttrande'}</span>
                        </button>
                    </div>

                    <div className="pt-8 border-t border-[var(--border)]">
                        <h4 className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em] mb-6 italic opacity-60">Interaktiv Fråga</h4>
                        <div className="relative group">
                            <textarea
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleQuery())}
                                placeholder="Fråga agenten..."
                                rows={3}
                                className="w-full bg-[var(--bg-main)] border border-[var(--border-strong)] p-4 pr-12 text-xs text-[var(--ink-main)] font-black uppercase tracking-widest italic resize-none outline-none focus:border-[var(--accent)] transition-all shadow-inner placeholder:opacity-30"
                                disabled={isGenerating || isQuerying}
                            />
                            <button onClick={handleQuery} disabled={isQuerying || isGenerating || !query.trim()} className="absolute bottom-4 right-4 p-2 bg-[var(--accent)] text-[var(--bg-main)] disabled:bg-[var(--bg-main)] disabled:text-[var(--ink-muted)] transition-all active:scale-90 shadow-lg border border-[var(--accent)]"><PaperAirplaneIcon className="w-4 h-4"/></button>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-[var(--border)]">
                        <h4 className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em] mb-6 italic opacity-60">Navigering</h4>
                        <div className="grid grid-cols-3 gap-3">
                            <TabButton 
                                active={activeTab === 'analys'} 
                                onClick={() => setActiveTab('analys')} 
                                icon={<ChatIcon className="w-4 h-4" />} 
                                label="Analys" 
                            />
                            <TabButton 
                                active={activeTab === 'historik'} 
                                onClick={() => setActiveTab('historik')} 
                                icon={<ClockIcon className="w-4 h-4" />} 
                                label="Historik" 
                            />
                            <TabButton 
                                active={activeTab === 'profil'} 
                                onClick={() => setActiveTab('profil')} 
                                icon={<UserGroupIcon className="w-4 h-4" />} 
                                label="Profil" 
                            />
                        </div>
                    </div>
                  </div>
              )}
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-8 overflow-y-auto custom-scrollbar p-10 bg-[var(--bg-main)] relative">
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
              <BoltIcon className="w-64 h-64 text-[var(--accent)]" />
            </div>

            {isQuerying && <div className="flex justify-center py-12"><Spinner className="h-10 w-10 text-[var(--accent)]"/></div>}
            
            {activeTab === 'analys' && (
                <div className="space-y-10 animate-in fade-in duration-500 relative z-10">
                    {queryResult && (
                        <div className="mb-10 animate-in slide-in-from-top-4 duration-500">
                            <Card title="Svar från Agent" icon={<ChatIcon className="w-4 h-4"/>}>
                                <pre className="bg-[var(--bg-main)] p-8 border border-[var(--border-strong)] text-[11px] font-mono text-[var(--accent)] whitespace-pre-wrap shadow-inner italic font-black uppercase tracking-tight">{JSON.stringify(queryResult, null, 2)}</pre>
                            </Card>
                        </div>
                    )}

                    {isGenerating && (
                        <div className="flex flex-col items-center justify-center h-full text-center py-24 space-y-8">
                            <div className="p-8 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-full animate-pulse">
                              <Spinner className="h-16 w-16 text-[var(--accent)]" />
                            </div>
                            <div>
                              <p className="text-[var(--ink-main)] font-black text-2xl uppercase italic tracking-tighter">AI-analysmotorn exekverar...</p>
                              <p className="text-[var(--ink-muted)] text-[10px] font-black uppercase tracking-[0.3em] mt-4 italic opacity-60">Kopplar fakta till lagrum | Identifierar konflikter | Genererar slutledning</p>
                            </div>
                        </div>
                    )}
                    
                    {opinion && !isGenerating && (
                        <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Card title="Genererat Yttrande" icon={<FileIcon className="w-4 h-4"/>}>
                                <div className="bg-[var(--bg-card)] p-12 border border-[var(--border-strong)] shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
                                    <div className="prose prose-invert max-w-none prose-headings:text-[var(--ink-main)] prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter prose-p:text-[var(--ink-muted)] prose-p:font-black prose-p:uppercase prose-p:tracking-tight prose-p:opacity-80 prose-strong:text-[var(--accent)] prose-strong:font-black prose-strong:italic">
                                        <MarkdownRenderer content={opinion} />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {!opinion && !queryResult && !isGenerating && !isQuerying && (
                        <div className="flex flex-col items-center justify-center h-full text-center py-40 opacity-20 space-y-8">
                            <SparklesIcon className="w-24 h-24 text-[var(--ink-muted)]" />
                            <p className="text-[var(--ink-muted)] font-black uppercase tracking-[0.5em] italic max-w-md">Välj ett ärende och generera ett yttrande eller ställ en fråga för att börja.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'historik' && activeCase && (
                <div className="space-y-10 animate-in fade-in duration-500 relative z-10">
                    <div className="flex items-center space-x-4 mb-8">
                      <ClockIcon className="w-6 h-6 text-[var(--accent)]" />
                      <h3 className="text-xl font-black text-[var(--ink-main)] uppercase italic tracking-tighter">Händelsehistorik & Loggar</h3>
                    </div>
                    
                    <div className="space-y-6">
                        {activeCase.journal.slice().reverse().map((entry, idx) => (
                            <div key={idx} className="relative pl-10 pb-8 border-l border-[var(--border-strong)] last:pb-0 group">
                                <div className="absolute left-[-6px] top-0 w-3 h-3 bg-[var(--accent)] border-2 border-[var(--bg-main)] shadow-[0_0_8px_var(--accent)]"></div>
                                <div className="flex flex-col space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.3em] italic">{entry.event}</span>
                                        <span className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest opacity-50 italic">{new Date(entry.timestamp).toLocaleString('sv-SE')}</span>
                                    </div>
                                    <div className="bg-[var(--bg-card)] p-6 border border-[var(--border-strong)] shadow-lg group-hover:border-[var(--accent)]/30 transition-colors">
                                        <p className="text-xs text-[var(--ink-main)] font-black uppercase tracking-tight italic opacity-80 leading-relaxed">
                                            {entry.details}
                                        </p>
                                        {entry.provenanceHashes && entry.provenanceHashes.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {entry.provenanceHashes.map((p, i) => (
                                                    <span key={i} className="text-[8px] font-mono font-black text-[var(--ink-muted)] bg-[var(--bg-main)] px-2 py-1 border border-[var(--border)] uppercase tracking-tighter opacity-50">
                                                        {p.substring(0, 12)}...
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {activeCase.versions.length > 0 && (
                        <div className="mt-16 pt-16 border-t border-[var(--border-strong)]">
                            <div className="flex items-center space-x-4 mb-10">
                              <ShieldCheckIcon className="w-6 h-6 text-[var(--accent)]" />
                              <h3 className="text-xl font-black text-[var(--ink-main)] uppercase italic tracking-tighter">Versionshistorik</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {activeCase.versions.slice().reverse().map((v, idx) => (
                                    <div key={idx} className="p-6 bg-[var(--bg-card)] border border-[var(--border-strong)] hover:border-[var(--accent)]/50 transition-all cursor-pointer group shadow-xl">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)]">
                                                    <ShieldCheckIcon className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-black text-[var(--ink-main)] uppercase italic tracking-widest">v.{v.versionId}</span>
                                            </div>
                                            <span className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest opacity-50 italic">{new Date(v.timestamp).toLocaleDateString('sv-SE')}</span>
                                        </div>
                                        <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-tight italic line-clamp-2 mb-4 opacity-70">{v.changes}</p>
                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border)]">
                                            <span className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] italic opacity-50">{v.decisionSnapshot}</span>
                                            <button className="text-[9px] font-black text-[var(--accent)] uppercase tracking-[0.3em] italic group-hover:translate-x-2 transition-transform">Granska →</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'profil' && activeCase && (
                <div className="animate-in fade-in duration-500 relative z-10">
                    <CaseProfiler caseData={activeCase} />
                </div>
            )}

            <ModuleConnector activeModule="agent" onNavigate={onNavigate} />
          </div>
        </main>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <div className={`p-4 border transition-all flex flex-col items-center justify-center space-y-2 italic ${active ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)] shadow-lg' : 'bg-[var(--bg-main)] border-[var(--border-strong)] text-[var(--ink-muted)] hover:border-[var(--accent)]/30'}`} onClick={onClick}>
      <div className={`${active ? 'scale-110' : ''} transition-transform`}>{icon}</div>
      <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
  </div>
);

export default AgentWorkspace;
