# Authentication Integration Guide

Complete guide to integrating Supabase Authentication into your new frontend.

---

## 🎯 Overview

HeyProData uses **Supabase Authentication** with two methods:
1. **Email/Password + OTP Verification**
2. **Google OAuth with PKCE Flow**

### Key Features
- Adaptive session storage (localStorage/sessionStorage)
- "Keep me logged in" functionality
- One-time authentication check per session
- Automatic profile completion flow
- Secure token management

---

## 🔧 Setup Instructions

### Step 1: Install Dependencies

```bash
yarn add @supabase/supabase-js
```

### Step 2: Create Supabase Client Configuration

Create `/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Custom storage adapter for "Keep me logged in" functionality
class AdaptiveStorage {
  constructor() {
    this.preferenceKey = 'heyprodata-keep-logged-in';
  }

  getStorage() {
    if (typeof window === 'undefined') return null;
    
    const keepLoggedIn = sessionStorage.getItem(this.preferenceKey) === 'true' ||
                         localStorage.getItem(this.preferenceKey) === 'true';
    
    return keepLoggedIn !== false ? localStorage : sessionStorage;
  }

  getItem(key) {
    if (typeof window === 'undefined') return null;
    
    // Always check localStorage first for PKCE code verifier
    let item = localStorage.getItem(key);
    
    if (!item) {
      item = sessionStorage.getItem(key);
    }
    
    return item;
  }

  setItem(key, value) {
    if (typeof window === 'undefined') return;
    
    const storage = this.getStorage();
    
    // For PKCE-related keys, always store in localStorage
    if (key.includes('pkce') || key.includes('code-verifier')) {
      localStorage.setItem(key, value);
    } else {
      storage.setItem(key, value);
    }
  }

  removeItem(key) {
    if (typeof window === 'undefined') return;
    localStorage?.removeItem(key);
    sessionStorage?.removeItem(key);
  }
}

const adaptiveStorage = new AdaptiveStorage();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: adaptiveStorage
  }
});

// Helper function to set storage preference
export const setStoragePreference = (keepLoggedIn) => {
  if (typeof window === 'undefined') return;
  
  const key = 'heyprodata-keep-logged-in';
  
  if (keepLoggedIn) {
    localStorage.setItem(key, 'true');
    sessionStorage.setItem(key, 'true');
  } else {
    localStorage.removeItem(key);
    sessionStorage.setItem(key, 'false');
  }
};
```

### Step 3: Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kvidydsfnnrathhpuxye.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

---

## 🔐 Authentication Flows

### Flow 1: Email/Password Sign Up

```javascript
import { supabase, setStoragePreference } from '@/lib/supabase';
import { useState } from 'react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      // Set storage preference
      setStoragePreference(keepLoggedIn);

      // Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('This email is already registered. Please sign in.');
        } else {
          setError(signUpError.message);
        }
        return;
      }

      // Redirect to OTP verification page
      router.push(`/auth/otp?email=${encodeURIComponent(normalizedEmail)}`);

    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        minLength={8}
        required
      />
      
      <label>
        <input
          type="checkbox"
          checked={keepLoggedIn}
          onChange={(e) => setKeepLoggedIn(e.target.checked)}
        />
        Keep me logged in
      </label>
      
      {error && <p className="error">{error}</p>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
}
```

---

### Flow 2: OTP Verification

```javascript
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';

export default function OTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return; // Only numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 5);
    if (!/^[0-9]+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    setOtp(newOtp.concat(Array(5 - newOtp.length).fill('')));
    
    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5) - 1;
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const otpCode = otp.join('');

    try {
      const email = new URLSearchParams(window.location.search).get('email');

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'signup'
      });

      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      // Check if profile exists
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const profileResponse = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const profileData = await profileResponse.json();

      if (profileData.success && profileData.data) {
        // Profile exists, go to home
        router.push('/home');
      } else {
        // No profile, go to profile creation form
        router.push('/auth/form');
      }

    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="otp-inputs" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="otp-input"
          />
        ))}
      </div>
      
      {error && <p className="error">{error}</p>}
      
      <button type="submit" disabled={loading || otp.join('').length !== 5}>
        {loading ? 'Verifying...' : 'Verify'}
      </button>
    </form>
  );
}
```

---

### Flow 3: Email/Password Login

```javascript
import { supabase, setStoragePreference } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      // Set storage preference
      setStoragePreference(keepLoggedIn);

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password
      });

      if (loginError) {
        setError('Invalid email or password');
        return;
      }

      // Get session and check profile
      const token = data.session?.access_token;

      const profileResponse = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const profileData = await profileResponse.json();

      if (profileData.success && profileData.data) {
        router.push('/home');
      } else {
        router.push('/auth/form');
      }

    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      
      <label>
        <input
          type="checkbox"
          checked={keepLoggedIn}
          onChange={(e) => setKeepLoggedIn(e.target.checked)}
        />
        Keep me logged in
      </label>
      
      {error && <p className="error">{error}</p>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
}
```

---

### Flow 4: Google OAuth

```javascript
import { supabase, setStoragePreference } from '@/lib/supabase';

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    try {
      // OAuth defaults to "keep logged in"
      setStoragePreference(true);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('OAuth error:', error);
      }
    } catch (err) {
      console.error('Google login failed:', err);
    }
  };

  return (
    <button onClick={handleGoogleLogin}>
      <img src="/google-icon.svg" alt="Google" />
      Continue with Google
    </button>
  );
}
```

---

### Flow 5: OAuth Callback Handler

