# 🗄️ Database Schema - Gigs Module

## Visual Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AUTHENTICATION                                  │
│                         (Managed by Supabase)                               │
└──────────────────────┬──────────────────────────────────────────────────────┘
                       │
                       │ user_id (FK)
                       ▼
        ┌──────────────────────────────┐
        │      USER_PROFILES           │
        │  (Updated with new fields)   │
        ├──────────────────────────────┤
        │ • user_id (PK, FK)           │
        │ • legal_first_name           │
        │ • legal_surname              │
        │ • alias_first_name           │
        │ • alias_surname              │
        │ • country                    │
        │ • city                       │
        │ • phone          ⭐ NEW      │
        │ • profile_photo_url ⭐ NEW   │
        │ • bio            ⭐ NEW      │
        │ • is_profile_complete ⭐ NEW │
        └──────┬──────────┬────────────┘
               │          │
               │          │ created_by (FK)
               │          ▼
               │    ┌─────────────────────────────┐
               │    │         GIGS                │
               │    ├─────────────────────────────┤
               │    │ • id (PK)                   │
               │    │ • title                     │
               │    │ • description               │
               │    │ • qualifying_criteria       │
               │    │ • amount                    │
               │    │ • currency (AED)            │
               │    │ • status (active/closed)    │
               │    │ • created_by (FK → users)   │
               │    │ • created_at                │
               │    │ • updated_at                │
               │    └──┬──────┬────────┬──────────┘
               │       │      │        │
               │       │      │        │ gig_id (FK)
               │       │      │        ▼
               │       │      │   ┌──────────────────────┐
               │       │      │   │   GIG_LOCATIONS      │
               │       │      │   ├──────────────────────┤
               │       │      │   │ • id (PK)            │
               │       │      │   │ • gig_id (FK)        │
               │       │      │   │ • location_name      │
               │       │      │   │ • created_at         │
               │       │      │   └──────────────────────┘
               │       │      │
               │       │      │ gig_id (FK)
               │       │      ▼
               │       │   ┌──────────────────────┐
               │       │   │    GIG_DATES         │
               │       │   ├──────────────────────┤
               │       │   │ • id (PK)            │
               │       │   │ • gig_id (FK)        │
               │       │   │ • month              │
               │       │   │ • days               │
               │       │   │ • created_at         │
               │       │   └──────────────────────┘
               │       │
               │       │ gig_id (FK)
               │       ▼
               │   ┌─────────────────────────────────┐
               │   │      APPLICATIONS               │
               │   ├─────────────────────────────────┤
               │   │ • id (PK)                       │
               │   │ • gig_id (FK → gigs)            │
               │   │ • applicant_user_id (FK → auth) │
               │   │ • status (pending/shortlisted)  │
               │   │ • cover_letter                  │
               │   │ • portfolio_links []            │
               │   │ • resume_url                    │
               │   │ • portfolio_files []            │
               │   │ • notes                         │
               │   │ • applied_at                    │
               │   │ • updated_at                    │
               │   │ UNIQUE(gig_id, applicant_user)  │
               │   └───────────────┬─────────────────┘
               │                   │
               │                   │ application_id (FK)
               │                   ▼
               │             ┌──────────────────────┐
               │             │   NOTIFICATIONS      │
               │             ├──────────────────────┤
               │             │ • id (PK)            │
               │             │ • user_id (FK)       │
               │             │ • type               │
               │             │ • title              │
               │             │ • message            │
               │             │ • related_gig_id     │
               │             │ • related_app_id     │
               │             │ • is_read            │
               │             │ • created_at         │
               │             └──────────────────────┘
               │
               │ user_id (FK)
               ├────────────────────────────┐
               │                            │
               ▼                            ▼
    ┌──────────────────────┐    ┌──────────────────────────┐
    │  APPLICANT_SKILLS    │    │   CREW_AVAILABILITY      │
    ├──────────────────────┤    ├──────────────────────────┤
    │ • id (PK)            │    │ • id (PK)                │
    │ • user_id (FK)       │    │ • user_id (FK)           │
    │ • skill_name         │    │ • gig_id (FK, optional)  │
    │ • created_at         │    │ • availability_date      │
    │ UNIQUE(user, skill)  │    │ • is_available           │
    └──────────────────────┘    │ • notes                  │
                                │ • created_at             │
                                │ • updated_at             │
                                │ UNIQUE(user_id, date)    │
                                └──────────────────────────┘

    ┌─────────────────────────────────────────────────────┐
    │                    REFERRALS                         │
    ├─────────────────────────────────────────────────────┤
    │ • id (PK)                                            │
    │ • gig_id (FK → gigs)                                 │
    │ • referred_user_id (FK → auth)                       │
    │ • referrer_user_id (FK → auth)                       │
    │ • status (pending/accepted/declined)                 │
    │ • created_at                                         │
    │ UNIQUE(gig_id, referred_user_id, referrer_user_id)  │
    └─────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────┐
    │                  CREW_CONTACTS                       │
    ├─────────────────────────────────────────────────────┤
    │ • id (PK)                                            │
    │ • gig_id (FK → gigs)                                 │
    │ • user_id (FK → auth)                                │
    │ • department                                         │
    │ • role                                               │
    │ • company                                            │
    │ • phone                                              │
    │ • email                                              │
    │ • created_at                                         │
    │ UNIQUE(gig_id, user_id, department)                  │
    └─────────────────────────────────────────────────────┘
