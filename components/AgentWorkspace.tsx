
import React, { useState, useEffect, useMemo } from 'react';
import { legalAIAgent } from '../services/LegalAIAgent';
import { caseManagementService } from '../lib/CaseManagementService';
import { CISCase as Case } from '../lib/cis.types';
import { FactV2 as Fact, ContradictionV2 } from '../types';
import { EnrichedLegalParagraph } from '../services/LegalAIAgent';
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

interface AgentWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'analys' | 'historik' | 'profil';

const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({ isOpen, onClose }) => {
  const [isReady, setIsReady] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [opinion, setOpinion] = useState<string>('');
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<Fact[] | ContradictionV2[] | EnrichedLegalParagraph[] | { error: string } | null>(null);
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
        } catch (err: unknown) {
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
      } catch (err: unknown) {
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
    let result: Fact[] | ContradictionV2[] | EnrichedLegalParagraph[] | { error: string } | null;
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
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 overflow-hidden font-sans transition-all">
      
      <header className="px-4 md:px-8 py-4 md:py-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="p-2 md:p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <MagnifyingGlassIcon className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white leading-tight">Interactive Analyst</h2>
              <div className="flex items-center space-x-2 mt-0.5 md:mt-1">
                <p className="text-[8px] md:text-[10px] text-slate-500 font-medium uppercase tracking-wider">Dynamisk Ärendeanalys</p>
                <span className="text-[8px] text-slate-300 hidden sm:inline">•</span>
                <div className="hidden sm:flex items-center space-x-2">
                    <span className={`flex items-center gap-1 text-[8px] font-bold uppercase ${isOffline ? 'text-orange-500' : 'text-emerald-500'}`}>
                        {isOffline ? <ExclamationTriangleIcon className="w-2.5 h-2.5" /> : <ShieldCheckIcon className="w-2.5 h-2.5" />}
                        {isOffline ? 'OFFLINE_MODE' : 'INTEGRITY: OK'}
                    </span>
                    <span className={`flex items-center gap-1 text-[8px] font-bold uppercase ${syncHealth ? 'text-blue-500' : 'text-slate-400'}`}>
                        <ArrowPathIcon className="w-2.5 h-2.5" />
                        {syncHealth ? 'SYNC: ACTIVE' : 'LOCAL_ONLY'}
                    </span>
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
            <XMarkIcon className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </header>
        
        <main className="flex flex-col md:grid md:grid-cols-12 flex-grow overflow-hidden">
          {/* Sidebar - Control Panel */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 p-4 md:p-6 flex flex-col bg-slate-50 dark:bg-slate-950/20 overflow-y-auto">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Kontrollpanel</h3>
              {!isReady ? <div className="flex justify-center py-8"><Spinner className="h-8 w-8 text-blue-600"/></div> : (
                  <div className="space-y-4 md:space-y-6">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Aktivt Ärende</label>
                        <select 
                            value={activeCaseId || ''}
                            onChange={(e) => setActiveCaseId(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                            disabled={isGenerating || isQuerying}>
                            {cases.map(c => <option key={c.caseId} value={c.caseId}>{c.caseId}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <button onClick={() => handleGenerateOpinion().catch(err => console.error('Opinion generation failed:', err))} disabled={isGenerating || isQuerying} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center disabled:bg-slate-200 dark:disabled:bg-slate-800 transition-colors">
                            {isGenerating ? <Spinner className="h-4 w-4 mr-2" /> : <SparklesIcon className="h-4 w-4 mr-2" />}
                            <span className="text-sm">{isGenerating ? 'Genererar...' : 'Generera Yttrande'}</span>
                        </button>
                    </div>

                    <div className="pt-4 md:pt-6 border-t border-slate-200 dark:border-slate-800">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Interaktiv Fråga</h4>
                        <div className="relative">
                            <textarea
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleQuery())}
                                placeholder="Fråga agenten..."
                                rows={2}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 pr-10 text-sm text-slate-900 dark:text-white resize-none outline-none focus:ring-2 focus:ring-blue-500/20"
                                disabled={isGenerating || isQuerying}
                            />
                            <button onClick={handleQuery} disabled={isQuerying || isGenerating || !query.trim()} className="absolute bottom-3 right-3 p-1.5 bg-blue-600 rounded-md text-white disabled:bg-slate-200 dark:disabled:bg-slate-800 transition-colors"><PaperAirplaneIcon className="w-3.5 h-3.5"/></button>
                        </div>
                    </div>

                    <div className="pt-4 md:pt-6 border-t border-slate-200 dark:border-slate-800">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Navigering</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <button 
                                onClick={() => setActiveTab('analys')}
                                className={`p-2 rounded-lg flex flex-col items-center justify-center border transition-all ${activeTab === 'analys' ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' : 'bg-white border-slate-100 text-slate-400 dark:bg-slate-900 dark:border-slate-800'}`}
                            >
                                <ChatIcon className="w-4 h-4 mb-1" />
                                <span className="text-[8px] font-bold uppercase">Analys</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('historik')}
                                className={`p-2 rounded-lg flex flex-col items-center justify-center border transition-all ${activeTab === 'historik' ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' : 'bg-white border-slate-100 text-slate-400 dark:bg-slate-900 dark:border-slate-800'}`}
                            >
                                <ClockIcon className="w-4 h-4 mb-1" />
                                <span className="text-[8px] font-bold uppercase">Historik</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('profil')}
                                className={`p-2 rounded-lg flex flex-col items-center justify-center border transition-all ${activeTab === 'profil' ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' : 'bg-white border-slate-100 text-slate-400 dark:bg-slate-900 dark:border-slate-800'}`}
                            >
                                <UserGroupIcon className="w-4 h-4 mb-1" />
                                <span className="text-[8px] font-bold uppercase">Profil</span>
                            </button>
                        </div>
                    </div>
                  </div>
              )}
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-8 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-white dark:bg-slate-900">
            {isQuerying && <div className="flex justify-center py-8"><Spinner className="h-8 w-8 text-blue-600"/></div>}
            
            {activeTab === 'analys' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {queryResult && (
                        <div className="mb-6">
                            <Card title="Svar från Agent" icon={<ChatIcon className="w-4 h-4"/>}>
                                <pre className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg text-[10px] font-mono text-blue-800 dark:text-blue-400 whitespace-pre-wrap border border-slate-100 dark:border-slate-800">{JSON.stringify(queryResult, null, 2)}</pre>
                            </Card>
                        </div>
                    )}

                    {isGenerating && (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <Spinner className="h-10 w-10 text-blue-600 mb-4" />
                            <p className="text-slate-900 dark:text-white font-bold">AI-analysmotorn arbetar...</p>
                            <p className="text-slate-500 text-xs mt-2">Kopplar fakta till lagrum och identifierar konflikter.</p>
                        </div>
                    )}
                    
                    {opinion && !isGenerating && (
                        <div className="mt-6">
                            <Card title="Genererat Yttrande" icon={<FileIcon className="w-4 h-4"/>}>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <MarkdownRenderer content={opinion} />
                                </div>
                            </Card>
                        </div>
                    )}

                    {!opinion && !queryResult && !isGenerating && !isQuerying && (
                        <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-50">
                            <SparklesIcon className="w-16 h-16 text-slate-200 mb-4" />
                            <p className="text-slate-400 font-medium">Välj ett ärende och generera ett yttrande eller ställ en fråga för att börja.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'historik' && activeCase && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">Händelsehistorik & Loggar</h3>
                    <div className="space-y-4">
                        {activeCase.journal.slice().reverse().map((entry, idx) => (
                            <div key={idx} className="relative pl-8 pb-6 border-l border-slate-100 dark:border-slate-800 last:pb-0">
                                <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900"></div>
                                <div className="flex flex-col">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{entry.event}</span>
                                        <span className="text-[10px] text-slate-400">{new Date(entry.timestamp).toLocaleString('sv-SE')}</span>
                                    </div>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                        {entry.details}
                                    </p>
                                    {entry.provenanceHashes && entry.provenanceHashes.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {entry.provenanceHashes.map((p, i) => (
                                                <span key={i} className="text-[8px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                    {p.substring(0, 8)}...
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {activeCase.versions.length > 0 && (
                        <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">Versionshistorik</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {activeCase.versions.slice().reverse().map((v, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs font-black text-slate-900 dark:text-white">v.{v.versionId}</span>
                                            </div>
                                            <span className="text-[9px] text-slate-400 font-medium">{new Date(v.timestamp).toLocaleDateString('sv-SE')}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">{v.changes}</p>
                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{v.decisionSnapshot}</span>
                                            <button className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">Granska →</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'profil' && activeCase && (
                <div className="animate-in fade-in duration-300">
                    <CaseProfiler caseData={activeCase} />
                </div>
            )}
          </div>
        </main>
    </div>
  );
};

export default AgentWorkspace;
