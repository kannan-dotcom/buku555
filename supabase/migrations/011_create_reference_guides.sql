CREATE TABLE IF NOT EXISTS reference_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  document_id UUID REFERENCES documents(id),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ref_guides_user ON reference_guides(user_id);
CREATE INDEX idx_ref_guides_country ON reference_guides(user_id, country_code);

ALTER TABLE reference_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reference guides"
  ON reference_guides FOR ALL USING (auth.uid() = user_id);
