CREATE TABLE IF NOT EXISTS invoices_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  invoice_number TEXT,
  invoice_date DATE NOT NULL,
  due_date DATE,
  subtotal NUMERIC(15,2) NOT NULL,
  tax_amount NUMERIC(15,2) DEFAULT 0,
  total_amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'MYR',
  status TEXT DEFAULT 'sent'
    CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT,
  email_template TEXT,
  last_sent_at TIMESTAMPTZ,
  reconciled_bank_txn_id UUID REFERENCES bank_transactions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_user ON invoices_sent(user_id);
CREATE INDEX idx_invoices_client ON invoices_sent(client_id);

ALTER TABLE invoices_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own invoices"
  ON invoices_sent FOR ALL USING (auth.uid() = user_id);
