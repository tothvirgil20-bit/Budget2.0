import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, AssetBalances, RecurringTemplate } from '../types';
import { PlusIcon, TrashIcon, TargetIcon } from './Icons';

interface TransactionsProps {
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  recurring: RecurringTemplate[];
  setRecurring: React.Dispatch<React.SetStateAction<RecurringTemplate[]>>;
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions, addTransaction, deleteTransaction, recurring, setRecurring }) => {
  const [tab, setTab] = useState<'history' | 'recurring'>('history');
  
  // Custom Delete Confirm State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Általános',
    description: '',
    type: 'expense' as TransactionType,
    date: new Date().toISOString().split('T')[0],
    assetKey: 'bankOtp' as keyof AssetBalances
  });

  useEffect(() => {
    if (formData.description.length > 2) {
      const match = transactions.find(t => t.description.toLowerCase().includes(formData.description.toLowerCase()));
      if (match && formData.category === 'Általános') {
        setFormData(prev => ({ ...prev, category: match.category, assetKey: match.assetKey }));
      }
    }
  }, [formData.description]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    addTransaction({
      id: Math.random().toString(36).substr(2, 9),
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      type: formData.type,
      date: formData.date,
      assetKey: formData.assetKey
    });

    setFormData({ ...formData, amount: '', description: '', category: 'Általános' });
  };

  const handleAddRecurring = () => {
    const day = prompt('A hónap melyik napján fusson? (1-28)', '1');
    if (!day) return;
    const newRec: RecurringTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      amount: parseFloat(formData.amount) || 0,
      type: formData.type,
      category: formData.category,
      description: formData.description,
      assetKey: formData.assetKey,
      dayOfMonth: parseInt(day)
    };
    setRecurring(prev => [...prev, newRec]);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteTransaction(deleteId);
      setDeleteId(null);
    }
  };

  const assetNames: Record<keyof AssetBalances, string> = {
    cash: 'Készpénz',
    bankRevolut: 'Revolut',
    bankOtp: 'OTP Bank',
    stockLightyear: 'Lightyear',
    governmentBonds: 'Állampapír'
  };

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in relative">
      
      {/* Custom Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
           <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-sm animate-fade-in">
              <div className="text-center mb-6">
                 <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrashIcon className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-bold text-white">Biztosan törlöd?</h3>
                 <p className="text-slate-400 text-sm mt-2">A művelet visszavonja az egyenleg változást is.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setDeleteId(null)} className="py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-700 transition-colors">Mégse</button>
                 <button onClick={confirmDelete} className="py-3 rounded-xl font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-lg">Törlés</button>
              </div>
           </div>
        </div>
      )}

      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl lg:sticky lg:top-6">
          <h3 className="text-xl font-bold text-white mb-6">Tranzakció rögzítése</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl shadow-inner">
              <button type="button" onClick={() => setFormData({ ...formData, type: 'income' })} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${formData.type === 'income' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>Bevétel</button>
              <button type="button" onClick={() => setFormData({ ...formData, type: 'expense' })} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${formData.type === 'expense' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500'}`}>Kiadás</button>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-black ml-2 tracking-widest">Összeg (Ft)</label>
              <input 
                type="number" 
                inputMode="decimal"
                required 
                placeholder="0" 
                value={formData.amount} 
                onFocus={(e) => e.target.select()}
                onChange={e => setFormData({...formData, amount: e.target.value})} 
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white text-xl font-black focus:border-blue-500 focus:outline-none shadow-inner" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-black ml-2 tracking-widest">Leírás</label>
              <input 
                type="text" 
                required 
                placeholder="Pl: Havi bevásárlás" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 shadow-inner" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-black ml-2 tracking-widest">Kategória</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-3 py-3 text-white focus:outline-none focus:border-blue-500 text-sm shadow-inner">
                    <option>Általános</option><option>Élelmiszer</option><option>Utazás</option><option>Vásárlás</option><option>Rezsi</option><option>Szórakozás</option><option>Fizetés</option><option>Befektetés</option>
                  </select>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-black ml-2 tracking-widest">Forrás</label>
                  <select value={formData.assetKey} onChange={e => setFormData({...formData, assetKey: e.target.value as keyof AssetBalances})} className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-3 py-3 text-white focus:outline-none focus:border-blue-500 text-sm shadow-inner">
                    {Object.entries(assetNames).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
                  </select>
               </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 mt-4 shadow-xl active:scale-[0.98] transition-transform">
              <PlusIcon className="w-5 h-5" /> Mentés
            </button>
            <button type="button" onClick={handleAddRecurring} className="w-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all">
              <TargetIcon className="w-4 h-4" /> Ismétlődőként ment
            </button>
          </form>
        </div>
      </div>

      {/* List Section */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex gap-4 mb-2">
           <button onClick={() => setTab('history')} className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all ${tab === 'history' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}>Történet</button>
           <button onClick={() => setTab('recurring')} className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all ${tab === 'recurring' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}>Ismétlődő</button>
        </div>

        {tab === 'history' ? (
          <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-xl overflow-hidden">
            <div className="divide-y divide-slate-700/50">
              {sortedTransactions.length === 0 ? (
                <div className="p-12 text-center text-slate-500">Még nincs rögzített adatod.</div>
              ) : (
                sortedTransactions.map((t) => (
                  <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${t.type === 'income' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/20' : 'bg-rose-900/40 text-rose-400 border border-rose-500/20'}`}>
                        {t.type === 'income' ? '↓' : '↑'}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-blue-400 transition-colors text-sm">{t.description}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{t.date} • {t.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-black text-sm ${t.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {t.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('hu-HU').format(t.amount)} Ft
                      </span>
                      <button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation(); // Stop event bubbling
                            setDeleteId(t.id); // Trigger custom modal
                        }} 
                        className="bg-rose-500/10 hover:bg-rose-500 p-3 rounded-xl text-rose-500 hover:text-white transition-all shadow-sm active:scale-90"
                      >
                        <TrashIcon className="w-5 h-5 pointer-events-none" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-xl p-6">
             <div className="space-y-4">
                {recurring.length === 0 ? <div className="text-center text-slate-500 py-10">Még nincs ismétlődő fizetésed.</div> : recurring.map(r => (
                  <div key={r.id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 flex justify-between items-center">
                     <div>
                        <div className="font-bold text-white">{r.description}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Hónap {r.dayOfMonth}. napján</div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="text-right">
                           <div className="font-black text-slate-200">{new Intl.NumberFormat('hu-HU').format(r.amount)} Ft</div>
                        </div>
                        <button onClick={() => setRecurring(prev => prev.filter(i => i.id !== r.id))} className="text-rose-400 hover:text-rose-300 p-2"><TrashIcon className="w-5 h-5" /></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};