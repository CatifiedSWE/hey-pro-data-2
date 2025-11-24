import { NextResponse } from 'next/server'
import { createAuthenticatedClient, supabaseServer, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, createNotification } from '@/lib/supabaseServer'

// PATCH /api/gigs/[id]/applications/[applicationId]/status - Update application status
export async function PATCH(request, { params }) {
  try {
    const { id: gigId, applicationId } = await Promise.resolve(params)
    
    const supabase = createAuthenticatedClient(request) || supabaseServer
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    // Verify user is the gig creator
    const { data: gig } = await supabase
      .from('gigs')
      .select('created_by, title')
      .eq('id', gigId)
      .maybeSingle()

    if (!gig || gig.created_by !== user.id) {
      return forbiddenResponse('You can only update applications to your own gigs')
    }

    const body = await request.json()
    const { status } = body

    if (!['pending', 'shortlisted', 'confirmed', 'released'].includes(status)) {
      return errorResponse('Invalid status value')
    }

    console.log('[PATCH /api/gigs/:id/applications/:applicationId/status] Updating:', applicationId, 'to:', status)

    // Update application
    const { data: application, error: updateError } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId)
      .eq('gig_id', gigId)
      .select()
      .maybeSingle()

    if (updateError || !application) {
      console.error('[PATCH /api/gigs/:id/applications/:applicationId/status] Error:', updateError)
      return errorResponse('Failed to update application status', 500)
    }

    // Create notification for applicant
    const statusMessages = {
      shortlisted: `You've been shortlisted for: ${gig.title}`,
      confirmed: `Congratulations! You've been confirmed for: ${gig.title}`,
      released: `Your application status for "${gig.title}" has been updated to released`
    }

    if (statusMessages[status]) {
      await createNotification({
        userId: application.applicant_user_id,
        type: 'status_changed',
        title: 'Application Status Updated',
        message: statusMessages[status],
        relatedGigId: gigId,
        relatedApplicationId: applicationId
      })
    }

    return successResponse(application, 'Application status updated successfully')
  } catch (error) {
    console.error('[PATCH /api/gigs/:id/applications/:applicationId/status] Error:', error)
    return errorResponse('Failed to update application status', 500)
  }
}
