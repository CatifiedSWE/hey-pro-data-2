# Backend Architecture Overview

## HeyProData Backend Infrastructure

This document provides a comprehensive overview of the existing backend architecture that must be integrated into any new frontend implementation.

---

## 🏗️ Technology Stack

### Core Technologies
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (Email/Password + Google OAuth)
- **Storage**: Supabase Storage (S3-compatible)
- **Real-time**: Supabase Realtime (available but not required)

### Backend Runtime
- **Runtime**: Node.js serverless functions
- **API Style**: RESTful
- **Response Format**: JSON
- **Authentication Method**: JWT Bearer tokens

---

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (New UI/UX)                        │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Pages      │  │  Components  │  │    Hooks     │            │
│  │  /home       │  │  Navbar      │  │  useAuth     │            │
│  │  /gigs       │  │  Cards       │  │  useGigs     │            │
│  │  /profile    │  │  Modals      │  │  useProfile  │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
│                    ▼ API Calls with JWT                            │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE CLIENT LAYER                            │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  /lib/supabase.js (Client-side Auth & Session Management) │   │
│  │  - Adaptive Storage (localStorage/sessionStorage)          │   │
│  │  - PKCE OAuth Flow                                          │   │
│  │  - Session Persistence                                      │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  /lib/supabaseServer.js (Server-side Utilities)           │   │
│  │  - Auth validation helpers                                  │   │
│  │  - File upload/download helpers                             │   │
│  │  - Response formatters                                      │   │
│  └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API ROUTES (31 Endpoints)                    │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Gigs (5)     │  │ Profile (4)  │  │ Skills (3)   │            │
│  │ Applications │  │ Availability │  │ Notifications│            │
│  │ (6)          │  │ (4)          │  │ (3)          │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Uploads (3)  │  │ Contacts (3) │  │ Referrals(2) │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SUPABASE BACKEND                               │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │  AUTHENTICATION (Supabase Auth)                          │      │
│  │  - Email/Password with OTP                               │      │
│  │  - Google OAuth with PKCE                                │      │
│  │  - Session Management                                     │      │
│  │  - JWT Token Generation                                   │      │
│  └─────────────────────────────────────────────────────────┘      │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │  DATABASE (PostgreSQL)                                    │      │
│  │  - 10 Tables with Relationships                           │      │
│  │  - Row Level Security (RLS) Policies                      │      │
│  │  - Indexes for Performance                                │      │
│  │  - Triggers for Auto-updates                              │      │
│  └─────────────────────────────────────────────────────────┘      │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │  STORAGE (Supabase Storage)                               │      │
│  │  - resumes/ (Private, 5MB)                                │      │
│  │  - portfolios/ (Private, 10MB)                            │      │
│  │  - profile-photos/ (Public, 2MB)                          │      │
│  └─────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Summary

### Core Tables (10 Total)

#### 1. `user_profiles` (Updated from Auth Setup)
Stores user profile information linked to authentication.

**Key Fields:**
- `user_id` (PK, FK → auth.users)
- `legal_first_name`, `legal_surname`
- `alias_first_name`, `alias_surname`
- `phone`, `bio`
- `profile_photo_url`, `banner_url`
- `country`, `city`
- `is_profile_complete` (Boolean)

#### 2. `gigs`
Main table for job postings.

**Key Fields:**
- `id` (PK)
- `title`, `description`, `qualifying_criteria`
- `amount`, `currency`
- `status` (active/closed/draft)
- `created_by` (FK → auth.users)

#### 3. `gig_dates`
Multiple date ranges per gig.

**Key Fields:**
- `gig_id` (FK → gigs)
- `month`, `days` (e.g., "1-5, 10-15")

#### 4. `gig_locations`
Multiple locations per gig.

**Key Fields:**
- `gig_id` (FK → gigs)
- `location_name`

#### 5. `applications`
User applications to gigs.

**Key Fields:**
- `gig_id` (FK → gigs)
- `applicant_user_id` (FK → auth.users)
- `status` (pending/shortlisted/confirmed/released)
- `cover_letter`, `portfolio_links`, `resume_url`
- Unique constraint: (gig_id, applicant_user_id)

#### 6. `applicant_skills`
Skills associated with users.

**Key Fields:**
- `user_id` (FK → auth.users)
- `skill_name`
- Unique constraint: (user_id, skill_name)

#### 7. `crew_availability`
User availability calendar.

**Key Fields:**
- `user_id` (FK → auth.users)
- `availability_date`, `is_available`
- `gig_id` (optional FK → gigs)
- Unique constraint: (user_id, availability_date)

#### 8. `crew_contacts`
Contacts added to gigs by creators.

