import { NextResponse } from 'next/server'
import { createAuthenticatedClient, supabaseServer, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/supabaseServer'

// GET /api/gigs/[id]/applications - Get applications for a gig
export async function GET(request, { params }) {
  try {
    const { id: gigId } = await Promise.resolve(params)
    
    const supabase = createAuthenticatedClient(request) || supabaseServer
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    // Verify user is the gig creator
    const { data: gig } = await supabase
      .from('gigs')
      .select('created_by')
      .eq('id', gigId)
      .maybeSingle()

    if (!gig || gig.created_by !== user.id) {
      return forbiddenResponse('You can only view applications to your own gigs')
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    console.log('[GET /api/gigs/:id/applications] Fetching for gig:', gigId)

    let query = supabase
      .from('applications')
      .select(`
        *,
        applicant:user_profiles!applications_applicant_user_id_fkey (
          first_name,
          surname,
          alias_first_name,
          alias_surname,
          profile_photo_url,
          phone,
          user_id
        )
      `)
      .eq('gig_id', gigId)
      .order('applied_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('[GET /api/gigs/:id/applications] Error:', error)
      return errorResponse(error.message, 500)
    }

    // Get applicant skills for each applicant
    const applicationsWithSkills = await Promise.all(
      (data || []).map(async (app) => {
        const { data: skills } = await supabase
          .from('applicant_skills')
          .select('skill_name')
          .eq('user_id', app.applicant_user_id)

        // Map database field names to API field names
        const mappedApplicant = app.applicant ? {
          ...app.applicant,
          legal_first_name: app.applicant.first_name,
          legal_surname: app.applicant.surname,
          skills: skills?.map(s => s.skill_name) || []
        } : null

        return {
          ...app,
          applicant: mappedApplicant
        }
      })
    )

    return successResponse(applicationsWithSkills)
  } catch (error) {
    console.error('[GET /api/gigs/:id/applications] Error:', error)
    return errorResponse('Failed to fetch applications', 500)
  }
}
