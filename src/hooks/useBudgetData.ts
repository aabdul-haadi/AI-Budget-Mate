import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction, Budget, SavingsGoal, UserSettings, CharityDonation, UserProfile } from '../lib/supabase';
import { toast } from 'react-toastify';
import { User } from '@supabase/supabase-js';

export function useBudgetData(user: User | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [charityDonations, setCharityDonations] = useState<CharityDonation[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    id: '',
    user_id: '',
    dark_mode: true,
    currency: 'PKR', // Default currency
    created_at: '',
    updated_at: ''
  });
  const [loading, setLoading] = useState(true);


  // Load all data
  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      // Clear data when user logs out
      setTransactions([]);
      setBudgets({});
      setGoals([]);
      setCharityDonations([]);
      setUserProfile(null);
      setSettings({
        id: '',
        user_id: '',
        dark_mode: true,
        currency: 'PKR', // Default currency
        created_at: '',
        updated_at: ''
      });
      setLoading(false);
    }
  }, [user]);

  const loadAllData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      await Promise.all([
        loadTransactions(user.id),
        loadBudgets(user.id),
        loadGoals(user.id),
        loadSettings(user.id),
        loadCharityDonations(user.id),
        loadUserProfile(user.id)
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (userId: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading transactions:', error);
      return;
    }

    setTransactions(data || []);
  };

  const loadBudgets = async (userId: string) => {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error loading budgets:', error);
      return;
    }

    const budgetMap = (data || []).reduce((acc, budget) => {
      acc[budget.category] = budget.monthly_limit;
      return acc;
    }, {} as Record<string, number>);

    setBudgets(budgetMap);
  };

  const loadGoals = async (userId: string) => {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading goals:', error);
      return;
    }

    setGoals(data || []);
  };

  const loadSettings = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error loading settings:', error);
      return;
    }

    if (data && data.length > 0) {
      setSettings(data[0]);
    } else {
      // Create default settings
      const defaultSettings = {
        user_id: userId,
        dark_mode: true,
        currency: 'PKR' // Default currency
      };

      const { data: newSettings, error: insertError } = await supabase
        .from('user_settings')
        .insert(defaultSettings)
        .select();

      if (!insertError && newSettings && newSettings.length > 0) {
        setSettings(newSettings[0]);
      }
    }
  };

  const loadCharityDonations = async (userId: string) => {
    const { data, error } = await supabase
      .from('charity_donations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading charity donations:', error);
      return;
    }

    setCharityDonations(data || []);
  };

  const loadUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading user profile:', error);
      return;
    }

    if (data) {
      setUserProfile(data);
    } else {
      // Create default profile
      const defaultUsername = user?.email?.split('@')[0] || 'user';
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          username: defaultUsername,
          currency_changed: false
        })
        .select()
        .single();

      if (!insertError && newProfile) {
        setUserProfile(newProfile);
      }
    }
  };

  const addCharityDonation = async (amount: number) => {
    if (!user?.id) return;

    const monthYear = new Date().toISOString().substring(0, 7); // YYYY-MM

    const { data, error } = await supabase
      .from('charity_donations')
      .insert({
        user_id: user.id,
        amount,
        month_year: monthYear
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding charity donation:', error);
      toast.error('Failed to record donation');
      return;
    }

    if (data) {
      setCharityDonations(prev => [data, ...prev]);
      toast.success(`Alhamdulillah! PKR ${amount} donation recorded. May Allah accept your charity.`);
    }
  };

  const updateUsername = async (newUsername: string) => {
    if (!user?.id || !userProfile) return { success: false, error: 'No user profile found' };

    // Check if username was updated in last 15 days
    if (userProfile.username_last_updated) {
      const lastUpdate = new Date(userProfile.username_last_updated);
      const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceUpdate < 15) {
        const remainingDays = Math.ceil(15 - daysSinceUpdate);
        return { 
          success: false, 
          error: `You can update your username again in ${remainingDays} days.` 
        };
      }
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        username: newUsername,
        username_last_updated: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating username:', error);
      return { success: false, error: 'Failed to update username' };
    }

    if (data) {
      setUserProfile(data);
      return { success: true };
    }

    return { success: false, error: 'Unknown error' };
  };

  const updateCurrency = async (newCurrency: string, password: string) => {
    if (!user?.id || !userProfile) return { success: false, error: 'No user profile found' };

    if (userProfile.currency_changed) {
      return { 
        success: false, 
        error: 'Currency has already been changed and cannot be modified again.' 
      };
    }

    // Verify password
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password
    });

    if (authError) {
      return { success: false, error: 'Invalid password. Please try again.' };
    }

    // Update currency in settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .update({ currency: newCurrency })
      .eq('user_id', user.id);

    if (settingsError) {
      console.error('Error updating currency in settings:', settingsError);
      return { success: false, error: 'Failed to update currency' };
    }

    // Mark currency as changed in profile
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        currency_changed: true,
        currency_change_date: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }

    if (data) {
      setUserProfile(data);
      setSettings(prev => ({ ...prev, currency: newCurrency }));
      return { success: true };
    }

    return { success: false, error: 'Unknown error' };
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
      return;
    }

    if (data) {
      setTransactions(prev => [data, ...prev]);
    }
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
      return;
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addGoal = async (goal: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        ...goal,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding goal:', error);
      toast.error('Failed to add goal');
      return;
    }

    if (data) {
      setGoals(prev => [...prev, data]);
    }
  };

  const updateGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    const { data, error } = await supabase
      .from('savings_goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
      return;
    }

    if (data) {
      setGoals(prev => prev.map(goal => 
        goal.id === id ? data : goal
      ));
    }
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
      return;
    }

    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const updateBudgets = async (newBudgets: Record<string, number>) => {
    if (!user?.id) return;

    try {
      // Delete existing budgets
      await supabase
        .from('budgets')
        .delete()
        .eq('user_id', user.id);

      // Insert new budgets
      const budgetEntries = Object.entries(newBudgets)
        .filter(([, limit]) => limit > 0)
        .map(([category, monthly_limit]) => ({
          user_id: user.id,
          category,
          monthly_limit
        }));

      if (budgetEntries.length > 0) {
        const { error } = await supabase
          .from('budgets')
          .insert(budgetEntries);

        if (error) {
          console.error('Error updating budgets:', error);
          toast.error('Failed to update budgets');
          return;
        }
      }

      setBudgets(newBudgets);
    } catch (error) {
      console.error('Error updating budgets:', error);
      toast.error('Failed to update budgets');
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('user_settings')
      .update(newSettings)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
      return;
    }

    if (data) {
      setSettings(data);
    }
  };

  return {
    transactions,
    budgets,
    goals,
    charityDonations,
    userProfile,
    settings,
    loading,
    setTransactions: () => {}, // Read-only, use database functions
    setBudgets: updateBudgets,
    setGoals: () => {}, // Read-only, use database functions
    setSettings: updateSettings,
    addTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    addCharityDonation,
    updateUsername,
    updateCurrency,
    refreshData: loadAllData
  };
}