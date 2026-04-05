-- =============================================
-- Accountant / Bookkeeper partner applications
-- =============================================

CREATE TABLE accountant_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT,
  registration_number TEXT NOT NULL,       -- MIA, ACCA, CPA, etc.
  registration_body TEXT NOT NULL,         -- e.g. 'MIA', 'ACCA', 'ISCA', 'ICAI'
  country_code TEXT NOT NULL DEFAULT 'MY',
  years_experience INTEGER,
  specializations TEXT[],                  -- e.g. {'tax','audit','bookkeeping'}
  website_url TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_accountant_apps_status ON accountant_applications(status);
CREATE INDEX idx_accountant_apps_created ON accountant_applications(created_at DESC);

ALTER TABLE accountant_applications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public application form)
CREATE POLICY "Anyone can submit application"
  ON accountant_applications FOR INSERT
  WITH CHECK (true);

-- Only admins can view/update
CREATE POLICY "Admins can view applications"
  ON accountant_applications FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can update applications"
  ON accountant_applications FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));