**Key Fields:**
- `gig_id` (FK → gigs)
- `user_id` (FK → auth.users)
- `department`, `role`, `company`
- `phone`, `email`

#### 9. `referrals`
User-to-user gig referrals.

**Key Fields:**
- `gig_id` (FK → gigs)
- `referred_user_id`, `referrer_user_id` (FK → auth.users)
- `status` (pending/accepted/declined)

#### 10. `notifications`
In-app notification system.

**Key Fields:**
- `user_id` (FK → auth.users)
- `type` (application_received/status_changed/referral_received)
- `title`, `message`
- `related_gig_id`, `related_application_id`
- `is_read` (Boolean)

---

## 📦 Storage Buckets

### 1. `resumes/` (Private)
- **Purpose**: User CVs and resumes
- **Max Size**: 5 MB
- **Allowed Types**: PDF, DOC, DOCX
- **Path Structure**: `{user_id}/{filename}`
- **Access**: Owner + Gig creators (for applicants)

### 2. `portfolios/` (Private)
- **Purpose**: Portfolio files (work samples, videos)
- **Max Size**: 10 MB
- **Allowed Types**: PDF, Images (JPEG/PNG/GIF/WebP), Videos (MP4/MOV/AVI)
- **Path Structure**: `{user_id}/{filename}`
- **Access**: Owner + Gig creators (for applicants)

### 3. `profile-photos/` (Public)
- **Purpose**: User profile pictures
- **Max Size**: 2 MB
- **Allowed Types**: JPEG, PNG, WebP
- **Path Structure**: `{user_id}/{filename}`
- **Access**: Public read, Owner write

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Email/Password + OTP**
   ```
   Sign Up → Email Verification (OTP) → Profile Creation → Access Granted
   ```

2. **Google OAuth (PKCE)**
   ```
   Google Sign In → OAuth Callback → Profile Check → Access Granted
   ```

### Session Management

- **JWT Tokens**: Issued by Supabase Auth
- **Storage**: Adaptive (localStorage or sessionStorage)
- **Expiry**: Configurable (default: 1 hour access token, 7 days refresh token)
- **Keep Me Logged In**: Uses localStorage (persists after browser close)
- **Don't Keep Me Logged In**: Uses sessionStorage (expires on browser close)

### Authorization Levels

#### Public Access
- View active gigs (GET /api/gigs)
- No authentication required

#### Authenticated User
- View own profile, applications, skills
- Create gigs (if profile complete)
- Apply to gigs (if profile complete)
- Upload files
- Manage availability

#### Gig Creator (Enhanced Access)
- View all applications to their gigs
- Update application status
- Access applicant resumes/portfolios
- Add contacts to their gigs
- Update/delete their gigs

---

## 🔒 Row Level Security (RLS)

All database tables enforce RLS policies:

### Key Security Rules

1. **Ownership Checks**: Users can only modify their own data
2. **Creator Access**: Gig creators have read access to applicant data
3. **Profile Completeness**: Certain actions require complete profiles
4. **Anti-Fraud**: Users cannot apply to their own gigs
5. **Privacy**: Applicants cannot see other applicants

### RLS Policy Examples

```sql
-- Users can view their own applications
CREATE POLICY "Users can view own applications"
ON applications FOR SELECT
USING (auth.uid() = applicant_user_id);

-- Gig creators can view all applications to their gigs
CREATE POLICY "Creators can view gig applications"
ON applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM gigs
    WHERE gigs.id = applications.gig_id
    AND gigs.created_by = auth.uid()
  )
);

-- Users cannot apply to their own gigs
CREATE POLICY "Cannot apply to own gigs"
ON applications FOR INSERT
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM gigs
    WHERE gigs.id = gig_id
    AND gigs.created_by = auth.uid()
  )
);
```

---

## 📡 API Architecture

### Modular Route Structure

```
/app/api/
├── health/route.js                              # API health check
├── profile/
│   ├── route.js                                 # GET/PATCH profile
│   └── check/route.js                           # GET profile status
├── skills/
│   ├── route.js                                 # GET/POST skills
│   └── [id]/route.js                            # DELETE skill
├── availability/
│   ├── route.js                                 # GET/POST availability
│   ├── check/route.js                           # GET conflicts
│   └── [id]/route.js                            # PATCH availability
├── notifications/
│   ├── route.js                                 # GET notifications
│   ├── [id]/read/route.js                       # PATCH mark read
│   └── mark-all-read/route.js                   # PATCH mark all
├── contacts/
│   ├── route.js                                 # POST contact
│   ├── gig/[gigId]/route.js                     # GET gig contacts
│   └── [id]/route.js                            # DELETE contact
├── referrals/
│   └── route.js                                 # GET/POST referrals
├── upload/
│   ├── resume/route.js                          # POST resume
│   ├── portfolio/route.js                       # POST portfolio
│   └── profile-photo/route.js                   # POST photo
├── gigs/
│   ├── route.js                                 # GET/POST gigs
│   └── [id]/
│       ├── route.js                             # GET/PATCH/DELETE gig
│       ├── apply/route.js                       # POST apply
│       └── applications/
│           ├── route.js                         # GET applications
│           └── [applicationId]/status/route.js  # PATCH status
└── applications/
    ├── my/route.js                              # GET my apps
    └── [id]/route.js                            # GET app details
```

