import React, { useState, useEffect, useRef } from 'react';
import { RiskTemplate, ContextWeight, RiskSeverity, RiskLikelihood } from '../../lib/riskEngineV6.types';
import { 
  X, 
  Settings, 
  Trash2, 
  Scale, 
  ShieldCheck, 
  CheckCircle, 
  Info, 
  Plus,
  SlidersHorizontal,
  Tag,
  Link,
  AlertTriangle
} from 'lucide-react';
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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
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
      setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
      if (deleteConfirmId) {
          setTemplates(templates.filter(t => t.id !== deleteConfirmId));
          setDeleteConfirmId(null);
      }
  };

  const updateWeight = (tag: string, val: number) => {
      setWeights(weights.map(w => w.tag === tag ? { ...w, weight: val } : w));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[var(--ink-main)]/60 backdrop-blur-xl z-[250] flex items-center justify-center p-0 md:p-6 lg:p-12 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-main)] rounded-none md:rounded-[3rem] shadow-2xl w-full max-w-7xl h-full md:h-[92vh] flex flex-col border-none md:border border-[var(--border)] overflow-hidden animate-in zoom-in-95 duration-700">
        
        <header className="px-12 py-8 border-b border-[var(--border)] bg-[var(--bg-card)] flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-8">
            <div className="p-4 bg-[var(--accent)] rounded-[1.5rem] shadow-2xl shadow-[var(--accent)]/20">
                <Settings className="h-7 w-7 text-white" />
            </div>
            <div>
                <h2 className="text-3xl font-black text-[var(--ink-main)] tracking-tighter m-0 font-serif italic uppercase">Systemkonfiguration</h2>
                <p className="text-[11px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] mt-2 opacity-70">FMJAM Engine v.6.2.2 | Legal Ground Truth</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {saveStatus && <span className="text-xs font-bold text-[var(--success)] animate-pulse">{saveStatus}</span>}
            <button onClick={onClose} className="p-3 text-[var(--ink-muted)] hover:text-[var(--ink-main)] rounded-2xl transition-all hover:bg-[var(--bg-main)] border border-transparent hover:border-[var(--border)] active:scale-95">
              <X className="h-7 w-7" />
            </button>
          </div>
        </header>

        <nav className="flex px-12 bg-[var(--bg-card)] border-b border-[var(--border)]">
            <TabButton active={activeTab === 'framework'} onClick={() => setActiveTab('framework')} icon={<Scale />}>Juridiskt Ramverk</TabButton>
            <TabButton active={activeTab === 'risks'} onClick={() => setActiveTab('risks')} icon={<AlertTriangle />}>Riskmodeller</TabButton>
            <TabButton active={activeTab === 'weights'} onClick={() => setActiveTab('weights')} icon={<SlidersHorizontal />}>Kontextvikter</TabButton>
        </nav>
        
        <main className="p-12 flex-grow overflow-y-auto custom-scrollbar scroll-smooth bg-[var(--bg-main)]/30">
          
          {/* FLIK 1: JURIDISKT RAMVERK */}
          {activeTab === 'framework' && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 gap-8">
                    {legalFramework.map((item) => (
                        <div 
                            key={item.id} 
                            ref={el => { itemRefs.current[item.id] = el; }}
                            className={`p-8 rounded-[2rem] border transition-all duration-500 ${focusedItemId?.startsWith(item.id) ? 'bg-[var(--bg-card)] border-[var(--accent)] shadow-2xl shadow-[var(--accent)]/10' : 'bg-[var(--bg-card)]/40 border-[var(--border)] shadow-sm hover:shadow-md'}`}
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex-1 pr-12">
                                    <div className="flex items-center space-x-4 mb-3">
                                        <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${item.auditTrail.status === 'VERIFIED' ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--danger)]/10 text-[var(--danger)]'}`}>
                                            {item.auditTrail.status}
                                        </span>
                                        <span className="text-[10px] font-bold text-[var(--ink-muted)] tracking-widest uppercase">v.{item.version}</span>
                                    </div>
                                    <input 
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => updateLegalItem(item.id, { label: e.target.value })}
                                        className="bg-transparent border-none text-2xl font-black text-[var(--ink-main)] p-0 focus:ring-0 w-full tracking-tight font-serif italic"
                                    />
                                </div>
                                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="p-3 text-[var(--ink-muted)] hover:text-[var(--accent)] transition-colors bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] shadow-sm">
                                    <Link className="h-5 w-5" />
                                </a>
                            </div>
                            <textarea 
                                rows={3}
                                value={item.description}
                                onChange={(e) => updateLegalItem(item.id, { description: e.target.value })}
                                className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl p-4 text-sm text-[var(--ink-main)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all mb-6 outline-none shadow-inner"
                            />
                            <div className="grid grid-cols-3 gap-6">
                                <div className="p-4 bg-[var(--bg-main)]/50 rounded-2xl border border-[var(--border)] shadow-sm">
                                    <p className="text-[9px] text-[var(--ink-muted)] uppercase font-black tracking-widest mb-1">SFS NUMMER</p>
                                    <p className="text-sm text-[var(--accent)] font-mono font-bold">{item.sfsNumber}</p>
                                </div>
                                <div className="p-4 bg-[var(--bg-main)]/50 rounded-2xl border border-[var(--border)] shadow-sm">
                                    <p className="text-[9px] text-[var(--ink-muted)] uppercase font-black tracking-widest mb-1">GILTIGHET</p>
                                    <p className="text-sm text-[var(--ink-main)] font-bold">{item.validFrom}</p>
                                </div>
                                <div className="p-4 bg-[var(--bg-main)]/50 rounded-2xl border border-[var(--border)] shadow-sm">
                                    <p className="text-[9px] text-[var(--ink-muted)] uppercase font-black tracking-widest mb-1">ID</p>
                                    <p className="text-sm text-[var(--ink-muted)] font-mono truncate">{item.id}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {/* FLIK 2: RISKMODELLER */}
          {activeTab === 'risks' && (
            <div className="space-y-10 animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-[var(--ink-main)] tracking-tight font-serif italic uppercase">Definitioner av Riskprofiler</h3>
                    <button className="flex items-center space-x-3 bg-[var(--ink-main)] hover:bg-[var(--accent)] text-xs font-black text-white px-6 py-3 rounded-2xl shadow-lg shadow-[var(--ink-main)]/20 transition-all active:scale-95">
                        <Plus className="w-4 h-4" />
                        <span className="uppercase tracking-widest">Ny Modell</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {templates.map(t => (
                        <div key={t.id} className="p-8 bg-[var(--bg-card)]/40 border border-[var(--border)] rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-[var(--accent)]/30 transition-all duration-500 group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex-1">
                                    <input 
                                        className="bg-transparent border-none p-0 text-xl font-black text-[var(--ink-main)] focus:ring-0 w-full tracking-tight font-serif italic"
                                        value={t.name}
                                        onChange={(e) => updateTemplate(t.id, { name: e.target.value })}
                                    />
                                    <p className="text-[10px] text-[var(--ink-muted)] font-bold uppercase tracking-widest mt-1">{t.id}</p>
                                </div>
                                <button onClick={() => deleteTemplate(t.id)} className="p-3 text-[var(--ink-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100 active:scale-95 border border-transparent hover:border-[var(--danger)]/20 shadow-sm">
                                  <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <textarea 
                                rows={3}
                                value={t.description}
                                onChange={(e) => updateTemplate(t.id, { description: e.target.value })}
                                className="w-full bg-[var(--bg-main)]/50 border border-[var(--border)] rounded-2xl px-4 py-3 text-sm text-[var(--ink-main)] mb-6 outline-none resize-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all shadow-inner"
                            />
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest block">Allvarlighetsgrad (1-5)</label>
                                    <input 
                                        type="number" min="1" max="5"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--ink-main)] text-sm font-bold focus:ring-2 focus:ring-[var(--accent)]/20 transition-all shadow-sm"
                                        value={t.severity}
                                        onChange={(e) => updateTemplate(t.id, { severity: parseInt(e.target.value) as RiskSeverity })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest block">Sannolikhet (1-5)</label>
                                    <input 
                                        type="number" min="1" max="5"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--ink-main)] text-sm font-bold focus:ring-2 focus:ring-[var(--accent)]/20 transition-all shadow-sm"
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
            <div className="space-y-10 animate-in fade-in duration-500">
                <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/10 p-8 rounded-[2.5rem] flex gap-8 items-start mb-10 shadow-sm">
                    <div className="p-4 bg-[var(--accent)]/10 rounded-3xl text-[var(--accent)] flex-shrink-0 border border-[var(--accent)]/20">
                        <Info className="w-8 h-8" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-[var(--ink-main)] mb-2 tracking-tight font-serif italic uppercase">Hur kontextvikter fungerar</h4>
                        <p className="text-sm text-[var(--ink-muted)] leading-relaxed max-w-2xl font-medium">
                            När systemet identifierar en specifik kontext (t.ex. att ett barn är inblandat) multipliceras grundrisken med den angivna vikten. 
                            En vikt på <strong className="text-[var(--accent)]">1.6</strong> innebär en 60% ökning av risk-score.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {weights.map(w => (
                        <div key={w.tag} className="p-8 bg-[var(--bg-card)]/40 border border-[var(--border)] rounded-[2.5rem] flex items-center justify-between group hover:shadow-xl hover:border-[var(--accent)]/30 transition-all duration-500 shadow-sm">
                            <div className="flex items-center space-x-6">
                                <div className="p-4 bg-[var(--bg-main)] rounded-2xl text-[var(--accent)] group-hover:scale-110 transition-transform duration-500 border border-[var(--border)] shadow-sm">
                                    <Tag className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-[var(--ink-main)] uppercase tracking-widest">{w.tag}</p>
                                    <p className="text-[10px] text-[var(--ink-muted)] font-bold uppercase tracking-widest mt-1">Multiplikator</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <input 
                                    type="number" step="0.1" min="1.0" max="3.0"
                                    className="w-24 bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl px-4 py-3 text-right text-[var(--accent)] font-black text-lg focus:ring-2 focus:ring-[var(--accent)]/20 transition-all shadow-inner"
                                    value={w.weight}
                                    onChange={(e) => updateWeight(w.tag, parseFloat(e.target.value))}
                                />
                                <p className="text-[9px] text-[var(--ink-muted)] mt-2 uppercase font-black tracking-widest">Vikt</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </main>
        
        <footer className="px-12 py-8 border-t border-[var(--border)] bg-[var(--bg-card)] flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-3 text-[10px] text-[var(--ink-muted)] uppercase font-black tracking-[0.2em]">
                <ShieldCheck className="h-5 w-5 text-emerald-500/50" />
                <span>Forensisk kedja intakt - Versionslåst Ground Truth</span>
            </div>
            <div className="flex gap-6">
                <button onClick={onClose} className="px-8 py-3 text-[10px] font-black text-[var(--ink-muted)] hover:text-[var(--ink-main)] uppercase tracking-widest transition-all active:scale-95">Avbryt</button>
                <button 
                    onClick={handleSave} 
                    className="px-10 py-4 bg-[var(--ink-main)] hover:bg-[var(--accent)] text-white text-[10px] font-black rounded-2xl shadow-xl shadow-[var(--ink-main)]/20 transition-all active:scale-95 flex items-center space-x-3 uppercase tracking-[0.2em]"
                >
                    <CheckCircle className="w-4 h-4" />
                    <span>Spara & Synkronisera</span>
                </button>
            </div>
        </footer>

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirmId && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[var(--ink-main)]/80 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-[var(--bg-main)] w-full max-w-md rounded-[3rem] p-12 shadow-2xl border border-[var(--border)] animate-in zoom-in-95 duration-300">
                    <div className="flex flex-col items-center text-center">
                        <div className="p-8 bg-[var(--danger)]/10 rounded-full text-[var(--danger)] mb-8 border border-[var(--danger)]/20 shadow-inner">
                            <Trash2 className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-black text-[var(--ink-main)] mb-4 tracking-tighter font-serif italic uppercase">Radera Riskmodell?</h3>
                        <p className="text-[var(--ink-muted)] mb-10 leading-relaxed font-medium">
                            Är du säker på att du vill ta bort denna riskmodell? Denna åtgärd kan inte ångras och påverkar framtida analyser.
                        </p>
                        <div className="flex w-full gap-4">
                            <button 
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 py-4 px-6 rounded-2xl bg-[var(--bg-card)] text-[var(--ink-muted)] font-black uppercase tracking-widest hover:bg-[var(--bg-main)] border border-[var(--border)] transition-all active:scale-95"
                            >
                                Avbryt
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="flex-1 py-4 px-6 rounded-2xl bg-[var(--danger)] text-white font-black uppercase tracking-widest hover:bg-[var(--danger)]/80 shadow-xl shadow-[var(--danger)]/20 transition-all active:scale-95"
                            >
                                Radera
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
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
        className={`px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] flex items-center space-x-3 transition-all border-b-4 ${active ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5' : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink-main)] hover:border-[var(--border)]'}`}
    >
        {React.cloneElement(icon, { className: 'w-4 h-4' })}
        <span>{children}</span>
    </button>
);

export default RiskProfileEditor;