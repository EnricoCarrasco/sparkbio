-- Add business card settings as JSONB column on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_card_settings jsonb DEFAULT null;
