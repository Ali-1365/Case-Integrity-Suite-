
import React, { useState, useMemo } from 'react';
import { 
    BoltIcon, 
    CpuChipIcon, 
    ShieldCheckIcon, 
    DocumentTextIcon, 
    ActivityIcon, 
    LawIcon,
    SparklesIcon,
    ArchiveBoxIcon,
    UserGroupIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    ScaleIcon,
    FingerPrintIcon,
    ChatIcon,
    CodeBracketIcon,
    AdjustmentsHorizontalIcon,
    ClipboardDocumentListIcon,
    MagnifyingGlassIcon as SearchIcon,
    BanknotesIcon,
    LogoIcon
} from './icons';

interface ModuleCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    status: 'active' | 'warning' | 'error';
    onClick: () => void;
    color: string;
    category: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ title, description, icon, status, onClick, color, category }) => (
    <button 
        onClick={onClick}
        className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 text-left hover:border-blue-500/30 transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] overflow-hidden flex flex-col h-full shadow-xl"
    >
        <div className={`absolute top-0 right-0 w-48 h-48 -mr-12 -mt-12 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 group-hover:scale-150 ${color}`}>
            {icon}
        </div>
        
        <div className="flex justify-between items-start mb-8 relative z-10">
            <div className={`p-4 rounded-2xl bg-opacity-10 border border-opacity-20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${color.replace('text-', 'bg-').replace('text-', 'border-')}`}>
                {React.cloneElement(icon as React.ReactElement<any>, { className: `w-8 h-8 ${color}` })}
            </div>
            <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'} animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]`}></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{status}</span>
                </div>
                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 uppercase tracking-widest">{category}</span>
            </div>
        </div>
        
        <div className="space-y-3 flex-grow relative z-10">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-3">
                {description}
            </p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between relative z-10">
            <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800"></div>
                ))}
            </div>
            <div className="flex items-center text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest group-hover:translate-x-0 translate-x-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span>Öppna Modul</span>
                <BoltIcon className="w-3 h-3 ml-2" />
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
            icon: <BanknotesIcon />,
            status: 'active' as const,
            color: 'text-emerald-500',
            category: 'Expertis'
        },
        {
            id: 'chat',
            title: 'Beslutsmotor',
            description: 'Interaktiv AI-rådgivare för komplexa juridiska frågeställningar.',
            icon: <ChatIcon />,
            status: 'active' as const,
            color: 'text-blue-500',
            category: 'Expertis'
        },
        {
            id: 'production',
            title: 'Juridisk Textproduktion',
            description: 'Exekverande verktyg för domstolsklara processkrifter enligt RB.',
            icon: <ScaleIcon />,
            status: 'active' as const,
            color: 'text-indigo-500',
            category: 'Expertis'
        },
        {
            id: 'opinion',
            title: 'AI-Expert (Yttranden)',
            description: 'Generera juridiska yttranden med 8-stegs bevisvärdering och SHA-256.',
            icon: <SparklesIcon />,
            status: 'active' as const,
            color: 'text-purple-500',
            category: 'Expertis'
        },
        {
            id: 'duel',
            title: 'Adversarial Duel',
            description: 'Simulera rättsprocesser mot en fientlig AI-motpart.',
            icon: <ExclamationTriangleIcon />,
            status: 'active' as const,
            color: 'text-rose-500',
            category: 'Expertis'
        },
        {
            id: 'profiler',
            title: 'Case Profiler',
            description: 'Sammanställning av nyckelinformation och riskprofiler för valda ärenden.',
            icon: <UserGroupIcon />,
            status: 'active' as const,
            color: 'text-purple-500',
            category: 'Analys'
        },
        {
            id: 'agent',
            title: 'Analys & Utredning',
            description: 'Djupgående analys av bevisatomer och rättsliga förhållanden.',
            icon: <SearchIcon />,
            status: 'active' as const,
            color: 'text-blue-500',
            category: 'Analys'
        },
        {
            id: 'pipeline',
            title: 'Legal Pipeline',
            description: 'Övervaka de 8 stegen i den juridiska analysprocessen.',
            icon: <ActivityIcon />,
            status: 'active' as const,
            color: 'text-blue-500',
            category: 'Analys'
        },
        {
            id: 'integrity',
            title: 'Forensisk Integritet',
            description: 'Verifiera dataatomer och integritetskedjor (SHA-256).',
            icon: <FingerPrintIcon />,
            status: 'active' as const,
            color: 'text-emerald-500',
            category: 'Integritet'
        },
        {
            id: 'audit',
            title: 'Audit & Compliance',
            description: 'Granska systemloggar och efterlevnad av juridiska standarder.',
            icon: <ShieldCheckIcon />,
            status: 'active' as const,
            color: 'text-indigo-500',
            category: 'Integritet'
        },
        {
            id: 'notary',
            title: 'Processnotarie',
            description: 'Automatiserad protokollföring och tidsstämpling av händelser.',
            icon: <ClipboardDocumentListIcon />,
            status: 'active' as const,
            color: 'text-cyan-500',
            category: 'Integritet'
        },
        {
            id: 'sfb',
            title: 'SFB Integritet',
            description: 'Särskild kontrollmodul för Socialförsäkringsbalken.',
            icon: <ShieldCheckIcon />,
            status: 'active' as const,
            color: 'text-emerald-500',
            category: 'Integritet'
        },
        {
            id: 'archive',
            title: 'Archive Core',
            description: 'Utforska det historiska arkivet och lagrade rättskällor.',
            icon: <ArchiveBoxIcon />,
            status: 'active' as const,
            color: 'text-slate-500',
            category: 'System'
        },
        {
            id: 'framework',
            title: 'Juridisk Ramverk',
            description: 'Bibliotek av lagar, förordningar och GOLD-standard data.',
            icon: <LawIcon />,
            status: 'active' as const,
            color: 'text-indigo-500',
            category: 'System'
        },
        {
            id: 'whitebook',
            title: 'Vitbok',
            description: 'Systemets dokumentation och metodbeskrivningar.',
            icon: <ClipboardDocumentListIcon />,
            status: 'active' as const,
            color: 'text-slate-500',
            category: 'System'
        },
        {
            id: 'oracle',
            title: 'Oracle Core',
            description: 'Insyn i systemets centrala resonemangslogik och parametrar.',
            icon: <CpuChipIcon />,
            status: 'active' as const,
            color: 'text-amber-500',
            category: 'System'
        },
        {
            id: 'monitor',
            title: 'System Monitor',
            description: 'Realtidsövervakning av resursanvändning och API-hälsa.',
            icon: <ActivityIcon />,
            status: 'active' as const,
            color: 'text-emerald-500',
            category: 'System'
        },
        {
            id: 'inventory',
            title: 'System Inventory',
            description: 'Inventering av systemkomponenter och versioner.',
            icon: <ClipboardDocumentListIcon />,
            status: 'active' as const,
            color: 'text-slate-500',
            category: 'System'
        },
        {
            id: 'controller',
            title: 'Kontrollpanel',
            description: 'Globala systeminställningar och konfiguration.',
            icon: <AdjustmentsHorizontalIcon />,
            status: 'active' as const,
            color: 'text-amber-500',
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans selection:bg-blue-500/30">
            <header className="relative py-16 px-12 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] group-hover:bg-blue-500/20 transition-all duration-1000"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-1000"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                                <LogoIcon className="h-8 w-8 text-white" />
                            </div>
                            <span className="text-xs font-black tracking-[0.3em] text-blue-600 dark:text-blue-400 uppercase">System Hub v8.0</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[0.9]">
                            Operativ <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">Kontrollpanel</span>
                        </h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl font-medium leading-relaxed">
                            Centraliserad orkestrering av forensiska moduler, AI-experter och juridiska exekveringsmotorer.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Systemstatus</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Operativ & Säkrad</p>
                            </div>
                        </div>
                        <div className="px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                            <ShieldCheckIcon className="h-6 w-6 text-blue-500" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Säkerhetsnivå</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">FMJAM-LOCKED</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="sticky top-4 z-40 space-y-4">
                <div className="p-3 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-3">
                    <div className="relative flex-grow w-full">
                        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Sök efter moduler eller funktioner..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl py-4 pl-14 pr-6 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 w-full md:w-auto overflow-x-auto no-scrollbar">
                        <button 
                            onClick={() => setActiveCategory(null)}
                            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${!activeCategory ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                        >
                            Alla Moduler
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
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
                            <div className="flex items-center gap-4">
                                <div className="h-px flex-grow bg-slate-200 dark:bg-slate-800"></div>
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap bg-slate-50 dark:bg-slate-950 px-4 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                                    {cat}
                                </h2>
                                <div className="h-px flex-grow bg-slate-200 dark:bg-slate-800"></div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {categoryModules.map((mod) => (
                                    <ModuleCard 
                                        key={mod.id}
                                        title={mod.title}
                                        description={mod.description}
                                        icon={mod.icon}
                                        status={mod.status}
                                        color={mod.color}
                                        category={mod.category}
                                        onClick={() => onNavigate(mod.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
                
                {filteredModules.length === 0 && (
                    <div className="py-24 text-center space-y-6 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 border-dashed">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                            <ExclamationTriangleIcon className="h-10 w-10 text-slate-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Inga moduler hittades</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">
                                Prova att justera din sökning eller välj en annan kategori.
                             </p>
                        </div>
                        <button 
                            onClick={() => { setSearchQuery(''); setActiveCategory(null); }}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all active:scale-95"
                        >
                            Visa alla moduler
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 shadow-xl space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center space-x-5">
                        <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <ActivityIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">System Health & Telemetry</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Realtidsövervakning av alla noder</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                        <HealthStat label="CPU" value="12%" color="text-emerald-500" />
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
                        <HealthStat label="RAM" value="1.4GB" color="text-emerald-500" />
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
                        <HealthStat label="LATENCY" value="24ms" color="text-emerald-500" />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            Senaste Audit-Händelser
                        </h4>
                        <div className="space-y-4">
                            <AuditLog time="14:07" msg="SHA-256 Verifiering OK" type="success" />
                            <AuditLog time="14:02" msg="RB-Pipeline Steg 8 Slutfört" type="success" />
                            <AuditLog time="13:58" msg="Integritetskontroll Atom-442" type="info" />
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            AI-Expert Status
                        </h4>
                        <div className="space-y-4">
                            <ExpertStatus name="Advokat-Agent" status="IDLE" />
                            <ExpertStatus name="Opinion-Expert" status="READY" />
                            <ExpertStatus name="Adjudicator" status="STANDBY" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20 flex flex-col justify-center items-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <p className="text-4xl font-black tracking-tighter mb-1">100%</p>
                            <p className="text-[10px] text-blue-100 font-bold uppercase tracking-[0.2em]">Verified Chain</p>
                            <div className="mt-4 flex justify-center">
                                <ShieldCheckIcon className="h-10 w-10 text-white/50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HealthStat: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
    <div className="text-right">
        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{label}</p>
        <p className={`text-sm font-black ${color} tracking-tight`}>{value}</p>
    </div>
);

const AuditLog: React.FC<{ time: string, msg: string, type: 'success' | 'info' | 'warning' }> = ({ time, msg, type }) => (
    <div className="flex items-center space-x-3 text-[10px] font-mono">
        <span className="text-gray-700">{time}</span>
        <span className={type === 'success' ? 'text-emerald-500' : type === 'warning' ? 'text-amber-500' : 'text-cyan-500'}>●</span>
        <span className="text-gray-400 truncate">{msg}</span>
    </div>
);

const ExpertStatus: React.FC<{ name: string, status: string }> = ({ name, status }) => (
    <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{name}</span>
        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{status}</span>
    </div>
);
