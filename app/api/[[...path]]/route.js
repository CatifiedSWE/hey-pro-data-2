import { NextResponse } from 'next/server'
import {
  supabaseServer,
  getAuthUser,
  checkProfileComplete,
  createNotification,
  uploadFile,
  deleteFile,
  getSignedUrl,
  validateFile,
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse
} from '@/lib/supabaseServer'

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// ==================== GIGS ENDPOINTS ====================

// GET /api/gigs - Get all gigs (paginated, filtered)
async function handleGetGigs(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'active'
    const search = searchParams.get('search') || ''

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabaseServer
      .from('gigs')
      .select(`
        *,
        gig_dates (*),
        gig_locations (*),
        applications (count)
      `, { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      return errorResponse(error.message, 500)
    }

    return successResponse({
      gigs: data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching gigs:', error)
    return errorResponse('Failed to fetch gigs', 500)
  }
}

// GET /api/gigs/[id] - Get single gig with details
async function handleGetGig(gigId) {
  try {
    const { data, error } = await supabaseServer
      .from('gigs')
      .select(`
        *,
        gig_dates (*),
        gig_locations (*)
      `)
      .eq('id', gigId)
      .single()

    if (error || !data) {
      return notFoundResponse('Gig not found')
    }

    // Get application count (without exposing applicant details)
    const { count } = await supabaseServer
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('gig_id', gigId)

    return successResponse({
      ...data,
      applications_count: count || 0
    })
  } catch (error) {
    console.error('Error fetching gig:', error)
    return errorResponse('Failed to fetch gig', 500)
  }
}

// POST /api/gigs - Create new gig
async function handleCreateGig(request) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    // Check if profile is complete
    const { isComplete } = await checkProfileComplete(user.id)
    if (!isComplete) {
      return forbiddenResponse('Complete your profile before creating a gig')
    }

    const body = await request.json()
    const { title, description, qualifying_criteria, amount, currency, dates, locations } = body

    if (!title || !description) {
      return errorResponse('Title and description are required')
    }

    // Create gig
    const { data: gig, error: gigError } = await supabaseServer
      .from('gigs')
      .insert({
        title,
        description,
        qualifying_criteria,
        amount,
        currency: currency || 'AED',
        status: 'active',
        created_by: user.id
      })
      .select()
      .single()

    if (gigError) {
      return errorResponse(gigError.message, 500)
    }

    // Insert dates if provided
    if (dates && Array.isArray(dates) && dates.length > 0) {
      const dateRecords = dates.map(d => ({
        gig_id: gig.id,
        month: d.month,
        days: d.days
      }))

      await supabaseServer.from('gig_dates').insert(dateRecords)
    }

    // Insert locations if provided
    if (locations && Array.isArray(locations) && locations.length > 0) {
      const locationRecords = locations.map(l => ({
        gig_id: gig.id,
        location_name: typeof l === 'string' ? l : l.location_name
      }))

      await supabaseServer.from('gig_locations').insert(locationRecords)
    }

    // Fetch complete gig with relationships
    const { data: completeGig } = await supabaseServer
      .from('gigs')
      .select(`
        *,
        gig_dates (*),
        gig_locations (*)
      `)
      .eq('id', gig.id)
      .single()

    return successResponse(completeGig, 'Gig created successfully')
  } catch (error) {
    console.error('Error creating gig:', error)
    return errorResponse('Failed to create gig', 500)
  }
}

// PATCH /api/gigs/[id] - Update gig
async function handleUpdateGig(request, gigId) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const body = await request.json()
    const { title, description, qualifying_criteria, amount, currency, status, dates, locations } = body

    // Verify ownership
    const { data: existingGig } = await supabaseServer
      .from('gigs')
      .select('created_by')
      .eq('id', gigId)
      .single()

    if (!existingGig || existingGig.created_by !== user.id) {
      return forbiddenResponse('You can only update your own gigs')
    }

    // Update gig
    const updateData = {}
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (qualifying_criteria !== undefined) updateData.qualifying_criteria = qualifying_criteria
    if (amount !== undefined) updateData.amount = amount
    if (currency) updateData.currency = currency
    if (status) updateData.status = status

    const { error: updateError } = await supabaseServer
      .from('gigs')
      .update(updateData)
      .eq('id', gigId)

    if (updateError) {
      return errorResponse(updateError.message, 500)
    }

    // Update dates if provided
    if (dates && Array.isArray(dates)) {
      // Delete existing dates
      await supabaseServer.from('gig_dates').delete().eq('gig_id', gigId)
      
      // Insert new dates
      if (dates.length > 0) {
        const dateRecords = dates.map(d => ({
          gig_id: gigId,
          month: d.month,
          days: d.days
        }))
        await supabaseServer.from('gig_dates').insert(dateRecords)
      }
    }

    // Update locations if provided
    if (locations && Array.isArray(locations)) {
      // Delete existing locations
      await supabaseServer.from('gig_locations').delete().eq('gig_id', gigId)
      
      // Insert new locations
      if (locations.length > 0) {
        const locationRecords = locations.map(l => ({
          gig_id: gigId,
          location_name: typeof l === 'string' ? l : l.location_name
        }))
        await supabaseServer.from('gig_locations').insert(locationRecords)
      }
    }

    // Fetch updated gig
    const { data: updatedGig } = await supabaseServer
      .from('gigs')
      .select(`
        *,
        gig_dates (*),
        gig_locations (*)
      `)
      .eq('id', gigId)
      .single()

    return successResponse(updatedGig, 'Gig updated successfully')
  } catch (error) {
    console.error('Error updating gig:', error)
    return errorResponse('Failed to update gig', 500)
  }
}

