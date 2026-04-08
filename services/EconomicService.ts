
import { Payment, Invoice, DamagesClaim, BudgetForecast, EconomicState, DamageComponent } from '../lib/economic.types';
import { geminiService } from './geminiService';
import { db } from '../lib/db';
import { generateId } from '../lib/utils';

/**
 * EconomicService v.1.2-GOLD
 * Hanterar modulära ekonomiska funktioner, skadeståndsberäkningar och budgetprognoser.
 * Integrerar principer från komplexitetshantering och antifragila system.
 */
export class EconomicService {
  private state: EconomicState = {
    payments: [],
    invoices: [],
    claims: [],
    forecasts: []
  };
  public ready: Promise<void>;

  constructor() {
    this.ready = this.loadFromDb();
  }

  private async loadFromDb() {
    try {
      const payments = await db.getAllEconomicDataByType('PAYMENT');
      const invoices = await db.getAllEconomicDataByType('INVOICE');
      const claims = await db.getAllEconomicDataByType('CLAIM');
      const forecasts = await db.getAllEconomicDataByType('FORECAST');

      if (payments.length === 0 && invoices.length === 0 && claims.length === 0) {
        this.initializeMockData();
        await this.syncToDb();
      } else {
        this.state = { payments, invoices, claims, forecasts };
      }
    } catch (error) {
      console.error("Failed to load economic data from DB:", error);
      this.initializeMockData();
    }
  }

  private async syncToDb() {
    // ⚡ Bolt: Parallelize DB writes using Promise.all to avoid N+1 sequential I/O bottleneck
    // This allows IndexedDB transactions to run concurrently, significantly improving initialization time
    await Promise.all([
      ...this.state.payments.map(p => db.saveEconomicData(p.id, 'PAYMENT', p)),
      ...this.state.invoices.map(i => db.saveEconomicData(i.id, 'INVOICE', i)),
      ...this.state.claims.map(c => db.saveEconomicData(c.id, 'CLAIM', c)),
      ...this.state.forecasts.map(f => db.saveEconomicData(f.id, 'FORECAST', f))
    ]);
  }

  private initializeMockData() {
    this.state.payments = [
      { id: 'pay-1', amount: 5000, currency: 'SEK', status: 'COMPLETED', date: '2026-03-10', recipient: 'Advokatbyrå X', description: 'Rättslig rådgivning' },
      { id: 'pay-2', amount: 1200, currency: 'SEK', status: 'PENDING', date: '2026-03-25', recipient: 'Domstolsverket', description: 'Ansökningsavgift' }
    ];

    this.state.invoices = [
      { 
        id: 'inv-1', 
        invoiceNumber: 'INV-2026-001', 
        issueDate: '2026-03-01', 
        dueDate: '2026-03-31', 
        amount: 10000, 
        vat: 2500, 
        total: 12500, 
        status: 'SENT', 
        clientName: 'Företag A',
        items: [{ id: 'item-1', description: 'Utredningstjänster', quantity: 1, unitPrice: 10000, total: 10000 }]
      }
    ];

    this.state.claims = [
      {
        id: 'claim-1',
        claimant: 'Privatperson X',
        defendant: 'Staten',
        type: 'STATE',
        legalBasis: ['Skadeståndslagen 3 kap. 2 §', 'Europakonventionen art. 6', 'HSS 3 §'],
        estimatedAmount: 75000,
        probability: 0.65,
        status: 'FILED',
        components: [
          { id: 'comp-1', label: 'Personskada', amount: 50000, description: 'Sveda och värk till följd av felaktigt frihetsberövande', legalReference: 'SkL 5 kap. 1 §' },
          { id: 'comp-2', label: 'Inkomstförlust', amount: 25000, description: 'Utebliven lön under häktningstid', legalReference: 'SkL 5 kap. 1 §' }
        ]
      }
    ];

    this.state.forecasts = [
      { id: 'fc-1', period: '2026-Q1', actualIncome: 450000, actualExpenses: 380000, forecastedIncome: 440000, forecastedExpenses: 400000, variance: 10000, confidenceScore: 0.92 }
    ];
  }

  // --- Betalningar ---
  getPayments(): Payment[] {
    return this.state.payments;
  }

  async addPayment(payment: Payment) {
    this.state.payments = [payment, ...this.state.payments];
    await db.saveEconomicData(payment.id, 'PAYMENT', payment);
  }

  // --- Fakturahantering ---
  getInvoices(): Invoice[] {
    return this.state.invoices;
  }

  async addInvoice(invoice: Invoice) {
    this.state.invoices = [invoice, ...this.state.invoices];
    await db.saveEconomicData(invoice.id, 'INVOICE', invoice);
  }

  async updateInvoiceStatus(id: string, status: Invoice['status']) {
    const invoice = this.state.invoices.find(i => i.id === id);
    if (invoice) {
      invoice.status = status;
      await db.saveEconomicData(id, 'INVOICE', invoice);
    }
  }

  // --- Skadestånd ---
  getClaims(): DamagesClaim[] {
    return this.state.claims;
  }

  async addClaim(claim: DamagesClaim) {
    this.state.claims = [claim, ...this.state.claims];
    await db.saveEconomicData(claim.id, 'CLAIM', claim);
  }

  async updateClaim(id: string, updates: Partial<DamagesClaim>) {
    const claimIndex = this.state.claims.findIndex(c => c.id === id);
    if (claimIndex !== -1) {
      this.state.claims[claimIndex] = { ...this.state.claims[claimIndex], ...updates };
      await db.saveEconomicData(id, 'CLAIM', this.state.claims[claimIndex]);
    }
  }

