import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Transaction, AssetBalances } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  assets: AssetBalances;
  solBalance: number;
  solPrice: number;
}

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];

export const Dashboard: React.FC<DashboardProps> = ({ transactions, assets, solBalance, solPrice }) => {
  // USD to HUF roughly (or just treat numbers as HUF directly if user enters HUF)
  const USD_HUF = 365; 
  const cryptoValueHUF = (solBalance * solPrice) * USD_HUF;

  // 1. Net Worth Calculation (Stocks / Vagyon)
  const totalNetWorth = 
    assets.cash + 
    assets.bankRevolut + 
    assets.bankOtp + 
    assets.stockLightyear + 
    assets.governmentBonds + 
    cryptoValueHUF;

  // 2. Current Month Flow Calculation (Flow / Pénzforgalom)
  const now = new Date();
  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const currentIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentSavings = currentIncome - currentExpense;

  // Prepare Chart Data (Last 6 Months History)
  const getMonthlyData = () => {
    const months = new Map<string, { income: number; expense: number }>();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString('hu-HU', { month: 'short' });
      months.set(key, { income: 0, expense: 0 });
    }

    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = d.toLocaleString('hu-HU', { month: 'short' });
      if (months.has(key)) {
        const curr = months.get(key)!;
        if (t.type === 'income') curr.income += t.amount;
        else curr.expense += t.amount;
      }
    });

    return Array.from(months.entries()).map(([name, data]) => ({
      name,
      ...data,
      savings: data.income - data.expense
    }));
  };

  const chartData = getMonthlyData();

  const formatHUF = (val: number) => {
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
      {/* Top Cards - Updated Logic */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Teljes Nettó Vagyon" 
          value={formatHUF(totalNetWorth)} 
          subValue="Összes vagyon + Kripto" 
          color="text-emerald-400" 
        />
        <StatCard 
          title="E havi Bevétel" 
          value={formatHUF(currentIncome)} 
          subValue="Folyó hónap" 
          color="text-blue-400" 
        />
        <StatCard 
          title="E havi Kiadás" 
          value={formatHUF(currentExpense)} 
          subValue="Folyó hónap" 
          color="text-rose-400" 
        />
        <StatCard 
          title="E havi Megtakarítás" 
          value={formatHUF(currentSavings)} 
          subValue={currentSavings >= 0 ? "Növekvő vagyon" : "Vagyoncsökkenés"} 
          color={currentSavings >= 0 ? "text-emerald-400" : "text-rose-400"} 
        />
      </div>

      {/* Main Chart */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
        <h3 className="text-xl font-semibold mb-6 text-slate-100">Bevétel vs Kiadás (Elmúlt 6 hónap)</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                formatter={(value: number) => formatHUF(value)}
              />
              <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" name="Bevétel" />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" name="Kiadás" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Savings Bar Chart */}
         <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
          <h3 className="text-xl font-semibold mb-4 text-slate-100">Havi Megtakarítások</h3>
           <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  cursor={{fill: '#334155'}} 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} 
                  formatter={(value: number) => formatHUF(value)}
                />
                <Bar dataKey="savings" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Megtakarítás">
                   {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.savings >= 0 ? '#3b82f6' : '#ef4444'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
           </div>
         </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subValue, color }: { title: string, value: string, subValue: string, color: string }) => (
  <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md hover:border-slate-600 transition-colors">
    <h4 className="text-slate-400 text-sm font-medium uppercase tracking-wide">{title}</h4>
    <div className={`text-2xl font-bold mt-2 ${color} truncate`}>{value}</div>
    <div className="text-slate-500 text-xs mt-1">{subValue}</div>
  </div>
);