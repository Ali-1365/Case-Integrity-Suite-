
import React, { useState } from 'react';
import { 
  ShieldCheckIcon, 
  BoltIcon, 
  CpuChipIcon, 
  GlobeAltIcon,
  UserIcon,
  CodeBracketIcon,
} from './icons';
import { ModuleConnector } from './shared/ModuleConnector';

interface FmjamControllerProps {
  analysis: any;
  onNavigate?: (moduleId: string) => void;
}

export const FmjamController: React.FC<FmjamControllerProps> = ({ analysis, onNavigate }) => {
  const [isActivating, setIsActivating] = useState(false);
  const [activationProgress, setActivationProgress] = useState(0);
  const [isActivated, setIsActivated] = useState(false);

  const handleActivate = () => {
    setIsActivating(true);
    console.log("Initierar Official Layer aktivering...");
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setActivationProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsActivating(false);
        setIsActivated(true);
        console.log("Official Layer aktiverat framgångsrikt.");
      }
    }, 50);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Top Status Bar */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] p-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
        <div className="flex items-center gap-8 relative z-10">
          <div className="p-5 bg-[var(--accent)]/10 border border-[var(--accent)]/30">
            <ShieldCheckIcon className="w-10 h-10 text-[var(--accent)]" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <BoltIcon className="w-3 h-3 text-[var(--accent)]" />
              <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em]">Control Matrix v.2.1</span>
            </div>
            <h2 className="text-4xl font-black text-[var(--ink-main)] tracking-tighter uppercase italic leading-none">FMJAM Controller <span className="text-[var(--accent)]">v17.gold</span></h2>
            <p className="text-[10px] font-black text-[var(--accent)]/70 uppercase tracking-[0.3em] mt-2 italic">Metodologisk Revision: 100% | SECURE_DRIFT_ACTIVE</p>
          </div>
        </div>
        
        <div className="flex items-center gap-10 relative z-10">
          <div className="text-right">
            <p className="text-[10px] text-[var(--ink-muted)] uppercase font-black tracking-widest mb-1">System Status</p>
            <div className="flex items-center justify-end gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse shadow-[0_0_8px_var(--success)]"></span>
              <p className="text-sm font-black text-[var(--success)] tracking-widest uppercase italic">OPERATIV</p>
            </div>
          </div>
          <div className="h-16 w-px bg-[var(--border)]"></div>
          <button 
            onClick={handleActivate}
            disabled={isActivating || isActivated}
            className={`
              px-10 py-4 font-black text-xs uppercase tracking-[0.2em] transition-all border italic
              ${isActivated 
                ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30 cursor-default' 
                : isActivating 
                  ? 'bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)]/30 cursor-wait'
                  : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-main)] shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-95 border-[var(--accent)]'}
            `}
          >
            {isActivated ? 'OFFICIAL LAYER ACTIVE' : isActivating ? `AKTIVERAR ${activationProgress}%` : 'AKTIVERA OFFICIAL LAYER'}
          </button>
        </div>
      </div>

      {/* Controller Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Governance & Compliance */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] p-8 relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
              <ShieldCheckIcon className="w-32 h-32 text-[var(--accent)]" />
            </div>
            <h3 className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-8 flex items-center gap-3 italic">
              <ShieldCheckIcon className="w-4 h-4 text-[var(--accent)]" />
              Governance Layer
            </h3>
            <div className="space-y-4 relative z-10">
              <ControlItem label="Metodologisk Integritet" status="VERIFIERAD" value="100%" />
              <ControlItem label="Etisk Alignment" status="OPTIMAL" value="99.9%" />
              <ControlItem label="Legal Grounding" status="LOCKED" value="SFS_SYNC" />
              <ControlItem label="Audit Traceability" status="ACTIVE" value="FULL" />
            </div>
          </div>

          {/* System Resources Section */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] p-8 shadow-lg">
            <h3 className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mb-8 italic">System Resources</h3>
            <div className="space-y-8">
              <ResourceBar label="Oracle Reasoning" value={92} color="accent" />
              <ResourceBar label="RAG Throughput" value={78} color="success" />
              <ResourceBar label="Agent Coordination" value={85} color="accent" />
            </div>
          </div>
        </div>

        {/* Middle Column: Real-time Orchestration */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] p-10 min-h-[450px] relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--accent) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <div className="flex justify-between items-center mb-12 relative z-10">
              <h3 className="text-xl font-black text-[var(--ink-main)] flex items-center gap-4 uppercase italic tracking-tight">
                <CodeBracketIcon className="w-7 h-7 text-[var(--accent)]" />
                Orchestration Monitor
              </h3>
              <div className="flex items-center gap-3 bg-[var(--bg-main)] px-4 py-2 border border-[var(--border)]">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping"></span>
                <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest italic">Live Stream</span>
              </div>
            </div>

            <div className="space-y-3 font-mono text-[11px] relative z-10">
              <LogEntry time="06:44:26" module="CONTROLLER" msg="Metodologisk Revision initierad... OK" color="accent" />
              <LogEntry time="06:44:27" module="ORACLE" msg="Reasoning Engine v7.2 kalibrerad för v17.gold" color="accent" />
              <LogEntry time="06:44:28" module="RAG" msg="Hybrid Index synkroniserat med Legal Ground Truth" color="success" />
              <LogEntry time="06:44:30" module="AGENT_A" msg="Analytiker redo för forensiskt dataflöde" color="accent" />
              <LogEntry time="06:44:32" module="AGENT_B" msg="Adjudicator aktiverad för deterministisk revision" color="danger" />
              <LogEntry time="06:44:35" module="SYSTEM" msg="OFFICIAL CONTROLLER LAYER: STANDBY FOR COMMAND" color="ink" />
            </div>

            {/* Visual Pulse Map */}
            <div className="mt-16 h-32 flex items-end gap-1.5 px-2 relative z-10">
              {[...Array(40)].map((_, i) => (
                <div 
                  key={i} 
                  className="flex-grow bg-[var(--accent)]/10 transition-all duration-500 hover:bg-[var(--accent)]/40 border-t border-[var(--accent)]/30"
                  style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.05}s` }}
                ></div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <QuickStat icon={<GlobeAltIcon className="w-6 h-6" />} label="Global Sync" value="ACTIVE" />
            <QuickStat icon={<UserIcon className="w-6 h-6" />} label="Multi-Agent" value="STABLE" />
            <QuickStat icon={<BoltIcon className="w-6 h-6" />} label="Latency" value="12ms" />
          </div>
        </div>

      </div>

      <ModuleConnector activeModule="controller" onNavigate={onNavigate} />
    </div>
  );
};

const ControlItem: React.FC<{ label: string, status: string, value: string }> = ({ label, status, value }) => (
  <div className="flex justify-between items-center p-5 bg-[var(--bg-main)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all shadow-sm">
    <div>
      <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-widest mb-1 italic">{label}</p>
      <p className="text-xs font-black text-[var(--ink-main)] uppercase italic">{status}</p>
    </div>
    <div className="text-right">
      <p className="text-xl font-black text-[var(--accent)] font-mono italic tracking-tighter">{value}</p>
    </div>
  </div>
);

const ResourceBar: React.FC<{ label: string, value: number, color: 'accent' | 'success' | 'danger' }> = ({ label, value, color }) => {
  const colorClass = color === 'accent' ? 'bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]' : color === 'success' ? 'bg-[var(--success)] shadow-[0_0_10px_var(--success)]' : 'bg-[var(--danger)] shadow-[0_0_10px_var(--danger)]';

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic">
        <span className="text-[var(--ink-muted)]">{label}</span>
        <span className="text-[var(--ink-main)]">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-[var(--bg-main)] border border-[var(--border)] overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${colorClass}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
};

const LogEntry: React.FC<{ time: string, module: string, msg: string, color: 'accent' | 'success' | 'danger' | 'ink' }> = ({ time, module, msg, color }) => {
  const colorClass = color === 'accent' ? 'text-[var(--accent)]' : color === 'success' ? 'text-[var(--success)]' : color === 'danger' ? 'text-[var(--danger)]' : 'text-[var(--ink-main)]';
  
  return (
    <div className="flex gap-6 border-l border-[var(--border)] pl-4 py-1 hover:bg-[var(--accent)]/5 transition-colors group">
      <span className="text-[var(--ink-muted)] opacity-50 shrink-0">[{time}]</span>
      <span className={`font-black uppercase tracking-tighter w-20 ${colorClass}`}>[{module}]</span>
      <span className="text-[var(--ink-main)] uppercase tracking-tight">{msg}</span>
    </div>
  );
};

const QuickStat: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] p-6 flex items-center gap-6 hover:border-[var(--accent)]/30 transition-all group shadow-lg">
    <div className="p-3 bg-[var(--bg-main)] border border-[var(--border)] text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-colors">
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-widest mb-1 italic">{label}</p>
      <p className="text-sm font-black text-[var(--ink-main)] uppercase italic tracking-wider">{value}</p>
    </div>
  </div>
);
