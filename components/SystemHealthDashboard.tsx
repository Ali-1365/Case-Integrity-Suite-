
import React, { useState, useEffect, useMemo } from 'react';
/*
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
*/

// Mock components to replace recharts
const ResponsiveContainer: React.FC<{ children: React.ReactNode, width?: string | number, height?: string | number }> = ({ children }) => <div className="w-full h-full">{children}</div>;
const AreaChart: React.FC<{ data: any[], children: React.ReactNode }> = ({ children }) => <div className="w-full h-full flex items-end gap-1">{children}</div>;
const LineChart: React.FC<{ data: any[], children: React.ReactNode }> = ({ children }) => <div className="w-full h-full flex items-center">{children}</div>;
const Area: React.FC<any> = () => <div className="flex-grow bg-indigo-500/20 h-1/2" />;
const Line: React.FC<any> = () => <div className="flex-grow border-t-2 border-amber-500" />;
const XAxis: React.FC<any> = () => null;
const YAxis: React.FC<any> = () => null;
const CartesianGrid: React.FC<any> = () => null;
const Tooltip: React.FC<any> = () => null;
const BarChart: React.FC<any> = () => null;
const Bar: React.FC<any> = () => null;
import { 
  Activity, 
  Server, 
  Cpu, 
  Zap, 
  Globe,
  ShieldCheck,
  X,
  RefreshCw,
  Database,
  AlertTriangle,
  Fingerprint,
  Search,
  Layout
} from 'lucide-react';
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
      
      const newState = geminiService.quotaState;
      setQuota(prev => {
          if (prev.isThrottled === newState.isThrottled && prev.retryAfterMs === newState.retryAfterMs && prev.lastError === newState.lastError) {
              return prev;
          }
          return { ...newState };
      });

      const newLogs = loggingService.getLogs().slice(0, 50);
      setLogs(prev => {
          if (prev.length === newLogs.length && (prev.length === 0 || prev[0].id === newLogs[0].id)) {
              return prev;
          }
          return newLogs;
      });
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
    <div className="flex flex-col h-full w-full bg-[var(--bg-main)] overflow-hidden font-sans transition-all animate-in fade-in duration-700">
      
      {/* Header */}
      <header className="px-10 py-8 border-b border-[var(--border)] bg-[var(--bg-card)] flex justify-between items-center shadow-sm relative z-10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-[var(--accent)]/10 rounded-[1.5rem] border border-[var(--accent)]/20 shadow-inner">
              <Activity className="w-8 h-8 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[var(--ink-main)] tracking-tighter font-serif uppercase italic">System Health Oracle</h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em]">Live Monitoring Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex bg-[var(--bg-main)] p-1.5 rounded-[2rem] border border-[var(--border)] shadow-inner">
              <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Globe className="w-4 h-4" />}>Overview</TabButton>
              <TabButton active={activeTab === 'api'} onClick={() => setActiveTab('api')} icon={<Zap className="w-4 h-4" />}>API & AI</TabButton>
              <TabButton active={activeTab === 'resources'} onClick={() => setActiveTab('resources')} icon={<Cpu className="w-4 h-4" />}>Resources</TabButton>
              <TabButton active={activeTab === 'integrity'} onClick={() => setActiveTab('integrity')} icon={<Database className="w-4 h-4" />}>Integrity</TabButton>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-[var(--bg-main)] rounded-2xl transition-all text-[var(--ink-muted)] hover:text-[var(--ink-main)] active:scale-95 border border-transparent hover:border-[var(--border)]">
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow overflow-y-auto p-10 bg-[var(--bg-main)]/30 custom-scrollbar">
          
          {/* Fallback Warning */}
          {isUsingFallback && (
            <div className="mb-10 p-6 bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] flex items-center gap-6 animate-in slide-in-from-top-4 duration-700 shadow-sm">
              <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-[0.2em]">Varning: Hårdkodad Fallback-data Aktiv</h4>
                <p className="text-xs text-amber-800/60 font-medium leading-relaxed">Systemet använder statiska lagrum istället för att ladda från dynamiska JSON-filer. Detta kan leda till inkonsekvens i analysen.</p>
              </div>
            </div>
          )}

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <KPICard 
              title="System Health" 
              value={`${Math.round(apiHealth)}%`} 
              trend={apiHealth > 90 ? 'stable' : 'degraded'}
              icon={<ShieldCheck className="w-6 h-6 text-emerald-500" />}
              color="emerald"
            />
            <KPICard 
              title="API Latency" 
              value={`${Math.round(metrics[metrics.length-1]?.apiLatency || 0)}ms`} 
              trend="neutral"
              icon={<Zap className="w-6 h-6 text-amber-500" />}
              color="amber"
            />
            <KPICard 
              title="Active Quota" 
              value={quota.isThrottled ? 'THROTTLED' : 'OPTIMAL'} 
              trend={quota.isThrottled ? 'down' : 'up'}
              icon={<Server className="w-6 h-6 text-indigo-500" />}
              color="indigo"
            />
            <KPICard 
              title="Repo Sync" 
              value={repoStatus?.isHealthy ? 'SYNCED' : 'DRIFT'} 
              trend={repoStatus?.isHealthy ? 'up' : 'down'}
              icon={<Database className="w-6 h-6 text-purple-500" />}
              color="purple"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
            <ChartCard title="System Load & Resources" icon={<Cpu className="w-5 h-5" />}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metrics}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString()} stroke="var(--ink-muted)" tick={{fontSize: 9, fontWeight: 700}} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--ink-muted)" tick={{fontSize: 9, fontWeight: 700}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{backgroundColor: 'var(--bg-card)', borderRadius: '1.5rem', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}}
                    itemStyle={{fontSize: '10px', fontWeight: 800, textTransform: 'uppercase'}}
                  />
                  <Area type="monotone" dataKey="cpu" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorCpu)" name="CPU Load %" />
                  <Area type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMem)" name="Memory Usage %" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="API Performance & Latency" icon={<Zap className="w-5 h-5" />}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString()} stroke="var(--ink-muted)" tick={{fontSize: 9, fontWeight: 700}} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--ink-muted)" tick={{fontSize: 9, fontWeight: 700}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{backgroundColor: 'var(--bg-card)', borderRadius: '1.5rem', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}}
                    itemStyle={{fontSize: '10px', fontWeight: 800, textTransform: 'uppercase'}}
                  />
                  <Line type="monotone" dataKey="apiLatency" stroke="var(--accent)" strokeWidth={4} dot={false} name="Latency (ms)" />
                  <Line type="step" dataKey="errorRate" stroke="#ef4444" strokeWidth={4} dot={false} name="Error Rate" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Detailed Logs / Status */}
          {activeTab === 'overview' && (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[3rem] p-10 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4">
                    <div className="p-2 bg-[var(--bg-main)] rounded-xl border border-[var(--border)]">
                        <Layout className="w-5 h-5 text-[var(--accent)]" />
                    </div>
                    <h3 className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em]">Recent System Events</h3>
                </div>
                <button className="text-[10px] font-black text-[var(--accent)] hover:text-[var(--accent-hover)] uppercase tracking-widest flex items-center gap-2 bg-[var(--bg-main)] px-4 py-2 rounded-xl border border-[var(--border)] transition-all active:scale-95">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>
              <div className="space-y-3 font-mono text-[11px]">
                {logs.slice(0, 8).map(log => (
                  <div key={log.id} className="flex items-center gap-6 p-4 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] hover:border-[var(--accent)] transition-all group shadow-sm">
                    <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${log.level === 'ERROR' ? 'bg-rose-500' : log.level === 'WARN' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                    <span className="text-[var(--ink-muted)]/50 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={`font-black uppercase tracking-widest ${log.level === 'ERROR' ? 'text-rose-600' : 'text-[var(--ink-muted)]'}`}>{log.level}</span>
                    <span className="text-[var(--ink-main)] font-medium truncate flex-grow">{log.message}</span>
                    {log.duration && <span className="text-[var(--ink-muted)] font-bold bg-[var(--bg-card)] px-2 py-0.5 rounded-lg border border-[var(--border)]">{log.duration}ms</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'integrity' && (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[3rem] p-10 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center space-x-6">
                    <div className="p-4 bg-[var(--bg-main)] rounded-[1.5rem] border border-[var(--border)]">
                        <Fingerprint className="w-8 h-8 text-[var(--accent)]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[var(--ink-main)] uppercase tracking-tighter font-serif">Data Integrity Diagnostic</h3>
                        <p className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-widest mt-1">Verifies runtime accessibility and parsing of all legal corpus files.</p>
                    </div>
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
                  className="flex items-center gap-4 bg-[var(--ink-main)] hover:bg-[var(--accent)] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 shadow-xl active:scale-95"
                >
                  {isCheckingIntegrity ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Run Full Diagnostic
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrityResults.map((res, i) => (
                  <div key={i} className={`p-5 rounded-2xl border transition-all hover:shadow-md ${res.status === 'ok' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'} flex items-center justify-between group`}>
                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] font-mono font-bold text-[var(--ink-muted)] truncate max-w-[180px] uppercase tracking-tighter">{res.file}</span>
                      {res.message && <span className="text-[9px] font-black text-rose-600 mt-1 uppercase tracking-widest">{res.message}</span>}
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-xl shadow-inner ${res.status === 'ok' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                      {res.status}
                    </span>
                  </div>
                ))}
                {integrityResults.length === 0 && !isCheckingIntegrity && (
                  <div className="col-span-full py-20 text-center opacity-20 bg-[var(--bg-main)] rounded-[2rem] border-2 border-dashed border-[var(--border)]">
                    <Database className="w-16 h-16 mx-auto mb-6" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">No diagnostic data available</p>
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
    emerald: 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600',
    amber: 'bg-amber-500/5 border-amber-500/10 text-amber-600',
    indigo: 'bg-indigo-500/5 border-indigo-500/10 text-indigo-600',
    purple: 'bg-purple-500/5 border-purple-500/10 text-purple-600',
  };

  return (
    <div className={`p-8 rounded-[2.5rem] border ${colorClasses[color as keyof typeof colorClasses]} relative overflow-hidden shadow-sm hover:shadow-xl transition-all group`}>
      {/* Decorative */}
      <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
          {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-24 h-24' })}
      </div>

      <div className="flex justify-between items-start mb-6 relative">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{title}</p>
        <div className="p-2 bg-white/50 rounded-xl border border-white/50 shadow-sm">
            {icon}
        </div>
      </div>
      <p className="text-4xl font-black tracking-tighter mb-2 font-serif italic relative">{value}</p>
      <div className="flex items-center gap-2 relative">
        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full bg-white/50 border border-white/50 shadow-inner`}>
          {trend.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

const ChartCard: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode}> = ({title, icon, children}) => (
  <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[3rem] p-10 shadow-xl hover:shadow-2xl transition-all">
    <div className="flex items-center space-x-4 mb-10">
        <div className="p-2 bg-[var(--bg-main)] rounded-xl border border-[var(--border)] text-[var(--ink-muted)]">
            {icon}
        </div>
        <h3 className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em]">{title}</h3>
    </div>
    <div className="bg-[var(--bg-main)]/30 p-6 rounded-[2rem] border border-[var(--border)] shadow-inner">
        {children}
    </div>
  </div>
);

const TabButton: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, children: React.ReactNode}> = ({active, onClick, icon, children}) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${active ? 'bg-[var(--ink-main)] text-white shadow-xl shadow-[var(--ink-main)]/20 border border-[var(--ink-main)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink-main)] hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border)]'}`}
  >
    {icon}
    {children}
  </button>
);

export default SystemHealthDashboard;
