import { NextResponse } from 'next/server'
import { createAuthenticatedClient, supabaseServer, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/supabaseServer'

// DELETE /api/contacts/[id] - Remove contact
export async function DELETE(request, { params }) {
  try {
    const { id: contactId } = await Promise.resolve(params)
    
    const supabase = createAuthenticatedClient(request)
    
    if (!supabase) {
      return unauthorizedResponse('Authentication required')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    // Verify user owns the gig
    const { data: contact } = await supabase
      .from('crew_contacts')
      .select('gig_id, gigs (created_by)')
      .eq('id', contactId)
      .maybeSingle()

    if (!contact || !contact.gigs || contact.gigs.created_by !== user.id) {
      return forbiddenResponse('You can only remove contacts from your own gigs')
    }

    console.log('[DELETE /api/contacts/:id] Deleting:', contactId)

    const { error } = await supabase
      .from('crew_contacts')
      .delete()
      .eq('id', contactId)

    if (error) {
      console.error('[DELETE /api/contacts/:id] Error:', error)
      return errorResponse(error.message, 500)
    }

    return successResponse(null, 'Contact removed successfully')
  } catch (error) {
    console.error('[DELETE /api/contacts/:id] Error:', error)
    return errorResponse('Failed to remove contact', 500)
  }
}
