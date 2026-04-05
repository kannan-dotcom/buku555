-- =============================================
-- Migration 021: Billing payments (Billplz integration)
-- =============================================

-- billing_payments table
CREATE TABLE billing_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Billplz fields
  billplz_bill_id TEXT UNIQUE,
  billplz_collection_id TEXT,
  billplz_url TEXT,

  -- Payment details
  amount_cents INTEGER NOT NULL,
  amount NUMERIC(10,2) GENERATED ALWAYS AS (amount_cents / 100.0) STORED,
  currency TEXT DEFAULT 'MYR',
  description TEXT,

  -- Subscription context
  subscription_plan_id UUID REFERENCES subscription_plans(id),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'annual')),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,

  -- Payer info
  payer_name TEXT,
  payer_email TEXT,

  -- Status tracking
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'due', 'paid', 'overdue', 'deleted', 'failed')),
  paid_at TIMESTAMPTZ,
  billplz_paid_at TIMESTAMPTZ,

  -- Admin tracking
  created_by UUID REFERENCES profiles(id),
  notes TEXT,

  -- Webhook data
  callback_data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_billing_payments_company ON billing_payments(company_id);
CREATE INDEX idx_billing_payments_status ON billing_payments(status);
CREATE INDEX idx_billing_payments_billplz_id ON billing_payments(billplz_bill_id);
CREATE INDEX idx_billing_payments_created ON billing_payments(created_at DESC);

-- RLS
ALTER TABLE billing_payments ENABLE ROW LEVEL SECURITY;

-- Platform admins can do everything
CREATE POLICY "Platform admins can manage billing payments"
  ON billing_payments FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Company owner/admin can view their own company's payments
CREATE POLICY "Company members can view own billing payments"
  ON billing_payments FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM company_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Billplz config table
CREATE TABLE billplz_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id TEXT NOT NULL,
  collection_title TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sandbox BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE billplz_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can manage billplz config"
  ON billplz_config FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Add past_due to companies subscription_status constraint
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_subscription_status_check;
ALTER TABLE companies ADD CONSTRAINT companies_subscription_status_check
  CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trial', 'past_due'));
