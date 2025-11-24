import { NextResponse } from 'next/server'
import { createAuthenticatedClient, supabaseServer, successResponse, errorResponse, unauthorizedResponse } from '@/lib/supabaseServer'

// PATCH /api/notifications/mark-all-read - Mark all notifications as read
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

    console.log('[PATCH /api/notifications/mark-all-read] For user_id:', user.id)

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) {
      console.error('[PATCH /api/notifications/mark-all-read] Error:', error)
      return errorResponse(error.message, 500)
    }

    return successResponse(null, 'All notifications marked as read')
  } catch (error) {
    console.error('[PATCH /api/notifications/mark-all-read] Error:', error)
    return errorResponse('Failed to mark all notifications as read', 500)
  }
}
