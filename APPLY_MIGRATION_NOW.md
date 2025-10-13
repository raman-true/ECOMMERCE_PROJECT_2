# 🚀 Apply Database Migration - Step by Step

## Your Database is Ready to Update!

I've created all the necessary database changes for your 5 new features. Follow these simple steps to apply them.

---

## 📍 Step 1: Open Supabase Dashboard

1. Click this link to open your Supabase project:
   ```
   https://0ec90b57d6e95fcbda19832f.supabase.co
   ```

2. Log in to your Supabase account

---

## 📝 Step 2: Open SQL Editor

1. In the left sidebar, click on **"SQL Editor"**
2. Click the **"New Query"** button (top right)

---

## 📋 Step 3: Copy and Paste the Migration

1. Open the file: **`apply-migration.sql`** (in your project root)
2. Copy ALL the contents (Ctrl+A, Ctrl+C)
3. Paste into the Supabase SQL Editor
4. Click the **"Run"** button (or press Ctrl+Enter)

**Expected Result**: You should see "Success. No rows returned" or success messages.

---

## 👤 Step 4: Create Admin User

### Option A: Through Your App (Recommended)
1. Go to your app's registration page
2. Register a new account with:
   - **Email**: `support@abor-tech.com`
   - **Password**: Choose a strong password (save it!)
3. Complete the registration

### Option B: Through Supabase Dashboard
1. In Supabase, go to **Authentication** → **Users**
2. Click **"Add User"** button
3. Fill in:
   - **Email**: `support@abor-tech.com`
   - **Password**: Choose a strong password
   - **Auto Confirm User**: Check this box
4. Click **"Create User"**

---

## 🎖️ Step 5: Promote User to Admin

1. Go back to Supabase **SQL Editor**
2. Click **"New Query"**
3. Copy and paste this command:
   ```sql
   SELECT promote_user_to_admin('support@abor-tech.com');
   ```
4. Click **"Run"**

**Expected Result**: Query should complete successfully.

---

## ✅ Step 6: Verify Admin User

Run this verification query in SQL Editor:

```sql
SELECT
  u.id,
  u.email,
  up.role,
  up.first_name,
  up.last_name
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'support@abor-tech.com';
```

**Expected Result**:
- Email: support@abor-tech.com
- Role: admin
- First Name: Support
- Last Name: Admin

---

## 🎉 Done! What Just Happened?

Your database now has:

### ✅ New Tables
- `email_notification_preferences` - User email settings
- `email_notification_log` - Email tracking

### ✅ Updated Tables
- `products` - Installation service fields
- `order_items` - Installation tracking
- `cart_items` - Installation selection
- `seller_settings` - Pickup location info

### ✅ New Functions
- `is_admin()` - Check admin status
- `promote_user_to_admin()` - Make users admin
- Auto-create email preferences for new users

### ✅ Admin Access
- support@abor-tech.com has full platform access
- Can edit ANY product, category, department
- Can view ALL orders and users
- Special RLS policies grant complete access

---

## 🧪 Test Your Setup

### Test 1: Admin Login
1. Log in with: support@abor-tech.com
2. Go to admin dashboard
3. Try editing any product (should work!)

### Test 2: Check New Fields
Run in SQL Editor:
```sql
-- Check products table has installation fields
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name LIKE '%installation%';

-- Check seller_settings has pickup fields
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'seller_settings'
AND column_name LIKE '%pickup%';
```

### Test 3: Check Email Tables
```sql
-- Check email tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('email_notification_preferences', 'email_notification_log');
```

---

## 🔍 Troubleshooting

### "Permission denied" error
- Make sure you're logged in as a Supabase admin
- Check you're in the correct project

### "Function already exists" error
- This is OK! It means the migration ran partially before
- The migration is safe to run multiple times

### "User not found" when promoting
- Make sure you created the user first (Step 4)
- Check spelling of email address
- Verify user exists in Authentication → Users

### Admin user can't edit products
- Verify role is set to 'admin' (run Step 6 verification)
- Log out and log back in
- Check browser console for errors

---

## 📚 Next Steps

Now that your database is ready:

1. **Build Frontend Features**
   - Password reset pages
   - Pickup option in checkout
   - Installation service selection
   - Admin UI enhancements

2. **Create Edge Functions**
   - Email notification sender
   - Order total calculator (update for installation)

3. **Configure Email Service**
   - Set up SMTP or Resend in Supabase
   - Test email delivery

4. **See Full Documentation**
   - `DATABASE_MIGRATION_GUIDE.md` - Complete guide
   - `FEATURES_DATABASE_SUMMARY.md` - Quick reference

---

## 📞 Need Help?

If something goes wrong:

1. **Check Supabase Logs**
   - Go to Logs section in dashboard
   - Look for error messages

2. **Re-run Migration**
   - The migration is idempotent (safe to run multiple times)
   - It won't duplicate data

3. **Manual Verification**
   - Use the test queries above
   - Check table structure in Table Editor

---

## 🎯 Quick Command Reference

```sql
-- Promote user to admin
SELECT promote_user_to_admin('support@abor-tech.com');

-- Check if user is admin
SELECT is_admin(); -- (must be logged in as that user)

-- Verify admin user
SELECT email, role FROM auth.users
JOIN user_profiles ON auth.users.id = user_profiles.id
WHERE email = 'support@abor-tech.com';

-- List all new tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%email%';
```

---

**Your database is ready! Time to build the amazing features! 🚀**
