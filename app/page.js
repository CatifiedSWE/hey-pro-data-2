'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RootPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // User is logged in, check if they have a profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle()

          if (profile) {
            router.replace('/home')
          } else {
            router.replace('/auth/form')
          }
        } else {
          // No session, go to login
          router.replace('/auth/login')
        }
      } catch (error) {
        console.error('Error checking session:', error)
        router.replace('/auth/login')
      } finally {
        setChecking(false)
      }
    }

    checkSession()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA6E80] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
