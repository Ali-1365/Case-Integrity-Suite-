
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
    MagnifyingGlassIcon,
    ChatIcon,
    CodeBracketIcon,
    AdjustmentsHorizontalIcon,
    ClipboardDocumentListIcon,
    MagnifyingGlassIcon as SearchIcon
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
        className="group relative bg-[#111111] border border-gray-800 rounded-3xl p-6 text-left hover:border-gray-600 transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden flex flex-col h-full"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${color}`}>
            {icon}
        </div>
        
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-opacity-10 border border-opacity-20 ${color.replace('text-', 'bg-').replace('text-', 'border-')}`}>
                {React.cloneElement(icon as React.ReactElement<any>, { className: `w-6 h-6 ${color}` })}
            </div>
            <div className="flex flex-col items-end space-y-1">
                <div className="flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'} animate-pulse`}></span>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{status}</span>
                </div>
                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{category}</span>
            </div>
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-grow">{description}</p>
        
        <div className="mt-6 flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
            <span>Öppna Modul</span>
            <BoltIcon className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
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
            id: 'chat',
            title: 'Beslutsmotor',
            description: 'Interaktiv AI-rådgivare för komplexa juridiska frågeställningar.',
            icon: <ChatIcon />,
            status: 'active' as const,
            color: 'text-cyan-400',
            category: 'Expertis'
        },
        {
            id: 'production',
            title: 'Juridisk Textproduktion',
            description: 'Exekverande verktyg för domstolsklara processkrifter enligt RB.',
            icon: <ScaleIcon />,
            status: 'active' as const,
            color: 'text-indigo-400',
            category: 'Expertis'
        },
        {
            id: 'opinion',
            title: 'AI-Expert (Yttranden)',
            description: 'Generera juridiska yttranden med 8-stegs bevisvärdering och SHA-256.',
            icon: <SparklesIcon />,
            status: 'active' as const,
            color: 'text-purple-400',
            category: 'Expertis'
        },
        {
            id: 'duel',
            title: 'Adversarial Duel',
            description: 'Simulera rättsprocesser mot en fientlig AI-motpart.',
            icon: <ExclamationTriangleIcon />,
            status: 'active' as const,
            color: 'text-rose-400',
            category: 'Expertis'
        },
        {
            id: 'profiler',
            title: 'Case Profiler',
            description: 'Sammanställning av nyckelinformation och riskprofiler för valda ärenden.',
            icon: <UserGroupIcon />,
            status: 'active' as const,
            color: 'text-purple-400',
            category: 'Analys'
        },
        {
            id: 'agent',
            title: 'Analys & Utredning',
            description: 'Djupgående analys av bevisatomer och rättsliga förhållanden.',
            icon: <MagnifyingGlassIcon />,
            status: 'active' as const,
            color: 'text-blue-400',
            category: 'Analys'
        },
        {
            id: 'pipeline',
            title: 'Legal Pipeline',
            description: 'Övervaka de 8 stegen i den juridiska analysprocessen.',
            icon: <ActivityIcon />,
            status: 'active' as const,
            color: 'text-blue-400',
            category: 'Analys'
        },
        {
            id: 'integrity',
            title: 'Forensisk Integritet',
            description: 'Verifiera dataatomer och integritetskedjor (SHA-256).',
            icon: <FingerPrintIcon />,
            status: 'active' as const,
            color: 'text-emerald-400',
            category: 'Integritet'
        },
        {
            id: 'audit',
            title: 'Audit & Compliance',
            description: 'Granska systemloggar och efterlevnad av juridiska standarder.',
            icon: <ShieldCheckIcon />,
            status: 'active' as const,
            color: 'text-indigo-400',
            category: 'Integritet'
        },
        {
            id: 'notary',
            title: 'Processnotarie',
            description: 'Automatiserad protokollföring och tidsstämpling av händelser.',
            icon: <ClipboardDocumentListIcon />,
            status: 'active' as const,
            color: 'text-cyan-400',
            category: 'Integritet'
        },
        {
            id: 'sfb',
            title: 'SFB Integritet',
            description: 'Särskild kontrollmodul för Socialförsäkringsbalken.',
            icon: <ShieldCheckIcon />,
            status: 'active' as const,
            color: 'text-emerald-400',
            category: 'Integritet'
        },
        {
            id: 'archive',
            title: 'Archive Core',
            description: 'Utforska det historiska arkivet och lagrade rättskällor.',
            icon: <ArchiveBoxIcon />,
            status: 'active' as const,
            color: 'text-stone-400',
            category: 'System'
        },
        {
            id: 'framework',
            title: 'Juridisk Ramverk',
            description: 'Bibliotek av lagar, förordningar och GOLD-standard data.',
            icon: <LawIcon />,
            status: 'active' as const,
            color: 'text-indigo-400',
            category: 'System'
        },
        {
            id: 'whitebook',
            title: 'Vitbok',
            description: 'Systemets dokumentation och metodbeskrivningar.',
            icon: <ClipboardDocumentListIcon />,
            status: 'active' as const,
            color: 'text-slate-400',
            category: 'System'
        },
        {
            id: 'oracle',
            title: 'Oracle Core',
            description: 'Insyn i systemets centrala resonemangslogik och parametrar.',
            icon: <CpuChipIcon />,
            status: 'active' as const,
            color: 'text-amber-400',
            category: 'System'
        },
        {
            id: 'monitor',
            title: 'System Monitor',
            description: 'Realtidsövervakning av resursanvändning och API-hälsa.',
            icon: <ActivityIcon />,
            status: 'active' as const,
            color: 'text-emerald-400',
            category: 'System'
        },
        {
            id: 'inventory',
            title: 'System Inventory',
            description: 'Inventering av systemkomponenter och versioner.',
            icon: <ClipboardDocumentListIcon />,
            status: 'active' as const,
            color: 'text-slate-400',
            category: 'System'
        },
        {
            id: 'controller',
            title: 'Kontrollpanel',
            description: 'Globala systeminställningar och konfiguration.',
            icon: <AdjustmentsHorizontalIcon />,
            status: 'active' as const,
            color: 'text-amber-400',
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
        <div className="space-y-10 animate-in fade-in duration-500">
            <header className="relative py-12 px-10 bg-[#111111] rounded-[3rem] border border-gray-800 overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                    <CpuChipIcon className="w-64 h-64 text-cyan-400" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">
                        System Control Hub <span className="text-cyan-500">v.7.5</span>
                    </h1>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.3em] max-w-2xl">
                        Central orkestrering av forensiska moduler, AI-experter och juridiska exekveringsmotorer.
                    </p>
                </div>
            </header>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111111] p-6 rounded-[2rem] border border-gray-800">
                <div className="relative flex-1 max-w-md">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Sök efter moduler..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                </div>
                
                <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    <button 
                        onClick={() => setActiveCategory(null)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!activeCategory ? 'bg-cyan-500 text-black' : 'bg-[#0a0a0a] text-gray-500 border border-gray-800 hover:border-gray-600'}`}
                    >
                        Alla
                    </button>
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-cyan-500 text-black' : 'bg-[#0a0a0a] text-gray-500 border border-gray-800 hover:border-gray-600'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredModules.map(mod => (
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
                {filteredModules.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-[#111111] rounded-[2rem] border border-dashed border-gray-800">
                        <ExclamationTriangleIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest">Inga moduler matchar din sökning</p>
                    </div>
                )}
            </div>

            <div className="bg-[#0a0a0a] border border-gray-800 rounded-[2.5rem] p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                            <ActivityIcon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-tight">System Health & Telemetry</h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Realtidsövervakning av alla noder</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <HealthStat label="CPU" value="12%" color="text-emerald-400" />
                        <HealthStat label="RAM" value="1.4GB" color="text-emerald-400" />
                        <HealthStat label="LATENCY" value="24ms" color="text-emerald-400" />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Senaste Audit-Händelser</h4>
                        <div className="space-y-3">
                            <AuditLog time="17:34" msg="SHA-256 Verifiering OK" type="success" />
                            <AuditLog time="17:30" msg="RB-Pipeline Steg 8 Slutfört" type="success" />
                            <AuditLog time="17:25" msg="Integritetskontroll Atom-442" type="info" />
                        </div>
                    </div>
                    <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">AI-Expert Status</h4>
                        <div className="space-y-3">
                            <ExpertStatus name="Advokat-Agent" status="IDLE" />
                            <ExpertStatus name="Opinion-Expert" status="READY" />
                            <ExpertStatus name="Adjudicator" status="STANDBY" />
                        </div>
                    </div>
                    <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Databasintegritet</h4>
                        <div className="flex items-center justify-center h-24">
                            <div className="text-center">
                                <p className="text-3xl font-black text-emerald-400 tracking-tighter">100%</p>
                                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-1">Verified Chain</p>
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
