import { NextResponse } from 'next/server'
import { createAuthenticatedClient, supabaseServer, successResponse, errorResponse, unauthorizedResponse, notFoundResponse, createNotification } from '@/lib/supabaseServer'

// GET /api/referrals - Get user's referrals
export async function GET(request) {
  try {
    const supabase = createAuthenticatedClient(request)
    
    if (!supabase) {
      return unauthorizedResponse('Authentication required')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    console.log('[GET /api/referrals] Fetching for user_id:', user.id)

    const { data, error } = await supabase
      .from('referrals')
      .select(`
        *,
        gig:gigs (id, title, description, status),
        referred_user:user_profiles!referrals_referred_user_id_fkey (
          first_name,
          surname,
          profile_photo_url
        ),
        referrer:user_profiles!referrals_referrer_user_id_fkey (
          first_name,
          surname,
          profile_photo_url
        )
      `)
      .or(`referred_user_id.eq.${user.id},referrer_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[GET /api/referrals] Error:', error)
      return errorResponse(error.message, 500)
    }

    // Map database field names to API field names
    const mappedData = data?.map(referral => ({
      ...referral,
      referred_user: referral.referred_user ? {
        ...referral.referred_user,
        legal_first_name: referral.referred_user.first_name,
        legal_surname: referral.referred_user.surname
      } : null,
      referrer: referral.referrer ? {
        ...referral.referrer,
        legal_first_name: referral.referrer.first_name,
        legal_surname: referral.referrer.surname
      } : null
    })) || []

    return successResponse(mappedData)
  } catch (error) {
    console.error('[GET /api/referrals] Error:', error)
    return errorResponse('Failed to fetch referrals', 500)
  }
}

// POST /api/referrals - Create referral
export async function POST(request) {
  try {
    const supabase = createAuthenticatedClient(request)
    
    if (!supabase) {
      return unauthorizedResponse('Authentication required')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const body = await request.json()
    const { gig_id, referred_user_id } = body

    if (!gig_id || !referred_user_id) {
      return errorResponse('Gig ID and referred user ID are required')
    }

    if (referred_user_id === user.id) {
      return errorResponse('You cannot refer yourself', 400)
    }

    // Check if gig exists
    const { data: gig } = await supabase
      .from('gigs')
      .select('id, title, created_by')
      .eq('id', gig_id)
      .maybeSingle()

    if (!gig) {
      return notFoundResponse('Gig not found')
    }

    console.log('[POST /api/referrals] Creating referral for gig:', gig_id)

    const { data, error } = await supabase
      .from('referrals')
      .insert({
        gig_id,
        referred_user_id,
        referrer_user_id: user.id,
        status: 'pending'
      })
      .select()
      .maybeSingle()

    if (error) {
      if (error.code === '23505') {
        return errorResponse('You have already referred this user to this gig', 400)
      }
      console.error('[POST /api/referrals] Error:', error)
      return errorResponse(error.message, 500)
    }

    // Create notification for referred user
    await createNotification({
      userId: referred_user_id,
      type: 'referral_received',
      title: 'New Referral',
      message: `You've been referred to a gig: ${gig.title}`,
      relatedGigId: gig_id
    })

    // Create notification for gig creator
    await createNotification({
      userId: gig.created_by,
      type: 'referral_received',
      title: 'Referral for Your Gig',
      message: `Someone referred a candidate for: ${gig.title}`,
      relatedGigId: gig_id
    })

    return successResponse(data, 'Referral created successfully')
  } catch (error) {
    console.error('[POST /api/referrals] Error:', error)
    return errorResponse('Failed to create referral', 500)
  }
}
