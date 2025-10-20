-- Create storage buckets for user content
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']::text[]),
  ('banners', 'banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]),
  ('nexus-icons', 'nexus-icons', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]),
  ('nexus-banners', 'nexus-banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]);

-- RLS Policies for avatars bucket
CREATE POLICY "Users can view all avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policies for banners bucket
CREATE POLICY "Users can view all banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

CREATE POLICY "Users can upload their own banner"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own banner"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own banner"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policies for nexus-icons bucket
CREATE POLICY "Users can view all nexus icons"
ON storage.objects FOR SELECT
USING (bucket_id = 'nexus-icons');

CREATE POLICY "Nexus owners can upload icons"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'nexus-icons'
  AND EXISTS (
    SELECT 1 FROM nexuses
    WHERE id::text = (storage.foldername(name))[1]
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Nexus owners can update icons"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'nexus-icons'
  AND EXISTS (
    SELECT 1 FROM nexuses
    WHERE id::text = (storage.foldername(name))[1]
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Nexus owners can delete icons"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'nexus-icons'
  AND EXISTS (
    SELECT 1 FROM nexuses
    WHERE id::text = (storage.foldername(name))[1]
    AND owner_id = auth.uid()
  )
);

-- RLS Policies for nexus-banners bucket
CREATE POLICY "Users can view all nexus banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'nexus-banners');

CREATE POLICY "Nexus owners can upload banners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'nexus-banners'
  AND EXISTS (
    SELECT 1 FROM nexuses
    WHERE id::text = (storage.foldername(name))[1]
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Nexus owners can update banners"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'nexus-banners'
  AND EXISTS (
    SELECT 1 FROM nexuses
    WHERE id::text = (storage.foldername(name))[1]
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Nexus owners can delete banners"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'nexus-banners'
  AND EXISTS (
    SELECT 1 FROM nexuses
    WHERE id::text = (storage.foldername(name))[1]
    AND owner_id = auth.uid()
  )
);