import React, { useState } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, AssetBalances, QuickAction } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  assets: AssetBalances;
  solBalance: number;
  solPrice: number;
  addTransaction: (t: Transaction) => void;
  quickActions: QuickAction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, assets, solBalance, solPrice, addTransaction, quickActions }) => {
  const [activeAction, setActiveAction] = useState<QuickAction | null>(null);
  const [actionAmount, setActionAmount] = useState<string>('');

  const USD_HUF = 365; 
  const cryptoValueHUF = (solBalance * solPrice) * USD_HUF;
  const totalNetWorth = Object.values(assets).reduce((a, b) => a + b, 0) + cryptoValueHUF;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate() + 1;

  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const income = currentMonthTransactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const expense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  
  const monthlyBudget = income > 0 ? income : 450000;
  const remainingBudget = Math.max(0, monthlyBudget - expense);
  const safeToSpendToday = Math.floor(remainingBudget / daysLeft);

  const formatHUF = (val: number) => new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(val);

  const initiateAction = (action: QuickAction) => {
    setActiveAction(action);
    setActionAmount(action.amount.toString());
  };

  const confirmAction = () => {
    if (!activeAction) return;
    const amount = parseFloat(actionAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      amount: amount,
      type: 'expense',
      category: activeAction.category,
      description: activeAction.label,
      assetKey: activeAction.assetKey
    };

    addTransaction(newTx);
    setActiveAction(null);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Quick Action Modal Overlay */}
      {activeAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-sm animate-fade-in">
             <div className="text-center mb-6">
                <div className="text-4xl mb-2">{activeAction.icon}</div>
                <h3 className="text-xl font-bold text-white">{activeAction.label} rögzítése</h3>
             </div>
             
             <div className="mb-6">
               <label className="text-xs text-slate-500 font-bold uppercase ml-2">Összeg (Ft)</label>
               <input 
                  type="number" 
                  inputMode="decimal"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-2xl p-4 text-2xl font-black text-white focus:border-blue-500 focus:outline-none"
                  autoFocus
               />
             </div>

             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setActiveAction(null)} className="py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-700 transition-colors">Mégse</button>
                <button onClick={confirmAction} className="py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg">Rögzít</button>
             </div>
          </div>
        </div>
      )}

      {/* Quick Actions Bar */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {quickActions.map((action) => (
          <button 
            key={action.id}
            type="button"
            onClick={() => initiateAction(action)}
            className="flex-shrink-0 bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3 rounded-2xl flex items-center gap-3 transition-all active:scale-95 group shadow-lg"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">{action.icon}</span>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{action.label}</div>
              <div className="text-sm font-bold text-white">{formatHUF(action.amount)}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-white/10 text-8xl font-black group-hover:rotate-12 transition-transform">SAFE</div>
              <h4 className="text-blue-100/80 text-sm font-bold uppercase tracking-wider">Ma még elkölthető</h4>
              <div className="text-4xl font-black text-white mt-2">{formatHUF(safeToSpendToday)}</div>
              <p className="text-blue-200/60 text-xs mt-1">Havi keretből, {daysLeft} napra elosztva</p>
            </div>
            
            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
               <h4 className="text-slate-400 text-sm font-bold uppercase tracking-wider">Havi Megtakarítás</h4>
               <div className={`text-3xl font-black mt-2 ${income - expense >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                 {formatHUF(income - expense)}
               </div>
               <div className="w-full bg-slate-900 h-2 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (expense / (income || 1)) * 100)}%` }} 
                  />
               </div>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
            <h3 className="text-lg font-bold mb-6 text-slate-100">Pénzforgalom (6 hónap)</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getMonthlyData(transactions)}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #334155' }} />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl relative">
              <div className="absolute top-4 right-4 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded text-[10px] font-bold">TOTAL NET WORTH</div>
              <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Összesített Vagyon</h4>
              <div className="text-3xl font-black text-white">{formatHUF(totalNetWorth)}</div>
              
              <div className="mt-6 space-y-3">
                 <AssetMiniRow label="Likvid" val={assets.cash + assets.bankRevolut + assets.bankOtp} color="bg-blue-500" />
                 <AssetMiniRow label="Befektetés" val={assets.stockLightyear + assets.governmentBonds} color="bg-purple-500" />
                 <AssetMiniRow label="Kripto" val={cryptoValueHUF} color="bg-orange-500" />
              </div>
           </div>

           <div className="bg-emerald-900/20 p-6 rounded-3xl border border-emerald-500/20 shadow-xl">
              <h4 className="text-emerald-400 text-xs font-bold uppercase mb-3">Vészhelyzeti Alap</h4>
              <div className="flex items-end gap-2">
                <div className="text-4xl font-black text-white">{calculateEmergencyMonths(transactions, assets)}</div>
                <div className="text-emerald-400 font-bold pb-1 text-sm">HÓNAP</div>
              </div>
              <p className="text-emerald-400/60 text-xs mt-2">Ennyi ideig tartanának ki a likvid tartalékaid a jelenlegi költéseid mellett.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

const AssetMiniRow = ({ label, val, color }: any) => (
  <div className="flex items-center justify-between text-xs">
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-slate-400">{label}</span>
    </div>
    <span className="font-bold text-slate-200">{new Intl.NumberFormat('hu-HU').format(val)} Ft</span>
  </div>
);

const getMonthlyData = (transactions: Transaction[]) => {
  const months = ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec'];
  const data = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.getMonth();
    const name = months[m];
    const filtered = transactions.filter(t => new Date(t.date).getMonth() === m);
    data.push({
      name,
      income: filtered.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0),
      expense: filtered.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0),
    });
  }
  return data;
};

const calculateEmergencyMonths = (transactions: Transaction[], assets: AssetBalances) => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const recentExpenses = transactions.filter(t => t.type === 'expense' && new Date(t.date) > threeMonthsAgo);
  const avgMonthlyExpense = recentExpenses.reduce((a, b) => a + b.amount, 0) / 3 || 350000;
  const liquidAssets = assets.cash + assets.bankOtp + assets.bankRevolut;
  return (liquidAssets / avgMonthlyExpense).toFixed(1);
};