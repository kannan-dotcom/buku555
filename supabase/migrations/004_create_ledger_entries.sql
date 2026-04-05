CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL,
  merchant_name TEXT,
  description TEXT,
  tax_registration_no TEXT,
  einvoice_number TEXT,
  currency TEXT DEFAULT 'MYR',
  payment_type TEXT,
  amount NUMERIC(15,2) NOT NULL,
  sst_vat_amount NUMERIC(15,2) DEFAULT 0,
  total_amount NUMERIC(15,2) NOT NULL,
  category TEXT,
  entry_type TEXT NOT NULL DEFAULT 'expense'
    CHECK (entry_type IN ('expense','income','transfer')),
  status TEXT DEFAULT 'complete'
    CHECK (status IN ('complete','update_needed','suspense')),
  status_notes TEXT,
  is_reconciled BOOLEAN DEFAULT FALSE,
  reconciled_with UUID,
  gsheet_row_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ledger_user ON ledger_entries(user_id);
CREATE INDEX idx_ledger_date ON ledger_entries(user_id, entry_date);
CREATE INDEX idx_ledger_status ON ledger_entries(user_id, status);
CREATE INDEX idx_ledger_type ON ledger_entries(user_id, entry_type);

ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own ledger entries"
  ON ledger_entries FOR ALL USING (auth.uid() = user_id);
