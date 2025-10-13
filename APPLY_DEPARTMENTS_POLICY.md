# Fix Departments RLS Policy - Apply This Migration

## Problem
Sellers are getting a 403 error when trying to add departments because the current RLS policy only allows admins to manage departments.

## Solution
Apply the migration file: `supabase/migrations/20251011000000_allow_sellers_manage_departments.sql`

## How to Apply

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase Dashboard: https://kazatbfpvpalauoshzti.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents from `supabase/migrations/20251011000000_allow_sellers_manage_departments.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration

### Option 2: Using Supabase CLI (if installed)
```bash
supabase db push
```

## What This Does
- Removes the restrictive policy that only allows admins to manage departments
- Adds new policies that allow both sellers and admins to:
  - INSERT departments
  - UPDATE departments
  - DELETE departments
- Maintains public read access for everyone

## After Applying
1. Refresh your application
2. Try adding a department as a seller - it should work now!

## Verification
After applying, you can verify by running this query in SQL Editor:
```sql
SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE tablename = 'departments';
```

You should see:
- "Anyone can read departments" (SELECT)
- "Sellers and admins can insert departments" (INSERT)
- "Sellers and admins can update departments" (UPDATE)
- "Sellers and admins can delete departments" (DELETE)
