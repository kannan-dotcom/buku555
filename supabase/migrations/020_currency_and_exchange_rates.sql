-- =============================================
-- Add currency to bank_transactions + exchange_rates table
-- Exchange rates are manually entered/adjusted per transaction date
-- =============================================

-- 1. Add currency column to bank_transactions
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'MYR';

-- 2. Add exchange rate columns to ledger_entries
-- exchange_rate: rate from transaction currency to company's base currency
-- base_currency: the company's reporting/base currency at time of entry
-- base_amount: amount converted to base currency (amount * exchange_rate)
ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(18,8) DEFAULT 1.0;
ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS base_currency TEXT DEFAULT 'MYR';
ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS base_amount NUMERIC(14,2);

-- 3. Create exchange_rates table for storing reference rates
-- These can be manually entered or fetched from online sources
-- Users can adjust rates per transaction
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC(18,8) NOT NULL,
  rate_date DATE NOT NULL,
  source TEXT DEFAULT 'manual'
    CHECK (source IN ('manual', 'statement', 'online', 'custom')),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, from_currency, to_currency, rate_date)
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_company ON exchange_rates(company_id);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON exchange_rates(rate_date);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_pair ON exchange_rates(from_currency, to_currency);

-- 4. RLS for exchange_rates
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view exchange rates"
  ON exchange_rates FOR SELECT
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Authorized members can insert exchange rates"
  ON exchange_rates FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin', 'accountant'));

CREATE POLICY "Authorized members can update exchange rates"
  ON exchange_rates FOR UPDATE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin', 'accountant'));

CREATE POLICY "Owner/admin can delete exchange rates"
  ON exchange_rates FOR DELETE
  USING (company_id = public.get_my_company_id()
    AND public.get_my_company_role() IN ('owner', 'admin'));

-- Platform admins can manage all exchange rates
CREATE POLICY "Platform admins can manage exchange rates"
  ON exchange_rates FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- 5. Backfill: set base_amount = amount for existing ledger entries (same currency assumed)
UPDATE ledger_entries SET base_amount = amount WHERE base_amount IS NULL;
