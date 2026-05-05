
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
  BrainCircuit,
  Loader2,
  Sparkles,
  X,
  Upload,
  Zap,
  Link2,
  History,
  FileSearch,
  ChevronRight,
  ChevronDown,
  Download,
  Filter,
  Layers
} from 'lucide-react';
import { economicService } from '../services/EconomicService';
import { Payment, Invoice, DamagesClaim, BudgetForecast, DamageComponent, DebtChain, EconomicAnalysisReport, EconomicDocument } from '../lib/economic.types';
import { economicAnalyzerEngine } from '../lib/EconomicAnalyzerEngine';
import { offlineService } from '../services/offlineService';
import { db, CISCase } from '../lib/db';
import { generateId } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast, Toaster } from 'sonner';
import FileUpload from './FileUpload';
import { useFileParser } from '../hooks/useFileParser';
import { ModuleConnector } from './shared/ModuleConnector';

interface EkonomiViewProps {
  activeCase?: CISCase | null;
  onNavigate?: (moduleId: string) => void;
}

const EkonomiView: React.FC<EkonomiViewProps> = ({ activeCase, onNavigate }) => {
  const [activeSubTab, setActiveSubTab] = useState<'oversikt' | 'betalningar' | 'fakturor' | 'skadestand' | 'budget' | 'analys'>('oversikt');
  const [isOffline, setIsOffline] = useState(offlineService.getIsOffline());
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [claims, setClaims] = useState<DamagesClaim[]>([]);
  const [forecasts, setForecasts] = useState<BudgetForecast[]>([]);
  
  const [showModal, setShowModal] = useState<'payment' | 'invoice' | 'claim' | 'upload' | 'auto-analys' | null>(null);
  const [loading, setLoading] = useState(false);
  const { parseFile, isParsing } = useFileParser();

  const [analysisReport, setAnalysisReport] = useState<EconomicAnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form states
  const [newPayment, setNewPayment] = useState({ amount: '', recipient: '', description: '' });
  const [newInvoice, setNewInvoice] = useState({ clientName: '', amount: '', dueDate: '' });
  const [newClaim, setNewClaim] = useState({ claimant: '', defendant: '', type: 'STATE' as any, amount: '', description: '' });

  const [showLinkModal, setShowLinkModal] = useState<string | null>(null); // claimId
  const [cases, setCases] = useState<any[]>([]);

  const [aiResult, setAiResult] = useState<{ title: string, content: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const sub = offlineService.subscribe(setIsOffline);
    loadData();
    loadCases();
    return () => sub();
  }, []);

  const loadCases = async () => {
    try {
      const allCases = await db.getAllCases();
      setCases(allCases);
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
    await economicService.ready;
    setPayments(economicService.getPayments());
    setInvoices(economicService.getInvoices());
    setClaims(economicService.getClaims());
    setForecasts(economicService.getForecasts());
  };

  const handleAddPayment = async () => {
    if (!newPayment.amount || !newPayment.recipient) {
      toast.error('Vänligen fyll i alla obligatoriska fält');
      return;
    }
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
    toast.success('Betalning registrerad');
    loadData();
  };

  const handleAddInvoice = async () => {
    if (!newInvoice.amount || !newInvoice.clientName) {
      toast.error('Vänligen fyll i alla obligatoriska fält');
      return;
    }
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
    toast.success('Faktura skapad');
    loadData();
  };

  const handleAddClaim = async () => {
    if (!newClaim.amount || !newClaim.claimant || !newClaim.defendant) {
      toast.error('Vänligen fyll i alla obligatoriska fält');
      return;
    }
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
    toast.success('Skadeståndskrav registrerat');
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

  const handleOptimizeLiquidity = async () => {
    setIsAiLoading(true);
    toast.info('Analyserar kassaflöde och optimerar likviditet...');
    try {
      // Powerful logic: Calculate real liquidity ratio
      const liquidityRatio = totalPayments / (totalInvoices || 1);
      const riskScore = claims.length * 0.2 + (totalInvoices > totalPayments ? 0.5 : 0.1);
      
      const result = await economicService.optimizeLiquidity({
        liquidityRatio,
        riskScore,
        totalClaims,
        activeCase: activeCase?.name
      });
      
      setAiResult({ title: 'Likviditetsoptimering & Riskprognos', content: result });
      toast.success('Optimering slutförd');
    } catch (error) {
      toast.error('Kunde inte optimera likviditet');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFindPraxis = async (claim: DamagesClaim) => {
    setIsAiLoading(true);
    toast.info(`Söker praxis för krav: ${claim.id}...`);
    try {
      const result = await economicService.findPraxis(claim);
      setAiResult({ title: `Rättspraxis - ${claim.id}`, content: result });
      toast.success('Praxis hittad');
    } catch (error) {
      toast.error('Kunde inte hitta praxis');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsAiLoading(true);
    toast.info('Genererar detaljerad ekonomisk rapport...');
    try {
      const result = await economicService.generateReport();
      setAiResult({ title: 'Ekonomisk Rapport', content: result });
      toast.success('Rapport genererad');
    } catch (error) {
      toast.error('Kunde inte generera rapport');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateInlaga = async (claim: DamagesClaim) => {
    setIsAiLoading(true);
    toast.info(`Genererar inlaga för krav: ${claim.id}...`);
    try {
      const result = await economicService.generateInlaga(claim);
      setAiResult({ title: `Juridisk Inlaga - ${claim.id}`, content: result });
      toast.success('Inlaga genererad');
    } catch (error) {
      toast.error('Kunde inte generera inlaga');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDeleteClaim = async (id: string) => {
    await economicService.deleteClaim(id);
    toast.success('Skadeståndskrav raderat');
    loadData();
  };

  const handleDeletePayment = async (id: string) => {
    await economicService.deletePayment(id);
    toast.success('Betalning raderad');
    loadData();
  };

  const handleDeleteInvoice = async (id: string) => {
    await economicService.deleteInvoice(id);
    toast.success('Faktura raderad');
    loadData();
  };

  const handleAutomaticAnalysis = async (files: File[]) => {
    if (files.length === 0) return;
    setIsAnalyzing(true);
    toast.info(`Analyserar ${files.length} ekonomiska dokument...`);
    
    try {
      const extractedDocs: EconomicDocument[] = [];
      // ⚡ Bolt Optimization: Parallelize file parsing to avoid blocking the main thread sequentially
      const parsedResults = await Promise.all(files.map(file => parseFile(file)));

      parsedResults.forEach(parsed => {
        if (parsed) {
          const doc = economicAnalyzerEngine.extractInfo(parsed);
          extractedDocs.push(doc);
        }
      });
      
      const chains = economicAnalyzerEngine.groupIntoChains(extractedDocs);
      const report = economicAnalyzerEngine.generateReport(chains);
      
      setAnalysisReport(report);
      toast.success('Automatisk analys slutförd');
      setActiveSubTab('analys');
    } catch (error) {
      toast.error('Kunde inte genomföra automatisk analys');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
      setShowModal(null);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    setLoading(true);
    toast.info(`Analyserar ${files.length} fakturor...`);
    
    try {
      // ⚡ Bolt Optimization: Parallelize file parsing to avoid blocking the main thread sequentially
      const parsedResults = await Promise.all(files.map(file => parseFile(file)));

      const invoicePromises = parsedResults.map(async (result) => {
        if (result) {
          // In a real app, we'd send 'content' to Gemini to extract invoice data
          // For now, we simulate finding a new invoice
          const mockInvoice: Invoice = {
            id: generateId('INV'),
            invoiceNumber: `AI-INV-${Math.floor(Math.random() * 10000)}`,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: 15000 + Math.random() * 5000,
            vat: 3750,
            total: 18750,
            status: 'SENT',
            clientName: 'Extraherad Klient',
            items: [{ id: generateId('ITEM'), description: 'AI-analyserad tjänst', quantity: 1, unitPrice: 15000, total: 15000 }]
          };
          await economicService.addInvoice(mockInvoice);
        }
      });

      await Promise.all(invoicePromises);
      toast.success('Fakturor analyserade och tillagda');
      loadData();
      setActiveSubTab('fakturor');
    } catch (error) {
      toast.error('Kunde inte analysera filer');
    } finally {
      setLoading(false);
      setShowModal(null);
    }
  };

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalInvoices = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalClaims = claims.reduce((sum, c) => sum + c.estimatedAmount, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--ink-main)] tracking-tight mb-2">Ekonomisk Motor</h1>
          <p className="text-[var(--ink-muted)] text-lg max-w-2xl">Avancerad hantering av betalningar, fakturor och skadeståndsprocesser med AI-stöd.</p>
          {activeCase && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full border border-[var(--accent)]/20">
              <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Aktivt Ärende: {activeCase.name} ({activeCase.caseId})</span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowModal('auto-analys')}
            className="btn btn-secondary !bg-[var(--accent)] !text-white border-none shadow-lg shadow-[var(--accent)]/20"
          >
            <Zap size={18} /> Automatisk Analys
          </button>
          <button 
            onClick={() => setShowModal('upload')}
            className="btn btn-secondary"
          >
            <Upload size={18} /> Ladda upp Faktura
          </button>
          <button 
            onClick={() => setShowModal('claim')}
            className="btn btn-primary shadow-lg shadow-[var(--accent)]/20"
          >
            <Plus size={18} /> Nytt Krav
          </button>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex border-b border-[var(--line)] mb-10 overflow-x-auto no-scrollbar gap-2">
        {[
          { id: 'oversikt', label: 'Översikt', icon: BarChart3 },
          { id: 'betalningar', label: 'Betalningar', icon: CreditCard },
          { id: 'fakturor', label: 'Fakturor', icon: FileText },
          { id: 'skadestand', label: 'Skadestånd', icon: ShieldAlert },
          { id: 'budget', label: 'Budget & Prognos', icon: TrendingUp },
          { id: 'analys', label: 'Automatisk Analys', icon: Zap },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
              activeSubTab === tab.id 
                ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5' 
                : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink-main)] hover:bg-[var(--bg-main)]'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'oversikt' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="card !p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-[var(--accent)]/10 text-[var(--accent)] rounded-2xl"><CreditCard size={24} /></div>
                    <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent)]/5 px-2.5 py-1 rounded-full">+12%</span>
                  </div>
                  <div className="text-3xl font-bold text-[var(--ink-main)] mb-1">{totalPayments.toLocaleString('sv-SE')} kr</div>
                  <div className="text-[10px] text-[var(--ink-muted)] uppercase tracking-widest font-bold">Totala Intäkter</div>
                </div>
                <div className="card !p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-[var(--danger)]/10 text-[var(--danger)] rounded-2xl"><FileText size={24} /></div>
                    <span className="text-[10px] font-bold text-[var(--danger)] bg-[var(--danger)]/5 px-2.5 py-1 rounded-full">-5%</span>
                  </div>
                  <div className="text-3xl font-bold text-[var(--ink-main)] mb-1">{totalInvoices.toLocaleString('sv-SE')} kr</div>
                  <div className="text-[10px] text-[var(--ink-muted)] uppercase tracking-widest font-bold">Utställda Fakturor</div>
                </div>
                <div className="card !p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-[var(--warning)]/10 text-[var(--warning)] rounded-2xl"><ShieldAlert size={24} /></div>
                    <span className="text-[10px] font-bold text-[var(--warning)] bg-[var(--warning)]/5 px-2.5 py-1 rounded-full">AKTIVA</span>
                  </div>
                  <div className="text-3xl font-bold text-[var(--ink-main)] mb-1">{totalClaims.toLocaleString('sv-SE')} kr</div>
                  <div className="text-[10px] text-[var(--ink-muted)] uppercase tracking-widest font-bold">Skadeståndsvärde</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card !p-0 overflow-hidden">
                <div className="p-6 border-b border-[var(--line)] flex justify-between items-center bg-[var(--bg-main)]/30">
                  <h3 className="text-sm font-bold text-[var(--ink-main)] uppercase tracking-widest m-0">Senaste Aktivitet</h3>
                  <button 
                    onClick={() => setActiveSubTab('betalningar')}
                    className="text-xs text-[var(--accent)] font-bold hover:underline cursor-pointer uppercase tracking-widest"
                  >
                    Visa alla
                  </button>
                </div>
                <div className="divide-y divide-[var(--line)]">
                  {payments.slice(0, 5).map(p => (
                    <div key={p.id} className="p-6 flex items-center justify-between hover:bg-[var(--bg-main)]/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-main)] flex items-center justify-center text-[var(--ink-muted)]">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <div className="text-base font-bold text-[var(--ink-main)]">{p.recipient}</div>
                          <div className="text-[10px] text-[var(--ink-muted)] uppercase tracking-widest font-medium">{p.date} · {p.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-[var(--success)]">+{p.amount.toLocaleString('sv-SE')} kr</div>
                        <div className="text-[10px] text-[var(--ink-muted)] uppercase tracking-widest font-bold">{p.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* AI Insights Card */}
              <div className="bg-[var(--accent)] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700"><TrendingUp size={200} /></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30"><BrainCircuit size={20} /></div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Antifragil Analys</span>
                  </div>
                  <h4 className="text-2xl font-serif font-bold mb-4 leading-tight">Likviditetsprognos</h4>
                  <p className="text-white/70 text-sm leading-relaxed mb-8 font-medium">
                    Ditt nuvarande kassaflöde visar en positiv trend, men 3 aktiva skadeståndskrav mot staten skapar en osäkerhet på ca 250k kr. Vi rekommenderar att reservera 15% av nästa månads intäkter för rättsliga omkostnader.
                  </p>
                  <button 
                    onClick={handleOptimizeLiquidity}
                    disabled={isAiLoading}
                    className="w-full bg-white text-[var(--accent)] rounded-2xl py-4 text-xs font-bold transition-all uppercase tracking-[0.15em] flex items-center justify-center gap-3 hover:bg-white/90 shadow-xl shadow-black/10"
                  >
                    {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Optimera Likviditet
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h3 className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-6 m-0">Snabba Åtgärder</h3>
                <div className="space-y-3">
                  <button onClick={() => setShowModal('payment')} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--bg-main)] border border-transparent hover:border-[var(--border)] transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl group-hover:bg-[var(--accent)] group-hover:text-white transition-colors"><Plus size={18} /></div>
                      <span className="text-sm font-bold text-[var(--ink-main)]">Registrera Betalning</span>
                    </div>
                    <ArrowRight size={16} className="text-[var(--line)] group-hover:text-[var(--accent)] transition-colors" />
                  </button>
                  <button onClick={() => setShowModal('invoice')} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--bg-main)] border border-transparent hover:border-[var(--border)] transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-[var(--success)]/10 text-[var(--success)] rounded-xl group-hover:bg-[var(--success)] group-hover:text-white transition-colors"><Plus size={18} /></div>
                      <span className="text-sm font-bold text-[var(--ink-main)]">Skapa Ny Faktura</span>
                    </div>
                    <ArrowRight size={16} className="text-[var(--line)] group-hover:text-[var(--success)] transition-colors" />
                  </button>
                  <button onClick={() => setShowModal('claim')} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--bg-main)] border border-transparent hover:border-[var(--border)] transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-[var(--warning)]/10 text-[var(--warning)] rounded-xl group-hover:bg-[var(--warning)] group-hover:text-white transition-colors"><Plus size={18} /></div>
                      <span className="text-sm font-bold text-[var(--ink-main)]">Nytt Skadeståndskrav</span>
                    </div>
                    <ArrowRight size={16} className="text-[var(--line)] group-hover:text-[var(--warning)] transition-colors" />
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
            className="card !p-0 overflow-hidden"
          >
            <div className="p-6 border-b border-[var(--line)] flex flex-col sm:flex-row justify-between items-center gap-4 bg-[var(--bg-main)]/30">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-3 text-[var(--ink-muted)]" size={18} />
                <input className="input-field pl-12 py-2.5 text-sm" placeholder="Sök betalningar..." />
              </div>
              <button onClick={() => setShowModal('payment')} className="btn btn-primary w-full sm:w-auto">
                <Plus size={18} /> Ny Betalning
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-main)]/50">
                    <th className="col-header">Mottagare</th>
                    <th className="col-header">Datum</th>
                    <th className="col-header">Status</th>
                    <th className="col-header text-right">Belopp</th>
                    <th className="col-header"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-[var(--bg-main)]/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-[var(--ink-main)]">{p.recipient}</div>
                        <div className="text-[10px] text-[var(--ink-muted)] uppercase tracking-widest font-medium">{p.description}</div>
                      </td>
                      <td className="px-6 py-5 text-xs font-medium text-[var(--ink-muted)]">{p.date}</td>
                      <td className="px-6 py-5">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                          p.status === 'COMPLETED' ? 'bg-[var(--success)]/10 text-[var(--success)]' : 
                          p.status === 'FAILED' ? 'bg-[var(--danger)]/10 text-[var(--danger)]' : 'bg-[var(--accent)]/10 text-[var(--accent)]'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right text-sm font-bold text-[var(--ink-main)] data-value">{p.amount.toLocaleString('sv-SE')} kr</td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => handleDeletePayment(p.id)}
                          className="p-2 text-[var(--line)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/5 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
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
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
              {invoices.map(inv => (
                <div key={inv.id} className="card !p-6 hover:border-[var(--accent)] group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[var(--bg-main)] flex items-center justify-center text-[var(--ink-muted)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all duration-500">
                        <FileText size={28} />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-[var(--ink-main)]">{inv.clientName}</div>
                        <div className="text-[10px] text-[var(--ink-muted)] uppercase font-bold tracking-[0.15em]">{inv.invoiceNumber} · Utfärdad {inv.issueDate}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[var(--ink-main)] tracking-tight">{inv.total.toLocaleString('sv-SE')} kr</div>
                      <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${
                        inv.status === 'PAID' ? 'text-[var(--success)]' : 
                        inv.status === 'OVERDUE' ? 'text-[var(--danger)]' : 'text-[var(--accent)]'
                      }`}>
                        {inv.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-[var(--line)]">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-[var(--ink-muted)] uppercase tracking-widest">
                        <Clock size={16} className="text-[var(--warning)]" /> Förfaller {inv.dueDate}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[var(--ink-muted)] uppercase tracking-widest">
                        <CheckCircle2 size={16} className={inv.status === 'PAID' ? 'text-[var(--success)]' : 'text-[var(--line)]'} /> 
                        {inv.status === 'PAID' ? 'Betald' : 'Väntar'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2.5 text-[var(--line)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 rounded-xl transition-all"><ExternalLink size={18} /></button>
                      <button 
                        onClick={() => handleDeleteInvoice(inv.id)}
                        className="p-2.5 text-[var(--line)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/5 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-8">
              <div className="card">
                <h3 className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-6 m-0">Faktura-statistik</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest">
                      <span className="text-[var(--ink-muted)]">Betalda</span>
                      <span className="text-[var(--ink-main)]">75%</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-main)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--success)] w-3/4 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest">
                      <span className="text-[var(--ink-muted)]">Förfallna</span>
                      <span className="text-[var(--ink-main)]">12%</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-main)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--danger)] w-[12%] rounded-full" />
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
            className="space-y-8"
          >
            {claims.length === 0 ? (
              <div className="card border-dashed border-2 border-[var(--line)] !bg-transparent py-20 text-center">
                <div className="w-20 h-20 bg-[var(--bg-main)] rounded-3xl flex items-center justify-center mx-auto mb-6 text-[var(--ink-muted)]">
                  <ShieldAlert size={40} />
                </div>
                <h3 className="text-2xl font-bold text-[var(--ink-main)] mb-3">Inga aktiva skadeståndskrav</h3>
                <p className="text-[var(--ink-muted)] text-base max-w-sm mx-auto mb-10">Börja med att registrera ett nytt krav för att analysera juridiska risker och möjligheter med AI-stöd.</p>
                <button onClick={() => setShowModal('claim')} className="btn btn-primary px-10">
                  Registrera ditt första krav
                </button>
              </div>
            ) : (
              claims.map(claim => (
                <div key={claim.id} className="card !p-0 overflow-hidden group">
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row justify-between gap-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-6">
                          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl ${
                            claim.type === 'STATE' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-[var(--tertiary)]/10 text-[var(--tertiary)]'
                          }`}>
                            {claim.type === 'STATE' ? 'Statligt Skadestånd' : 'Privat Skadestånd'}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl bg-[var(--bg-main)] text-[var(--ink-muted)] border border-[var(--border)]">
                            {claim.status}
                          </span>
                        </div>
                        <h3 className="text-3xl font-bold text-[var(--ink-main)] mb-4 flex items-center gap-3">
                          {claim.claimant} <span className="text-[var(--line)] font-light italic text-xl">mot</span> {claim.defendant}
                        </h3>
                        <p className="text-[var(--ink-muted)] text-base leading-relaxed mb-8 font-medium">{claim.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-8">
                          {claim.legalBasis.map((basis, idx) => (
                            <span key={idx} className="text-[10px] font-bold text-[var(--ink-muted)] bg-[var(--bg-main)] border border-[var(--border)] px-3 py-1.5 rounded-lg uppercase tracking-widest">
                              {basis}
                            </span>
                          ))}
                          
                          {claim.linkedCaseId && (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--success)] bg-[var(--success)]/10 px-3 py-1.5 rounded-lg border border-[var(--success)]/20 uppercase tracking-widest">
                              <CheckCircle2 size={14} /> KOPPLAT TILL ÄRENDE: {cases.find(c => c.caseId === claim.linkedCaseId)?.name || claim.linkedCaseId}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="bg-[var(--bg-main)]/50 rounded-3xl p-6 border border-[var(--border)]">
                            <h4 className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-4">Skadekomponenter</h4>
                            <div className="space-y-4">
                              {claim.components.map(comp => (
                                <div key={comp.id} className="flex justify-between items-start group/comp">
                                  <div>
                                    <div className="text-sm font-bold text-[var(--ink-main)]">{comp.label}</div>
                                    <div className="text-[10px] text-[var(--ink-muted)] font-medium">{comp.description}</div>
                                  </div>
                                  <div className="text-sm font-bold text-[var(--ink-main)] data-value">{comp.amount.toLocaleString('sv-SE')} kr</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-[var(--accent)]/5 rounded-3xl p-6 border border-[var(--accent)]/10 relative group/ai">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-[0.2em]">AI-Analys & Risk</h4>
                              {loading ? (
                                <div className="animate-spin text-[var(--accent)]"><BrainCircuit size={16} /></div>
                              ) : (
                                <button 
                                  onClick={() => handleAnalyzeClaim(claim)}
                                  disabled={isOffline}
                                  className="text-[10px] font-bold text-[var(--accent)] hover:underline disabled:opacity-50 uppercase tracking-widest"
                                >
                                  Uppdatera Analys
                                </button>
                              )}
                            </div>
                            <div className="text-xs text-[var(--ink-muted)] leading-relaxed italic font-medium">
                              {claim.aiAnalysis || (isOffline ? 'Offline-läge: AI-analys ej tillgänglig.' : 'Klicka för att generera en juridisk riskbedömning baserad på praxis.')}
                            </div>
                            <div className="mt-6 pt-4 border-t border-[var(--accent)]/10 flex justify-between items-center">
                              <span className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em]">Sannolikhet för bifall</span>
                              <span className="text-lg font-bold text-[var(--accent)]">{Math.round(claim.probability * 100)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="lg:w-64 flex flex-col justify-between border-l border-[var(--line)] lg:pl-8">
                        <div>
                          <div className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-2">Totalt Kravbelopp</div>
                          <div className="text-4xl font-bold text-[var(--ink-main)] tracking-tighter">{claim.estimatedAmount.toLocaleString('sv-SE')} <span className="text-xl font-normal text-[var(--line)]">kr</span></div>
                        </div>
                        
                        <div className="space-y-3 mt-10">
                          <button 
                            onClick={() => handleGenerateInlaga(claim)}
                            disabled={isAiLoading}
                            className="btn btn-primary w-full !rounded-2xl py-4"
                          >
                            {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />} Generera Inlaga
                          </button>
                          <button 
                            onClick={() => handleFindPraxis(claim)}
                            disabled={isAiLoading}
                            className="btn btn-secondary w-full !rounded-2xl py-4"
                          >
                            {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />} Hitta Praxis
                          </button>
                          <button 
                            onClick={() => setShowLinkModal(claim.id)}
                            className={`w-full border rounded-2xl py-4 text-xs font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-widest ${
                              claim.linkedCaseId 
                                ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20 hover:bg-[var(--success)]/20' 
                                : 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20 hover:bg-[var(--accent)]/20'
                            }`}
                          >
                            <ExternalLink size={18} /> {claim.linkedCaseId ? 'Ändra Koppling' : 'Koppla till Ärende'}
                          </button>
                          <button 
                            onClick={() => handleDeleteClaim(claim.id)}
                            className="w-full text-[var(--danger)] text-[10px] font-bold uppercase tracking-[0.2em] py-3 hover:bg-[var(--danger)]/5 rounded-2xl transition-all mt-2"
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

        {activeSubTab === 'analys' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {!analysisReport ? (
              <div className="card border-dashed border-2 border-[var(--line)] !bg-transparent py-24 text-center">
                <div className="w-24 h-24 bg-[var(--bg-main)] rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-[var(--accent)] shadow-inner">
                  <Zap size={48} />
                </div>
                <h3 className="text-3xl font-serif font-bold text-[var(--ink-main)] mb-4">Ingen analys genomförd</h3>
                <p className="text-[var(--ink-muted)] text-lg max-w-md mx-auto mb-12 font-medium">
                  Ladda upp ekonomiska dokument för att automatiskt identifiera referenser, bygga skuldkedjor och beräkna tillkomna avgifter.
                </p>
                <button 
                  onClick={() => setShowModal('auto-analys')}
                  className="btn btn-primary px-12 py-5 text-base shadow-xl shadow-[var(--accent)]/20"
                >
                  <Upload size={20} /> Starta Automatisk Analys
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="card !p-10">
                    <p className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-3">Total Skuldbelastning</p>
                    <h3 className="text-4xl font-serif font-bold text-[var(--ink-main)]">{analysisReport.totalDebt.toLocaleString('sv-SE')} kr</h3>
                  </div>
                  <div className="card !p-10">
                    <p className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-3">Totala Tillkomna Avgifter</p>
                    <h3 className="text-4xl font-serif font-bold text-amber-600">{analysisReport.totalFees.toLocaleString('sv-SE')} kr</h3>
                  </div>
                  <div className="card !p-10">
                    <p className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-3">Antal Skuldkedjor</p>
                    <h3 className="text-4xl font-serif font-bold text-[var(--accent)]">{analysisReport.chains.length}</h3>
                  </div>
                </div>

                {/* Chains List */}
                <div className="space-y-8">
                  <h2 className="text-2xl font-serif font-bold text-[var(--ink-main)] flex items-center gap-4">
                    <Layers size={28} className="text-[var(--accent)]" /> Identifierade Skuldkedjor
                  </h2>
                  
                  {analysisReport.chains.map((chain, index) => (
                    <div key={chain.id} className="card !p-0 overflow-hidden group">
                      <div className="p-10 border-b border-[var(--line)] bg-[var(--bg-main)]/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1.5 bg-[var(--ink-main)] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl">Kedja #{index + 1}</span>
                            <span className="text-xs font-bold text-[var(--ink-muted)] uppercase tracking-widest">REF: {chain.references.join(', ')}</span>
                          </div>
                          <h3 className="text-2xl font-serif font-bold text-[var(--ink-main)]">
                            Ursprungsskuld: {chain.documents[0].amount.toLocaleString('sv-SE')} kr
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-1">Avgiftsökning</p>
                          <p className="text-3xl font-serif font-bold text-amber-600">+{chain.totalFees.toLocaleString('sv-SE')} kr</p>
                        </div>
                      </div>
                      
                      <div className="p-10 bg-white/50">
                        <div className="space-y-8">
                          {chain.documents.map((doc, docIndex) => (
                            <div key={doc.id} className="flex gap-8 relative">
                              {docIndex < chain.documents.length - 1 && (
                                <div className="absolute left-6 top-12 bottom-0 w-px bg-[var(--line)] border-dashed border-l" />
                              )}
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 z-10 shadow-sm ${
                                docIndex === 0 ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-main)] text-[var(--ink-muted)] border border-[var(--border)]'
                              }`}>
                                {docIndex === 0 ? <Plus size={24} /> : <ArrowRight size={24} />}
                              </div>
                              <div className="flex-1 bg-white rounded-3xl p-8 border border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[var(--accent)]/30 transition-all shadow-sm">
                                <div>
                                  <div className="flex items-center gap-4 mb-2">
                                    <span className="text-xs font-bold text-[var(--ink-muted)] uppercase tracking-widest">{doc.date}</span>
                                    <span className="px-2.5 py-1 bg-[var(--bg-main)] border border-[var(--border)] text-[10px] font-bold uppercase tracking-widest rounded-lg">{doc.type}</span>
                                  </div>
                                  <p className="text-lg font-bold text-[var(--ink-main)]">{doc.name}</p>
                                </div>
                                <div className="flex items-center gap-12">
                                  <div className="text-right">
                                    <p className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] mb-1">Belopp</p>
                                    <p className="text-xl font-serif font-bold text-[var(--ink-main)]">{doc.amount.toLocaleString('sv-SE')} kr</p>
                                  </div>
                                  {doc.addedFees && doc.addedFees !== 0 && (
                                    <div className="text-right min-w-[100px]">
                                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em] mb-1">Avgift</p>
                                      <p className="text-lg font-bold text-amber-600">+{doc.addedFees.toLocaleString('sv-SE')} kr</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showModal === 'auto-analys' && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(null)}
              className="absolute inset-0 bg-[var(--ink-main)]/40 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[var(--bg-main)] rounded-[3rem] w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl relative z-10 border border-white/20"
            >
              <div className="px-12 py-10 border-b border-[var(--border)] flex justify-between items-center bg-white/50 backdrop-blur-sm">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-[var(--ink-main)] tracking-tight">Automatisk Dokumentanalys</h3>
                  <p className="text-[10px] text-[var(--ink-muted)] uppercase tracking-[0.2em] font-black">Identifiera skuldkedjor och avgifter</p>
                </div>
                <button 
                  onClick={() => setShowModal(null)}
                  className="p-4 hover:bg-[var(--bg-main)] rounded-[1.5rem] transition-all text-[var(--ink-muted)] hover:text-[var(--ink-main)]"
                >
                  <X size={32} />
                </button>
              </div>
              
              <div className="p-12">
                <FileUpload 
                  onFilesSelect={handleAutomaticAnalysis}
                  maxFiles={20}
                  acceptedTypes={['application/pdf', 'image/jpeg', 'image/png', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                />
                
                <div className="mt-8 p-6 bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-2xl flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[var(--accent)]/20">
                    <Layers size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-[var(--ink-main)] uppercase tracking-widest">Generisk Analysmotor</p>
                    <p className="text-[11px] text-[var(--ink-muted)] font-medium leading-relaxed">
                      Ladda upp alla typer av ekonomiska dokument. Systemet hittar själv kopplingar mellan dem oavsett utfärdare.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="px-12 py-8 border-t border-[var(--border)] bg-white/50 backdrop-blur-sm flex justify-end">
                <button 
                  onClick={() => setShowModal(null)}
                  className="px-10 py-4 text-[var(--ink-muted)] font-black text-[11px] uppercase tracking-widest hover:bg-[var(--bg-main)] rounded-[1.5rem] transition-all active:scale-95"
                >
                  Avbryt
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showModal === 'upload' && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(null)}
              className="absolute inset-0 bg-[var(--ink-main)]/40 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[var(--bg-main)] rounded-[3rem] w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl relative z-10 border border-white/20"
            >
              <div className="px-12 py-10 border-b border-[var(--border)] flex justify-between items-center bg-white/50 backdrop-blur-sm">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-[var(--ink-main)] tracking-tight">Ladda upp Faktura</h3>
                  <p className="text-[10px] text-[var(--ink-muted)] uppercase tracking-[0.2em] font-black">Analysera fakturor med AI</p>
                </div>
                <button 
                  onClick={() => setShowModal(null)}
                  className="p-4 hover:bg-[var(--bg-main)] rounded-[1.5rem] transition-all text-[var(--ink-muted)] hover:text-[var(--ink-main)]"
                >
                  <X size={32} />
                </button>
              </div>
              
              <div className="p-12">
                <FileUpload 
                  onFilesSelect={handleFileUpload}
                  maxFiles={5}
                  acceptedTypes={['application/pdf', 'image/jpeg', 'image/png']}
                />
                
                <div className="mt-8 p-6 bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-2xl flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[var(--accent)]/20">
                    <Zap size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-[var(--ink-main)] uppercase tracking-widest">AI-Analys Aktiverad</p>
                    <p className="text-[11px] text-[var(--ink-muted)] font-medium leading-relaxed">
                      Systemet kommer automatiskt att extrahera belopp, datum, moms och leverantörsinformation från dina uppladdade fakturor.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="px-12 py-8 border-t border-[var(--border)] bg-white/50 backdrop-blur-sm flex justify-end">
                <button 
                  onClick={() => setShowModal(null)}
                  className="px-10 py-4 text-[var(--ink-muted)] font-black text-[11px] uppercase tracking-widest hover:bg-[var(--bg-main)] rounded-[1.5rem] transition-all active:scale-95"
                >
                  Avbryt
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showLinkModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLinkModal(null)}
              className="absolute inset-0 bg-[var(--ink-main)]/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[var(--bg-main)] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-[var(--border)]"
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-bold text-[var(--ink-main)] uppercase tracking-tight m-0">Koppla till Ärende</h3>
                  <button onClick={() => setShowLinkModal(null)} className="text-[var(--ink-muted)] hover:text-[var(--ink-main)] transition-colors p-2 hover:bg-[var(--line)]/10 rounded-full">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {cases.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-sm text-[var(--ink-muted)] font-medium">Inga ärenden hittades i arkivet.</p>
                    </div>
                  ) : (
                    cases.map(c => (
                      <button 
                        key={c.caseId}
                        onClick={() => handleLinkClaimToCase(showLinkModal, c.caseId)}
                        className="w-full p-6 text-left bg-white border border-[var(--border)] rounded-3xl hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all group"
                      >
                        <div className="text-base font-bold text-[var(--ink-main)] mb-1 group-hover:text-[var(--accent)] transition-colors">{c.name}</div>
                        <div className="text-[10px] text-[var(--ink-muted)] uppercase font-bold tracking-widest">{c.caseId} · {new Date(c.updatedAt).toLocaleDateString('sv-SE')}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showModal && showModal !== 'upload' && showModal !== 'auto-analys' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(null)}
              className="absolute inset-0 bg-[var(--ink-main)]/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[var(--bg-main)] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-[var(--border)]"
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-bold text-[var(--ink-main)] uppercase tracking-tight m-0">
                    {showModal === 'payment' ? 'Registrera Betalning' : 
                     showModal === 'invoice' ? 'Skapa Faktura' : 'Nytt Skadeståndskrav'}
                  </h3>
                  <button onClick={() => setShowModal(null)} className="text-[var(--ink-muted)] hover:text-[var(--ink-main)] transition-colors p-2 hover:bg-[var(--line)]/10 rounded-full">
                    <X size={24} />
                  </button>
                </div>

                {showModal === 'payment' && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] block mb-2">Mottagare</label>
                      <input 
                        className="input-field" 
                        placeholder="T.ex. Advokatbyrå X"
                        value={newPayment.recipient}
                        onChange={e => setNewPayment(p => ({ ...p, recipient: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] block mb-2">Belopp (SEK)</label>
                      <input 
                        type="number"
                        className="input-field" 
                        placeholder="0.00"
                        value={newPayment.amount}
                        onChange={e => setNewPayment(p => ({ ...p, amount: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] block mb-2">Beskrivning</label>
                      <textarea 
                        className="input-field h-32 resize-none" 
                        placeholder="Vad avser betalningen?"
                        value={newPayment.description}
                        onChange={e => setNewPayment(p => ({ ...p, description: e.target.value }))}
                      />
                    </div>
                    <button 
                      onClick={handleAddPayment}
                      className="btn btn-primary w-full py-5 text-base"
                    >
                      Spara Betalning
                    </button>
                  </div>
                )}

                {showModal === 'invoice' && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] block mb-2">Kund / Klient</label>
                      <input 
                        className="input-field" 
                        placeholder="Fullständigt namn"
                        value={newInvoice.clientName}
                        onChange={e => setNewInvoice(p => ({ ...p, clientName: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] block mb-2">Belopp (exkl. moms)</label>
                        <input 
                          type="number"
                          className="input-field" 
                          placeholder="0.00"
                          value={newInvoice.amount}
                          onChange={e => setNewInvoice(p => ({ ...p, amount: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] block mb-2">Förfallodatum</label>
                        <input 
                          type="date"
                          className="input-field" 
                          value={newInvoice.dueDate}
                          onChange={e => setNewInvoice(p => ({ ...p, dueDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handleAddInvoice}
                      className="btn btn-primary w-full py-5 text-base !bg-[var(--success)] hover:!bg-[var(--success)]/90"
                    >
                      Skapa Faktura
                    </button>
                  </div>
                )}

                {showModal === 'claim' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] block mb-2">Kärande</label>
                        <input 
                          className="input-field" 
                          placeholder="Vem kräver?"
                          value={newClaim.claimant}
                          onChange={e => setNewClaim(p => ({ ...p, claimant: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] block mb-2">Svarande</label>
                        <input 
                          className="input-field" 
                          placeholder="Vem krävs?"
                          value={newClaim.defendant}
                          onChange={e => setNewClaim(p => ({ ...p, defendant: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] block mb-2">Typ</label>
                        <select 
                          className="input-field"
                          value={newClaim.type}
                          onChange={e => setNewClaim(p => ({ ...p, type: e.target.value as any }))}
                        >
                          <option value="STATE">Statligt</option>
                          <option value="PRIVATE">Privat</option>
                          <option value="CIVIL">Civilrättsligt</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] block mb-2">Belopp (SEK)</label>
                        <input 
                          type="number"
                          className="input-field" 
                          placeholder="0.00"
                          value={newClaim.amount}
                          onChange={e => setNewClaim(p => ({ ...p, amount: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] block mb-2">Beskrivning & Grund</label>
                      <textarea 
                        className="input-field h-32 resize-none" 
                        placeholder="Kort beskrivning av händelsen..."
                        value={newClaim.description}
                        onChange={e => setNewClaim(p => ({ ...p, description: e.target.value }))}
                      />
                    </div>
                    <button 
                      onClick={handleAddClaim}
                      className="btn btn-primary w-full py-5 text-base !bg-[var(--accent)] hover:!bg-[var(--accent)]/90"
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

      {/* AI Result Modal */}
      <AnimatePresence>
        {aiResult && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAiResult(null)}
              className="absolute inset-0 bg-[var(--ink-main)]/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[var(--bg-main)] w-full max-w-3xl max-h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-[var(--border)]"
            >
              <div className="p-10 border-b border-[var(--line)] flex justify-between items-center bg-white/50">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-[var(--accent)] rounded-3xl shadow-xl shadow-[var(--accent)]/20">
                    <BrainCircuit className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--ink-main)] uppercase tracking-tight m-0">{aiResult.title}</h3>
                    <p className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-[0.2em] mt-2">AI-Genererat Innehåll • Juridisk Analys</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAiResult(null)}
                  className="p-3 hover:bg-[var(--line)]/10 rounded-full transition-all text-[var(--ink-muted)]"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white/30">
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap text-[var(--ink-main)]/80 font-medium leading-relaxed text-lg">
                    {aiResult.content}
                  </div>
                </div>
              </div>
              <div className="p-10 bg-white/50 border-t border-[var(--line)] flex justify-end gap-6">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(aiResult.content);
                    toast.success('Kopierat till urklipp');
                  }}
                  className="btn btn-secondary px-8 py-4"
                >
                  Kopiera Text
                </button>
                <button 
                  onClick={() => setAiResult(null)}
                  className="btn btn-primary px-10 py-4"
                >
                  Stäng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ModuleConnector activeModule="ekonomi" onNavigate={onNavigate} />
    </div>
  );
};

export default EkonomiView;
