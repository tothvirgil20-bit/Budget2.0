import React, { useState } from 'react';
import { AssetBalances } from '../types';
import { BankIcon } from './Icons';

interface AssetsProps {
  assets: AssetBalances;
  updateAssets: (key: keyof AssetBalances, value: number) => void;
}

export const Assets: React.FC<AssetsProps> = ({ assets, updateAssets }) => {
  const [editing, setEditing] = useState<keyof AssetBalances | null>(null);
  const [tempValue, setTempValue] = useState('');

  const startEdit = (key: keyof AssetBalances, val: number) => {
    setEditing(key);
    setTempValue(val.toString());
  };

  const saveEdit = () => {
    if (editing) {
      const val = parseFloat(tempValue);
      if (!isNaN(val)) {
        updateAssets(editing, val);
      }
      setEditing(null);
    }
  };

  const formatHUF = (val: number) => {
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(val);
  };

  const totalAssets = 
    assets.cash + 
    assets.bankRevolut + 
    assets.bankOtp + 
    assets.stockLightyear + 
    assets.governmentBonds;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-0 animate-fade-in">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
           <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white">
              <BankIcon className="w-6 h-6" />
           </div>
           <div>
             <h3 className="text-xl font-bold text-white">Vagyon Kezelő</h3>
             <p className="text-slate-400 text-sm">Frissítsd az 5 fő vagyonelemedet.</p>
           </div>
        </div>

        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 ml-2">Likvid Eszközök</div>
          
          <AssetRow 
            label="Készpénz" 
            value={assets.cash} 
            isEditing={editing === 'cash'}
            editValue={tempValue}
            setEditValue={setTempValue}
            onEdit={() => startEdit('cash', assets.cash)}
            onSave={saveEdit}
            color="text-emerald-400"
          />

          <AssetRow 
            label="Bankszámla (Revolut)" 
            value={assets.bankRevolut} 
            isEditing={editing === 'bankRevolut'}
            editValue={tempValue}
            setEditValue={setTempValue}
            onEdit={() => startEdit('bankRevolut', assets.bankRevolut)}
            onSave={saveEdit}
            color="text-blue-400"
          />

           <AssetRow 
            label="Bankszámla (OTP)" 
            value={assets.bankOtp} 
            isEditing={editing === 'bankOtp'}
            editValue={tempValue}
            setEditValue={setTempValue}
            onEdit={() => startEdit('bankOtp', assets.bankOtp)}
            onSave={saveEdit}
            color="text-blue-500"
          />
        
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-6 mb-2 ml-2">Befektetések</div>

          <AssetRow 
            label="Részvények (Lightyear)" 
            value={assets.stockLightyear} 
            isEditing={editing === 'stockLightyear'}
            editValue={tempValue}
            setEditValue={setTempValue}
            onEdit={() => startEdit('stockLightyear', assets.stockLightyear)}
            onSave={saveEdit}
            color="text-purple-400"
          />

           <AssetRow 
            label="Állampapír" 
            value={assets.governmentBonds} 
            isEditing={editing === 'governmentBonds'}
            editValue={tempValue}
            setEditValue={setTempValue}
            onEdit={() => startEdit('governmentBonds', assets.governmentBonds)}
            onSave={saveEdit}
            color="text-yellow-400"
          />
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700">
           <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Összesen (Kripto nélkül)</span>
              <span className="text-2xl font-bold text-white">
                {formatHUF(totalAssets)}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
};

const AssetRow = ({ label, value, isEditing, editValue, setEditValue, onEdit, onSave, color }: any) => {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900/80 transition-colors">
      <div className="font-medium text-slate-300">{label}</div>
      
      {isEditing ? (
        <div className="flex gap-2">
          <input 
            type="number" 
            inputMode="decimal"
            value={editValue}
            autoFocus
            onFocus={(e) => e.target.select()}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={onSave}
            onKeyDown={(e) => e.key === 'Enter' && onSave()}
            className="w-32 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-right font-bold focus:outline-none focus:border-indigo-500"
          />
          <button onClick={onSave} className="text-sm bg-indigo-600 px-3 py-1 rounded text-white font-bold">OK</button>
        </div>
      ) : (
        <div onClick={onEdit} className={`text-xl font-bold cursor-pointer px-3 py-1 rounded transition-colors select-none ${color}`}>
           {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(value)}
        </div>
      )}
    </div>
  );
};