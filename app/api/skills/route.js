import { NextResponse } from 'next/server'
import { createAuthenticatedClient, supabaseServer, successResponse, errorResponse, unauthorizedResponse } from '@/lib/supabaseServer'

// GET /api/skills - Get user's skills
export async function GET(request) {
  try {
    const supabase = createAuthenticatedClient(request)
    
    if (!supabase) {
      return unauthorizedResponse('Authentication required')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    console.log('[GET /api/skills] Fetching skills for user_id:', user.id)

    const { data, error } = await supabase
      .from('applicant_skills')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[GET /api/skills] Error:', error)
      return errorResponse(error.message, 500)
    }

    return successResponse(data || [])
  } catch (error) {
    console.error('[GET /api/skills] Error:', error)
    return errorResponse('Failed to fetch skills', 500)
  }
}

// POST /api/skills - Add skill
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

    const body = await request.json()
    const { skill_name } = body

    if (!skill_name || skill_name.trim() === '') {
      return errorResponse('Skill name is required')
    }

    console.log('[POST /api/skills] Adding skill for user_id:', user.id)

    const { data, error } = await supabase
      .from('applicant_skills')
      .insert({
        user_id: user.id,
        skill_name: skill_name.trim()
      })
      .select()
      .maybeSingle()

    if (error) {
      if (error.code === '23505') {
        return errorResponse('You have already added this skill', 400)
      }
      console.error('[POST /api/skills] Error:', error)
      return errorResponse(error.message, 500)
    }

    return successResponse(data, 'Skill added successfully')
  } catch (error) {
    console.error('[POST /api/skills] Error:', error)
    return errorResponse('Failed to add skill', 500)
  }
}
