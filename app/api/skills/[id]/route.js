import { NextResponse } from 'next/server'
import { createAuthenticatedClient, supabaseServer, successResponse, errorResponse, unauthorizedResponse } from '@/lib/supabaseServer'

// DELETE /api/skills/[id] - Remove skill
export async function DELETE(request, { params }) {
  try {
    const { id: skillId } = await Promise.resolve(params)
    
    const supabase = createAuthenticatedClient(request)
    
    if (!supabase) {
      return unauthorizedResponse('Authentication required')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    console.log('[DELETE /api/skills/:id] Deleting skill:', skillId, 'for user:', user.id)

    const { error } = await supabase
      .from('applicant_skills')
      .delete()
      .eq('id', skillId)
      .eq('user_id', user.id)

    if (error) {
      console.error('[DELETE /api/skills/:id] Error:', error)
      return errorResponse(error.message, 500)
    }

    return successResponse(null, 'Skill removed successfully')
  } catch (error) {
    console.error('[DELETE /api/skills/:id] Error:', error)
    return errorResponse('Failed to remove skill', 500)
  }
}
