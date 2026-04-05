CREATE TABLE IF NOT EXISTS bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  transaction_date DATE NOT NULL,
  value_date DATE,
  description TEXT,
  reference_no TEXT,
  debit_amount NUMERIC(15,2) DEFAULT 0,
  credit_amount NUMERIC(15,2) DEFAULT 0,
  balance NUMERIC(15,2),
  transaction_type TEXT,
  bank_name TEXT,
  account_number TEXT,
  statement_month TEXT,
  reconciliation_status TEXT DEFAULT 'unmatched'
    CHECK (reconciliation_status IN ('matched','unmatched','partial','incomplete')),
  matched_ledger_entry_id UUID REFERENCES ledger_entries(id),
  ai_match_confidence NUMERIC(3,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bank_txn_user ON bank_transactions(user_id);
CREATE INDEX idx_bank_txn_date ON bank_transactions(user_id, transaction_date);
CREATE INDEX idx_bank_txn_status ON bank_transactions(user_id, reconciliation_status);

ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bank transactions"
  ON bank_transactions FOR ALL USING (auth.uid() = user_id);
