-- Fix infinite recursion in admin RLS policies on profiles table.
-- The old pattern: auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
-- caused infinite recursion when used ON the profiles table itself, because
-- evaluating the policy required querying profiles, which triggered the same policy.
--
-- Solution: Use a SECURITY DEFINER function that bypasses RLS to check admin status.

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- Fix profiles table policies (these were the ones causing infinite recursion)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_platform_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_platform_admin());

-- Update all other admin policies to use the function for consistency and performance

DROP POLICY IF EXISTS "Admins can view applications" ON accountant_applications;
CREATE POLICY "Admins can view applications" ON accountant_applications
  FOR SELECT USING (is_platform_admin());

DROP POLICY IF EXISTS "Admins can update applications" ON accountant_applications;
CREATE POLICY "Admins can update applications" ON accountant_applications
  FOR UPDATE USING (is_platform_admin());

DROP POLICY IF EXISTS "Platform admins can manage billing payments" ON billing_payments;
CREATE POLICY "Platform admins can manage billing payments" ON billing_payments
  FOR ALL USING (is_platform_admin());

DROP POLICY IF EXISTS "Platform admins can manage billplz config" ON billplz_config;
CREATE POLICY "Platform admins can manage billplz config" ON billplz_config
  FOR ALL USING (is_platform_admin());

DROP POLICY IF EXISTS "Platform admins can manage companies" ON companies;
CREATE POLICY "Platform admins can manage companies" ON companies
  FOR ALL USING (is_platform_admin());

DROP POLICY IF EXISTS "Platform admins can manage all invitations" ON company_invitations;
CREATE POLICY "Platform admins can manage all invitations" ON company_invitations
  FOR ALL USING (is_platform_admin());

DROP POLICY IF EXISTS "Platform admins can manage all members" ON company_members;
CREATE POLICY "Platform admins can manage all members" ON company_members
  FOR ALL USING (is_platform_admin());

DROP POLICY IF EXISTS "Platform admins manage registrations" ON company_registrations;
CREATE POLICY "Platform admins manage registrations" ON company_registrations
  FOR ALL USING (is_platform_admin());

DROP POLICY IF EXISTS "Platform admins can manage exchange rates" ON exchange_rates;
CREATE POLICY "Platform admins can manage exchange rates" ON exchange_rates
  FOR ALL USING (is_platform_admin());

DROP POLICY IF EXISTS "Admins can view leads" ON leads;
CREATE POLICY "Admins can view leads" ON leads
  FOR SELECT USING (is_platform_admin());

DROP POLICY IF EXISTS "Admins can update leads" ON leads;
CREATE POLICY "Admins can update leads" ON leads
  FOR UPDATE USING (is_platform_admin());

DROP POLICY IF EXISTS "Admins can manage subscriptions" ON user_subscriptions;
CREATE POLICY "Admins can manage subscriptions" ON user_subscriptions
  FOR ALL USING (is_platform_admin());

DROP POLICY IF EXISTS "Admins can view all registration docs" ON storage.objects;
CREATE POLICY "Admins can view all registration docs" ON storage.objects
  FOR SELECT USING (bucket_id = 'registrations' AND is_platform_admin());
