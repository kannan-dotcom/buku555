CREATE TABLE IF NOT EXISTS financial_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  statement_type TEXT NOT NULL CHECK (statement_type IN (
    'cashflow','income','profit_loss','balance_sheet'
  )),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL,
  format_template JSONB,
  gdrive_file_id TEXT,
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','final','archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fin_stmts_user ON financial_statements(user_id);

ALTER TABLE financial_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own financial statements"
  ON financial_statements FOR ALL USING (auth.uid() = user_id);
