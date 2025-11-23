# ⚡ Quick Start Guide - Gigs Backend Setup

## 🎯 Goal
Set up the complete backend for HeyProData Gigs module in ~30 minutes

---

## 📋 Checklist

### Before You Start
- [ ] Access to Supabase Dashboard (https://supabase.com/dashboard)
- [ ] Project: kvidydsfnnrathhpuxye
- [ ] 30 minutes of uninterrupted time

---

## 🚀 3-Step Setup

### **STEP 1: Create Database Tables** ⏱️ 5 min

1. Open Supabase Dashboard → **SQL Editor** → **New query**
2. Open file: `/app/supabase-setup/01_database_tables.sql`
3. Copy & paste entire file into SQL Editor
4. Click **"Run"**
5. ✅ Wait for "Success" message

**What This Creates:**
- 9 new tables (gigs, applications, notifications, etc.)
- Relationships between tables
- Helper functions
- Auto-update triggers

---

### **STEP 2: Enable Security** ⏱️ 5 min

1. SQL Editor → **New query**
2. Open file: `/app/supabase-setup/02_rls_policies.sql`
3. Copy & paste entire file
4. Click **"Run"**
5. ✅ Wait for "Success" message

**What This Does:**
- Enables Row Level Security on all tables
- Users can only see their own data
- Gig creators can see applicants
- Applicants can't see each other

---

### **STEP 3A: Create Storage Buckets** ⏱️ 10 min

Go to: **Storage** → **New bucket**

**Bucket 1: resumes**
```
Name: resumes
Public: OFF
Size limit: 5242880 (5 MB)
MIME types: 
  application/pdf
  application/msword
  application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

**Bucket 2: portfolios**
```
Name: portfolios
Public: OFF
Size limit: 10485760 (10 MB)
MIME types:
  application/pdf
  image/jpeg
  image/png
  image/gif
  image/webp
  video/mp4
  video/quicktime
  video/x-msvideo
```

**Bucket 3: profile-photos**
```
Name: profile-photos
Public: ON
Size limit: 2097152 (2 MB)
MIME types:
  image/jpeg
  image/png
  image/webp
```

---

### **STEP 3B: Secure Storage** ⏱️ 5 min

1. SQL Editor → **New query**
2. Open file: `/app/supabase-setup/03_storage_policies.sql`
3. Copy & paste entire file
4. Click **"Run"**
5. ✅ Wait for "Success" message

**What This Does:**
- Users can only upload to their own folders
- Gig creators can view applicant files
- File size and type restrictions enforced

---

## ✅ Verify Setup

Run this in SQL Editor:

```sql
-- Should return 9 tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'gigs', 'gig_dates', 'gig_locations', 'applications', 
  'applicant_skills', 'referrals', 'crew_availability', 
  'crew_contacts', 'notifications'
);
```

**Expected:** 9 rows

```sql
-- Should show RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'gigs';
```

**Expected:** `rowsecurity = true`

---

## 🎉 Done!

Your backend is now ready with:

✅ **9 database tables** with full relationships  
✅ **3 storage buckets** for files  
✅ **30+ security policies** protecting data  
✅ **Helper functions** for complex queries  
✅ **Automatic triggers** for data updates  

---

## 📚 Next Steps

### For Detailed Information:
- **Full Guide:** `/app/supabase-setup/EXECUTION_GUIDE.md`
- **Technical Docs:** `/app/BACKEND_IMPLEMENTATION_PLAN.md`
- **Summary:** `/app/BACKEND_SETUP_SUMMARY.md`

### To Build API Routes:
After this setup, you'll need to create Next.js API routes to:
- Create/read/update/delete gigs
- Handle applications
- Upload files
- Send notifications

**Estimated Time:** 2-3 hours

---

## 🐛 Common Issues

**Error: "Table already exists"**
- Solution: Table was already created. Skip or drop existing table first.

**Error: "Bucket not found"**
- Solution: Create the bucket first in Step 3A before running 3B.

**Error: "Permission denied"**
- Solution: Ensure you're using the project owner account.

---

## 📞 Need Help?

1. Check Supabase logs: Dashboard → Logs
2. Review error message in SQL Editor
3. Verify environment variables in `/app/.env`
4. Read detailed guide: `/app/supabase-setup/EXECUTION_GUIDE.md`

---

**Total Time:** ~30 minutes  
**Difficulty:** Easy (just copy & paste SQL)  
**Status:** Ready to execute! 🚀
