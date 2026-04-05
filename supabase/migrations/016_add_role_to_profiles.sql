-- =============================================
-- Add role column to profiles for admin access
-- =============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'
  CHECK (role IN ('user', 'admin', 'accountant'));
