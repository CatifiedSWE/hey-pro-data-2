import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Custom storage adapter that switches between localStorage and sessionStorage
// based on "Keep me logged in" preference
class AdaptiveStorage {
  constructor() {
    this.storageKey = 'heyprodata-auth-token'
    this.preferenceKey = 'heyprodata-keep-logged-in'
  }

  // Determine which storage to use based on user preference
  getStorage() {
    if (typeof window === 'undefined') return null
    
    // Check if user wants to stay logged in
    const keepLoggedIn = sessionStorage.getItem(this.preferenceKey) === 'true' ||
                         localStorage.getItem(this.preferenceKey) === 'true'
    
    return keepLoggedIn ? localStorage : sessionStorage
  }

  getItem(key) {
    // Try both storages to find the session
    if (typeof window === 'undefined') return null
    
    const storage = this.getStorage()
    let item = storage?.getItem(key)
    
    // If not found in preferred storage, check the other one
    if (!item) {
      const alternateStorage = storage === localStorage ? sessionStorage : localStorage
      item = alternateStorage?.getItem(key)
    }
    
    return item
  }

  setItem(key, value) {
    const storage = this.getStorage()
    storage?.setItem(key, value)
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
    flowType: 'pkce',
    storage: adaptiveStorage,
    storageKey: 'heyprodata-auth-token'
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
