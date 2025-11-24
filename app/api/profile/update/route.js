import { NextResponse } from 'next/server'
import { createAuthenticatedClient, supabaseServer, successResponse, errorResponse, unauthorizedResponse } from '@/lib/supabaseServer'

// PATCH /api/profile/update - Update profile (alternative endpoint)
export async function PATCH(request) {
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

    console.log('[PATCH /api/profile/update] Updating for user_id:', user.id)

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .maybeSingle()

    if (error) {
      return errorResponse(error.message, 500)
    }

    if (!data) {
      return errorResponse('Profile not found', 404)
    }

    const responseData = {
      ...data,
      legal_first_name: data.first_name,
      legal_surname: data.surname
    }

    return successResponse(responseData, 'Profile updated successfully')
  } catch (error) {
    console.error('[PATCH /api/profile/update] Error:', error)
    return errorResponse('Failed to update profile', 500)
  }
}