// DELETE /api/gigs/[id] - Delete gig
async function handleDeleteGig(request, gigId) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    // Verify ownership
    const { data: existingGig } = await supabaseServer
      .from('gigs')
      .select('created_by')
      .eq('id', gigId)
      .single()

    if (!existingGig || existingGig.created_by !== user.id) {
      return forbiddenResponse('You can only delete your own gigs')
    }

    const { error } = await supabaseServer
      .from('gigs')
      .delete()
      .eq('id', gigId)

    if (error) {
      return errorResponse(error.message, 500)
    }

    return successResponse(null, 'Gig deleted successfully')
  } catch (error) {
    console.error('Error deleting gig:', error)
    return errorResponse('Failed to delete gig', 500)
  }
}

// ==================== APPLICATION ENDPOINTS ====================

// POST /api/gigs/[id]/apply - Apply to a gig
async function handleApplyToGig(request, gigId) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    // Check if profile is complete
    const { isComplete } = await checkProfileComplete(user.id)
    if (!isComplete) {
      return forbiddenResponse('Complete your profile before applying')
    }

    // Check if gig exists and user is not the creator
    const { data: gig } = await supabaseServer
      .from('gigs')
      .select('id, created_by, title')
      .eq('id', gigId)
      .single()

    if (!gig) {
      return notFoundResponse('Gig not found')
    }

    if (gig.created_by === user.id) {
      return forbiddenResponse('You cannot apply to your own gig')
    }

    // Check if already applied
    const { data: existingApplication } = await supabaseServer
      .from('applications')
      .select('id')
      .eq('gig_id', gigId)
      .eq('applicant_user_id', user.id)
      .single()

    if (existingApplication) {
      return errorResponse('You have already applied to this gig', 400)
    }

    const body = await request.json()
    const { cover_letter, portfolio_links, resume_url, portfolio_files, notes } = body

    // Create application
    const { data: application, error: appError } = await supabaseServer
      .from('applications')
      .insert({
        gig_id: gigId,
        applicant_user_id: user.id,
        status: 'pending',
        cover_letter,
        portfolio_links,
        resume_url,
        portfolio_files,
        notes
      })
      .select()
      .single()

    if (appError) {
      return errorResponse(appError.message, 500)
    }

    // Create notification for gig creator
    await createNotification({
      userId: gig.created_by,
      type: 'application_received',
      title: 'New Application Received',
      message: `Someone applied to your gig: ${gig.title}`,
      relatedGigId: gigId,
      relatedApplicationId: application.id
    })

    return successResponse(application, 'Application submitted successfully')
  } catch (error) {
    console.error('Error applying to gig:', error)
    return errorResponse('Failed to submit application', 500)
  }
}

// GET /api/gigs/[id]/applications - Get applications for a gig
async function handleGetGigApplications(request, gigId) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    // Verify user is the gig creator
    const { data: gig } = await supabaseServer
      .from('gigs')
      .select('created_by')
      .eq('id', gigId)
      .single()

    if (!gig || gig.created_by !== user.id) {
      return forbiddenResponse('You can only view applications to your own gigs')
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabaseServer
      .from('applications')
      .select(`
        *,
        applicant:user_profiles!applications_applicant_user_id_fkey (
          first_name,
          surname,
          alias_first_name,
          alias_surname,
          profile_photo_url,
          phone,
          user_id
        )
      `)
      .eq('gig_id', gigId)
      .order('applied_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return errorResponse(error.message, 500)
    }

    // Get applicant skills for each applicant
    const applicationsWithSkills = await Promise.all(
      data.map(async (app) => {
        const { data: skills } = await supabaseServer
          .from('applicant_skills')
          .select('skill_name')
          .eq('user_id', app.applicant_user_id)

        // Map database field names to API field names for backward compatibility
        const mappedApplicant = app.applicant ? {
          ...app.applicant,
          legal_first_name: app.applicant.first_name,
          legal_surname: app.applicant.surname,
          skills: skills?.map(s => s.skill_name) || []
        } : null;

        return {
          ...app,
          applicant: mappedApplicant
        }
      })
    )

    return successResponse(applicationsWithSkills)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return errorResponse('Failed to fetch applications', 500)
  }
}

