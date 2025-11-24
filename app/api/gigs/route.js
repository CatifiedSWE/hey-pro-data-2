import { NextResponse } from 'next/server'
import { supabaseServer, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/supabaseServer'

// GET /api/gigs - Get all gigs (paginated, filtered)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'active'
    const search = searchParams.get('search') || ''

    const from = (page - 1) * limit
    const to = from + limit - 1

    console.log('[GET /api/gigs] Fetching gigs, page:', page, 'limit:', limit)

    let query = supabaseServer
      .from('gigs')
      .select(`
        *,
        gig_dates (*),
        gig_locations (*),
        applications (count)
      `, { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[GET /api/gigs] Error:', error)
      return errorResponse(error.message, 500)
    }

    return successResponse({
      gigs: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('[GET /api/gigs] Error:', error)
    return errorResponse('Failed to fetch gigs', 500)
  }
}

// POST /api/gigs - Create new gig
export async function POST(request) {
  try {
    const supabase = supabaseServer
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
      return forbiddenResponse('Complete your profile before creating a gig')
    }

    const body = await request.json()
    const { title, description, qualifying_criteria, amount, currency, dates, locations } = body

    if (!title || !description) {
      return errorResponse('Title and description are required')
    }

    console.log('[POST /api/gigs] Creating gig for user_id:', user.id)

    // Create gig
    const { data: gig, error: gigError } = await supabase
      .from('gigs')
      .insert({
        title,
        description,
        qualifying_criteria,
        amount,
        currency: currency || 'AED',
        status: 'active',
        created_by: user.id
      })
      .select()
      .maybeSingle()

    if (gigError || !gig) {
      console.error('[POST /api/gigs] Error:', gigError)
      return errorResponse(gigError?.message || 'Failed to create gig', 500)
    }

    // Insert dates if provided
    if (dates && Array.isArray(dates) && dates.length > 0) {
      const dateRecords = dates.map(d => ({
        gig_id: gig.id,
        month: d.month,
        days: d.days
      }))

      await supabase.from('gig_dates').insert(dateRecords)
    }

    // Insert locations if provided
    if (locations && Array.isArray(locations) && locations.length > 0) {
      const locationRecords = locations.map(l => ({
        gig_id: gig.id,
        location_name: typeof l === 'string' ? l : l.location_name
      }))

      await supabase.from('gig_locations').insert(locationRecords)
    }

    // Fetch complete gig with relationships
    const { data: completeGig } = await supabase
      .from('gigs')
      .select(`
        *,
        gig_dates (*),
        gig_locations (*)
      `)
      .eq('id', gig.id)
      .maybeSingle()

    return successResponse(completeGig, 'Gig created successfully')
  } catch (error) {
    console.error('[POST /api/gigs] Error:', error)
    return errorResponse('Failed to create gig', 500)
  }
}
