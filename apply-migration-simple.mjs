import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('📋 Applying departments RLS policy migration...\n');

  const statements = [
    `DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;`,

    `CREATE POLICY "Sellers and admins can insert departments"
      ON public.departments FOR INSERT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.role IN ('seller', 'admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.role IN ('seller', 'admin')
        )
      );`,

    `CREATE POLICY "Sellers and admins can update departments"
      ON public.departments FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.role IN ('seller', 'admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.role IN ('seller', 'admin')
        )
      );`,

    `CREATE POLICY "Sellers and admins can delete departments"
      ON public.departments FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.role IN ('seller', 'admin')
        )
      );`
  ];

  try {
    for (let i = 0; i < statements.length; i++) {
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      const { error } = await supabase.rpc('exec_sql', { query: statements[i] });

      if (error) {
        console.error(`❌ Error on statement ${i + 1}:`, error.message);
        throw error;
      }
      console.log(`✅ Statement ${i + 1} completed`);
    }

    console.log('\n✅ All migration statements applied successfully!');
    console.log('Sellers can now manage departments (create, update, delete).');

  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  }
}

applyMigration();
