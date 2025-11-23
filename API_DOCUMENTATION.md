# HeyProData API Documentation

## Base URL
All API requests should be made to: `{NEXT_PUBLIC_BASE_URL}/api`

## Authentication
All protected endpoints require an `Authorization` header with a Bearer token:
```
Authorization: Bearer {supabase_access_token}
```

## Response Format
All responses follow this structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Optional detailed error information"
}
```

---

## Gigs Management

### 1. Get All Gigs
**Endpoint:** `GET /api/gigs`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (default: "active")
- `search` (optional): Search in title and description

**Response:**
```json
{
  "success": true,
  "data": {
    "gigs": [
      {
        "id": "uuid",
        "title": "Director of Photography",
        "description": "Looking for an experienced DP...",
        "status": "active",
        "amount": 5000,
        "currency": "AED",
        "created_by": "user-uuid",
        "created_at": "2025-07-01T10:00:00Z",
        "gig_dates": [...],
        "gig_locations": [...],
        "applications_count": 5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

---

### 2. Get Single Gig
**Endpoint:** `GET /api/gigs/{gigId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Director of Photography",
    "description": "Looking for an experienced DP...",
    "qualifying_criteria": "5+ years experience",
    "amount": 5000,
    "currency": "AED",
    "status": "active",
    "created_by": "user-uuid",
    "created_at": "2025-07-01T10:00:00Z",
    "updated_at": "2025-07-01T10:00:00Z",
    "gig_dates": [
      {
        "id": "uuid",
        "gig_id": "gig-uuid",
        "month": "August",
        "days": "1-5, 10-15"
      }
    ],
    "gig_locations": [
      {
        "id": "uuid",
        "gig_id": "gig-uuid",
        "location_name": "Dubai, UAE"
      }
    ],
    "applications_count": 5
  }
}
```

---

### 3. Create Gig
**Endpoint:** `POST /api/gigs`

**Auth Required:** Yes  
**Profile Must Be Complete:** Yes

**Request Body:**
```json
{
  "title": "Director of Photography",
  "description": "Looking for an experienced DP for a feature film",
  "qualifying_criteria": "5+ years experience in feature films",
  "amount": 5000,
  "currency": "AED",
  "dates": [
    {
      "month": "August",
      "days": "1-5, 10-15"
    },
    {
      "month": "September",
      "days": "1-10"
    }
  ],
  "locations": [
    "Dubai, UAE",
    "Abu Dhabi, UAE"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Gig created successfully",
  "data": { ... }
}
```

---

### 4. Update Gig
**Endpoint:** `PATCH /api/gigs/{gigId}`

**Auth Required:** Yes (Must be gig creator)

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "qualifying_criteria": "Updated criteria",
  "amount": 6000,
  "currency": "USD",
  "status": "closed",
  "dates": [...],
  "locations": [...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Gig updated successfully",
  "data": { ... }
}
```

---

### 5. Delete Gig
**Endpoint:** `DELETE /api/gigs/{gigId}`

**Auth Required:** Yes (Must be gig creator)

**Response:**
```json
{
  "success": true,
  "message": "Gig deleted successfully"
}
```

---

## Applications

### 6. Apply to Gig
**Endpoint:** `POST /api/gigs/{gigId}/apply`

**Auth Required:** Yes  
**Profile Must Be Complete:** Yes  
**Cannot Apply:** To own gigs

**Request Body:**
```json
{
  "cover_letter": "I am interested in this position...",
  "portfolio_links": ["https://vimeo.com/...", "https://youtube.com/..."],
  "resume_url": "/api/storage/resumes/user-id/resume.pdf",
  "portfolio_files": ["/api/storage/portfolios/user-id/file1.pdf"],
  "notes": "Available immediately"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": "uuid",
    "gig_id": "gig-uuid",
    "applicant_user_id": "user-uuid",
    "status": "pending",
    "applied_at": "2025-07-01T10:00:00Z",
    ...
  }
}
```

**Notifications Created:**
- Gig creator receives "application_received" notification

---

### 7. Get Applications for a Gig
**Endpoint:** `GET /api/gigs/{gigId}/applications`

**Auth Required:** Yes (Must be gig creator)

**Query Parameters:**
- `status` (optional): Filter by status (pending, shortlisted, confirmed, released)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "gig_id": "gig-uuid",
      "applicant_user_id": "user-uuid",
      "status": "pending",
      "cover_letter": "...",
      "portfolio_links": [...],
      "resume_url": "...",
      "applied_at": "2025-07-01T10:00:00Z",
      "applicant": {
        "legal_first_name": "John",
        "legal_surname": "Doe",
        "profile_photo_url": "...",
        "phone": "+971...",
        "user_id": "uuid",
        "skills": ["Cinematography", "Lighting", "Color Grading"]
      }
    }
  ]
}
```

---

### 8. Update Application Status
**Endpoint:** `PATCH /api/gigs/{gigId}/applications/{applicationId}/status`

**Auth Required:** Yes (Must be gig creator)

**Request Body:**
```json
{
  "status": "shortlisted"
}
```

**Valid Status Values:**
- `pending`
- `shortlisted`
- `confirmed`
- `released`

**Response:**
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": { ... }
}
```

**Notifications Created:**
- Applicant receives "status_changed" notification

---

### 9. Get My Applications
**Endpoint:** `GET /api/applications/my-applications`

**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "gig_id": "gig-uuid",
      "status": "shortlisted",
      "applied_at": "2025-07-01T10:00:00Z",
      "gig": {
        "id": "uuid",
        "title": "Director of Photography",
        "description": "...",
        "amount": 5000,
        "currency": "AED",
        "status": "active",
        "gig_dates": [...],
        "gig_locations": [...]
      }
    }
  ]
}
```

---

### 10. Get Single Application
**Endpoint:** `GET /api/applications/{applicationId}`

**Auth Required:** Yes (Must be applicant or gig creator)

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## Skills Management

### 11. Get User Skills
**Endpoint:** `GET /api/skills`

**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "skill_name": "Cinematography",
      "created_at": "2025-07-01T10:00:00Z"
    }
  ]
}
```

---

### 12. Add Skill
**Endpoint:** `POST /api/skills`

**Auth Required:** Yes

**Request Body:**
```json
{
  "skill_name": "Color Grading"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Skill added successfully",
  "data": { ... }
}
```

---

### 13. Remove Skill
**Endpoint:** `DELETE /api/skills/{skillId}`

**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "message": "Skill removed successfully"
}
```