// PATCH /api/gigs/[gigId]/applications/[applicationId]/status - Update application status
async function handleUpdateApplicationStatus(request, gigId, applicationId) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    // Verify user is the gig creator
    const { data: gig } = await supabaseServer
      .from('gigs')
      .select('created_by, title')
      .eq('id', gigId)
      .single()

    if (!gig || gig.created_by !== user.id) {
      return forbiddenResponse('You can only update applications to your own gigs')
    }

    const body = await request.json()
    const { status } = body

    if (!['pending', 'shortlisted', 'confirmed', 'released'].includes(status)) {
      return errorResponse('Invalid status value')
    }

    // Update application
    const { data: application, error: updateError } = await supabaseServer
      .from('applications')
      .update({ status })
      .eq('id', applicationId)
      .eq('gig_id', gigId)
      .select()
      .single()

    if (updateError || !application) {
      return errorResponse('Failed to update application status', 500)
    }

    // Create notification for applicant
    const statusMessages = {
      shortlisted: `You've been shortlisted for: ${gig.title}`,
      confirmed: `Congratulations! You've been confirmed for: ${gig.title}`,
      released: `Your application status for "${gig.title}" has been updated to released`
    }

    if (statusMessages[status]) {
      await createNotification({
        userId: application.applicant_user_id,
        type: 'status_changed',
        title: 'Application Status Updated',
        message: statusMessages[status],
        relatedGigId: gigId,
        relatedApplicationId: applicationId
      })
    }

    return successResponse(application, 'Application status updated successfully')
  } catch (error) {
    console.error('Error updating application status:', error)
    return errorResponse('Failed to update application status', 500)
  }
}

// GET /api/applications/my-applications - Get user's applications
async function handleGetMyApplications(request) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const { data, error } = await supabaseServer
      .from('applications')
      .select(`
        *,
        gig:gigs (
          id,
          title,
          description,
          amount,
          currency,
          status,
          gig_dates (*),
          gig_locations (*)
        )
      `)
      .eq('applicant_user_id', user.id)
      .order('applied_at', { ascending: false })

    if (error) {
      return errorResponse(error.message, 500)
    }

    return successResponse(data)
  } catch (error) {
    console.error('Error fetching user applications:', error)
    return errorResponse('Failed to fetch applications', 500)
  }
}

// GET /api/applications/[id] - Get single application
async function handleGetApplication(request, applicationId) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const { data: application, error } = await supabaseServer
      .from('applications')
      .select(`
        *,
        gig:gigs (
          id,
          title,
          description,
          amount,
          currency,
          status,
          created_by,
          gig_dates (*),
          gig_locations (*)
        )
      `)
      .eq('id', applicationId)
      .single()

    if (error || !application) {
      return notFoundResponse('Application not found')
    }

    // Check if user is applicant or gig creator
    if (application.applicant_user_id !== user.id && application.gig.created_by !== user.id) {
      return forbiddenResponse('You do not have access to this application')
    }

    return successResponse(application)
  } catch (error) {
    console.error('Error fetching application:', error)
    return errorResponse('Failed to fetch application', 500)
  }
}

// ==================== SKILLS ENDPOINTS ====================

// GET /api/skills - Get user's skills
async function handleGetSkills(request) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const { data, error } = await supabaseServer
      .from('applicant_skills')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return errorResponse(error.message, 500)
    }

    return successResponse(data)
  } catch (error) {
    console.error('Error fetching skills:', error)
    return errorResponse('Failed to fetch skills', 500)
  }
}

// POST /api/skills - Add skill
async function handleAddSkill(request) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const body = await request.json()
    const { skill_name } = body

    if (!skill_name || skill_name.trim() === '') {
      return errorResponse('Skill name is required')
    }

    const { data, error } = await supabaseServer
      .from('applicant_skills')
      .insert({
        user_id: user.id,
        skill_name: skill_name.trim()
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return errorResponse('You have already added this skill', 400)
      }
      return errorResponse(error.message, 500)
    }

    return successResponse(data, 'Skill added successfully')
  } catch (error) {
    console.error('Error adding skill:', error)
    return errorResponse('Failed to add skill', 500)
  }
}

