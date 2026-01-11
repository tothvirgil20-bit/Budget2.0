import React, { useState, useEffect } from 'react';
import { Transaction, BudgetGoal, CryptoDataPoint, AssetBalances, RecurringTemplate, QuickAction } from './types';
import { fetchSolanaPrice } from './services/api';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { Planner } from './components/Planner';
import { Crypto } from './components/Crypto';
import { Assets } from './components/Assets';
import { Settings } from './components/Settings';
import { WalletIcon, PieChartIcon, TrendingUpIcon, TargetIcon, BankIcon, SettingsIcon } from './components/Icons';

const INITIAL_ASSETS: AssetBalances = {
  cash: 0,
  bankRevolut: 0,
  bankOtp: 0,
  stockLightyear: 0,
  governmentBonds: 0
};

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { id: '1', label: 'Kávé', amount: 850, category: 'Szórakozás', icon: '☕', assetKey: 'cash' },
  { id: '2', label: 'Ebéd', amount: 2800, category: 'Élelmiszer', icon: '🍱', assetKey: 'bankRevolut' },
  { id: '3', label: 'Spar', amount: 5000, category: 'Élelmiszer', icon: '🛒', assetKey: 'bankOtp' },
  { id: '4', label: 'Tankolás', amount: 18000, category: 'Utazás', icon: '⛽', assetKey: 'bankOtp' },
];

type View = 'dashboard' | 'transactions' | 'crypto' | 'planner' | 'assets' | 'settings';