---

## Availability Management

### 14. Get User Availability
**Endpoint:** `GET /api/availability`

**Auth Required:** Yes

**Query Parameters:**
- `gig_id` (optional): Filter by gig

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "gig_id": "gig-uuid",
      "availability_date": "2025-08-01",
      "is_available": true,
      "notes": "Available all day"
    }
  ]
}
```

---

### 15. Set Availability
**Endpoint:** `POST /api/availability`

**Auth Required:** Yes

**Request Body:**
```json
{
  "availability_date": "2025-08-01",
  "is_available": true,
  "gig_id": "gig-uuid",
  "notes": "Available all day"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Availability set successfully",
  "data": { ... }
}
```

---

### 16. Check Availability Conflicts
**Endpoint:** `GET /api/availability/check`

**Auth Required:** Yes

**Query Parameters:**
- `date` (required): Date to check (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2025-08-01",
    "hasConflicts": true,
    "conflicts": [
      {
        "gig": {
          "id": "uuid",
          "title": "Film Project"
        },
        "status": "confirmed"
      }
    ]
  }
}
```

---

### 17. Update Availability
**Endpoint:** `PATCH /api/availability/{availabilityId}`

**Auth Required:** Yes

**Request Body:**
```json
{
  "is_available": false,
  "notes": "Updated notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Availability updated successfully",
  "data": { ... }
}
```

---

## Contacts Management

### 18. Get Contacts for Gig
**Endpoint:** `GET /api/contacts/gig/{gigId}`