  async deletePayment(id: string) {
    this.state.payments = this.state.payments.filter(p => p.id !== id);
    await db.deleteEconomicData(id);
  }

  async deleteInvoice(id: string) {
    this.state.invoices = this.state.invoices.filter(i => i.id !== id);
    await db.deleteEconomicData(id);
  }

  async deleteClaim(id: string) {
    this.state.claims = this.state.claims.filter(c => c.id !== id);
    await db.deleteEconomicData(id);
  }

  calculateDamages(components: DamageComponent[]): number {
    return components.reduce((acc, comp) => acc + comp.amount, 0);
  }

  async analyzeClaimAI(claim: DamagesClaim): Promise<string> {
    const prompt = `Analysera följande skadeståndskrav baserat på svensk skadeståndsrätt (Skadeståndslagen, SkL) och i förekommande fall Förordning (1995:1301) om handläggning av skadeståndsanspråk mot staten (HSS):
    Kärande: ${claim.claimant}
    Svarande: ${claim.defendant}
    Typ: ${claim.type}
    Belopp: ${claim.estimatedAmount} SEK
    Komponenter: ${claim.components.map(c => `${c.label}: ${c.amount} SEK (${c.description})`).join(', ')}
    Juridisk grund: ${claim.legalBasis.join(', ')}
    
    Ge en kortfattad juridisk bedömning av sannolikheten för framgång och eventuella risker. Om kravet riktas mot staten, beakta särskilt handläggningsreglerna i HSS.`;

    try {
      const response = await geminiService.generate({ contents: prompt });
      return response || "Kunde inte generera analys.";
    } catch (error) {
      console.error("AI Analysis failed:", error);
      return "Ett fel uppstod vid AI-analysen.";
    }
  }

  // --- Budgetanalys ---
  getForecasts(): BudgetForecast[] {
    return this.state.forecasts;
  }

  async addForecast(forecast: BudgetForecast) {
    this.state.forecasts = [forecast, ...this.state.forecasts];
    await db.saveEconomicData(forecast.id, 'FORECAST', forecast);
  }

  generateAntifragileForecast(baseData: any): BudgetForecast {
    const variance = (Math.random() * 0.2) - 0.1;
    return {
      id: generateId('FC'),
      period: '2026-Q2',
      actualIncome: 0,
      actualExpenses: 0,
      forecastedIncome: 500000 * (1 + variance),
      forecastedExpenses: 420000 * (1 - variance),
      variance: 80000,
      confidenceScore: 0.85
    };
  }

  async optimizeLiquidity(): Promise<string> {
    const prompt = `Analysera nuvarande ekonomiska status och föreslå optimeringar för likviditet baserat på följande data:
    Totala betalningar: ${this.state.payments.length}
    Totala fakturor: ${this.state.invoices.length}
    Totala skadeståndskrav: ${this.state.claims.length}
    
    Fokusera på riskreducering och antifragilitet.`;
    
    try {
      const response = await geminiService.generate({ contents: prompt });
      return response || "Kunde inte generera optimeringsförslag.";
    } catch (error) {
      console.error("Liquidity optimization failed:", error);
      return "Ett fel uppstod vid likviditetsoptimeringen.";
    }
  }

  async findPraxis(claim: DamagesClaim): Promise<string> {
    const prompt = `Hitta relevant rättspraxis (Högsta domstolen, Justitiekanslern) för följande skadeståndskrav:
    Typ: ${claim.type}
    Grund: ${claim.legalBasis.join(', ')}
    Beskrivning: ${claim.components.map(c => c.description).join('. ')}
    
    Fokusera på beloppsnivåer och framgångsfaktorer i liknande fall mot staten.`;
    
    try {
      const response = await geminiService.generate({ contents: prompt });
      return response || "Kunde inte hitta relevant praxis.";
    } catch (error) {
      console.error("Praxis search failed:", error);
      return "Ett fel uppstod vid sökning efter praxis.";
    }
  }

  async generateReport(): Promise<string> {
    const prompt = `Generera en detaljerad ekonomisk rapport för Case Integrity Suite.
    Inkludera sammanfattning av betalningar, fakturor, skadeståndskrav och budgetprognoser.
    Använd ett formellt juridiskt-ekonomiskt språk.`;
    
    try {
      const response = await geminiService.generate({ contents: prompt });
      return response || "Kunde inte generera rapport.";
    } catch (error) {
      console.error("Report generation failed:", error);
      return "Ett fel uppstod vid rapportgenereringen.";
    }
  }

  async generateInlaga(claim: DamagesClaim): Promise<string> {
    const prompt = `Generera ett utkast till en skadeståndsinlaga baserat på följande krav:
    Kärande: ${claim.claimant}
    Svarande: ${claim.defendant}
    Typ: ${claim.type}
    Belopp: ${claim.estimatedAmount} SEK
    Komponenter: ${claim.components.map(c => `${c.label}: ${c.amount} SEK (${c.description})`).join(', ')}
    Juridisk grund: ${claim.legalBasis.join(', ')}
    
    Inlagan ska följa svensk juridisk standard för skadeståndsanspråk mot staten (HSS).`;
    
    try {
      const response = await geminiService.generate({ contents: prompt });
      return response || "Kunde inte generera inlaga.";
    } catch (error) {
      console.error("Inlaga generation failed:", error);
      return "Ett fel uppstod vid generering av inlagan.";
    }
  }
}

export const economicService = new EconomicService();
