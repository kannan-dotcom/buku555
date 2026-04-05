-- =============================================
-- Leads table for marketing lead generation
-- =============================================

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  country_code TEXT DEFAULT 'MY',
  source TEXT DEFAULT 'website'
    CHECK (source IN ('website','referral','social','ads','other')),
  message TEXT,
  status TEXT DEFAULT 'new'
    CHECK (status IN ('new','contacted','qualified','converted','lost')),
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for admin queries
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_email ON leads(email);

-- RLS: leads are managed by admins only (service role)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (from public lead form)
CREATE POLICY "Anyone can submit a lead"
  ON leads FOR INSERT
  WITH CHECK (true);

-- Only authenticated admins can view/update
CREATE POLICY "Admins can view leads"
  ON leads FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can update leads"
  ON leads FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));
