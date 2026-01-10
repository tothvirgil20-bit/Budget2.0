export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
}

export interface BudgetGoal {
  id: string;
  category: string;
  targetAmount: number; // The limit or goal
  type: 'spending_limit' | 'saving_goal';
}

export interface CryptoDataPoint {
  time: string;
  price: number;
}

export interface AssetBalances {
  cash: number;
  bankRevolut: number;
  bankOtp: number;
  stockLightyear: number;
  governmentBonds: number;
}

export interface FinancialAdvice {
  summary: string;
  tips: string[];
}
