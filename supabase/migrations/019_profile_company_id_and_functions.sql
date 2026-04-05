-- =============================================
-- Add company_id to profiles + approval function
-- =============================================

-- Add company_id to profiles (denormalized for fast RLS lookups)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company_id);

-- Update handle_new_user to include avatar_url
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Function: approve a company registration
-- Called by back office admin via supabase.rpc()
-- =============================================
CREATE OR REPLACE FUNCTION public.approve_company_registration(
  registration_id UUID,
  admin_id UUID
)
RETURNS UUID AS $$
DECLARE
  reg RECORD;
  new_company_id UUID;
  free_plan_id UUID;
BEGIN
  -- Get the registration
  SELECT * INTO reg FROM company_registrations
  WHERE id = registration_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found or already processed';
  END IF;

  -- Get the free/starter plan
  SELECT id INTO free_plan_id FROM subscription_plans WHERE slug = 'free' LIMIT 1;

  -- Create the company
  INSERT INTO companies (
    name, registration_number, company_type,
    ssm_certificate_path, moa_document_path, shareholders,
    subscription_plan_id, subscription_status, subscription_period_start
  ) VALUES (
    reg.company_name, reg.registration_number, reg.company_type,
    reg.ssm_certificate_path, reg.moa_document_path, reg.shareholders,
    free_plan_id, 'active', NOW()
  )
  RETURNING id INTO new_company_id;

  -- Make the registering user the Owner
  INSERT INTO company_members (company_id, user_id, role)
  VALUES (new_company_id, reg.user_id, 'owner');

  -- Update profile with company_id
  UPDATE profiles SET company_id = new_company_id, updated_at = NOW()
  WHERE id = reg.user_id;

  -- Mark registration as approved
  UPDATE company_registrations
  SET status = 'approved', reviewed_by = admin_id, reviewed_at = NOW(), updated_at = NOW()
  WHERE id = registration_id;

  RETURN new_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Function: reject a company registration
-- =============================================
CREATE OR REPLACE FUNCTION public.reject_company_registration(
  registration_id UUID,
  admin_id UUID,
  reason TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE company_registrations
  SET status = 'rejected',
      reviewed_by = admin_id,
      reviewed_at = NOW(),
      rejection_reason = reason,
      updated_at = NOW()
  WHERE id = registration_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found or already processed';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Update storage policies for documents bucket
-- to be company-aware (new uploads use company_id path)
-- Keep old user-based policies for backward compat
-- =============================================

-- Company members can upload documents under company folder
CREATE POLICY "Company members can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] IN (
      SELECT c.id::text FROM companies c
      JOIN company_members cm ON cm.company_id = c.id
      WHERE cm.user_id = auth.uid()
    )
  );

-- Company members can view documents under company folder
CREATE POLICY "Company members can view company documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] IN (
      SELECT c.id::text FROM companies c
      JOIN company_members cm ON cm.company_id = c.id
      WHERE cm.user_id = auth.uid()
    )
  );

-- Company owner/admin can delete documents under company folder
CREATE POLICY "Company owner/admin can delete documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] IN (
      SELECT c.id::text FROM companies c
      JOIN company_members cm ON cm.company_id = c.id
      WHERE cm.user_id = auth.uid() AND cm.role IN ('owner', 'admin')
    )
  );

-- =============================================
-- Backfill: migrate existing users to companies
-- Each existing user with data gets their own company
-- =============================================
DO $$
DECLARE
  prof RECORD;
  new_company_id UUID;
  free_plan_id UUID;
BEGIN
  SELECT id INTO free_plan_id FROM subscription_plans WHERE slug = 'free' LIMIT 1;

  FOR prof IN
    SELECT DISTINCT p.* FROM profiles p
    WHERE p.company_id IS NULL
    AND p.id IN (SELECT DISTINCT user_id FROM documents)
  LOOP
    -- Create a company for each existing user
    INSERT INTO companies (name, company_type, subscription_plan_id, subscription_status, subscription_period_start)
    VALUES (
      COALESCE(NULLIF(prof.company_name, ''), prof.full_name || '''s Company'),
      'sole_proprietor',
      free_plan_id,
      'active',
      NOW()
    )
    RETURNING id INTO new_company_id;

    -- Make them owner
    INSERT INTO company_members (company_id, user_id, role)
    VALUES (new_company_id, prof.id, 'owner');

    -- Update profile
    UPDATE profiles SET company_id = new_company_id WHERE id = prof.id;

    -- Backfill all data tables
    UPDATE documents SET company_id = new_company_id WHERE user_id = prof.id AND company_id IS NULL;
    UPDATE ledger_entries SET company_id = new_company_id WHERE user_id = prof.id AND company_id IS NULL;
    UPDATE bank_transactions SET company_id = new_company_id WHERE user_id = prof.id AND company_id IS NULL;
    UPDATE clients SET company_id = new_company_id WHERE user_id = prof.id AND company_id IS NULL;
    UPDATE invoices_sent SET company_id = new_company_id WHERE user_id = prof.id AND company_id IS NULL;
    UPDATE company_documents SET company_id = new_company_id WHERE user_id = prof.id AND company_id IS NULL;
    UPDATE financial_statements SET company_id = new_company_id WHERE user_id = prof.id AND company_id IS NULL;
    UPDATE reminders SET company_id = new_company_id WHERE user_id = prof.id AND company_id IS NULL;
    UPDATE reference_guides SET company_id = new_company_id WHERE user_id = prof.id AND company_id IS NULL;
    UPDATE gdrive_folders SET company_id = new_company_id WHERE user_id = prof.id AND company_id IS NULL;
  END LOOP;
END $$;