// DELETE /api/skills/[id] - Remove skill
async function handleDeleteSkill(request, skillId) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const { error } = await supabaseServer
      .from('applicant_skills')
      .delete()
      .eq('id', skillId)
      .eq('user_id', user.id)

    if (error) {
      return errorResponse(error.message, 500)
    }

    return successResponse(null, 'Skill removed successfully')
  } catch (error) {
    console.error('Error deleting skill:', error)
    return errorResponse('Failed to remove skill', 500)
  }
}

// ==================== AVAILABILITY ENDPOINTS ====================

// GET /api/availability - Get user's availability
async function handleGetAvailability(request) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const { searchParams } = new URL(request.url)
    const gigId = searchParams.get('gig_id')

    let query = supabaseServer
      .from('crew_availability')
      .select('*')
      .eq('user_id', user.id)
      .order('availability_date', { ascending: true })

    if (gigId) {
      query = query.eq('gig_id', gigId)
    }

    const { data, error } = await query

    if (error) {
      return errorResponse(error.message, 500)
    }

    return successResponse(data)
  } catch (error) {
    console.error('Error fetching availability:', error)
    return errorResponse('Failed to fetch availability', 500)
  }
}

// POST /api/availability - Set availability
async function handleSetAvailability(request) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const body = await request.json()
    const { availability_date, is_available, gig_id, notes } = body

    if (!availability_date) {
      return errorResponse('Availability date is required')
    }

    const { data, error } = await supabaseServer
      .from('crew_availability')
      .upsert({
        user_id: user.id,
        availability_date,
        is_available: is_available !== undefined ? is_available : true,
        gig_id: gig_id || null,
        notes
      }, {
        onConflict: 'user_id,availability_date'
      })
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 500)
    }

    return successResponse(data, 'Availability set successfully')
  } catch (error) {
    console.error('Error setting availability:', error)
    return errorResponse('Failed to set availability', 500)
  }
}

// GET /api/availability/check - Check availability conflicts
async function handleCheckAvailability(request) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const { searchParams } = new URL(request.url)
    const checkDate = searchParams.get('date')

    if (!checkDate) {
      return errorResponse('Date parameter is required')
    }

    // Get confirmed/shortlisted applications for the user
    const { data: applications } = await supabaseServer
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
    console.error('Error checking availability:', error)
    return errorResponse('Failed to check availability', 500)
  }
}

// PATCH /api/availability/[id] - Update availability
async function handleUpdateAvailability(request, availabilityId) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const body = await request.json()
    const { is_available, notes } = body

    const updateData = {}
    if (is_available !== undefined) updateData.is_available = is_available
    if (notes !== undefined) updateData.notes = notes

    const { data, error } = await supabaseServer
      .from('crew_availability')
      .update(updateData)
      .eq('id', availabilityId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !data) {
      return errorResponse('Failed to update availability', 500)
    }

    return successResponse(data, 'Availability updated successfully')
  } catch (error) {
    console.error('Error updating availability:', error)
    return errorResponse('Failed to update availability', 500)
  }
}

// ==================== CONTACTS ENDPOINTS ====================

// GET /api/contacts/gig/[gigId] - Get contacts for a gig
async function handleGetGigContacts(request, gigId) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    // Verify user is the gig creator
    const { data: gig } = await supabaseServer
      .from('gigs')
      .select('created_by')
      .eq('id', gigId)
      .single()

    if (!gig || gig.created_by !== user.id) {
      return forbiddenResponse('You can only view contacts for your own gigs')
    }

    const { data, error } = await supabaseServer
      .from('crew_contacts')
      .select(`
        *,
        user:user_profiles!crew_contacts_user_id_fkey (
          first_name,
          surname,
          profile_photo_url
        )
      `)
      .eq('gig_id', gigId)
      .order('department', { ascending: true })

    if (error) {
      return errorResponse(error.message, 500)
    }

    // Map database field names to API field names
    const mappedData = data?.map(contact => ({
      ...contact,
      user: contact.user ? {
        ...contact.user,
        legal_first_name: contact.user.first_name,
        legal_surname: contact.user.surname
      } : null
    })) || [];

    return successResponse(mappedData)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return errorResponse('Failed to fetch contacts', 500)
  }
}

