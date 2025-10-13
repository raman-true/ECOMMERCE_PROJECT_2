# Quick Reference Card

## 🎯 Database Changes At-a-Glance

### New Tables
```
email_notification_preferences (6 columns)
email_notification_log (9 columns)
```

### Modified Tables
```
products            + 3 columns (installation)
order_items         + 2 columns (installation)
cart_items          + 1 column  (installation)
seller_settings     + 4 columns (pickup)
```

### New Functions
```sql
is_admin()                           -- Returns boolean
promote_user_to_admin(email text)    -- Returns void
create_default_email_preferences()   -- Trigger function
```

---

## ⚡ 3-Step Setup

```bash
# 1. Apply migration
# Go to: https://0ec90b57d6e95fcbda19832f.supabase.co
# SQL Editor → New Query → Paste apply-migration.sql → Run

# 2. Create admin user
# Register: support@abor-tech.com (through app or dashboard)

# 3. Promote to admin
SELECT promote_user_to_admin('support@abor-tech.com');
```

---

## 🔍 Quick Verification

```sql
-- Test 1: Check new tables exist
SELECT count(*) FROM email_notification_preferences;
SELECT count(*) FROM email_notification_log;

-- Test 2: Verify admin user
SELECT email, role FROM auth.users
JOIN user_profiles ON auth.users.id = user_profiles.id
WHERE email = 'support@abor-tech.com';
-- Should show: role = 'admin'

-- Test 3: Check product columns
\d products
-- Should see: has_installation_service, installation_price, installation_description

-- Test 4: Check seller_settings columns
\d seller_settings
-- Should see: pickup_enabled, pickup_location_name, pickup_location_address, pickup_instructions
```

---

## 🎨 Feature Summary

### 1. Password Reset
- Uses Supabase Auth (built-in)
- No database changes needed
- Frontend: ForgotPassword & ResetPassword pages

### 2. Admin Access
- Email: support@abor-tech.com
- Full access to all resources
- Can edit any product/order/user

### 3. Pickup Option
- Sellers set pickup location
- Customers choose at checkout
- No shipping costs for pickup

### 4. Email Notifications
- Order confirmations
- Supplier alerts
- Admin notifications
- User preferences

### 5. Installation Service
- Per-product pricing
- Checkbox in cart
- Tracked in orders

---

## 📂 File Guide

| File | Use When |
|------|----------|
| `START_HERE.md` | First time setup |
| `APPLY_MIGRATION_NOW.md` | Applying migration |
| `DATABASE_MIGRATION_GUIDE.md` | Need full details |
| `TEST_DATABASE_QUERIES.sql` | Testing database |
| `apply-migration.sql` | Running in Supabase |

---

## 🔧 Common Commands

```sql
-- Make user admin
SELECT promote_user_to_admin('email@example.com');

-- Check if current user is admin
SELECT is_admin();

-- List all admin users
SELECT email FROM auth.users u
JOIN user_profiles up ON u.id = up.id
WHERE up.role = 'admin';

-- Count products with installation
SELECT count(*) FROM products
WHERE has_installation_service = true;

-- List sellers with pickup enabled
SELECT seller_id, pickup_location_name
FROM seller_settings
WHERE pickup_enabled = true;

-- View recent email logs
SELECT recipient_email, email_type, status, created_at
FROM email_notification_log
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| Migration fails | Check Supabase logs, run as admin |
| Admin can't edit products | Verify role='admin', log out/in |
| Tables not found | Migration didn't run, try again |
| Permission denied | Check RLS policies, user auth state |

---

## 📊 TypeScript Types

```typescript
// All updated in src/types/index.ts

interface Product {
  // ... existing fields ...
  has_installation_service?: boolean;
  installation_price?: number;
  installation_description?: string;
}

interface CartItem {
  // ... existing fields ...
  includes_installation?: boolean;
}

interface OrderItem {
  // ... existing fields ...
  includes_installation?: boolean;
  installation_price?: number;
}

interface SellerSettings {
  // ... existing fields ...
  pickup_enabled: boolean;
  pickup_location_name?: string;
  pickup_location_address?: string;
  pickup_instructions?: string;
}

interface EmailNotificationPreferences {
  id: string;
  user_id: string;
  order_confirmations: boolean;
  order_updates: boolean;
  marketing_emails: boolean;
}

interface EmailNotificationLog {
  id: string;
  recipient_email: string;
  email_type: string;
  status: 'pending' | 'sent' | 'failed';
  // ... more fields
}
```

---

## 🎯 Next Steps

1. ✅ Apply migration
2. ✅ Create admin user
3. ✅ Test database
4. 🔨 Build frontend components
5. 🔨 Create edge functions
6. 🔨 Configure email service
7. 🧪 End-to-end testing

---

## 🔗 Links

- Supabase: https://0ec90b57d6e95fcbda19832f.supabase.co
- Admin Email: support@abor-tech.com

---

**Database ready! Start building! 🚀**
