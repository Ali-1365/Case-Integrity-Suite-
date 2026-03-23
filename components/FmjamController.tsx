
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  BoltIcon, 
  CpuChipIcon, 
  CheckCircleIcon, 
  GlobeAltIcon,
  UserIcon,
  CodeBracketIcon,
  LinkIcon
} from './icons';

interface FmjamControllerProps {
  analysis: any;
}

export const FmjamController: React.FC<FmjamControllerProps> = ({ analysis }) => {
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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Top Status Bar */}
      <div className="bg-[#1a1a1a] border border-amber-500/30 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/20">
            <ShieldCheckIcon className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">FMJAM Controller <span className="text-amber-500">v17.gold</span></h2>
            <p className="text-xs font-mono text-amber-500/70 uppercase tracking-[0.2em]">Metodologisk Revision: 100% | SECURE_DRIFT</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-bold">System Status</p>
            <p className="text-sm font-mono text-emerald-400 font-bold">OPERATIV</p>
          </div>
          <div className="h-10 w-px bg-gray-800"></div>
          <button 
            onClick={handleActivate}
            disabled={isActivating || isActivated}
            className={`
              px-8 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all
              ${isActivated 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default' 
                : isActivating 
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 cursor-wait'
                  : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95'}
            `}
          >
            {isActivated ? 'OFFICIAL LAYER ACTIVE' : isActivating ? `AKTIVERAR ${activationProgress}%` : 'AKTIVERA OFFICIAL LAYER'}
          </button>
        </div>
      </div>

      {/* Controller Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Governance & Compliance */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheckIcon className="w-24 h-24 text-white" />
            </div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-amber-500" />
              Governance Layer
            </h3>
            <div className="space-y-4 relative z-10">
              <ControlItem label="Metodologisk Integritet" status="VERIFIERAD" value="100%" />
              <ControlItem label="Etisk Alignment" status="OPTIMAL" value="99.9%" />
              <ControlItem label="Legal Grounding" status="LOCKED" value="SFS_SYNC" />
              <ControlItem label="Audit Traceability" status="ACTIVE" value="FULL" />
            </div>
          </div>

          {/* Juridiska Korpusar Section */}
          <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">System Resources</h3>
            <div className="space-y-6">
              <ResourceBar label="Oracle Reasoning" value={92} color="amber" />
              <ResourceBar label="RAG Throughput" value={78} color="cyan" />
              <ResourceBar label="Agent Coordination" value={85} color="emerald" />
            </div>
          </div>
        </div>

        {/* Middle Column: Real-time Orchestration */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8 min-h-[400px] relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <CodeBracketIcon className="w-6 h-6 text-amber-500" />
                Orchestration Monitor
              </h3>
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span className="text-[10px] font-mono text-amber-500 uppercase font-bold">Live Stream</span>
              </div>
            </div>

            <div className="space-y-4 font-mono text-[11px]">
              <LogEntry time="06:44:26" module="CONTROLLER" msg="Metodologisk Revision initierad... OK" color="amber" />
              <LogEntry time="06:44:27" module="ORACLE" msg="Reasoning Engine v7.2 kalibrerad för v17.gold" color="cyan" />
              <LogEntry time="06:44:28" module="RAG" msg="Hybrid Index synkroniserat med Legal Ground Truth" color="emerald" />
              <LogEntry time="06:44:30" module="AGENT_A" msg="Analytiker redo för forensiskt dataflöde" color="indigo" />
              <LogEntry time="06:44:32" module="AGENT_B" msg="Adjudicator aktiverad för deterministisk revision" color="red" />
              <LogEntry time="06:44:35" module="SYSTEM" msg="OFFICIAL CONTROLLER LAYER: STANDBY FOR COMMAND" color="white" />
            </div>

            {/* Visual Pulse Map */}
            <div className="mt-12 h-32 flex items-end gap-1 px-4">
              {[...Array(40)].map((_, i) => (
                <div 
                  key={i} 
                  className="flex-grow bg-amber-500/20 rounded-t-sm transition-all duration-500 hover:bg-amber-500/50"
                  style={{ height: `${(crypto.getRandomValues(new Uint32Array(1))[0] % 10000) / 100}%`, animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickStat icon={<GlobeAltIcon className="w-5 h-5" />} label="Global Sync" value="ACTIVE" />
            <QuickStat icon={<UserIcon className="w-5 h-5" />} label="Multi-Agent" value="STABLE" />
            <QuickStat icon={<BoltIcon className="w-5 h-5" />} label="Latency" value="12ms" />
          </div>
        </div>

      </div>
    </div>
  );
};

const ControlItem: React.FC<{ label: string, status: string, value: string }> = ({ label, status, value }) => (
  <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5 hover:border-amber-500/20 transition-colors">
    <div>
      <p className="text-[10px] text-gray-500 font-bold uppercase">{label}</p>
      <p className="text-xs font-bold text-white">{status}</p>
    </div>
    <div className="text-right">
      <p className="text-lg font-black text-amber-500 font-mono">{value}</p>
    </div>
  </div>
);

const ResourceBar: React.FC<{ label: string, value: number, color: 'amber' | 'cyan' | 'emerald' }> = ({ label, value, color }) => {
  const colorMap = {
    amber: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
    cyan: 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]',
    emerald: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold uppercase">
        <span className="text-gray-400">{label}</span>
        <span className="text-white">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden border border-white/5">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${colorMap[color]}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
};

const LogEntry: React.FC<{ time: string, module: string, msg: string, color: string }> = ({ time, module, msg, color }) => (
  <div className="flex gap-4 border-l border-white/5 pl-4 py-1 hover:bg-white/5 transition-colors group">
    <span className="text-gray-600 group-hover:text-gray-400">{time}</span>
    <span className={`font-bold text-${color}-500 w-20`}>[{module}]</span>
    <span className="text-gray-300">{msg}</span>
  </div>
);

const QuickStat: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="bg-[#111111] border border-gray-800 p-4 rounded-xl flex items-center gap-4 hover:border-amber-500/30 transition-all group">
    <div className="p-2 bg-gray-900 rounded-lg text-gray-500 group-hover:text-amber-500 transition-colors">
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-gray-500 font-bold uppercase">{label}</p>
      <p className="text-sm font-black text-white">{value}</p>
    </div>
  </div>
);
