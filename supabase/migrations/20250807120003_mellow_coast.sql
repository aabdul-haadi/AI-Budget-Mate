/*
  # Add Charity Tracking and User Management Features

  1. New Tables
    - `charity_donations` - Track monthly charity donations
    - `user_profiles` - Extended user information with username and restrictions
  
  2. Updates
    - Add currency change restrictions
    - Add username edit tracking
    - Add charity tracking functionality
  
  3. Security
    - Enable RLS on all new tables
    - Add policies for user data access
*/

-- Create charity donations table
CREATE TABLE IF NOT EXISTS charity_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  month_year text NOT NULL, -- Format: YYYY-MM
  donated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  username text,
  username_last_updated timestamptz,
  currency_changed boolean DEFAULT false,
  currency_change_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE charity_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for charity_donations
CREATE POLICY "Users can manage own charity donations"
  ON charity_donations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_profiles
CREATE POLICY "Users can manage own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_charity_donations_user_month ON charity_donations(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();