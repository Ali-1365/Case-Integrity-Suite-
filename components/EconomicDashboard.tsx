
import React, { useState, useEffect, useCallback } from 'react';
import { economicService } from '../services/EconomicService';
import { Payment, Invoice, DamagesClaim, BudgetForecast } from '../lib/economic.types';
import { 
  CurrencyDollarIcon, 
  BanknotesIcon, 
  ClipboardDocumentListIcon, 
  ScaleIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  AlertIcon,
  PlusIcon,
  ChevronRightIcon,
  SparklesIcon,
  XMarkIcon
} from './icons';
import Card from './shared/Card';

import { 
  PaymentsView, 
  InvoicesView, 
  DamagesView, 
  BudgetView 
} from './EconomicSubViews';

import {
  NewPaymentForm,
  NewInvoiceForm,
  NewClaimForm
} from './EconomicForms';

/**
 * EconomicDashboard v.1.1
 * Modulär ekonomisk hantering med AI-stöd för juridisk precision.
 */
const EconomicDashboard: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [claims, setClaims] = useState<DamagesClaim[]>([]);
  const [forecasts, setForecasts] = useState<BudgetForecast[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PAYMENTS' | 'INVOICES' | 'DAMAGES' | 'BUDGET'>('OVERVIEW');
  
  // State för formulär
  const [activeForm, setActiveForm] = useState<'NONE' | 'PAYMENT' | 'INVOICE' | 'CLAIM'>('NONE');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadData = useCallback(() => {
    setPayments(economicService.getPayments());
    setInvoices(economicService.getInvoices());
    setClaims(economicService.getClaims());
    setForecasts(economicService.getForecasts());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSavePayment = (data: Partial<Payment>) => {
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: data.amount || 0,
      currency: data.currency || 'SEK',
      recipient: data.recipient || 'Okänd',
      description: data.description || '',
      status: 'PENDING',
      category: data.category || 'SERVICE'
    };
    economicService.addPayment(newPayment);
    loadData();
    setActiveForm('NONE');
  };

  const handleSaveInvoice = (data: Partial<Invoice>) => {
    const total = data.total || 0;
    const vat = total * 0.2; // 25% VAT (total = amount + vat, so vat = total * 0.2 if vat is 25% of amount)
    const amount = total - vat;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
      clientName: data.clientName || 'Okänd Kund',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || '',
      amount: amount,
      vat: vat,
      total: total,
      status: 'SENT',
      items: data.items || []
    };
    economicService.addInvoice(newInvoice);
    loadData();
    setActiveForm('NONE');
  };

  const handleSaveClaim = (data: Partial<DamagesClaim>) => {
    const newClaim: DamagesClaim = {
      id: `claim-${Date.now()}`,
      claimant: data.claimant || 'Okänd',
      defendant: data.defendant || 'Okänd',
      type: data.type || 'STATE',
      status: 'IN_PROGRESS',
      estimatedAmount: data.estimatedAmount || 0,
      probability: 0.5,
      legalBasis: data.legalBasis || ['Skadeståndslagen'],
      components: [],
      description: data.description || ''
    };
    economicService.addClaim(newClaim);
    loadData();
    setActiveForm('NONE');
  };

  const handleAnalyzeClaim = async (claim: DamagesClaim) => {
    setIsAnalyzing(true);
    try {
      const analysis = await economicService.analyzeClaimAI(claim);
      economicService.updateClaim(claim.id, { aiAnalysis: analysis });
      loadData();
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Form Overlay */}
      {activeForm !== 'NONE' && (
        <div className="absolute inset-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-start justify-center pt-10 overflow-y-auto pb-20">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {activeForm === 'PAYMENT' && 'Registrera Ny Betalning'}
                {activeForm === 'INVOICE' && 'Skapa Ny Faktura'}
                {activeForm === 'CLAIM' && 'Registrera Nytt Skadeståndskrav'}
              </h3>
              <button onClick={() => setActiveForm('NONE')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <XMarkIcon className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            {activeForm === 'PAYMENT' && <NewPaymentForm onSave={handleSavePayment} onCancel={() => setActiveForm('NONE')} />}
            {activeForm === 'INVOICE' && <NewInvoiceForm onSave={handleSaveInvoice} onCancel={() => setActiveForm('NONE')} />}
            {activeForm === 'CLAIM' && <NewClaimForm onSave={handleSaveClaim} onCancel={() => setActiveForm('NONE')} />}
          </div>
        </div>
      )}

      {/* Loading Overlay för AI */}
      {isAnalyzing && (
        <div className="absolute inset-0 z-[60] bg-indigo-600/10 backdrop-blur-[2px] flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-indigo-100 dark:border-indigo-900/50 flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-indigo-600 animate-pulse">AI-Analys pågår...</p>
          </div>
        </div>
      )}

      {/* Header med snabbstatistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Totala Betalningar" 
          value={new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(payments.reduce((acc, p) => acc + p.amount, 0))} 
          icon={<BanknotesIcon className="w-6 h-6 text-emerald-500" />}
          trend="+5.2%"
        />
        <StatCard 
          title="Utestående Fakturor" 
          value={new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(invoices.filter(i => i.status !== 'PAID').reduce((acc, i) => acc + i.total, 0))} 
          icon={<ClipboardDocumentListIcon className="w-6 h-6 text-amber-500" />}
          trend="-2.1%"
        />
        <StatCard 
          title="Skadeståndskrav (Est.)" 
          value={new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(claims.reduce((acc, c) => acc + c.estimatedAmount, 0))} 
          icon={<ScaleIcon className="w-6 h-6 text-indigo-500" />}
        />
        <StatCard 
          title="Budgetföljsamhet" 
          value="94.2%" 
          icon={<ChartBarIcon className="w-6 h-6 text-cyan-500" />}
          trend="+1.5%"
        />
      </div>

      {/* Navigering inom modulen */}
      <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl self-start">
        <TabButton active={activeTab === 'OVERVIEW'} onClick={() => setActiveTab('OVERVIEW')} label="Översikt" />
        <TabButton active={activeTab === 'PAYMENTS'} onClick={() => setActiveTab('PAYMENTS')} label="Betalningar" />
        <TabButton active={activeTab === 'INVOICES'} onClick={() => setActiveTab('INVOICES')} label="Fakturor" />
        <TabButton active={activeTab === 'DAMAGES'} onClick={() => setActiveTab('DAMAGES')} label="Skadestånd" />
        <TabButton active={activeTab === 'BUDGET'} onClick={() => setActiveTab('BUDGET')} label="Budget & Prognos" />
      </div>

      {/* Innehåll baserat på aktiv flik */}
      <div className="flex-1 min-h-0">
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Finansiell Överblick</h2>
                <p className="text-xs text-slate-500">Realtidsanalys av pågående rättsliga processer och budgetstatus.</p>
              </div>

              <Card title="Aktiva Skadeståndsprocesser" icon={<ScaleIcon className="w-5 h-5" />}>
                <div className="space-y-4">
                  {claims.length > 0 ? claims.map(claim => (
                    <div key={claim.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 transition-all cursor-pointer group">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${claim.type === 'STATE' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          <ScaleIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{claim.claimant} vs {claim.defendant}</h4>
                          <p className="text-xs text-slate-500">{claim.legalBasis.join(', ')}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center space-x-6">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(claim.estimatedAmount)}
                          </p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                            {claim.status === 'IN_PROGRESS' ? 'Pågående' : claim.status === 'SETTLED' ? 'Förlikad' : 'Avslutad'}
                          </p>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                      </div>
                    </div>
                  )) : (
                    <div className="py-8 text-center">
                      <ScaleIcon className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Inga aktiva skadeståndsprocesser registrerade.</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card title="Budgetprognos (Antifragil Analys)" icon={<ArrowTrendingUpIcon className="w-5 h-5" />}>
                <div className="h-64 flex items-end justify-between space-x-4 px-4 pb-4">
                  {/* Enkel visualisering av budget vs faktiskt */}
                  <div className="flex-1 flex flex-col items-center space-y-2">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative h-48">
                      <div className="absolute bottom-0 left-0 right-0 bg-indigo-500/40 rounded-t-lg h-[85%]"></div>
                      <div className="absolute bottom-0 left-1/4 right-1/4 bg-indigo-600 rounded-t-lg h-[92%] shadow-lg"></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Intäkter</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center space-y-2">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative h-48">
                      <div className="absolute bottom-0 left-0 right-0 bg-rose-500/40 rounded-t-lg h-[70%]"></div>
                      <div className="absolute bottom-0 left-1/4 right-1/4 bg-rose-600 rounded-t-lg h-[65%] shadow-lg"></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Utgifter</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center space-y-2">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative h-48">
                      <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/40 rounded-t-lg h-[40%]"></div>
                      <div className="absolute bottom-0 left-1/4 right-1/4 bg-emerald-600 rounded-t-lg h-[45%] shadow-lg"></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Resultat</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex items-start space-x-4">
                  <SparklesIcon className="w-6 h-6 text-indigo-500 shrink-0" />
                  <div>
                    <h5 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">AI-Insikt: Antifragil Optimering</h5>
                    <p className="text-xs text-indigo-800/70 dark:text-indigo-400/70 mt-1 leading-relaxed">
                      Baserat på nuvarande skadeståndsprocesser och fakturaflöden rekommenderas en ökad likviditetsreserv på 12% för att hantera potentiella rättsliga osäkerheter under Q2.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-8">
              <Card title="Senaste Betalningar" icon={<BanknotesIcon className="w-5 h-5" />}>
                <div className="space-y-4">
                  {payments.length > 0 ? payments.map(payment => (
                    <div key={payment.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{payment.recipient}</p>
                        <p className="text-[10px] text-slate-500 uppercase">
                          {new Date(payment.date).toLocaleDateString('sv-SE')}
                        </p>
                      </div>
                      <p className={`text-sm font-mono font-bold ${payment.status === 'COMPLETED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: payment.currency }).format(payment.amount)}
                      </p>
                    </div>
                  )) : (
                    <div className="py-6 text-center">
                      <p className="text-[10px] text-slate-400">Inga nyligen genomförda betalningar.</p>
                    </div>
                  )}
                  <button 
                    onClick={() => setActiveForm('PAYMENT')}
                    className="w-full py-3 mt-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-indigo-500 hover:border-indigo-500/50 transition-all flex items-center justify-center space-x-2 text-xs font-bold uppercase tracking-widest"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Registrera Betalning</span>
                  </button>
                </div>
              </Card>

              <Card title="Systemhälsa: Ekonomi" icon={<AlertIcon className="w-5 h-5" />}>
                <div className="space-y-6">
                  <HealthItem label="Faktura-integritet" status="OK" />
                  <HealthItem label="Skadestånds-risk" status="MODERATE" />
                  <HealthItem label="Likviditet" status="OK" />
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Komplexitetsindex</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full w-[68%]"></div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 italic">Systemet hanterar 14 parallella ekonomiska variabler.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'PAYMENTS' && <PaymentsView payments={payments} onAdd={() => setActiveForm('PAYMENT')} />}
        {activeTab === 'INVOICES' && <InvoicesView invoices={invoices} onAdd={() => setActiveForm('INVOICE')} />}
        {activeTab === 'DAMAGES' && <DamagesView claims={claims} onAdd={() => setActiveForm('CLAIM')} onAnalyze={handleAnalyzeClaim} />}
        {activeTab === 'BUDGET' && <BudgetView forecasts={forecasts} />}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, trend?: string }> = ({ title, value, icon, trend }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      {trend && (
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
          {trend}
        </span>
      )}
    </div>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
  </div>
);

const TabButton: React.FC<{ active: boolean, onClick: () => void, label: string }> = ({ active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${active ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
  >
    {label}
  </button>
);

const HealthItem: React.FC<{ label: string, status: 'OK' | 'MODERATE' | 'CRITICAL' }> = ({ label, status }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${status === 'OK' ? 'bg-emerald-500' : status === 'MODERATE' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${status === 'OK' ? 'text-emerald-600' : status === 'MODERATE' ? 'text-amber-600' : 'text-rose-600'}`}>{status}</span>
    </div>
  </div>
);

export default EconomicDashboard;
