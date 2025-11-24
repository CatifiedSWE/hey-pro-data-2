import { NextResponse } from 'next/server'
import { createAuthenticatedClient, supabaseServer, successResponse, errorResponse, unauthorizedResponse } from '@/lib/supabaseServer'

// GET /api/availability/check - Check availability conflicts
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

    const { searchParams } = new URL(request.url)
    const checkDate = searchParams.get('date')

    if (!checkDate) {
      return errorResponse('Date parameter is required')
    }

    console.log('[GET /api/availability/check] Checking conflicts for user_id:', user.id, 'date:', checkDate)

    // Get confirmed/shortlisted applications for the user
    const { data: applications } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        gig:gigs (
          id,
          title,
          gig_dates (month, days)
        )
      `)
      .eq('applicant_user_id', user.id)
      .in('status', ['confirmed', 'shortlisted'])

    const conflicts = []
    if (applications) {
      for (const app of applications) {
        if (app.gig && app.gig.gig_dates) {
          for (const dateRange of app.gig.gig_dates) {
            if (dateRange.days && dateRange.days.includes(checkDate)) {
              conflicts.push({
                gig: {
                  id: app.gig.id,
                  title: app.gig.title
                },
                status: app.status
              })
            }
          }
        }
      }
    }

    return successResponse({
      date: checkDate,
      hasConflicts: conflicts.length > 0,
      conflicts
    })
  } catch (error) {
    console.error('[GET /api/availability/check] Error:', error)
    return errorResponse('Failed to check availability', 500)
  }
}
