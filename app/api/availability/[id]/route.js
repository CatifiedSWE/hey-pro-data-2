import { NextResponse } from 'next/server'
import { createAuthenticatedClient, supabaseServer, successResponse, errorResponse, unauthorizedResponse } from '@/lib/supabaseServer'

// PATCH /api/availability/[id] - Update availability
export async function PATCH(request, { params }) {
  try {
    const { id: availabilityId } = await Promise.resolve(params)
    
    const supabase = createAuthenticatedClient(request) || supabaseServer
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const body = await request.json()
    const { is_available, notes } = body

    const updateData = {}
    if (is_available !== undefined) updateData.is_available = is_available
    if (notes !== undefined) updateData.notes = notes

    console.log('[PATCH /api/availability/:id] Updating:', availabilityId, 'for user:', user.id)

    const { data, error } = await supabase
      .from('crew_availability')
      .update(updateData)
      .eq('id', availabilityId)
      .eq('user_id', user.id)
      .select()
      .maybeSingle()

    if (error || !data) {
      console.error('[PATCH /api/availability/:id] Error:', error)
      return errorResponse('Failed to update availability', 500)
    }

    return successResponse(data, 'Availability updated successfully')
  } catch (error) {
    console.error('[PATCH /api/availability/:id] Error:', error)
    return errorResponse('Failed to update availability', 500)
  }
}
