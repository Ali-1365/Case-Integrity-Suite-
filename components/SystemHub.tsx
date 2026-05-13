
import React, { useState, useMemo } from 'react';
import { 
    Zap, 
    Cpu, 
    ShieldCheck, 
    FileText, 
    Activity, 
    Scale,
    Sparkles,
    Archive,
    Users,
    AlertTriangle,
    BarChart3,
    Fingerprint,
    MessageSquare,
    Code2,
    Settings2,
    ClipboardList,
    Search,
    Banknote,
    LayoutDashboard,
    HelpCircle,
    ArrowRight
} from 'lucide-react';

interface ModuleCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    status: 'active' | 'warning' | 'error';
    onClick: () => void;
    category: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ title, description, icon, status, onClick, category }) => (
    <button 
        onClick={onClick}
        className="group bg-[var(--bg-card)] border border-[var(--border-strong)] p-5 text-left hover:bg-[var(--bg-main)] transition-all flex flex-col h-full relative overflow-hidden active:scale-[0.98] shadow-sm"
    >
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-2.5 bg-[var(--bg-main)] border border-[var(--border-strong)] text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-all duration-300 shadow-inner">
                {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5" })}
            </div>
            <div className="flex flex-col items-end space-y-1.5">
                <div className="flex items-center space-x-2 bg-[var(--bg-main)] px-2 py-1 border border-[var(--border-strong)] shadow-inner">
                    <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-[var(--success)]' : 'bg-[var(--warning)]'}`}></span>
                    <span className="text-[8px] font-mono font-bold text-[var(--ink-main)] uppercase tracking-widest">{status}</span>
                </div>
                <span className="text-[8px] font-bold text-[var(--accent)] bg-[var(--accent)]/5 px-2 py-0.5 uppercase tracking-widest border border-[var(--accent)]/10">{category}</span>
            </div>
        </div>
        
        <div className="space-y-1.5 flex-grow relative z-10">
            <h3 className="text-base font-bold text-[var(--ink-main)] leading-tight group-hover:text-[var(--accent)] transition-all uppercase tracking-tight">
                {title}
            </h3>
            <p className="text-[12px] text-[var(--ink-muted)] leading-relaxed line-clamp-2 font-medium opacity-80">
                {description}
            </p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-[var(--border-strong)]/50 flex items-center justify-end relative z-10">
            <div className="flex items-center text-[8px] font-bold text-[var(--accent)] uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                <span>Öppna Modul</span>
                <ArrowRight className="w-3 h-3 ml-1.5" />
            </div>
        </div>
    </button>
);


interface SystemHubProps {
    onNavigate: (view: string) => void;
}

export const SystemHub: React.FC<SystemHubProps> = ({ onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const modules = useMemo(() => [
        {
            id: 'ekonomi',
            title: 'Ekonomisk Motor',
            description: 'Hantera betalningar, fakturor och skadeståndskrav med AI-precision.',
            icon: <Banknote />,
            status: 'active' as const,
            category: 'Expertis'
        },
        {
            id: 'chat',
            title: 'Beslutsmotor',
            description: 'Interaktiv AI-rådgivare för komplexa juridiska frågeställningar.',
            icon: <MessageSquare />,
            status: 'active' as const,
            category: 'Expertis'
        },
        {
            id: 'production',
            title: 'Juridisk Textproduktion',
            description: 'Exekverande verktyg för domstolsklara processkrifter enligt RB.',
            icon: <Scale />,
            status: 'active' as const,
            category: 'Expertis'
        },
        {
            id: 'opinion',
            title: 'AI-Expert (Yttranden)',
            description: 'Generera juridiska yttranden med 8-stegs bevisvärdering och SHA-256.',
            icon: <Sparkles />,
            status: 'active' as const,
            category: 'Expertis'
        },
        {
            id: 'duel',
            title: 'Adversarial Duel',
            description: 'Simulera rättsprocesser mot en fientlig AI-motpart.',
            icon: <AlertTriangle />,
            status: 'active' as const,
            category: 'Expertis'
        },
        {
            id: 'profiler',
            title: 'Case Profiler',
            description: 'Sammanställning av nyckelinformation och riskprofiler för valda ärenden.',
            icon: <Users />,
            status: 'active' as const,
            category: 'Analys'
        },
        {
            id: 'agent',
            title: 'Analys & Utredning',
            description: 'Djupgående analys av bevisatomer och rättsliga förhållanden.',
            icon: <Search />,
            status: 'active' as const,
            category: 'Analys'
        },
        {
            id: 'pipeline',
            title: 'Legal Pipeline',
            description: 'Övervaka de 8 stegen i den juridiska analysprocessen.',
            icon: <Activity />,
            status: 'active' as const,
            category: 'Analys'
        },
        {
            id: 'integrity',
            title: 'Forensisk Integritet',
            description: 'Verifiera dataatomer och integritetskedjor (SHA-256).',
            icon: <Fingerprint />,
            status: 'active' as const,
            category: 'Integritet'
        },
        {
            id: 'correlate',
            title: 'Kors-korrelering',
            description: 'Korsanalysera flera dokument för att hitta motsägelser och mönster.',
            icon: <Activity />,
            status: 'active' as const,
            category: 'Analys'
        },
        {
            id: 'oracle',
            title: 'Oracle Command',
            description: 'Avancerad AI-motor för prediktiv juridisk analys och strategisk rådgivning.',
            icon: <Cpu />,
            status: 'active' as const,
            category: 'Expertis'
        },
        {
            id: 'arch',
            title: 'Ärendearkiv',
            description: 'Central lagringsplats för alla historiska och pågående ärenden.',
            icon: <Archive />,
            status: 'active' as const,
            category: 'Analys'
        },
        {
            id: 'notary',
            title: 'Intern Processnotarie',
            description: 'Logga och verifiera AI-agentens interna beslutskedjor i realtid.',
            icon: <ClipboardList />,
            status: 'active' as const,
            category: 'Integritet'
        },
        {
            id: 'audit',
            title: 'System Audit Trail',
            description: 'Fullständig historik över alla systemoperationer och regelefterlevnad.',
            icon: <ShieldCheck />,
            status: 'active' as const,
            category: 'Integritet'
        },
        {
            id: 'aggregator',
            title: 'Mega-Aggregator v.7.2',
            description: 'Slå samman och analysera stora mängder bevisdata till en enhetlig bild.',
            icon: <Zap />,
            status: 'active' as const,
            category: 'Analys'
        }
    ], []); // Static list

    const categories = useMemo(() => Array.from(new Set(modules.map(m => m.category))), [modules]);

    const filteredModules = useMemo(() => {
        return modules.filter(m => {
            const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 m.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !activeCategory || m.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [modules, searchQuery, activeCategory]);

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <header className="py-8 px-8 bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-mono font-bold tracking-[0.3em] text-[var(--ink-muted)] uppercase opacity-60">System Hub v1.0</span>
                            <div className="h-px w-10 bg-[var(--border-strong)]"></div>
                        </div>
                        <h1 className="text-3xl font-bold text-[var(--ink-main)] tracking-tight uppercase">
                            Operativ Kontrollpanel
                        </h1>
                        <p className="text-[10px] text-[var(--ink-muted)] max-w-xl font-bold uppercase tracking-widest leading-relaxed opacity-70">
                            Centraliserad orkestrering av forensiska moduler och AI-experter.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="px-5 py-3 bg-[var(--bg-main)] border border-[var(--border-strong)] flex items-center gap-3 shadow-inner">
                            <div className="w-2 h-2 rounded-full bg-[var(--success)]"></div>
                            <div>
                                <p className="text-[8px] font-bold text-[var(--ink-muted)] uppercase tracking-widest opacity-60">Status</p>
                                <p className="text-[10px] font-mono font-bold text-[var(--ink-main)] uppercase tracking-widest">Operativ</p>
                            </div>
                        </div>
                        <div className="px-5 py-3 bg-[var(--bg-main)] border border-[var(--border-strong)] flex items-center gap-3 shadow-inner">
                            <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                            <div>
                                <p className="text-[8px] font-bold text-[var(--ink-muted)] uppercase tracking-widest opacity-60">Säkerhet</p>
                                <p className="text-[10px] font-mono font-bold text-[var(--ink-main)] uppercase tracking-widest">Verifierad</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="sticky top-24 z-40">
                <div className="p-2 bg-[var(--bg-card)]/90 backdrop-blur-xl border border-[var(--border-strong)] shadow-xl flex flex-col md:flex-row items-center gap-2">
                    <div className="relative flex-grow w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-muted)] opacity-40" />
                        <input 
                            type="text" 
                            placeholder="Sök moduler..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[var(--bg-main)] border border-[var(--border-strong)] py-3 pl-12 pr-5 text-[10px] text-[var(--ink-main)] font-bold uppercase tracking-widest focus:outline-none focus:border-[var(--accent)]/50 transition-all shadow-inner"
                        />
                    </div>
                    
                    <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-main)] border border-[var(--border-strong)] w-full md:w-auto overflow-x-auto no-scrollbar shadow-inner">
                        <button 
                            onClick={() => setActiveCategory(null)}
                            className={`px-5 py-2 text-[8px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${!activeCategory ? 'bg-[var(--ink-main)] text-white shadow-md' : 'text-[var(--ink-muted)] hover:text-[var(--ink-main)]'}`}
                        >
                            Alla
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2 text-[8px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-[var(--ink-main)] text-white shadow-md' : 'text-[var(--ink-muted)] hover:text-[var(--ink-main)]'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-10">
                {categories.map(cat => {
                    const categoryModules = filteredModules.filter(m => m.category === cat);
                    if (categoryModules.length === 0) return null;
                    
                    return (
                        <div key={cat} className="space-y-5">
                            <div className="flex items-center gap-5">
                                <h2 className="text-[9px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.3em] whitespace-nowrap opacity-60">
                                    {cat}
                                </h2>
                                <div className="h-px flex-grow bg-[var(--border)] opacity-30"></div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {categoryModules.map((mod) => (
                                    <ModuleCard 
                                        key={mod.id}
                                        title={mod.title}
                                        description={mod.description}
                                        icon={mod.icon}
                                        status={mod.status}
                                        category={mod.category}
                                        onClick={() => onNavigate(mod.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
                
                {filteredModules.length === 0 && (
                    <div className="py-20 text-center space-y-5 bg-[var(--bg-card)] rounded-2xl border-2 border-dashed border-[var(--border)] animate-fade-in">
                        <div className="w-16 h-16 bg-[var(--bg-main)] rounded-full flex items-center justify-center mx-auto border border-[var(--border)] shadow-inner">
                            <AlertTriangle className="h-6 w-6 text-[var(--ink-muted)] opacity-20" />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-lg font-bold text-[var(--ink-main)] uppercase">Inga moduler hittades</h3>
                            <p className="text-[9px] text-[var(--ink-muted)] font-bold uppercase tracking-widest opacity-60 max-w-xs mx-auto">
                                Prova att justera din sökning.
                             </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] p-8 space-y-8 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center space-x-5">
                        <div className="p-3 bg-[var(--bg-main)] border border-[var(--border-strong)] shadow-inner">
                            <Activity className="w-6 h-6 text-[var(--ink-main)]" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-[var(--ink-main)] tracking-tight uppercase">Systemtelemetri</h2>
                            <p className="text-[9px] text-[var(--ink-muted)] font-mono font-bold uppercase tracking-widest opacity-60">Realtidsövervakning • Enterprise v1.0</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 bg-[var(--bg-main)] px-6 py-3 border border-[var(--border-strong)] shadow-inner">
                        <HealthStat label="CPU" value="12%" color="text-[var(--ink-main)]" />
                        <div className="w-px h-6 bg-[var(--border-strong)] opacity-30"></div>
                        <HealthStat label="RAM" value="1.4GB" color="text-[var(--ink-main)]" />
                        <div className="w-px h-6 bg-[var(--border-strong)] opacity-30"></div>
                        <HealthStat label="LATENCY" value="24ms" color="text-[var(--ink-main)]" />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                    <div className="bg-[var(--bg-main)] p-6 border border-[var(--border-strong)] space-y-5 shadow-inner">
                        <h4 className="text-[9px] font-bold text-[var(--ink-muted)] uppercase tracking-widest flex items-center gap-2.5 opacity-60">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div>
                            Pipeline Status
                        </h4>
                        <div className="space-y-3.5">
                            <StatusRow label="Normalisering" status="completed" />
                            <StatusRow label="Integritet" status="active" />
                            <StatusRow label="AI-Analys" status="waiting" />
                            <StatusRow label="Kors-korrelering" status="waiting" />
                        </div>
                    </div>
                    
                    <div className="bg-[var(--bg-main)] p-6 border border-[var(--border-strong)] space-y-5 shadow-inner">
                        <h4 className="text-[9px] font-bold text-[var(--ink-muted)] uppercase tracking-widest flex items-center gap-2.5 opacity-60">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div>
                            Datakällor
                        </h4>
                        <div className="space-y-3.5">
                            <SourceRow name="Rättskällor (GOLD)" connected={true} />
                            <SourceRow name="IndexedDB (Local)" connected={true} />
                            <SourceRow name="Gemini API" connected={true} />
                            <SourceRow name="External API" connected={false} />
                        </div>
                    </div>

                    <div className="bg-[var(--ink-main)] p-8 border border-[var(--border-strong)] text-white flex flex-col justify-center items-center text-center shadow-lg group">
                        <p className="text-4xl font-mono font-bold tracking-tight mb-1 group-hover:scale-105 transition-transform duration-700">100%</p>
                        <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Verifierad Kedja</p>
                        <ShieldCheck className="h-6 w-6 text-white/20 mt-4 group-hover:text-[var(--accent)] transition-colors duration-700" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusRow: React.FC<{ label: string, status: 'waiting' | 'active' | 'completed' }> = ({ label, status }) => {
    const icons = {
        waiting: <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--border)]" />,
        active: <Activity className="w-3.5 h-3.5 text-[var(--accent)] animate-pulse" />,
        completed: <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)]" />
    };
    
    const labels = {
        waiting: 'Väntar',
        active: 'Aktiv',
        completed: 'Klar'
    };

    return (
        <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[var(--ink-main)] uppercase tracking-widest">{label}</span>
            <div className="flex items-center space-x-2.5">
                <span className={`text-[8px] font-bold uppercase tracking-widest ${status === 'completed' ? 'text-[var(--success)]' : status === 'active' ? 'text-[var(--accent)]' : 'text-[var(--ink-muted)]'}`}>
                    {labels[status]}
                </span>
                {icons[status]}
            </div>
        </div>
    );
};

const SourceRow: React.FC<{ name: string, connected: boolean }> = ({ name, connected }) => (
    <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-[var(--ink-main)] uppercase tracking-widest">{name}</span>
        <div className="flex items-center space-x-2">
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'}`}></div>
            <span className={`text-[8px] font-bold uppercase tracking-widest ${connected ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {connected ? 'Ansluten' : 'Offline'}
            </span>
        </div>
    </div>
);

const HealthStat: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
    <div className="text-right">
        <p className="text-[8px] font-bold text-[var(--ink-muted)] uppercase tracking-widest opacity-60 mb-0.5">{label}</p>
        <p className={`text-lg font-bold ${color} tracking-tight`}>{value}</p>
    </div>
);

const AuditLog: React.FC<{ time: string, msg: string, type: 'success' | 'info' | 'warning' }> = ({ time, msg, type }) => (
    <div className="flex items-center space-x-4 text-[10px] font-mono">
        <span className="text-[var(--ink-muted)] opacity-60">{time}</span>
        <span className={type === 'success' ? 'text-[var(--success)]' : type === 'warning' ? 'text-[var(--warning)]' : 'text-[var(--accent)]'}>●</span>
        <span className="text-[var(--ink-main)] truncate font-black uppercase tracking-wider">{msg}</span>
    </div>
);

const ExpertStatus: React.FC<{ name: string, status: string }> = ({ name, status }) => (
    <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] opacity-60">{name}</span>
        <span className="text-[10px] font-black text-[var(--success)] uppercase tracking-[0.3em]">{status}</span>
    </div>
);
