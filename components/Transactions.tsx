import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

// Compatible ID generator for older mobiles
const generateId = () => Math.random().toString(36).substring(2, 11);

interface TransactionsProps {
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions, addTransaction, deleteTransaction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Általános',
    description: '',
    type: 'expense' as TransactionType,
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    addTransaction({
      id: generateId(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      type: formData.type,
      date: formData.date
    });

    setFormData({ ...formData, amount: '', description: '' });
    setIsOpen(false);
  };

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20 md:pb-0 animate-fade-in">
      <div className="lg:col-span-1">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg sticky top-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Új Tranzakció</h3>
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-slate-400">
              {isOpen ? 'Bezár' : 'Megnyit'}
            </button>
          </div>
          
          <div className={`space-y-4 ${isOpen ? 'block' : 'hidden lg:block'}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 p-1 bg-slate-900 rounded-lg">
                <button type="button" onClick={() => setFormData({ ...formData, type: 'income' })} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.type === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Bevétel</button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'expense' })} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.type === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>Kiadás</button>
              </div>
              <input type="number" required placeholder="Összeg (HUF)" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white" />
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white" />
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white">
                <option>Általános</option><option>Élelmiszer</option><option>Utazás</option><option>Vásárlás</option><option>Rezsi</option><option>Szórakozás</option><option>Fizetés</option><option>Befektetés</option>
              </select>
              <input type="text" required placeholder="Leírás" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white" />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded flex items-center justify-center gap-2">
                <PlusIcon className="w-4 h-4" /> Hozzáadás
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
          {sortedTransactions.length === 0 ? <div className="p-8 text-center text-slate-500">Nincs tranzakció.</div> : (
            <div className="divide-y divide-slate-700">
              {sortedTransactions.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${t.type === 'income' ? 'bg-emerald-900 text-emerald-400' : 'bg-rose-900 text-rose-400'}`}>
                      {t.type === 'income' ? '↓' : '↑'}
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">{t.description}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{t.date} • {t.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {t.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('hu-HU').format(t.amount)} Ft
                    </span>
                    <button onClick={() => deleteTransaction(t.id)} className="text-slate-600 hover:text-rose-500 p-1"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};