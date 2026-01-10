import React, { useRef, useState } from 'react';
import { Transaction, BudgetGoal, AssetBalances } from '../types';
import { DownloadIcon, UploadIcon, TrashIcon } from './Icons';

interface SettingsProps {
  transactions: Transaction[];
  assets: AssetBalances;
  goals: BudgetGoal[];
  solBalance: number;
  setTransactions: (t: Transaction[]) => void;
  setAssets: (a: AssetBalances) => void;
  setGoals: (g: BudgetGoal[]) => void;
  setSolBalance: (n: number) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  transactions, assets, goals, solBalance, 
  setTransactions, setAssets, setGoals, setSolBalance 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const handleExport = () => {
    const data = {
      transactions,
      assets,
      goals,
      solBalance,
      exportDate: new Date().toISOString(),
      appVersion: '1.0'
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
        
        // Basic validation
        if (json.transactions && json.assets && json.goals) {
          if (confirm('Biztosan be akarod tölteni ezeket az adatokat? A jelenlegi adatok felülírásra kerülnek.')) {
            setTransactions(json.transactions);
            setAssets(json.assets);
            setGoals(json.goals);
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
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('VIGYÁZAT! Minden adat törlődni fog az alkalmazásból. Biztosan folytatod?')) {
        localStorage.clear();
        window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-0 animate-fade-in">
      
      {message && (
        <div className={`p-4 rounded-lg mb-6 border ${
          message.type === 'success' 
            ? 'bg-emerald-900/50 border-emerald-500 text-emerald-200' 
            : 'bg-rose-900/50 border-rose-500 text-rose-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-2">Adatkezelés</h3>
        <p className="text-slate-400 text-sm mb-6">
          Az alkalmazás az adatokat a böngésződben tárolja. Ha másik eszközre váltasz (pl. telefonra), mentsd el az adatokat itt, és töltsd be az új eszközön.
        </p>

        <div className="space-y-4">
          
          {/* Export */}
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">Biztonsági Mentés (Export)</div>
              <div className="text-xs text-slate-500">Mentsd le az adataidat egy fájlba.</div>
            </div>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <DownloadIcon className="w-4 h-4" />
              Letöltés
            </button>
          </div>

          {/* Import */}
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">Visszaállítás (Import)</div>
              <div className="text-xs text-slate-500">Tölts vissza egy korábbi mentést.</div>
            </div>
            <div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors font-medium border border-slate-600"
              >
                <UploadIcon className="w-4 h-4" />
                Feltöltés
              </button>
            </div>
          </div>

           {/* Reset */}
           <div className="mt-8 pt-6 border-t border-slate-700">
             <div className="flex items-center justify-between">
                <div>
                    <div className="font-bold text-rose-400">Adatok Törlése</div>
                    <div className="text-xs text-slate-500">Minden adat végleges törlése.</div>
                </div>
                <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 text-rose-500 hover:bg-rose-900/20 px-4 py-2 rounded-lg transition-colors"
                >
                    <TrashIcon className="w-4 h-4" />
                    Törlés
                </button>
             </div>
           </div>

        </div>
      </div>
    </div>
  );
};