const App = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  const safeParse = (key: string, fallback: any) => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return fallback;
      return JSON.parse(saved) || fallback;
    } catch (e) {
      console.error(`Error parsing ${key}`, e);
      return fallback;
    }
  };

  const [transactions, setTransactions] = useState<Transaction[]>(() => safeParse('flow_transactions', []));
  const [goals, setGoals] = useState<BudgetGoal[]>(() => safeParse('flow_goals', []));
  const [assets, setAssets] = useState<AssetBalances>(() => safeParse('flow_assets', INITIAL_ASSETS));
  const [recurring, setRecurring] = useState<RecurringTemplate[]>(() => safeParse('flow_recurring', []));
  const [quickActions, setQuickActions] = useState<QuickAction[]>(() => safeParse('flow_quick_actions', DEFAULT_QUICK_ACTIONS));
  const [solBalance, setSolBalance] = useState<number>(() => {
    const val = localStorage.getItem('flow_sol_balance');
    return val ? parseFloat(val) : 0;
  });

  const [solPrice, setSolPrice] = useState<number>(0);
  const [priceHistory, setPriceHistory] = useState<CryptoDataPoint[]>([]);

  useEffect(() => {
    localStorage.setItem('flow_transactions', JSON.stringify(transactions));
    localStorage.setItem('flow_goals', JSON.stringify(goals));
    localStorage.setItem('flow_assets', JSON.stringify(assets));
    localStorage.setItem('flow_recurring', JSON.stringify(recurring));
    localStorage.setItem('flow_quick_actions', JSON.stringify(quickActions));
    localStorage.setItem('flow_sol_balance', solBalance.toString());
  }, [transactions, goals, assets, recurring, quickActions, solBalance]);

  useEffect(() => {
    const lastRunDate = localStorage.getItem('flow_last_recurring_run');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (lastRunDate !== todayStr) {
      const currentDay = today.getDate();
      const newTransactions: Transaction[] = [];
      let calculatedAssets = { ...assets };
      let hasUpdates = false;

      recurring.forEach(template => {
        if (template.dayOfMonth === currentDay) {
          const t: Transaction = {
            id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            date: todayStr,
            amount: template.amount,
            type: template.type,
            category: template.category,
            description: `(Auto) ${template.description}`,
            assetKey: template.assetKey,
            isRecurring: true
          };
          
          const exists = transactions.some(prev => prev.date === todayStr && prev.description === t.description);
          if (!exists) {
            newTransactions.push(t);
            const change = t.type === 'income' ? t.amount : -t.amount;
            calculatedAssets[t.assetKey] += change;
            hasUpdates = true;
          }
        }
      });

      if (hasUpdates) {
        setTransactions(prev => [...prev, ...newTransactions]);
        setAssets(calculatedAssets);
      }
      localStorage.setItem('flow_last_recurring_run', todayStr);
    }
  }, [recurring]);

  useEffect(() => {
    const getPrice = async () => {
      const price = await fetchSolanaPrice();
      setSolPrice(price);
      setPriceHistory(prev => {
        const now = new Date();
        const timeString = `${now.getHours()}:${now.getMinutes()}`;
        return [...prev, { time: timeString, price }].slice(-20);
      });
    };
    getPrice();
    const interval = setInterval(getPrice, 30000); 
    return () => clearInterval(interval);
  }, []);

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
    setAssets(prevAssets => {
      const change = newTx.type === 'income' ? newTx.amount : -newTx.amount;
      return {
        ...prevAssets,
        [newTx.assetKey]: prevAssets[newTx.assetKey] + change
      };
    });
  };

  // Completely robust delete function using functional state updates
  const handleDeleteTransaction = (id: string) => {
    setTransactions(currentTransactions => {
      const txToDelete = currentTransactions.find(t => t.id === id);
      
      // If found, update assets immediately using the found transaction data
      if (txToDelete) {
        setAssets(currentAssets => {
          const reversalAmount = txToDelete.type === 'income' ? -txToDelete.amount : txToDelete.amount;
          return {
            ...currentAssets,
            [txToDelete.assetKey]: currentAssets[txToDelete.assetKey] + reversalAmount
          };
        });
      }

      // Return the filtered list
      return currentTransactions.filter(t => t.id !== id);
    });
  };

  const handleUpdateAssets = (key: keyof AssetBalances, value: number) => {
    setAssets(prev => ({...prev, [key]: value}));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col md:flex-row font-sans overflow-hidden">
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800 flex-shrink-0 h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="font-bold text-white">F</span>
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">FlowFinance</h1>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <NavItem active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} icon={<PieChartIcon />} label="Dashboard" />
          <NavItem active={currentView === 'assets'} onClick={() => setCurrentView('assets')} icon={<BankIcon />} label="Vagyon" />
          <NavItem active={currentView === 'transactions'} onClick={() => setCurrentView('transactions')} icon={<WalletIcon />} label="Tranzakciók" />
          <NavItem active={currentView === 'planner'} onClick={() => setCurrentView('planner')} icon={<TargetIcon />} label="Tervező" />
          <NavItem active={currentView === 'crypto'} onClick={() => setCurrentView('crypto')} icon={<TrendingUpIcon />} label="Kripto" />
        </nav>
        <div className="p-4 border-t border-slate-800">
           <NavItem active={currentView === 'settings'} onClick={() => setCurrentView('settings')} icon={<SettingsIcon />} label="Beállítások" />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
            {currentView === 'dashboard' && 'Üdvözöllek!'}
            {currentView === 'assets' && 'Vagyonelemek'}
            {currentView === 'transactions' && 'Tranzakciók'}
            {currentView === 'planner' && 'Pénzügyi Tervező'}
            {currentView === 'crypto' && 'Solana Portfólió'}
            {currentView === 'settings' && 'Beállítások'}
          </h2>
        </header>

        <div className="max-w-7xl mx-auto">
          {currentView === 'dashboard' && (
            <Dashboard 
              transactions={transactions} 
              assets={assets} 
              solBalance={solBalance} 
              solPrice={solPrice} 
              addTransaction={handleAddTransaction}
              quickActions={quickActions}
            />
          )}
          {currentView === 'assets' && <Assets assets={assets} updateAssets={handleUpdateAssets} />}
          {currentView === 'transactions' && (
            <Transactions 
              transactions={transactions} 
              addTransaction={handleAddTransaction} 
              deleteTransaction={handleDeleteTransaction} 
              recurring={recurring}
              setRecurring={setRecurring}
            />
          )}
          {currentView === 'planner' && (
            <Planner 
              goals={goals} 
              transactions={transactions} 
              assets={assets} 
              solBalance={solBalance} 
              solPrice={solPrice} 
              addGoal={(g) => setGoals([...goals, g])} 
              removeGoal={(id) => setGoals(goals.filter(g => g.id !== id))} 
            />
          )}
          {currentView === 'crypto' && <Crypto solBalance={solBalance} setSolBalance={setSolBalance} currentPrice={solPrice} priceHistory={priceHistory} />}
          {currentView === 'settings' && (
            <Settings 
              transactions={transactions} 
              assets={assets} 
              goals={goals} 
              solBalance={solBalance}
              quickActions={quickActions}
              setQuickActions={setQuickActions}
              setTransactions={setTransactions} 
              setAssets={setAssets} 
              setGoals={setGoals} 
              setSolBalance={setSolBalance} 
            />
          )}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-slate-950 border-t border-slate-800 flex justify-around p-3 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
          <MobileNavItem active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} icon={<PieChartIcon />} />
          <MobileNavItem active={currentView === 'assets'} onClick={() => setCurrentView('assets')} icon={<BankIcon />} />
          <MobileNavItem active={currentView === 'transactions'} onClick={() => setCurrentView('transactions')} icon={<WalletIcon />} />
          <MobileNavItem active={currentView === 'planner'} onClick={() => setCurrentView('planner')} icon={<TargetIcon />} />
          <MobileNavItem active={currentView === 'settings'} onClick={() => setCurrentView('settings')} icon={<SettingsIcon />} />
      </nav>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-inner' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}>
    <span className="w-5 h-5">{icon}</span>
    <span className="font-semibold text-sm">{label}</span>
  </button>
);

const MobileNavItem = ({ active, onClick, icon }: any) => (
  <button onClick={onClick} className={`p-3 rounded-2xl transition-all active:scale-90 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'text-slate-400 hover:text-slate-200'}`}>
    <span className="w-6 h-6">{icon}</span>
  </button>
);

export default App;