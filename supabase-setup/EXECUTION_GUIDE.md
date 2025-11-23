# 🚀 Backend Implementation Execution Guide

## HeyProData Gigs Module - Complete Backend Setup

This guide provides step-by-step instructions to implement the complete backend for the Gigs module.

---

## 📑 Overview

You'll be setting up:
- ✅ 10 database tables with relationships
- ✅ 3 storage buckets for file uploads
- ✅ Row Level Security (RLS) policies
- ✅ Storage access policies
- ✅ Helper functions and utilities

**Estimated Time:** 30-45 minutes

---

## 🔧 Prerequisites

Before starting, ensure you have:
- [x] Access to Supabase Dashboard
- [x] Project URL: https://kvidydsfnnrathhpuxye.supabase.co
- [x] Supabase credentials in `/app/.env`
- [x] Existing `user_profiles` table (from authentication setup)

---

## 📋 Step-by-Step Execution

### **STEP 1: Database Tables Setup** ⏱️ 5 minutes

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: **kvidydsfnnrathhpuxye**

2. **Navigate to SQL Editor**
   - Click on **"SQL Editor"** in the left sidebar
   - Click **"New query"** button

3. **Execute Table Creation Script**
   - Open file: `/app/supabase-setup/01_database_tables.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click **"Run"** button

4. **Verify Success**
   - You should see: ✅ "Success. No rows returned"
   - Check message: "All tables created successfully! ✅"

5. **Verify Tables Created**
   - Go to **"Table Editor"** in left sidebar
   - You should see these new tables:
     - `gigs`
     - `gig_dates`
     - `gig_locations`
     - `applications`
     - `applicant_skills`
     - `referrals`
     - `crew_availability`
     - `crew_contacts`
     - `notifications`

---

### **STEP 2: Row Level Security Policies** ⏱️ 5 minutes

1. **Open New Query in SQL Editor**
   - Click **"New query"** button again

2. **Execute RLS Policies Script**
   - Open file: `/app/supabase-setup/02_rls_policies.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click **"Run"** button

3. **Verify Success**
   - You should see: ✅ "Success. No rows returned"
   - Check message: "All RLS policies created successfully! ✅"

4. **Verify RLS Enabled**
   - Go to **"Table Editor"** → Select any table (e.g., `gigs`)
   - Click on **"RLS"** tab at the top
   - You should see **"Row Level Security is enabled"**
   - Multiple policies should be listed

---

### **STEP 3: Storage Buckets Creation** ⏱️ 10 minutes

1. **Navigate to Storage**
   - Click on **"Storage"** in the left sidebar
   - Click **"New bucket"** button

2. **Create "resumes" Bucket**
   ```
   Bucket name: resumes
   Public bucket: OFF ❌
   File size limit: 5242880 (bytes) = 5 MB
   Allowed MIME types:
     - application/pdf
     - application/msword
     - application/vnd.openxmlformats-officedocument.wordprocessingml.document
   ```
   - Click **"Create bucket"**

3. **Create "portfolios" Bucket**
   ```
   Bucket name: portfolios
   Public bucket: OFF ❌
   File size limit: 10485760 (bytes) = 10 MB
   Allowed MIME types:
     - application/pdf
     - image/jpeg
     - image/png
     - image/gif
     - image/webp
     - video/mp4
     - video/quicktime
     - video/x-msvideo
   ```
   - Click **"Create bucket"**

4. **Create "profile-photos" Bucket**
   ```
   Bucket name: profile-photos
   Public bucket: ON ✅
   File size limit: 2097152 (bytes) = 2 MB
   Allowed MIME types:
     - image/jpeg
     - image/png
     - image/webp
   ```
   - Click **"Create bucket"**

5. **Verify Buckets**
   - You should see 3 buckets listed in Storage
   - **resumes** (Private)
   - **portfolios** (Private)
   - **profile-photos** (Public)

---

### **STEP 4: Storage Access Policies** ⏱️ 5 minutes

1. **Open SQL Editor Again**
   - Go back to **"SQL Editor"**
   - Click **"New query"**

2. **Execute Storage Policies Script**
   - Open file: `/app/supabase-setup/03_storage_policies.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click **"Run"** button

3. **Verify Success**
   - You should see: ✅ "Success. No rows returned"
   - Check message: "All Storage policies created successfully! ✅"

4. **Verify Storage Policies**
   - Go to **"Storage"** → Select **"resumes"** bucket
   - Click on **"Policies"** tab
   - You should see multiple policies listed

---

### **STEP 5: Verification & Testing** ⏱️ 5 minutes

#### Database Verification

Run this query in SQL Editor:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'gigs', 'gig_dates', 'gig_locations', 
    'applications', 'applicant_skills', 'referrals',
    'crew_availability', 'crew_contacts', 'notifications'
)
ORDER BY table_name;
```

**Expected Result:** 9 rows returned

