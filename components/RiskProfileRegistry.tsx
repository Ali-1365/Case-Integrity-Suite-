import React from 'react';
import { riskTemplateRegistry } from '../data/riskTemplateRegistry';
import Card from './shared/Card';
import { AlertIcon, ShieldCheckIcon } from './icons';

const RiskProfileRegistry: React.FC = () => {
    return (
        <Card title="Gällande Riskmallar (v.6.2.2-GOLD)" icon={<ShieldCheckIcon />}>
            <div className="space-y-4">
                {riskTemplateRegistry.map(template => (
                    <div key={template.id} className="p-4 bg-gray-800/40 border border-gray-700 rounded-2xl">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-white">{template.name}</h4>
                            <span className="text-[10px] font-mono text-cyan-500 uppercase">SFS 2025:400 COMPLIANT</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                        <div className="flex gap-2">
                            {template.triggers.keywords?.slice(0, 3).map(k => (
                                <span key={k} className="text-[9px] bg-gray-950 px-2 py-0.5 rounded text-gray-500 uppercase font-black">#{k}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default RiskProfileRegistry;