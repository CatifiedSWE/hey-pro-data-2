import { NextResponse } from 'next/server'
import { supabaseServer, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/supabaseServer'

// POST /api/contacts - Add contact
export async function POST(request) {
  try {
    const supabase = supabaseServer
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const body = await request.json()
    const { gig_id, contact_user_id, department, role, company, phone, email } = body

    if (!gig_id || !contact_user_id || !department || !role) {
      return errorResponse('Gig ID, contact user ID, department, and role are required')
    }

    // Verify user is the gig creator
    const { data: gig } = await supabase
      .from('gigs')
      .select('created_by')
      .eq('id', gig_id)
      .maybeSingle()

    if (!gig || gig.created_by !== user.id) {
      return forbiddenResponse('You can only add contacts to your own gigs')
    }

    console.log('[POST /api/contacts] Adding contact for gig:', gig_id)

    const { data, error } = await supabase
      .from('crew_contacts')
      .insert({
        gig_id,
        user_id: contact_user_id,
        department,
        role,
        company,
        phone,
        email
      })
      .select()
      .maybeSingle()

    if (error) {
      if (error.code === '23505') {
        return errorResponse('Contact already exists for this department', 400)
      }
      console.error('[POST /api/contacts] Error:', error)
      return errorResponse(error.message, 500)
    }

    return successResponse(data, 'Contact added successfully')
  } catch (error) {
    console.error('[POST /api/contacts] Error:', error)
    return errorResponse('Failed to add contact', 500)
  }
}
