
export type EconomicModuleType = 
  | 'PAYMENT' 
  | 'COST_CALCULATION' 
  | 'INVOICE_MANAGEMENT' 
  | 'DAMAGES_PRIVATE' 
  | 'CIVIL_DAMAGES_PROCESS' 
  | 'DAMAGES_STATE' 
  | 'CIVIL_CASE' 
  | 'BUDGET_FORECAST';

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  date: string;
  recipient: string;
  description: string;
  category?: 'SERVICE' | 'GOODS' | 'LEGAL_FEE' | 'DAMAGES_PAYMENT' | 'TAX';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  vat: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  clientName: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DamagesClaim {
  id: string;
  caseId?: string;
  claimant: string;
  defendant: string;
  type: 'PRIVATE' | 'STATE' | 'CIVIL';
  legalBasis: string[];
  estimatedAmount: number;
  probability: number; // 0 to 1
  status: 'DRAFT' | 'FILED' | 'NEGOTIATION' | 'SETTLED' | 'LITIGATION' | 'IN_PROGRESS';
  components: DamageComponent[];
  description?: string;
  aiAnalysis?: string;
}

export interface DamageComponent {
  id: string;
  label: string;
  amount: number;
  description: string;
  legalReference?: string;
}

export interface BudgetForecast {
  id: string;
  period: string;
  actualIncome: number;
  actualExpenses: number;
  forecastedIncome: number;
  forecastedExpenses: number;
  variance: number;
  confidenceScore: number;
}

export interface EconomicState {
  payments: Payment[];
  invoices: Invoice[];
  claims: DamagesClaim[];
  forecasts: BudgetForecast[];
}
