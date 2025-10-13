# Password Reset Testing Guide

Complete guide for testing the forgot password and reset password functionality.

---

## Prerequisites

1. **Database Setup Complete**
   - Run `new-sql-setup.sql` in Supabase SQL Editor
   - All tables created including `password_reset_tokens`

2. **Email Configuration (IMPORTANT)**
   - Supabase automatically handles password reset emails
   - You **DO NOT** need to configure SMTP for testing
   - Supabase uses magic links for password reset

3. **Test User Account**
   - Register a test user at `/register`
   - Use a real email address you can access

---

## Test Scenario 1: Forgot Password Flow

### Step 1: Access Forgot Password Page

**Actions:**
1. Go to `/login`
2. Click "Forgot your password?" link below the password field

**Expected Result:**
- Redirected to `/forgot-password`
- Page shows "Forgot Password?" heading
- Email input field is visible
- "Send Reset Link" button is displayed

**Screenshot Checkpoint:** Forgot password page loads

---

### Step 2: Request Password Reset

**Actions:**
1. On `/forgot-password` page
2. Enter your email address (must be a registered user)
3. Click "Send Reset Link" button

**Expected Result:**
- Button shows "Sending..." while processing
- Success message appears:
  - "Check Your Email" heading
  - Shows the email address you entered
  - Instructions about checking spam folder
  - "Back to Login" button

**Screenshot Checkpoint:** Success message displayed

---

### Step 3: Check Email

**Actions:**
1. Open your email inbox
2. Look for email from Supabase/Your App
3. Subject line: "Reset Password"

**Expected Email Contents:**
- From: noreply@mail.app.supabase.io
- Subject: Reset Password
- Body contains a "Reset Password" link
- Link format: `https://your-project.supabase.co/auth/v1/verify?token=...`

**Important Notes:**
- Email may take 1-5 minutes to arrive
- Check spam/junk folder if not in inbox
- Link expires in 24 hours

**Screenshot Checkpoint:** Reset email received

---

### Step 4: Click Reset Link

**Actions:**
1. In the email, click the "Reset Password" link
2. This should open in your browser

**Expected Result:**
- Browser opens to your app URL
- Automatically redirected to `/reset-password`
- Page shows "Reset Your Password" heading
- Two password input fields visible
- "Reset Password" button displayed

**If Link Doesn't Work:**
- Copy the full URL from email
- Paste into browser address bar
- Press Enter

**Screenshot Checkpoint:** Reset password page loads

---

## Test Scenario 2: Reset Password

### Step 5: Enter New Password

**Actions:**
1. On `/reset-password` page
2. In "New Password" field, enter: `NewPass123!`
3. In "Confirm New Password" field, enter: `NewPass123!`
4. Click "Reset Password" button

**Expected Result:**
- Button shows "Resetting..." while processing
- Success screen appears:
  - Green checkmark icon
  - "Password Reset Successful!" heading
  - "You will be redirected..." message
  - Auto-redirects to `/login` after 3 seconds
  - OR "Go to Login" button appears

**Screenshot Checkpoint:** Password reset success

---

### Step 6: Login with New Password

**Actions:**
1. On `/login` page
2. Enter your email address
3. Enter your NEW password: `NewPass123!`
4. Click "Sign in" button

**Expected Result:**
- Successfully logged in
- Redirected to appropriate dashboard:
  - Customer: `/account`
  - Seller: `/seller`
  - Admin: `/admin` (if logging in via admin login)
- No errors occur

**Screenshot Checkpoint:** Successfully logged in

---

## Test Scenario 3: Edge Cases & Error Handling

### Test 3.1: Invalid Email Address

**Actions:**
1. Go to `/forgot-password`
2. Enter non-existent email: `notexist@example.com`
3. Click "Send Reset Link"

