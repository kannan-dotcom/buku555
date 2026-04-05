CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  registration_number TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  pic_name TEXT,
  pic_phone TEXT,
  pic_email TEXT,
  invoice_frequency TEXT,
  last_invoice_date DATE,
  next_invoice_date DATE,
  is_recurring BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_user ON clients(user_id);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own clients"
  ON clients FOR ALL USING (auth.uid() = user_id);