**Auth Required:** Yes (Must be gig creator)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "gig_id": "gig-uuid",
      "user_id": "user-uuid",
      "department": "Camera",
      "role": "First AC",
      "company": "Production Company XYZ",
      "phone": "+971...",
      "email": "contact@example.com",
      "user": {
        "legal_first_name": "John",
        "legal_surname": "Doe",
        "profile_photo_url": "..."
      }
    }
  ]
}
```

---

### 19. Add Contact
**Endpoint:** `POST /api/contacts`

**Auth Required:** Yes (Must be gig creator)

**Request Body:**
```json
{
  "gig_id": "gig-uuid",
  "contact_user_id": "user-uuid",
  "department": "Camera",
  "role": "First AC",
  "company": "Production Company XYZ",
  "phone": "+971...",
  "email": "contact@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact added successfully",
  "data": { ... }
}
```

---

### 20. Remove Contact
**Endpoint:** `DELETE /api/contacts/{contactId}`

**Auth Required:** Yes (Must be gig creator)

**Response:**
```json
{
  "success": true,
  "message": "Contact removed successfully"
}
```

---

## Referrals

### 21. Get User Referrals
**Endpoint:** `GET /api/referrals`

**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "gig_id": "gig-uuid",
      "referred_user_id": "user-uuid",
      "referrer_user_id": "user-uuid",
      "status": "pending",
      "created_at": "2025-07-01T10:00:00Z",
      "gig": {
        "id": "uuid",
        "title": "Director of Photography",
        "description": "...",
        "status": "active"
      },
      "referred_user": {
        "legal_first_name": "John",
        "legal_surname": "Doe",
        "profile_photo_url": "..."
      },
      "referrer": {
        "legal_first_name": "Jane",
        "legal_surname": "Smith",
        "profile_photo_url": "..."
      }
    }
  ]
}
```

---

### 22. Create Referral
**Endpoint:** `POST /api/referrals`

**Auth Required:** Yes

**Request Body:**
```json
{
  "gig_id": "gig-uuid",
  "referred_user_id": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Referral created successfully",
  "data": { ... }
}
```

**Notifications Created:**
- Referred user receives "referral_received" notification
- Gig creator receives "referral_received" notification

---

## Notifications

### 23. Get User Notifications
**Endpoint:** `GET /api/notifications`

**Auth Required:** Yes

**Query Parameters:**
- `unread_only` (optional): Set to "true" to get only unread notifications
- `limit` (optional): Number of notifications to retrieve (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "type": "application_received",
      "title": "New Application Received",
      "message": "Someone applied to your gig: Director of Photography",
      "related_gig_id": "gig-uuid",
      "related_application_id": "app-uuid",
      "is_read": false,
      "created_at": "2025-07-01T10:00:00Z"
    }
  ]
}
```

**Notification Types:**
- `application_received`: New application to your gig
- `status_changed`: Your application status was updated
- `referral_received`: You were referred to a gig

---

### 24. Mark Notification as Read
**Endpoint:** `PATCH /api/notifications/{notificationId}/read`

**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": { ... }
}
```

---

### 25. Mark All Notifications as Read
**Endpoint:** `PATCH /api/notifications/mark-all-read`

**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## Profile Management

### 26. Get User Profile
**Endpoint:** `GET /api/profile`

**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "legal_first_name": "John",
    "legal_surname": "Doe",
    "alias_first_name": "Johnny",
    "alias_surname": "D",
    "phone": "+971...",
    "profile_photo_url": "...",
    "bio": "Experienced cinematographer...",
    "country": "United Arab Emirates",
    "city": "Dubai",
    "is_profile_complete": true,
    "created_at": "2025-07-01T10:00:00Z",
    "updated_at": "2025-07-01T10:00:00Z"
  }
}
```

---

### 27. Update Profile
**Endpoint:** `PATCH /api/profile`

**Auth Required:** Yes

**Request Body:** (All fields optional)
```json
{
  "legal_first_name": "John",
  "legal_surname": "Doe",
  "alias_first_name": "Johnny",
  "alias_surname": "D",
  "phone": "+971...",
  "bio": "Experienced cinematographer with 10+ years...",
  "profile_photo_url": "...",
  "country": "United Arab Emirates",
  "city": "Dubai"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

---

### 28. Check Profile Completeness
**Endpoint:** `GET /api/profile/check-complete`

**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "data": {
    "is_complete": true,
    "profile": { ... }
  }
}
```

**Profile is considered complete when:**
- Legal first name is filled
- Legal surname is filled
- Phone number is filled
- Profile photo is uploaded

---

## File Uploads

### 29. Upload Resume
**Endpoint:** `POST /api/upload/resume`

**Auth Required:** Yes

**Content-Type:** `multipart/form-data`

**Request Body:**
```
file: [PDF, DOC, or DOCX file, max 5MB]
```

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "path": "user-id/12345.pdf",
    "url": "/api/storage/resumes/user-id/12345.pdf"
  }
}
```

