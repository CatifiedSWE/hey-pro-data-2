import { NextResponse } from 'next/server'
import { createAuthenticatedClient, supabaseServer, successResponse, errorResponse, unauthorizedResponse } from '@/lib/supabaseServer'

// GET /api/applications/my - Get user's applications
export async function GET(request) {
  try {
    const supabase = createAuthenticatedClient(request) || supabaseServer
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    console.log('[GET /api/applications/my] Fetching applications for user_id:', user.id)

    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        gig:gigs (
          id,
          title,
          description,
          amount,
          currency,
          status,
          gig_dates (*),
          gig_locations (*)
        )
      `)
      .eq('applicant_user_id', user.id)
      .order('applied_at', { ascending: false })

    if (error) {
      console.error('[GET /api/applications/my] Error:', error)
      return errorResponse(error.message, 500)
    }

    return successResponse(data || [])
  } catch (error) {
    console.error('[GET /api/applications/my] Error:', error)
    return errorResponse('Failed to fetch applications', 500)
  }
}
