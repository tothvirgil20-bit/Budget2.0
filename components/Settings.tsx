import React, { useRef, useState } from 'react';
import { Transaction, BudgetGoal, AssetBalances, QuickAction } from '../types';
import { DownloadIcon, UploadIcon, TrashIcon, SettingsIcon } from './Icons';

interface SettingsProps {
  transactions: Transaction[];
  assets: AssetBalances;
  goals: BudgetGoal[];
  solBalance: number;
  quickActions: QuickAction[];
  setQuickActions: (qa: QuickAction[]) => void;
  setTransactions: (t: Transaction[]) => void;
  setAssets: (a: AssetBalances) => void;
  setGoals: (g: BudgetGoal[]) => void;
  setSolBalance: (n: number) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  transactions, assets, goals, solBalance, quickActions,
  setQuickActions, setTransactions, setAssets, setGoals, setSolBalance 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const handleExport = () => {
    const data = {
      transactions,
      assets,
      goals,
      solBalance,
      quickActions,
      exportDate: new Date().toISOString(),
      appVersion: '1.1'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flowfinance_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setMessage({ text: 'Sikeres exportálás! A fájl letöltve.', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (json.transactions && json.assets && json.goals) {
          if (confirm('Biztosan be akarod tölteni ezeket az adatokat? A jelenlegi adatok felülírásra kerülnek.')) {
            setTransactions(json.transactions);
            setAssets(json.assets);
            setGoals(json.goals);
            if (json.quickActions) setQuickActions(json.quickActions);
            if (typeof json.solBalance === 'number') setSolBalance(json.solBalance);
            
            setMessage({ text: 'Sikeres importálás! Az adatok frissültek.', type: 'success' });
          }
        } else {
          throw new Error('Érvénytelen fájl formátum');
        }
      } catch (err) {
        console.error(err);
        setMessage({ text: 'Hiba történt az importálás során. Hibás fájl.', type: 'error' });
      }
      setTimeout(() => setMessage(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('VIGYÁZAT! Minden adat törlődni fog az alkalmazásból. Biztosan folytatod?')) {
        localStorage.clear();
        window.location.reload();
    }
  };

  const updateQuickAction = (id: string, field: keyof QuickAction, value: any) => {
    const newActions = quickActions.map(qa => 
      qa.id === id ? { ...qa, [field]: value } : qa
    );
    setQuickActions(newActions);
  };

  const assetNames: Record<keyof AssetBalances, string> = {
    cash: 'Készpénz',
    bankRevolut: 'Revolut',
    bankOtp: 'OTP Bank',
    stockLightyear: 'Lightyear',
    governmentBonds: 'Állampapír'
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-0 animate-fade-in">
      
      {message && (
        <div className={`p-4 rounded-2xl mb-6 border shadow-lg ${
          message.type === 'success' 
            ? 'bg-emerald-900/50 border-emerald-500 text-emerald-200' 
            : 'bg-rose-900/50 border-rose-500 text-rose-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Quick Actions Section */}
      <div className="bg-slate-800 p-8 rounded-[32px] border border-slate-700 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
           <div className="bg-blue-600/20 p-2 rounded-xl text-blue-400">
             <SettingsIcon className="w-6 h-6" />
           </div>
           <div>
             <h3 className="text-xl font-black text-white uppercase tracking-tight">Gyorsgombok Szerkesztése</h3>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Szabd testre a Dashboardon lévő parancsokat</p>
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map(qa => (
            <div key={qa.id} className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50 space-y-3">
               <div className="flex items-center gap-3">
                 <span className="text-2xl">{qa.icon}</span>
                 <input 
                   type="text" 
                   value={qa.label} 
                   onChange={e => updateQuickAction(qa.id, 'label', e.target.value)}
                   className="flex-1 bg-transparent text-white font-black uppercase tracking-widest focus:outline-none border-b border-transparent focus:border-blue-500"
                 />
               </div>
               
               <div className="space-y-1">
                 <label className="text-[10px] text-slate-500 uppercase font-black ml-1">Összeg (Ft)</label>
                 <input 
                    type="number"
                    inputMode="decimal"
                    value={qa.amount}
                    onFocus={e => e.target.select()}
                    onChange={e => updateQuickAction(qa.id, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-black shadow-inner"
                 />
               </div>

               <div className="space-y-1">
                 <label className="text-[10px] text-slate-500 uppercase font-black ml-1">Forrás Számla</label>
                 <select 
                   value={qa.assetKey} 
                   onChange={e => updateQuickAction(qa.id, 'assetKey', e.target.value)}
                   className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs shadow-inner focus:outline-none"
                 >
                   {Object.entries(assetNames).map(([key, name]) => (
                     <option key={key} value={key}>{name}</option>
                   ))}
                 </select>
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 p-8 rounded-[32px] border border-slate-700 shadow-xl">
        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Adatkezelés</h3>
        <p className="text-slate-400 text-sm mb-8">
          Mentsd le az adataidat, ha másik eszközre váltasz.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={handleExport}
            className="flex flex-col items-center gap-3 p-6 bg-slate-900/50 rounded-2xl border border-slate-700 hover:bg-slate-900 transition-all group"
          >
            <div className="bg-blue-600/10 p-4 rounded-full text-blue-400 group-hover:scale-110 transition-transform">
              <DownloadIcon className="w-6 h-6" />
            </div>
            <div className="text-center">
               <div className="font-black text-white uppercase tracking-widest text-xs">Letöltés</div>
               <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Export JSON fájlba</div>
            </div>
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-3 p-6 bg-slate-900/50 rounded-2xl border border-slate-700 hover:bg-slate-900 transition-all group"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
            <div className="bg-emerald-600/10 p-4 rounded-full text-emerald-400 group-hover:scale-110 transition-transform">
              <UploadIcon className="w-6 h-6" />
            </div>
            <div className="text-center">
               <div className="font-black text-white uppercase tracking-widest text-xs">Visszaállítás</div>
               <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Fájl betöltése</div>
            </div>
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700 flex justify-between items-center">
            <div>
                <div className="font-black text-rose-500 uppercase tracking-widest text-xs">Adatok Törlése</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Minden adat végleges törlése az eszközről</div>
            </div>
            <button 
                onClick={handleReset}
                className="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white p-4 rounded-2xl transition-all"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};