// POST /api/contacts - Add contact
async function handleAddContact(request) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const body = await request.json()
    const { gig_id, contact_user_id, department, role, company, phone, email } = body

    if (!gig_id || !contact_user_id || !department || !role) {
      return errorResponse('Gig ID, contact user ID, department, and role are required')
    }

    // Verify user is the gig creator
    const { data: gig } = await supabaseServer
      .from('gigs')
      .select('created_by')
      .eq('id', gig_id)
      .single()

    if (!gig || gig.created_by !== user.id) {
      return forbiddenResponse('You can only add contacts to your own gigs')
    }

    const { data, error } = await supabaseServer
      .from('crew_contacts')
      .insert({
        gig_id,
        user_id: contact_user_id,
        department,
        role,
        company,
        phone,
        email
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return errorResponse('Contact already exists for this department', 400)
      }
      return errorResponse(error.message, 500)
    }

    return successResponse(data, 'Contact added successfully')
  } catch (error) {
    console.error('Error adding contact:', error)
    return errorResponse('Failed to add contact', 500)
  }
}

// DELETE /api/contacts/[id] - Remove contact
async function handleDeleteContact(request, contactId) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    // Verify user owns the gig
    const { data: contact } = await supabaseServer
      .from('crew_contacts')
      .select('gig_id, gigs (created_by)')
      .eq('id', contactId)
      .single()

    if (!contact || !contact.gigs || contact.gigs.created_by !== user.id) {
      return forbiddenResponse('You can only remove contacts from your own gigs')
    }

    const { error } = await supabaseServer
      .from('crew_contacts')
      .delete()
      .eq('id', contactId)

    if (error) {
      return errorResponse(error.message, 500)
    }

    return successResponse(null, 'Contact removed successfully')
  } catch (error) {
    console.error('Error deleting contact:', error)
    return errorResponse('Failed to remove contact', 500)
  }
}

// ==================== REFERRALS ENDPOINTS ====================

// GET /api/referrals - Get user's referrals
async function handleGetReferrals(request) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const { data, error } = await supabaseServer
      .from('referrals')
      .select(`
        *,
        gig:gigs (id, title, description, status),
        referred_user:user_profiles!referrals_referred_user_id_fkey (
          first_name,
          surname,
          profile_photo_url
        ),
        referrer:user_profiles!referrals_referrer_user_id_fkey (
          first_name,
          surname,
          profile_photo_url
        )
      `)
      .or(`referred_user_id.eq.${user.id},referrer_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) {
      return errorResponse(error.message, 500)
    }

    // Map database field names to API field names
    const mappedData = data?.map(referral => ({
      ...referral,
      referred_user: referral.referred_user ? {
        ...referral.referred_user,
        legal_first_name: referral.referred_user.first_name,
        legal_surname: referral.referred_user.surname
      } : null,
      referrer: referral.referrer ? {
        ...referral.referrer,
        legal_first_name: referral.referrer.first_name,
        legal_surname: referral.referrer.surname
      } : null
    })) || [];

    return successResponse(mappedData)
  } catch (error) {
    console.error('Error fetching referrals:', error)
    return errorResponse('Failed to fetch referrals', 500)
  }
}

// POST /api/referrals - Create referral
async function handleCreateReferral(request) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const body = await request.json()
    const { gig_id, referred_user_id } = body

    if (!gig_id || !referred_user_id) {
      return errorResponse('Gig ID and referred user ID are required')
    }

    if (referred_user_id === user.id) {
      return errorResponse('You cannot refer yourself', 400)
    }

    // Check if gig exists
    const { data: gig } = await supabaseServer
      .from('gigs')
      .select('id, title, created_by')
      .eq('id', gig_id)
      .single()

    if (!gig) {
      return notFoundResponse('Gig not found')
    }

    const { data, error } = await supabaseServer
      .from('referrals')
      .insert({
        gig_id,
        referred_user_id,
        referrer_user_id: user.id,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return errorResponse('You have already referred this user to this gig', 400)
      }
      return errorResponse(error.message, 500)
    }

    // Create notification for referred user
    await createNotification({
      userId: referred_user_id,
      type: 'referral_received',
      title: 'New Referral',
      message: `You've been referred to a gig: ${gig.title}`,
      relatedGigId: gig_id
    })

    // Create notification for gig creator
    await createNotification({
      userId: gig.created_by,
      type: 'referral_received',
      title: 'Referral for Your Gig',
      message: `Someone referred a candidate for: ${gig.title}`,
      relatedGigId: gig_id
    })

    return successResponse(data, 'Referral created successfully')
  } catch (error) {
    console.error('Error creating referral:', error)
    return errorResponse('Failed to create referral', 500)
  }
}

// ==================== NOTIFICATIONS ENDPOINTS ====================