**Expected Result:**
- Success message still appears (for security reasons)
- Email is NOT sent (Supabase doesn't send to non-existent users)
- No error message reveals that user doesn't exist

**Why?** Security best practice - don't reveal which emails are registered

---

### Test 3.2: Password Mismatch

**Actions:**
1. Get a valid reset link
2. On `/reset-password` page:
   - New Password: `Pass123!`
   - Confirm Password: `Pass456!` (different)
3. Click "Reset Password"

**Expected Result:**
- Red error message: "Passwords do not match"
- Form is not submitted
- Can correct and resubmit

---

### Test 3.3: Password Too Short

**Actions:**
1. On `/reset-password` page:
   - New Password: `123`
   - Confirm Password: `123`
2. Click "Reset Password"

**Expected Result:**
- Red error message: "Password must be at least 6 characters long"
- Form is not submitted
- Browser may also show HTML5 validation

---

### Test 3.4: Expired Reset Link

**Actions:**
1. Request password reset
2. Wait 25+ hours (or manually expire token in database)
3. Try to use the reset link

**Expected Result:**
- Error message: "Invalid or expired reset link"
- Instruction to request a new reset
- Cannot proceed with password reset

**To Manually Test:**
```sql
-- In Supabase SQL Editor, expire a token
UPDATE password_reset_tokens
SET expires_at = now() - interval '1 hour'
WHERE token = 'your-token-here';
```

---

### Test 3.5: Link Already Used

**Actions:**
1. Complete a password reset successfully
2. Try to use the same reset link again

**Expected Result:**
- Session is no longer valid
- Redirected or error message shown
- Must request a new password reset

---

## Test Scenario 4: Multiple Reset Requests

### Test 4.1: Request Multiple Times

**Actions:**
1. Go to `/forgot-password`
2. Enter your email and send reset link
3. Immediately go to `/forgot-password` again
4. Enter same email and send another reset link

**Expected Result:**
- Both emails are sent
- Only the most recent link works
- Previous links are automatically invalidated
- This is handled by the `create_password_reset_token` function

---

## Test Scenario 5: Database Verification

### Verify Tokens Created

**SQL Query:**
```sql
-- Check password reset tokens
SELECT
  id,
  user_id,
  token,
  expires_at,
  used,
  created_at
FROM password_reset_tokens
ORDER BY created_at DESC
LIMIT 10;
```

**Expected Data:**
- Tokens exist for reset requests
- `expires_at` is 24 hours from creation
- `used` is `false` for unused tokens
- `used` is `true` after successful reset

---

### Verify Token Expiry

**SQL Query:**
```sql
-- Check if cleanup function works
SELECT cleanup_expired_password_tokens();
```

**Expected Result:**
- Returns number of deleted tokens
- Tokens older than 7 days + expired are removed

---

## Test Scenario 6: Email Notification Logging

### Check Email Logs

**SQL Query:**
```sql
-- View password reset email logs
SELECT
  id,
  recipient_email,
  email_type,
  subject,
  status,
  sent_at,
  created_at
FROM email_notification_log
WHERE email_type = 'password_reset'
ORDER BY created_at DESC;
```

**Expected Data:**
- Record created for each reset email
- `email_type` is 'password_reset'
- `status` shows 'sent' or 'pending'
- `recipient_email` matches user's email

---

## Test Scenario 7: Security Testing

### Test 7.1: Access Reset Page Without Token

**Actions:**
1. Go directly to `/reset-password` (without clicking email link)

**Expected Result:**
- Error message: "Invalid or expired reset link"
- Cannot reset password
- Must use valid link from email

---

### Test 7.2: RLS Policies for Password Tokens

**SQL Test:**
```sql
-- Try to view another user's tokens (should fail)
SET ROLE authenticated;
SET request.jwt.claim.sub TO 'some-other-user-id';

SELECT * FROM password_reset_tokens;
```

**Expected Result:**
- Only returns tokens for current user
- Cannot see other users' tokens
- RLS policies enforced

---

### Test 7.3: Cannot Reuse Token

**Actions:**
1. Complete password reset
2. Check database that token is marked as used:

```sql
SELECT used, used_at
FROM password_reset_tokens
WHERE token = 'your-token'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result:**
- `used` is `true`
- `used_at` has timestamp
- Token cannot be reused

---

## Test Scenario 8: User Experience Testing

### Test 8.1: Forgot Password Link Visibility

**Actions:**
1. Go to `/login`
2. Look for "Forgot your password?" link

**Expected Result:**
- Link is clearly visible below password field
- Link is properly styled (underlined, brown color)
- Click takes you to `/forgot-password`

---

### Test 8.2: Success Messages

**Verify all success messages are user-friendly:**

**On Forgot Password Success:**
- ✅ Clear heading: "Check Your Email"
- ✅ Shows email address sent to
- ✅ Instructions about spam folder
- ✅ Link expiry mentioned (24 hours)

**On Reset Password Success:**
- ✅ Green checkmark icon
- ✅ "Password Reset Successful!" heading
- ✅ Auto-redirect mentioned
- ✅ Manual redirect button available

---

### Test 8.3: Error Messages

**Verify all error messages are clear:**

- ✅ "Passwords do not match" - when confirmation fails
- ✅ "Password must be at least 6 characters" - for short passwords
- ✅ "Invalid or expired reset link" - for bad tokens
- ✅ "Failed to send reset email" - for system errors

---

## Test Scenario 9: Integration Testing

### Test 9.1: Complete Flow

**Full end-to-end test:**

1. Register new user → `/register`
2. Login successfully → `/login`
3. Logout
4. Forget password → `/forgot-password`
5. Receive email
6. Click reset link → `/reset-password`
7. Set new password
8. Login with new password → `/login`
9. Access account → `/account`

**Expected Result:**
- All steps work seamlessly
- No errors at any point
- User regains account access

---

## Test Scenario 10: Mobile & Responsive Testing

### Test on Mobile Device

**Actions:**
1. Open `/forgot-password` on mobile
2. Complete password reset flow on mobile
3. Check email on mobile device
4. Complete reset on mobile

**Expected Result:**
- All pages are mobile-responsive
- Forms are easy to use on mobile
- Email links work on mobile browsers
- Success messages are clearly visible

---

## Troubleshooting Common Issues

### Issue 1: Not Receiving Reset Email

**Solutions:**
1. Check spam/junk folder
2. Verify email in Supabase Auth dashboard
3. Check Supabase Auth → Email Templates are enabled
4. Verify SMTP settings in Supabase dashboard
5. Test with different email providers (Gmail, Outlook, etc.)

**Debug Query:**
```sql
-- Check if email was logged
SELECT * FROM email_notification_log
WHERE recipient_email = 'your@email.com'
AND email_type = 'password_reset'
ORDER BY created_at DESC;
```

---

### Issue 2: Reset Link Not Working

**Solutions:**
1. Copy full URL from email (don't click)
2. Check if link is expired (24-hour limit)
3. Request a new reset link
4. Clear browser cache/cookies
5. Try incognito/private browsing mode

**Debug Query:**
```sql
-- Check token status
SELECT * FROM password_reset_tokens
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your@email.com'
)
ORDER BY created_at DESC;
```

---

### Issue 3: "Invalid or Expired" Error

**Causes:**
- Link is older than 24 hours
- Link was already used
- Token was manually invalidated
- Session expired

**Solution:**
- Request a new password reset
- Check database for token status

---

### Issue 4: Password Reset Succeeds But Login Fails

**Solutions:**
1. Make sure you're using the NEW password
2. Check if email confirmation is required
3. Verify user is not locked out
4. Check Supabase Auth logs for errors

**Debug Query:**
```sql
-- Check user auth status
SELECT
  id,
  email,
  email_confirmed_at,
  last_sign_in_at,
  banned_until
