# ⚡ QUICK START GUIDE

Get your EcoConnect Supply Chain Platform up and running in 15 minutes!

---

## 🚀 Step 1: Database Setup (5 minutes)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Click **SQL Editor** in sidebar

2. **Run Migration**
   - Open file: `new-sql-setup.sql`
   - Copy ALL contents
   - Paste into SQL Editor
   - Click **Run**
   - Wait for "Success" message

✅ **Done!** 21+ tables created with all features.

---

## 👤 Step 2: Create Admin User (3 minutes)

1. **Register**
   - Go to http://localhost:5173/register
   - Email: `admin@yourcompany.com`
   - Password: `Admin123!`
   - Click Register

2. **Promote to Admin**
   - Back in Supabase SQL Editor
   - Run:
   ```sql
   SELECT promote_user_to_admin('admin@yourcompany.com');
   ```

3. **Login as Admin**
   - Go to http://localhost:5173/admin/login
   - Login with your credentials
   - You're now an admin!

✅ **Done!** Admin access configured.

---

## 🧪 Step 3: Test Key Features (7 minutes)

### Test 1: Password Reset (2 min)
```
1. Logout
2. Go to /login
3. Click "Forgot your password?"
4. Enter your email
5. Check inbox for reset email
6. Click link and set new password
7. Login with new password
```

### Test 2: Seller Onboarding (3 min)
```
1. Logout
2. Go to /seller-register
3. Register as seller
4. Fill out application form
5. Submit application
6. Login as admin
7. Go to "Seller Applications"
8. Approve the application
9. Login as seller
10. Access seller dashboard ✅
```

### Test 3: Create Product (2 min)
```
1. As admin or seller
2. Go to Products → Add New
3. Fill in product details
4. Enable "Installation Service"
5. Save product
6. View on shop page ✅
```

✅ **Done!** Core features working!

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `new-sql-setup.sql` | **RUN THIS FIRST** - Complete database setup |
| `COMPLETE_TESTING_GUIDE.md` | Full testing instructions for all features |
| `PASSWORD_RESET_TESTING_GUIDE.md` | Detailed password reset testing |
| `TESTING_GUIDE.md` | Original comprehensive testing guide |

---

## 🔑 Key Features Included

✅ **Complete E-commerce System**
- Products, Categories, Orders
- Shopping Cart & Wishlist
- Multiple Payment Options

✅ **Multi-Vendor Marketplace**
- Seller Registration & Application
- Admin Approval Workflow
- Seller Dashboard & Product Management

✅ **User Management**
- Customer, Seller, Admin Roles
- Profile Management
- Address Book

✅ **Password Reset**
- Forgot Password Flow
- Email-based Reset
- Secure Token System

✅ **Advanced Features**
- Installation Services
- Click & Collect Pickup
- Tax & Shipping Management
- Order Tracking
- Email Notifications
- DIY Articles & Guides

---

## 🎯 What's Working Now

After following the quick start:

1. ✅ **Database** - All tables created with RLS policies
2. ✅ **Admin Panel** - Full admin dashboard access
3. ✅ **Seller Onboarding** - Application & approval system
4. ✅ **Password Reset** - Email-based password recovery
5. ✅ **E-commerce** - Shop, cart, checkout flow
6. ✅ **Security** - Row Level Security enforced
7. ✅ **Email** - Notification system configured

---

## 🧭 Navigation Map

### Public Routes
- `/` - Homepage
- `/shop` - Product catalog
- `/login` - Customer/Seller login
- `/register` - Customer registration
- `/seller-register` - Seller registration
- `/forgot-password` - Password reset request
- `/reset-password` - Set new password

### Customer Routes
- `/account` - Customer dashboard
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/wishlist` - Saved items

### Seller Routes (after approval)
- `/seller` - Seller dashboard
- `/seller/products` - Manage products
- `/seller/categories` - Manage categories
- `/seller/settings` - Seller settings
- `/seller-application` - Application status

### Admin Routes
- `/admin/login` - Admin login
- `/admin` - Admin dashboard
- `/admin/products` - All products
- `/admin/orders` - All orders
- `/admin/users` - User management
- `/admin/seller-applications` - Review applications ⭐
- `/admin/categories` - Categories & departments
- `/admin/settings` - Global settings

---

## 🔐 Default Credentials

After setup, you'll have:

**Admin Account:**
- Email: `admin@yourcompany.com`
- Password: (what you set)
- Access: Full platform control

**Test Accounts to Create:**
- Customer: `customer@test.com`
- Seller: `seller@test.com`

---

## 📊 Quick Database Check

Run these to verify everything:

```sql
-- Check all tables exist (should return 21+)
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';

-- Check RLS enabled (should all be true)
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check admin user exists
SELECT email, role FROM user_profiles
JOIN auth.users ON user_profiles.id = auth.users.id
WHERE role = 'admin';
```

---

## ⚠️ Common Issues

### Issue: Tables not created
**Solution:** Re-run `new-sql-setup.sql` in SQL Editor

### Issue: Can't login as admin
**Solution:** Check admin/login route, not regular /login

### Issue: Email not received
**Solution:** Check spam folder, verify Supabase email settings

### Issue: Seller can't access dashboard
**Solution:** Check application is approved, role is 'seller'

---

## 🎓 Next Steps

1. **Read Full Documentation**
   - `COMPLETE_TESTING_GUIDE.md` - Complete testing scenarios
   - `PASSWORD_RESET_TESTING_GUIDE.md` - Password reset details

2. **Customize Your Platform**
   - Add your logo and branding
   - Configure email templates
   - Set up payment gateway
   - Add sample products

3. **Production Preparation**
   - Configure custom domain
   - Set up SSL certificates
   - Enable rate limiting
   - Configure monitoring
   - Backup strategy

---

## 📞 Support & Resources

**Supabase Docs:**
- Auth: https://supabase.com/docs/guides/auth
- Database: https://supabase.com/docs/guides/database
- RLS: https://supabase.com/docs/guides/auth/row-level-security

**Testing Guides:**
- Complete Testing: `COMPLETE_TESTING_GUIDE.md`
- Password Reset: `PASSWORD_RESET_TESTING_GUIDE.md`

**SQL Scripts:**
- Main Setup: `new-sql-setup.sql`

---

## ✅ Success Checklist

Before considering setup complete:

- [ ] Database migration ran successfully
- [ ] Admin user created and can login
- [ ] Password reset tested and works
- [ ] Seller can register and submit application
- [ ] Admin can approve seller applications
- [ ] Approved seller can access dashboard
- [ ] Products can be created
- [ ] Shop page displays products
- [ ] Cart and checkout work
- [ ] No console errors

---

## 🎉 You're All Set!

Your EcoConnect Supply Chain Platform is ready to use!

**What you can do now:**
1. ✅ Accept seller applications
2. ✅ Manage products and orders
3. ✅ Process customer purchases
4. ✅ Handle password resets
5. ✅ Monitor all activity

**Start testing with the COMPLETE_TESTING_GUIDE.md** 🚀

---

*Last Updated: 2025-10-10*
*Version: 2.0 - With Seller Onboarding & Password Reset*
