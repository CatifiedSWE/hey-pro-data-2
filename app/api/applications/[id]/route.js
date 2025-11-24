import { NextResponse } from 'next/server'
import { createAuthenticatedClient, supabaseServer, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/supabaseServer'

// GET /api/applications/[id] - Get single application
export async function GET(request, { params }) {
  try {
    const { id: applicationId } = await Promise.resolve(params)
    
    const supabase = createAuthenticatedClient(request)
    
    if (!supabase) {
      return unauthorizedResponse('Authentication required')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    console.log('[GET /api/applications/:id] Fetching application:', applicationId)

    const { data: application, error } = await supabase
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
          created_by,
          gig_dates (*),
          gig_locations (*)
        )
      `)
      .eq('id', applicationId)
      .maybeSingle()

    if (error || !application) {
      console.error('[GET /api/applications/:id] Error:', error)
      return notFoundResponse('Application not found')
    }

    // Check if user is applicant or gig creator
    if (application.applicant_user_id !== user.id && application.gig.created_by !== user.id) {
      return forbiddenResponse('You do not have access to this application')
    }

    return successResponse(application)
  } catch (error) {
    console.error('[GET /api/applications/:id] Error:', error)
    return errorResponse('Failed to fetch application', 500)
  }
}
