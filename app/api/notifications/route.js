import { NextResponse } from 'next/server'
import { createAuthenticatedClient, supabaseServer, successResponse, errorResponse, unauthorizedResponse } from '@/lib/supabaseServer'

// GET /api/notifications - Get user's notifications
export async function GET(request) {
  try {
    const supabase = createAuthenticatedClient(request) || supabaseServer
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread_only') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log('[GET /api/notifications] Fetching for user_id:', user.id)

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query

    if (error) {
      console.error('[GET /api/notifications] Error:', error)
      return errorResponse(error.message, 500)
    }

    return successResponse(data || [])
  } catch (error) {
    console.error('[GET /api/notifications] Error:', error)
    return errorResponse('Failed to fetch notifications', 500)
  }
}
