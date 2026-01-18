
import React, { useState, useEffect } from 'react';
import { legalAIAgent } from '../services/LegalAIAgent';
import { Fact, Case } from '../lib/LegalAgentTypes';
import { 
  XMarkIcon, 
  SparklesIcon, 
  MagnifyingGlassIcon, 
  Spinner, 
  PaperAirplaneIcon, 
  FileIcon,
  ChatIcon
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

  useEffect(() => {
    if (isOpen) {
      const init = async () => {
        setIsReady(false);
        setOpinion('');
        setQueryResult(null);
        await legalAIAgent.initialize();
        
        const factsResponse = await fetch('/data/SampleFacts_FS_2026-01-08.json');
        const facts: Fact[] = await factsResponse.json();
        
        const sampleCase: Case = {
          id: 'Försörjningsstöd_2026-01-08',
          facts: facts,
          contradictions: [{ description: "Sökande uppger akut nöd, men nekades muntligt.", factIds: ["FACT_001", "FACT_004"] }]
        };
        
        legalAIAgent.addCase(sampleCase);
        const allCases = legalAIAgent.getAllCases();
        setCases(allCases);
        if (allCases.length > 0) {
            setActiveCaseId(allCases[0].id);
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
    <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border border-gray-800 overflow-hidden">
        
        <header className="px-8 py-6 flex justify-between items-center border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-cyan-500/10 rounded-2xl"><MagnifyingGlassIcon className="h-7 w-7 text-cyan-400" /></div>
            <div>
              <h2 className="text-2xl font-bold text-white leading-none">Interactive Analyst</h2>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-[0.2em] font-black">Dynamisk Ärendeanalys</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white rounded-xl transition-all"><XMarkIcon className="h-7 w-7" /></button>
        </header>
        
        <main className="grid grid-cols-12 flex-grow overflow-hidden">
          <div className="col-span-4 border-r border-gray-800 p-6 flex flex-col">
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Kontrollpanel</h3>
              {!isReady ? <Spinner className="h-8 w-8 text-cyan-400"/> : (
                  <>
                    <div className="mb-6">
                        <label className="text-xs text-gray-400 mb-2 block">Aktivt Ärende</label>
                        <select 
                            value={activeCaseId || ''}
                            onChange={(e) => setActiveCaseId(e.target.value)}
                            className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white"
                            disabled={isGenerating || isQuerying}>
                            {cases.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                        </select>
                    </div>
                    <button onClick={handleGenerateOpinion} disabled={isGenerating || isQuerying} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center disabled:bg-gray-700">
                        {isGenerating ? <Spinner className="h-5 w-5 mr-2" /> : <SparklesIcon className="h-5 w-5 mr-2" />}
                        {isGenerating ? 'Genererar med AI...' : 'Generera Yttrande'}
                    </button>
                    <div className="mt-8 pt-8 border-t border-gray-800">
                        <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Interaktiv Fråga</h4>
                        <div className="relative">
                            <textarea
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleQuery())}
                                placeholder="Fråga agenten, t.ex. 'fakta om barn'..."
                                rows={3}
                                className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 pr-12 text-white text-sm resize-none"
                                disabled={isGenerating || isQuerying}
                            />
                            <button onClick={handleQuery} disabled={isQuerying || isGenerating || !query.trim()} className="absolute bottom-3 right-3 p-2 bg-cyan-600 rounded-md text-white disabled:bg-gray-600"><PaperAirplaneIcon className="w-4 h-4"/></button>
                        </div>
                    </div>
                  </>
              )}
          </div>

          <div className="col-span-8 overflow-y-auto custom-scrollbar p-8">
            {isQuerying && <Spinner/>}
            {queryResult && (
                <Card title="Svar från Agent" icon={<ChatIcon/>}>
                    <pre className="bg-gray-950 p-4 rounded-lg text-xs text-cyan-300 whitespace-pre-wrap">{JSON.stringify(queryResult, null, 2)}</pre>
                </Card>
            )}

            {isGenerating && (
                 <div className="flex flex-col items-center justify-center h-full text-center">
                    <Spinner className="h-12 w-12 text-cyan-400 mb-4" />
                    <p className="text-cyan-400 font-bold">AI-analysmotorn arbetar...</p>
                    <p className="text-gray-500 text-sm mt-2">Kopplar fakta till lagrum och identifierar konflikter. Detta kan ta en stund.</p>
                </div>
            )}
            {opinion && !isGenerating && (
                <div className="mt-6">
                    <Card title="Genererat Yttrande" icon={<FileIcon/>}>
                        <div className="bg-gray-950 p-6 rounded-lg">
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
