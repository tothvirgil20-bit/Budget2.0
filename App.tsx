import React, { useState, useEffect } from 'react';
import { Transaction, BudgetGoal, CryptoDataPoint, AssetBalances } from './types';
import { fetchSolanaPrice } from './services/api';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { Planner } from './components/Planner';
import { Crypto } from './components/Crypto';
import { Assets } from './components/Assets';
import { Settings } from './components/Settings';
import { Security } from './components/Security';
import { WalletIcon, PieChartIcon, TrendingUpIcon, TargetIcon, BankIcon, SettingsIcon } from './components/Icons';

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', date: new Date().toISOString().split('T')[0], amount: 450000, type: 'income', category: 'Fizetés', description: 'Kezdő egyenleg példa' },
];

const INITIAL_ASSETS: AssetBalances = {
  cash: 0,
  bankRevolut: 0,
  bankOtp: 0,
  stockLightyear: 0,
  governmentBonds: 0
};

type View = 'dashboard' | 'transactions' | 'crypto' | 'planner' | 'assets' | 'settings';

const App = () => {
  // JAVÍTÁS: A bejelentkezést is mentjük LocalStorage-ba
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('flow_is_authenticated') === 'true';
  });

  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  const safeParse = (key: string, fallback: any) => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return fallback;
      const parsed = JSON.parse(saved);
      return parsed || fallback;
    } catch (e) {
      console.error(`Error loading ${key}:`, e);
      return fallback;
    }
  };

  const [transactions, setTransactions] = useState<Transaction[]>(() => safeParse('flow_transactions', INITIAL_TRANSACTIONS));
  const [goals, setGoals] = useState<BudgetGoal[]>(() => safeParse('flow_goals', []));
  const [assets, setAssets] = useState<AssetBalances>(() => {
    const data = safeParse('flow_assets', INITIAL_ASSETS);
    if (data && 'bank' in data) {
      return {
        cash: data.cash || 0,
        bankRevolut: 0,
        bankOtp: data.bank || 0,
        stockLightyear: data.investment || 0,
        governmentBonds: 0
      };
    }
    return data;
  });
  const [solBalance, setSolBalance] = useState<number>(() => {
    const val = localStorage.getItem('flow_sol_balance');
    return val ? parseFloat(val) : 0;
  });

  const [solPrice, setSolPrice] = useState<number>(0);
  const [priceHistory, setPriceHistory] = useState<CryptoDataPoint[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem('flow_transactions', JSON.stringify(transactions));
      localStorage.setItem('flow_goals', JSON.stringify(goals));
      localStorage.setItem('flow_sol_balance', solBalance.toString());
      localStorage.setItem('flow_assets', JSON.stringify(assets));
    } catch (e) {
      console.error("Storage error:", e);
    }
  }, [transactions, goals, solBalance, assets]);

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

  const handleUnlock = () => {
    setIsAuthenticated(true);
    localStorage.setItem('flow_is_authenticated', 'true');
  };

  // Opcionális: Kijelentkezés funkció a Beállításokhoz
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('flow_is_authenticated');
  };

  const addTransaction = (t: Transaction) => setTransactions([...transactions, t]);
  const deleteTransaction = (id: string) => setTransactions(transactions.filter(t => t.id !== id));
  const addGoal = (g: BudgetGoal) => setGoals([...goals, g]);
  const removeGoal = (id: string) => setGoals(goals.filter(g => g.id !== id));
  const updateAssets = (key: keyof AssetBalances, value: number) => setAssets({...assets, [key]: value});

  if (!isAuthenticated) {
    return <Security onUnlock={handleUnlock} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col md:flex-row font-sans">
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800 flex-shrink-0 sticky top-0 h-screen z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">F</span>
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">FlowFinance</h1>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <NavItem active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} icon={<PieChartIcon />} label="Áttekintés" />
          <NavItem active={currentView === 'assets'} onClick={() => setCurrentView('assets')} icon={<BankIcon />} label="Vagyon" />
          <NavItem active={currentView === 'transactions'} onClick={() => setCurrentView('transactions')} icon={<WalletIcon />} label="Tranzakciók" />
          <NavItem active={currentView === 'planner'} onClick={() => setCurrentView('planner')} icon={<TargetIcon />} label="Tervező" />
          <NavItem active={currentView === 'crypto'} onClick={() => setCurrentView('crypto')} icon={<TrendingUpIcon />} label="Kripto" />
        </nav>
        <div className="p-4 border-t border-slate-800">
           <NavItem active={currentView === 'settings'} onClick={() => setCurrentView('settings')} icon={<SettingsIcon />} label="Beállítások" />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
        <header className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {currentView === 'dashboard' && 'Áttekintés'}
            {currentView === 'assets' && 'Vagyon'}
            {currentView === 'transactions' && 'Tranzakciók'}
            {currentView === 'planner' && 'Tervező'}
            {currentView === 'crypto' && 'Kripto'}
            {currentView === 'settings' && 'Beállítások'}
          </h2>
          {/* Mobilnézetben logout gombot ide lehetne tenni, vagy a beállításokba */}
        </header>

        <div className="max-w-7xl mx-auto">
          {currentView === 'dashboard' && <Dashboard transactions={transactions} assets={assets} solBalance={solBalance} solPrice={solPrice} />}
          {currentView === 'assets' && <Assets assets={assets} updateAssets={updateAssets} />}
          {currentView === 'transactions' && <Transactions transactions={transactions} addTransaction={addTransaction} deleteTransaction={deleteTransaction} />}
          {currentView === 'planner' && <Planner goals={goals} transactions={transactions} assets={assets} solBalance={solBalance} solPrice={solPrice} addGoal={addGoal} removeGoal={removeGoal} />}
          {currentView === 'crypto' && <Crypto solBalance={solBalance} setSolBalance={setSolBalance} currentPrice={solPrice} priceHistory={priceHistory} />}
          {currentView === 'settings' && <Settings transactions={transactions} assets={assets} goals={goals} solBalance={solBalance} setTransactions={setTransactions} setAssets={setAssets} setGoals={setGoals} setSolBalance={setSolBalance} />}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-slate-950 border-t border-slate-800 flex justify-around p-3 pb-safe z-50">
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
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}>
    <span className="w-5 h-5">{icon}</span>
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const MobileNavItem = ({ active, onClick, icon }: any) => (
  <button onClick={onClick} className={`p-3 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
    <span className="w-6 h-6">{icon}</span>
  </button>
);

export default App;