// GET /api/notifications - Get user's notifications
async function handleGetNotifications(request) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread_only') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabaseServer
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
      return errorResponse(error.message, 500)
    }

    return successResponse(data)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return errorResponse('Failed to fetch notifications', 500)
  }
}

// PATCH /api/notifications/[id]/read - Mark notification as read
async function handleMarkNotificationRead(request, notificationId) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const { data, error } = await supabaseServer
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !data) {
      return errorResponse('Failed to mark notification as read', 500)
    }

    return successResponse(data, 'Notification marked as read')
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return errorResponse('Failed to mark notification as read', 500)
  }
}

// PATCH /api/notifications/mark-all-read - Mark all notifications as read
async function handleMarkAllNotificationsRead(request) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const { error } = await supabaseServer
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) {
      return errorResponse(error.message, 500)
    }

    return successResponse(null, 'All notifications marked as read')
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return errorResponse('Failed to mark all notifications as read', 500)
  }
}

// ==================== PROFILE ENDPOINTS ====================

// GET /api/profile - Get user profile
async function handleGetProfile(request) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      console.error('[GET /api/profile] Auth error:', authError)
      return unauthorizedResponse('Authentication required')
    }

    console.log('[GET /api/profile] Fetching profile for user_id:', user.id)

    const { data, error } = await supabaseServer
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('[GET /api/profile] Database error:', error)
      console.error('[GET /api/profile] Error code:', error.code)
      console.error('[GET /api/profile] Error message:', error.message)
      return notFoundResponse(`Profile not found: ${error.message}`)
    }

    if (!data) {
      console.log('[GET /api/profile] No profile data found for user_id:', user.id)
      return notFoundResponse('Profile not found - no data returned')
    }

    console.log('[GET /api/profile] Profile found successfully for user_id:', user.id)
    console.log('[GET /api/profile] Profile fields:', Object.keys(data))

    // Map database fields to API fields for consistency
    // Database has: first_name, surname
    // API returns: legal_first_name, legal_surname (for backward compatibility)
    const profileData = {
      ...data,
      legal_first_name: data.first_name,
      legal_surname: data.surname,
      // Keep original fields too for compatibility
      first_name: data.first_name,
      surname: data.surname
    }

    return successResponse(profileData)
  } catch (error) {
    console.error('[GET /api/profile] Unexpected error:', error)
    return errorResponse('Failed to fetch profile', 500)
  }
}

// PATCH /api/profile - Update profile
async function handleUpdateProfile(request) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const body = await request.json()
    
    // Map API field names to database field names
    // API accepts: legal_first_name, legal_surname
    // Database has: first_name, surname
    const fieldMapping = {
      'legal_first_name': 'first_name',
      'legal_surname': 'surname',
      'alias_first_name': 'alias_first_name',
      'alias_surname': 'alias_surname',
      'phone': 'phone',
      'bio': 'bio',
      'profile_photo_url': 'profile_photo_url',
      'banner_url': 'banner_url',
      'country': 'country',
      'city': 'city'
    }

    const updateData = {}
    for (const [apiField, dbField] of Object.entries(fieldMapping)) {
      if (body[apiField] !== undefined) {
        updateData[dbField] = body[apiField]
      }
      // Also support direct database field names
      if (body[dbField] !== undefined) {
        updateData[dbField] = body[dbField]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('No valid fields to update')
    }

    const { data, error } = await supabaseServer
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 500)
    }

    // Map response back to API field names for consistency
    const responseData = {
      ...data,
      legal_first_name: data.first_name,
      legal_surname: data.surname,
      // Keep original fields too for compatibility
      first_name: data.first_name,
      surname: data.surname
    }

    // Re-check profile completeness
    await checkProfileComplete(user.id)

    return successResponse(responseData, 'Profile updated successfully')
  } catch (error) {
    console.error('Error updating profile:', error)
    return errorResponse('Failed to update profile', 500)
  }
}

// GET /api/profile/check-complete - Check if profile is complete
async function handleCheckProfileComplete(request) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const { isComplete, data } = await checkProfileComplete(user.id)

    return successResponse({
      is_complete: isComplete,
      profile: data
    })
  } catch (error) {
    console.error('Error checking profile completeness:', error)
    return errorResponse('Failed to check profile completeness', 500)
  }
}

// ==================== UPLOAD ENDPOINTS ====================

