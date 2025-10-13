# 🎯 COMPLETE TESTING GUIDE - EcoConnect Supply Chain Platform

Your comprehensive guide to testing ALL features including the new seller onboarding and password reset systems.

---

## 📋 Quick Start Checklist

Before testing, ensure you have:
- [ ] Supabase project created
- [ ] Database setup completed (run `new-sql-setup.sql`)
- [ ] Environment variables configured in `.env`
- [ ] Application running (`npm run dev`)
- [ ] Access to email inbox for testing

---

## 🗂️ Table of Contents

1. [Database Setup](#1-database-setup)
2. [Create Admin User](#2-create-admin-user)
3. [Test Password Reset](#3-test-password-reset-system)
4. [Test Admin Features](#4-test-admin-features)
5. [Test Seller Onboarding](#5-test-seller-onboarding-system)
6. [Test E-commerce Flow](#6-test-e-commerce-flow)
7. [Test Security](#7-test-security-rls-policies)
8. [Database Verification](#8-database-verification)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Database Setup

### Step 1: Apply Complete Database Migration

**Actions:**
1. Open Supabase Dashboard at https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Open the file: `new-sql-setup.sql`
5. Copy **entire contents** (Ctrl+A, Ctrl+C)
6. Paste into SQL Editor
7. Click **Run** button (bottom right)
8. Wait for success message

**Expected Result:**
```
Success. No rows returned
```

**Verify Tables Created:**
```sql
-- Run this to list all tables
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Should see 21+ tables including:**
- user_profiles
- addresses
- products
- orders
- seller_applications ✨ (NEW)
- password_reset_tokens ✨ (NEW)
- email_notification_log
- And more...

**Screenshot Checkpoint:** ✅ All tables created

---

## 2. Create Admin User

### Step 2.1: Register First User

**Actions:**
1. Go to http://localhost:5173/register
2. Fill in registration form:
   - First Name: `Admin`
   - Last Name: `User`
   - Email: `admin@example.com` (use your real email)
   - Password: `Admin123!`
3. Click "Register"

**Expected Result:**
- Account created successfully
- Redirected to `/account` (customer dashboard)

---

### Step 2.2: Promote to Admin

**Actions:**
1. Go back to Supabase SQL Editor
2. Run this query (replace with your email):

```sql
SELECT promote_user_to_admin('admin@example.com');
```

**Expected Result:**
- Success message
- No errors

**Verify Admin Role:**
```sql
SELECT id, first_name, last_name, role
FROM user_profiles
WHERE role = 'admin';
```

Should show your user with `role = 'admin'`

---

### Step 2.3: Test Admin Access

**Actions:**
1. Log out of customer account
2. Go to http://localhost:5173/admin/login
3. Login with admin credentials
4. Should see Admin Dashboard

**Expected Result:**
- Successfully logged in as admin
- Admin dashboard displays
- Sidebar shows all admin menu items

**Screenshot Checkpoint:** ✅ Admin dashboard access

---

## 3. Test Password Reset System

### Test 3.1: Forgot Password Flow

**Actions:**
1. Log out if logged in
2. Go to `/login`
3. Click "Forgot your password?" link
4. Enter email: `admin@example.com`
5. Click "Send Reset Link"

**Expected Result:**
- Success screen: "Check Your Email"
- Shows your email address
- Instructions about checking spam

---

### Test 3.2: Check Email & Reset

**Actions:**
1. Check your email inbox
2. Open "Reset Password" email from Supabase
3. Click the reset link
4. Should open `/reset-password` page
5. Enter new password: `NewAdmin123!`
6. Confirm password: `NewAdmin123!`
7. Click "Reset Password"

**Expected Result:**
- Success message appears
- "Password Reset Successful!" heading
- Auto-redirects to login after 3 seconds

---

### Test 3.3: Login with New Password

**Actions:**
1. On login page
2. Email: `admin@example.com`
3. Password: `NewAdmin123!` (the NEW password)
4. Click "Sign in"

**Expected Result:**
- Successfully logged in
- Old password no longer works
- Redirected to admin dashboard

**Screenshot Checkpoint:** ✅ Password reset works

**For detailed password reset testing, see:** `PASSWORD_RESET_TESTING_GUIDE.md`

---

## 4. Test Admin Features

### Test 4.1: Create Department

**Actions:**
1. In admin dashboard, click "Categories & Depts."
2. Click "Add New Department"
3. Fill in:
   - Slug: `building-materials`
   - Name: `Building Materials`
   - Description: `Quality building supplies`
   - Image URL: `https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg`
4. Click "Create Department"

**Expected Result:**
- Success message
- Department appears in list
- No errors

---

### Test 4.2: Create Category

**Actions:**
1. Click "Add New Category"
2. Fill in:
   - Slug: `lumber`
   - Name: `Lumber & Wood`
   - Department: Select "Building Materials"
   - Image URL: `https://images.pexels.com/photos/5217903/pexels-photo-5217903.jpeg`
3. Click "Create Category"

**Expected Result:**
- Category created
- Shows under Building Materials department

---

### Test 4.3: Create Product

**Actions:**
1. Click "Products" → "Add New Product"
2. Fill in:
   - Slug: `pine-lumber-2x4`
   - Name: `Pine Lumber 2x4 x 8ft`
   - Price: `12.99`
   - Stock: `500`
   - Category: "Lumber & Wood"
   - ✅ Check "Offer Installation Service"
   - Installation Price: `25.00`
3. Click "Create Product"

**Expected Result:**
- Product created successfully
- Installation service is included
- Visible on shop page

**Screenshot Checkpoint:** ✅ Admin can create products

---

## 5. Test Seller Onboarding System

### Test 5.1: Register as Seller

**Actions:**
1. Log out of admin account
2. Go to `/seller-register`
3. Register new seller:
   - First Name: `John`
   - Last Name: `Smith`
   - Email: `seller@example.com`
   - Password: `Seller123!`
4. Click "Register as Seller"

**Expected Result:**
- Account created
- **Auto-redirected to `/seller-application`**
- Application form loads

**Screenshot Checkpoint:** ✅ Seller registration works

---

### Test 5.2: Submit Seller Application

**Actions:**
Fill in the complete application form:

**Business Information:**
- Business Name: `Smith Hardware Supplies`
- Business Type: `Sole Trader`
- ABN: `12 345 678 901`
- Description: `Family hardware business`

**Business Address:**
- Address 1: `123 Main Street`
- City: `Sydney`
- State: `NSW`
- Postcode: `2000`

**Contact Information:**
- Contact Person: `John Smith`
- Email: `john@smithhardware.com`
- Phone: `0412 345 678`

**Banking Information:**
- Account Name: `Smith Hardware Supplies`
- BSB: `123-456`
- Account Number: `12345678`

Click "Submit Application"

**Expected Result:**
- Application submitted successfully
- Shows "Pending Review" status
- Message: "Your application is currently under review"

**Screenshot Checkpoint:** ✅ Application submitted

---

### Test 5.3: Admin Reviews Application

**Actions:**
1. Log out of seller account
2. Log in as admin (`admin@example.com`)
3. Go to admin dashboard

**Expected Result:**
- **Yellow alert banner appears**
- Shows: "You have 1 pending seller application"
- "Review Applications" button visible

**Screenshot Checkpoint:** ✅ Pending application alert

---

### Test 5.4: Approve Seller Application

**Actions:**
1. Click "Seller Applications" in sidebar
2. See "Smith Hardware Supplies" application
3. Review all details
4. Click "Approve" button

**Expected Result:**
- Success message appears
- Application status changes to "Approved" (green)
- User role changed to 'seller' in database

**Verify in Database:**
```sql
-- Check user role changed
SELECT id, role FROM user_profiles
WHERE id = (
  SELECT user_id FROM seller_applications
  WHERE business_name = 'Smith Hardware Supplies'
);

-- Should show role = 'seller'

-- Check seller_settings created
SELECT * FROM seller_settings
WHERE seller_id = (
  SELECT user_id FROM seller_applications
  WHERE business_name = 'Smith Hardware Supplies'
);
```

**Screenshot Checkpoint:** ✅ Application approved

---

### Test 5.5: Seller Accesses Dashboard

**Actions:**
1. Log out of admin
2. Login as seller: `seller@example.com` / `Seller123!`

**Expected Result:**
- Login successful
- **Redirected to `/seller` dashboard**
- Seller sidebar visible with:
  - Dashboard
  - Products
  - Categories
  - Settings

**Screenshot Checkpoint:** ✅ Seller dashboard access

---

### Test 5.6: Seller Creates Product

**Actions:**
1. In seller dashboard, click "Products"
2. Click "Add New Product"
3. Create a product:
   - Name: `Cordless Drill Kit`
   - Price: `149.99`
   - Stock: `25`
4. Click "Create Product"

**Expected Result:**
- Product created successfully
- Shows in seller's product list
- Product has seller_id set to seller's user ID
- Product visible on public shop page

**Verify in Database:**
```sql
SELECT name, price, seller_id
FROM products
WHERE name = 'Cordless Drill Kit';
```

**Screenshot Checkpoint:** ✅ Seller can create products

---

### Test 5.7: Test Rejection Workflow

**Actions:**
1. Register another seller: `newseller@example.com`
2. Submit application
3. Login as admin
4. Go to Seller Applications
5. Click "Reject" on new application
6. Enter reason: `ABN could not be verified`
7. Confirm rejection

**Expected Result:**
- Application status = "Rejected" (red)
- Rejection reason saved

**Then as rejected seller:**
1. Login as `newseller@example.com`
2. Go to `/seller-application`

**Expected Result:**
- See "Rejected" status
- Rejection reason displayed
- "Submit New Application" button available

**Screenshot Checkpoint:** ✅ Rejection workflow works

---

## 6. Test E-commerce Flow

### Test 6.1: Customer Registration

**Actions:**
1. Log out
2. Go to `/register`
3. Register as customer:
   - Email: `customer@example.com`
   - Password: `Customer123!`
4. Login

---

### Test 6.2: Browse and Add to Cart

**Actions:**
1. Go to `/shop`
2. Find "Pine Lumber 2x4"
3. Click to view product
4. Add to cart (quantity: 2)
5. Check "Add Installation Service"
6. Click "Add to Cart"

**Expected Result:**
- Cart icon shows item count
- Product + installation added
- Can view cart at `/cart`

---

### Test 6.3: Checkout

**Actions:**
1. Go to `/cart`
2. Click "Proceed to Checkout"
3. Fill in shipping address
4. Select delivery method
5. Complete purchase

**Expected Result:**
- Order created
- Order number generated
- Redirected to confirmation page
- Order appears in admin orders list

**Screenshot Checkpoint:** ✅ E-commerce flow works

---

## 7. Test Security (RLS Policies)

### Test 7.1: Seller Cannot Access Others' Data

**Actions:**
1. Login as seller #1
2. Try to edit seller #2's products (via URL manipulation)

**Expected Result:**
- Cannot view other seller's products
- Cannot edit other seller's data
- RLS blocks unauthorized access

---

### Test 7.2: Customer Cannot Access Admin

**Actions:**
1. Login as customer
2. Try to navigate to `/admin`

**Expected Result:**
- Redirected away
- Cannot access admin routes
- Protected routes work

---

### Test 7.3: Database-Level Security

**Run in SQL Editor:**
```sql
-- Test RLS policies
SET ROLE authenticated;

-- Try to see all seller applications (should only see own)
SELECT * FROM seller_applications;

-- Should only return applications for current user
```

**Screenshot Checkpoint:** ✅ Security policies enforced

---

## 8. Database Verification

### Key Verification Queries

**Check All Seller Applications:**
```sql
SELECT
  sa.business_name,
  sa.status,
  up.first_name || ' ' || up.last_name as applicant,
  up.role as current_role,
  sa.created_at
FROM seller_applications sa
JOIN user_profiles up ON sa.user_id = up.id
ORDER BY sa.created_at DESC;
```

**Check Seller Settings:**
```sql
SELECT
  ss.seller_id,
  up.first_name || ' ' || up.last_name as seller_name,
  ss.fulfillment_method,
  ss.delivery_sla_days,
  ss.pickup_enabled
FROM seller_settings ss
JOIN user_profiles up ON ss.seller_id = up.id;
```

**Check Products by Seller:**
```sql
SELECT
  p.name,
  p.price,
  p.stock,
  CASE
    WHEN p.seller_id IS NULL THEN 'Admin'
    ELSE up.first_name || ' ' || up.last_name
  END as created_by,
  up.role
FROM products p
LEFT JOIN user_profiles up ON p.seller_id = up.id
ORDER BY p.created_at DESC;
```

**Check Password Reset Tokens:**
```sql
SELECT
  prt.id,
  u.email,
  prt.expires_at,
  prt.used,
  prt.created_at
FROM password_reset_tokens prt
JOIN auth.users u ON prt.user_id = u.id
ORDER BY prt.created_at DESC;
```

**Check Email Logs:**
```sql
SELECT
  recipient_email,
  email_type,
  status,
  created_at
FROM email_notification_log
ORDER BY created_at DESC
LIMIT 10;
```

---

## 9. Troubleshooting

### Common Issues & Solutions

#### Issue 1: "Application not found" when approving

**Solution:**
```sql
-- Check application exists
SELECT * FROM seller_applications
WHERE status = 'pending';

-- Verify RLS allows admin to see it
```

---

#### Issue 2: Seller can't access dashboard after approval

**Solution:**
```sql
-- Manually verify role
SELECT id, role FROM user_profiles
WHERE email = 'seller@example.com';

-- If not 'seller', update:
UPDATE user_profiles
SET role = 'seller'
WHERE email = 'seller@example.com';
```

---

#### Issue 3: Password reset email not received

**Solutions:**
1. Check spam folder
2. Verify email in Supabase Auth dashboard
3. Check Supabase → Authentication → Email Templates
4. Try different email provider (Gmail, Outlook)

**Debug:**
```sql
SELECT * FROM email_notification_log
WHERE email_type = 'password_reset'
ORDER BY created_at DESC;
```

---

#### Issue 4: Tables not created

**Solution:**
1. Re-run `new-sql-setup.sql`
2. Check for SQL errors in output
3. Verify schema is 'public'
4. Check Supabase project permissions

---

#### Issue 5: RLS infinite recursion

**This is FIXED** in the new migration by using `is_admin()` helper function with `SECURITY DEFINER`

If still occurs:
```sql
-- Verify function exists
SELECT proname FROM pg_proc
WHERE proname = 'is_admin';

-- Should return: is_admin
```

---

## 10. Complete Testing Checklist

Use this master checklist:

### Database Setup
- [ ] `new-sql-setup.sql` executed successfully
- [ ] All 21+ tables created
- [ ] Default data inserted (settings, carriers)
- [ ] Indexes created
- [ ] RLS enabled on all tables

### Admin Features
- [ ] Admin user created and promoted
- [ ] Admin dashboard accessible
- [ ] Can create departments
- [ ] Can create categories
- [ ] Can create products
- [ ] Can view all orders
- [ ] Can manage users

### Password Reset
- [ ] Forgot password link visible on login
- [ ] Reset email sent successfully
- [ ] Reset link works
- [ ] Can set new password
- [ ] Can login with new password
- [ ] Old password no longer works
- [ ] Expired links show error
- [ ] Used links cannot be reused

### Seller Onboarding
- [ ] Seller registration works
- [ ] Auto-redirect to application form
- [ ] Application form validates correctly
- [ ] Application submitted successfully
- [ ] Admin sees pending application alert
- [ ] Admin can view application details
- [ ] Admin can approve application
- [ ] User role changed to 'seller'
- [ ] Seller_settings created automatically
- [ ] Approved seller can access dashboard
- [ ] Seller can create products
- [ ] Admin can reject applications
- [ ] Rejected seller sees rejection reason
- [ ] Rejected seller can resubmit

### E-commerce Flow
- [ ] Customer registration works
- [ ] Can browse products
- [ ] Can add to cart
- [ ] Installation service can be added
- [ ] Cart displays correctly
- [ ] Checkout flow works
- [ ] Orders are created
- [ ] Order confirmation shown

### Security
- [ ] RLS policies prevent unauthorized access
- [ ] Sellers can only see own data
- [ ] Customers cannot access admin routes
- [ ] Password reset tokens are secure
- [ ] Email doesn't reveal user existence
- [ ] Admin helper function prevents recursion

### Database Integrity
- [ ] All foreign keys work correctly
- [ ] Triggers fire on user creation
- [ ] Email preferences created automatically
- [ ] Application timestamps update
- [ ] Token cleanup function works

---

## 11. Performance Benchmarks

Expected query performance:

```sql
-- Should complete in < 10ms
EXPLAIN ANALYZE
SELECT * FROM seller_applications
WHERE status = 'pending';

-- Should use index on token
EXPLAIN ANALYZE
SELECT * FROM password_reset_tokens
WHERE token = 'test-token'
AND expires_at > now();
```

**All queries should be < 50ms**

---

## 12. Production Readiness

Before going live:

- [ ] Change all test emails to production emails
- [ ] Configure production SMTP (if needed)
- [ ] Enable email confirmation (optional)
- [ ] Set up rate limiting
- [ ] Configure proper CORS
- [ ] Enable SSL/HTTPS
- [ ] Review and harden RLS policies
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy
- [ ] Document admin procedures
- [ ] Train admin users
- [ ] Create seller onboarding guide
- [ ] Set up customer support channels

---

## 13. Additional Resources

**Detailed Guides:**
- `PASSWORD_RESET_TESTING_GUIDE.md` - Comprehensive password reset testing
- `TESTING_GUIDE.md` - Original detailed testing guide
- `new-sql-setup.sql` - Complete database schema

**Supabase Documentation:**
- Auth: https://supabase.com/docs/guides/auth
- RLS: https://supabase.com/docs/guides/auth/row-level-security
- Email: https://supabase.com/docs/guides/auth/auth-email

---

## 🎉 Success Criteria

Your system is ready when:
- ✅ All checklist items complete
- ✅ No console errors
- ✅ All database queries < 50ms
- ✅ Security policies enforced
- ✅ Email delivery working
- ✅ User flows are smooth
- ✅ Admin can manage sellers
- ✅ Sellers can manage products
- ✅ Customers can purchase

**Congratulations! Your EcoConnect Supply Chain Platform is fully functional!** 🚀

---

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review Supabase logs
3. Check browser console for errors
4. Verify database state with SQL queries
5. Test in incognito mode
6. Clear cache and cookies

**Database Reset (if needed):**
```sql
-- WARNING: Deletes all data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then re-run new-sql-setup.sql
```
