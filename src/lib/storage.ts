import { supabase } from './supabase';

/**
 * Initialize storage buckets if they don't exist
 * Note: This requires admin privileges. Buckets should be created manually in Supabase Dashboard.
 */
export async function initializeStorageBuckets() {
  try {
    // Just check if buckets exist, don't try to create them
    const { data: existingBuckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.warn('Could not check storage buckets:', error.message);
      return;
    }

    const requiredBuckets = ['images', 'product-images'];
    const missingBuckets = requiredBuckets.filter(
      bucketName => !existingBuckets?.some(bucket => bucket.name === bucketName)
    );

    if (missingBuckets.length > 0) {
      console.warn(`Missing storage buckets: ${missingBuckets.join(', ')}`);
      console.warn('Please create these buckets manually in Supabase Dashboard:');
      missingBuckets.forEach(bucket => {
        console.warn(`- Create bucket "${bucket}" with public access enabled`);
      });
    } else {
      console.log('✅ All required storage buckets exist');
    }
  } catch (error) {
    console.warn('Storage bucket check failed:', error);
  }
}

/**
 * Delete a file from storage
 */
export async function deleteStorageFile(bucket: string, filePath: string) {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Get public URL for a file
 */
export function getStoragePublicUrl(bucket: string, filePath: string) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}
