import { supabase } from '../lib/supabase';

/**
 * Verify that the image upload system is properly configured
 */
export async function verifyImageUploadSetup() {
  const results = {
    supabaseConnection: false,
    storageAccess: false,
    bucketExists: false,
    uploadPermissions: false,
    errors: [] as string[]
  };

  try {
    // Test 1: Supabase connection
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!sessionError) {
      results.supabaseConnection = true;
    } else {
      results.errors.push(`Supabase connection error: ${sessionError.message}`);
    }

    // Test 2: Storage access
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (!bucketsError && buckets) {
        results.storageAccess = true;

        // Test 3: Check if images bucket exists
        const imagesBucket = buckets.find(bucket => bucket.name === 'images');
        if (imagesBucket) {
          results.bucketExists = true;
        } else {
          results.errors.push('Images bucket not found. Please create it manually in Supabase Dashboard.');
        }
      } else {
        results.errors.push(`Storage access error: ${bucketsError?.message || 'Unknown error'}`);
      }
    } catch (error) {
      results.errors.push(`Storage access failed: ${error}`);
    }

    // Test 4: Upload permissions (if authenticated)
    if (session?.user) {
      try {
        // Try to create a test file
        const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(`test/${Date.now()}-test.txt`, testFile);

        if (!uploadError) {
          results.uploadPermissions = true;
          // Clean up test file
          await supabase.storage
            .from('images')
            .remove([`test/${Date.now()}-test.txt`]);
        } else {
          results.errors.push(`Upload permissions error: ${uploadError.message}`);
        }
      } catch (error) {
        results.errors.push(`Upload test failed: ${error}`);
      }
    } else {
      results.errors.push('Not authenticated - cannot test upload permissions');
    }

  } catch (error) {
    results.errors.push(`Setup verification failed: ${error}`);
  }

  return results;
}

/**
 * Log setup verification results to console
 */
export async function logSetupVerification() {
  console.log('🔍 Verifying Image Upload Setup...');
  
  const results = await verifyImageUploadSetup();
  
  console.log('\n📊 Setup Verification Results:');
  console.log(`✅ Supabase Connection: ${results.supabaseConnection ? 'OK' : 'FAILED'}`);
  console.log(`✅ Storage Access: ${results.storageAccess ? 'OK' : 'FAILED'}`);
  console.log(`✅ Images Bucket: ${results.bucketExists ? 'EXISTS' : 'MISSING'}`);
  console.log(`✅ Upload Permissions: ${results.uploadPermissions ? 'OK' : 'NEEDS_SETUP'}`);
  
  if (results.errors.length > 0) {
    console.log('\n⚠️ Issues Found:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
    
    console.log('\n🛠️ Next Steps:');
    console.log('1. Create storage buckets manually in Supabase Dashboard');
    console.log('2. Set up storage policies (see STORAGE_SETUP.md)');
    console.log('3. Check your .env file has correct Supabase credentials');
    console.log('4. Ensure you are authenticated when testing uploads');
  } else {
    console.log('\n🎉 All checks passed! Image upload system is ready to use.');
  }
  
  return results;
}
