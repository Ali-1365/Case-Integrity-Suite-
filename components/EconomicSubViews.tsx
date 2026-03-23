
import React from 'react';
import { Payment, Invoice, DamagesClaim, BudgetForecast } from '../lib/economic.types';
import { 
  BanknotesIcon, 
  ClipboardDocumentListIcon, 
  ScaleIcon, 
  ChartBarIcon, 
  PlusIcon,
  ChevronRightIcon,
  AlertIcon,
  ArrowTrendingUpIcon,
  SparklesIcon
} from './icons';
import Card from './shared/Card';

export const PaymentsView: React.FC<{ payments: Payment[], onAdd: () => void, onFilter?: () => void }> = ({ payments, onAdd, onFilter }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Betalningshistorik</h3>
        <p className="text-xs text-slate-500 mt-1">Översikt över alla utgående betalningar och transaktioner.</p>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={onFilter}
          className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          Filtrera
        </button>
        <button 
          onClick={onAdd}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-lg shadow-indigo-500/20"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Ny Betalning</span>
        </button>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-4">
      {payments.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
          <BanknotesIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-sm text-slate-500 font-medium">Inga betalningar registrerade ännu.</p>
        </div>
      ) : (
        payments.map(payment => (
          <div key={payment.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:shadow-md transition-all group">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl transition-colors ${payment.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/10'}`}>
                <BanknotesIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{payment.recipient}</h4>
                <p className="text-xs text-slate-500">{payment.description} • {new Date(payment.date).toLocaleDateString('sv-SE')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-mono font-black text-slate-900 dark:text-white">
                {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: payment.currency }).format(payment.amount)}
              </p>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${payment.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                {payment.status === 'COMPLETED' ? 'Genomförd' : 'Väntande'}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export const InvoicesView: React.FC<{ invoices: Invoice[], onAdd: () => void, onViewDetails?: (invoice: Invoice) => void }> = ({ invoices, onAdd, onViewDetails }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Fakturahantering</h3>
        <p className="text-xs text-slate-500 mt-1">Hantera kundfakturor, spåra betalningsstatus och förfallodatum.</p>
      </div>
      <button 
        onClick={onAdd}
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-lg shadow-indigo-500/20"
      >
        <PlusIcon className="w-4 h-4" />
        <span>Skapa Faktura</span>
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {invoices.length === 0 ? (
        <div className="col-span-full p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
          <ClipboardDocumentListIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-sm text-slate-500 font-medium">Inga fakturor skapade ännu.</p>
        </div>
      ) : (
        invoices.map(invoice => (
          <div key={invoice.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 transition-all group relative overflow-hidden shadow-sm hover:shadow-md">
            <div className="absolute top-0 right-0 p-4">
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
                invoice.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600' : 
                invoice.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-600' : 
                'bg-amber-500/10 text-amber-600'
              }`}>
                {invoice.status === 'PAID' ? 'Betald' : invoice.status === 'OVERDUE' ? 'Förfallen' : 'Skickad'}
              </span>
            </div>
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                <ClipboardDocumentListIcon className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{invoice.clientName}</h4>
                <p className="text-xs text-slate-500">Nr: {invoice.invoiceNumber}</p>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Utfärdad:</span>
                <span className="text-slate-900 dark:text-white font-medium">{new Date(invoice.issueDate).toLocaleDateString('sv-SE')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Förfaller:</span>
                <span className={`font-bold ${invoice.status === 'OVERDUE' ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                  {new Date(invoice.dueDate).toLocaleDateString('sv-SE')}
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Totalbelopp</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(invoice.total)}
                </p>
              </div>
              <button 
                onClick={() => onViewDetails?.(invoice)}
                className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const DamagesClaimItem = React.memo<{ claim: DamagesClaim, onAnalyze: (claim: DamagesClaim) => void }>(({ claim, onAnalyze }) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div className="flex items-center space-x-4">
        <div className={`p-4 rounded-2xl ${claim.type === 'STATE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-500'}`}>
          <ScaleIcon className="w-8 h-8" />
        </div>
        <div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white">{claim.claimant} <span className="text-slate-400 font-medium mx-2">mot</span> {claim.defendant}</h4>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md uppercase tracking-widest">
              {claim.type === 'STATE' ? 'Statligt' : claim.type === 'PRIVATE' ? 'Privat' : 'Försäkring'}
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${
              claim.status === 'SETTLED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-indigo-500/10 text-indigo-600'
            }`}>
              {claim.status === 'DRAFT' && 'Utkast'}
              {claim.status === 'FILED' && 'Inlämnad'}
              {claim.status === 'NEGOTIATION' && 'Förhandling'}
              {claim.status === 'SETTLED' && 'Förlikad'}
              {claim.status === 'LITIGATION' && 'Process'}
              {claim.status === 'IN_PROGRESS' && 'Pågående'}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Estimerat Värde</p>
        <p className="text-3xl font-black text-slate-900 dark:text-white">
          {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(claim.estimatedAmount)}
        </p>
        <p className="text-xs text-emerald-600 font-bold mt-1">Sannolikhet: {(claim.probability * 100).toFixed(0)}%</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Skadekomponenter</h5>
        <div className="space-y-3">
          {claim.components.map(comp => (
            <div key={comp.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{comp.label}</span>
                <span className="text-sm font-mono font-bold text-indigo-600">
                  {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(comp.amount)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-2">{comp.description}</p>
              <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-400 italic">
                <ClipboardDocumentListIcon className="w-3 h-3" />
                <span>{comp.legalReference}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Juridisk Grund & Analys</h5>
        <div className="p-6 bg-indigo-50 dark:bg-indigo-950/30 rounded-3xl border border-indigo-100 dark:border-indigo-900/50 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-bold text-indigo-900 dark:text-indigo-300">AI-Legal Analys</span>
            </div>
            <button
              onClick={() => onAnalyze(claim)}
              className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-500 transition-colors flex items-center space-x-1"
            >
              <SparklesIcon className="w-3 h-3" />
              <span>Uppdatera Analys</span>
            </button>
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <p className="text-[10px] text-indigo-800/50 dark:text-indigo-400/50 uppercase font-black tracking-widest mb-1">Rättskällor</p>
              <div className="flex flex-wrap gap-2">
                {claim.legalBasis.map((basis, idx) => (
                  <span key={idx} className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                    {basis}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-indigo-800/70 dark:text-indigo-400/70 leading-relaxed italic">
              {claim.aiAnalysis || "Ingen analys tillgänglig. Klicka på 'Uppdatera Analys' för att generera en AI-driven juridisk bedömning."}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
));

export const DamagesView: React.FC<{ claims: DamagesClaim[], onAdd: () => void, onAnalyze: (claim: DamagesClaim) => void }> = ({ claims, onAdd, onAnalyze }) => {
  // Memoize onAnalyze to prevent re-rendering when parent component re-renders
  // but usually onAnalyze is passed down from the parent so we just pass it along
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Skadeståndsprocesser</h3>
          <p className="text-xs text-slate-500 mt-1">Övervaka och analysera pågående skadeståndskrav och juridiska risker.</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-700">
            Filtrera
          </button>
          <button
            onClick={onAdd}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-lg shadow-indigo-500/20"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Nytt Krav</span>
          </button>
        </div>
      </div>
      <div className="space-y-6">
        {claims.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
            <ScaleIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-500 font-medium">Inga skadeståndskrav registrerade.</p>
          </div>
        ) : (
          claims.map(claim => (
            <DamagesClaimItem key={claim.id} claim={claim} onAnalyze={onAnalyze} />
          ))
        )}
      </div>
    </div>
  );
};

export const BudgetView: React.FC<{ forecasts: BudgetForecast[], onGenerate?: () => void }> = ({ forecasts, onGenerate }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Budget & Prognos</h3>
        <p className="text-xs text-slate-500 mt-1">AI-drivna prognoser baserade på historisk data och framtida risker.</p>
      </div>
      <button 
        onClick={onGenerate}
        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20"
      >
        <ArrowTrendingUpIcon className="w-4 h-4" />
        <span>Generera Ny Prognos</span>
      </button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {forecasts.map(fc => (
          <div key={fc.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{fc.period}</h4>
                <p className="text-xs text-slate-500">Konfidensgrad: {(fc.confidenceScore * 100).toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl">
                <ChartBarIcon className="w-6 h-6 text-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Faktiska Intäkter</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(fc.actualIncome)}
                </p>
                <p className="text-[10px] text-emerald-600 font-bold mt-1">Budget: {new Intl.NumberFormat('sv-SE').format(fc.forecastedIncome)}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Faktiska Utgifter</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(fc.actualExpenses)}
                </p>
                <p className="text-[10px] text-rose-600 font-bold mt-1">Budget: {new Intl.NumberFormat('sv-SE').format(fc.forecastedExpenses)}</p>
              </div>
              <div className="p-4 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                <p className="text-[10px] text-indigo-100 uppercase font-black tracking-widest mb-1">Varians</p>
                <p className="text-xl font-black">
                  {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(fc.variance)}
                </p>
                <p className="text-[10px] text-indigo-200 font-bold mt-1">{fc.variance >= 0 ? 'Positiv avvikelse' : 'Negativ avvikelse'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Antifragilitets-analys</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">Scenario: Rättslig Osäkerhet</p>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[45%]"></div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">Hög påverkan vid förlust i mål claim-1.</p>
                </div>
                <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">Scenario: Marknadsvolatilitet</p>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[15%]"></div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">Låg känslighet för ränteförändringar.</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <Card title="Strategiska Rekommendationer" icon={<SparklesIcon className="w-5 h-5" />}>
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
              <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Optimera Likviditet</p>
              <p className="text-[10px] text-indigo-800/70 dark:text-indigo-400/70 mt-1">
                Överför 50 000 SEK till räntebärande konto för att maximera avkastning på vilande kapital.
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Riskreducering</p>
              <p className="text-[10px] text-emerald-800/70 dark:text-emerald-400/70 mt-1">
                Förlikning i mål claim-1 vid bud över 65 000 SEK rekommenderas för att säkra kassaflöde.
              </p>
            </div>
          </div>
        </Card>

        <Card title="Ekonomisk Hälsa" icon={<AlertIcon className="w-5 h-5" />}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Skuldsättningsgrad</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">0.15</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Räntetäckningsgrad</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">12.4</span>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Finansiell Robusthet</p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[88%]"></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
);
