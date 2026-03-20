
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

import SystemHealthDashboard from './SystemHealthDashboard';

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
  const [showHealthDashboard, setShowHealthDashboard] = useState(false);

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
    try {
      await db.repairPersistence();
      setTimeout(() => {
          setIsRepairing(false);
          alert("Systemintegritet återställd. Lokala lås har hävts.");
      }, 1500);
    } catch (error) {
      console.error("Repair failed:", error);
      setIsRepairing(false);
      alert("Reparation misslyckades. Se konsol för detaljer.");
    }
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
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 overflow-hidden font-sans transition-all">
      
      <header className="px-10 py-8 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 relative overflow-hidden">
          <div className="flex items-center space-x-5 relative z-10">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm">
              <CogIcon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase italic">System Oracle</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] mt-2 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2.5 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                  v.7.6.0-GOLD | SECURITY_CORE_LOCKED
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 relative z-10">
            <button 
                onClick={() => setShowHealthDashboard(true)}
                className="hidden lg:flex items-center space-x-3 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white text-indigo-700 dark:text-indigo-400 px-5 py-2.5 rounded-xl transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] border border-indigo-100 dark:border-indigo-800/50 shadow-sm hover:shadow-lg"
            >
                <ActivityIcon className="h-4 w-4" />
                <span>Hälsostatus</span>
            </button>
            <button 
                onClick={handleBakeIndex}
                disabled={isBaking}
                className="hidden lg:flex items-center space-x-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white text-blue-700 dark:text-blue-400 px-5 py-2.5 rounded-xl transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] border border-blue-100 dark:border-blue-800/50 shadow-sm hover:shadow-lg"
            >
                {isBaking ? <Spinner className="h-4 w-4" /> : <CpuChipIcon className="h-4 w-4" />}
                <span>Generera Index</span>
            </button>
            <button 
                onClick={handleRepair}
                disabled={isRepairing}
                className="hidden lg:flex items-center space-x-3 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-600 dark:hover:bg-rose-600 hover:text-white dark:hover:text-white text-rose-700 dark:text-rose-400 px-5 py-2.5 rounded-xl transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] border border-rose-100 dark:border-rose-800/50 shadow-sm hover:shadow-lg"
            >
                {isRepairing ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <ExclamationTriangleIcon className="h-4 w-4" />}
                <span>Nödreparation</span>
            </button>
            <div className="w-px h-8 bg-slate-100 dark:bg-slate-800 mx-2"></div>
            <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all duration-300">
              <XMarkIcon className="h-7 w-7" />
            </button>
          </div>
        </header>

        {/* STATUS BAR (STATISTIK & QUOTA) */}
        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
            <StatCard label="Verifierade Lagrum" value={`${stats.percent}%`} sub={`${stats.verified} av ${stats.total} SFS-poster verifierade`} color="cyan" />
            <StatCard label="Väntande Granskning" value={stats.pending.toString()} sub="Poster som kräver manuell validering" color="purple" />
            <StatCard label="Systemintegritet" value="LÅST" sub="SFS 2025:400 COMPLIANT" color="green" />
            
            <div className={`p-8 border-l border-slate-100 dark:border-slate-800 transition-all duration-500 ${quota.isThrottled ? 'bg-orange-500/10' : 'bg-transparent'}`}>
                <div className="flex justify-between items-start mb-4">
                    <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Resurskvot</p>
                    <BoltIcon className={`h-5 w-5 ${quota.isThrottled ? 'text-orange-500 animate-pulse' : 'text-slate-400'}`} />
                </div>
                <p className={`text-2xl font-black italic tracking-tighter ${quota.isThrottled ? 'text-orange-500' : 'text-emerald-500'}`}>
                    {quota.isThrottled ? 'BEGRÄNSAD' : 'STABIL'}
                </p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-600 uppercase mt-2 tracking-tight">
                    {quota.isThrottled ? `NÄSTA FÖRSÖK OM: ${Math.round(quota.retryAfterMs/1000)}s` : 'API Gateway: Operational'}
                </p>
            </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-grow w-full relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <LawIcon className="h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                    type="text" 
                    placeholder="Sök i det juridiska ramverket..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
            <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')}>Alla</TabButton>
                <TabButton active={activeTab === 'verified'} onClick={() => setActiveTab('verified')}>Verifierade</TabButton>
                <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>Väntande</TabButton>
            </div>
        </div>

        {/* MAIN LIST */}
        <main className="flex-grow overflow-y-auto p-10 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
            <div className="grid grid-cols-1 gap-6">
                {filteredSources.map((source) => (
                    <div key={source.id} className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-500 relative overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
                            <div className="flex-grow">
                                <div className="flex items-center gap-4 mb-4">
                                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border tracking-[0.15em] ${source.auditTrail.status === 'VERIFIED' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50'}`}>
                                        {source.auditTrail.status === 'VERIFIED' ? 'Verifierad' : 'Väntande'}
                                    </span>
                                    <span className="text-[11px] font-mono text-blue-500/70 font-black tracking-tighter">SFS {source.sfsNumber}</span>
                                    {source.version.includes('2025') && (
                                        <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-black px-3 py-1 rounded-full border border-amber-100 dark:border-amber-900/50 tracking-widest uppercase">Reform</span>
                                    )}
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight uppercase italic">{source.label}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 max-w-5xl leading-relaxed font-medium">{source.description}</p>
                            </div>
                            
                            <div className="flex gap-3 shrink-0">
                                <button 
                                    onClick={() => handleVerify(source.id)}
                                    className={`flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-2xl border transition-all duration-300 ${verifyingId === source.id ? 'bg-emerald-600 text-white border-emerald-400 scale-105 shadow-lg shadow-emerald-600/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 hover:shadow-md'}`}
                                >
                                    {verifyingId === source.id ? <CheckCircleIcon className="h-5 w-5" /> : <ActivityIcon className="h-5 w-5" />}
                                    <span>{verifyingId === source.id ? 'Klar' : 'Granska'}</span>
                                </button>
                                <button 
                                    onClick={() => onEditItem?.(source.id)}
                                    className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900/50 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-110"
                                >
                                    <CogIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {filteredSources.length === 0 && (
                    <div className="py-32 text-center opacity-30 flex flex-col items-center animate-in fade-in duration-1000">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <InformationCircleIcon className="h-12 w-12 text-slate-400" />
                        </div>
                        <p className="text-xl font-black uppercase italic tracking-[0.3em] text-slate-400">Inga matchningar funna</p>
                    </div>
                )}
            </div>
        </main>
        
        {/* FOOTER */}
        <footer className="px-10 py-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center relative z-20">
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-500">
                    <ActivityIcon className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Telemetri: AKTIV</span>
                </div>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                <button 
                    onClick={onReturnHome}
                    className="flex items-center space-x-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 group"
                >
                    <HomeIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span>Översikt</span>
                </button>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest opacity-60">v7.3.2-stable</span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-black bg-slate-50 dark:bg-slate-950 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                    {new Date().toLocaleTimeString()}
                </span>
            </div>
        </footer>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, sub: string, color: 'cyan' | 'purple' | 'green' }> = ({ label, value, sub, color }) => {
    const colors = {
        cyan: 'text-cyan-500 dark:text-cyan-400',
        purple: 'text-purple-500 dark:text-purple-400',
        green: 'text-emerald-500 dark:text-emerald-400'
    };
    return (
        <div className="p-8 border-r border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all duration-300 group">
            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{label}</p>
            <p className={`text-5xl font-black italic tracking-tighter leading-none mb-3 ${colors[color]} drop-shadow-sm`}>{value}</p>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-600 uppercase tracking-tight leading-relaxed">{sub}</p>
        </div>
    );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button 
        onClick={onClick}
        className={`px-10 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
    >
        {children}
    </button>
);

export default FMJAMControlPanel;
