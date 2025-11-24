import { NextResponse } from 'next/server'
import { supabaseServer, successResponse, errorResponse, unauthorizedResponse, uploadFile, validateFile, FILE_SIZE_LIMITS, ALLOWED_MIME_TYPES } from '@/lib/supabaseServer'

// POST /api/upload/portfolio - Upload portfolio file
export async function POST(request) {
  try {
    const supabase = supabaseServer
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
    const validation = validateFile(file, FILE_SIZE_LIMITS.PORTFOLIO, ALLOWED_MIME_TYPES.PORTFOLIO)
    if (!validation.valid) {
      return errorResponse(validation.error, 400)
    }

    console.log('[POST /api/upload/portfolio] Uploading for user_id:', user.id)

    // Generate file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await uploadFile('portfolios', filePath, file, buffer)

    if (error) {
      console.error('[POST /api/upload/portfolio] Error:', error)
      return errorResponse('Failed to upload portfolio file', 500)
    }

    return successResponse({
      path: data.path,
      url: `/api/storage/portfolios/${filePath}`
    }, 'Portfolio file uploaded successfully')
  } catch (error) {
    console.error('[POST /api/upload/portfolio] Error:', error)
    return errorResponse('Failed to upload portfolio file', 500)
  }
}
