import React, { useState, useEffect, useRef } from 'react';
import { RiskTemplate, ContextWeight, RiskSeverity, RiskLikelihood } from '../../lib/riskEngineV6.types';
import { 
  XMarkIcon, 
  CogIcon, 
  TrashIcon, 
  LawIcon, 
  ShieldCheckIcon, 
  CheckCircleIcon, 
  InformationCircleIcon, 
  PlusIcon,
  AdjustmentsHorizontalIcon,
  TagIcon,
  LinkIcon,
  ExclamationTriangleIcon
} from '../icons';
import { LegalFrameworkItem } from '../../types';

interface RiskProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (templates: RiskTemplate[], weights: ContextWeight[], legalFramework: LegalFrameworkItem[]) => void;
  initialTemplates: RiskTemplate[];
  initialWeights: ContextWeight[];
  initialLegalFramework: LegalFrameworkItem[];
  focusedItemId?: string | null;
}

type Tab = 'framework' | 'risks' | 'weights';

const RiskProfileEditor: React.FC<RiskProfileEditorProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialTemplates, 
  initialWeights, 
  initialLegalFramework, 
  focusedItemId 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('framework');
  const [templates, setTemplates] = useState<RiskTemplate[]>([]);
  const [weights, setWeights] = useState<ContextWeight[]>([]);
  const [legalFramework, setLegalFramework] = useState<LegalFrameworkItem[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (isOpen) {
      setTemplates(JSON.parse(JSON.stringify(initialTemplates)));
      setWeights(JSON.parse(JSON.stringify(initialWeights)));
      setLegalFramework(JSON.parse(JSON.stringify(initialLegalFramework)));
      
      if (focusedItemId) {
          setActiveTab('framework');
      }
    }
  }, [isOpen, initialTemplates, initialWeights, initialLegalFramework, focusedItemId]);

  useEffect(() => {
    if (isOpen && focusedItemId && activeTab === 'framework') {
      setTimeout(() => {
        const cleanId = focusedItemId.split('-')[0];
        const element = itemRefs.current[cleanId];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [isOpen, focusedItemId, activeTab]);

  const handleSave = () => { 
    onSave(templates, weights, legalFramework); 
    setSaveStatus("Konfiguration sparad!");
    setTimeout(() => {
        setSaveStatus(null);
        onClose();
    }, 1000);
  };

  const updateLegalItem = (id: string, updates: Partial<LegalFrameworkItem>) => {
      setLegalFramework(legalFramework.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const updateTemplate = (id: string, updates: Partial<RiskTemplate>) => {
      setTemplates(templates.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTemplate = (id: string) => {
      if (window.confirm("Är du säker på att du vill ta bort denna riskmodell?")) {
        setTemplates(templates.filter(t => t.id !== id));
      }
  };

  const updateWeight = (tag: string, val: number) => {
      setWeights(weights.map(w => w.tag === tag ? { ...w, weight: val } : w));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-md z-40 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border border-gray-800 overflow-hidden">
        
        <header className="px-8 py-6 flex justify-between items-center border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-cyan-500/10 rounded-2xl">
                <CogIcon className="h-7 w-7 text-cyan-400" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white leading-none">Systemkonfiguration</h2>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-[0.2em] font-black">FMJAM Engine v.6.2.2 | Legal Ground Truth</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {saveStatus && <span className="text-xs font-bold text-green-500 animate-pulse">{saveStatus}</span>}
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-white rounded-xl transition-all"><XMarkIcon className="h-7 w-7" /></button>
          </div>
        </header>

        <nav className="flex px-8 bg-gray-900/30 border-b border-gray-800">
            <TabButton active={activeTab === 'framework'} onClick={() => setActiveTab('framework')} icon={<LawIcon />}>Juridiskt Ramverk</TabButton>
            <TabButton active={activeTab === 'risks'} onClick={() => setActiveTab('risks')} icon={<ExclamationTriangleIcon />}>Riskmodeller</TabButton>
            <TabButton active={activeTab === 'weights'} onClick={() => setActiveTab('weights')} icon={<AdjustmentsHorizontalIcon />}>Kontextvikter</TabButton>
        </nav>
        
        <main className="p-8 flex-grow overflow-y-auto custom-scrollbar scroll-smooth bg-gray-950/20">
          
          {/* FLIK 1: JURIDISKT RAMVERK */}
          {activeTab === 'framework' && (
            <div className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 gap-6">
                    {legalFramework.map((item) => (
                        <div 
                            key={item.id} 
                            ref={el => { itemRefs.current[item.id] = el; }}
                            className={`p-6 rounded-2xl border transition-all ${focusedItemId?.startsWith(item.id) ? 'bg-cyan-900/10 border-cyan-500/50 ring-1 ring-cyan-500/20 shadow-lg' : 'bg-gray-800/40 border-gray-800'}`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex-1 pr-10">
                                    <div className="flex items-center space-x-3 mb-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${item.auditTrail.status === 'VERIFIED' ? 'bg-green-950 text-green-400 border border-green-900' : 'bg-red-950 text-red-400 border border-red-900'}`}>
                                            {item.auditTrail.status}
                                        </span>
                                        <span className="text-[10px] font-mono text-gray-600">v.{item.version}</span>
                                    </div>
                                    <input 
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => updateLegalItem(item.id, { label: e.target.value })}
                                        className="bg-transparent border-none text-xl font-bold text-white p-0 focus:ring-0 w-full"
                                    />
                                </div>
                                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-cyan-400 transition-colors">
                                    <LinkIcon className="h-5 w-5" />
                                </a>
                            </div>
                            <textarea 
                                rows={2}
                                value={item.description}
                                onChange={(e) => updateLegalItem(item.id, { description: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 mb-4"
                            />
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-2 bg-black/40 rounded-lg border border-gray-800/50">
                                    <p className="text-[8px] text-gray-500 uppercase font-black">SFS NUMMER</p>
                                    <p className="text-xs text-cyan-400 font-mono">{item.sfsNumber}</p>
                                </div>
                                <div className="p-2 bg-black/40 rounded-lg border border-gray-800/50">
                                    <p className="text-[8px] text-gray-500 uppercase font-black">GILTIGHET</p>
                                    <p className="text-xs text-gray-300 font-mono">{item.validFrom}</p>
                                </div>
                                <div className="p-2 bg-black/40 rounded-lg border border-gray-800/50">
                                    <p className="text-[8px] text-gray-500 uppercase font-black">ID</p>
                                    <p className="text-xs text-gray-500 font-mono truncate">{item.id}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {/* FLIK 2: RISKMODELLER */}
          {activeTab === 'risks' && (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Definitioner av Riskprofiler</h3>
                    <button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white px-3 py-1.5 rounded-lg border border-gray-700">
                        <PlusIcon className="w-4 h-4" />
                        <span>Ny Modell</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {templates.map(t => (
                        <div key={t.id} className="p-6 bg-gray-800/40 border border-gray-800 rounded-3xl hover:border-gray-700 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <input 
                                        className="bg-transparent border-none p-0 text-lg font-bold text-white focus:ring-0 w-full"
                                        value={t.name}
                                        onChange={(e) => updateTemplate(t.id, { name: e.target.value })}
                                    />
                                    <p className="text-[10px] text-gray-500 font-mono">{t.id}</p>
                                </div>
                                <button onClick={() => deleteTemplate(t.id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                            <textarea 
                                rows={2}
                                value={t.description}
                                onChange={(e) => updateTemplate(t.id, { description: e.target.value })}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-400 mb-4 outline-none resize-none"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black text-gray-600 uppercase mb-1 block">Allvarlighetsgrad (1-5)</label>
                                    <input 
                                        type="number" min="1" max="5"
                                        className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm"
                                        value={t.severity}
                                        onChange={(e) => updateTemplate(t.id, { severity: parseInt(e.target.value) as RiskSeverity })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-gray-600 uppercase mb-1 block">Sannolikhet (1-5)</label>
                                    <input 
                                        type="number" min="1" max="5"
                                        className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm"
                                        value={t.likelihood}
                                        onChange={(e) => updateTemplate(t.id, { likelihood: parseInt(e.target.value) as RiskLikelihood })}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {/* FLIK 3: KONTEXTVIKTER */}
          {activeTab === 'weights' && (
            <div className="space-y-8 animate-in fade-in duration-300">
                <div className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-3xl flex gap-6 items-start mb-8">
                    <InformationCircleIcon className="w-10 h-10 text-indigo-400 flex-shrink-0" />
                    <div>
                        <h4 className="text-white font-bold mb-1">Hur kontextvikter fungerar</h4>
                        <p className="text-xs text-indigo-300/70 leading-relaxed">
                            När systemet identifierar en specifik kontext (t.ex. att ett barn är inblandat) multipliceras grundrisken med den angivna vikten. 
                            En vikt på <strong>1.6</strong> innebär en 60% ökning av risk-score.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {weights.map(w => (
                        <div key={w.tag} className="p-6 bg-gray-800/40 border border-gray-800 rounded-3xl flex items-center justify-between group">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-gray-900 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform">
                                    <TagIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white uppercase tracking-widest">{w.tag}</p>
                                    <p className="text-[10px] text-gray-500">Kontextuell multiplikator</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <input 
                                    type="number" step="0.1" min="1.0" max="3.0"
                                    className="w-20 bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-right text-cyan-400 font-bold"
                                    value={w.weight}
                                    onChange={(e) => updateWeight(w.tag, parseFloat(e.target.value))}
                                />
                                <p className="text-[8px] text-gray-600 mt-1 uppercase font-bold">Multiplier</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </main>
        
        <footer className="px-8 py-6 border-t border-gray-800 bg-gray-950/50 flex justify-between items-center">
            <div className="flex items-center space-x-2 text-[10px] text-gray-600 uppercase font-bold tracking-widest">
                <ShieldCheckIcon className="h-4 w-4 text-green-500/50" />
                <span>Forensisk kedja intakt - Versionslåst Ground Truth</span>
            </div>
            <div className="flex gap-4">
                <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors">Avbryt</button>
                <button 
                    onClick={handleSave} 
                    className="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-cyan-900/20 transition-all active:scale-95 flex items-center space-x-2"
                >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Spara & Synkronisera</span>
                </button>
            </div>
        </footer>
      </div>
    </div>
  );
};

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactElement<{ className?: string }>;
    children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, children }) => (
    <button 
        onClick={onClick}
        className={`px-8 py-5 text-xs font-bold uppercase tracking-widest flex items-center space-x-3 transition-all border-b-2 ${active ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-500'}`}
    >
        {React.cloneElement(icon, { className: 'w-4 h-4' })}
        <span>{children}</span>
    </button>
);

export default RiskProfileEditor;