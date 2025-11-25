# API Endpoints Reference

Complete reference for all 31 API endpoints in the HeyProData backend.

---

## 🌐 Base URL

```
Production: {NEXT_PUBLIC_BASE_URL}/api
Local: http://localhost:3000/api
```

**Get Base URL from environment:**
```javascript
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const apiUrl = `${baseUrl}/api`;
```

---

## 🔐 Authentication

All authenticated endpoints require an Authorization header:

```http
Authorization: Bearer {supabase_access_token}
```

**Getting the token:**
```javascript
import { supabase } from '@/lib/supabase';

const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Use in API calls
fetch('/api/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 📋 Endpoint Categories

### Quick Reference

| Category | Endpoints | Description |
|----------|-----------|-------------|
| **Gigs** | 5 | Create, read, update, delete gigs |
| **Applications** | 6 | Apply to gigs, manage applications |
| **Profile** | 4 | User profile management |
| **Skills** | 3 | Manage user skills |
| **Availability** | 4 | Calendar and availability |
| **Notifications** | 3 | In-app notifications |
| **Contacts** | 3 | Gig contacts management |
| **Referrals** | 2 | Refer users to gigs |
| **Uploads** | 3 | File uploads (resume, portfolio, photo) |

**Total: 31 Endpoints**

---

## 🎬 GIGS ENDPOINTS (5)

### 1. Get All Gigs

**Endpoint:** `GET /api/gigs`  
**Auth Required:** No (Public access for active gigs)

**Query Parameters:**
```typescript
{
  page?: number;      // Default: 1
  limit?: number;     // Default: 10
  status?: string;    // Default: "active" (active | closed | draft)
  search?: string;    // Search in title and description
}
```

**Example Request:**
```javascript
const response = await fetch('/api/gigs?page=1&limit=10&status=active&search=director');
const data = await response.json();
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "gigs": [
      {
        "id": "uuid",
        "title": "Director of Photography",
        "description": "Looking for experienced DP...",
        "amount": 5000,
        "currency": "AED",
        "status": "active",
        "created_by": "user-uuid",
        "created_at": "2025-07-01T10:00:00Z",
        "gig_dates": [
          { "month": "August", "days": "1-5, 10-15" }
        ],
        "gig_locations": [
          { "location_name": "Dubai, UAE" }
        ],
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
**Auth Required:** No (for active gigs)

**Example Request:**
```javascript
const gigId = 'uuid-here';
const response = await fetch(`/api/gigs/${gigId}`);
const data = await response.json();
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Director of Photography",
    "description": "Detailed description...",
    "qualifying_criteria": "5+ years experience",
    "amount": 5000,
    "currency": "AED",
    "status": "active",
    "created_by": "user-uuid",
    "created_at": "2025-07-01T10:00:00Z",
    "updated_at": "2025-07-01T10:00:00Z",
    "gig_dates": [...],
    "gig_locations": [...],
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
```typescript
{
  title: string;              // Required
  description: string;        // Required
  qualifying_criteria: string; // Optional
  amount: number;             // Required
  currency: string;           // Default: "AED"
  dates: Array<{              // Optional
    month: string;
    days: string;
  }>;
  locations: string[];        // Optional
}
```

**Example Request:**
```javascript
const response = await fetch('/api/gigs', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Director of Photography',
    description: 'Looking for experienced DP for feature film',
    qualifying_criteria: '5+ years experience',
    amount: 5000,
    currency: 'AED',
    dates: [
      { month: 'August', days: '1-5, 10-15' },
      { month: 'September', days: '1-10' }
    ],
    locations: ['Dubai, UAE', 'Abu Dhabi, UAE']
  })
});
```

**Success Response:**
```json
{
  "success": true,
  "message": "Gig created successfully",
  "data": { /* complete gig object */ }
}
```

---

### 4. Update Gig

**Endpoint:** `PATCH /api/gigs/{gigId}`  
**Auth Required:** Yes (Must be gig creator)

**Request Body:** (All fields optional)
```typescript
{
  title?: string;
  description?: string;
  qualifying_criteria?: string;
  amount?: number;
  currency?: string;
  status?: 'active' | 'closed' | 'draft';
  dates?: Array<{ month: string; days: string; }>;
  locations?: string[];
}
```

**Example Request:**
```javascript
const response = await fetch(`/api/gigs/${gigId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'closed',
    amount: 6000
  })
});
```

---

### 5. Delete Gig

**Endpoint:** `DELETE /api/gigs/{gigId}`  
**Auth Required:** Yes (Must be gig creator)

**Example Request:**
```javascript
const response = await fetch(`/api/gigs/${gigId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 📝 APPLICATIONS ENDPOINTS (6)

### 6. Apply to Gig

**Endpoint:** `POST /api/gigs/{gigId}/apply`  
**Auth Required:** Yes  
**Profile Must Be Complete:** Yes  
**Cannot Apply to Own Gigs**

**Request Body:**
```typescript
{
  cover_letter: string;        // Required
  portfolio_links?: string[];  // Optional
  resume_url?: string;         // Optional
  portfolio_files?: string[];  // Optional
  notes?: string;              // Optional
}
```

**Example Request:**
```javascript
// Step 1: Upload resume first
const formData = new FormData();
formData.append('file', resumeFile);
const uploadResponse = await fetch('/api/upload/resume', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
const { data: { url: resumeUrl } } = await uploadResponse.json();

// Step 2: Submit application
const response = await fetch(`/api/gigs/${gigId}/apply`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    cover_letter: 'I am interested in this position...',
    portfolio_links: ['https://vimeo.com/...'],
    resume_url: resumeUrl,
    notes: 'Available immediately'
  })
});
```

**Success Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": "app-uuid",
    "gig_id": "gig-uuid",
    "applicant_user_id": "user-uuid",
    "status": "pending",
    "applied_at": "2025-07-01T10:00:00Z"
  }
}
```

**Note:** This automatically creates a notification for the gig creator.

---

### 7. Get Applications for a Gig

**Endpoint:** `GET /api/gigs/{gigId}/applications`  
**Auth Required:** Yes (Must be gig creator)

**Query Parameters:**
```typescript
{
  status?: 'pending' | 'shortlisted' | 'confirmed' | 'released'
}
```

**Example Request:**
```javascript
const response = await fetch(`/api/gigs/${gigId}/applications?status=pending`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Success Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "app-uuid",
      "gig_id": "gig-uuid",
      "applicant_user_id": "user-uuid",
      "status": "pending",
      "cover_letter": "...",
      "portfolio_links": ["..."],
      "resume_url": "...",
      "applied_at": "2025-07-01T10:00:00Z",
      "applicant": {
        "legal_first_name": "John",
        "legal_surname": "Doe",
        "profile_photo_url": "...",
        "phone": "+971...",
        "user_id": "uuid",
        "skills": ["Cinematography", "Lighting"]
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
```typescript
{
  status: 'pending' | 'shortlisted' | 'confirmed' | 'released'
}
```

**Example Request:**
```javascript
const response = await fetch(`/api/gigs/${gigId}/applications/${appId}/status`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ status: 'shortlisted' })
});
```

**Note:** This automatically creates a notification for the applicant.

---

### 9. Get My Applications

**Endpoint:** `GET /api/applications/my`  
**Auth Required:** Yes

**Example Request:**
```javascript
const response = await fetch('/api/applications/my', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Success Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "app-uuid",
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

**Example Request:**
```javascript
const response = await fetch(`/api/applications/${appId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 👤 PROFILE ENDPOINTS (4)

### 11. Get User Profile

**Endpoint:** `GET /api/profile`  
**Auth Required:** Yes

**Example Request:**
```javascript
const response = await fetch('/api/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Success Response:**
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
    "banner_url": "...",
    "bio": "Experienced cinematographer...",
    "country": "United Arab Emirates",
    "city": "Dubai",
    "is_profile_complete": true,
    "created_at": "2025-07-01T10:00:00Z"
  }
}
```

**Note:** Returns `null` if no profile exists (not 404).

---

### 12. Update Profile

**Endpoint:** `PATCH /api/profile`  
**Auth Required:** Yes

**Request Body:** (All fields optional)
```typescript
{
  legal_first_name?: string;
  legal_surname?: string;
  alias_first_name?: string;
  alias_surname?: string;
  phone?: string;
  bio?: string;
  profile_photo_url?: string;
  banner_url?: string;
  country?: string;
  city?: string;
}
```

**Example Request:**
```javascript
const response = await fetch('/api/profile', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    bio: 'Updated bio text',
    city: 'Abu Dhabi'
  })
});
```

---

### 13. Check Profile Completeness

**Endpoint:** `GET /api/profile/check`  
**Auth Required:** Yes

**Example Request:**
```javascript
const response = await fetch('/api/profile/check', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "is_complete": true,
    "profile": { /* profile data */ }
  }
}
```

**Profile is complete when:**
- Legal first name is filled
- Legal surname is filled
- Phone number is filled
- Profile photo is uploaded

---

## 🎯 SKILLS ENDPOINTS (3)

### 14. Get User Skills

**Endpoint:** `GET /api/skills`  
**Auth Required:** Yes

**Example Request:**
```javascript
const response = await fetch('/api/skills', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Success Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "skill_name": "Cinematography",
      "created_at": "2025-07-01T10:00:00Z"
    },
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "skill_name": "Color Grading",
      "created_at": "2025-07-01T10:00:00Z"
    }
  ]
}
```

---

### 15. Add Skill

**Endpoint:** `POST /api/skills`  
**Auth Required:** Yes

**Request Body:**
```typescript
{
  skill_name: string  // Required
}
```

**Example Request:**
```javascript
const response = await fetch('/api/skills', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    skill_name: 'Lighting Design'
  })
});
```

---

### 16. Remove Skill

**Endpoint:** `DELETE /api/skills/{skillId}`  
**Auth Required:** Yes

**Example Request:**
```javascript
const response = await fetch(`/api/skills/${skillId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 📅 AVAILABILITY ENDPOINTS (4)

### 17. Get User Availability

**Endpoint:** `GET /api/availability`  
**Auth Required:** Yes

**Query Parameters:**
```typescript
{
  gig_id?: string  // Optional: filter by gig
}
```

**Example Request:**
```javascript
const response = await fetch('/api/availability', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

### 18. Set Availability

**Endpoint:** `POST /api/availability`  
**Auth Required:** Yes

**Request Body:**
```typescript
{
  availability_date: string;  // YYYY-MM-DD
  is_available: boolean;
  gig_id?: string;            // Optional
  notes?: string;             // Optional
}
```

**Example Request:**
```javascript
const response = await fetch('/api/availability', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    availability_date: '2025-08-01',
    is_available: true,
    notes: 'Available all day'
  })
});
```

---

### 19. Check Availability Conflicts

**Endpoint:** `GET /api/availability/check`  
**Auth Required:** Yes

**Query Parameters:**
```typescript
{
  date: string  // Required: YYYY-MM-DD
}
```

**Example Request:**
```javascript
const response = await fetch('/api/availability/check?date=2025-08-01', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Success Response:**
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

### 20. Update Availability

**Endpoint:** `PATCH /api/availability/{availabilityId}`  
**Auth Required:** Yes

**Request Body:**
```typescript
{
  is_available?: boolean;
  notes?: string;
}
```

---

## 🔔 NOTIFICATIONS ENDPOINTS (3)

### 21. Get User Notifications

**Endpoint:** `GET /api/notifications`  
**Auth Required:** Yes

**Query Parameters:**
```typescript
{
  unread_only?: 'true' | 'false';
  limit?: number;  // Default: 50
}
```

**Example Request:**
```javascript
const response = await fetch('/api/notifications?unread_only=true&limit=20', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Success Response:**
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

### 22. Mark Notification as Read

**Endpoint:** `PATCH /api/notifications/{notificationId}/read`  
**Auth Required:** Yes

**Example Request:**
```javascript
const response = await fetch(`/api/notifications/${notifId}/read`, {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

### 23. Mark All Notifications as Read

**Endpoint:** `PATCH /api/notifications/mark-all-read`  
**Auth Required:** Yes

**Example Request:**
```javascript
const response = await fetch('/api/notifications/mark-all-read', {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 📞 CONTACTS ENDPOINTS (3)

### 24. Get Contacts for Gig

**Endpoint:** `GET /api/contacts/gig/{gigId}`  
**Auth Required:** Yes (Must be gig creator)

---

### 25. Add Contact

**Endpoint:** `POST /api/contacts`  
**Auth Required:** Yes (Must be gig creator)

**Request Body:**
```typescript
{
  gig_id: string;
  contact_user_id: string;
  department: string;
  role: string;
  company?: string;
  phone?: string;
  email?: string;
}
```

---

### 26. Remove Contact

**Endpoint:** `DELETE /api/contacts/{contactId}`  
**Auth Required:** Yes (Must be gig creator)

---

## 🔗 REFERRALS ENDPOINTS (2)

### 27. Get User Referrals

**Endpoint:** `GET /api/referrals`  
**Auth Required:** Yes

---

### 28. Create Referral

**Endpoint:** `POST /api/referrals`  
**Auth Required:** Yes

**Request Body:**
```typescript
{
  gig_id: string;
  referred_user_id: string;
}
```

**Note:** Creates notifications for both referred user and gig creator.

---

## 📤 FILE UPLOAD ENDPOINTS (3)

### 29. Upload Resume

**Endpoint:** `POST /api/upload/resume`  
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data`

**Request Body:**
```
file: [File] (PDF, DOC, or DOCX, max 5MB)
```

**Example Request:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/upload/resume', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Success Response:**
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

**Allowed Types:**
- application/pdf
- application/msword
- application/vnd.openxmlformats-officedocument.wordprocessingml.document

**Max Size:** 5 MB

---

### 30. Upload Portfolio File

**Endpoint:** `POST /api/upload/portfolio`  
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data`

**Request Body:**
```
file: [File] (PDF, Image, or Video, max 10MB)
```

**Allowed Types:**
- application/pdf
- image/jpeg, image/png, image/gif, image/webp
- video/mp4, video/quicktime, video/x-msvideo

**Max Size:** 10 MB

---

### 31. Upload Profile Photo

**Endpoint:** `POST /api/upload/profile-photo`  
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data`

**Request Body:**
```
file: [File] (Image, max 2MB)
```

**Allowed Types:**
- image/jpeg
- image/png
- image/webp

**Max Size:** 2 MB

**Note:** Automatically updates `profile_photo_url` in user profile.

---

## ⚠️ Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": "Optional additional information"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|----------|
| 200 | Success | Data retrieved/updated successfully |
| 400 | Bad Request | Validation error, missing required fields |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Profile incomplete, insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected server error |

### Common Errors

**Authentication Error (401):**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**Profile Incomplete Error (403):**
```json
{
  "success": false,
  "error": "Complete your profile before creating a gig"
}
```

**Permission Denied Error (403):**
```json
{
  "success": false,
  "error": "You can only update your own gigs"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Title and description are required"
}
```

**File Upload Error (400):**
```json
{
  "success": false,
  "error": "File size exceeds 5MB limit"
}
```

---

## 🧪 Testing with cURL

### Get Access Token First

```bash
# Using Supabase client
const { data: { session } } = await supabase.auth.getSession();
const TOKEN = session.access_token;
```

### Example cURL Requests

**Get all gigs:**
```bash
curl -X GET "http://localhost:3000/api/gigs?page=1&limit=10" \
  -H "Content-Type: application/json"
```

**Create a gig:**
```bash
curl -X POST http://localhost:3000/api/gigs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Director of Photography",
    "description": "Looking for experienced DP",
    "amount": 5000,
    "currency": "AED",
    "dates": [{"month": "August", "days": "1-5"}],
    "locations": ["Dubai, UAE"]
  }'
```

**Upload resume:**
```bash
curl -X POST http://localhost:3000/api/upload/resume \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/resume.pdf"
```

---

## 💡 Best Practices

### 1. Always Check Success Field
```javascript
const response = await fetch('/api/profile');
const result = await response.json();

if (result.success) {
  // Handle success
  console.log(result.data);
} else {
  // Handle error
  console.error(result.error);
}
```

### 2. Use Try-Catch for Error Handling
```javascript
try {
  const response = await fetch('/api/gigs', { /* ... */ });
  if (!response.ok) throw new Error('Network error');
  const data = await response.json();
  // Handle data
} catch (error) {
  console.error('Error:', error);
}
```

### 3. Validate Data Before Sending
```javascript
if (!title || !description || !amount) {
  alert('Please fill all required fields');
  return;
}
```

### 4. Check Profile Completeness
```javascript
const checkProfile = await fetch('/api/profile/check', { headers });
const { data: { is_complete } } = await checkProfile.json();

if (!is_complete) {
  router.push('/auth/form');
  return;
}
```

### 5. Handle File Uploads Correctly
```javascript
// Don't set Content-Type for FormData
const formData = new FormData();
formData.append('file', file);

await fetch('/api/upload/resume', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // Don't add Content-Type - browser sets it with boundary
  },
  body: formData
});
```

---

**Document Version:** 1.0.0  
**Last Updated:** January 2025  
**Total Endpoints:** 31