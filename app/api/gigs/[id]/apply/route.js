import { NextResponse } from 'next/server'
import { createAuthenticatedClient, supabaseServer, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, createNotification } from '@/lib/supabaseServer'

// POST /api/gigs/[id]/apply - Apply to a gig
export async function POST(request, { params }) {
  try {
    const { id: gigId } = await Promise.resolve(params)
    
    const supabase = createAuthenticatedClient(request) || supabaseServer
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    // Check if profile is complete
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_profile_complete')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile || !profile.is_profile_complete) {
      return forbiddenResponse('Complete your profile before applying')
    }

    // Check if gig exists and user is not the creator
    const { data: gig } = await supabase
      .from('gigs')
      .select('id, created_by, title')
      .eq('id', gigId)
      .maybeSingle()

    if (!gig) {
      return notFoundResponse('Gig not found')
    }

    if (gig.created_by === user.id) {
      return forbiddenResponse('You cannot apply to your own gig')
    }

    // Check if already applied
    const { data: existingApplication } = await supabase
      .from('applications')
      .select('id')
      .eq('gig_id', gigId)
      .eq('applicant_user_id', user.id)
      .maybeSingle()

    if (existingApplication) {
      return errorResponse('You have already applied to this gig', 400)
    }

    const body = await request.json()
    const { cover_letter, portfolio_links, resume_url, portfolio_files, notes } = body

    console.log('[POST /api/gigs/:id/apply] Applying to gig:', gigId, 'user:', user.id)

    // Create application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        gig_id: gigId,
        applicant_user_id: user.id,
        status: 'pending',
        cover_letter,
        portfolio_links,
        resume_url,
        portfolio_files,
        notes
      })
      .select()
      .maybeSingle()

    if (appError || !application) {
      console.error('[POST /api/gigs/:id/apply] Error:', appError)
      return errorResponse(appError?.message || 'Failed to submit application', 500)
    }

    // Create notification for gig creator
    await createNotification({
      userId: gig.created_by,
      type: 'application_received',
      title: 'New Application Received',
      message: `Someone applied to your gig: ${gig.title}`,
      relatedGigId: gigId,
      relatedApplicationId: application.id
    })

    return successResponse(application, 'Application submitted successfully')
  } catch (error) {
    console.error('[POST /api/gigs/:id/apply] Error:', error)
    return errorResponse('Failed to submit application', 500)
  }
}
