import { NextResponse } from 'next/server'
import { createAuthenticatedClient, supabaseServer, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/supabaseServer'

// GET /api/contacts/gig/[gigId] - Get contacts for a gig
export async function GET(request, { params }) {
  try {
    const { gigId } = await Promise.resolve(params)
    
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
      return forbiddenResponse('You can only view contacts for your own gigs')
    }

    console.log('[GET /api/contacts/gig/:gigId] Fetching for gig:', gigId)

    const { data, error } = await supabase
      .from('crew_contacts')
      .select(`
        *,
        user:user_profiles!crew_contacts_user_id_fkey (
          first_name,
          surname,
          profile_photo_url
        )
      `)
      .eq('gig_id', gigId)
      .order('department', { ascending: true })

    if (error) {
      console.error('[GET /api/contacts/gig/:gigId] Error:', error)
      return errorResponse(error.message, 500)
    }

    // Map database field names to API field names
    const mappedData = data?.map(contact => ({
      ...contact,
      user: contact.user ? {
        ...contact.user,
        legal_first_name: contact.user.first_name,
        legal_surname: contact.user.surname
      } : null
    })) || []

    return successResponse(mappedData)
  } catch (error) {
    console.error('[GET /api/contacts/gig/:gigId] Error:', error)
    return errorResponse('Failed to fetch contacts', 500)
  }
}
