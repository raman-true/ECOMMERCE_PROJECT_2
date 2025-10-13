# Storage Setup Guide

## 🚨 Required: Manual Storage Bucket Creation

Due to Row Level Security policies, storage buckets must be created manually in the Supabase Dashboard.

## 📋 Step-by-Step Setup

### 1. Open Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project

### 2. Navigate to Storage
1. Click **Storage** in the left sidebar
2. You'll see the storage buckets interface

### 3. Create Required Buckets

#### Bucket 1: `images`
1. Click **"New bucket"**
2. **Bucket name**: `images`
3. **Public bucket**: ✅ **Enable** (checked)
4. **File size limit**: `5 MB`
5. **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`
6. Click **"Save"**

#### Bucket 2: `product-images` (if needed)
1. Click **"New bucket"**
2. **Bucket name**: `product-images`
3. **Public bucket**: ✅ **Enable** (checked)
4. **File size limit**: `5 MB`
5. **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`
6. Click **"Save"**

### 4. Set Up Storage Policies (Important!)

#### For `images` bucket:
1. Click on the `images` bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"**

**Policy 1: Public Read Access**
```sql
-- Allow public read access to images
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');
```

**Policy 2: Authenticated Upload**
```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);
```

**Policy 3: Users can delete own uploads**
```sql
-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 5. Verify Setup
1. Refresh your application
2. Check browser console for success message: "✅ All required storage buckets exist"
3. Try uploading an image in category/department forms

## 🔧 Alternative: Quick SQL Setup

If you prefer SQL, run this in your Supabase SQL Editor:

```sql
-- Create storage buckets (run as admin)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('images', 'images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- Set up RLS policies
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own uploads" ON storage.objects
FOR DELETE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Repeat for product-images bucket
CREATE POLICY "Public read access product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own product uploads" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## ✅ Verification Checklist

- [ ] `images` bucket created with public access
- [ ] `product-images` bucket created (if using ProductForm)
- [ ] RLS policies set up for both buckets
- [ ] Console shows "✅ All required storage buckets exist"
- [ ] Image upload works in category/department forms

## 🚨 Troubleshooting

**Error: "new row violates row-level security policy"**
- Solution: Create buckets manually in Dashboard (not via code)

**Error: "Bucket not found"**
- Solution: Ensure bucket names match exactly: `images` and `product-images`

**Error: "Upload failed"**
- Solution: Check RLS policies are set up correctly
- Ensure user is authenticated when uploading

**Images don't display**
- Solution: Verify buckets are set to **public**
- Check RLS policies allow SELECT for public access
