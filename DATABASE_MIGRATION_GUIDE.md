# Database Migration Guide - Enhanced Features

## Overview

This guide explains the database changes made to support 5 major new features in your e-commerce platform.

## Features Added

### 1. Password Reset / Forgot Password
- **Implementation**: Uses Supabase Auth built-in password reset functionality
- **No database changes required** - Supabase handles this automatically
- **Frontend implementation needed**: ForgotPasswordPage and ResetPasswordPage components

### 2. Admin Access with Special Privileges
- **Admin Email**: support@abor-tech.com
- **Database Changes**:
  - New helper function: `is_admin()` - checks if current user has admin role
  - New function: `promote_user_to_admin(email)` - promotes a user to admin by email
  - Enhanced RLS policies on all tables to grant admin full access
  - Admin can view/edit all products, categories, departments, orders, and users

### 3. Pickup Option (Click & Collect)
- **Database Changes**:
  - Uses existing `delivery_method` field in orders table ('shipping' or 'click-collect')
  - Added to `seller_settings` table:
    - `pickup_enabled` (boolean) - whether seller offers pickup
    - `pickup_location_name` (text) - name of pickup location
    - `pickup_location_address` (text) - full address for pickup
    - `pickup_instructions` (text) - special instructions for customers

### 4. Email Notifications for Orders
- **New Tables**:

  **email_notification_preferences**:
  - Stores user email notification settings
  - Fields: order_confirmations, order_updates, marketing_emails
  - Each user gets default preferences automatically when profile is created

  **email_notification_log**:
  - Tracks all emails sent by the system
  - Records: recipient, email type, order_id, status (pending/sent/failed)
  - Helps with debugging and tracking email delivery

### 5. Onsite Installation Service
- **Database Changes**:

  **products table** (new fields):
  - `has_installation_service` (boolean) - whether product offers installation
  - `installation_price` (numeric) - cost of installation service
  - `installation_description` (text) - description of what's included

  **order_items table** (new fields):
  - `includes_installation` (boolean) - whether this order item includes installation
  - `installation_price` (numeric) - installation cost for this item

  **cart_items table** (new fields):
  - `includes_installation` (boolean) - whether user selected installation

## How to Apply the Migration

### Step 1: Run the SQL Migration

1. Open your Supabase dashboard: https://0ec90b57d6e95fcbda19832f.supabase.co
2. Navigate to: **SQL Editor** → **New Query**
3. Copy the contents of `apply-migration.sql` file
4. Paste into the SQL editor
5. Click **Run** to execute

The migration is safe to run multiple times (uses `IF NOT EXISTS` checks).

### Step 2: Create Admin User

After running the migration, you need to create the admin user:

**Option A: Through Registration Page**
1. Go to your app's registration page
2. Register with email: support@abor-tech.com
3. Use a strong password

**Option B: Through Supabase Dashboard**
1. Go to Authentication → Users
2. Click "Add User"
3. Email: support@abor-tech.com
4. Password: [choose a strong password]

### Step 3: Promote User to Admin

After creating the user, run this SQL command in Supabase SQL Editor:

```sql
SELECT promote_user_to_admin('support@abor-tech.com');
```

This will update the user's role to 'admin' in the user_profiles table.

### Step 4: Verify Admin Access

1. Log in with support@abor-tech.com
2. You should see admin-specific options
3. You should be able to edit any product/category/order

## Database Schema Summary

### New Tables Created

```sql
-- Email notification preferences
email_notification_preferences (
  id, user_id, order_confirmations, order_updates,
  marketing_emails, created_at, updated_at
)

-- Email notification log
email_notification_log (
  id, recipient_email, recipient_user_id, email_type,
  order_id, subject, status, error_message, sent_at, created_at
)
```

### Tables Modified

