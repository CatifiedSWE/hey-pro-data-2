import { NextResponse } from 'next/server'
import { supabaseServer, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, createNotification } from '@/lib/supabaseServer'

// POST /api/gigs/apply - Apply to a gig (generic endpoint)
export async function POST(request) {
  try {
    const supabase = supabaseServer
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const body = await request.json()
    const { gig_id, cover_letter, portfolio_links, resume_url, portfolio_files, notes } = body

    if (!gig_id) {
      return errorResponse('Gig ID is required')
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
      .eq('id', gig_id)
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
      .eq('gig_id', gig_id)
      .eq('applicant_user_id', user.id)
      .maybeSingle()

    if (existingApplication) {
      return errorResponse('You have already applied to this gig', 400)
    }

    console.log('[POST /api/gigs/apply] Applying to gig:', gig_id, 'user:', user.id)

    // Create application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        gig_id,
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
      console.error('[POST /api/gigs/apply] Error:', appError)
      return errorResponse(appError?.message || 'Failed to submit application', 500)
    }

    // Create notification for gig creator
    await createNotification({
      userId: gig.created_by,
      type: 'application_received',
      title: 'New Application Received',
      message: `Someone applied to your gig: ${gig.title}`,
      relatedGigId: gig_id,
      relatedApplicationId: application.id
    })

    return successResponse(application, 'Application submitted successfully')
  } catch (error) {
    console.error('[POST /api/gigs/apply] Error:', error)
    return errorResponse('Failed to submit application', 500)
  }
}