// POST /api/upload/resume - Upload resume
async function handleUploadResume(request) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return errorResponse('No file provided')
    }

    // Validate file
    const validation = validateFile(file, FILE_SIZE_LIMITS.RESUME, ALLOWED_MIME_TYPES.RESUME)
    if (!validation.valid) {
      return errorResponse(validation.error, 400)
    }

    // Generate file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await uploadFile('resumes', filePath, file, buffer)

    if (error) {
      return errorResponse('Failed to upload resume', 500)
    }

    return successResponse({
      path: data.path,
      url: `/api/storage/resumes/${filePath}`
    }, 'Resume uploaded successfully')
  } catch (error) {
    console.error('Error uploading resume:', error)
    return errorResponse('Failed to upload resume', 500)
  }
}

// POST /api/upload/portfolio - Upload portfolio file
async function handleUploadPortfolio(request) {
  try {
    const { user, error: authError } = await getAuthUser(request)
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
      return errorResponse('Failed to upload portfolio file', 500)
    }

    return successResponse({
      path: data.path,
      url: `/api/storage/portfolios/${filePath}`
    }, 'Portfolio file uploaded successfully')
  } catch (error) {
    console.error('Error uploading portfolio:', error)
    return errorResponse('Failed to upload portfolio file', 500)
  }
}

// POST /api/upload/profile-photo - Upload profile photo
async function handleUploadProfilePhoto(request) {
  try {
    const { user, error: authError } = await getAuthUser(request)
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

    // Generate file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await uploadFile('profile-photos', filePath, file, buffer)

    if (error) {
      return errorResponse('Failed to upload profile photo', 500)
    }

    // Update user profile with photo URL
    await supabaseServer
      .from('user_profiles')
      .update({ profile_photo_url: data.publicUrl })
      .eq('user_id', user.id)

    return successResponse({
      path: data.path,
      url: data.publicUrl
    }, 'Profile photo uploaded successfully')
  } catch (error) {
    console.error('Error uploading profile photo:', error)
    return errorResponse('Failed to upload profile photo', 500)
  }
}

// POST /api/upload/profile-banner - Upload profile banner
async function handleUploadProfileBanner(request) {
  try {
    const { user, error: authError } = await getAuthUser(request)
    if (authError || !user) {
      return unauthorizedResponse('Authentication required')
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return errorResponse('No file provided')
    }

    // Validate file (same limits as profile photo)
    const validation = validateFile(file, FILE_SIZE_LIMITS.PROFILE_PHOTO, ALLOWED_MIME_TYPES.PROFILE_PHOTO)
    if (!validation.valid) {
      return errorResponse(validation.error, 400)
    }

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
      return errorResponse('Failed to upload profile banner', 500)
    }

    // Get public URL for banner
    const { data: urlData } = supabaseServer.storage
      .from('profile-banner')
      .getPublicUrl(filePath)

    // Update user profile with banner URL
    await supabaseServer
      .from('user_profiles')
      .update({ banner_url: urlData.publicUrl })
      .eq('user_id', user.id)

    return successResponse({
      path: data.path,
      url: urlData.publicUrl
    }, 'Profile banner uploaded successfully')
  } catch (error) {
    console.error('Error uploading profile banner:', error)
    return errorResponse('Failed to upload profile banner', 500)
  }
}

// ==================== MAIN ROUTE HANDLER ====================

