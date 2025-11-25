import { NextResponse } from 'next/server'
import { createAuthenticatedClient, successResponse, errorResponse, unauthorizedResponse } from '@/lib/supabaseServer'

// GET /api/profile - Get user profile
export async function GET(request) {
  try {
    // Create authenticated Supabase client
    const supabase = createAuthenticatedClient(request)
    
    if (!supabase) {
      console.error('[GET /api/profile] No auth token provided')
      return unauthorizedResponse('Authentication required')
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('[GET /api/profile] Auth error:', authError)
      return unauthorizedResponse('Authentication required')
    }

    console.log('[GET /api/profile] Fetching profile for user_id:', user.id)

    // Use maybeSingle() instead of single() to handle case when profile doesn't exist yet
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('[GET /api/profile] Database error:', error)
      return errorResponse(`Database error: ${error.message}`, 500)
    }

    if (!data) {
      console.log('[GET /api/profile] No profile found for user_id:', user.id)
      // Return success with null profile instead of 404
      // This allows frontend to handle profile creation
      return successResponse(null)
    }

    console.log('[GET /api/profile] Profile found successfully')
    console.log('[GET /api/profile] Banner URL in database:', data.banner_url)
    console.log('[GET /api/profile] Profile Photo URL in database:', data.profile_photo_url)

    // Map database fields to API fields for consistency
    const profileData = {
      ...data,
      legal_first_name: data.first_name,
      legal_surname: data.surname,
      first_name: data.first_name,
      surname: data.surname
    }

    console.log('[GET /api/profile] Returning profile with banner_url:', profileData.banner_url)

    return successResponse(profileData)
  } catch (error) {
    console.error('[GET /api/profile] Unexpected error:', error)
    return errorResponse('Failed to fetch profile', 500)
  }
}

// PATCH /api/profile - Update profile
export async function PATCH(request) {
  try {
    // Create authenticated Supabase client
    const supabase = createAuthenticatedClient(request)
    
    if (!supabase) {
      return unauthorizedResponse('Authentication required')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const body = await request.json()
    
    // Map API field names to database field names
    const fieldMapping = {
      'legal_first_name': 'first_name',
      'legal_surname': 'surname',
      'alias_first_name': 'alias_first_name',
      'alias_surname': 'alias_surname',
      'phone': 'phone',
      'bio': 'bio',
      'profile_photo_url': 'profile_photo_url',
      'banner_url': 'banner_url',
      'country': 'country',
      'city': 'city'
    }

    const updateData = {}
    for (const [apiField, dbField] of Object.entries(fieldMapping)) {
      if (body[apiField] !== undefined) {
        updateData[dbField] = body[apiField]
      }
      if (body[dbField] !== undefined) {
        updateData[dbField] = body[dbField]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('No valid fields to update')
    }

    console.log('[PATCH /api/profile] Updating profile for user_id:', user.id)

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .maybeSingle()

    if (error) {
      console.error('[PATCH /api/profile] Update error:', error)
      return errorResponse(error.message, 500)
    }

    if (!data) {
      return errorResponse('Profile not found', 404)
    }

    // Map response back to API field names
    const responseData = {
      ...data,
      legal_first_name: data.first_name,
      legal_surname: data.surname,
      first_name: data.first_name,
      surname: data.surname
    }

    return successResponse(responseData, 'Profile updated successfully')
  } catch (error) {
    console.error('[PATCH /api/profile] Error:', error)
    return errorResponse('Failed to update profile', 500)
  }
}
