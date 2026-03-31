
import React from 'react';
import { 
    LayoutDashboard, 
    ShieldCheck, 
    Cpu, 
    Zap, 
    Fingerprint, 
    Activity, 
    Search, 
    MessageSquare,
    Settings2,
    AlertTriangle,
    Archive
} from 'lucide-react';

interface Module {
    id: string;
    label: string;
    icon: React.ReactNode;
    desc: string;
    color: string;
}

interface ModuleConnectorProps {
    activeModule: string;
    onNavigate?: (moduleId: string) => void;
}

const modules: Module[] = [
    { id: 'hub', label: 'System Hub', icon: <LayoutDashboard className="w-5 h-5" />, desc: 'Central kontroll', color: 'var(--accent)' },
    { id: 'integrity', label: 'Forensisk Integritet', icon: <Fingerprint className="w-5 h-5" />, desc: 'Bevisverifiering', color: 'var(--success)' },
    { id: 'oracle', label: 'Oracle Core', icon: <Cpu className="w-5 h-5" />, desc: 'AI-slutledning', color: 'var(--accent)' },
    { id: 'duel', label: 'Adversarial Duel', icon: <AlertTriangle className="w-5 h-5" />, desc: 'Motpartsanalys', color: 'var(--danger)' },
    { id: 'production', label: 'Produktion', icon: <Zap className="w-5 h-5" />, desc: 'Textgenerering', color: 'var(--warning)' },
    { id: 'agent', label: 'Analys', icon: <Search className="w-5 h-5" />, desc: 'Ärendeutredning', color: 'var(--accent)' },
    { id: 'chat', label: 'Beslutsmotor', icon: <MessageSquare className="w-5 h-5" />, desc: 'Interaktiv hjälp', color: 'var(--accent)' },
    { id: 'controller', label: 'FMJAM Controller', icon: <Settings2 className="w-5 h-5" />, desc: 'Systemparametrar', color: 'var(--accent)' },
    { id: 'archive', label: 'Arkiv', icon: <Archive className="w-5 h-5" />, desc: 'Ärendehantering', color: 'var(--ink-muted)' },
];

export const ModuleConnector: React.FC<ModuleConnectorProps> = ({ activeModule, onNavigate }) => {
    const relatedModules = modules.filter(m => m.id !== activeModule).slice(0, 4);

    return (
        <div className="mt-20 pt-10 border-t-2 border-[var(--border-strong)]">
            <div className="flex items-center gap-4 mb-8">
                <Activity className="w-5 h-5 text-[var(--accent)]" />
                <h4 className="text-sm font-black uppercase tracking-[0.3em] italic text-[var(--ink-main)]">Relaterade Moduler</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedModules.map((module) => (
                    <button
                        key={module.id}
                        onClick={() => onNavigate?.(module.id)}
                        className="p-6 bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-xl hover:border-[var(--accent)] transition-all group text-left relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: module.color }}></div>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-2 bg-[var(--bg-main)] border border-[var(--border-strong)] text-[var(--ink-main)] group-hover:scale-110 transition-transform">
                                {module.icon}
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest italic text-[var(--ink-main)]">{module.label}</span>
                        </div>
                        <p className="text-[10px] text-[var(--ink-muted)] font-black uppercase tracking-widest opacity-60">{module.desc}</p>
                        
                        <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                            <div className="w-16 h-16">{module.icon}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