// Route handler function
async function handleRoute(request, context) {
  // In Next.js 14+, params might be a Promise
  const params = await Promise.resolve(context.params)
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method
  
  console.log('[API Route]', method, route, '(path:', path, ')')

  try {
    // Root endpoint - GET /api/root (since /api/ is not accessible with catch-all)
    if (route === '/root' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "HeyProData API v1.0 - Supabase Backend" }))
    }
    // Root endpoint - GET /api/root (since /api/ is not accessible with catch-all)
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "HeyProData API v1.0 - Supabase Backend" }))
    }

    // ==================== GIGS ROUTES ====================
    if (route === '/gigs' && method === 'GET') {
      return handleCORS(await handleGetGigs(request))
    }

    if (route === '/gigs' && method === 'POST') {
      return handleCORS(await handleCreateGig(request))
    }

    const gigIdMatch = route.match(/^\/gigs\/([a-f0-9-]+)$/)
    if (gigIdMatch && method === 'GET') {
      return handleCORS(await handleGetGig(gigIdMatch[1]))
    }

    if (gigIdMatch && method === 'PATCH') {
      return handleCORS(await handleUpdateGig(request, gigIdMatch[1]))
    }

    if (gigIdMatch && method === 'DELETE') {
      return handleCORS(await handleDeleteGig(request, gigIdMatch[1]))
    }

    // ==================== APPLICATION ROUTES ====================
    const applyMatch = route.match(/^\/gigs\/([a-f0-9-]+)\/apply$/)
    if (applyMatch && method === 'POST') {
      return handleCORS(await handleApplyToGig(request, applyMatch[1]))
    }

    const applicationsMatch = route.match(/^\/gigs\/([a-f0-9-]+)\/applications$/)
    if (applicationsMatch && method === 'GET') {
      return handleCORS(await handleGetGigApplications(request, applicationsMatch[1]))
    }

    const statusMatch = route.match(/^\/gigs\/([a-f0-9-]+)\/applications\/([a-f0-9-]+)\/status$/)
    if (statusMatch && method === 'PATCH') {
      return handleCORS(await handleUpdateApplicationStatus(request, statusMatch[1], statusMatch[2]))
    }

    if (route === '/applications/my-applications' && method === 'GET') {
      return handleCORS(await handleGetMyApplications(request))
    }

    const appIdMatch = route.match(/^\/applications\/([a-f0-9-]+)$/)
    if (appIdMatch && method === 'GET') {
      return handleCORS(await handleGetApplication(request, appIdMatch[1]))
    }

    // ==================== SKILLS ROUTES ====================
    if (route === '/skills' && method === 'GET') {
      return handleCORS(await handleGetSkills(request))
    }

    if (route === '/skills' && method === 'POST') {
      return handleCORS(await handleAddSkill(request))
    }

    const skillIdMatch = route.match(/^\/skills\/([a-f0-9-]+)$/)
    if (skillIdMatch && method === 'DELETE') {
      return handleCORS(await handleDeleteSkill(request, skillIdMatch[1]))
    }

    // ==================== AVAILABILITY ROUTES ====================
    if (route === '/availability' && method === 'GET') {
      return handleCORS(await handleGetAvailability(request))
    }

    if (route === '/availability' && method === 'POST') {
      return handleCORS(await handleSetAvailability(request))
    }

    if (route === '/availability/check' && method === 'GET') {
      return handleCORS(await handleCheckAvailability(request))
    }

    const availIdMatch = route.match(/^\/availability\/([a-f0-9-]+)$/)
    if (availIdMatch && method === 'PATCH') {
      return handleCORS(await handleUpdateAvailability(request, availIdMatch[1]))
    }

    // ==================== CONTACTS ROUTES ====================
    const gigContactsMatch = route.match(/^\/contacts\/gig\/([a-f0-9-]+)$/)
    if (gigContactsMatch && method === 'GET') {
      return handleCORS(await handleGetGigContacts(request, gigContactsMatch[1]))
    }

    if (route === '/contacts' && method === 'POST') {
      return handleCORS(await handleAddContact(request))
    }

    const contactIdMatch = route.match(/^\/contacts\/([a-f0-9-]+)$/)
    if (contactIdMatch && method === 'DELETE') {
      return handleCORS(await handleDeleteContact(request, contactIdMatch[1]))
    }

    // ==================== REFERRALS ROUTES ====================
    if (route === '/referrals' && method === 'GET') {
      return handleCORS(await handleGetReferrals(request))
    }

    if (route === '/referrals' && method === 'POST') {
      return handleCORS(await handleCreateReferral(request))
    }

    // ==================== NOTIFICATIONS ROUTES ====================
    if (route === '/notifications' && method === 'GET') {
      return handleCORS(await handleGetNotifications(request))
    }

    const notifReadMatch = route.match(/^\/notifications\/([a-f0-9-]+)\/read$/)
    if (notifReadMatch && method === 'PATCH') {
      return handleCORS(await handleMarkNotificationRead(request, notifReadMatch[1]))
    }

    if (route === '/notifications/mark-all-read' && method === 'PATCH') {
      return handleCORS(await handleMarkAllNotificationsRead(request))
    }

    // ==================== PROFILE ROUTES ====================
    if (route === '/profile' && method === 'GET') {
      return handleCORS(await handleGetProfile(request))
    }

    if (route === '/profile' && method === 'PATCH') {
      return handleCORS(await handleUpdateProfile(request))
    }

    if (route === '/profile/check-complete' && method === 'GET') {
      return handleCORS(await handleCheckProfileComplete(request))
    }

    // ==================== UPLOAD ROUTES ====================
    if (route === '/upload/resume' && method === 'POST') {
      return handleCORS(await handleUploadResume(request))
    }

    if (route === '/upload/portfolio' && method === 'POST') {
      return handleCORS(await handleUploadPortfolio(request))
    }

    if (route === '/upload/profile-photo' && method === 'POST') {
      return handleCORS(await handleUploadProfilePhoto(request))
    }

    if (route === '/upload/profile-banner' && method === 'POST') {
      return handleCORS(await handleUploadProfileBanner(request))
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` }, 
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: "Internal server error", details: error.message }, 
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute