-- ============================================
-- ADD BANNER_URL COLUMN TO USER_PROFILES
-- Execute this script in Supabase SQL Editor
-- ============================================

-- Add banner_url column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Optional: Add comment for documentation
COMMENT ON COLUMN user_profiles.banner_url IS 'URL of the user profile banner image stored in Supabase Storage';
