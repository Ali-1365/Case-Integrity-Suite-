
import React, { useState } from 'react';
import { Payment, Invoice, DamagesClaim } from '../lib/economic.types';
import { XMarkIcon, CheckIcon, SparklesIcon } from './icons';

interface FormProps<T> {
  onSave: (data: Partial<T>) => void;
  onCancel: () => void;
}

export const NewPaymentForm: React.FC<FormProps<Payment>> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    recipient: '',
    amount: 0,
    currency: 'SEK',
    description: '',
    category: 'SERVICE' as 'SERVICE' | 'GOODS' | 'LEGAL_FEE' | 'DAMAGES_PAYMENT' | 'TAX'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.recipient) newErrors.recipient = 'Mottagare måste anges';
    if (formData.amount <= 0) newErrors.amount = 'Beloppet måste vara större än 0';
    if (!formData.description) newErrors.description = 'Beskrivning saknas';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="space-y-6 p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex justify-between">
            <span>Mottagare / Betalningsmottagare</span>
            {errors.recipient && <span className="text-rose-600 dark:text-rose-400 lowercase font-medium">{errors.recipient}</span>}
          </label>
          <input 
            type="text" 
            className={`w-full bg-slate-50 dark:bg-slate-900 border ${errors.recipient ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
            placeholder="T.ex. Juridisk person, myndighet eller privatperson"
            value={formData.recipient}
            onChange={e => setFormData({...formData, recipient: e.target.value})}
          />
          <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">Ange det fullständiga namnet på den part som ska erhålla medlen.</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex justify-between">
            <span>Belopp (Brutto)</span>
            {errors.amount && <span className="text-rose-600 dark:text-rose-400 lowercase font-medium">{errors.amount}</span>}
          </label>
          <div className="relative">
            <input 
              type="number" 
              className={`w-full bg-slate-50 dark:bg-slate-900 border ${errors.amount ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
              placeholder="0.00"
              value={formData.amount || ''}
              onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 dark:text-slate-400">SEK</span>
          </div>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">Ange det exakta beloppet i svenska kronor (SEK) som ska överföras.</p>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex justify-between">
          <span>Ändamål / Beskrivning</span>
          {errors.description && <span className="text-rose-600 dark:text-rose-400 lowercase font-medium">{errors.description}</span>}
        </label>
        <textarea 
          className={`w-full bg-slate-50 dark:bg-slate-900 border ${errors.description ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 resize-none`}
          placeholder="T.ex. Betalning av faktura #12345 avseende juridisk rådgivning"
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
        <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">Beskriv tydligt vad betalningen avser för att underlätta framtida revision och bokföring.</p>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button onClick={onCancel} className="px-6 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase tracking-widest">
          Avbryt
        </button>
        <button 
          onClick={handleSubmit}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all uppercase tracking-widest"
        >
          <CheckIcon className="w-4 h-4" />
          <span>Spara Betalning</span>
        </button>
      </div>
    </div>
  );
};

