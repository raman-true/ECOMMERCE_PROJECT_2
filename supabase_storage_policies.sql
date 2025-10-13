-- Supabase Storage Policies for BuildMart E-commerce Platform
-- Run this in your Supabase SQL Editor

-- 1. Create storage bucket if it doesn't exist (run this first)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload product images" ON storage.objects
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);

-- 4. Policy: Allow public read access to product images
CREATE POLICY "Allow public read access to product images" ON storage.objects
FOR SELECT 
TO public 
USING (bucket_id = 'product-images');

-- 5. Policy: Allow users to update their own uploaded images
CREATE POLICY "Allow users to update their own product images" ON storage.objects
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'product-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Policy: Allow users to delete their own uploaded images
CREATE POLICY "Allow users to delete their own product images" ON storage.objects
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'product-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 7. Alternative: More permissive policy for admin/seller uploads (if needed)
-- Uncomment if you want admins and sellers to upload to any folder
/*
CREATE POLICY "Allow admin and seller uploads" ON storage.objects
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated' AND
  (
    -- Check if user is admin or seller
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'seller')
    )
  )
);
*/

-- 8. Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
