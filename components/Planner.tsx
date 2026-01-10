import React, { useState } from 'react';
import { BudgetGoal, Transaction, AssetBalances } from '../types';
import { getSmartFinancialAdvice } from '../services/api';
import { PlusIcon, BrainIcon, TrashIcon, TargetIcon } from './Icons';

const generateId = () => Math.random().toString(36).substring(2, 11);

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
    category: 'Általános',
    targetAmount: '',
    type: 'spending_limit' as const
  });

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.targetAmount) return;
    addGoal({
      id: generateId(),
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

    const percentage = goal.targetAmount > 0 ? (currentMonthExpenses / goal.targetAmount) * 100 : 0;
    return { current: currentMonthExpenses, percentage };
  };

  const fetchAdvice = async () => {
    setLoading(true);
    try {
        const result = await getSmartFinancialAdvice(transactions, goals, assets, solBalance, solPrice);
        setAdvice(result);
    } catch (e) {
        setAdvice("Hiba történt a tanácsadás során.");
    }
    setLoading(false);
  };

  const getProgressColor = (percent: number) => {
      if (percent >= 100) return 'bg-rose-500';
      if (percent >= 75) return 'bg-amber-400';
      return 'bg-emerald-500';
  };

  const formatMoney = (amount: number) => new Intl.NumberFormat('hu-HU').format(amount);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20 md:pb-0 animate-fade-in">
      <div className="space-y-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">Havi Limitek</h3>
          <form onSubmit={handleAddGoal} className="flex flex-col sm:flex-row gap-3">
            <select value={goalForm.category} onChange={e => setGoalForm({...goalForm, category: e.target.value})} className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white">
              <option>Általános</option><option>Élelmiszer</option><option>Utazás</option><option>Vásárlás</option><option>Rezsi</option><option>Szórakozás</option>
            </select>
            <input type="number" placeholder="Limit (HUF)" value={goalForm.targetAmount} onChange={e => setGoalForm({...goalForm, targetAmount: e.target.value})} className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white" />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded"><PlusIcon className="w-5 h-5" /></button>
          </form>
        </div>

        <div className="space-y-4">
          {goals.map(goal => {
            const { current, percentage } = getProgress(goal);
            const colorClass = getProgressColor(percentage);
            const isOver = percentage >= 100;

            return (
              <div key={goal.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-100">{goal.category}</h4>
                  <button onClick={() => removeGoal(goal.id)} className="text-slate-500 hover:text-rose-400"><TrashIcon className="w-4 h-4" /></button>
                </div>
                <div className="flex justify-between items-end mb-1 text-xs">
                  <span className={`font-bold ${isOver ? 'text-rose-400' : 'text-slate-300'}`}>{formatMoney(current)} Ft</span>
                  <span className="text-slate-500">Cél: {formatMoney(goal.targetAmount)} Ft</span>
                </div>
                <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${colorClass}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-6 rounded-xl border border-indigo-700/50 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <BrainIcon className="w-6 h-6 text-indigo-300" />
          <h3 className="text-xl font-bold text-white">Gemini Tanácsadó</h3>
        </div>
        {loading ? (
            <div className="py-12 text-center text-indigo-200 animate-pulse">Elemzés folyamatban...</div>
        ) : advice ? (
            <div className="text-sm text-indigo-100 whitespace-pre-wrap bg-slate-900/40 p-4 rounded-lg border border-indigo-800/30 overflow-y-auto max-h-[400px]">
                {advice}
                <button onClick={fetchAdvice} className="w-full mt-4 text-xs text-indigo-400 hover:text-white uppercase font-bold tracking-widest">Frissítés</button>
            </div>
        ) : (
            <div className="py-12 text-center">
                <button onClick={fetchAdvice} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-bold shadow-lg">Elemzés Kérése</button>
            </div>
        )}
      </div>
    </div>
  );
};