export const NewInvoiceForm: React.FC<FormProps<Invoice>> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    total: 0,
    dueDate: '',
    items: [] as any[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.clientName) newErrors.clientName = 'Kundnamn måste anges';
    if (formData.total <= 0) newErrors.total = 'Beloppet måste vara större än 0';
    if (!formData.dueDate) newErrors.dueDate = 'Förfallodatum saknas';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="space-y-6 p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex justify-between">
            <span>Kundnamn</span>
            {errors.clientName && <span className="text-rose-600 dark:text-rose-400 lowercase font-medium">{errors.clientName}</span>}
          </label>
          <input 
            type="text" 
            className={`w-full bg-slate-50 dark:bg-slate-900 border ${errors.clientName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
            placeholder="Kundens fullständiga namn"
            value={formData.clientName}
            onChange={e => setFormData({...formData, clientName: e.target.value})}
          />
          <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">Namnet på den kund som faktureras.</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex justify-between">
            <span>Förfallodatum</span>
            {errors.dueDate && <span className="text-rose-600 dark:text-rose-400 lowercase font-medium">{errors.dueDate}</span>}
          </label>
          <input 
            type="date" 
            className={`w-full bg-slate-50 dark:bg-slate-900 border ${errors.dueDate ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
            value={formData.dueDate}
            onChange={e => setFormData({...formData, dueDate: e.target.value})}
          />
          <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">Sista dagen för kunden att betala fakturan.</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex justify-between">
            <span>Totalbelopp (Inkl. Moms)</span>
            {errors.total && <span className="text-rose-600 dark:text-rose-400 lowercase font-medium">{errors.total}</span>}
          </label>
          <div className="relative">
            <input 
              type="number" 
              className={`w-full bg-slate-50 dark:bg-slate-900 border ${errors.total ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
              placeholder="0.00"
              value={formData.total || ''}
              onChange={e => setFormData({...formData, total: parseFloat(e.target.value) || 0})}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 dark:text-slate-400">SEK</span>
          </div>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">Det totala beloppet kunden ska betala, inklusive mervärdesskatt (moms).</p>
        </div>

        {formData.total > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center animate-in fade-in zoom-in-95 duration-300">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-black tracking-widest">Beräknad Moms (25%)</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(formData.total * 0.2)}
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-black tracking-widest">Netto (Exkl. Moms)</p>
              <p className="text-sm font-bold text-indigo-600">
                {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(formData.total * 0.8)}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button onClick={onCancel} className="px-6 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase tracking-widest">
          Avbryt
        </button>
        <button 
          onClick={handleSubmit}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all uppercase tracking-widest"
        >
          <CheckIcon className="w-4 h-4" />
          <span>Skapa Faktura</span>
        </button>
      </div>
    </div>
  );
};

export const NewClaimForm: React.FC<FormProps<DamagesClaim>> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    claimant: '',
    defendant: '',
    type: 'STATE' as 'PRIVATE' | 'STATE' | 'CIVIL',
    estimatedAmount: 0,
    description: '',
    legalBasis: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.claimant) newErrors.claimant = 'Kärande måste anges';
    if (!formData.defendant) newErrors.defendant = 'Svarande måste anges';
    if (formData.estimatedAmount <= 0) newErrors.estimatedAmount = 'Beloppet måste vara större än 0';
    if (!formData.description) newErrors.description = 'Beskrivning saknas';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="space-y-6 p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex justify-between">
            <span>Kärande</span>
            {errors.claimant && <span className="text-rose-600 dark:text-rose-400 lowercase font-medium">{errors.claimant}</span>}
          </label>
          <input 
            type="text" 
            className={`w-full bg-slate-50 dark:bg-slate-900 border ${errors.claimant ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
            placeholder="Vem ställer kravet?"
            value={formData.claimant}
            onChange={e => setFormData({...formData, claimant: e.target.value})}
          />
          <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">Den part som begär skadestånd.</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex justify-between">
            <span>Svarande</span>
            {errors.defendant && <span className="text-rose-600 dark:text-rose-400 lowercase font-medium">{errors.defendant}</span>}
          </label>
          <input 
            type="text" 
            className={`w-full bg-slate-50 dark:bg-slate-900 border ${errors.defendant ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
            placeholder="Vem riktas kravet mot?"
            value={formData.defendant}
            onChange={e => setFormData({...formData, defendant: e.target.value})}
          />
          <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">Den part som kravet riktas mot.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Typ av Krav</label>
          <select 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value as any})}
          >
            <option value="STATE">Statligt Skadestånd</option>
            <option value="PRIVATE">Privaträttsligt</option>
            <option value="INSURANCE">Försäkringsärende</option>
          </select>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">Kategorisering av skadeståndskravet.</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex justify-between">
            <span>Estimerat Belopp</span>
            {errors.estimatedAmount && <span className="text-rose-600 dark:text-rose-400 lowercase font-medium">{errors.estimatedAmount}</span>}
          </label>
          <div className="relative">
            <input 
              type="number" 
              className={`w-full bg-slate-50 dark:bg-slate-900 border ${errors.estimatedAmount ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
              placeholder="0.00"
              value={formData.estimatedAmount || ''}
              onChange={e => setFormData({...formData, estimatedAmount: parseFloat(e.target.value) || 0})}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 dark:text-slate-400">SEK</span>
          </div>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">Det beräknade värdet av skadeståndet.</p>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex justify-between">
          <span>Händelsebeskrivning & Grund</span>
          {errors.description && <span className="text-rose-600 dark:text-rose-400 lowercase font-medium">{errors.description}</span>}
        </label>
        <textarea 
          className={`w-full bg-slate-50 dark:bg-slate-900 border ${errors.description ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 resize-none`}
          placeholder="Beskriv händelsen, tidpunkt och den juridiska grunden för kravet..."
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
        <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">En detaljerad redogörelse för händelseförloppet och varför motparten anses skadeståndsskyldig enligt gällande rätt.</p>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button onClick={onCancel} className="px-6 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase tracking-widest">
          Avbryt
        </button>
        <button 
          onClick={handleSubmit}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all uppercase tracking-widest"
        >
          <CheckIcon className="w-4 h-4" />
          <span>Registrera Krav</span>
        </button>
      </div>
    </div>
  );
};
