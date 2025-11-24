import { NextResponse } from 'next/server'
import { createAuthenticatedClient, supabaseServer, successResponse, errorResponse, unauthorizedResponse, uploadFile, validateFile, FILE_SIZE_LIMITS, ALLOWED_MIME_TYPES } from '@/lib/supabaseServer'

// POST /api/upload/profile-photo - Upload profile photo
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
    const validation = validateFile(file, FILE_SIZE_LIMITS.PROFILE_PHOTO, ALLOWED_MIME_TYPES.PROFILE_PHOTO)
    if (!validation.valid) {
      return errorResponse(validation.error, 400)
    }

    console.log('[POST /api/upload/profile-photo] Uploading for user_id:', user.id)

    // Generate file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    console.log('[POST /api/upload/profile-photo] Attempting upload to bucket: profile-photos, path:', filePath)
    const { data, error } = await uploadFile('profile-photos', filePath, file, buffer)

    if (error) {
      console.error('[POST /api/upload/profile-photo] Upload error:', JSON.stringify(error, null, 2))
      return errorResponse(`Failed to upload profile photo: ${error.message || JSON.stringify(error)}`, 500)
    }

    if (!data || !data.publicUrl) {
      console.error('[POST /api/upload/profile-photo] No data or publicUrl returned:', data)
      return errorResponse('Upload succeeded but no URL returned', 500)
    }

    console.log('[POST /api/upload/profile-photo] Upload successful, URL:', data.publicUrl)

    // Update user profile with photo URL
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ profile_photo_url: data.publicUrl })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('[POST /api/upload/profile-photo] Profile update error:', updateError)
      // Still return success since file was uploaded
    }

    return successResponse({
      path: data.path,
      url: data.publicUrl
    }, 'Profile photo uploaded successfully')
  } catch (error) {
    console.error('[POST /api/upload/profile-photo] Unexpected error:', error)
    return errorResponse(`Failed to upload profile photo: ${error.message}`, 500)
  }
}
