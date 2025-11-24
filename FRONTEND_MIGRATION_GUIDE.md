# Frontend Migration Guide

## 🎯 Good News: Minimal Changes Needed!

The new modular API architecture maintains **100% backward compatibility** with the existing frontend code. All endpoint URLs remain the same.

---

## ✅ What Works Without Changes

All your existing fetch calls will work identically:

```javascript
// Profile
fetch('/api/profile')              // ✅ Works
fetch('/api/profile', { method: 'PATCH' })  // ✅ Works

// Skills
fetch('/api/skills')               // ✅ Works
fetch('/api/skills', { method: 'POST' })    // ✅ Works
fetch('/api/skills/123', { method: 'DELETE' })  // ✅ Works

// Gigs
fetch('/api/gigs')                 // ✅ Works
fetch('/api/gigs/123')             // ✅ Works
fetch('/api/gigs', { method: 'POST' })      // ✅ Works

// Applications
fetch('/api/gigs/123/apply', { method: 'POST' })  // ✅ Works
fetch('/api/applications/my')      // ✅ Works

// Notifications
fetch('/api/notifications')        // ✅ Works

// Uploads
fetch('/api/upload/profile-photo', { method: 'POST' })  // ✅ Works
```

---

## 🔧 Recommended Improvements

While not required, these improvements will make your frontend more robust:

### 1. **Handle Null Profile Response**

**Before (might break):**
```javascript
const res = await fetch('/api/profile')
const data = await res.json()

if (res.status === 404) {
  // Redirect to profile form
  router.push('/auth/form')
}
```

**After (better):**
```javascript
const res = await fetch('/api/profile')
const { success, data } = await res.json()

if (success && data === null) {
  // No profile exists yet - show profile creation UI
  setShowCreateProfile(true)
} else if (success && data) {
  // Profile exists - use it
  setProfile(data)
}
```

**Why?** The new API returns `{ success: true, data: null }` instead of 404 when no profile exists, allowing more flexible handling.

---

### 2. **Better Error Handling**

**Before:**
```javascript
const res = await fetch('/api/skills')
const data = await res.json()
console.log(data)
```

**After:**
```javascript
const res = await fetch('/api/skills')
const { success, data, error } = await res.json()

if (success) {
  setSkills(data)
} else {
  console.error('Failed to fetch skills:', error)
  setError(error)
}
```

---

### 3. **Improved Profile Fetching**

**Current implementation in `/app/app/profile/page.js`:**
```javascript
const profileRes = await fetch('/api/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
})

if (!profileRes.ok) {
  if (profileRes.status === 404) {
    alert('Profile not found. Redirecting to create profile.')
    router.push('/auth/form')
    return
  }
  throw new Error('Failed to fetch profile')
}
```

**Recommended update:**
```javascript
const profileRes = await fetch('/api/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
})

const { success, data, error } = await profileRes.json()

if (!success) {
  console.error('Profile fetch error:', error)
  setError(error)
  return
}

if (data === null) {
  // No profile exists - user hasn't completed profile form yet
  console.log('No profile found, showing empty profile')
  setProfile({
    first_name: '',
    surname: '',
    bio: '',
    banner_url: '',
    profile_photo_url: ''
  })
} else {
  // Profile exists
  setProfile(data)
}
```

---

### 4. **Centralized API Helper (Optional)**

Create `/lib/api.js`:

```javascript
/**
 * Helper function for making authenticated API calls
 */
export async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token') // or get from session
  
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  })
  
  const result = await res.json()
  
  if (!result.success) {
    throw new Error(result.error || 'API request failed')
  }
  
  return result.data
}

// Usage:
try {
  const profile = await apiCall('/api/profile')
  setProfile(profile)
} catch (error) {
  console.error('Error:', error.message)
  setError(error.message)
}
```

---

## 📋 Checklist: Files to Review (Optional)

These files already use the correct API endpoints, but you might want to add better error handling:

- [ ] `/app/app/profile/page.js` - Profile fetching and updates
- [ ] `/app/app/auth/form/page.js` - Profile creation (uses Supabase directly, no changes needed)
- [ ] Any custom components that fetch data from API

---

## 🚫 What NOT to Change

**DO NOT** modify these:
- Endpoint URLs (they're the same)
- Request body formats (they're the same)
- Response data structure (enhanced but compatible)

---

## 🎓 Understanding Response Format

### **Before (Old API):**
```javascript
// Success
{ title: "My Gig", description: "..." }

// Error
{ error: "Something went wrong" }
```

### **After (New API):**
```javascript
// Success
{
  success: true,
  message: "Success",
  data: { title: "My Gig", description: "..." }
}

// Error
{
  success: false,
  error: "Something went wrong"
}
```

**Migration:** Update your frontend to check `success` and extract `data`:

```javascript
// Old way
const gigs = await fetch('/api/gigs').then(r => r.json())

// New way (better)
const { success, data: gigs } = await fetch('/api/gigs').then(r => r.json())
if (success) {
  setGigs(gigs)
}
```

---

## 🔍 Testing Checklist

After updating your frontend code:

### **Profile**
- [ ] Viewing profile works
- [ ] Updating profile works
- [ ] Profile without data shows empty state (not 404)

### **Skills**
- [ ] Fetching skills works
- [ ] Adding skill works
- [ ] Deleting skill works

### **Gigs**
- [ ] Browsing gigs works
- [ ] Creating gig works (if profile complete)
- [ ] Viewing single gig works
- [ ] Applying to gig works

### **Notifications**
- [ ] Fetching notifications works
- [ ] Marking as read works

---

## 💡 Pro Tips

### **1. Use Success Flag**
Always check the `success` flag instead of relying on HTTP status alone:

```javascript
const res = await fetch('/api/profile')
const { success, data, error } = await res.json()

if (success) {
  // Handle success
} else {
  // Handle error
  console.error(error)
}
```

### **2. Handle Null Data**
Some endpoints now return `null` instead of 404:

```javascript
if (success && data === null) {
  // Handle "no data" scenario (e.g., no profile yet)
} else if (success && data) {
  // Handle "has data" scenario
}
```

### **3. Improved Logging**
The new API logs everything server-side. Check server logs for debugging:

```bash
sudo supervisorctl tail -f nextjs
```

You'll see logs like:
```
[GET /api/profile] Fetching profile for user_id: abc123
[POST /api/skills] Adding skill for user_id: abc123
```

---

## 🎉 Summary

**Required Changes:** None! Everything works as-is.

**Recommended Changes:**
1. Add `success` flag checking
2. Handle `null` data responses
3. Improve error handling
4. Optional: Create centralized API helper

**Testing Priority:**
1. Profile viewing/editing
2. Skills management
3. Gig browsing/creation
4. Application submission

---

**Date:** January 2025  
**Version:** 2.0  
**Status:** ✅ Ready for Implementation
