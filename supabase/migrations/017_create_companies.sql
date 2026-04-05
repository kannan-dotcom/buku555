-- =============================================
-- Companies (tenant entity), members, registrations, invitations
-- =============================================

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  registration_number TEXT,
  company_type TEXT NOT NULL
    CHECK (company_type IN ('sole_proprietor', 'partnership', 'sdn_bhd', 'berhad')),
  ssm_certificate_path TEXT,
  moa_document_path TEXT,
  shareholders JSONB,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'deactivated')),
  subscription_plan_id UUID REFERENCES subscription_plans(id),
  billing_cycle TEXT DEFAULT 'monthly'
    CHECK (billing_cycle IN ('monthly', 'annual')),
  subscription_status TEXT DEFAULT 'active'
    CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trial')),
  subscription_period_start TIMESTAMPTZ,
  subscription_period_end TIMESTAMPTZ,
  preferred_currency TEXT DEFAULT 'MYR',
  country_code TEXT DEFAULT 'MY',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company members (junction: profiles <-> companies with role)
CREATE TABLE company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('owner', 'admin', 'accountant', 'user')),
  invited_by UUID REFERENCES profiles(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

CREATE INDEX idx_company_members_company ON company_members(company_id);
CREATE INDEX idx_company_members_user ON company_members(user_id);

-- Company registrations (pending approval queue)
CREATE TABLE company_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  registration_number TEXT,
  company_type TEXT NOT NULL
    CHECK (company_type IN ('sole_proprietor', 'partnership', 'sdn_bhd', 'berhad')),
  ssm_certificate_path TEXT NOT NULL,
  moa_document_path TEXT,
  shareholders JSONB,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_reg_status ON company_registrations(status);
CREATE INDEX idx_company_reg_user ON company_registrations(user_id);

-- Company invitations (email-based invite)
CREATE TABLE company_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('admin', 'accountant', 'user')),
  invited_by UUID NOT NULL REFERENCES profiles(id),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitations_token ON company_invitations(token);
CREATE INDEX idx_invitations_email ON company_invitations(email);
CREATE INDEX idx_invitations_company ON company_invitations(company_id);

-- =============================================
-- RLS Policies
-- =============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_invitations ENABLE ROW LEVEL SECURITY;

-- Companies: members can view their own company
CREATE POLICY "Members can view own company"
  ON companies FOR SELECT
  USING (id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()));

-- Companies: platform admins can do everything
CREATE POLICY "Platform admins can manage companies"
  ON companies FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Company members: view own company's members
CREATE POLICY "Members can view company members"
  ON company_members FOR SELECT
  USING (company_id IN (SELECT company_id FROM company_members cm2 WHERE cm2.user_id = auth.uid()));

-- Company members: owner/admin can manage
CREATE POLICY "Company owner/admin can manage members"
  ON company_members FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM company_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Company owner/admin can update members"
  ON company_members FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM company_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Company owner/admin can delete members"
  ON company_members FOR DELETE
  USING (company_id IN (
    SELECT company_id FROM company_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Platform admins can manage all members
CREATE POLICY "Platform admins can manage all members"
  ON company_members FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Company registrations: user can submit their own
CREATE POLICY "Users can submit own registration"
  ON company_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Company registrations: user can view their own
CREATE POLICY "Users can view own registration"
  ON company_registrations FOR SELECT
  USING (auth.uid() = user_id);

-- Company registrations: platform admins manage all
CREATE POLICY "Platform admins manage registrations"
  ON company_registrations FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Invitations: company owner/admin can manage
CREATE POLICY "Company owner/admin can manage invitations"
  ON company_invitations FOR ALL
  USING (company_id IN (
    SELECT company_id FROM company_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Invitations: invited user can view by email match
CREATE POLICY "Invited user can view own invitation"
  ON company_invitations FOR SELECT
  USING (email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- Platform admins can manage all invitations
CREATE POLICY "Platform admins can manage all invitations"
  ON company_invitations FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- =============================================
-- Storage bucket for registration documents
-- =============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'registrations',
  'registrations',
  FALSE,
  26214400,
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for registrations bucket
CREATE POLICY "Users can upload registration docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'registrations' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own registration docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'registrations' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins can view all registration docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'registrations' AND auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));
