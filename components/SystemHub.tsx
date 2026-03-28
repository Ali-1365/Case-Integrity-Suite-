
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
        className="group bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 text-left hover:border-[var(--accent)]/30 hover:shadow-2xl transition-all flex flex-col h-full relative overflow-hidden active:scale-[0.98]"
    >
        {/* Decorative background element */}
        <div className="absolute -right-6 -bottom-6 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000">
            {React.cloneElement(icon as React.ReactElement<any>, { className: "w-32 h-32" })}
        </div>

        <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="p-4 rounded-[1.25rem] bg-[var(--bg-main)] border border-[var(--border)] text-[var(--ink-muted)] group-hover:text-[var(--accent)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                {React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" })}
            </div>
            <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-[var(--success)] shadow-[0_0_8px_rgba(var(--success-rgb),0.5)]' : status === 'warning' ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]'}`}></span>
                    <span className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] opacity-60">{status}</span>
                </div>
                <span className="text-[8px] font-black text-[var(--accent)] bg-[var(--accent)]/5 px-3 py-1 rounded-full border border-[var(--accent)]/10 uppercase tracking-[0.2em]">{category}</span>
            </div>
        </div>
        
        <div className="space-y-3 flex-grow relative z-10">
            <h3 className="text-xl font-black text-[var(--ink-main)] tracking-tighter leading-tight group-hover:text-[var(--accent)] transition-all font-serif italic uppercase">
                {title}
            </h3>
            <p className="text-[11px] text-[var(--ink-muted)] font-black uppercase tracking-[0.05em] leading-relaxed line-clamp-2 opacity-70">
                {description}
            </p>
        </div>
        
        <div className="mt-6 pt-6 border-t border-[var(--border)] flex items-center justify-end relative z-10">
            <div className="flex items-center text-[9px] font-black text-[var(--accent)] uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                <span>Öppna Modul</span>
                <ArrowRight className="w-3 h-3 ml-2" />
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
            id: 'audit',
            title: 'Audit & Compliance',
            description: 'Granska systemloggar och efterlevnad av juridiska standarder.',
            icon: <ShieldCheck />,
            status: 'active' as const,
            category: 'Integritet'
        },
        {
            id: 'notary',
            title: 'Processnotarie',
            description: 'Automatiserad protokollföring och tidsstämpling av händelser.',
            icon: <ClipboardList />,
            status: 'active' as const,
            category: 'Integritet'
        },
        {
            id: 'sfb',
            title: 'SFB Integritet',
            description: 'Särskild kontrollmodul för Socialförsäkringsbalken.',
            icon: <ShieldCheck />,
            status: 'active' as const,
            category: 'Integritet'
        },
        {
            id: 'vision',
            title: 'Vision & Tillgänglighet',
            description: 'Vår filosofi kring inkludering, kvalitet och långsiktig affärsnytta.',
            icon: <HelpCircle />,
            status: 'active' as const,
            category: 'System'
        },
        {
            id: 'archive',
            title: 'Archive Core',
            description: 'Utforska det historiska arkivet och lagrade rättskällor.',
            icon: <Archive />,
            status: 'active' as const,
            category: 'System'
        },
        {
            id: 'framework',
            title: 'Juridisk Ramverk',
            description: 'Bibliotek av lagar, förordningar och GOLD-standard data.',
            icon: <Scale />,
            status: 'active' as const,
            category: 'System'
        },
        {
            id: 'whitebook',
            title: 'Vitbok',
            description: 'Systemets dokumentation och metodbeskrivningar.',
            icon: <ClipboardList />,
            status: 'active' as const,
            category: 'System'
        },
        {
            id: 'oracle',
            title: 'Oracle Core',
            description: 'Insyn i systemets centrala resonemangslogik och parametrar.',
            icon: <Cpu />,
            status: 'active' as const,
            category: 'System'
        },
        {
            id: 'monitor',
            title: 'System Monitor',
            description: 'Realtidsövervakning av resursanvändning och API-hälsa.',
            icon: <Activity />,
            status: 'active' as const,
            category: 'System'
        },
        {
            id: 'inventory',
            title: 'System Inventory',
            description: 'Inventering av systemkomponenter och versioner.',
            icon: <ClipboardList />,
            status: 'active' as const,
            category: 'System'
        },
        {
            id: 'controller',
            title: 'Kontrollpanel',
            description: 'Globala systeminställningar och konfiguration.',
            icon: <Settings2 />,
            status: 'active' as const,
            category: 'System'
        }
    ], []);

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
        <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
            <header className="py-12 px-10 bg-[var(--bg-card)] border border-[var(--border)] rounded-[3rem] shadow-sm relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute -right-20 -top-20 opacity-[0.03] rotate-12">
                    <LayoutDashboard className="w-96 h-96" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black tracking-[0.4em] text-[var(--ink-muted)] uppercase opacity-60">System Hub v1.0</span>
                            <div className="h-px w-12 bg-[var(--border)]"></div>
                        </div>
                        <h1 className="text-5xl font-black text-[var(--ink-main)] tracking-tighter font-serif italic uppercase">
                            Operativ Kontrollpanel
                        </h1>
                        <p className="text-[11px] text-[var(--ink-muted)] max-w-xl font-black uppercase tracking-[0.1em] leading-relaxed opacity-70">
                            Centraliserad orkestrering av forensiska moduler och AI-experter.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="px-6 py-4 rounded-[1.5rem] bg-[var(--bg-main)] border border-[var(--border)] flex items-center gap-4 shadow-inner">
                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)] shadow-[0_0_10px_rgba(var(--success-rgb),0.5)]"></div>
                            <div>
                                <p className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] opacity-60">Status</p>
                                <p className="text-[11px] font-black text-[var(--ink-main)] uppercase tracking-[0.1em]">Operativ</p>
                            </div>
                        </div>
                        <div className="px-6 py-4 rounded-[1.5rem] bg-[var(--bg-main)] border border-[var(--border)] flex items-center gap-4 shadow-inner">
                            <ShieldCheck className="h-5 w-5 text-[var(--accent)]" />
                            <div>
                                <p className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] opacity-60">Säkerhet</p>
                                <p className="text-[11px] font-black text-[var(--ink-main)] uppercase tracking-[0.1em]">Verifierad</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="sticky top-24 z-40">
                <div className="p-3 rounded-[2rem] bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border)] shadow-2xl flex flex-col md:flex-row items-center gap-3">
                    <div className="relative flex-grow w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--ink-muted)] opacity-40" />
                        <input 
                            type="text" 
                            placeholder="Sök moduler..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-[1.25rem] py-4 pl-14 pr-6 text-[11px] text-[var(--ink-main)] font-black uppercase tracking-[0.1em] focus:outline-none focus:border-[var(--accent)]/50 transition-all shadow-inner"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-main)] rounded-[1.25rem] border border-[var(--border)] w-full md:w-auto overflow-x-auto no-scrollbar shadow-inner">
                        <button 
                            onClick={() => setActiveCategory(null)}
                            className={`px-6 py-2.5 rounded-[1rem] text-[9px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${!activeCategory ? 'bg-[var(--ink-main)] text-white shadow-lg' : 'text-[var(--ink-muted)] hover:text-[var(--ink-main)]'}`}
                        >
                            Alla
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-2.5 rounded-[1rem] text-[9px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-[var(--ink-main)] text-white shadow-lg' : 'text-[var(--ink-muted)] hover:text-[var(--ink-main)]'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-16">
                {categories.map(cat => {
                    const categoryModules = filteredModules.filter(m => m.category === cat);
                    if (categoryModules.length === 0) return null;
                    
                    return (
                        <div key={cat} className="space-y-8">
                            <div className="flex items-center gap-6">
                                <h2 className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.4em] whitespace-nowrap opacity-60">
                                    {cat}
                                </h2>
                                <div className="h-px flex-grow bg-[var(--border)] opacity-30"></div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                    <div className="py-32 text-center space-y-8 bg-[var(--bg-card)] rounded-[3rem] border-2 border-dashed border-[var(--border)] animate-in fade-in duration-1000">
                        <div className="w-24 h-24 bg-[var(--bg-main)] rounded-full flex items-center justify-center mx-auto border border-[var(--border)] shadow-inner">
                            <AlertTriangle className="h-10 w-10 text-[var(--ink-muted)] opacity-20" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-[var(--ink-main)] font-serif italic uppercase">Inga moduler hittades</h3>
                            <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-[0.2em] opacity-60 max-w-xs mx-auto">
                                Prova att justera din sökning.
                             </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[3rem] p-12 space-y-12 shadow-sm relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute -right-20 -bottom-20 opacity-[0.02] rotate-12">
                    <Activity className="w-96 h-96" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center space-x-6">
                        <div className="p-5 bg-[var(--bg-main)] rounded-[1.5rem] border border-[var(--border)] shadow-inner">
                            <Activity className="w-8 h-8 text-[var(--ink-main)]" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-[var(--ink-main)] tracking-tighter font-serif italic uppercase">Systemtelemetri</h2>
                            <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-[0.3em] opacity-60">Realtidsövervakning</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-10 bg-[var(--bg-main)] px-10 py-6 rounded-[2rem] border border-[var(--border)] shadow-inner">
                        <HealthStat label="CPU" value="12%" color="text-[var(--ink-main)]" />
                        <div className="w-px h-10 bg-[var(--border)] opacity-30"></div>
                        <HealthStat label="RAM" value="1.4GB" color="text-[var(--ink-main)]" />
                        <div className="w-px h-10 bg-[var(--border)] opacity-30"></div>
                        <HealthStat label="LATENCY" value="24ms" color="text-[var(--ink-main)]" />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
                    <div className="bg-[var(--bg-main)] p-8 rounded-[2rem] border border-[var(--border)] space-y-6 shadow-inner">
                        <h4 className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] flex items-center gap-3 opacity-60">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div>
                            Senaste Händelser
                        </h4>
                        <div className="space-y-4">
                            <AuditLog time="14:07" msg="SHA-256 Verifiering OK" type="success" />
                            <AuditLog time="14:02" msg="RB-Pipeline Steg 8 OK" type="success" />
                            <AuditLog time="13:58" msg="Integritetskontroll" type="info" />
                        </div>
                    </div>
                    <div className="bg-[var(--bg-main)] p-8 rounded-[2rem] border border-[var(--border)] space-y-6 shadow-inner">
                        <h4 className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] flex items-center gap-3 opacity-60">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div>
                            AI-Status
                        </h4>
                        <div className="space-y-4">
                            <ExpertStatus name="Advokat-Agent" status="IDLE" />
                            <ExpertStatus name="Opinion-Expert" status="READY" />
                            <ExpertStatus name="Adjudicator" status="STANDBY" />
                        </div>
                    </div>
                    <div className="bg-[var(--ink-main)] p-10 rounded-[2rem] border border-[var(--border)] text-white flex flex-col justify-center items-center text-center shadow-2xl group">
                        <p className="text-5xl font-black tracking-tighter mb-2 font-serif italic group-hover:scale-110 transition-transform duration-700">100%</p>
                        <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.3em]">Verifierad Kedja</p>
                        <ShieldCheck className="h-8 w-8 text-white/20 mt-6 group-hover:text-[var(--accent)] transition-colors duration-700" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const HealthStat: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
    <div className="text-right">
        <p className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-[0.3em] opacity-60 mb-1">{label}</p>
        <p className={`text-xl font-black ${color} tracking-tighter font-serif italic`}>{value}</p>
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
