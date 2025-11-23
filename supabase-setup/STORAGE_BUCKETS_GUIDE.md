# 📦 Storage Buckets Setup Guide

## Instructions for Creating Storage Buckets in Supabase Dashboard

### Prerequisites
- Access to Supabase Dashboard
- Project URL: https://kvidydsfnnrathhpuxye.supabase.co

---

## Step-by-Step Bucket Creation

### 1. Access Storage Section
1. Go to https://supabase.com/dashboard
2. Select your project: **kvidydsfnnrathhpuxye**
3. Click on **Storage** in the left sidebar
4. Click **"New bucket"** button

---

### 2. Create "resumes" Bucket

**Settings:**
```
Bucket Name: resumes
Public bucket: OFF (Private)
File size limit: 5242880 (5 MB in bytes)
Allowed MIME types:
  - application/pdf
  - application/msword
  - application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

**Configuration:**
- ✅ Private bucket (only owners and gig creators can access)
- ✅ 5 MB file size limit
- ✅ Only PDF and Word documents allowed

**Click "Create bucket"**

---

### 3. Create "portfolios" Bucket

**Settings:**
```
Bucket Name: portfolios
Public bucket: OFF (Private)
File size limit: 10485760 (10 MB in bytes)
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

**Configuration:**
- ✅ Private bucket (only owners and gig creators can access)
- ✅ 10 MB file size limit
- ✅ PDF, images, and common video formats allowed

**Click "Create bucket"**

---

### 4. Create "profile-photos" Bucket

**Settings:**
```
Bucket Name: profile-photos
Public bucket: ON (Public)
File size limit: 2097152 (2 MB in bytes)
Allowed MIME types:
  - image/jpeg
  - image/png
  - image/webp
```

**Configuration:**
- ✅ Public bucket (anyone can view)
- ✅ 2 MB file size limit
- ✅ Only image formats allowed (JPEG, PNG, WebP)

**Click "Create bucket"**

---

## Verification Checklist

After creating all buckets, verify:

- [ ] **resumes** bucket exists and is **private**
- [ ] **portfolios** bucket exists and is **private**
- [ ] **profile-photos** bucket exists and is **public**
- [ ] All file size limits are correctly set
- [ ] MIME types are configured for each bucket

---

## Next Steps

Once all three buckets are created:

1. ✅ Go to Supabase SQL Editor
2. ✅ Run the SQL script: `03_storage_policies.sql`
3. ✅ Verify policies are created successfully
4. ✅ Test file uploads through API routes (coming next)

---

## Bucket Usage in Application

### Resumes Bucket (`resumes/`)
**Purpose:** Store user resumes (CVs)  
**Path Structure:** `resumes/{user_id}/{filename}`  
**Access:** 
- User can view/upload/delete their own
- Gig creators can view resumes of applicants to their gigs

**Example:**
```
resumes/
  ├── 550e8400-e29b-41d4-a716-446655440000/
  │   ├── resume_2025.pdf
  │   └── updated_cv.docx
  └── 660e8400-e29b-41d4-a716-446655440000/
      └── my_resume.pdf
```

---

### Portfolios Bucket (`portfolios/`)
**Purpose:** Store user portfolio files (work samples, showreels)  
**Path Structure:** `portfolios/{user_id}/{filename}`  
**Access:**
- User can view/upload/delete their own
- Gig creators can view portfolios of applicants to their gigs

**Example:**
```
portfolios/
  ├── 550e8400-e29b-41d4-a716-446655440000/
  │   ├── showreel.mp4
  │   ├── project1.pdf
  │   └── work_sample.jpg
  └── 660e8400-e29b-41d4-a716-446655440000/
      └── portfolio.pdf
```

---

### Profile Photos Bucket (`profile-photos/`)
**Purpose:** Store user profile pictures  
**Path Structure:** `profile-photos/{user_id}/{filename}`  
**Access:**
- Public (anyone can view)
- Only owner can upload/update/delete

**Example:**
```
profile-photos/
  ├── 550e8400-e29b-41d4-a716-446655440000/
  │   └── avatar.jpg
  └── 660e8400-e29b-41d4-a716-446655440000/
      └── profile.png
```

---

## File Naming Convention

### Recommended Format:
```javascript
// Resume
`resumes/${userId}/resume_${timestamp}.pdf`

// Portfolio
`portfolios/${userId}/portfolio_${timestamp}_${originalName}`

// Profile Photo
`profile-photos/${userId}/avatar_${timestamp}.${extension}`
```

### Example Implementation:
```javascript
const timestamp = Date.now();
const userId = user.id;
const resumePath = `resumes/${userId}/resume_${timestamp}.pdf`;
```

---

## Security Features

### 1. Row Level Security (RLS)
- All storage policies enforce user authentication
- Users can only access their own files
- Gig creators get special access to applicant files

### 2. Path-Based Access Control
- File paths include user IDs for ownership verification
- Prevents unauthorized access through URL manipulation

### 3. File Size Limits
- Prevents abuse and excessive storage usage
- Resumes: 5 MB (adequate for PDF/DOC)
- Portfolios: 10 MB (supports high-quality media)
- Profile Photos: 2 MB (reasonable for web images)

### 4. MIME Type Restrictions
- Only specified file types can be uploaded
- Prevents malicious file uploads
- Ensures compatibility with application requirements

---

## Troubleshooting

### Issue: "Bucket already exists"
**Solution:** The bucket name is taken. Choose a different name or delete the existing bucket.

### Issue: "Policy creation failed"
**Solution:** 
1. Ensure all buckets are created first
2. Check that RLS is enabled on storage.objects
3. Run the SQL script again

### Issue: "File upload fails"
**Solution:**
1. Check file size is within limits
2. Verify MIME type is allowed
3. Ensure user is authenticated
4. Check path follows the pattern: `{bucket}/{user_id}/{filename}`

### Issue: "Cannot view uploaded files"
**Solution:**
1. Verify storage policies are applied
2. Check user authentication
3. For private buckets, ensure user owns the file or is a gig creator viewing applicant files

---

## Storage Costs (Reference)

Supabase Storage Pricing (as of 2025):
- **Free tier:** 1 GB storage
- **Pro tier:** 100 GB storage included
- **Additional storage:** ~$0.021/GB per month

**Estimated Usage:**
- Average resume: 500 KB
- Average portfolio: 5 MB
- Average profile photo: 200 KB

**For 1000 users:**
- Resumes: 500 MB
- Portfolios: 5 GB
- Profile photos: 200 MB
- **Total: ~5.7 GB**

---

## API Integration Preview

Once buckets are set up, you'll use them in API routes like this:

```javascript
// Upload resume
const { data, error } = await supabase.storage
  .from('resumes')
  .upload(`${userId}/resume_${Date.now()}.pdf`, file);

// Get public URL (for profile photos)
const { data } = supabase.storage
  .from('profile-photos')
  .getPublicUrl(`${userId}/avatar.jpg`);

// Get signed URL (for private files)
const { data, error } = await supabase.storage
  .from('resumes')
  .createSignedUrl(`${userId}/resume.pdf`, 3600); // 1 hour expiry
```

---

**Setup Status:** ⏳ Pending  
**Last Updated:** July 2025
