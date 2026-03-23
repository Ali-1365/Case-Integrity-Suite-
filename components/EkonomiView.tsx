
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  TrendingUp, 
  FileText, 
  CreditCard, 
  ShieldAlert, 
  BarChart3, 
  ArrowRight, 
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Trash2,
  ExternalLink,
  BrainCircuit
} from 'lucide-react';
import { economicService } from '../services/EconomicService';
import { Payment, Invoice, DamagesClaim, BudgetForecast, DamageComponent } from '../lib/economic.types';
import { offlineService } from '../services/offlineService';
import { generateId } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const EkonomiView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'oversikt' | 'betalningar' | 'fakturor' | 'skadestand' | 'budget'>('oversikt');
  const [isOffline, setIsOffline] = useState(offlineService.getIsOffline());
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [claims, setClaims] = useState<DamagesClaim[]>([]);
  const [forecasts, setForecasts] = useState<BudgetForecast[]>([]);
  
  const [showModal, setShowModal] = useState<'payment' | 'invoice' | 'claim' | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newPayment, setNewPayment] = useState({ amount: '', recipient: '', description: '' });
  const [newInvoice, setNewInvoice] = useState({ clientName: '', amount: '', dueDate: '' });
  const [newClaim, setNewClaim] = useState({ claimant: '', defendant: '', type: 'STATE' as any, amount: '', description: '' });

  const [showLinkModal, setShowLinkModal] = useState<string | null>(null); // claimId
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    const sub = offlineService.subscribe(setIsOffline);
    loadData();
    loadCases();
    return () => sub();
  }, []);

  const loadCases = async () => {
    try {
      const { db } = await import('../lib/db');
      const allDocs = await db.getAllDocuments();
      setCases(allDocs);
    } catch (e) {
      console.error('Kunde inte ladda ärenden:', e);
    }
  };

  const handleLinkClaimToCase = async (claimId: string, caseId: string) => {
    await economicService.updateClaim(claimId, { linkedCaseId: caseId });
    setShowLinkModal(null);
    loadData();
  };

  const loadData = async () => {
    setPayments(economicService.getPayments());
    setInvoices(economicService.getInvoices());
    setClaims(economicService.getClaims());
    setForecasts(economicService.getForecasts());
  };

  const handleAddPayment = async () => {
    if (!newPayment.amount || !newPayment.recipient) return;
    const p: Payment = {
      id: generateId('PAY'),
      amount: parseFloat(newPayment.amount),
      currency: 'SEK',
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0],
      recipient: newPayment.recipient,
      description: newPayment.description
    };
    await economicService.addPayment(p);
    setNewPayment({ amount: '', recipient: '', description: '' });
    setShowModal(null);
    loadData();
  };

  const handleAddInvoice = async () => {
    if (!newInvoice.amount || !newInvoice.clientName) return;
    const i: Invoice = {
      id: generateId('INV'),
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: newInvoice.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: parseFloat(newInvoice.amount),
      vat: parseFloat(newInvoice.amount) * 0.25,
      total: parseFloat(newInvoice.amount) * 1.25,
      status: 'SENT',
      clientName: newInvoice.clientName,
      items: [{ id: generateId('ITEM'), description: 'Juridiska tjänster', quantity: 1, unitPrice: parseFloat(newInvoice.amount), total: parseFloat(newInvoice.amount) }]
    };
    await economicService.addInvoice(i);
    setNewInvoice({ clientName: '', amount: '', dueDate: '' });
    setShowModal(null);
    loadData();
  };

  const handleAddClaim = async () => {
    if (!newClaim.amount || !newClaim.claimant || !newClaim.defendant) return;
    const c: DamagesClaim = {
      id: generateId('CLAIM'),
      claimant: newClaim.claimant,
      defendant: newClaim.defendant,
      type: newClaim.type,
      legalBasis: ['Skadeståndslagen'],
      estimatedAmount: parseFloat(newClaim.amount),
      probability: 0.5,
      status: 'FILED',
      components: [
        { id: generateId('COMP'), label: 'Huvudkrav', amount: parseFloat(newClaim.amount), description: newClaim.description }
      ],
      description: newClaim.description
    };
    await economicService.addClaim(c);
    setNewClaim({ claimant: '', defendant: '', type: 'STATE', amount: '', description: '' });
    setShowModal(null);
    loadData();
  };

  const handleAnalyzeClaim = async (claim: DamagesClaim) => {
    if (isOffline) return;
    setLoading(true);
    const analysis = await economicService.analyzeClaimAI(claim);
    await economicService.updateClaim(claim.id, { aiAnalysis: analysis });
    setLoading(false);
    loadData();
  };

  const handleDeleteClaim = async (id: string) => {
    await economicService.deleteClaim(id);
    loadData();
  };

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalInvoices = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalClaims = claims.reduce((sum, c) => sum + c.estimatedAmount, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ekonomisk Motor</h1>
          <p className="text-slate-500 text-sm">Avancerad hantering av betalningar, fakturor och skadeståndsprocesser.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowModal('claim')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} /> Nytt Krav
          </button>
          <button 
            onClick={() => setShowModal('invoice')}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <FileText size={18} /> Skapa Faktura
          </button>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'oversikt', label: 'Översikt', icon: BarChart3 },
          { id: 'betalningar', label: 'Betalningar', icon: CreditCard },
          { id: 'fakturor', label: 'Fakturor', icon: FileText },
          { id: 'skadestand', label: 'Skadestånd', icon: ShieldAlert },
          { id: 'budget', label: 'Budget & Prognos', icon: TrendingUp },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeSubTab === tab.id 
                ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'oversikt' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="md:col-span-2 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><CreditCard size={20} /></div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">+12%</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{totalPayments.toLocaleString('sv-SE')} kr</div>
                  <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Totala Intäkter</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><FileText size={20} /></div>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">-5%</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{totalInvoices.toLocaleString('sv-SE')} kr</div>
                  <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Utställda Fakturor</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><ShieldAlert size={20} /></div>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">AKTIVA</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{totalClaims.toLocaleString('sv-SE')} kr</div>
                  <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Skadeståndsvärde</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Senaste Aktivitet</h3>
                  <button className="text-xs text-blue-600 font-medium hover:underline">Visa alla</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {payments.slice(0, 5).map(p => (
                    <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{p.recipient}</div>
                          <div className="text-[10px] text-slate-400 uppercase">{p.date} · {p.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-600">+{p.amount.toLocaleString('sv-SE')} kr</div>
                        <div className="text-[10px] text-slate-400 uppercase">{p.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* AI Insights Card */}
              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={120} /></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center"><BrainCircuit size={18} /></div>
                    <span className="text-xs font-bold uppercase tracking-widest">AI-Analys</span>
                  </div>
                  <h4 className="text-lg font-bold mb-2">Antifragil Prognos</h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    Ditt nuvarande kassaflöde visar en positiv trend, men 3 aktiva skadeståndskrav mot staten skapar en osäkerhet på ca 250k kr. Vi rekommenderar att reservera 15% av nästa månads intäkter för rättsliga omkostnader.
                  </p>
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl py-2 text-xs font-bold transition-all uppercase tracking-widest">
                    Optimera Likviditet
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Snabba Åtgärder</h3>
                <div className="space-y-2">
                  <button onClick={() => setShowModal('payment')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"><Plus size={16} /></div>
                      <span className="text-sm font-medium text-slate-700">Registrera Betalning</span>
                    </div>
                    <ArrowRight size={14} className="text-slate-300" />
                  </button>
                  <button onClick={() => setShowModal('invoice')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Plus size={16} /></div>
                      <span className="text-sm font-medium text-slate-700">Skapa Ny Faktura</span>
                    </div>
                    <ArrowRight size={14} className="text-slate-300" />
                  </button>
                  <button onClick={() => setShowModal('claim')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors"><Plus size={16} /></div>
                      <span className="text-sm font-medium text-slate-700">Nytt Skadeståndskrav</span>
                    </div>
                    <ArrowRight size={14} className="text-slate-300" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'betalningar' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-400" placeholder="Sök betalningar..." />
              </div>
              <button onClick={() => setShowModal('payment')} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
                <Plus size={14} /> Ny Betalning
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">Mottagare</th>
                    <th className="px-6 py-4">Datum</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Belopp</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900">{p.recipient}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{p.description}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{p.date}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${
                          p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                          p.status === 'FAILED' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">{p.amount.toLocaleString('sv-SE')} kr</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-300 hover:text-slate-600 transition-colors"><MoreVertical size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'fakturor' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="md:col-span-2 space-y-4">
              {invoices.map(inv => (
                <div key={inv.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-200 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FileText size={24} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{inv.clientName}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">{inv.invoiceNumber} · Utfärdad {inv.issueDate}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900">{inv.total.toLocaleString('sv-SE')} kr</div>
                      <div className={`text-[10px] font-bold uppercase tracking-widest ${
                        inv.status === 'PAID' ? 'text-emerald-600' : 
                        inv.status === 'OVERDUE' ? 'text-rose-600' : 'text-blue-600'
                      }`}>
                        {inv.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={14} /> Förfaller {inv.dueDate}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <CheckCircle2 size={14} className={inv.status === 'PAID' ? 'text-emerald-500' : 'text-slate-300'} /> 
                        {inv.status === 'PAID' ? 'Betald' : 'Väntar på betalning'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><ExternalLink size={16} /></button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Faktura-statistik</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Betalda</span>
                      <span className="font-bold text-slate-900">75%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-3/4 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Förfallna</span>
                      <span className="font-bold text-slate-900">12%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 w-[12%] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'skadestand' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {claims.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <ShieldAlert size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Inga aktiva skadeståndskrav</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">Börja med att registrera ett nytt krav för att analysera juridiska risker och möjligheter.</p>
                <button onClick={() => setShowModal('claim')} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">
                  Registrera ditt första krav
                </button>
              </div>
            ) : (
              claims.map(claim => (
                <div key={claim.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                            claim.type === 'STATE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {claim.type === 'STATE' ? 'Statligt Skadestånd' : 'Privat Skadestånd'}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                            {claim.status}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                          {claim.claimant} <span className="text-slate-300 font-light italic text-base">mot</span> {claim.defendant}
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">{claim.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                          {claim.legalBasis.map((basis, idx) => (
                            <span key={idx} className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                              {basis}
                            </span>
                          ))}
                          
                          {/* NY: Visa kopplat ärende om det finns */}
                          {claim.linkedCaseId && (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                              <CheckCircle2 size={12} /> KOPPLAT TILL ÄRENDE: {cases.find(c => c.id === claim.linkedCaseId)?.name || claim.linkedCaseId}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Skadekomponenter</h4>
                            <div className="space-y-3">
                              {claim.components.map(comp => (
                                <div key={comp.id} className="flex justify-between items-start group/comp">
                                  <div>
                                    <div className="text-xs font-bold text-slate-800">{comp.label}</div>
                                    <div className="text-[10px] text-slate-500">{comp.description}</div>
                                  </div>
                                  <div className="text-xs font-black text-slate-900 whitespace-nowrap">{comp.amount.toLocaleString('sv-SE')} kr</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 relative group/ai">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">AI-Analys & Risk</h4>
                              {loading ? (
                                <div className="animate-spin text-blue-600"><BrainCircuit size={14} /></div>
                              ) : (
                                <button 
                                  onClick={() => handleAnalyzeClaim(claim)}
                                  disabled={isOffline}
                                  className="text-[10px] font-bold text-blue-600 hover:underline disabled:opacity-50"
                                >
                                  Uppdatera Analys
                                </button>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-600 leading-relaxed italic">
                              {claim.aiAnalysis || (isOffline ? 'Offline-läge: AI-analys ej tillgänglig.' : 'Klicka för att generera en juridisk riskbedömning baserad på praxis.')}
                            </div>
                            <div className="mt-4 pt-3 border-t border-blue-100 flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sannolikhet för bifall</span>
                              <span className="text-sm font-black text-blue-600">{Math.round(claim.probability * 100)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="md:w-56 flex flex-col justify-between border-l border-slate-100 md:pl-6">
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Totalt Kravbelopp</div>
                          <div className="text-3xl font-black text-slate-900 tracking-tighter">{claim.estimatedAmount.toLocaleString('sv-SE')} <span className="text-lg font-normal text-slate-400">kr</span></div>
                        </div>
                        
                        <div className="space-y-2 mt-6">
                          <button className="w-full bg-slate-900 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                            <FileText size={14} /> Generera Inlaga
                          </button>
                          <button className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl py-2.5 text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                            <Search size={14} /> Hitta Praxis
                          </button>
                          {/* NY: Extra knapp för sammankoppling */}
                          <button 
                            onClick={() => setShowLinkModal(claim.id)}
                            className={`w-full border rounded-xl py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                              claim.linkedCaseId 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' 
                                : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                            }`}
                          >
                            <ExternalLink size={14} /> {claim.linkedCaseId ? 'Ändra Koppling' : 'Koppla till Ärende'}
                          </button>
                          <button 
                            onClick={() => handleDeleteClaim(claim.id)}
                            className="w-full text-rose-600 text-[10px] font-bold uppercase tracking-widest py-2 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            Radera Krav
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeSubTab === 'budget' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">Kassaflödesanalys</h3>
              <div className="space-y-6">
                <div className="flex items-end gap-2 h-48">
                  {[45, 60, 35, 80, 55, 70, 90].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-slate-100 rounded-t-lg relative group">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-lg transition-all duration-500" 
                          style={{ height: `${h}%` }} 
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {h*10}k
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">M{i+1}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="text-[10px] font-black text-emerald-600 uppercase mb-1">Genomsnittlig Intäkt</div>
                    <div className="text-xl font-black text-emerald-700">62.400 kr</div>
                  </div>
                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                    <div className="text-[10px] font-black text-rose-600 uppercase mb-1">Genomsnittlig Utgift</div>
                    <div className="text-xl font-black text-rose-700">48.200 kr</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-4 uppercase tracking-tight">Antifragil Prognos</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-700">Konfidensgrad</span>
                      <span className="text-xs font-black text-blue-600">85%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[85%] rounded-full" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Vår AI-modell har simulerat 10 000 scenarier baserat på din historik och pågående skadeståndsmål. Prognosen för Q2 indikerar en tillväxt på 12% med en risk för "svarta svanar" (oväntade rättsliga utfall) på endast 4%.
                  </p>
                  <button className="w-full bg-blue-600 text-white rounded-xl py-3 text-xs font-bold hover:bg-blue-700 transition-all uppercase tracking-widest">
                    Generera Detaljerad Rapport
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-3 text-amber-700">
                  <AlertCircle size={20} />
                  <h4 className="text-sm font-black uppercase tracking-tight">Varning: Likviditetsrisk</h4>
                </div>
                <p className="text-xs text-amber-800/80 leading-relaxed">
                  Om skadeståndskravet "CLAIM-2026-001" inte avgörs till din fördel kan likviditeten sjunka under rekommenderad nivå i maj. Överväg att tidigarelägga fakturering för projekt "X".
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showLinkModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLinkModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Koppla till Ärende</h3>
                  <button onClick={() => setShowLinkModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {cases.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">Inga ärenden hittades i arkivet.</p>
                  ) : (
                    cases.map(c => (
                      <button 
                        key={c.id}
                        onClick={() => handleLinkClaimToCase(showLinkModal, c.id)}
                        className="w-full p-4 text-left border border-slate-100 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
                      >
                        <div className="text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">{c.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">{c.id} · {new Date(c.createdAt).toLocaleDateString()}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    {showModal === 'payment' ? 'Registrera Betalning' : 
                     showModal === 'invoice' ? 'Skapa Faktura' : 'Nytt Skadeståndskrav'}
                  </h3>
                  <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>

                {showModal === 'payment' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Mottagare</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition-all" 
                        placeholder="T.ex. Advokatbyrå X"
                        value={newPayment.recipient}
                        onChange={e => setNewPayment(p => ({ ...p, recipient: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Belopp (SEK)</label>
                      <input 
                        type="number"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition-all" 
                        placeholder="0.00"
                        value={newPayment.amount}
                        onChange={e => setNewPayment(p => ({ ...p, amount: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Beskrivning</label>
                      <textarea 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition-all h-24 resize-none" 
                        placeholder="Vad avser betalningen?"
                        value={newPayment.description}
                        onChange={e => setNewPayment(p => ({ ...p, description: e.target.value }))}
                      />
                    </div>
                    <button 
                      onClick={handleAddPayment}
                      className="w-full bg-blue-600 text-white rounded-2xl py-4 text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                      Spara Betalning
                    </button>
                  </div>
                )}

                {showModal === 'invoice' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Kund / Klient</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition-all" 
                        placeholder="Fullständigt namn"
                        value={newInvoice.clientName}
                        onChange={e => setNewInvoice(p => ({ ...p, clientName: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Belopp (exkl. moms)</label>
                        <input 
                          type="number"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition-all" 
                          placeholder="0.00"
                          value={newInvoice.amount}
                          onChange={e => setNewInvoice(p => ({ ...p, amount: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Förfallodatum</label>
                        <input 
                          type="date"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition-all" 
                          value={newInvoice.dueDate}
                          onChange={e => setNewInvoice(p => ({ ...p, dueDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handleAddInvoice}
                      className="w-full bg-emerald-600 text-white rounded-2xl py-4 text-sm font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                    >
                      Skapa Faktura
                    </button>
                  </div>
                )}

                {showModal === 'claim' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Kärande</label>
                        <input 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition-all" 
                          placeholder="Vem kräver?"
                          value={newClaim.claimant}
                          onChange={e => setNewClaim(p => ({ ...p, claimant: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Svarande</label>
                        <input 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition-all" 
                          placeholder="Vem krävs?"
                          value={newClaim.defendant}
                          onChange={e => setNewClaim(p => ({ ...p, defendant: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Typ</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition-all"
                          value={newClaim.type}
                          onChange={e => setNewClaim(p => ({ ...p, type: e.target.value as any }))}
                        >
                          <option value="STATE">Statligt</option>
                          <option value="PRIVATE">Privat</option>
                          <option value="CIVIL">Civilrättsligt</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Belopp (SEK)</label>
                        <input 
                          type="number"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition-all" 
                          placeholder="0.00"
                          value={newClaim.amount}
                          onChange={e => setNewClaim(p => ({ ...p, amount: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Beskrivning & Grund</label>
                      <textarea 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition-all h-24 resize-none" 
                        placeholder="Kort beskrivning av händelsen..."
                        value={newClaim.description}
                        onChange={e => setNewClaim(p => ({ ...p, description: e.target.value }))}
                      />
                    </div>
                    <button 
                      onClick={handleAddClaim}
                      className="w-full bg-amber-600 text-white rounded-2xl py-4 text-sm font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-200"
                    >
                      Registrera Krav
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EkonomiView;
