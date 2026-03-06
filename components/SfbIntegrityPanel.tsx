
import React, { useState, useEffect } from 'react';
import { sfbValidationService } from '../lib/sfb/SfbValidationService';
import { SicknessBenefitStrategy } from '../lib/sfb/strategies/SicknessBenefitStrategy';
import { ParentalBenefitStrategy } from '../lib/sfb/strategies/ParentalBenefitStrategy';
import { SfbCasePayload, SfbValidationResult, SfbBenefitType } from '../lib/sfb/types';
import { 
    XMarkIcon, 
    ShieldCheckIcon, 
    LawIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon,
    Spinner,
    ClipboardDocumentListIcon,
    UserIcon
} from './icons';

interface SfbIntegrityPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const SfbIntegrityPanel: React.FC<SfbIntegrityPanelProps> = ({ isOpen, onClose }) => {
    const [benefitType, setBenefitType] = useState<SfbBenefitType>('sickness');
    const [clientData, setClientData] = useState<string>('{\n  "hasMedicalCertificate": true,\n  "income": 350000,\n  "childId": "20230101-1234",\n  "daysClaimed": 120\n}');
    const [result, setResult] = useState<SfbValidationResult | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    useEffect(() => {
        // Register strategies on mount
        sfbValidationService.registerStrategy(new SicknessBenefitStrategy());
        sfbValidationService.registerStrategy(new ParentalBenefitStrategy());
    }, []);

    const handleValidate = async () => {
        setIsValidating(true);
        try {
            const parsedData = JSON.parse(clientData);
            const payload: SfbCasePayload = {
                id: crypto.randomUUID(),
                type: benefitType,
                claimDate: new Date().toISOString(),
                clientData: parsedData,
                context: { auditId: crypto.randomUUID() }
            };

            const res = await sfbValidationService.validate(payload);
            setResult(res);
        } catch (e: any) {
            alert(`Fel vid validering: ${e.message}`);
        } finally {
            setIsValidating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[250] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden">
                
                <header className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                            <LawIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Socialförsäkringsbalken (SFB) Integrity</h2>
                            <p className="text-xs text-slate-500">Validering av lagrum och regelefterlevnad</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </header>

                <main className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Input Section */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Förmånstyp</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setBenefitType('sickness')}
                                        className={`px-4 py-3 rounded-xl border text-xs font-medium transition-all ${benefitType === 'sickness' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                                    >
                                        Sjukpenning (Kap 28)
                                    </button>
                                    <button 
                                        onClick={() => setBenefitType('parental')}
                                        className={`px-4 py-3 rounded-xl border text-xs font-medium transition-all ${benefitType === 'parental' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                                    >
                                        Föräldrapenning (Kap 12)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Ärendedata (JSON)</label>
                                <textarea 
                                    value={clientData}
                                    onChange={(e) => setClientData(e.target.value)}
                                    className="w-full h-48 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>

                            <button 
                                onClick={handleValidate}
                                disabled={isValidating}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                {isValidating ? <Spinner className="h-5 w-5" /> : <ShieldCheckIcon className="h-5 w-5" />}
                                <span>Kör SFB-Integritetskontroll</span>
                            </button>
                        </div>

                        {/* Result Section */}
                        <div className="space-y-6">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Valideringsresultat</label>
                            
                            {result ? (
                                <div className={`p-6 rounded-2xl border ${result.isValid ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' : 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30'} animate-in zoom-in-95 duration-300`}>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            {result.isValid ? (
                                                <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                                            ) : (
                                                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                                            )}
                                            <span className={`text-lg font-bold ${result.isValid ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                                                {result.outcome}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">
                                            {result.ruleVersion}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {result.reasoning.map((r, i) => (
                                            <div key={i} className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
                                                <div className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${result.isValid ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                                                <p>{r}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 space-y-2">
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-slate-400 uppercase font-bold">Audit ID</span>
                                            <span className="text-slate-500 font-mono">{result.auditTrailId.substring(0, 13)}...</span>
                                        </div>
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-slate-400 uppercase font-bold">Timestamp</span>
                                            <span className="text-slate-500 font-mono">{new Date(result.timestamp).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full min-h-[300px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 space-y-4">
                                    <ClipboardDocumentListIcon className="h-12 w-12 opacity-20" />
                                    <p className="text-xs font-medium opacity-50">Väntar på exekvering...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                <footer className="px-8 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rule Engine: Active</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] text-slate-400 font-mono">FMJAM_SFB_PROTOCOL_v1.0</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default SfbIntegrityPanel;
