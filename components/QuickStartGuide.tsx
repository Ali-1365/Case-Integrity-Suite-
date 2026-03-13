
import React from 'react';
import { 
    BoltIcon, 
    ShieldCheckIcon, 
    MagnifyingGlassIcon, 
    DocumentTextIcon, 
    FingerPrintIcon,
    ChatIcon,
    CpuChipIcon,
    LawIcon,
    SparklesIcon,
    ActivityIcon
} from './icons';

export const QuickStartGuide: React.FC = () => {
    const modules = [
        {
            title: "Forensisk Integritetskedja",
            icon: <FingerPrintIcon className="w-6 h-6 text-emerald-500" />,
            description: "Varje faktaatom i systemet säkras med SHA-256 hashing. Om data manipuleras bryts kedjan och systemet går i skrivskyddat läge för att skydda rättssäkerheten.",
            usage: "Se fliken 'Forensisk Integritet' för att verifiera beviskedjan."
        },
        {
            title: "Interactive Analyst",
            icon: <ChatIcon className="w-6 h-6 text-indigo-500" />,
            description: "En kontextmedveten AI-analytiker som kan svara på frågor om specifika ärenden. Den har direkt tillgång till alla faktaatomer och lagrum.",
            usage: "Använd fliken 'Interactive Analyst' för att ställa frågor som 'Vilka bevis stödjer yrkandet?'."
        },
        {
            title: "Intelligence Core (Manual Control)",
            icon: <CpuChipIcon className="w-6 h-6 text-amber-500" />,
            description: "Ger dig full kontroll över AI-pipelinen. Du kan manuellt trigga steg som normalisering, ai-analys eller integritetskontroll.",
            usage: "Gå till 'Intelligence Core' för att köra specifika analyssteg manuellt."
        },
        {
            title: "8-stegs Dokumentpipeline",
            icon: <DocumentTextIcon className="w-6 h-6 text-blue-500" />,
            description: "En automatiserad kedja som genererar, korrigerar och verifierar juridiska inlagor genom domarsimulering och praxis-kontroll.",
            usage: "Använd 'Dokument-Pipeline' för att producera verifierade slutdokument (v3)."
        },
        {
            title: "FMJAM Controller v.17",
            icon: <ShieldCheckIcon className="w-6 h-6 text-red-500" />,
            description: "Systemets övervakningsorgan som flaggar avvikelser, logiska brister och integritetsfel i realtid.",
            usage: "Monitorera 'FMJAM Controller' för att se systemets hälsa och eventuella flaggade risker."
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-xs font-bold uppercase tracking-widest">
                    <SparklesIcon className="w-3 h-3" />
                    Systemuppdatering v.7.2.2-GOLD
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    Snabbstartsguide: FMJAM Oracle
                </h1>
                <p className="text-slate-500 dark:text-gray-400 max-w-2xl mx-auto">
                    Välkommen till den uppgraderade plattformen för forensisk juridisk analys. 
                    Här är en genomgång av de nya modulerna och hur du använder dem effektivt.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {modules.map((module, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl group-hover:scale-110 transition-transform">
                                {module.icon}
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-slate-900 dark:text-white">{module.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
                                    {module.description}
                                </p>
                                <div className="pt-2 flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                    <BoltIcon className="w-3 h-3" />
                                    {module.usage}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
                <div className="relative z-10 space-y-4">
                    <h2 className="text-2xl font-bold">Arbetsflöde för ett nytt ärende</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                        <div className="space-y-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto font-bold">1</div>
                            <p className="text-xs font-bold uppercase">Ingest</p>
                            <p className="text-[10px] opacity-80">Ladda upp rådata</p>
                        </div>
                        <div className="space-y-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto font-bold">2</div>
                            <p className="text-xs font-bold uppercase">Analys</p>
                            <p className="text-[10px] opacity-80">Kör Intelligence Core</p>
                        </div>
                        <div className="space-y-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto font-bold">3</div>
                            <p className="text-xs font-bold uppercase">Verifiering</p>
                            <p className="text-[10px] opacity-80">Kör Dokument-Pipeline</p>
                        </div>
                        <div className="space-y-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto font-bold">4</div>
                            <p className="text-xs font-bold uppercase">Export</p>
                            <p className="text-[10px] opacity-80">Hämta final inlaga</p>
                        </div>
                    </div>
                </div>
                <ActivityIcon className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12" />
            </div>

            <div className="text-center pb-12">
                <p className="text-xs text-slate-400 dark:text-gray-600">
                    FMJAM Oracle v.7.2.2-GOLD | Forensic Integrity Secured | SFS 2025:400 Compliant
                </p>
            </div>
        </div>
    );
};
