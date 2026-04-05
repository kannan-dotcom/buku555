CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  folder_type TEXT NOT NULL,
  gdrive_file_id TEXT,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  gdrive_url TEXT,
  thumbnail_url TEXT,
  ai_processed BOOLEAN DEFAULT FALSE,
  ai_processing_status TEXT DEFAULT 'pending'
    CHECK (ai_processing_status IN ('pending','processing','completed','failed')),
  ai_raw_result JSONB,
  upload_source TEXT DEFAULT 'web'
    CHECK (upload_source IN ('web','gdrive_sync')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_folder ON documents(user_id, folder_type);
CREATE INDEX idx_documents_status ON documents(ai_processing_status);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own documents"
  ON documents FOR ALL USING (auth.uid() = user_id);
