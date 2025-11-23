import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Custom storage adapter that switches between localStorage and sessionStorage
// based on "Keep me logged in" preference
class AdaptiveStorage {
  constructor() {
    this.preferenceKey = 'heyprodata-keep-logged-in'
  }

  // Determine which storage to use based on user preference
  getStorage() {
    if (typeof window === 'undefined') return null
    
    // Default to localStorage for OAuth flows (needed for PKCE)
    // Check if user wants to stay logged in
    const keepLoggedIn = sessionStorage.getItem(this.preferenceKey) === 'true' ||
                         localStorage.getItem(this.preferenceKey) === 'true'
    
    // For OAuth/PKCE, always use localStorage to ensure code verifier is accessible
    return keepLoggedIn !== false ? localStorage : sessionStorage
  }

  getItem(key) {
    if (typeof window === 'undefined') return null
    
    // Always check localStorage first for PKCE code verifier
    let item = localStorage.getItem(key)
    
    // If not found in localStorage, check sessionStorage
    if (!item) {
      item = sessionStorage.getItem(key)
    }
    
    return item
  }

  setItem(key, value) {
    if (typeof window === 'undefined') return
    
    const storage = this.getStorage()
    
    // For PKCE-related keys, always store in localStorage
    // This ensures code verifier is accessible during OAuth callback
    if (key.includes('pkce') || key.includes('code-verifier')) {
      localStorage.setItem(key, value)
    } else {
      storage.setItem(key, value)
    }
  }

  removeItem(key) {
    // Remove from both storages to ensure clean logout
    if (typeof window === 'undefined') return
    localStorage?.removeItem(key)
    sessionStorage?.removeItem(key)
  }
}

const adaptiveStorage = new AdaptiveStorage()

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: adaptiveStorage
  }
})

// Helper function to set storage preference
export const setStoragePreference = (keepLoggedIn) => {
  if (typeof window === 'undefined') return
  
  const key = 'heyprodata-keep-logged-in'
  
  if (keepLoggedIn) {
    localStorage.setItem(key, 'true')
    sessionStorage.setItem(key, 'true')
  } else {
    localStorage.removeItem(key)
    sessionStorage.setItem(key, 'false')
  }
}
