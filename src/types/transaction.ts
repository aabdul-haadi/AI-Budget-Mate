export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  notes: string;
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  dark_mode: boolean;
  currency: string;
  created_at: string;
  updated_at: string;
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Transport',
  'Utilities',
  'Entertainment',
  'Health',
  'Shopping',
  'Other'
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Gift',
  'Other'
];