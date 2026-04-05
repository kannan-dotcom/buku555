CREATE TABLE IF NOT EXISTS company_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN (
    'ssm','tax_registration','moa','director_id','director_passport',
    'business_license','bank_mandate','other'
  )),
  extracted_data JSONB,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_docs_user ON company_documents(user_id);

ALTER TABLE company_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own company documents"
  ON company_documents FOR ALL USING (auth.uid() = user_id);
