# Image Upload System Setup

## Overview
The image upload system has been successfully implemented using Supabase Storage with the following components:

## ✅ Components Created

### 1. ImageUpload Component (`src/components/ui/ImageUpload.tsx`)
- **Single image upload** with drag & drop interface
- **File validation** (type, size limits)
- **Supabase Storage integration**
- **Image preview** with remove functionality
- **Loading states** and error handling
- **Configurable** (bucket, folder, file size limits)

### 2. MultiImageUpload Component (`src/components/ui/MultiImageUpload.tsx`)
- **Multiple image upload** for products
- **Grid layout** for image previews
- **Individual image removal**
- **Upload progress** and error handling
- **Maximum image limits** (configurable)

### 3. Storage Management (`src/lib/storage.ts`)
- **Auto-initialization** of storage buckets
- **Helper functions** for file operations
- **Public URL generation**
- **File deletion utilities**

## ✅ Updated Forms

### CategoryForm (`src/components/admin/CategoryForm.tsx`)
- ✅ Replaced image URL input with ImageUpload component
- ✅ Images uploaded to `images/categories/` folder
- ✅ 5MB file size limit
- ✅ Used by both Admin and Seller pages

### DepartmentForm (`src/components/admin/DepartmentForm.tsx`)
- ✅ Replaced image URL input with ImageUpload component  
- ✅ Images uploaded to `images/departments/` folder
- ✅ 5MB file size limit
- ✅ Used by both Admin and Seller pages

### ProductForm (`src/components/admin/ProductForm.tsx`)
- ✅ Already has custom image upload implementation
- ✅ Can optionally be updated to use MultiImageUpload component
- ✅ Uses `product-images` bucket

## ✅ Configuration

### Supabase Client (`src/lib/supabase.ts`)
- ✅ Configured with proper auth settings
- ✅ PKCE flow enabled
- ✅ Session detection disabled for manual handling

### App Initialization (`src/App.tsx`)
- ✅ Storage buckets auto-initialized on app startup
- ✅ Error handling for bucket creation

### Types (`src/types/index.ts`)
- ✅ Updated Category interface to include `department_id`

## 🔧 Setup Requirements

### 1. Supabase Storage Buckets
The following buckets will be auto-created:
- `images` - Public bucket for categories, departments
- `product-images` - For product images (if not exists)

### 2. Storage Policies (Manual Setup Required)
You need to set up RLS policies in Supabase Dashboard:

```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads" ON storage.objects
FOR DELETE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 3. Environment Variables
Ensure these are set in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 🚀 Usage

### For Categories/Departments
1. Navigate to Admin/Seller → Categories → Add New Category
2. Fill in the form fields
3. Click the image upload area
4. Select an image file (max 5MB)
5. See preview and save

### For Products (existing implementation)
1. Navigate to Products → Add New Product
2. Fill in product details
3. Select multiple image files
4. Click "Upload Images" button
5. See grid of uploaded images

## 🔍 Testing Checklist

- [ ] Start development server (`npm run dev`)
- [ ] Navigate to category/department forms
- [ ] Test image upload functionality
- [ ] Verify images appear in Supabase Storage
- [ ] Test image removal
- [ ] Test file validation (size, type)
- [ ] Test error handling
- [ ] Verify public URLs work

## 🛠️ Troubleshooting

### Common Issues:

1. **Storage bucket not found**
   - Check if buckets are created in Supabase Dashboard
   - Verify bucket names match the configuration

2. **Upload fails with permission error**
   - Set up RLS policies as shown above
   - Check authentication status

3. **Images don't display**
   - Verify public access policy is set
   - Check if URLs are correctly generated

4. **File size errors**
   - Default limit is 5MB, adjust in component props if needed
   - Check Supabase project limits

## 📁 File Structure
```
src/
├── components/
│   ├── ui/
│   │   ├── ImageUpload.tsx          # Single image upload
│   │   └── MultiImageUpload.tsx     # Multiple image upload
│   └── admin/
│       ├── CategoryForm.tsx         # Updated with ImageUpload
│       ├── DepartmentForm.tsx       # Updated with ImageUpload
│       └── ProductForm.tsx          # Has custom implementation
├── lib/
│   ├── supabase.ts                  # Supabase client config
│   └── storage.ts                   # Storage utilities
├── types/
│   └── index.ts                     # Updated Category interface
└── App.tsx                          # Storage initialization
```

## 🎯 Next Steps

1. **Test the functionality** by running the development server
2. **Set up storage policies** in Supabase Dashboard
3. **Optionally update ProductForm** to use MultiImageUpload
4. **Add image optimization** (resize, compression) if needed
5. **Implement image deletion** from storage when records are deleted
