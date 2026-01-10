import React, { useState, useEffect } from 'react';

interface SecurityProps {
  onUnlock: () => void;
}

export const Security: React.FC<SecurityProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [setupMode, setSetupMode] = useState(false);
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('flow_app_pin');
    if (!saved) {
      setSetupMode(true);
    } else {
      setStoredPin(saved);
    }
  }, []);

  const handlePress = (num: number) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const verifyPin = (inputPin: string) => {
    if (setupMode) {
      localStorage.setItem('flow_app_pin', inputPin);
      setStoredPin(inputPin);
      setSetupMode(false);
      onUnlock();
    } else {
      if (inputPin === storedPin) {
        onUnlock();
      } else {
        setError('Helytelen PIN kód');
        setTimeout(() => setPin(''), 500);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 text-white p-4">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <span className="font-bold text-3xl">F</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {setupMode ? 'PIN Kód Beállítása' : 'Üdvözöllek újra!'}
        </h2>
        <p className="text-slate-400">
          {setupMode ? 'Adj meg egy 4 számjegyű kódot a védelemhez.' : 'Add meg a PIN kódod a belépéshez.'}
        </p>
      </div>

      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full transition-colors duration-200 ${
            pin.length > i ? 'bg-blue-500' : 'bg-slate-700'
          }`} />
        ))}
      </div>

      {error && <div className="text-rose-500 mb-4 font-medium animate-pulse">{error}</div>}

      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handlePress(num)}
            className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xl font-bold transition-all active:scale-95"
          >
            {num}
          </button>
        ))}
        <div />
        <button
          onClick={() => handlePress(0)}
          className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xl font-bold transition-all active:scale-95"
        >
          0
        </button>
        <button
          onClick={handleClear}
          className="w-16 h-16 rounded-full text-slate-400 hover:text-white font-medium flex items-center justify-center"
        >
          Törlés
        </button>
      </div>
    </div>
  );
};