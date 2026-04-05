CREATE TABLE IF NOT EXISTS gdrive_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  folder_type TEXT NOT NULL CHECK (folder_type IN (
    'receipts', 'bank_statements', 'invoices_sent',
    'company_documents', 'financial_statements', 'reference'
  )),
  gdrive_folder_id TEXT NOT NULL,
  folder_name TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gdrive_folders_user ON gdrive_folders(user_id);

ALTER TABLE gdrive_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own folders"
  ON gdrive_folders FOR ALL USING (auth.uid() = user_id);
