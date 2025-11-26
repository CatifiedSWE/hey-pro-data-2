# Authentication Flow Analysis - HeyProData

## Table of Contents
1. [Routing Logic](#routing-logic)
2. [Unauthorized Access Prevention](#unauthorized-access-prevention)
3. [Form Page Logic](#form-page-logic)
4. [Actionable Implementation Plan](#actionable-implementation-plan)

---

## 1. Routing Logic

### Root Page (`/app/page.js`)
**Purpose**: Entry point that routes users based on authentication status

```javascript
// Flow:
1. Check session: supabase.auth.getSession()
2. If session exists:
   - Query user_profiles table for profile
   - Profile exists → redirect to /home
   - No profile → redirect to /auth/form
3. If no session:
   - Redirect to /auth/login
```

**Key Implementation Details**:
- Uses `maybeSingle()` to avoid errors when profile doesn't exist
- Shows loading spinner during check
- Catches errors and defaults to login redirect

---

### Login Page (`/app/auth/login/page.js`)
**Purpose**: Authenticate users with email/password or OAuth

```javascript
// On Page Load:
1. Check if user already has active session
2. If session exists:
   - Check for profile
   - Mark auth verified: sessionStorage.setItem('heyprodata-auth-verified', 'true')
   - Profile exists → redirect to /home
   - No profile → redirect to /auth/form

// On Form Submit:
1. Set storage preference (localStorage vs sessionStorage)
2. Normalize email to lowercase
3. Call supabase.auth.signInWithPassword()
4. On success:
   - Set 'heyprodata-auth-verified' flag
   - Check profile existence
   - Redirect accordingly

// OAuth Flow:
1. Set storage preference to true (keep logged in)
2. Call supabase.auth.signInWithOAuth()
3. Redirect to /auth/callback for processing
```

**Key Features**:
- "Keep me logged in" checkbox controls storage type
- Email normalization prevents case-sensitive issues
- User-friendly error messages for common failures
- Auto-redirects authenticated users

---

### Sign Up Page (`/app/auth/sign-up/page.js`)
**Purpose**: Create new user accounts

```javascript
// On Page Load:
1. Check if user already logged in
2. If session exists → redirect to home or form

// On Form Submit:
1. Validate password requirements
2. Normalize email to lowercase
3. Call supabase.auth.signUp()
4. Handle two scenarios:
   - Email confirmation required → redirect to /auth/otp
   - Auto-confirmed → redirect to /auth/form

// OAuth Sign Up:
- Same flow as OAuth login
- Uses /auth/callback
```

**Key Features**:
- Real-time password validation (8+ chars, uppercase, number, special char)
- Duplicate email detection
- Handles both OTP and auto-confirm configurations

---

### Callback Page (`/app/auth/callback/page.js`)
**Purpose**: Process OAuth authentication redirects

```javascript
// Main Flow:
1. Extract 'code' parameter from URL
2. Exchange code for session: supabase.auth.exchangeCodeForSession()
3. Set storage preference to true (OAuth defaults to keep logged in)
4. Set 'heyprodata-auth-verified' flag
5. Check profile and redirect using separate function

// Isolated Profile Check Function:
checkProfileAndRedirect(userId) {
  - Query user_profiles table
  - No profile → redirect to /auth/form
  - Profile exists → redirect to /home
  - Errors treated as "no profile" (non-blocking)
}
```

**Key Features**:
- Handles PKCE OAuth flow
- Isolated error handling for profile checks
- Profile errors don't block authentication flow
- Shows loading state during processing

---

### Form Page (`/app/auth/form/page.js`)
**Purpose**: Collect required user profile information

```javascript
// On Mount:
1. Check authentication
2. If no session → redirect to /auth/login
3. If profile exists → redirect to /home
4. Otherwise → show form

// On Submit:
1. Validate all required fields (firstName, surname, country, city)
2. Insert into user_profiles table with correct field names:
   - first_name (not legal_first_name)
   - surname (not legal_surname)
   - alias_first_name (optional)
   - alias_surname (optional)
   - country
   - city
3. Set 'heyprodata-auth-verified' flag
4. Redirect to /home
```

**Key Features**:
- Only accessible to authenticated users
- Prevents duplicate profile creation
- Uses correct database field names
- Real-time form validation

---

### Home Page (`/app/app/home/page.js`)
**Purpose**: Main application dashboard (protected route)

```javascript
// Authentication Check:
1. Check sessionStorage flag 'heyprodata-auth-verified'
2. If verified → skip loading (one-time check optimization)
3. If not verified:
   - Check session
   - No session → redirect to /auth/login
   - Check profile existence
   - No profile → redirect to /auth/form
   - Set verified flag for session
   - Show home page
```

**Key Features**:
- One-time auth check per browser session
- Prevents loading screen flash on navigation
- Requires both authentication AND profile completion
- Falls back to login on any error

---

## 2. Unauthorized Access Prevention

### Session-Based Protection
All protected pages implement this pattern:

```javascript
useEffect(() => {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/auth/login')  // Redirect unauthorized users
      return
    }
    
    // Additional checks (profile, permissions, etc.)
  }
  
  checkAuth()
}, [router])
```

### Multi-Layer Protection

**Layer 1: Client-Side Route Guards**
- Every protected page checks session on mount
- Immediate redirect if unauthorized
- Prevents UI flash of protected content

**Layer 2: Profile Completion Check**
- Session exists but no profile → redirect to /auth/form
- Ensures data integrity
- Guides user through onboarding

**Layer 3: Database RLS (Row-Level Security)**
- Supabase enforces RLS policies at database level
- Users can only access their own data
- Automatic security through authenticated user context
- No custom API layer needed - direct client-to-Supabase calls

### Session Persistence Strategy

**AdaptiveStorage Class** (`/app/lib/supabase.js`):
```javascript
// Determines storage type based on user preference
getStorage() {
  const keepLoggedIn = sessionStorage/localStorage.getItem('heyprodata-keep-logged-in')
  return keepLoggedIn ? localStorage : sessionStorage
}

// PKCE keys always use localStorage
setItem(key, value) {
  if (key.includes('pkce') || key.includes('code-verifier')) {
    localStorage.setItem(key, value)  // Required for OAuth
  } else {
    this.getStorage().setItem(key, value)
  }
}
```

**Storage Behavior**:
- `localStorage`: Session persists after browser close (keep me logged in = true)
- `sessionStorage`: Session expires when browser closes (keep me logged in = false)
- PKCE/OAuth keys: Always in localStorage (technical requirement)

### One-Time Auth Verification
Optimization to prevent multiple loading screens:

```javascript
// First access in browser session:
1. Full authentication check
2. Profile verification
3. Set flag: sessionStorage.setItem('heyprodata-auth-verified', 'true')

// Subsequent page navigations in same session:
1. Check flag exists
2. Skip full auth check
3. No loading screen flash

// Flag cleared when:
- Browser tab/window closed (sessionStorage nature)
- User logs out
- Session expires
```

### Protected Route Checklist
Every protected page MUST implement:
- ✅ Session check on mount using `supabase.auth.getSession()`
- ✅ Redirect to login if no session
- ✅ Profile check via direct Supabase query if profile required
- ✅ Error handling with fallback redirect
- ✅ Loading state during verification
- ✅ Direct database queries using authenticated Supabase client

---

## 3. Form Page Logic

### Complete Form Page Flow

#### Step 1: Initial Load & Authentication Check
```javascript
useEffect(() => {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    // GUARD 1: No session
    if (!session) {
      router.push('/auth/login')
      return
    }
    
    setCurrentUser(session.user)
    
    // GUARD 2: Profile already exists
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()
    
    if (profile) {
      router.push('/home')  // Already completed, go to home
    }
  }
  
  checkAuth()
}, [router])
```

**Guards**:
1. **No Session**: Redirect to login (user must be authenticated first)
2. **Profile Exists**: Redirect to home (prevent duplicate profile creation)

#### Step 2: Form Validation
```javascript
// Real-time validation
const isFormValid = 
  formData.firstName.trim() !== '' && 
  formData.surname.trim() !== '' && 
  formData.country !== '' && 
  formData.city.trim() !== ''

// Button state
<button disabled={!isFormValid || loading}>
  {loading ? 'Creating profile...' : 'Create your profile'}
</button>
```

**Required Fields**:
- First Name (legal name)
- Surname (legal name)
- Country (dropdown selection)
- City (text input)

**Optional Fields**:
- Alias First Name
- Alias Surname

#### Step 3: Form Submission & Database Insert
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  
  // Insert profile with correct field names
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([{
      user_id: currentUser.id,
      first_name: formData.firstName.trim(),        // Database field name
      surname: formData.surname.trim(),             // Database field name
      alias_first_name: formData.aliasFirstName.trim() || null,
      alias_surname: formData.aliasSurname.trim() || null,
      country: formData.country,
      city: formData.city.trim()
    }])
    .select()
  
  if (error) {
    setError(error.message)
    return
  }
  
  // Success: Mark auth verified and redirect
  sessionStorage.setItem('heyprodata-auth-verified', 'true')
  router.push('/home')
}
```

**Database Schema Mapping**:
```
Form Field          →  Database Column
-----------------------------------------
firstName           →  first_name
surname             →  surname
aliasFirstName      →  alias_first_name
aliasSurname        →  alias_surname
country             →  country
city                →  city
currentUser.id      →  user_id (foreign key to auth.users)
```

#### Step 4: Post-Submission
```javascript
// On success:
1. Set verified flag: sessionStorage.setItem('heyprodata-auth-verified', 'true')
2. Redirect to /home
3. Home page will detect verified flag and skip loading screen

// On error:
1. Display error message in UI
2. Keep user on form page
3. Allow retry
```

### Form Page State Management
```javascript
// Form State
const [formData, setFormData] = useState({
  firstName: '',
  surname: '',
  aliasFirstName: '',
  aliasSurname: '',
  country: '',
  city: ''
})

// UI State
const [loading, setLoading] = useState(false)      // Submit in progress
const [error, setError] = useState('')             // Error message
const [currentUser, setCurrentUser] = useState(null)  // Authenticated user object
```

### How Form is Checked
1. **Client-Side Validation**: Real-time check of required fields
2. **Database Constraint**: user_id is unique (prevents duplicates)
3. **RLS Policy**: Only authenticated user can insert their own profile
4. **Supabase Response**: Returns inserted data or error
5. **Error Handling**: Shows user-friendly messages

### Edge Cases Handled
✅ User navigates back to form after profile created → Redirect to home
✅ User loses session during form → Redirect to login
✅ Database insert fails → Show error, allow retry
✅ User refreshes page → Re-check auth and profile status
✅ User closes browser during form → Data not saved (expected behavior)

---

## 4. Actionable Implementation Plan

### Goal
Implement robust authentication flow with proper routing, unauthorized access prevention, and profile completion requirements.

---

### Step 1: Set Up Supabase Client with Adaptive Storage
**File**: `/app/lib/supabase.js`

```javascript
// Create AdaptiveStorage class that:
1. Switches between localStorage/sessionStorage based on user preference
2. Always uses localStorage for PKCE/OAuth keys
3. Provides getItem, setItem, removeItem methods

// Initialize Supabase client with:
- autoRefreshToken: true
- persistSession: true
- detectSessionInUrl: true
- storage: adaptiveStorage instance

// Export helper: setStoragePreference(keepLoggedIn)
```

**Why**: Enables "Keep me logged in" functionality while supporting OAuth flows.

---

### Step 2: Create Root Router Page
**File**: `/app/page.js`

```javascript
// On mount:
1. Get current session
2. If no session → redirect to /auth/login
3. If session exists:
   a. Query user_profiles table
   b. Profile exists → redirect to /home
   c. No profile → redirect to /auth/form
4. Show loading spinner during check
5. Catch all errors → redirect to login
```

**Why**: Intelligent routing based on auth state prevents dead ends.

---

### Step 3: Implement Login Page with Auto-Redirect
**File**: `/app/auth/login/page.js`

```javascript
// On mount:
1. Check if user already logged in
2. If logged in:
   a. Set verified flag
   b. Check profile
   c. Redirect appropriately

// On email/password login:
1. Set storage preference
2. Normalize email
3. Call signInWithPassword
4. Set verified flag
5. Check profile and redirect

// On OAuth login:
1. Set storage preference to true
2. Call signInWithOAuth with callback URL
3. Redirect to callback page

// Handle errors with user-friendly messages
```

**Why**: Prevents showing login to already-authenticated users. Sets up session properly.

---

### Step 4: Implement Sign Up Page
**File**: `/app/auth/sign-up/page.js`

```javascript
// On mount:
- Check if already logged in → redirect

// Form validation:
1. Password must have:
   - 8+ characters
   - 1 uppercase letter
   - 1 number
   - 1 special character
2. Real-time validation feedback

// On submit:
1. Normalize email
2. Call supabase.auth.signUp
3. Handle two scenarios:
   - Email confirmation required → /auth/otp
   - Auto-confirmed → /auth/form
4. Detect duplicate email → show friendly error

// OAuth sign up:
- Same as OAuth login
```

**Why**: Creates new users with proper validation. Handles OTP flow.

---

### Step 5: Create OAuth Callback Handler
**File**: `/app/auth/callback/page.js`

```javascript
// Main flow:
1. Extract code from URL params
2. Exchange code for session
3. Set storage preference to true
4. Set verified flag
5. Call isolated profile check function

// checkProfileAndRedirect function:
1. Query user_profiles
2. Handle errors gracefully (non-blocking)
3. No profile → /auth/form
4. Profile exists → /home

// Show loading during processing
// Show error only for genuine auth failures
```

**Why**: Completes OAuth flow. Isolates profile errors from auth errors.

---

### Step 6: Build Profile Form Page
**File**: `/app/auth/form/page.js`

```javascript
// On mount:
1. Check session → redirect to login if none
2. Get current user
3. Check if profile exists → redirect to home if yes

// Form fields:
- Required: firstName, surname, country, city
- Optional: aliasFirstName, aliasSurname

// Real-time validation:
- Button disabled until all required fields filled

// On submit:
1. Insert into user_profiles using CORRECT field names:
   - first_name (not legal_first_name)
   - surname (not legal_surname)
2. Set verified flag
3. Redirect to /home

// Error handling:
- Show error message
- Allow retry
```

**Why**: Collects required profile data. Prevents unauthorized/duplicate access.

---

### Step 7: Protect Home Page
**File**: `/app/app/home/page.js`

```javascript
// On mount:
1. Check verified flag in sessionStorage
2. If verified → skip loading (optimization)
3. If not verified:
   a. Check session → redirect to login if none
   b. Check profile → redirect to form if none
   c. Set verified flag
   d. Show home page

// Show loading only on first access
// All errors → redirect to login
```

**Why**: Protects main app. Optimizes UX with one-time check.

---

### Step 8: Add Session Verification Flag
**Storage Key**: `heyprodata-auth-verified`

```javascript
// Set flag after successful auth:
sessionStorage.setItem('heyprodata-auth-verified', 'true')

// Check flag before full auth check:
const authVerified = sessionStorage.getItem('heyprodata-auth-verified')
if (authVerified === 'true') {
  // Skip full check, no loading screen
}

// Flag automatically cleared when:
- Browser tab closed (sessionStorage nature)
- Session expires
- User logs out
```

**Why**: Prevents loading screen flash on every navigation. Better UX.

---

### Step 9: Implement Keep Me Logged In
**Files**: All auth pages

```javascript
// Login page:
- Checkbox for "Keep me logged in"
- On submit: setStoragePreference(formData.keepLoggedIn)

// OAuth flows:
- Always set to true: setStoragePreference(true)

// AdaptiveStorage handles:
- keepLoggedIn = true → localStorage (persists)
- keepLoggedIn = false → sessionStorage (expires)
- PKCE keys → always localStorage
```

**Why**: Gives users control over session duration.

---

### Implementation Checklist

**Authentication Core**:
- ✅ AdaptiveStorage class with localStorage/sessionStorage switching
- ✅ PKCE key handling in localStorage
- ✅ Session persistence based on user preference

**Routing & Access Control**:
- ✅ Root page intelligent routing
- ✅ Login page with auto-redirect
- ✅ Sign up page with validation
- ✅ OAuth callback handler
- ✅ Form page with guards
- ✅ Protected home page

**User Experience**:
- ✅ One-time auth check optimization
- ✅ Keep me logged in functionality
- ✅ Email normalization
- ✅ User-friendly error messages
- ✅ Loading states

**Security**:
- ✅ Session checks on all protected routes
- ✅ Profile completion verification
- ✅ API token authentication
- ✅ RLS policies in database
- ✅ Duplicate profile prevention

---

### Testing Scenarios

**Scenario 1: New User Email Sign Up**
1. Visit root → redirected to login
2. Click "Sign up"
3. Enter email/password → redirected to OTP
4. Enter OTP → redirected to form
5. Complete form → redirected to home
6. Refresh page → stay on home (no loading)

**Scenario 2: OAuth Sign Up**
1. Visit root → redirected to login
2. Click "Google" → OAuth flow
3. Authorize → redirected to callback
4. Callback → redirected to form (no profile yet)
5. Complete form → redirected to home

**Scenario 3: Returning User (Keep Logged In = True)**
1. Close browser
2. Open browser again
3. Visit root → detect session
4. Profile exists → redirected to home immediately

**Scenario 4: Returning User (Keep Logged In = False)**
1. Close browser
2. Open browser again
3. Visit root → no session (expired)
4. Redirected to login

**Scenario 5: Unauthorized Access Attempt**
1. User not logged in
2. Manually navigate to /home
3. Session check fails
4. Redirected to login

**Scenario 6: Incomplete Profile**
1. User logged in but no profile
2. Navigate to /home
3. Profile check fails
4. Redirected to form

---

### Quick Reference: Auth Flow Decision Tree

```
┌─────────────────┐
│   User visits   │
│   any page      │
└────────┬────────┘
         │
         ▼
  ┌──────────────┐
  │ Has session? │
  └──────┬───────┘
         │
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    │         └─────► /auth/login
    │
    ▼
┌─────────────────┐
│ Has profile in  │
│ user_profiles?  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    │         └─────► /auth/form
    │
    ▼
  /home
(Main App)
```

---

### Key Takeaways

1. **Multi-Layer Security**: Client-side guards + API auth + RLS
2. **Smart Routing**: Always route based on current auth state
3. **Session Optimization**: One-time check prevents UX issues
4. **Storage Strategy**: Adaptive storage supports both persistence modes
5. **Error Isolation**: Profile errors don't block authentication
6. **Field Name Accuracy**: Use correct DB column names (first_name, not legal_first_name)

---

## End of Analysis
This document provides complete understanding of authentication flow and actionable steps for implementation or modification.
