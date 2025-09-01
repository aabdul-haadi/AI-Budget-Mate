/*
  # Update Default Dark Mode Setting

  1. Changes
    - Update default dark_mode to true for all users
    - Set existing users without dark_mode preference to true
    
  2. Security
    - Maintains existing RLS policies
*/

-- Update the default value for dark_mode column
ALTER TABLE user_settings ALTER COLUMN dark_mode SET DEFAULT true;

-- Update existing users who have dark_mode set to false or null to true
UPDATE user_settings 
SET dark_mode = true 
WHERE dark_mode IS NULL OR dark_mode = false;