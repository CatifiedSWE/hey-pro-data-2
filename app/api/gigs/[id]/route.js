import { NextResponse } from 'next/server'
import { supabaseServer, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/supabaseServer'

// GET /api/gigs/[id] - Get single gig with details
export async function GET(request, { params }) {
  try {
    const { id: gigId } = await Promise.resolve(params)
    
    console.log('[GET /api/gigs/:id] Fetching gig:', gigId)

    const { data, error } = await supabaseServer
      .from('gigs')
      .select(`
        *,
        gig_dates (*),
        gig_locations (*)
      `)
      .eq('id', gigId)
      .maybeSingle()

    if (error || !data) {
      console.error('[GET /api/gigs/:id] Error:', error)
      return notFoundResponse('Gig not found')
    }

    // Get application count
    const { count } = await supabaseServer
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('gig_id', gigId)

    return successResponse({
      ...data,
      applications_count: count || 0
    })
  } catch (error) {
    console.error('[GET /api/gigs/:id] Error:', error)
    return errorResponse('Failed to fetch gig', 500)
  }
}

// PATCH /api/gigs/[id] - Update gig
export async function PATCH(request, { params }) {
  try {
    const { id: gigId } = await Promise.resolve(params)
    
    const supabase = supabaseServer
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const body = await request.json()
    const { title, description, qualifying_criteria, amount, currency, status, dates, locations } = body

    // Verify ownership
    const { data: existingGig } = await supabase
      .from('gigs')
      .select('created_by')
      .eq('id', gigId)
      .maybeSingle()

    if (!existingGig || existingGig.created_by !== user.id) {
      return forbiddenResponse('You can only update your own gigs')
    }

    console.log('[PATCH /api/gigs/:id] Updating gig:', gigId)

    // Update gig
    const updateData = {}
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (qualifying_criteria !== undefined) updateData.qualifying_criteria = qualifying_criteria
    if (amount !== undefined) updateData.amount = amount
    if (currency) updateData.currency = currency
    if (status) updateData.status = status

    const { error: updateError } = await supabase
      .from('gigs')
      .update(updateData)
      .eq('id', gigId)

    if (updateError) {
      console.error('[PATCH /api/gigs/:id] Error:', updateError)
      return errorResponse(updateError.message, 500)
    }

    // Update dates if provided
    if (dates && Array.isArray(dates)) {
      await supabase.from('gig_dates').delete().eq('gig_id', gigId)
      
      if (dates.length > 0) {
        const dateRecords = dates.map(d => ({
          gig_id: gigId,
          month: d.month,
          days: d.days
        }))
        await supabase.from('gig_dates').insert(dateRecords)
      }
    }

    // Update locations if provided
    if (locations && Array.isArray(locations)) {
      await supabase.from('gig_locations').delete().eq('gig_id', gigId)
      
      if (locations.length > 0) {
        const locationRecords = locations.map(l => ({
          gig_id: gigId,
          location_name: typeof l === 'string' ? l : l.location_name
        }))
        await supabase.from('gig_locations').insert(locationRecords)
      }
    }

    // Fetch updated gig
    const { data: updatedGig } = await supabase
      .from('gigs')
      .select(`
        *,
        gig_dates (*),
        gig_locations (*)
      `)
      .eq('id', gigId)
      .maybeSingle()

    return successResponse(updatedGig, 'Gig updated successfully')
  } catch (error) {
    console.error('[PATCH /api/gigs/:id] Error:', error)
    return errorResponse('Failed to update gig', 500)
  }
}

// DELETE /api/gigs/[id] - Delete gig
export async function DELETE(request, { params }) {
  try {
    const { id: gigId } = await Promise.resolve(params)
    
    const supabase = supabaseServer
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    // Verify ownership
    const { data: existingGig } = await supabase
      .from('gigs')
      .select('created_by')
      .eq('id', gigId)
      .maybeSingle()

    if (!existingGig || existingGig.created_by !== user.id) {
      return forbiddenResponse('You can only delete your own gigs')
    }

    console.log('[DELETE /api/gigs/:id] Deleting gig:', gigId)

    const { error } = await supabase
      .from('gigs')
      .delete()
      .eq('id', gigId)

    if (error) {
      console.error('[DELETE /api/gigs/:id] Error:', error)
      return errorResponse(error.message, 500)
    }

    return successResponse(null, 'Gig deleted successfully')
  } catch (error) {
    console.error('[DELETE /api/gigs/:id] Error:', error)
    return errorResponse('Failed to delete gig', 500)
  }
}
