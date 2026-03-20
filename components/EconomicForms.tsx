
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
    category: 'SERVICE' as any
  });

  return (
    <div className="space-y-6 p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mottagare</label>
          <input 
            type="text" 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Företagsnamn eller person"
            value={formData.recipient}
            onChange={e => setFormData({...formData, recipient: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Belopp</label>
          <div className="relative">
            <input 
              type="number" 
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="0.00"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">SEK</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Beskrivning</label>
        <textarea 
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 resize-none"
          placeholder="Vad avser betalningen?"
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button onClick={onCancel} className="px-6 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase tracking-widest">
          Avbryt
        </button>
        <button 
          onClick={() => onSave(formData)}
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

  return (
    <div className="space-y-6 p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kundnamn</label>
          <input 
            type="text" 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Kundens fullständiga namn"
            value={formData.clientName}
            onChange={e => setFormData({...formData, clientName: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Förfallodatum</label>
          <input 
            type="date" 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.dueDate}
            onChange={e => setFormData({...formData, dueDate: e.target.value})}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Totalbelopp (Inkl. Moms)</label>
        <div className="relative">
          <input 
            type="number" 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="0.00"
            value={formData.total}
            onChange={e => setFormData({...formData, total: parseFloat(e.target.value)})}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">SEK</span>
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button onClick={onCancel} className="px-6 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase tracking-widest">
          Avbryt
        </button>
        <button 
          onClick={() => onSave(formData)}
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
    type: 'STATE' as any,
    estimatedAmount: 0,
    description: '',
    legalBasis: [] as string[]
  });

  return (
    <div className="space-y-6 p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kärande</label>
          <input 
            type="text" 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Vem ställer kravet?"
            value={formData.claimant}
            onChange={e => setFormData({...formData, claimant: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Svarande</label>
          <input 
            type="text" 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Vem riktas kravet mot?"
            value={formData.defendant}
            onChange={e => setFormData({...formData, defendant: e.target.value})}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Typ av Krav</label>
          <select 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value as any})}
          >
            <option value="STATE">Statligt Skadestånd</option>
            <option value="PRIVATE">Privaträttsligt</option>
            <option value="INSURANCE">Försäkringsärende</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estimerat Belopp</label>
          <div className="relative">
            <input 
              type="number" 
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="0.00"
              value={formData.estimatedAmount}
              onChange={e => setFormData({...formData, estimatedAmount: parseFloat(e.target.value)})}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">SEK</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Händelsebeskrivning</label>
        <textarea 
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 resize-none"
          placeholder="Beskriv händelsen och skadan..."
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button onClick={onCancel} className="px-6 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase tracking-widest">
          Avbryt
        </button>
        <button 
          onClick={() => onSave(formData)}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all uppercase tracking-widest"
        >
          <CheckIcon className="w-4 h-4" />
          <span>Registrera Krav</span>
        </button>
      </div>
    </div>
  );
};
