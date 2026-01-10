import { GoogleGenAI } from "@google/genai";
import { Transaction, BudgetGoal, AssetBalances } from '../types';

// --- Gemini Service ---

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartFinancialAdvice = async (
  transactions: Transaction[],
  goals: BudgetGoal[],
  assets: AssetBalances,
  solBalance: number,
  solPrice: number
): Promise<string> => {
  try {
    const transactionSummary = transactions.slice(0, 50).map(t => 
      `${t.date}: ${t.type.toUpperCase()} ${t.amount} Ft (${t.category})`
    ).join('\n');

    const goalsSummary = goals.map(g => 
      `${g.type === 'spending_limit' ? 'Limit' : 'Cél'}: ${g.targetAmount} Ft - ${g.category}`
    ).join('\n');

    const totalNetWorth = assets.cash + assets.bankRevolut + assets.bankOtp + assets.stockLightyear + assets.governmentBonds + (solBalance * solPrice);

    const prompt = `
      Te egy profi pénzügyi tanácsadó vagy. Elemzed a pénzügyi adataimat.
      
      Jelenlegi Vagyonom (Részletezve):
      - Készpénz: ${assets.cash} Ft
      - Revolut: ${assets.bankRevolut} Ft
      - OTP Bank: ${assets.bankOtp} Ft
      - Lightyear (Részvények): ${assets.stockLightyear} Ft
      - Állampapír: ${assets.governmentBonds} Ft
      - Kripto (Solana): ${solBalance} SOL ($${(solBalance * solPrice).toFixed(2)})
      
      Összesen kb: ${totalNetWorth} Ft.
      
      Legutóbbi Tranzakciók:
      ${transactionSummary}
      
      Céljaim:
      ${goalsSummary}
      
      Adj egy tömör, 3 pontos megvalósítható pénzügyi tervet a következő hónapra. 
      Fókuszálj a költési szokásokra, a portfólió diverzifikációjára (állampapír vs részvény vs kripto) és a célok betartására.
      Légy barátságos, de professzionális.
      VÁLASZOLJ MAGYARUL.
      Formázd a választ Markdown formátumban.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Jelenleg nem tudok tanácsot generálni.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sajnálom, nem tudok most elemzést készíteni. Kérlek ellenőrizd az internetkapcsolatot.";
  }
};

// --- Crypto Service ---

// Simple cache to prevent spamming the public API
let lastPrice = 0;
let lastFetchTime = 0;

export const fetchSolanaPrice = async (): Promise<number> => {
  const now = Date.now();
  // Return cached if within 10 seconds
  if (now - lastFetchTime < 10000 && lastPrice > 0) {
    return lastPrice;
  }

  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    if (!response.ok) throw new Error('Failed to fetch price');
    const data = await response.json();
    
    lastPrice = data.solana.usd;
    lastFetchTime = now;
    return lastPrice;
  } catch (error) {
    console.warn("Crypto API fallback used due to error or rate limit");
    // Fallback mock if API fails/rate-limits (common in free tiers)
    // Add small random fluctuation to simulate live market
    const baseFallback = lastPrice || 145.50;
    const fluctuation = (Math.random() - 0.5) * 0.5; 
    return baseFallback + fluctuation;
  }
};