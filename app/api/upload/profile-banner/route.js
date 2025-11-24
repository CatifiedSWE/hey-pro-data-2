import { NextResponse } from 'next/server'
import { createAuthenticatedClient, supabaseServer, successResponse, errorResponse, unauthorizedResponse, uploadFile, validateFile, FILE_SIZE_LIMITS, ALLOWED_MIME_TYPES } from '@/lib/supabaseServer'

// POST /api/upload/profile-banner - Upload profile banner
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

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return errorResponse('No file provided')
    }

    // Validate file
    const validation = validateFile(file, FILE_SIZE_LIMITS.PROFILE_BANNER, ALLOWED_MIME_TYPES.PROFILE_BANNER)
    if (!validation.valid) {
      return errorResponse(validation.error, 400)
    }

    console.log('[POST /api/upload/profile-banner] Uploading for user_id:', user.id)

    // Generate file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await uploadFile('profile-banner', filePath, file, buffer)

    if (error) {
      console.error('[POST /api/upload/profile-banner] Error:', error)
      return errorResponse('Failed to upload profile banner', 500)
    }

    // Update user profile with banner URL
    await supabase
      .from('user_profiles')
      .update({ banner_url: data.publicUrl })
      .eq('user_id', user.id)

    return successResponse({
      path: data.path,
      url: data.publicUrl
    }, 'Profile banner uploaded successfully')
  } catch (error) {
    console.error('[POST /api/upload/profile-banner] Error:', error)
    return errorResponse('Failed to upload profile banner', 500)
  }
}