```

---

## 📦 Storage Buckets

```
┌────────────────────────────────────────────────────────────┐
│                    SUPABASE STORAGE                        │
└────────────────────────────────────────────────────────────┘

    ┌──────────────────────┐
    │   resumes/           │  (Private Bucket)
    │                      │
    │  ├─ {user_id_1}/     │  
    │  │   ├─ resume1.pdf  │  Max: 5 MB
    │  │   └─ cv.docx      │  Types: PDF, DOC, DOCX
    │  │                   │
    │  ├─ {user_id_2}/     │
    │  │   └─ resume.pdf   │
    │  └─ ...              │
    └──────────────────────┘

    ┌──────────────────────┐
    │   portfolios/        │  (Private Bucket)
    │                      │
    │  ├─ {user_id_1}/     │
    │  │   ├─ work1.pdf    │  Max: 10 MB
    │  │   ├─ demo.mp4     │  Types: PDF, Images, Videos
    │  │   └─ sample.jpg   │
    │  │                   │
    │  ├─ {user_id_2}/     │
    │  │   └─ portfolio.pdf│
    │  └─ ...              │
    └──────────────────────┘

    ┌──────────────────────┐
    │   profile-photos/    │  (Public Bucket)
    │                      │
    │  ├─ {user_id_1}/     │
    │  │   └─ avatar.jpg   │  Max: 2 MB
    │  │                   │  Types: JPEG, PNG, WebP
    │  ├─ {user_id_2}/     │
    │  │   └─ photo.png    │
    │  └─ ...              │
    └──────────────────────┘
```

---

## 🔗 Relationships Summary

### One-to-Many Relationships

| Parent Table | Child Table | Relationship |
|-------------|-------------|--------------|
| `auth.users` | `user_profiles` | One user → One profile |
| `auth.users` | `gigs` | One user → Many gigs created |
| `gigs` | `gig_dates` | One gig → Many date ranges |
| `gigs` | `gig_locations` | One gig → Many locations |
| `gigs` | `applications` | One gig → Many applications |
| `auth.users` | `applications` | One user → Many applications |
| `auth.users` | `applicant_skills` | One user → Many skills |
| `auth.users` | `crew_availability` | One user → Many availability dates |
| `gigs` | `crew_contacts` | One gig → Many contacts |
| `auth.users` | `notifications` | One user → Many notifications |

### Many-to-Many Relationships

| Table 1 | Table 2 | Junction Table | Description |
|---------|---------|----------------|-------------|
| `auth.users` | `gigs` | `applications` | Users apply to multiple gigs |
| `auth.users` | `auth.users` | `referrals` | Users refer other users to gigs |

---

## 🔐 Security Constraints

### Profile Completeness Requirements

Before a user can **create a gig** or **apply to a gig**, their profile must be complete:

```sql
is_profile_complete = true

WHERE:
  ✓ legal_first_name IS NOT NULL
  ✓ legal_surname IS NOT NULL
  ✓ phone IS NOT NULL
  ✓ profile_photo_url IS NOT NULL
```

### Application Rules

```sql
-- One application per user per gig
CONSTRAINT unique_application_per_gig 
  UNIQUE(gig_id, applicant_user_id)

