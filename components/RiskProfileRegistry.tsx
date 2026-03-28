import React from 'react';
import { riskTemplateRegistry } from '../data/riskTemplateRegistry';
import Card from './shared/Card';
import { ShieldCheck, AlertTriangle, Fingerprint } from 'lucide-react';

const RiskProfileRegistry: React.FC = () => {
    return (
        <Card title="Gällande Riskmallar (v.6.2.2-GOLD)" icon={<ShieldCheck className="w-5 h-5" />}>
            <div className="space-y-6">
                {riskTemplateRegistry.map(template => (
                    <div key={template.id} className="p-6 bg-[var(--bg-main)]/50 border border-[var(--border)] rounded-[2rem] hover:bg-[var(--bg-main)] transition-all group shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-colors">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                                <h4 className="font-bold text-[var(--ink-main)] font-serif text-lg">{template.name}</h4>
                            </div>
                            <div className="flex items-center space-x-2 bg-[var(--bg-card)] px-3 py-1 rounded-full border border-[var(--border)]">
                                <Fingerprint className="w-3 h-3 text-[var(--accent)]" />
                                <span className="text-[9px] font-mono text-[var(--ink-muted)] uppercase tracking-widest">SFS 2025:400 COMPLIANT</span>
                            </div>
                        </div>
                        <p className="text-sm text-[var(--ink-muted)] mb-6 leading-relaxed font-medium italic">
                            {template.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {template.triggers.keywords?.slice(0, 5).map(k => (
                                <span key={k} className="text-[9px] bg-[var(--bg-card)] border border-[var(--border)] px-3 py-1 rounded-xl text-[var(--ink-muted)] uppercase font-black tracking-widest shadow-inner">
                                    #{k}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default RiskProfileRegistry;
