
import React from 'react';
import { ShieldCheckIcon, LawIcon, CpuChipIcon, BoltIcon } from './icons';

const documentationMd = `
# FMJAM Engine v.6.3-GOLD | SFS 2025:400 COMPLIANT

## 1. ARKITEKTONISK STATUS: FAS 17 COMPLETE
Systemet opererar nu under **FMJAM_V3_CONTROLLER_READY**. Detta innebär en fullständig konsolidering av kontextfönstret där controller-lagret (FAS 17) aktivt granskar systemets egna beslutsmönster.

## 2. JURIDISKT RAMVERK (SFS 2025:400)
Under SFS 2025:400 krävs absolut spårbarhet i automatiserade beslutsprocesser. Ramverket implementerar:

- **§4 Rättslig Regelefterlevnad**: Varje utdata valideras mot källindex i realtid. Inga hallucinationer tillåts (Temperature locked at 0.0).
- **§12 Algoritmisk Transparens**: Systemet genererar ett "Explainability-certifikat" för varje analys med pinpoint-referenser.
- **§22 Automatiserad Beslutslogg**: Alla exekveringar arkiveras i en oföränderlig loggstack för efterhandsgranskning.

## 3. TEKNISK KONFIGURATION (GOLD TIER)
- **Hybrid RAG Logic**: Kombinerad vektorsökning och deterministisk nyckelordsanalys för maximal precision.
- **Controller-Lager**: Automatiserad upptäckt av bias, inkonsekvens och oproportionerliga beslutsmönster.
- **Denoising Protocol**: OCR-brus och typos rensas aktivt v.6.4.1 innan juridisk exekvering.

## 4. SYSTEMETS AXIOM (LOCKED)
1. **PKK-Dominans.** Dokumenten i PROVENANCE_ROOT är den enda sanningen.
2. **Zero Spekulation.** Ingen semantisk interpolation utan källstöd. Markera som [INFORMATION_GAP] vid avsaknad av data.
3. **Traceability.** Varje punkt i en inlaga är låst mot ett Forensiskt Hash-ID.

> **SYSTEMSTATUS:** v.6.3 GOLD CORE. FAS 17 AKTIV. SFS 2025:400 Compliance verifierad.
`;

const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => (line as { length: number }).length > 0)
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return (
            <div key={index} className="mb-12">
              <h1 className="text-4xl font-black text-white mt-2 uppercase tracking-tighter italic border-b-8 border-cyan-600 pb-4">
                {line.replace('# ', '')}
              </h1>
            </div>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={index} className="text-xl font-black text-cyan-500 mt-10 mb-6 flex items-center group uppercase tracking-widest">
              <BoltIcon className="w-5 h-5 mr-3 text-cyan-500 animate-pulse" />
              {line.replace('## ', '')}
            </h2>
          );
        }
        if (line.startsWith('> ')) {
            return (
              <div key={index} className="my-10 p-8 bg-cyan-950/20 border-l-8 border-cyan-600 rounded-r-3xl text-cyan-100 text-lg font-black italic tracking-tight shadow-2xl">
                  {line.replace('> ', '')}
              </div>
            );
        }
        if (line.startsWith('- ')) {
            const content = line.replace('- ', '');
            return (
              <li key={index} className="ml-6 list-none text-gray-300 mb-4 flex items-start group">
                <span className="text-cyan-600 mr-4 font-black text-xl leading-none">»</span>
                <span className="text-base leading-relaxed">
                  {content.split('**').map((part, i) => 
                    i % 2 === 1 ? <strong key={i} className="text-white font-black">{part}</strong> : part
                  )}
                </span>
              </li>
            );
        }
        return <p key={index} className="mb-4 text-gray-400 leading-relaxed text-sm font-medium pl-2 border-l border-gray-800">{line}</p>;
      });
};

const SystemDocumentation: React.FC = () => {
  return (
    <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-cyan-950/20 border border-cyan-900/30 p-6 rounded-[2rem] flex items-center gap-5 shadow-2xl transition-transform hover:scale-[1.02]">
                <div className="p-4 bg-cyan-600/10 rounded-2xl text-cyan-500 animate-pulse"><ShieldCheckIcon className="w-8 h-8" /></div>
                <div>
                    <p className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">Compliance State</p>
                    <p className="text-lg font-black text-white italic">SFS 2025:400</p>
                </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-[2rem] flex items-center gap-5 transition-transform hover:scale-[1.02]">
                <div className="p-4 bg-yellow-600/10 rounded-2xl text-yellow-500"><CpuChipIcon className="w-8 h-8" /></div>
                <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Logic Tier</p>
                    <p className="text-lg font-black text-white italic">GOLD CORE v6.3</p>
                </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-[2rem] flex items-center gap-5 transition-transform hover:scale-[1.02]">
                <div className="p-4 bg-indigo-600/10 rounded-2xl text-indigo-500"><LawIcon className="w-8 h-8" /></div>
                <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Integrity Level</p>
                    <p className="text-lg font-black text-white italic">ALPHA DOMINANT</p>
                </div>
            </div>
        </div>

        <div className="bg-gray-950/90 p-10 md:p-16 rounded-[3rem] border-x border-t border-cyan-900/20 shadow-[0_-50px_100px_rgba(34,211,238,0.15)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-700">
                <BoltIcon className="w-96 h-96 text-cyan-600" />
            </div>
            
            <div className="relative z-10 prose prose-invert max-w-none">
                {renderMarkdown(documentationMd)}
            </div>

            <div className="mt-16 pt-10 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-cyan-600 rounded-full animate-ping"></div>
                    <span className="text-[11px] font-black text-cyan-600 uppercase tracking-[0.5em]">FMJAM ENGINE v.6.3-GOLD | AUDIT_COMPLETE</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-gray-600 italic font-bold">LOCKED_STATE_SYNCED</span>
                    <div className="h-4 w-px bg-gray-800"></div>
                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">IMMUTABLE AUDIT LOG ACTIVE</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SystemDocumentation;
