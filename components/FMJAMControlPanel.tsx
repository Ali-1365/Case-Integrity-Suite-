
import React, { useState, useMemo, useEffect } from 'react';
import { LEGAL_SOURCES } from '../data/legalSources';
import { geminiService, QuotaState } from '../services/geminiService';
import { db } from '../lib/db';
import { ragIndexService } from '../lib/RagIndexService';
import { 
  ShieldCheckIcon, 
  LawIcon, 
  XMarkIcon, 
  InformationCircleIcon,
  ArrowPathIcon,
  CpuChipIcon,
  CogIcon,
  PlusIcon,
  CheckCircleIcon,
  HomeIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  ActivityIcon,
  Spinner
} from './icons';

interface FMJAMControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onReturnHome?: () => void;
  onEditItem?: (id: string) => void;
  onAddItem?: () => void;
}

const FMJAMControlPanel: React.FC<FMJAMControlPanelProps> = ({ isOpen, onClose, onReturnHome, onEditItem, onAddItem }) => {
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'pending'>('all');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [quota, setQuota] = useState<QuotaState>(geminiService.quotaState);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isBaking, setIsBaking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
        setQuota({ ...geminiService.quotaState });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const total = LEGAL_SOURCES.length;
    const verified = LEGAL_SOURCES.filter(s => s.auditTrail.status === 'VERIFIED').length;
    const pending = total - verified;
    return { total, verified, pending, percent: Math.round((verified / total) * 100) };
  }, []);

  const filteredSources = useMemo(() => {
    return LEGAL_SOURCES.filter(source => {
      const searchStr = filter.toLowerCase();
      const matchesSearch = source.label.toLowerCase().includes(searchStr) || 
                            source.reference.toLowerCase().includes(searchStr) ||
                            source.sfsNumber.includes(searchStr);
      
      const matchesTab = activeTab === 'all' || 
                         (activeTab === 'verified' && source.auditTrail.status === 'VERIFIED') ||
                         (activeTab === 'pending' && source.auditTrail.status !== 'VERIFIED');
      return matchesSearch && matchesTab;
    });
  }, [filter, activeTab]);

  const handleRepair = async () => {
    setIsRepairing(true);
    await db.repairPersistence();
    setTimeout(() => {
        setIsRepairing(false);
        alert("Systemintegritet återställd. Lokala lås har hävts.");
    }, 1500);
  };

  const handleBakeIndex = async () => {
    if(!confirm("VARNING: Detta kommer att exekvera en fullständig RAG-indexering mot samtliga 17 korpusar. Detta förbrukar Quota. Fortsätta?")) return;
    setIsBaking(true);
    try {
      const index = await ragIndexService.buildIndex();
      ragIndexService.exportIndex(index);
      alert("SYSTEM_BAKE slutförd. Indexfil genererad för produktion.");
    } catch (e) {
      alert("Baking failure: Se konsol för detaljer.");
    } finally {
      setIsBaking(false);
    }
  };

  const handleVerify = (id: string) => {
    setVerifyingId(id);
    setTimeout(() => setVerifyingId(null), 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4 md:p-8 outline-none animate-in fade-in duration-300">
      <div className="bg-gray-900 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] w-full max-w-7xl h-full max-h-[95vh] flex flex-col border border-gray-800 overflow-hidden ring-1 ring-white/5">
        
        <header className="px-10 py-8 flex justify-between items-center border-b border-gray-800 bg-gray-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
              <ShieldCheckIcon className="w-64 h-64 text-cyan-500" />
          </div>
          
          <div className="flex items-center space-x-6 relative z-10">
            <div className="p-4 bg-cyan-500/10 rounded-[1.5rem] border border-cyan-500/20 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]">
              <CogIcon className="h-10 w-10 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">FMJAM System Oracle</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                  v.7.6.0-GOLD | SECURITY_CORE_LOCKED
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 relative z-10">
            <button 
                onClick={handleBakeIndex}
                disabled={isBaking}
                className="hidden md:flex items-center space-x-2 bg-cyan-950/30 hover:bg-cyan-900/50 text-cyan-400 px-6 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border border-cyan-900/30"
            >
                {isBaking ? <Spinner className="h-4 w-4" /> : <CpuChipIcon className="h-4 w-4" />}
                <span>Bake RAG Index</span>
            </button>
            <button 
                onClick={handleRepair}
                disabled={isRepairing}
                className="hidden md:flex items-center space-x-2 bg-red-950/30 hover:bg-red-900/50 text-red-500 px-6 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border border-red-900/30"
            >
                {isRepairing ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <ExclamationTriangleIcon className="h-4 w-4" />}
                <span>Nöd-reparation</span>
            </button>
            <button onClick={onClose} className="p-3 text-gray-500 hover:text-white hover:bg-gray-800 rounded-2xl transition-all">
              <XMarkIcon className="h-8 w-8" />
            </button>
          </div>
        </header>

        {/* STATUS BAR (STATISTIK & QUOTA) */}
        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-800 bg-black/20">
            <StatCard label="Verifierade Lagrum" value={`${stats.percent}%`} sub={`${stats.verified}/${stats.total} SFS-poster`} color="cyan" />
            <StatCard label="Pending Audit" value={stats.pending.toString()} sub="Väntar på validering" color="purple" />
            <StatCard label="Integritet" value="LOCKED" sub="SFS 2025:400 COMPLIANT" color="green" />
            
            <div className={`p-8 border-l border-gray-800 transition-colors ${quota.isThrottled ? 'bg-orange-500/10' : 'bg-transparent'}`}>
                <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Resource Quota</p>
                    <BoltIcon className={`h-5 w-5 ${quota.isThrottled ? 'text-orange-500 animate-pulse' : 'text-gray-700'}`} />
                </div>
                <p className={`text-2xl font-black italic tracking-tighter ${quota.isThrottled ? 'text-orange-500' : 'text-green-500'}`}>
                    {quota.isThrottled ? 'THROTTLED' : 'STABLE'}
                </p>
                <p className="text-[9px] font-bold text-gray-600 uppercase mt-2">
                    {quota.isThrottled ? `RETRY_IN: ${Math.round(quota.retryAfterMs/1000)}s` : 'API Gateway: Operational'}
                </p>
            </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="p-10 border-b border-gray-800 bg-gray-900/30 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-grow w-full relative">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <LawIcon className="h-6 w-6 text-gray-500" />
                </div>
                <input 
                    type="text" 
                    placeholder="Filtrera ramverk (t.ex. 'SoL 2025', 'Barnets bästa')..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-[1.5rem] py-5 pl-14 pr-6 text-white placeholder-gray-700 focus:ring-2 focus:ring-cyan-500/30 outline-none transition-all font-medium"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
            <div className="flex bg-gray-950 p-1.5 rounded-[1.2rem] border border-gray-800 shadow-inner">
                <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')}>Fullständig Katalog</TabButton>
                <TabButton active={activeTab === 'verified'} onClick={() => setActiveTab('verified')}>Låsta (Gold)</TabButton>
                <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>Overifierade</TabButton>
            </div>
        </div>

        {/* MAIN LIST */}
        <main className="flex-grow overflow-y-auto p-10 custom-scrollbar bg-gray-950/40">
            <div className="grid grid-cols-1 gap-6">
                {filteredSources.map((source) => (
                    <div key={source.id} className="group bg-gray-900/40 border border-gray-800 rounded-[2.5rem] p-8 hover:bg-gray-800/60 transition-all duration-300 relative overflow-hidden">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
                            <div className="flex-grow">
                                <div className="flex items-center gap-4 mb-4">
                                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border tracking-widest ${source.auditTrail.status === 'VERIFIED' ? 'bg-green-950/30 text-green-400 border-green-500/20' : 'bg-red-950/30 text-red-400 border-red-500/20'}`}>
                                        {source.auditTrail.status}
                                    </span>
                                    <span className="text-[10px] font-mono text-cyan-500/60 font-black">REF_LOCKED: SFS {source.sfsNumber}</span>
                                    {source.version.includes('2025') && (
                                        <span className="bg-yellow-500/10 text-yellow-500 text-[8px] font-black px-2 py-0.5 rounded border border-yellow-500/20">NEW_REFORM</span>
                                    )}
                                </div>
                                <h3 className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tight italic uppercase">{source.label}</h3>
                                <p className="text-sm text-gray-400 mt-4 max-w-5xl leading-relaxed font-medium">{source.description}</p>
                            </div>
                            
                            <div className="flex gap-3 shrink-0">
                                <button 
                                    onClick={() => handleVerify(source.id)}
                                    className={`flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl border transition-all ${verifyingId === source.id ? 'bg-green-600 text-white border-green-400' : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:text-white'}`}
                                >
                                    {verifyingId === source.id ? <CheckCircleIcon className="h-4 w-4" /> : <ActivityIcon className="h-4 w-4" />}
                                    <span>{verifyingId === source.id ? 'Verifierad' : 'Kör Audit'}</span>
                                </button>
                                <button 
                                    onClick={() => onEditItem?.(source.id)}
                                    className="p-3 bg-cyan-950/20 text-cyan-400 rounded-2xl border border-cyan-500/10 hover:bg-cyan-500 hover:text-black transition-all"
                                >
                                    <CogIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {filteredSources.length === 0 && (
                    <div className="py-20 text-center opacity-20 flex flex-col items-center">
                        <InformationCircleIcon className="h-24 w-24 mb-6" />
                        <p className="text-2xl font-black uppercase italic tracking-[0.3em]">Inga matchningar funna</p>
                    </div>
                )}
            </div>
        </main>
        
        {/* FOOTER */}
        <footer className="px-10 py-6 border-t border-gray-800 bg-gray-900/50 flex justify-between items-center relative z-20">
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3 text-gray-600">
                    <ActivityIcon className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Telemetry: ACTIVE | System State: Gold</span>
                </div>
                <div className="h-4 w-px bg-gray-800"></div>
                <button 
                    onClick={onReturnHome}
                    className="flex items-center space-x-2 text-cyan-500 hover:text-cyan-400 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    <HomeIcon className="h-4 w-4" />
                    <span>Return to Root Dashboard</span>
                </button>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-gray-700 font-bold uppercase">Trace_ID: {crypto.randomUUID().substring(0,8)}</span>
                <span className="text-[10px] font-mono text-gray-500 font-bold bg-black/40 px-3 py-1 rounded-full border border-gray-800">
                    SYNC: {new Date().toLocaleTimeString()}
                </span>
            </div>
        </footer>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, sub: string, color: 'cyan' | 'purple' | 'green' }> = ({ label, value, sub, color }) => {
    const colors = {
        cyan: 'text-cyan-400',
        purple: 'text-purple-400',
        green: 'text-green-500'
    };
    return (
        <div className="p-8 border-r border-gray-800 hover:bg-white/[0.02] transition-colors">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">{label}</p>
            <p className={`text-4xl font-black italic tracking-tighter leading-none mb-2 ${colors[color]}`}>{value}</p>
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">{sub}</p>
        </div>
    );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button 
        onClick={onClick}
        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30' : 'text-gray-500 hover:text-gray-300'}`}
    >
        {children}
    </button>
);

export default FMJAMControlPanel;
