-- Simple Storage Policy Fix for BuildMart
-- Run this in your Supabase SQL Editor

-- 1. First, create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own product images" ON storage.objects;

-- 3. Create simple, permissive policies for authenticated users
CREATE POLICY "Allow authenticated uploads to product-images" ON storage.objects
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow public read from product-images" ON storage.objects
FOR SELECT 
TO public 
USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated update in product-images" ON storage.objects
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated delete from product-images" ON storage.objects
FOR DELETE 
TO authenticated 
USING (bucket_id = 'product-images');

-- 4. RLS is already enabled by default on Supabase Storage
-- No need to enable it manually - it's handled by Supabase

-- 5. Verify the policies are working
-- You can test by trying to upload an image through your app
