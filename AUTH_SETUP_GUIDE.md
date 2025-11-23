# Authentication Setup Guide for Local Development

## Issue Fixed
The URI mismatch error (400) has been resolved by updating the OAuth callback handler to use the proper PKCE flow with `exchangeCodeForSession()`.

## Changes Made

### 1. Updated `/app/app/auth/callback/page.js`
- ✅ Added proper PKCE flow handling with `exchangeCodeForSession()`
- ✅ Added support for authorization code from URL parameters
- ✅ Added fallback to session check if no code is present
- ✅ Improved error handling and user feedback

### 2. Updated `/app/lib/supabase.js`
- ✅ Added `flowType: 'pkce'` to Supabase client configuration
- ✅ This enables the more secure PKCE OAuth flow

## Required Configuration

### Supabase Configuration
You need to configure these URLs in your Supabase project:

1. Go to **Supabase Dashboard** → Your Project → **Authentication** → **URL Configuration**

2. Set the following URLs:

   **Site URL:**
   ```
   http://localhost:3000
   ```

   **Redirect URLs (add both):**
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/
   ```

### Google Cloud Console Configuration
You need to configure these in your Google Cloud Console:

1. Go to **Google Cloud Console** → **APIs & Services** → **Credentials**

2. Select your OAuth 2.0 Client ID (or create one if you haven't)

3. Under **Authorized JavaScript origins**, add:
   ```
   http://localhost:3000
   ```

4. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000/auth/callback
   https://kvidydsfnnrathhpuxye.supabase.co/auth/v1/callback
   ```
   
   ⚠️ **Important:** You need BOTH redirect URIs:
   - Your app's callback URL: `http://localhost:3000/auth/callback`
   - Supabase's callback URL: `https://kvidydsfnnrathhpuxye.supabase.co/auth/v1/callback`

### Supabase Google Provider Setup

1. Go to **Supabase Dashboard** → Your Project → **Authentication** → **Providers**

2. Enable **Google** provider

3. Add your Google OAuth credentials:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)

4. Make sure the provider is enabled (toggle should be ON)

## Testing the Authentication Flow

### Test Google Sign-In:

1. Open your browser to `http://localhost:3000`
2. Navigate to the login page
3. Click the "Google" button
4. You should be redirected to Google's sign-in page
5. After signing in with Google, you should be redirected back to `http://localhost:3000/auth/callback`
6. The callback page will:
   - Show a loading spinner with "Authenticating..."
   - Exchange the authorization code for a session
   - Check if you have a profile
   - Redirect you to `/auth/form` (if no profile) or `/home` (if profile exists)

### Expected Flow:

```
Login Page (/auth/login)
    ↓ (Click Google button)
Google Sign-In Page
    ↓ (Sign in with Google)
Callback Page (/auth/callback) 
    ↓ (Exchange code for session)
Profile Check
    ↓
/auth/form (no profile) OR /home (has profile)
```

## Troubleshooting

### Still Getting 400 Error?

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Check for any error messages
   - Look for the actual redirect URL being used

2. **Verify Redirect URLs Match Exactly:**
   - In Supabase: `http://localhost:3000/auth/callback`
   - In Google Console: Both `http://localhost:3000/auth/callback` AND `https://kvidydsfnnrathhpuxye.supabase.co/auth/v1/callback`
   - Make sure there are no trailing slashes or typos

3. **Check Supabase Provider Status:**
   - Make sure Google provider is enabled in Supabase
   - Verify Client ID and Client Secret are correctly entered

4. **Clear Browser Cache:**
   ```bash
   # Or use Ctrl+Shift+Delete in browser
   ```
   - Clear cookies and cached data for localhost:3000
   - Try in an incognito/private window

5. **Check Environment Variables:**
   - Verify `.env` file has correct Supabase URL and key:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://kvidydsfnnrathhpuxye.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

6. **Restart Development Server:**
   ```bash
   # The server should auto-restart with hot reload, but if issues persist:
   sudo supervisorctl restart nextjs
   ```

### Error Messages and Solutions:

| Error | Possible Cause | Solution |
|-------|---------------|----------|
| "URI mismatch: redirect_uri" | Google Console redirect URI not configured | Add both callback URLs to Google Console |
| "Invalid redirect URL" | Supabase redirect URL not whitelisted | Add callback URL to Supabase URL Configuration |
| "Authentication failed" | Code exchange failed | Check that PKCE flow is enabled in Supabase client |
| "Provider not enabled" | Google provider not enabled | Enable Google provider in Supabase dashboard |
| Session not persisting | Auto-refresh or persist settings | Already configured in `/app/lib/supabase.js` |

## Key Points

✅ **PKCE Flow:** The app now uses PKCE (Proof Key for Code Exchange) flow, which is more secure and recommended for SPAs

✅ **Code Exchange:** The callback page properly exchanges the authorization code for a session token

✅ **Error Handling:** Better error messages are displayed to users if authentication fails

✅ **Localhost Support:** Everything is configured to work with `http://localhost:3000`

## Next Steps After Fixing

Once authentication is working:

1. **Test Sign-Up Flow:**
   - Go to `/auth/sign-up`
   - Test both email/password and Google sign-up
   - Verify OTP flow for email sign-up

2. **Test Profile Creation:**
   - After first sign-in, you should be redirected to `/auth/form`
   - Fill out the profile form
   - Verify it saves to Supabase database

3. **Test Session Persistence:**
   - Sign in
   - Refresh the page
   - Verify you stay logged in

4. **Test Sign Out:**
   - From home page, sign out
   - Verify you're redirected to login

## Support

If you're still experiencing issues after following this guide:

1. Check the browser console for specific error messages
2. Check the callback page URL - does it have a `code` parameter?
3. Verify all URLs in Supabase and Google Console match exactly
4. Try with a different Google account
5. Test in an incognito/private browser window

---

**Last Updated:** Configuration for localhost:3000 with PKCE flow
