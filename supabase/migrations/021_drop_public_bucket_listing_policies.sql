-- Drop broad SELECT policies on storage.objects for public buckets.
-- Public buckets serve objects via /storage/v1/object/public/<bucket>/<path>
-- which bypasses storage.objects RLS entirely, so public URLs still work.
-- Removing these policies prevents unauthenticated clients from enumerating
-- bucket contents via storage.from(bucket).list() or createSignedUrl().

DROP POLICY IF EXISTS "avatars: public read" ON storage.objects;
DROP POLICY IF EXISTS "Hero images are publicly accessible" ON storage.objects;
