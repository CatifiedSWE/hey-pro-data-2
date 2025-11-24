# Profile Page Testing Guide

## Overview
This directory contains comprehensive tests for the profile page and related API endpoints to diagnose and fix the 404 error issue.

## Test Files

### 1. `test_profile_routes.sh` - Quick Route Diagnostic
**Purpose:** Quickly test if API routes are accessible and responding correctly

**Usage:**
```bash
cd /app/tests
./test_profile_routes.sh
```

**What it tests:**
- ✅ Route existence (checks for 404 vs 401 errors)
- ✅ API endpoint accessibility
- ✅ Server status
- ✅ File structure validation

**Expected Results:**
- Protected routes (like `/api/profile`) should return **401 Unauthorized**, NOT 404
- Public routes (like `/api/gigs`) should return **200 OK**
- Invalid routes should return **404 Not Found**

**Red Flags:**
- ❌ If `/api/profile` returns 404 → Routing configuration issue
- ❌ If server not responding → Next.js service not running

---

### 2. `test_profile_api.py` - Comprehensive API Testing
**Purpose:** Full end-to-end testing of profile API with real authentication

**Usage:**
```bash
cd /app/tests
python3 test_profile_api.py
```

**What it tests:**
- ✅ User authentication with Supabase
- ✅ GET /api/profile - Fetch user profile
- ✅ PATCH /api/profile - Update profile
- ✅ GET /api/profile/check-complete - Profile completeness check
- ✅ GET /api/skills - Fetch user skills
- ✅ Profile data structure validation

**Prerequisites:**
- Valid user credentials (email & password)
- User must have completed profile setup
- Supabase environment variables set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Interactive Input:**
The script will prompt you for:
1. Email address of test user
2. Password of test user

**Test Output:**
```
🧪 Test: Authenticating User
✅ Authentication successful!
ℹ️  User ID: abc123...

🧪 Test: GET /api/profile - Fetch user profile
📥 Response Status: 200
📦 Response Data:
{
  "success": true,
  "data": {
    "user_id": "abc123...",
    "legal_first_name": "John",
    "legal_surname": "Doe",
    ...
  }
}
✅ Profile fetched successfully!
```

---

## Common Issues & Solutions

### Issue 1: Profile Page Returns 404
**Symptom:** Accessing `/profile` page shows 404 error

**Possible Causes:**
1. **Routing Issue:** The catch-all API route `[[...path]]/route.js` is not matching `/profile` correctly
2. **Server Not Running:** Next.js development server is down
3. **Build Issue:** Next.js needs to be rebuilt

**Diagnosis:**
```bash
# Run the route test
./test_profile_routes.sh

# Check if profile route returns 404
# If yes, it's a routing problem
```

**Solutions:**
- Check `/app/app/api/[[...path]]/route.js` has proper route matching
- Restart Next.js: `sudo supervisorctl restart nextjs`
- Check server logs: `tail -f /var/log/supervisor/nextjs.*.log`

---

### Issue 2: API Returns 404 for /api/profile
**Symptom:** Direct API call to `/api/profile` returns 404

**Diagnosis:**
```bash
curl http://localhost:3000/api/profile
# Should return 401 Unauthorized, NOT 404
```

**If you get 404:**
1. The catch-all route is not working
2. Check route.js at line where it handles `/profile`
3. Verify the route matching logic:
```javascript
if (route === '/profile' && method === 'GET') {
  return handleCORS(await handleGetProfile(request))
}
```

**Solutions:**
- Verify `/app/app/api/[[...path]]/route.js` exists
- Check that the main handler exports are present:
```javascript
export const GET = handleRoute
export const POST = handleRoute
export const PATCH = handleRoute
```
- Restart the server

---

### Issue 3: Profile Data Not Found (404 from API)
**Symptom:** API call works but returns 404 with "Profile not found"

**Cause:** User profile doesn't exist in Supabase `user_profiles` table

