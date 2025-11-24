// Supabase Server-Side Utilities for API Routes
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Server-side Supabase client
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get authenticated user from request
export async function getAuthUser(request) {
  try {
    const authHeader = request.headers.get('authorization');
    console.log('[getAuthUser] Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[getAuthUser] Missing or invalid authorization header');
      return { error: 'Missing or invalid authorization header', user: null };
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('[getAuthUser] Token:', token.substring(0, 30) + '...');
    
    const { data: { user }, error } = await supabaseServer.auth.getUser(token);
    
    if (error || !user) {
      console.log('[getAuthUser] Error getting user:', error?.message || 'User not found');
      return { error: 'Invalid token or user not found', user: null };
    }

    console.log('[getAuthUser] User authenticated:', user.id);
    return { user, error: null };
  } catch (error) {
    console.log('[getAuthUser] Exception:', error.message);
    return { error: error.message, user: null };
  }
}

// Helper function to check if user profile is complete
export async function checkProfileComplete(userId) {
  try {
    const { data, error } = await supabaseServer
      .from('user_profiles')
      .select('is_profile_complete, first_name, surname, legal_first_name, legal_surname, phone, profile_photo_url')
      .eq('user_id', userId)
      .single();

    if (error) {
      return { isComplete: false, error: error.message };
    }

    // Check if all required fields are filled
    // Support both field name formats (first_name OR legal_first_name)
    const firstName = data?.first_name || data?.legal_first_name;
    const surname = data?.surname || data?.legal_surname;
    
    const isComplete = !!(
      firstName &&
      surname &&
      data?.phone &&
      data?.profile_photo_url
    );

    // Update is_profile_complete if it doesn't match
    if (isComplete !== data.is_profile_complete) {
      await supabaseServer
        .from('user_profiles')
        .update({ is_profile_complete: isComplete })
        .eq('user_id', userId);
    }

    return { isComplete, error: null, data };
  } catch (error) {
    return { isComplete: false, error: error.message };
  }
}

// Helper function to create notification
export async function createNotification({
  userId,
  type,
  title,
  message,
  relatedGigId = null,
  relatedApplicationId = null
}) {
  try {
    const { data, error } = await supabaseServer
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        related_gig_id: relatedGigId,
        related_application_id: relatedApplicationId,
        is_read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { data: null, error };
  }
}

// Helper function to upload file to Supabase Storage
export async function uploadFile(bucket, filePath, file, fileBuffer) {
  try {
    const { data, error } = await supabaseServer.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error(`Error uploading to ${bucket}:`, error);
      return { data: null, error };
    }

    // Get public URL for public buckets (profile-photos and profile-banner)
    if (bucket === 'profile-photos' || bucket === 'profile-banner') {
      const { data: urlData } = supabaseServer.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      return { data: { ...data, publicUrl: urlData.publicUrl }, error: null };
    }

    // For private buckets, return the path (URL will be generated on-demand with signed URL)
    return { data: { ...data, path: filePath }, error: null };
  } catch (error) {
    console.error(`Error uploading to ${bucket}:`, error);
    return { data: null, error };
  }
}

// Helper function to delete file from Supabase Storage
export async function deleteFile(bucket, filePath) {
  try {
    const { error } = await supabaseServer.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error(`Error deleting from ${bucket}:`, error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error(`Error deleting from ${bucket}:`, error);
    return { error };
  }
}

// Helper function to get signed URL for private files
export async function getSignedUrl(bucket, filePath, expiresIn = 3600) {
  try {
    const { data, error } = await supabaseServer.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error(`Error creating signed URL for ${bucket}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error creating signed URL for ${bucket}:`, error);
    return { data: null, error };
  }
}

// Helper to validate file size and type
export function validateFile(file, maxSizeBytes, allowedMimeTypes) {
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeBytes / 1024 / 1024}MB limit`
    };
  }

  if (!allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`
    };
  }

  return { valid: true, error: null };
}

// File size constants
export const FILE_SIZE_LIMITS = {
  RESUME: 5 * 1024 * 1024, // 5 MB
  PORTFOLIO: 10 * 1024 * 1024, // 10 MB
  PROFILE_PHOTO: 2 * 1024 * 1024 // 2 MB
};

// Allowed MIME types
export const ALLOWED_MIME_TYPES = {
  RESUME: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  PORTFOLIO: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo'
  ],
  PROFILE_PHOTO: [
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
};

// Response helpers
export function successResponse(data, message = 'Success') {
  return Response.json({ success: true, message, data }, { status: 200 });
}

export function errorResponse(message, status = 400, details = null) {
  return Response.json({ success: false, error: message, details }, { status });
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return Response.json({ success: false, error: message }, { status: 401 });
}

export function forbiddenResponse(message = 'Forbidden') {
  return Response.json({ success: false, error: message }, { status: 403 });
}

export function notFoundResponse(message = 'Not found') {
  return Response.json({ success: false, error: message }, { status: 404 });
}
