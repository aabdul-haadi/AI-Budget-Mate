/*
  # Update default currency to PKR

  1. Changes
    - Update default currency in user_settings table to PKR
    - Update existing users to PKR if they don't have a currency set
*/

-- Update the default value for currency column
ALTER TABLE user_settings ALTER COLUMN currency SET DEFAULT 'PKR';

-- Update existing users who might have null or empty currency
UPDATE user_settings 
SET currency = 'PKR' 
WHERE currency IS NULL OR currency = '';