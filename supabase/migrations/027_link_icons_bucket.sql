-- Storage bucket for custom link icons (links.thumbnail_url).
-- Mirrors the avatars / hero-images buckets. No public-read SELECT policy:
-- public buckets serve via /storage/v1/object/public/<bucket>/<path> which
-- bypasses storage.objects RLS (see migration 021), so public URLs still work
-- while bucket contents stay un-enumerable. Server-side re-hosting in
-- /api/links/fetch-icon uses the service_role client, which bypasses RLS.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'link-icons',
  'link-icons',
  true,
  2097152,  -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Owner can upload (insert) under their own <user_id>/ prefix
CREATE POLICY "Users can upload their own link icon"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'link-icons'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can update (overwrite)
CREATE POLICY "Users can update their own link icon"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'link-icons'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can delete
CREATE POLICY "Users can delete their own link icon"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'link-icons'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
