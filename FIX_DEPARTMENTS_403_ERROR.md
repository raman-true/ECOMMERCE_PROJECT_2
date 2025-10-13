# Fix: 403 Error When Adding Departments

## Problem
Sellers are getting a **403 Forbidden** error when trying to add departments because the database Row Level Security (RLS) policy only allows admins to manage departments.

## Solution
You need to update the RLS policies to allow both sellers and admins to manage departments.

---

## Quick Fix - Option 1: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://kazatbfpvpalauoshzti.supabase.co
   - Navigate to **SQL Editor** (left sidebar)

2. **Create New Query**
   - Click the **"+ New query"** button

3. **Copy and Paste This SQL**

```sql
-- Drop the restrictive policy
DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;

-- Allow sellers and admins to insert departments
CREATE POLICY "Sellers and admins can insert departments"
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
  );

-- Allow sellers and admins to update departments
CREATE POLICY "Sellers and admins can update departments"
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
  );

-- Allow sellers and admins to delete departments
CREATE POLICY "Sellers and admins can delete departments"
  ON public.departments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('seller', 'admin')
    )
  );
```

4. **Run the Query**
   - Click **"Run"** or press `Ctrl+Enter` / `Cmd+Enter`

5. **Verify Success**
   - You should see "Success. No rows returned"
   - The policies are now updated

6. **Test in Your App**
   - Refresh your application
   - Try adding a department as a seller
   - It should work now! ✅

---

## Alternative - Option 2: Use the Migration File

The migration file has already been created at:
```
supabase/migrations/20251011000000_allow_sellers_manage_departments.sql
```

If you have Supabase CLI installed:
```bash
supabase db push
```

---

## Alternative - Option 3: Use the HTML Tool

Open this file in your browser:
```
fix-departments-rls.html
```

Click the "Apply Migration" button and it will automatically update the policies.

---

## What This Does

### Before (Current State)
- ❌ Only admins could manage departments
- ❌ Sellers got 403 error when trying to add departments

### After (Fixed State)
- ✅ Both sellers and admins can INSERT departments
- ✅ Both sellers and admins can UPDATE departments
- ✅ Both sellers and admins can DELETE departments
- ✅ Everyone can still READ (view) departments

---

## Verification

After applying, verify the policies exist by running this in SQL Editor:

```sql
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'departments'
ORDER BY cmd;
```

You should see:
- `Sellers and admins can delete departments` (DELETE)
- `Sellers and admins can insert departments` (INSERT)
- `Anyone can read departments` (SELECT)
- `Sellers and admins can update departments` (UPDATE)

---

## Need Help?

If you encounter any issues:
1. Make sure you're logged into the correct Supabase project
2. Ensure you have the necessary permissions (project owner/admin)
3. Check that the SQL runs without errors
4. Verify your seller account has `role = 'seller'` in the `user_profiles` table
