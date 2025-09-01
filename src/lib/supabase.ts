import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Database Types
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

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  dark_mode: boolean;
  currency: string; // Default: 'PKR'
  created_at: string;
  updated_at: string;
}

export interface CharityDonation {
  id: string;
  user_id: string;
  amount: number;
  month_year: string; // Format: YYYY-MM
  donated_at: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  username_last_updated: string | null;
  currency_changed: boolean;
  currency_change_date: string | null;
  created_at: string;
  updated_at: string;
}

// Helper Functions for Savings Goals
export const getSavingsGoals = async () => {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('id, user_id, title, target_amount, current_amount, target_date, created_at, updated_at');

  if (error) {
    console.error('Error fetching savings goals:', error);
    return null;
  }

  return data as SavingsGoal[];
};

export const getSavingsGoalById = async (goalId: string) => {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('id, user_id, title, target_amount, current_amount, target_date, created_at, updated_at')
    .eq('id', goalId)
    .single();

  if (error) {
    console.error('Error fetching savings goal:', error);
    return null;
  }

  return data as SavingsGoal;
};

export const updateCurrentAmount = async (goalId: string, newAmount: number) => {
  const { data, error } = await supabase
    .from('savings_goals')
    .update({ current_amount: newAmount, updated_at: new Date().toISOString() })
    .eq('id', goalId)
    .select();

  if (error) {
    console.error('Error updating current amount:', error);
    return null;
  }

  return data as SavingsGoal[];
};

export const createSavingsGoal = async (userId: string, title: string, targetAmount: number, targetDate: string) => {
  const { data, error } = await supabase
    .from('savings_goals')
    .insert([
      {
        user_id: userId,
        title,
        target_amount: targetAmount,
        current_amount: 0,
        target_date: targetDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) {
    console.error('Error creating savings goal:', error);
    return null;
  }

  return data as SavingsGoal[];
};

// Helper Functions for Transactions
export const getTransactions = async (userId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('id, user_id, amount, type, category, date, notes, created_at')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching transactions:', error);
    return null;
  }

  return data as Transaction[];
};

export const createTransaction = async (
  userId: string,
  amount: number,
  type: 'income' | 'expense',
  category: string,
  date: string,
  notes: string
) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        user_id: userId,
        amount,
        type,
        category,
        date,
        notes,
        created_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) {
    console.error('Error creating transaction:', error);
    return null;
  }

  return data as Transaction[];
};

// Helper Functions for Budgets
export const getBudgets = async (userId: string) => {
  const { data, error } = await supabase
    .from('budgets')
    .select('id, user_id, category, monthly_limit, created_at, updated_at')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching budgets:', error);
    return null;
  }

  return data as Budget[];
};

export const createBudget = async (userId: string, category: string, monthlyLimit: number) => {
  const { data, error } = await supabase
    .from('budgets')
    .insert([
      {
        user_id: userId,
        category,
        monthly_limit: monthlyLimit,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) {
    console.error('Error creating budget:', error);
    return null;
  }

  return data as Budget[];
};

// Helper Functions for User Settings
export const getUserSettings = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('id, user_id, dark_mode, currency, created_at, updated_at')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }

  return data as UserSettings;
};

export const updateUserSettings = async (userId: string, darkMode: boolean, currency: string) => {
  const { data, error } = await supabase
    .from('user_settings')
    .update({ dark_mode: darkMode, currency, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select();

  if (error) {
    console.error('Error updating user settings:', error);
    return null;
  }

  return data as UserSettings[];
};

// Helper Functions for Charity Donations
export const getCharityDonations = async (userId: string) => {
  const { data, error } = await supabase
    .from('charity_donations')
    .select('id, user_id, amount, month_year, donated_at, created_at')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching charity donations:', error);
    return null;
  }

  return data as CharityDonation[];
};

export const createCharityDonation = async (userId: string, amount: number, monthYear: string) => {
  const { data, error } = await supabase
    .from('charity_donations')
    .insert([
      {
        user_id: userId,
        amount,
        month_year: monthYear,
        donated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) {
    console.error('Error creating charity donation:', error);
    return null;
  }

  return data as CharityDonation[];
};

// Helper Functions for User Profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, user_id, username, username_last_updated, currency_changed, currency_change_date, created_at, updated_at')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data as UserProfile;
};

export const updateUserProfile = async (
  userId: string,
  username: string | null,
  currencyChanged: boolean
) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      username,
      username_last_updated: username ? new Date().toISOString() : null,
      currency_changed: currencyChanged,
      currency_change_date: currencyChanged ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return data as UserProfile[];
};