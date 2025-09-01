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
  current_amount: number;  // Corrected to match the column name in Supabase
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

// Fetch all savings goals including current_amount
export const getSavingsGoals = async () => {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('id, user_id, title, target_amount, current_amount, target_date, created_at, updated_at');

  if (error) {
    console.error('Error fetching savings goals:', error);
    return null;
  }

  return data;
};

// Fetch a specific savings goal by ID
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

  return data;
};

// Update current_amount for a specific savings goal
export const updateCurrentAmount = async (goalId: string, newAmount: number) => {
  const { data, error } = await supabase
    .from('savings_goals')
    .update({ current_amount: newAmount })  // Corrected to use current_amount
    .eq('id', goalId);

  if (error) {
    console.error('Error updating current amount:', error);
    return null;
  }

  return data;
};

// Create a new savings goal
export const createSavingsGoal = async (userId: string, title: string, targetAmount: number, targetDate: string) => {
  const { data, error } = await supabase
    .from('savings_goals')
    .insert([
      {
        user_id: userId,
        title: title,
        target_amount: targetAmount,
        current_amount: 0, // Set the initial current amount to 0
        target_date: targetDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

  if (error) {
    console.error('Error creating savings goal:', error);
    return null;
  }

  return data;
};