**Allowed File Types:**
- application/pdf
- application/msword
- application/vnd.openxmlformats-officedocument.wordprocessingml.document

**Max File Size:** 5 MB

---

### 30. Upload Portfolio File
**Endpoint:** `POST /api/upload/portfolio`

**Auth Required:** Yes

**Content-Type:** `multipart/form-data`

**Request Body:**
```
file: [PDF, Image, or Video file, max 10MB]
```

**Response:**
```json
{
  "success": true,
  "message": "Portfolio file uploaded successfully",
  "data": {
    "path": "user-id/12345.pdf",
    "url": "/api/storage/portfolios/user-id/12345.pdf"
  }
}
```

**Allowed File Types:**
- application/pdf
- image/jpeg, image/png, image/gif, image/webp
- video/mp4, video/quicktime, video/x-msvideo

**Max File Size:** 10 MB

---

### 31. Upload Profile Photo
**Endpoint:** `POST /api/upload/profile-photo`

**Auth Required:** Yes

**Content-Type:** `multipart/form-data`

**Request Body:**
```
file: [Image file, max 2MB]
```

**Response:**
```json
{
  "success": true,
  "message": "Profile photo uploaded successfully",
  "data": {
    "path": "user-id/12345.jpg",
    "url": "https://...supabase.co/storage/v1/object/public/profile-photos/user-id/12345.jpg"
  }
}
```

**Allowed File Types:**
- image/jpeg
- image/png
- image/webp

**Max File Size:** 2 MB

**Note:** Profile photo URL is automatically updated in user profile

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request (validation error, missing fields) |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found (resource doesn't exist) |
| 500 | Internal Server Error |

---

## Common Error Responses

### Authentication Error
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### Profile Incomplete Error
```json
{
  "success": false,
  "error": "Complete your profile before creating a gig"
}
```

### Permission Denied Error
```json
{
  "success": false,
  "error": "You can only update your own gigs"
}
```

### Validation Error
```json
{
  "success": false,
  "error": "Title and description are required"
}
```

### File Upload Error
```json
{
  "success": false,
  "error": "File size exceeds 5MB limit"
}
```

---

## Testing with cURL

### Example: Create a Gig
```bash
curl -X POST http://localhost:3000/api/gigs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Director of Photography",
    "description": "Looking for an experienced DP",
    "amount": 5000,
    "currency": "AED",
    "dates": [
      {
        "month": "August",
        "days": "1-5"
      }
    ],
    "locations": ["Dubai, UAE"]
  }'
```

### Example: Get All Gigs
```bash
curl -X GET "http://localhost:3000/api/gigs?page=1&limit=10&status=active" \
  -H "Content-Type: application/json"
```

### Example: Apply to a Gig
```bash
curl -X POST http://localhost:3000/api/gigs/{gigId}/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "cover_letter": "I am interested in this position...",
    "portfolio_links": ["https://vimeo.com/..."],
    "resume_url": "/api/storage/resumes/user-id/resume.pdf"
  }'
```

### Example: Upload Resume
```bash
curl -X POST http://localhost:3000/api/upload/resume \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/resume.pdf"
```

---

## Rate Limiting & Best Practices

1. **Authentication**: Always include the Authorization header with a valid Supabase access token
2. **Profile Completeness**: Ensure user profile is complete before creating gigs or applying
3. **File Uploads**: Use multipart/form-data for file uploads
4. **Error Handling**: Check the `success` field in responses and handle errors appropriately
5. **Pagination**: Use pagination for list endpoints to improve performance
6. **Validation**: Validate data on the client side before making API calls

---

## Supabase Row Level Security (RLS)

All database operations respect Supabase Row Level Security policies:

- Users can only view their own applications
- Gig creators can view all applications to their gigs
- Users cannot apply to their own gigs
- Only gig creators can update/delete their gigs
- Only gig creators can update application statuses
- Profile completeness is checked before creating gigs or applying

---

## Support

For issues or questions about the API, please contact the development team or refer to the project documentation.

---

**Last Updated:** July 2025  
**API Version:** 1.0.0