Create `/app/auth/callback/page.js`:

```javascript
'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Exchange code for session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setError('Authentication failed. Please try again.');
          setTimeout(() => router.push('/auth/login'), 2000);
          return;
        }

        // Check profile and redirect
        await checkProfileAndRedirect(session.access_token);

      } catch (err) {
        console.error('Callback error:', err);
        setError('An error occurred during authentication.');
        setTimeout(() => router.push('/auth/login'), 2000);
      }
    };

    handleCallback();
  }, [router]);

  const checkProfileAndRedirect = async (token) => {
    try {
      const response = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      setIsRedirecting(true);

      if (data.success && data.data) {
        // Profile exists
        router.push('/home');
      } else {
        // No profile
        router.push('/auth/form');
      }
    } catch (err) {
      // Profile check errors are non-blocking
      console.log('[Callback] Profile check error (non-blocking):', err);
      setIsRedirecting(true);
      router.push('/auth/form');
    }
  };

  return (
    <div className="callback-loading">
      {error ? (
        <p className="error">{error}</p>
      ) : (
        <p>Completing authentication...</p>
      )}
    </div>
  );
}
```

---

### Flow 6: Password Reset

**Request Reset:**
```javascript
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const normalizedEmail = email.toLowerCase().trim();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`
        }
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(true);

    } catch (err) {
      setError('Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleResetRequest}>
      {success ? (
        <div className="success-message">
          <p>A password reset link has been sent to {email}</p>
        </div>
      ) : (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          
          {error && <p className="error">{error}</p>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </>
      )}
    </form>
  );
}
```

**Reset Password Page:**
```javascript
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Success - redirect to login
      alert('Password reset successfully!');
      router.push('/auth/login');

    } catch (err) {
      setError('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleResetPassword}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New Password"
        minLength={8}
        required
      />
      
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm Password"
        minLength={8}
        required
      />
      
      {error && <p className="error">{error}</p>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}
```

---

## 🛡️ Protected Routes

### Auth Context Provider

Create `/contexts/AuthContext.js`:

```javascript
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          router.push('/auth/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Protected Page Component

```javascript
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>Welcome, {user.email}!</p>
    </div>
  );
}
```

---

## 📝 Profile Creation Flow

Create `/app/auth/form/page.js`:

```javascript
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfileFormPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    legal_first_name: '',
    legal_surname: '',
    alias_first_name: '',
    alias_surname: '',
    country: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = () => {
    return formData.legal_first_name && 
           formData.legal_surname && 
           formData.country && 
           formData.city;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setError('Not authenticated');
        router.push('/auth/login');
        return;
      }

      // Create profile via API
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to create profile');
        return;
      }

      // Success - redirect to home
      router.push('/home');

    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.legal_first_name}
        onChange={(e) => setFormData({...formData, legal_first_name: e.target.value})}
        placeholder="First Name *"
        required
      />
      
      <input
        type="text"
        value={formData.legal_surname}
        onChange={(e) => setFormData({...formData, legal_surname: e.target.value})}
        placeholder="Surname *"
        required
      />
      
      <input
        type="text"
        value={formData.alias_first_name}
        onChange={(e) => setFormData({...formData, alias_first_name: e.target.value})}
        placeholder="Alias First Name (Optional)"
      />
      
      <input
        type="text"
        value={formData.alias_surname}
        onChange={(e) => setFormData({...formData, alias_surname: e.target.value})}
        placeholder="Alias Surname (Optional)"
      />
      
      <select
        value={formData.country}
        onChange={(e) => setFormData({...formData, country: e.target.value})}
        required
      >
        <option value="">Select Country *</option>
        <option value="United Arab Emirates">United Arab Emirates</option>
        <option value="Saudi Arabia">Saudi Arabia</option>
        <option value="Qatar">Qatar</option>
        {/* Add more countries */}
      </select>
      
      <input
        type="text"
        value={formData.city}
        onChange={(e) => setFormData({...formData, city: e.target.value})}
        placeholder="City *"
        required
      />
      
      {error && <p className="error">{error}</p>}
      
      <button type="submit" disabled={loading || !isFormValid()}>
        {loading ? 'Creating Profile...' : 'Continue'}
      </button>
    </form>
  );
}
```

---

## 🔑 Getting JWT Token

### Method 1: From Session
```javascript
import { supabase } from '@/lib/supabase';

const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

### Method 2: Using Hook
```javascript
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user } = useAuth();
  
  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    const response = await fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  };
}
```

---

## 🚪 Logout

```javascript
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    
    // Clear storage preference
    localStorage.removeItem('heyprodata-keep-logged-in');
    sessionStorage.removeItem('heyprodata-keep-logged-in');
    
    router.push('/auth/login');
  };

  return (
    <button onClick={handleLogout}>
      Log Out
    </button>
  );
}
```

---

## ✅ Integration Checklist

- [ ] Install `@supabase/supabase-js`
- [ ] Create `/lib/supabase.js` with adaptive storage
- [ ] Set up environment variables
- [ ] Implement sign-up flow with OTP
- [ ] Implement login flow
- [ ] Implement Google OAuth
- [ ] Create OAuth callback handler
- [ ] Implement password reset flow
- [ ] Create AuthContext provider
- [ ] Protect routes that require authentication
- [ ] Implement profile creation form
- [ ] Add logout functionality
- [ ] Test "Keep me logged in" feature
- [ ] Test session persistence
- [ ] Handle token refresh automatically

---

**Document Version:** 1.0.0  
**Last Updated:** January 2025