### Request/Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Optional details"
}
```

---

## 🔧 Key Backend Features

### 1. Automatic Notifications
Triggered on specific events:
- Application received → Notifies gig creator
- Application status changed → Notifies applicant
- Referral created → Notifies referred user

### 2. Profile Completeness Check
Before creating gigs or applying:
```javascript
const { isComplete } = await checkProfileComplete(userId);
if (!isComplete) {
  return errorResponse('Complete your profile first', 403);
}
```

### 3. Availability Conflict Detection
Check if user has conflicting bookings:
```javascript
const conflicts = await checkAvailabilityConflicts(userId, date);
```

### 4. File Upload with Validation
- Size limits enforced
- MIME type checking
- Path-based access control
- Automatic URL generation

### 5. Comprehensive Logging
All API routes log:
- Method and endpoint
- User ID
- Parameters
- Success/failure

---

## 🌐 Environment Variables

### Required Variables

```env
# Base URL (for API calls)
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# CORS (optional)
CORS_ORIGINS=*
```

### Security Notes
- `NEXT_PUBLIC_*` variables are exposed to browser
- Anon key is safe to expose (RLS protects data)
- Never expose service role key in frontend

---

## 📈 Performance Considerations

### Database Indexes
Optimized queries on:
- `gigs.created_by`
- `gigs.status`
- `applications.gig_id`
- `applications.applicant_user_id`
- `notifications.user_id`

### Pagination
All list endpoints support pagination:
```
GET /api/gigs?page=1&limit=10
```

### Efficient Queries
- Uses `.maybeSingle()` to avoid errors
- Joins minimize database round-trips
- Selective field fetching

---

## 🚦 Data Flow Examples

### Creating a Gig
```
1. Frontend: POST /api/gigs with gig data
2. Backend: Validate auth and profile completeness
3. Database: Insert into gigs table
4. Database: Insert gig_dates records
5. Database: Insert gig_locations records
6. Backend: Return complete gig object
7. Frontend: Display success message
```

### Applying to a Gig
```
1. Frontend: Upload resume → POST /api/upload/resume
2. Backend: Store in Supabase Storage → Return URL
3. Frontend: POST /api/gigs/{id}/apply with resume URL
4. Backend: Validate (auth, profile, not own gig, unique application)
5. Database: Insert application record
6. Database: Create notification for gig creator
7. Backend: Return application confirmation
8. Frontend: Display success message
```

---

## 📊 Backend Health Metrics

### Monitoring Endpoints

**Health Check:**
```bash
GET /api/health
Response: { "status": "ok", "timestamp": "2025-01-15T10:00:00Z" }
```

### Performance Expectations

| Operation | Expected Response Time |
|-----------|------------------------|
| Get gigs list | < 100ms |
| Create gig | < 200ms |
| Apply to gig | < 150ms |
| Upload file | < 500ms (depends on size) |
| Get profile | < 50ms |

---

## 🎯 Integration Requirements

### For New Frontend to Work:

1. ✅ Use Supabase client for authentication
2. ✅ Store JWT tokens correctly (adaptive storage)
3. ✅ Send Authorization header with all authenticated requests
4. ✅ Handle profile completion flow
5. ✅ Respect RLS policies (enforced by backend)
6. ✅ Use proper file upload patterns
7. ✅ Handle errors gracefully
8. ✅ Implement proper session management

---

## 📝 Next Steps

Refer to the following documents for detailed integration instructions:

1. **API_ENDPOINTS_REFERENCE.md** - Complete API documentation
2. **AUTHENTICATION_INTEGRATION_GUIDE.md** - Auth setup instructions
3. **DATABASE_MODELS_AND_RELATIONSHIPS.md** - Data structure details
4. **FILE_UPLOAD_PATTERNS.md** - Storage integration guide
5. **FRONTEND_INTEGRATION_CHECKLIST.md** - Step-by-step implementation
6. **COMMON_PITFALLS_AND_SOLUTIONS.md** - Troubleshooting guide

---

**Document Version:** 1.0.0  
**Last Updated:** January 2025  
**Backend Status:** ✅ Production Ready