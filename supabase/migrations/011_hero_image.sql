-- Add hero_image_url column to themes table
ALTER TABLE public.themes
  ADD COLUMN hero_image_url text DEFAULT NULL;

-- Create hero-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hero-images',
  'hero-images',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read access
CREATE POLICY "Hero images are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'hero-images');

-- Owner can upload (insert)
CREATE POLICY "Users can upload their own hero image"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'hero-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can update (overwrite)
CREATE POLICY "Users can update their own hero image"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'hero-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can delete
CREATE POLICY "Users can delete their own hero image"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'hero-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
