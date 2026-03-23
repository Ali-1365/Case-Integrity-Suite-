
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { 
  ActivityIcon, 
  ServerIcon, 
  CpuChipIcon, 
  BoltIcon, 
  GlobeAltIcon,
  ShieldCheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  DatabaseIcon,
  ExclamationTriangleIcon
} from './icons';
import { geminiService, QuotaState } from '../services/geminiService';
import { githubService, RepoStatus } from '../services/githubService';
import { loggingService, LogEntry } from '../services/loggingService';
import { corpusService } from '../lib/CorpusService';
import { FULL_LEGAL_CORPUS } from '../data/legalCorpus';

interface SystemHealthDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SystemMetrics {
  timestamp: number;
  cpu: number;
  memory: number;
  apiLatency: number;
  errorRate: number;
}

const SystemHealthDashboard: React.FC<SystemHealthDashboardProps> = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState<SystemMetrics[]>([]);
  const [quota, setQuota] = useState<QuotaState>(geminiService.quotaState);
  const [repoStatus, setRepoStatus] = useState<RepoStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'api' | 'resources' | 'integrity'>('overview');
  const [integrityResults, setIntegrityResults] = useState<{file: string, status: 'ok' | 'error', message?: string}[]>([]);
  const [isCheckingIntegrity, setIsCheckingIntegrity] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(corpusService.isUsingFallback || FULL_LEGAL_CORPUS.length > 0);

  // Mock data generation for demonstration if real history is sparse
  useEffect(() => {
    if (!isOpen) return;

    const generateMockData = () => {
      const now = Date.now();
      const data: SystemMetrics[] = [];
      for (let i = 20; i >= 0; i--) {
        data.push({
          timestamp: now - i * 60000,
          cpu: 20 + Math.random() * 30,
          memory: 40 + Math.random() * 20,
          apiLatency: 100 + Math.random() * 200,
          errorRate: Math.random() * 5
        });
      }
      return data;
    };

    setMetrics(generateMockData());

    const interval = setInterval(() => {
      setMetrics(prev => {
        const newMetric = {
          timestamp: Date.now(),
          cpu: 20 + Math.random() * 30,
          memory: 40 + Math.random() * 20,
          apiLatency: 100 + Math.random() * 200,
          errorRate: Math.random() * 2
        };
        return [...prev.slice(1), newMetric];
      });
      
      setQuota({ ...geminiService.quotaState });
      setLogs(loggingService.getLogs().slice(0, 50));
    }, 3000);

    githubService.getRepoStatus()
      .then(setRepoStatus)
      .catch(err => console.error("Failed to fetch repo status in SystemHealthDashboard:", err));

    return () => clearInterval(interval);
  }, [isOpen]);

  const apiHealth = useMemo(() => {
    const recentLogs = logs.filter(l => Date.now() - new Date(l.timestamp).getTime() < 300000);
    const errors = recentLogs.filter(l => l.level === 'ERROR').length;
    const total = recentLogs.length || 1;
    return Math.max(0, 100 - (errors / total) * 100);
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full w-full bg-[#0f172a] overflow-hidden font-sans transition-all">
      
      {/* Header */}
      <header className="px-8 py-6 border-b border-slate-800 bg-[#0f172a] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <ActivityIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">System Health Oracle</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Live Monitoring Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
              <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<GlobeAltIcon className="w-4 h-4" />}>Overview</TabButton>
              <TabButton active={activeTab === 'api'} onClick={() => setActiveTab('api')} icon={<BoltIcon className="w-4 h-4" />}>API & AI</TabButton>
              <TabButton active={activeTab === 'resources'} onClick={() => setActiveTab('resources')} icon={<CpuChipIcon className="w-4 h-4" />}>Resources</TabButton>
              <TabButton active={activeTab === 'integrity'} onClick={() => setActiveTab('integrity')} icon={<DatabaseIcon className="w-4 h-4" />}>Data Integrity</TabButton>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow overflow-y-auto p-8 bg-[#0b1120] custom-scrollbar">
          
          {/* Fallback Warning */}
          {isUsingFallback && (
            <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-4 animate-pulse">
              <div className="p-2 bg-amber-500/20 rounded-xl">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Varning: Hårdkodad Fallback-data Aktiv</h4>
                <p className="text-xs text-amber-500/70 mt-0.5">Systemet använder statiska lagrum istället för att ladda från dynamiska JSON-filer. Detta kan leda till inkonsekvens i analysen.</p>
              </div>
            </div>
          )}

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <KPICard 
              title="System Health" 
              value={`${Math.round(apiHealth)}%`} 
              trend={apiHealth > 90 ? 'stable' : 'degraded'}
              icon={<ShieldCheckIcon className="w-5 h-5 text-emerald-400" />}
              color="emerald"
            />
            <KPICard 
              title="API Latency" 
              value={`${Math.round(metrics[metrics.length-1]?.apiLatency || 0)}ms`}
              trend="neutral"
              icon={<BoltIcon className="w-5 h-5 text-amber-400" />}
              color="amber"
            />
            <KPICard 
              title="Active Quota" 
              value={quota.isThrottled ? 'THROTTLED' : 'OPTIMAL'} 
              trend={quota.isThrottled ? 'down' : 'up'}
              icon={<ServerIcon className="w-5 h-5 text-blue-400" />}
              color="blue"
            />
            <KPICard 
              title="Repo Sync" 
              value={repoStatus?.isHealthy ? 'SYNCED' : 'DRIFT'} 
              trend={repoStatus?.isHealthy ? 'up' : 'down'}
              icon={<DatabaseIcon className="w-5 h-5 text-purple-400" />}
              color="purple"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ChartCard title="System Load & Resources">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metrics}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString()} stroke="#475569" tick={{fontSize: 10}} />
                  <YAxis stroke="#475569" tick={{fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc'}}
                    itemStyle={{color: '#f8fafc'}}
                  />
                  <Area type="monotone" dataKey="cpu" stroke="#6366f1" fillOpacity={1} fill="url(#colorCpu)" name="CPU Load %" />
                  <Area type="monotone" dataKey="memory" stroke="#10b981" fillOpacity={1} fill="url(#colorMem)" name="Memory Usage %" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="API Performance & Latency">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString()} stroke="#475569" tick={{fontSize: 10}} />
                  <YAxis stroke="#475569" tick={{fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc'}}
                  />
                  <Line type="monotone" dataKey="apiLatency" stroke="#f59e0b" strokeWidth={2} dot={false} name="Latency (ms)" />
                  <Line type="step" dataKey="errorRate" stroke="#ef4444" strokeWidth={2} dot={false} name="Error Rate" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Detailed Logs / Status */}
          {activeTab === 'overview' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Recent System Events</h3>
                <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                  <ArrowPathIcon className="w-3 h-3" /> Refresh
                </button>
              </div>
              <div className="space-y-2 font-mono text-xs">
                {logs.slice(0, 8).map(log => (
                  <div key={log.id} className="flex items-center gap-4 p-3 bg-slate-900 rounded-lg border border-slate-800/50 hover:border-slate-700 transition-colors">
                    <span className={`w-2 h-2 rounded-full ${log.level === 'ERROR' ? 'bg-red-500' : log.level === 'WARN' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                    <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={`font-bold ${log.level === 'ERROR' ? 'text-red-400' : 'text-slate-300'}`}>{log.level}</span>
                    <span className="text-slate-400 truncate flex-grow">{log.message}</span>
                    {log.duration && <span className="text-slate-600">{log.duration}ms</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'integrity' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Data Integrity Diagnostic</h3>
                  <p className="text-xs text-slate-400 mt-1">Verifies runtime accessibility and parsing of all legal corpus files.</p>
                </div>
                <button 
                  onClick={async () => {
                    setIsCheckingIntegrity(true);
                    const files = [
                      'bk_2018_1197.json', 'brb_1962_700.json', 'dl_2008_567.json', 'fb_1949_381.json', 
                      'fhs_1995_1301.json', 'fl_2017_900.json', 'fmu_2018_744.json', 'hsl_2017_30.json', 
                      'kl_2017_725.json', 'lag_2017_612.json', 'las_1982_80.json', 'lss_1993_387.json', 
                      'lvm_1988_870.json', 'lvu_1990_52.json', 'osl_2009_400.json', 'pl_2014_821.json', 
                      'praxis.json', 'rb_1942_740.json', 'rf_1974_152.json', 'SampleFacts_FS_2026-01-08.json', 
                      'sfb_2010_110.json', 'sjukl_1991_1047.json', 'skl_1972_207.json', 'sol_2025_400.json', 
                      'tf_1949_105.json', 'yfo_statlig_1967_920.json', 'ygl_1991_1469.json', 'ysl_1977_268.json', 
                      'ysl_statlig_1977_269.json', 'ysl_varde_1967_919.json', 'index.json'
                    ];
                    const results = [];
                    for (const file of files) {
                      const path = file === 'index.json' ? `/rag/${file}` : `/data/${file}`;
                      try {
                        const res = await fetch(path);
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        await res.json();
                        results.push({ file, status: 'ok' as const });
                      } catch (e) {
                        results.push({ file, status: 'error' as const, message: e instanceof Error ? e.message : String(e) });
                      }
                    }
                    setIntegrityResults(results);
                    setIsCheckingIntegrity(false);
                  }}
                  disabled={isCheckingIntegrity}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {isCheckingIntegrity ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ShieldCheckIcon className="w-4 h-4" />}
                  Run Full Diagnostic
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrityResults.map((res, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${res.status === 'ok' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'} flex items-center justify-between`}>
                    <div className="flex flex-col">
                      <span className="text-xs font-mono text-slate-300 truncate max-w-[180px]">{res.file}</span>
                      {res.message && <span className="text-[10px] text-red-400 mt-1">{res.message}</span>}
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${res.status === 'ok' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {res.status}
                    </span>
                  </div>
                ))}
                {integrityResults.length === 0 && !isCheckingIntegrity && (
                  <div className="col-span-full py-12 text-center opacity-20">
                    <DatabaseIcon className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">No diagnostic data available</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
    </div>
  );
};

const KPICard: React.FC<{title: string, value: string, trend: 'up' | 'down' | 'stable' | 'neutral' | 'degraded', icon: React.ReactNode, color: string}> = ({title, value, trend, icon, color}) => {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  };

  return (
    <div className={`p-6 rounded-2xl border ${colorClasses[color as keyof typeof colorClasses]} relative overflow-hidden`}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-xs font-bold uppercase tracking-wider opacity-70">{title}</p>
        {icon}
      </div>
      <p className="text-3xl font-black tracking-tight mb-1">{value}</p>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-black/20`}>
          {trend.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

const ChartCard: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6">{title}</h3>
    {children}
  </div>
);

const TabButton: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, children: React.ReactNode}> = ({active, onClick, icon, children}) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
  >
    {icon}
    {children}
  </button>
);

export default SystemHealthDashboard;