#### RLS Verification

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'gigs', 'gig_dates', 'gig_locations',
    'applications', 'applicant_skills', 'referrals',
    'crew_availability', 'crew_contacts', 'notifications'
);
```

**Expected Result:** All tables should show `rowsecurity = true`

#### Functions Verification

```sql
-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
    'get_gig_full_details',
    'check_availability_conflicts',
    'update_updated_at_column'
);
```

**Expected Result:** 3 rows returned

---

## ✅ Completion Checklist

Mark each item as you complete it:

### Database Setup
- [ ] All 10 tables created successfully
- [ ] RLS enabled on all tables
- [ ] Indexes created for performance
- [ ] Foreign keys set up correctly
- [ ] Database functions created
- [ ] Triggers created for updated_at fields

### Storage Setup
- [ ] "resumes" bucket created (Private, 5MB)
- [ ] "portfolios" bucket created (Private, 10MB)
- [ ] "profile-photos" bucket created (Public, 2MB)
- [ ] Storage policies applied to all buckets
- [ ] MIME type restrictions configured

### Code Setup
- [ ] `/app/lib/supabaseServer.js` created with helper functions
- [ ] All utility functions available
- [ ] Response helpers ready to use

---

## 🎯 What's Next?

After completing this setup, you're ready for:

### Phase 2: API Routes Implementation
The backend database and storage infrastructure is now complete. Next steps:

1. **Create API routes** for all CRUD operations
2. **Implement file upload endpoints**
3. **Add validation middleware**
4. **Create notification triggers**
5. **Test all endpoints**

**Estimated Time:** 2-3 hours

---

## 📊 Database Schema Overview

### Core Tables
```
gigs (main table)
├── gig_dates (one-to-many)
├── gig_locations (one-to-many)
├── applications (one-to-many)
│   ├── applicant_skills (via user_id)
│   └── referrals (many-to-many)
├── crew_availability (many-to-many)
└── crew_contacts (one-to-many)

notifications (independent)
```

### Relationships
- **Users** can create multiple **Gigs**
- **Gigs** have multiple **Dates** and **Locations**
- **Users** can submit multiple **Applications**
- **Applications** belong to one **Gig** and one **User**
- **Users** have multiple **Skills**
- **Users** can **Refer** other users to **Gigs**
- **Users** set **Availability** for specific dates
- **Gig creators** add **Contacts** to their gigs

---

## 🔐 Security Features Implemented

### Row Level Security (RLS)
✅ Users can only view/edit their own data  
✅ Gig creators have special access to applicant data  
✅ Applicants cannot see other applicants  
✅ Profile completeness check enforced  
✅ Users cannot apply to their own gigs  

### Storage Security
✅ Users can only upload to their own folders  
✅ File size limits enforced at bucket level  
✅ MIME type restrictions prevent malicious uploads  
✅ Gig creators can access applicant files (resumes, portfolios)  
✅ Profile photos are public, but only owners can upload  

---

## 🐛 Troubleshooting

### Issue: "Permission denied for table"
**Solution:** Ensure RLS policies are applied correctly. Re-run `02_rls_policies.sql`

### Issue: "Bucket not found"
**Solution:** Verify bucket names are exactly: `resumes`, `portfolios`, `profile-photos` (no typos)

### Issue: "Function does not exist"
**Solution:** Re-run `01_database_tables.sql` to create helper functions

### Issue: "File upload fails"
**Solution:** Check:
1. Bucket exists and is properly configured
2. File size within limits
3. MIME type is allowed
4. Storage policies are applied

### Issue: "Cannot view other users' data"
**Solution:** This is correct! RLS is working as intended. Each user can only see their own data.

---

## 📞 Support

If you encounter any issues:

1. **Check Supabase Logs**
   - Dashboard → Logs → Select appropriate service

2. **Verify Environment Variables**
   - File: `/app/.env`
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

3. **Test Connection**
   ```javascript
   import { supabaseServer } from '@/lib/supabaseServer';
   
   // Test query
   const { data, error } = await supabaseServer.from('gigs').select('count');
   console.log('Connection test:', error ? 'Failed' : 'Success');
   ```

---

## 📝 Notes

- **Database Type:** PostgreSQL (via Supabase)
- **Authentication:** Already implemented (Supabase Auth)
- **File Storage:** Supabase Storage (S3-compatible)
- **Real-time:** Available via Supabase Realtime (optional)
- **API Security:** JWT tokens via Supabase Auth

---

## 🎉 Success Criteria

You've successfully completed the backend setup when:

✅ All 9 tables visible in Table Editor  
✅ All 3 storage buckets created  
✅ RLS policies show "enabled" on all tables  
✅ Storage policies applied without errors  
✅ Test queries return expected results  
✅ No error messages in Supabase logs  

---

**Setup Status:** ⏳ In Progress  
**Last Updated:** July 2025  
**Version:** 1.0.0

---

**Ready to proceed with API Routes implementation!** 🚀
