import { NextResponse } from 'next/server'
import { createAuthenticatedClient, supabaseServer, successResponse, errorResponse, unauthorizedResponse } from '@/lib/supabaseServer'

// PATCH /api/notifications/[id]/read - Mark notification as read
export async function PATCH(request, { params }) {
  try {
    const { id: notificationId } = await Promise.resolve(params)
    
    const supabase = createAuthenticatedClient(request)
    
    if (!supabase) {
      return unauthorizedResponse('Authentication required')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    console.log('[PATCH /api/notifications/:id/read] Marking as read:', notificationId)

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .select()
      .maybeSingle()

    if (error || !data) {
      console.error('[PATCH /api/notifications/:id/read] Error:', error)
      return errorResponse('Failed to mark notification as read', 500)
    }

    return successResponse(data, 'Notification marked as read')
  } catch (error) {
    console.error('[PATCH /api/notifications/:id/read] Error:', error)
    return errorResponse('Failed to mark notification as read', 500)
  }
}