FROM auth.users
WHERE email = 'your@email.com';
```

---

## Configuration Check

### Supabase Email Settings

**Verify in Supabase Dashboard:**

1. Go to **Authentication** → **Email Templates**
2. Find "Reset Password" template
3. Verify it's enabled
4. Check the template content
5. Confirm redirect URL is correct

**Default Template Variables:**
- `{{ .ConfirmationURL }}` - The reset link
- `{{ .SiteURL }}` - Your app URL
- `{{ .Email }}` - User's email

---

## Testing Checklist

Use this checklist to verify all features:

- [ ] Forgot password link visible on login page
- [ ] Forgot password page loads correctly
- [ ] Email validation works
- [ ] Reset email is sent successfully
- [ ] Email contains correct reset link
- [ ] Reset link opens reset password page
- [ ] New password form validates correctly
- [ ] Password mismatch shows error
- [ ] Short password shows error
- [ ] Successful reset shows success message
- [ ] Auto-redirect to login works
- [ ] Can login with new password
- [ ] Old password no longer works
- [ ] Expired link shows error
- [ ] Used link cannot be reused
- [ ] Multiple requests invalidate old tokens
- [ ] Mobile responsive design works
- [ ] Database tokens are created
- [ ] Email logs are created
- [ ] RLS policies prevent unauthorized access
- [ ] Cleanup function removes old tokens

---

## Performance Testing

### Database Performance

**Test query speed:**
```sql
EXPLAIN ANALYZE
SELECT * FROM password_reset_tokens
WHERE token = 'test-token-value'
AND expires_at > now()
AND used = false;
```

**Expected Result:**
- Query execution time < 5ms
- Index on token column is used
- Efficient query plan

---

## Security Audit

### Security Checklist

- [ ] Tokens are cryptographically random
- [ ] Tokens expire after 24 hours
- [ ] Used tokens cannot be reused
- [ ] Users can only see own tokens (RLS)
- [ ] Old tokens are cleaned up regularly
- [ ] No sensitive data in URLs
- [ ] HTTPS enforced in production
- [ ] Email doesn't reveal user existence
- [ ] Rate limiting prevents abuse
- [ ] Tokens are long enough (secure)

---

## Automated Testing

### Sample Test Script

```javascript
// Cypress test example
describe('Password Reset Flow', () => {
  it('should complete password reset successfully', () => {
    cy.visit('/login');
    cy.contains('Forgot your password?').click();
    cy.url().should('include', '/forgot-password');

    cy.get('input[type="email"]').type('test@example.com');
    cy.contains('Send Reset Link').click();

    cy.contains('Check Your Email').should('be.visible');
    cy.contains('test@example.com').should('be.visible');
  });
});
```

---

## Conclusion

If all tests pass:
- ✅ Password reset system is fully functional
- ✅ Security measures are in place
- ✅ User experience is smooth
- ✅ Email delivery works
- ✅ Database is properly configured

Your password reset system is production-ready!

---

## Support Resources

**Supabase Auth Documentation:**
- https://supabase.com/docs/guides/auth/passwords

**Password Reset Best Practices:**
- Use secure random tokens
- Expire tokens after reasonable time
- Invalidate old tokens on new request
- Don't reveal user existence
- Log all password reset attempts
- Implement rate limiting in production

**Need Help?**
- Check Supabase Auth logs
- Review email_notification_log table
- Verify password_reset_tokens table
- Test with different email providers
- Check browser console for errors
