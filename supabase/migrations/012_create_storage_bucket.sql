-- Create storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  FALSE,
  26214400, -- 25MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can only access their own files
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);
