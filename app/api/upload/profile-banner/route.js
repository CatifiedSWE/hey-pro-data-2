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

    // Upload to Supabase Storage (profile-banner bucket) with authenticated client
    console.log('[POST /api/upload/profile-banner] Attempting upload to bucket: profile-banner, path:', filePath)
    const { data, error } = await uploadFile('profile-banner', filePath, file, buffer, supabase)

    if (error) {
      console.error('[POST /api/upload/profile-banner] Upload error:', JSON.stringify(error, null, 2))
      return errorResponse(`Failed to upload profile banner: ${error.message || JSON.stringify(error)}`, 500)
    }

    if (!data || !data.publicUrl) {
      console.error('[POST /api/upload/profile-banner] No data or publicUrl returned:', data)
      return errorResponse('Upload succeeded but no URL returned', 500)
    }

    console.log('[POST /api/upload/profile-banner] Upload successful, URL:', data.publicUrl)

    // Update user profile with banner URL
    console.log('[POST /api/upload/profile-banner] Attempting to update user_profiles.banner_url for user:', user.id)
    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update({ banner_url: data.publicUrl })
      .eq('user_id', user.id)
      .select()

    if (updateError) {
      console.error('[POST /api/upload/profile-banner] ❌ Profile update FAILED:', JSON.stringify(updateError, null, 2))
      return errorResponse(`File uploaded but failed to update profile: ${updateError.message}`, 500)
    }

    if (!updateData || updateData.length === 0) {
      console.error('[POST /api/upload/profile-banner] ❌ Update returned no rows - profile may not exist for user:', user.id)
      return errorResponse('File uploaded but profile not found in database', 404)
    }

    console.log('[POST /api/upload/profile-banner] ✅ Profile updated successfully! Banner URL:', updateData[0]?.banner_url)

    return successResponse({
      path: data.path,
      url: data.publicUrl
    }, 'Profile banner uploaded successfully')
  } catch (error) {
    console.error('[POST /api/upload/profile-banner] Unexpected error:', error)
    return errorResponse(`Failed to upload profile banner: ${error.message}`, 500)
  }
}
