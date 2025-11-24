import { NextResponse } from 'next/server'
import { createAuthenticatedClient, supabaseServer, successResponse, errorResponse, unauthorizedResponse } from '@/lib/supabaseServer'

// GET /api/availability - Get user's availability
export async function GET(request) {
  try {
    const supabase = createAuthenticatedClient(request) || supabaseServer
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const { searchParams } = new URL(request.url)
    const gigId = searchParams.get('gig_id')

    console.log('[GET /api/availability] Fetching for user_id:', user.id, 'gig_id:', gigId)

    let query = supabase
      .from('crew_availability')
      .select('*')
      .eq('user_id', user.id)
      .order('availability_date', { ascending: true })

    if (gigId) {
      query = query.eq('gig_id', gigId)
    }

    const { data, error } = await query

    if (error) {
      console.error('[GET /api/availability] Error:', error)
      return errorResponse(error.message, 500)
    }

    return successResponse(data || [])
  } catch (error) {
    console.error('[GET /api/availability] Error:', error)
    return errorResponse('Failed to fetch availability', 500)
  }
}

// POST /api/availability - Set availability
export async function POST(request) {
  try {
    const supabase = createAuthenticatedClient(request) || supabaseServer
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const body = await request.json()
    const { availability_date, is_available, gig_id, notes } = body

    if (!availability_date) {
      return errorResponse('Availability date is required')
    }

    console.log('[POST /api/availability] Setting for user_id:', user.id)

    const { data, error } = await supabase
      .from('crew_availability')
      .upsert({
        user_id: user.id,
        availability_date,
        is_available: is_available !== undefined ? is_available : true,
        gig_id: gig_id || null,
        notes
      }, {
        onConflict: 'user_id,availability_date'
      })
      .select()
      .maybeSingle()

    if (error) {
      console.error('[POST /api/availability] Error:', error)
      return errorResponse(error.message, 500)
    }

    return successResponse(data, 'Availability set successfully')
  } catch (error) {
    console.error('[POST /api/availability] Error:', error)
    return errorResponse('Failed to set availability', 500)
  }
}