**Diagnosis:**
Run the comprehensive test:
```bash
python3 test_profile_api.py
```

Look for:
```
❌ Profile not found (404)
⚠️  This user may not have completed profile setup
```

**Solutions:**
1. User needs to complete profile at `/auth/form`
2. Check Supabase `user_profiles` table for user's record
3. Verify RLS policies allow user to read their own profile

---

### Issue 4: Authentication Fails
**Symptom:** Tests can't authenticate user

**Diagnosis:**
```bash
python3 test_profile_api.py
# Enter credentials
# Watch for authentication error
```

**Possible Causes:**
- Invalid credentials
- Supabase environment variables not set
- Supabase service down

**Solutions:**
1. Verify environment variables:
```bash
cat /app/.env | grep SUPABASE
```
2. Try logging in via UI first
3. Check Supabase dashboard for user status

---

## Running Tests Step-by-Step

### Step 1: Quick Diagnostic
```bash
cd /app/tests
./test_profile_routes.sh > diagnostic_results.txt
cat diagnostic_results.txt
```

This will tell you if routes are configured correctly.

### Step 2: Full API Test
```bash
cd /app/tests
python3 test_profile_api.py
```

Enter test user credentials when prompted.

### Step 3: Review Results
- ✅ **All tests pass**: Profile page should work
- ❌ **Route test fails**: Fix routing configuration
- ❌ **API test fails with 404**: Check profile data exists
- ❌ **Auth fails**: Check credentials and Supabase setup

---

## Expected Test Results

### ✅ Healthy System
```
TEST SUMMARY
Total Tests: 5
Passed: 5
Failed: 0
Pass Rate: 100.0%

🎉 All tests passed!
```

### ⚠️ Routing Issue
```
❌ FAIL - Route not found (404)
⚠️  This indicates a routing issue
```

### ⚠️ Profile Missing
```
❌ Profile not found (404)
⚠️  This user may not have completed profile setup
```

---

## Manual Testing Checklist

If automated tests don't reveal the issue, try manual testing:

1. **Test API Directly:**
```bash
# Should return 401, not 404
curl http://localhost:3000/api/profile

# With auth (replace TOKEN):
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/profile
```

2. **Test Profile Page:**
- Navigate to `http://localhost:3000/profile`
- Open browser console (F12)
- Check for errors in Network tab

3. **Check Server Logs:**
```bash
tail -f /var/log/supervisor/nextjs.*.log
```

4. **Verify File Structure:**
```bash
ls -la /app/app/api/[[...path]]/
ls -la /app/app/profile/
```

---

## Debugging Tips

### Enable Verbose Logging
In `/app/app/api/[[...path]]/route.js`, add logging:
```javascript
async function handleRoute(request) {
  const pathname = new URL(request.url).pathname
  const route = pathname.replace('/api', '')
  
  console.log(`[API] ${request.method} ${route}`)  // Add this
  // ... rest of handler
}
```

### Test with Browser DevTools
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to profile page
4. Look for failed requests
5. Check request URL and response

### Check Environment Variables
```bash
cat /app/.env | grep -E "(SUPABASE|MONGO|BASE_URL)"
```

---

## Support

If tests reveal issues you can't solve:

1. **Document the error:**
   - Which test failed
   - Error messages
   - Response codes

2. **Gather information:**
```bash
./test_profile_routes.sh > issue_report.txt
echo "\n\n=== Server Logs ===" >> issue_report.txt
tail -100 /var/log/supervisor/nextjs.*.log >> issue_report.txt
```

3. **Share the report:**
   - Provide `issue_report.txt`
   - Describe expected vs actual behavior
   - Include any console errors from browser

---

## Additional Resources

- **API Documentation:** `/app/API_DOCUMENTATION.md`
- **README:** `/app/README.md`
- **Profile Page Code:** `/app/app/profile/page.js`
- **API Routes:** `/app/app/api/[[...path]]/route.js`
- **Test Results:** `/app/test_result.md`

---

**Last Updated:** July 2025
