
import React from 'react';
import { ShieldCheckIcon, UserGroupIcon, MagnifyingGlassIcon, SparklesIcon, BoltIcon, LawIcon } from './icons';
import { ModuleConnector } from './shared/ModuleConnector';

interface VisionViewProps {
  onNavigate?: (moduleId: string) => void;
}

const VisionView: React.FC<VisionViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-20 animate-in fade-in duration-1000">
      {/* Hero Section */}
      <section className="space-y-8">
        <div className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-full">
          Filosofi & Vision
        </div>
        <h1 className="text-5xl font-bold text-slate-900 tracking-tighter leading-[0.9] max-w-2xl">
          Tillgänglighet är inte en checklista. Det är kvalitet.
        </h1>
        <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
          För oss handlar tillgänglighet inte om att “bocka av krav”, utan om kvalitet, inkludering och långsiktig affärsnytta. När fler kan ta del av innehållet, förstå flöden och använda tjänsten fullt ut, stärker det både varumärket och den digitala investeringen.
        </p>
      </section>

      {/* Core Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Pillar title="WCAG" description="Efterlevnad av internationella tillgänglighetsriktlinjer." />
        <Pillar title="Användbarhet" description="Tydliga flöden som minskar kognitiv belastning." />
        <Pillar title="Struktur" description="Läsbarhet och logisk informationsarkitektur." />
        <Pillar title="Validering" description="Kontinuerlig testning och kvalitetssäkring." />
      </section>

      {/* Methodology */}
      <section className="space-y-12 border-t border-slate-100 pt-20">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Vår Metodik</h2>
        
        <div className="space-y-16">
          <MethodStep 
            number="01" 
            title="Teknisk Analys" 
            description="Identifierar redaktörernas behov, tittar på vilka integrationer som behöver göras, kartlägger befintliga eller nya önskemål om tekniska funktioner, går igenom säkerhethetskrav, krav på prestanda och hantering."
            icon={<BoltIcon className="w-6 h-6" />}
          />
          
          <MethodStep 
            number="02" 
            title="Strategisk Grund" 
            description="Tar med alla parametrar som ligger till grund för projektet: uppsatta mål, tekniska förutsättningar, identifierade behov, användarscenarion, positionering gentemot konkurrenter och varumärkets uttryck."
            icon={<LawIcon className="w-6 h-6" />}
          />
          
          <MethodStep 
            number="03" 
            title="Design & Dashboard" 
            description="Design handlar om att minska friktion, öka konvertering och skapa digitala tjänster som människor faktiskt vill använda. Genom att förstå användarnas behov och beteenden skapar vi digitala upplevelser som fungerar i praktiken och bidrar till verklig affärsnytta."
            icon={<SparklesIcon className="w-6 h-6" />}
          />
        </div>
      </section>

      {/* Deep Dive */}
      <section className="bg-slate-50 p-12 rounded-[2rem] space-y-8 border border-slate-100">
        <div className="max-w-2xl space-y-6">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Insikt före antagande</h3>
          <p className="text-slate-600 leading-relaxed">
            Vi börjar med att förstå både användarnas behov och verksamhetens mål. Vi analyserar hur tjänsten fungerar idag, var friktion uppstår och vilka hinder som påverkar konvertering, effektivitet och upplevelse – Genom strukturerad research identifierar vi beteenden, drivkrafter och verkliga användningsmönster.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Vi prioriterar insatser som ger störst effekt och synliggör risker innan de blir kostsamma. Analysen skapar ett gemensamt beslutsunderlag – så att nästa steg baseras på insikt, inte antaganden.
          </p>
        </div>
      </section>

      {/* Inclusive Design */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Inkluderande Design</h3>
          <p className="text-slate-600 leading-relaxed">
            Inkluderande design tar hänsyn till olika behov, bakgrunder och förkunskaper redan från start. Genom genomtänkta val av kontrast, typografi och struktur skapar vi lösningar som fungerar för fler, håller över tid och stärker både användarupplevelsen och affären.
          </p>
          <ul className="space-y-3">
            <BenefitItem text="Ökar räckvidden" />
            <BenefitItem text="Förbättras upplevelsen för alla" />
            <BenefitItem text="Minskar risken för juridiska problem" />
            <BenefitItem text="Stärks investeringen över tid" />
          </ul>
        </div>
        <div className="aspect-square bg-slate-900 rounded-[3rem] flex items-center justify-center p-12 shadow-2xl shadow-slate-900/20">
          <ShieldCheckIcon className="w-32 h-32 text-white opacity-20" />
        </div>
      </section>

      {/* Footer Note */}
      <footer className="pt-20 border-t border-slate-100 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em]">
          Case Integrity Suite • Designfilosofi v1.0
        </p>
      </footer>

      <ModuleConnector activeModule="vision" onNavigate={onNavigate} />
    </div>
  );
};

const Pillar: React.FC<{ title: string, description: string }> = ({ title, description }) => (
  <div className="space-y-2">
    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{title}</h4>
    <p className="text-xs text-slate-500 leading-relaxed font-medium">{description}</p>
  </div>
);

const MethodStep: React.FC<{ number: string, title: string, description: string, icon: React.ReactNode }> = ({ number, title, description, icon }) => (
  <div className="flex gap-8 items-start">
    <div className="text-4xl font-bold text-slate-200 tracking-tighter leading-none">{number}</div>
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-50 rounded border border-slate-100 text-slate-900">
          {icon}
        </div>
        <h4 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h4>
      </div>
      <p className="text-slate-500 leading-relaxed font-medium max-w-xl">{description}</p>
    </div>
  </div>
);

const BenefitItem: React.FC<{ text: string }> = ({ text }) => (
  <li className="flex items-center gap-3 text-sm font-bold text-slate-900 uppercase tracking-tight">
    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
    {text}
  </li>
);

export default VisionView;
