import React, { useState } from 'react';
import { BudgetGoal, Transaction, AssetBalances } from '../types';
import { getSmartFinancialAdvice } from '../services/api';
import { PlusIcon, BrainIcon, TrashIcon } from './Icons';

interface PlannerProps {
  goals: BudgetGoal[];
  transactions: Transaction[];
  assets: AssetBalances;
  solBalance: number;
  solPrice: number;
  addGoal: (g: BudgetGoal) => void;
  removeGoal: (id: string) => void;
}

export const Planner: React.FC<PlannerProps> = ({ goals, transactions, assets, solBalance, solPrice, addGoal, removeGoal }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [goalForm, setGoalForm] = useState({
    category: 'Élelmiszer',
    targetAmount: '',
    type: 'spending_limit' as const
  });

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.targetAmount) return;
    addGoal({
      id: Math.random().toString(36).substr(2, 9),
      category: goalForm.category,
      targetAmount: parseFloat(goalForm.targetAmount),
      type: goalForm.type
    });
    setGoalForm({ ...goalForm, targetAmount: '' });
  };

  const getProgress = (goal: BudgetGoal) => {
    const now = new Date();
    const currentMonthExpenses = transactions
      .filter(t => t.type === 'expense' && t.category === goal.category)
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = Math.min(100, goal.targetAmount > 0 ? (currentMonthExpenses / goal.targetAmount) * 100 : 0);
    return { current: currentMonthExpenses, percentage };
  };

  const fetchAdvice = async () => {
    setLoading(true);
    const result = await getSmartFinancialAdvice(transactions, goals, assets, solBalance, solPrice);
    setAdvice(result);
    setLoading(false);
  };

  const formatMoney = (amount: number) => new Intl.NumberFormat('hu-HU').format(amount);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      <div className="space-y-8">
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl">
          <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest">Havi Limitek Beállítása</h3>
          <form onSubmit={handleAddGoal} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-black ml-2">Kategória</label>
                <select value={goalForm.category} onChange={e => setGoalForm({...goalForm, category: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 shadow-inner">
                  <option>Élelmiszer</option><option>Utazás</option><option>Vásárlás</option><option>Rezsi</option><option>Szórakozás</option><option>Általános</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-black ml-2">Limit (HUF)</label>
                <input 
                  type="number" 
                  inputMode="decimal"
                  placeholder="0" 
                  value={goalForm.targetAmount} 
                  onChange={e => setGoalForm({...goalForm, targetAmount: e.target.value})} 
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white font-bold focus:outline-none focus:border-emerald-500 shadow-inner" 
                />
              </div>
            </div>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all">Új Limit Hozzáadása</button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map(goal => {
            const { current, percentage } = getProgress(goal);
            const isOver = percentage >= 100;

            return (
              <div key={goal.id} className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h4 className="font-black text-white text-lg uppercase tracking-tight">{goal.category}</h4>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Havi Keret</p>
                  </div>
                  <button onClick={() => removeGoal(goal.id)} className="text-slate-600 hover:text-rose-500 p-2 bg-slate-900 rounded-xl transition-colors"><TrashIcon className="w-4 h-4" /></button>
                </div>
                
                <div className="flex justify-between items-end mb-2 relative z-10">
                   <div className={`text-2xl font-black ${isOver ? 'text-rose-400' : 'text-emerald-400'}`}>{formatMoney(current)} Ft</div>
                   <div className="text-slate-500 text-xs font-bold mb-1">/ {formatMoney(goal.targetAmount)}</div>
                </div>

                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full transition-all duration-1000 ${isOver ? 'bg-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`} 
                    style={{ width: `${percentage}%` }} 
                  />
                </div>
                
                {isOver && <div className="mt-2 text-[10px] text-rose-500 font-black uppercase tracking-widest text-right">Lépd át a keretet! ⚠️</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Advice Card */}
      <div className="flex flex-col h-full">
         <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-8 rounded-[40px] shadow-2xl relative overflow-hidden flex-1 flex flex-col group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                 <BrainIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                 <h3 className="text-2xl font-black text-white">Gemini AI Advisor</h3>
                 <p className="text-indigo-200/60 text-xs font-bold uppercase tracking-widest">Személyes pénzügyi elemző</p>
              </div>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                   <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                   <div className="text-white font-bold animate-pulse">Adatok elemzése...</div>
                </div>
            ) : advice ? (
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                  <div className="text-sm text-indigo-50 leading-relaxed whitespace-pre-wrap bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                      {advice}
                  </div>
                  <button onClick={fetchAdvice} className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs transition-all">Új elemzés kérése</button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-indigo-100/60 text-center mb-8 px-8">Engedd, hogy a mesterséges intelligencia átnézze a költéseidet és tanácsot adjon a megtakarításhoz.</p>
                    <button onClick={fetchAdvice} className="bg-white text-indigo-600 hover:scale-105 active:scale-95 px-10 py-5 rounded-3xl font-black shadow-2xl transition-all uppercase tracking-tighter">Elemzés indítása</button>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};