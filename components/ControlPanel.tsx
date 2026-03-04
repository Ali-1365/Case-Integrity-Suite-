
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 md:p-6 outline-none animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden ring-1 ring-white/5">
        
        <header className="px-8 py-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 relative overflow-hidden">
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <CogIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight leading-none">FMJAM System Oracle</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                  v.7.6.0-GOLD | SECURITY_CORE_LOCKED
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 relative z-10">
            <button 
                onClick={handleBakeIndex}
                disabled={isBaking}
                className="hidden md:flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest border border-blue-100 dark:border-blue-800/50"
            >
                {isBaking ? <Spinner className="h-4 w-4" /> : <CpuChipIcon className="h-4 w-4" />}
                <span>Bake RAG Index</span>
            </button>
            <button 
                onClick={handleRepair}
                disabled={isRepairing}
                className="hidden md:flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest border border-red-100 dark:border-red-800/50"
            >
                {isRepairing ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <ExclamationTriangleIcon className="h-4 w-4" />}
                <span>Nöd-reparation</span>
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </header>

        {/* STATUS BAR (STATISTIK & QUOTA) */}
        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20">
            <StatCard label="Verifierade Lagrum" value={`${stats.percent}%`} sub={`${stats.verified}/${stats.total} SFS-poster`} color="cyan" />
            <StatCard label="Pending Audit" value={stats.pending.toString()} sub="Väntar på validering" color="purple" />
            <StatCard label="Integritet" value="LOCKED" sub="SFS 2025:400 COMPLIANT" color="green" />
            
            <div className={`p-6 border-l border-slate-100 dark:border-slate-800 transition-colors ${quota.isThrottled ? 'bg-orange-500/10' : 'bg-transparent'}`}>
                <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resource Quota</p>
                    <BoltIcon className={`h-4 w-4 ${quota.isThrottled ? 'text-orange-500 animate-pulse' : 'text-slate-400'}`} />
                </div>
                <p className={`text-xl font-bold italic tracking-tight ${quota.isThrottled ? 'text-orange-500' : 'text-emerald-500'}`}>
                    {quota.isThrottled ? 'THROTTLED' : 'STABLE'}
                </p>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-1.5">
                    {quota.isThrottled ? `RETRY_IN: ${Math.round(quota.retryAfterMs/1000)}s` : 'API Gateway: Operational'}
                </p>
            </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-grow w-full relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <LawIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                    type="text" 
                    placeholder="Filtrera ramverk..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
            <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')}>Allt</TabButton>
                <TabButton active={activeTab === 'verified'} onClick={() => setActiveTab('verified')}>Låsta</TabButton>
                <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>Pending</TabButton>
            </div>
        </div>

        {/* MAIN LIST */}
        <main className="flex-grow overflow-y-auto p-8 custom-scrollbar bg-slate-50 dark:bg-slate-950/20">
            <div className="grid grid-cols-1 gap-4">
                {filteredSources.map((source) => (
                    <div key={source.id} className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300 relative overflow-hidden shadow-sm">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                            <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border tracking-widest ${source.auditTrail.status === 'VERIFIED' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50'}`}>
                                        {source.auditTrail.status}
                                    </span>
                                    <span className="text-[9px] font-mono text-blue-500/60 font-bold">SFS {source.sfsNumber}</span>
                                    {source.version.includes('2025') && (
                                        <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[8px] font-bold px-2 py-0.5 rounded border border-amber-100 dark:border-amber-900/50">REFORM</span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight uppercase italic">{source.label}</h3>
                                <p className="text-xs text-slate-500 mt-3 max-w-4xl leading-relaxed font-medium">{source.description}</p>
                            </div>
                            
                            <div className="flex gap-2 shrink-0">
                                <button 
                                    onClick={() => handleVerify(source.id)}
                                    className={`flex items-center space-x-2 text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${verifyingId === source.id ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'}`}
                                >
                                    {verifyingId === source.id ? <CheckCircleIcon className="h-4 w-4" /> : <ActivityIcon className="h-4 w-4" />}
                                    <span>{verifyingId === source.id ? 'Klar' : 'Audit'}</span>
                                </button>
                                <button 
                                    onClick={() => onEditItem?.(source.id)}
                                    className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900/50 hover:bg-blue-600 hover:text-white transition-all"
                                >
                                    <CogIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {filteredSources.length === 0 && (
                    <div className="py-20 text-center opacity-20 flex flex-col items-center">
                        <InformationCircleIcon className="h-16 w-16 mb-4" />
                        <p className="text-lg font-bold uppercase italic tracking-widest">Inga matchningar</p>
                    </div>
                )}
            </div>
        </main>
        
        {/* FOOTER */}
        <footer className="px-8 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center relative z-20">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-slate-400">
                    <ActivityIcon className="h-4 w-4" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Telemetry: ACTIVE</span>
                </div>
                <div className="h-3 w-px bg-slate-200 dark:bg-slate-800"></div>
                <button 
                    onClick={onReturnHome}
                    className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 text-[9px] font-bold uppercase tracking-widest transition-all"
                >
                    <HomeIcon className="h-4 w-4" />
                    <span>Dashboard</span>
                </button>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono text-slate-400 uppercase opacity-50">v7.3.2</span>
                <span className="text-[9px] font-mono text-slate-500 font-bold bg-slate-50 dark:bg-slate-950 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                    {new Date().toLocaleTimeString()}
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
