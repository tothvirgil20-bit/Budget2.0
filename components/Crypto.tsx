import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CryptoDataPoint } from '../types';

interface CryptoProps {
  solBalance: number;
  setSolBalance: (amount: number) => void;
  currentPrice: number;
  priceHistory: CryptoDataPoint[];
}

export const Crypto: React.FC<CryptoProps> = ({ solBalance, setSolBalance, currentPrice, priceHistory }) => {
  const [inputValue, setInputValue] = useState(solBalance.toString());

  const handleUpdate = () => {
    const val = parseFloat(inputValue);
    if (!isNaN(val) && val >= 0) {
      setSolBalance(val);
    }
  };

  const totalValue = solBalance * currentPrice;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Portfolio Card */}
        <div className="md:col-span-1 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-xl font-bold text-white">Solana Egyenleg</h3>
             <img src="https://assets.coingecko.com/coins/images/4128/large/solana.png?1547769861" alt="SOL" className="w-8 h-8 rounded-full" />
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase font-semibold">Mennyiség (SOL)</label>
              <div className="flex gap-2 mt-1">
                <input 
                  type="number" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button 
                  onClick={handleUpdate}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium transition-colors"
                >
                  Mentés
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700">
               <div className="text-slate-400 text-sm">Jelenlegi Érték</div>
               <div className="text-3xl font-bold text-purple-400">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
               <div className="text-slate-500 text-sm mt-1">
                 1 SOL = <span className="text-white">${currentPrice.toFixed(2)}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Live Chart */}
        <div className="md:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 flex items-center space-x-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-xs text-green-400 font-medium">ÉLŐ</span>
           </div>
           <h3 className="text-xl font-bold text-white mb-2">SOL/USD Élő Árfolyam</h3>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceHistory}>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={['auto', 'auto']} stroke="#64748b" tickFormatter={(val) => `$${val.toFixed(2)}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ár']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#a855f7" 
                    strokeWidth={3} 
                    dot={false}
                    animationDuration={300}
                  />
                </LineChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};