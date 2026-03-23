
import React, { useState, useEffect, useRef } from 'react';
import { RiskTemplate, ContextWeight, RiskSeverity, RiskLikelihood } from '../lib/riskEngineV6.types';
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
  ExclamationTriangleIcon,
  SparklesIcon
} from './icons';
import { LegalFrameworkItem } from '../lib/legalReferenceEngine';

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
    setSaveStatus("Systemkonfiguration GOLD synkroniserad!");
    setTimeout(() => {
        setSaveStatus(null);
        onClose();
    }, 1000);
  };

  const handleAddLegalItem = () => {
    const newItem: LegalFrameworkItem = {
      id: `custom_${Date.now()}`,
      label: "Nytt Lagstöd / Instruktion",
      type: "lagrum",
      reference: "SoL",
      sfsNumber: "2025:400",
      description: "Ange beskrivning av rättsligt stöd eller handboksinstruktion här.",
      validFrom: new Date().toISOString().split('T')[0],
      sourceUrl: "",
      version: "1.0",
      auditTrail: { verifiedAt: new Date().toISOString().split('T')[0], status: "UNDERLAG SAKNAS" }
    };
    setLegalFramework([newItem, ...legalFramework]);
    setActiveTab('framework');
  };

  const updateLegalItem = (id: string, updates: Partial<LegalFrameworkItem>) => {
      setLegalFramework(legalFramework.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteLegalItem = (id: string) => {
      if (window.confirm("Är du säker på att du vill ta bort detta lagrum från ramverket?")) {
        setLegalFramework(legalFramework.filter(item => item.id !== id));
      }
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
    <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col border border-gray-800 overflow-hidden ring-1 ring-white/5 animate-in zoom-in-95 duration-300">
        
        <header className="px-10 py-8 flex justify-between items-center border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-cyan-500/10 rounded-[1.5rem] border border-cyan-500/20 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]">
                <CogIcon className="h-8 w-8 text-cyan-400" />
            </div>
            <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Systemkonfiguration</h2>
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.3em] font-black">FMJAM Engine v.6.2.2-GOLD | SFS 2025:400 COMPLIANT</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            {saveStatus && (
                <div className="flex items-center space-x-2 bg-green-950/30 px-4 py-2 rounded-full border border-green-500/20">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-bold text-green-400 uppercase tracking-widest">{saveStatus}</span>
                </div>
            )}
            <button onClick={onClose} className="p-3 text-gray-500 hover:text-white hover:bg-gray-800 rounded-2xl transition-all">
                <XMarkIcon className="h-8 w-8" />
            </button>
          </div>
        </header>

        <nav className="flex px-10 bg-gray-900/30 border-b border-gray-800">
            <TabButton active={activeTab === 'framework'} onClick={() => setActiveTab('framework')} icon={<LawIcon />}>Juridiskt Ramverk</TabButton>
            <TabButton active={activeTab === 'risks'} onClick={() => setActiveTab('risks')} icon={<ExclamationTriangleIcon />}>Riskmodeller</TabButton>
            <TabButton active={activeTab === 'weights'} onClick={() => setActiveTab('weights')} icon={<AdjustmentsHorizontalIcon />}>Kontextvikter</TabButton>
        </nav>
        
        <main className="p-10 flex-grow overflow-y-auto custom-scrollbar scroll-smooth bg-gray-950/40">
          
          {/* FLIK 1: JURIDISKT RAMVERK */}
          {activeTab === 'framework' && (
            <div className="space-y-10 animate-in fade-in duration-300">
                <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-[1.5rem] border border-gray-800 shadow-inner">
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Definitioner av gällande rätt</h3>
                        <p className="text-sm text-gray-500 mt-1">Här hanteras de lagar och föreskrifter som utgör systemets beslutsunderlag.</p>
                    </div>
                    <button 
                        onClick={handleAddLegalItem}
                        className="flex items-center space-x-3 bg-cyan-600 hover:bg-cyan-500 text-[10px] font-black text-white px-6 py-3 rounded-2xl border border-cyan-400/20 shadow-xl shadow-cyan-900/20 active:scale-95 transition-all uppercase tracking-widest"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Lägg till lagrum</span>
                    </button>
                </div>
                
                <div className="grid grid-cols-1 gap-8">
                    {legalFramework.map((item) => (
                        <div 
                            key={item.id} 
                            ref={el => { itemRefs.current[item.id] = el; }}
                            className={`p-8 rounded-[2rem] border transition-all relative overflow-hidden group ${focusedItemId?.startsWith(item.id) ? 'bg-cyan-950/20 border-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.15)]' : 'bg-gray-900/40 border-gray-800'}`}
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex-1 pr-12">
                                    <div className="flex items-center space-x-4 mb-3">
                                        <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${item.auditTrail.status === 'VERIFIED' ? 'bg-green-950/30 text-green-400 border-green-500/20' : 'bg-orange-950/30 text-orange-400 border-orange-500/20'}`}>
                                            {item.auditTrail.status}
                                        </span>
                                        <span className="text-[10px] font-mono text-gray-600 font-bold uppercase">VERSION_LOCKED: {item.version}</span>
                                    </div>
                                    <input 
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => updateLegalItem(item.id, { label: e.target.value })}
                                        className="bg-transparent border-none text-2xl font-black text-white p-0 focus:ring-0 w-full tracking-tight group-hover:text-cyan-400 transition-colors"
                                    />
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => deleteLegalItem(item.id)} className="p-3 text-gray-600 hover:text-red-400 transition-colors bg-gray-950 rounded-xl border border-gray-800">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="p-3 text-gray-500 hover:text-cyan-400 transition-colors bg-gray-950 rounded-xl border border-gray-800">
                                        <LinkIcon className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>
                            
                            <textarea 
                                rows={3}
                                value={item.description}
                                onChange={(e) => updateLegalItem(item.id, { description: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-[1.2rem] px-5 py-4 text-sm text-gray-300 mb-6 focus:border-cyan-500/50 outline-none transition-all resize-none shadow-inner"
                            />
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <ConfigDataField 
                                    label="SFS NUMMER" 
                                    value={item.sfsNumber} 
                                    onChange={(val) => updateLegalItem(item.id, { sfsNumber: val })}
                                />
                                <ConfigDataField 
                                    label="REFERENS-KOD" 
                                    value={item.reference} 
                                    onChange={(val) => updateLegalItem(item.id, { reference: val as any })}
                                />
                                <ConfigDataField 
                                    label="GILTIGHET" 
                                    value={item.validFrom} 
                                    onChange={(val) => updateLegalItem(item.id, { validFrom: val })}
                                />
                                <div className="p-3 bg-black/20 rounded-xl border border-gray-800/50">
                                    <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">SYSTEM_ID</p>
                                    <p className="text-[10px] text-gray-500 font-mono truncate font-bold uppercase">{item.id}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {/* FLIK 2: RISKMODELLER */}
          {activeTab === 'risks' && (
            <div className="space-y-10 animate-in fade-in duration-300">
                <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-[1.5rem] border border-gray-800">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Riskprofil-bibliotek (v.6.2.2)</h3>
                    <button className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 text-[10px] font-black text-white px-5 py-2.5 rounded-xl border border-gray-700 transition-all uppercase tracking-widest">
                        <PlusIcon className="w-4 h-4" />
                        <span>Ny Riskmodell</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {templates.map(t => (
                        <div key={t.id} className="p-8 bg-gray-900/40 border border-gray-800 rounded-[2rem] hover:border-cyan-500/30 transition-all relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <input 
                                        className="bg-transparent border-none p-0 text-xl font-black text-white focus:ring-0 w-full tracking-tight group-hover:text-cyan-400 transition-colors"
                                        value={t.name}
                                        onChange={(e) => updateTemplate(t.id, { name: e.target.value })}
                                    />
                                    <p className="text-[9px] text-gray-600 font-mono font-bold mt-1">ID: {t.id}</p>
                                </div>
                                <button onClick={() => deleteTemplate(t.id)} className="p-2.5 text-gray-600 hover:text-red-400 transition-colors bg-black/20 rounded-lg"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                            <textarea 
                                rows={2}
                                value={t.description}
                                onChange={(e) => updateTemplate(t.id, { description: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-400 mb-6 outline-none resize-none focus:border-cyan-500/30 transition-all shadow-inner"
                            />
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[8px] font-black text-gray-600 uppercase mb-2 block tracking-widest">Allvarlighetsgrad (1-5)</label>
                                    <input 
                                        type="number" min="1" max="5"
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:ring-1 focus:ring-cyan-500/50"
                                        value={t.severity}
                                        onChange={(e) => updateTemplate(t.id, { severity: parseInt(e.target.value) as RiskSeverity })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[8px] font-black text-gray-600 uppercase mb-2 block tracking-widest">Sannolikhet (1-5)</label>
                                    <input 
                                        type="number" min="1" max="5"
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:ring-1 focus:ring-cyan-500/50"
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
            <div className="space-y-10 animate-in fade-in duration-300">
                <div className="bg-cyan-500/5 border border-cyan-500/20 p-8 rounded-[2rem] flex gap-8 items-start mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <SparklesIcon className="w-32 h-32 text-cyan-400" />
                    </div>
                    <div className="p-4 bg-cyan-900/30 rounded-2xl">
                        <InformationCircleIcon className="w-10 h-10 text-cyan-400 flex-shrink-0" />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Matematiska Konstanten v.6.2</h4>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-3xl">
                            Dessa multiplikatorer används för att korrigera risk-score baserat på ärendets natur. 
                            Notera: Om en risk rör ett <strong>barn</strong> multipliceras grundrisken automatiskt med <strong>1.85</strong> för att garantera kritisk prioritet.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {weights.map(w => (
                        <div key={w.tag} className="p-8 bg-gray-900/40 border border-gray-800 rounded-[2rem] flex items-center justify-between group hover:border-cyan-500/20 transition-all">
                            <div className="flex items-center space-x-5">
                                <div className="p-4 bg-gray-950 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform border border-gray-800">
                                    <TagIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-base font-black text-white uppercase tracking-widest">{w.tag}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Viktning</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <input 
                                    type="number" step="0.05" min="1.0" max="3.0"
                                    className="w-24 bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3 text-right text-cyan-400 font-black text-lg shadow-inner focus:ring-1 focus:ring-cyan-500/50"
                                    value={w.weight}
                                    onChange={(e) => updateWeight(w.tag, parseFloat(e.target.value))}
                                />
                                <div className="mt-2 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500" style={{ width: `${((w.weight - 1) / 2) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </main>
        
        <footer className="px-10 py-8 border-t border-gray-800 bg-gray-950/80 flex justify-between items-center relative z-20">
            <div className="flex items-center space-x-4">
                <ShieldCheckIcon className="h-6 w-6 text-green-500/50" />
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none">Forensisk kedja intakt</span>
                    <span className="text-[9px] text-gray-600 font-bold uppercase mt-1">LOCKED_GOLD_STATE: {new Date().toISOString()}</span>
                </div>
            </div>
            <div className="flex gap-4">
                <button 
                    onClick={onClose} 
                    className="px-8 py-3 text-xs font-black text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
                >
                    Avbryt ändringar
                </button>
                <button 
                    onClick={handleSave} 
                    className="px-10 py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded-2xl shadow-xl shadow-cyan-900/20 transition-all active:scale-95 flex items-center space-x-3 uppercase tracking-[0.2em] border border-cyan-400/20"
                >
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Spara v.6.2.2-GOLD</span>
                </button>
            </div>
        </footer>
      </div>
    </div>
  );
};

// Fix: Properly cast the icon prop to React.ReactElement<{ className?: string }> so that React.cloneElement accepts className as a valid prop.
const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, children: React.ReactNode }> = ({ active, onClick, icon, children }) => (
    <button 
        onClick={onClick}
        className={`px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] flex items-center space-x-4 transition-all border-b-2 relative ${active ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-500'}`}
    >
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-4 h-4' })}
        <span>{children}</span>
        {active && <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-cyan-400 blur-[2px] opacity-30"></div>}
    </button>
);

const ConfigDataField: React.FC<{ label: string, value: string, onChange: (val: string) => void }> = ({ label, value, onChange }) => (
    <div className="p-4 bg-black/30 rounded-2xl border border-gray-800/50 shadow-inner group/field">
        <p className="text-[8px] text-gray-600 uppercase font-black tracking-[0.2em] mb-2">{label}</p>
        <input 
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent border-none p-0 text-xs text-cyan-400 font-mono font-bold focus:ring-0 w-full uppercase tracking-widest"
        />
    </div>
);

export default RiskProfileEditor;
