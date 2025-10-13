# 🎯 Fresh Database Setup - Simple Instructions

## Your Database Status: EMPTY (No tables yet)

Perfect! Let's set up everything from scratch in 3 simple steps.

---

## ⚡ 3-Step Setup Process

### Step 1: Run the Complete Database Setup (2 minutes)

1. Open your Supabase dashboard:
   ```
   https://0ec90b57d6e95fcbda19832f.supabase.co
   ```

2. Click on **"SQL Editor"** in the left sidebar

3. Click **"New Query"** button (top right)

4. Open the file: **`complete-fresh-database-setup.sql`**

5. Copy **ALL** the contents (Ctrl+A, Ctrl+C)

6. Paste into the Supabase SQL Editor

7. Click **"Run"** button (or press Ctrl+Enter)

8. Wait ~10-20 seconds for completion

**Expected Result:**
```
Migration completed successfully!
Created 19 tables
```

---

### Step 2: Create Admin User (1 minute)

Now you need to create your admin user. Choose ONE option:

#### Option A: Through Your App (Recommended)
1. Go to your app's registration page
2. Fill in the form:
   - **Email**: `support@abor-tech.com`
   - **Password**: Choose a strong password (save it somewhere safe!)
   - **First Name**: Support
   - **Last Name**: Admin
3. Click Register

#### Option B: Through Supabase Dashboard
1. In Supabase, click **"Authentication"** in left sidebar
2. Click **"Users"** tab
3. Click **"Add User"** button
4. Fill in:
   - **Email**: `support@abor-tech.com`
   - **Password**: Choose a strong password
   - **Auto Confirm User**: ✅ Check this box
5. Click **"Create User"**

---

### Step 3: Promote to Admin (30 seconds)

1. Go back to Supabase **"SQL Editor"**
2. Click **"New Query"**
3. Copy and paste this command:
   ```sql
   SELECT promote_user_to_admin('support@abor-tech.com');
   ```
4. Click **"Run"**

**Expected Result:** Query completes without errors

---

## ✅ Verify Setup

Run this verification query in SQL Editor:

```sql
-- Check admin user
SELECT
  u.email,
  up.role,
  up.first_name,
  up.last_name
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'support@abor-tech.com';
```

**Should show:**
- Email: support@abor-tech.com
- Role: admin
- First Name: Support
- Last Name: Admin

---

## 🎉 What You Just Created

### 19 Database Tables:
✅ user_profiles
✅ addresses
✅ departments
✅ categories
✅ products (with installation service)
✅ product_variants
✅ cart_items (with installation option)
✅ wishlist
✅ orders (with pickup option)
✅ order_items (with installation tracking)
✅ order_tracking
✅ order_taxes
✅ services
✅ diy_articles
✅ global_settings
✅ seller_settings (with pickup location)
✅ shipping_carriers
✅ shipping_rules
✅ email_notification_preferences
✅ email_notification_log

### All 5 Features Included:

1. **Password Reset** ✅
   - Uses Supabase Auth (built-in)
   - No custom tables needed

2. **Admin Access** ✅
   - Admin user: support@abor-tech.com
   - Full access to all resources
   - Can edit any product, order, user

3. **Pickup Option (Click & Collect)** ✅
   - Seller pickup locations
   - Customer can choose pickup at checkout
   - No shipping costs for pickup

4. **Email Notifications** ✅
   - Order confirmation emails
   - Supplier notifications
   - Admin alerts
   - User preferences

5. **Installation Service** ✅
   - Per-product pricing
   - Customer can add to cart
   - Tracked in orders

---

## 🧪 Test Your Database

Run these test queries in SQL Editor:

```sql
-- 1. Count all tables
SELECT count(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public';
-- Should show: 19

-- 2. Check admin exists
SELECT count(*) as admin_count
FROM user_profiles
WHERE role = 'admin';
-- Should show: 1

-- 3. Check products table has installation fields
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name LIKE '%installation%';
-- Should show 3 columns

-- 4. Check seller_settings has pickup fields
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'seller_settings'
AND column_name LIKE '%pickup%';
-- Should show 4 columns

-- 5. Test admin function
SELECT is_admin();
-- Returns true if you're logged in as admin, false otherwise
```

---

## 🚀 Next Steps - Build Frontend

Your database is ready! Now you can build:

### 1. Password Reset Pages
- ForgotPasswordPage.tsx
- ResetPasswordPage.tsx
- Link from LoginPage

### 2. Admin Dashboard Enhancements
- Admin badge in header
- Edit any product (bypass seller check)
- User management
- Order management

### 3. Pickup Option UI
- Pickup toggle in checkout
- Display pickup location
- Seller pickup settings

### 4. Installation Service UI
- Installation checkbox on product page
- Show price in cart
- Track in orders

### 5. Email Notification System
- Create edge function for sending emails
- Email templates
- Configure SMTP/Resend

---

## 📊 Database Features

### Security (RLS)
✅ All tables have Row Level Security enabled
✅ Admin can access everything
✅ Users can only see their own data
✅ Public can view products/categories

### Performance
✅ 13 indexes for fast queries
✅ Optimized for products, orders, cart
✅ Email log indexes

### Triggers
✅ Auto-create email preferences for new users
✅ Automatic user profile creation

### Functions
✅ `is_admin()` - Check admin status
✅ `promote_user_to_admin(email)` - Make user admin
✅ `create_default_email_preferences()` - Auto preferences

---

## 🆘 Troubleshooting

### "Permission denied" error
- Make sure you're logged in to Supabase as project owner
- Check you're in the correct project

### "Relation already exists" error
- This means tables already exist
- Your database is not empty
- Contact me if you see this

### Admin user can't login
- Verify user was created (Step 2)
- Check you used correct email and password
- Make sure you ran promote function (Step 3)

### Admin doesn't have permissions
- Run verification query (see above)
- Check role is 'admin'
- Log out and log back in

---

## 📚 Additional Documentation

- **START_HERE.md** - General overview
- **DATABASE_MIGRATION_GUIDE.md** - Technical details
- **FEATURES_DATABASE_SUMMARY.md** - Feature breakdown
- **TEST_DATABASE_QUERIES.sql** - More test queries
- **QUICK_REFERENCE.md** - Quick commands

---

## 🎯 Success Criteria

Your setup is complete when:

- ✅ 19 tables created
- ✅ Admin user exists (support@abor-tech.com)
- ✅ Admin has role='admin' in user_profiles
- ✅ All verification queries pass
- ✅ No errors in Supabase logs

---

## 💡 Pro Tips

1. **Save your admin password** - You'll need it to log in!

2. **Test in development first** - If you have a production database, test there first

3. **Backup is automatic** - Supabase automatically backs up your database

4. **Migration is idempotent** - Safe to run multiple times if needed

5. **Check logs** - If something fails, check Supabase logs in dashboard

---

## 🎉 You're Done!

**Your complete e-commerce database is ready with all 5 features!**

Time to start building the frontend! 🚀

---

**Questions?** Check the other documentation files or run test queries to verify everything is working.