-- Cannot apply to own gigs
CHECK (
  NOT EXISTS (
    SELECT 1 FROM gigs 
    WHERE gigs.id = gig_id 
    AND gigs.created_by = applicant_user_id
  )
)
```

### Data Access Rules (RLS)

| Action | Who Can Do It |
|--------|---------------|
| **View Gig** | Everyone (if active), Creator (all statuses) |
| **Create Gig** | Users with complete profiles |
| **Update Gig** | Creator only |
| **Delete Gig** | Creator only |
| **Apply to Gig** | Users with complete profiles (not own gig) |
| **View Applications** | Applicant (own), Gig Creator (all) |
| **Update Application Status** | Gig Creator only |
| **View Applicant Files** | File Owner, Gig Creator |

---

## 📊 Field Types & Defaults

### Common Field Types

```sql
UUID             - id, user_id, gig_id (Universally Unique Identifier)
VARCHAR(n)       - title, email, phone (Variable length text)
TEXT             - description, notes (Unlimited length text)
DECIMAL(10,2)    - amount (Monetary values)
BOOLEAN          - is_available, is_read (true/false)
TIMESTAMP        - created_at, updated_at (Date with time)
DATE             - availability_date (Date only)
TEXT[]           - portfolio_links, portfolio_files (Arrays)
```

### Status Enums

```sql
-- Gig Status
'active' | 'closed' | 'draft'

-- Application Status
'pending' | 'shortlisted' | 'confirmed' | 'released'

-- Referral Status
'pending' | 'accepted' | 'declined'

-- Notification Types
'application_received' | 'status_changed' | 'referral_received' | 
'availability_conflict' | 'new_gig_posted'
```

---

## 🔄 Automatic Triggers

### Update Timestamps

```sql
-- Automatically updates 'updated_at' field on every UPDATE
CREATE TRIGGER update_gigs_updated_at
  BEFORE UPDATE ON gigs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Same trigger on:
  - applications
  - crew_availability
```

---

## 🎯 Indexes for Performance

### Indexed Fields

```sql
-- Gigs
CREATE INDEX idx_gigs_created_by ON gigs(created_by);
CREATE INDEX idx_gigs_status ON gigs(status);
CREATE INDEX idx_gigs_created_at ON gigs(created_at DESC);

-- Applications
CREATE INDEX idx_applications_gig_id ON applications(gig_id);
CREATE INDEX idx_applications_applicant ON applications(applicant_user_id);
CREATE INDEX idx_applications_status ON applications(status);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- And more... (see SQL files for complete list)
```

---

## 🧮 Helper Functions

### 1. Get Gig with Full Details

```sql
SELECT get_gig_full_details('gig-uuid-here');

Returns JSON:
{
  "gig": { /* gig data */ },
  "dates": [ /* array of dates */ ],
  "locations": [ /* array of locations */ ],
  "applications_count": 5,
  "creator": { /* creator profile */ }
}
```

### 2. Check Availability Conflicts

```sql
SELECT check_availability_conflicts('user-uuid', '2025-09-15');

Returns JSON:
[
  {
    "gig": { /* gig details */ },
    "application_status": "confirmed",
    "date": "2025-09-15"
  }
]
```

---

## 💾 Storage Calculations

### Per User Estimate

```
Resume:         ~500 KB
Portfolio:      ~5 MB (multiple files)
Profile Photo:  ~200 KB

Total per user: ~5.7 MB
```

### For 1000 Users

```
Resumes:         500 MB
Portfolios:      5 GB
Profile Photos:  200 MB

Total storage:   ~6 GB
```

---

## 📈 Scalability Notes

### Database Performance

- **Indexes** reduce query time from O(n) to O(log n)
- **Foreign Keys** maintain referential integrity automatically
- **RLS Policies** run at database level (faster than application-level checks)
- **Triggers** eliminate need for manual field updates

### Expected Query Performance

| Query | Complexity | Index Used | Est. Time |
|-------|-----------|-----------|-----------|
| Get all active gigs | O(n) | status + created_at | <50ms |
| Get user's applications | O(log n) | applicant_user_id | <20ms |
| Get gig details | O(1) | Primary key | <10ms |
| Check availability | O(log n) | user_id + date | <30ms |

---

## 🔄 Data Flow Examples

### Creating a Gig

```
1. User submits gig form
2. Backend validates: is_profile_complete = true
3. INSERT INTO gigs (...)
4. Bulk INSERT INTO gig_dates (...)
5. Bulk INSERT INTO gig_locations (...)
6. Return complete gig object with all relations
```

### Applying to Gig

```
1. User submits application + files
2. Validate: profile complete, not own gig, unique application
3. Upload resume to: resumes/{user_id}/resume_{timestamp}.pdf
4. Upload portfolio to: portfolios/{user_id}/file_{timestamp}.ext
5. INSERT INTO applications with file URLs
6. INSERT INTO notifications for gig creator
7. Return application confirmation
```

---

**Schema Version:** 1.0.0  
**Last Updated:** July 2025  
**Total Tables:** 10 (9 new + 1 updated)  
**Total Buckets:** 3  
**Total Policies:** 30+