```sql
-- products table
ALTER TABLE products ADD COLUMN has_installation_service boolean;
ALTER TABLE products ADD COLUMN installation_price numeric;
ALTER TABLE products ADD COLUMN installation_description text;

-- order_items table
ALTER TABLE order_items ADD COLUMN includes_installation boolean;
ALTER TABLE order_items ADD COLUMN installation_price numeric;

-- cart_items table
ALTER TABLE cart_items ADD COLUMN includes_installation boolean;

-- seller_settings table
ALTER TABLE seller_settings ADD COLUMN pickup_enabled boolean;
ALTER TABLE seller_settings ADD COLUMN pickup_location_name text;
ALTER TABLE seller_settings ADD COLUMN pickup_location_address text;
ALTER TABLE seller_settings ADD COLUMN pickup_instructions text;
```

### New Database Functions

```sql
-- Check if current user is admin
is_admin() RETURNS boolean

-- Promote user to admin by email
promote_user_to_admin(user_email text) RETURNS void

-- Auto-create email preferences for new users
create_default_email_preferences() RETURNS TRIGGER
```

### New Indexes

```sql
idx_orders_delivery_method ON orders(delivery_method)
idx_products_installation ON products(has_installation_service)
idx_email_log_status ON email_notification_log(status)
idx_email_log_order ON email_notification_log(order_id)
idx_email_log_recipient ON email_notification_log(recipient_user_id)
```

## Security (RLS Policies)

All new tables have Row Level Security enabled with restrictive policies:

- **email_notification_preferences**: Users can only view/edit their own preferences
- **email_notification_log**: Users can view their own logs, admins can view all logs
- **Admin policies**: Admin users can view/edit all products, categories, departments, orders, and user profiles

## Next Steps - Frontend Implementation

Now that the database is ready, you need to implement the frontend features:

### 1. Password Reset Pages
- Create `ForgotPasswordPage.tsx` - email input form
- Create `ResetPasswordPage.tsx` - new password form
- Add links in `LoginPage.tsx`
- Update routing in `AppRoutes.tsx`

### 2. Admin Access UI
- Update product forms to check admin access
- Add admin indicators in UI (badges, banners)
- Update navigation to show admin options
- Implement user management page for admins

### 3. Pickup Option UI
- Update `CheckoutPage.tsx` to show pickup/shipping toggle
- Display seller pickup location when selected
- Update order total calculation (no shipping for pickup)
- Show pickup details in order confirmation

### 4. Email Notification System
- Create Supabase Edge Function for sending emails
- Configure SMTP or Resend API in Supabase
- Create email templates
- Trigger emails on order creation
- Add notification preferences page in user account

### 5. Installation Service UI
- Update product forms to include installation fields
- Add installation checkbox on product detail page
- Show installation cost in cart
- Include installation in order total calculation
- Display installation details in orders

## TypeScript Types Updated

All TypeScript interfaces in `src/types/index.ts` have been updated to match the new database schema:

- `Product` - added installation service fields
- `CartItem` - added includes_installation
- `EmailNotificationPreferences` - new interface
- `EmailNotificationLog` - new interface
- `SellerSettings` - added pickup fields
- `OrderItem` - added installation fields

## Testing Checklist

After applying migration and implementing frontend:

- [ ] Password reset flow works (request → email → reset)
- [ ] Admin can log in and access all resources
- [ ] Admin can edit any product/category
- [ ] Admin can view all orders
- [ ] Pickup option appears at checkout
- [ ] Pickup removes shipping costs
- [ ] Installation service checkbox works
- [ ] Installation cost adds to cart total
- [ ] Order confirmation shows pickup/installation details
- [ ] Email notifications are sent (test with real email)

## Troubleshooting

### Migration Fails
- Check Supabase logs in dashboard
- Ensure you're running as a privileged user
- Try running sections of the migration separately

### Admin User Not Working
- Verify user exists in auth.users table
- Check user_profiles table has correct role
- Run promote_user_to_admin function again

### RLS Policy Issues
- Check if user is authenticated
- Verify admin role is set correctly
- Test is_admin() function manually

### Email Preferences Not Created
- Check trigger is enabled
- Manually insert preferences for existing users
- Verify user_profiles insert trigger is working

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify all migrations ran successfully
3. Test database functions manually in SQL Editor
4. Check RLS policies are enabled and correct
