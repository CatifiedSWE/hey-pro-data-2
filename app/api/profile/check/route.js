import { NextResponse } from 'next/server'
import { supabaseServer, successResponse, errorResponse, unauthorizedResponse } from '@/lib/supabaseServer'

// GET /api/profile/check - Check if profile is complete
export async function GET(request) {
  try {
    const supabase = supabaseServer
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    console.log('[GET /api/profile/check] Checking profile for user_id:', user.id)

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('[GET /api/profile/check] Error:', error)
      return errorResponse(error.message, 500)
    }

    // Check if profile is complete
    const isComplete = data && 
      data.first_name && 
      data.surname && 
      data.phone

    return successResponse({
      is_complete: isComplete,
      profile: data
    })
  } catch (error) {
    console.error('[GET /api/profile/check] Error:', error)
    return errorResponse('Failed to check profile completeness', 500)
  }
}
