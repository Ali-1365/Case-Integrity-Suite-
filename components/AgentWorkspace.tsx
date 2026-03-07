
import React, { useState, useEffect } from 'react';
import { legalAIAgent } from '../services/LegalAIAgent';
import { caseManagementService } from '../lib/CaseManagementService';
import { CISCase as Case } from '../lib/cis.types';
import { githubService, RepoStatus, SyncHealth } from '../services/githubService';
import { 
  XMarkIcon, 
  SparklesIcon, 
  MagnifyingGlassIcon, 
  Spinner, 
  PaperAirplaneIcon, 
  FileIcon,
  ChatIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from './icons';
import Card from './shared/Card';
import MarkdownRenderer from './shared/MarkdownRenderer';

interface AgentWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({ isOpen, onClose }) => {
  const [isReady, setIsReady] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [opinion, setOpinion] = useState<string>('');
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [repoStatus, setRepoStatus] = useState<RepoStatus | null>(null);
  const [syncHealth, setSyncHealth] = useState<SyncHealth | null>(null);

  useEffect(() => {
    if (isOpen) {
      const init = async () => {
        setIsReady(false);
        setOpinion('');
        setQueryResult(null);
        
        // Load system status
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
        if (allCases.length > 0) {
            setActiveCaseId(allCases[0].caseId);
        }
        setIsReady(true);
      };
      init();
    }
  }, [isOpen]);

  const handleGenerateOpinion = async () => {
    if (activeCaseId) {
      setIsGenerating(true);
      setOpinion('');
      setQueryResult(null);
      try {
        const result = await legalAIAgent.generateOpinion(activeCaseId);
        setOpinion(result);
      } catch (e) {
        setOpinion("Ett fel uppstod vid generering av yttrande.");
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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[250] flex items-center justify-center p-4 md:p-8 outline-none animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-7xl h-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden font-sans transition-all">
        
        <header className="px-8 py-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <MagnifyingGlassIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">Interactive Analyst</h2>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Dynamisk Ärendeanalys</p>
                <span className="text-[8px] text-slate-300">•</span>
                <div className="flex items-center space-x-2">
                    <span className={`flex items-center gap-1 text-[8px] font-bold uppercase ${repoStatus?.isBypassed ? 'text-red-500' : 'text-emerald-500'}`}>
                        <ShieldCheckIcon className="w-2.5 h-2.5" />
                        {repoStatus?.isBypassed ? 'BYPASSED' : 'INTEGRITY: OK'}
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
            <XMarkIcon className="h-6 w-6" />
          </button>
        </header>
        
        <main className="grid grid-cols-12 flex-grow overflow-hidden">
          <div className="col-span-12 md:col-span-4 border-r border-slate-100 dark:border-slate-800 p-6 flex flex-col bg-slate-50 dark:bg-slate-950/20">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Kontrollpanel</h3>
              {!isReady ? <div className="flex justify-center py-8"><Spinner className="h-8 w-8 text-blue-600"/></div> : (
                  <div className="space-y-6">
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
                    <button onClick={handleGenerateOpinion} disabled={isGenerating || isQuerying} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center disabled:bg-slate-200 dark:disabled:bg-slate-800 transition-colors">
                        {isGenerating ? <Spinner className="h-4 w-4 mr-2" /> : <SparklesIcon className="h-4 w-4 mr-2" />}
                        <span className="text-sm">{isGenerating ? 'Genererar...' : 'Generera Yttrande'}</span>
                    </button>
                    <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Interaktiv Fråga</h4>
                        <div className="relative">
                            <textarea
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleQuery())}
                                placeholder="Fråga agenten..."
                                rows={3}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 pr-10 text-sm text-slate-900 dark:text-white resize-none outline-none focus:ring-2 focus:ring-blue-500/20"
                                disabled={isGenerating || isQuerying}
                            />
                            <button onClick={handleQuery} disabled={isQuerying || isGenerating || !query.trim()} className="absolute bottom-3 right-3 p-1.5 bg-blue-600 rounded-md text-white disabled:bg-slate-200 dark:disabled:bg-slate-800 transition-colors"><PaperAirplaneIcon className="w-3.5 h-3.5"/></button>
                        </div>
                    </div>
                  </div>
              )}
          </div>

          <div className="col-span-12 md:col-span-8 overflow-y-auto custom-scrollbar p-8 bg-white dark:bg-slate-900">
            {isQuerying && <div className="flex justify-center py-8"><Spinner className="h-8 w-8 text-blue-600"/></div>}
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default AgentWorkspace;
