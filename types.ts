export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  assetKey: keyof AssetBalances;
  isRecurring?: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  amount: number;
  category: string;
  icon: string;
  assetKey: keyof AssetBalances;
}

export interface RecurringTemplate {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  assetKey: keyof AssetBalances;
  dayOfMonth: number;
}

export interface BudgetGoal {
  id: string;
  category: string;
  targetAmount: number;
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