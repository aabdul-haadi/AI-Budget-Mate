/*
  # Update RLS Policies for Multi-User System

  1. Security Updates
    - Update all RLS policies to use auth.uid() for proper user isolation
    - Ensure each user can only access their own data
    - Add proper policies for all CRUD operations

  2. Tables Updated
    - transactions: User-specific access
    - budgets: User-specific access  
    - savings_goals: User-specific access
    - user_settings: User-specific access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow manage own transactions" ON transactions;
DROP POLICY IF EXISTS "Allow manage own budgets" ON budgets;
DROP POLICY IF EXISTS "Allow manage own goals" ON savings_goals;
DROP POLICY IF EXISTS "Allow insert user settings" ON user_settings;
DROP POLICY IF EXISTS "Allow select own user settings" ON user_settings;
DROP POLICY IF EXISTS "Allow update own user settings" ON user_settings;

-- Transactions policies
CREATE POLICY "Users can manage own transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Budgets policies  
CREATE POLICY "Users can manage own budgets"
  ON budgets
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Savings goals policies
CREATE POLICY "Users can manage own goals"
  ON savings_goals
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- User settings policies
CREATE POLICY "Users can manage own settings"
  ON user_settings
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);