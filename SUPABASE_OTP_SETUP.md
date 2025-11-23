# Supabase OTP Configuration Guide

## 🎯 Objective
Configure Supabase to send a **6-digit OTP code** in the sign-up email instead of a confirmation link.

## ✅ Code Changes Applied

The sign-up flow has been updated to:
1. Remove `emailRedirectTo` parameter (no magic link needed)
2. Redirect users to OTP verification page after sign-up
3. Handle both confirmed and unconfirmed user states

## 🔧 Required Supabase Configuration

### Step 1: Enable Email OTP in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Email Templates**
3. Select **Confirm signup** template

### Step 2: Update Email Template to Include OTP Code

By default, Supabase sends a confirmation link. To send an OTP code instead, you need to modify the email template.

**Default Template (Link-based):**
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

**Updated Template (OTP-based):**
```html
<h2>Verify your email</h2>
<p>Thank you for signing up! Please use the following 6-digit code to verify your email address:</p>
<h1 style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; color: #FA6E80;">{{ .Token }}</h1>
<p style="text-align: center; color: #666;">This code will expire in 60 minutes.</p>
<p style="font-size: 12px; color: #999;">If you didn't request this code, please ignore this email.</p>
```

**Important:** 
- Use `{{ .Token }}` to display the 6-digit OTP code
- Style it prominently so users can easily see and copy it
- Include expiration time information

### Step 3: Configure Email Confirmation Settings

1. Go to **Authentication** → **Providers** → **Email**
2. Make sure **Enable email confirmations** is turned ON
3. Set **Email confirmation method** to:
   - ✅ **Email OTP** (sends 6-digit code)
   - ❌ NOT "Magic Link" (sends clickable link)

### Step 4: Set OTP Expiration (Optional)

1. Go to **Authentication** → **Settings**
2. Under **Email Settings**, you can configure:
   - **OTP Expiration Time**: Default is 3600 seconds (60 minutes)
   - Recommended: Keep default or set to 600 seconds (10 minutes) for better security

## 🧪 Testing the Flow

### 1. Test Sign-Up with OTP:

1. Go to `http://localhost:3000/auth/sign-up`
2. Enter email and password
3. Click "Sign up"
4. You should be redirected to `/auth/otp` page
5. Check your email for a 6-digit code (e.g., `123456`)
6. Enter the 6-digit code in the OTP page
7. Click "Verify Email"
8. You should be redirected to `/auth/form` to complete your profile

### 2. Expected Email Content:

**Subject:** Confirm Your Signup

**Body:**
```
Verify your email

Thank you for signing up! Please use the following 6-digit code to verify your email address:

123456

This code will expire in 60 minutes.

If you didn't request this code, please ignore this email.
```

## 🔄 Complete Sign-Up Flow

```
Sign-Up Page (/auth/sign-up)
    ↓ Enter email & password
    ↓ Click "Sign up"
Supabase creates unconfirmed user
    ↓ Sends email with 6-digit OTP
OTP Page (/auth/otp)
    ↓ User enters 6-digit code
    ↓ Click "Verify Email"
Supabase verifies OTP
    ↓ Confirms user account
Profile Form (/auth/form)
    ↓ Complete profile
Home Page (/home)
```

## ⚙️ Alternative Configuration (If Email OTP Option Not Available)

If your Supabase version doesn't have a specific "Email OTP" toggle:

### Option 1: Use Custom SMTP + Email Template

1. Configure custom SMTP in **Project Settings** → **Authentication**
2. Update the email template to show `{{ .Token }}` instead of `{{ .ConfirmationURL }}`
3. The token is always generated, you just need to display it in the email

### Option 2: Disable Email Confirmation (Not Recommended for Production)

1. Go to **Authentication** → **Providers** → **Email**
2. Turn OFF **Enable email confirmations**
3. This will auto-confirm users (skip OTP verification)

**Warning:** This is less secure and should only be used for development/testing.

## 🐛 Troubleshooting

### Issue: Still receiving confirmation links instead of OTP

**Solutions:**
1. Make sure you updated the email template with `{{ .Token }}`
2. Clear Supabase cache (restart Supabase project if needed)
3. Check that "Enable email confirmations" is ON
4. Verify the email template is saved correctly

### Issue: OTP not being sent

**Solutions:**
1. Check Supabase email logs: **Authentication** → **Logs**
2. Verify SMTP settings if using custom email provider
3. Check spam/junk folder for the OTP email
4. Make sure email confirmations are enabled in settings

### Issue: "Invalid OTP" error

**Solutions:**
1. Make sure you're entering exactly 6 digits
2. Check if OTP has expired (default: 60 minutes)
3. Use "Resend" button to get a new OTP
4. Verify the email address matches exactly

### Issue: User gets auto-logged in without OTP

**Solution:**
- This means email confirmation is disabled in Supabase
- Enable it in **Authentication** → **Providers** → **Email**

## 📧 Sample Email Templates

### Professional Template:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Poppins', Arial, sans-serif; background-color: #f8f8f8; }
    .container { max-width: 600px; margin: 40px auto; background: white; padding: 40px; border-radius: 16px; }
    .logo { text-align: center; margin-bottom: 30px; }
    h2 { color: #333; font-size: 24px; margin-bottom: 16px; }
    .otp-code { font-size: 36px; font-weight: bold; text-align: center; letter-spacing: 10px; color: #FA6E80; background: #f8f8f8; padding: 20px; border-radius: 12px; margin: 30px 0; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1><span style="color: #333;">HeyPro</span><span style="color: #00bcd4;">Data</span></h1>
    </div>
    <h2>Verify Your Email Address</h2>
    <p>Welcome to HeyProData! Please use the verification code below to complete your registration:</p>
    <div class="otp-code">{{ .Token }}</div>
    <p style="text-align: center; color: #666;">This code will expire in 60 minutes.</p>
    <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #856404; font-size: 14px;">🔒 For your security, never share this code with anyone.</p>
    </div>
    <div class="footer">
      <p>If you didn't create an account with HeyProData, please ignore this email.</p>
      <p>&copy; 2025 HeyProData. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

### Simple Template:
```html
<h2>Verify your email for HeyProData</h2>
<p>Enter this code to verify your email address:</p>
<h1 style="font-size: 40px; letter-spacing: 8px; text-align: center; color: #FA6E80;">{{ .Token }}</h1>
<p style="text-align: center; color: #666;">Valid for 60 minutes</p>
<p style="font-size: 12px; color: #999;">Didn't sign up? Ignore this email.</p>
```

## ✅ Verification Checklist

Before testing, make sure:

- [ ] Email template includes `{{ .Token }}`
- [ ] Email confirmations are enabled in Supabase
- [ ] SMTP is configured (or using Supabase default)
- [ ] OTP expiration time is reasonable (10-60 minutes)
- [ ] Sign-up page redirects to `/auth/otp`
- [ ] OTP page accepts 6 digits
- [ ] "Resend" functionality works

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Users receive an email with a 6-digit code after sign-up
- ✅ OTP verification page accepts the code
- ✅ Users are redirected to profile form after verification
- ✅ No errors in browser console
- ✅ User account is confirmed in Supabase dashboard

---

**Note:** If you continue to have issues, check the Supabase documentation for your specific plan and version, as the UI and features may vary.

**Supabase Docs:** https://supabase.com/docs/guides/auth/auth-email-otp
