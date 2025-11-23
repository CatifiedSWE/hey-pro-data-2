-- ============================================
-- GIGS MODULE - STORAGE BUCKET POLICIES
-- Execute this script AFTER creating buckets in Supabase Dashboard
-- ============================================

-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Create the following buckets:
--    - "resumes" (Private, 5MB limit, PDF/DOC/DOCX)
--    - "portfolios" (Private, 10MB limit, PDF/Images/Videos)
--    - "profile-photos" (Public, 2MB limit, Images only)
-- 3. Then run this SQL script

-- ============================================
-- Resumes Bucket Policies
-- ============================================

-- Users can upload their own resumes
CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own resumes
CREATE POLICY "Users can view their own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own resumes
CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own resumes
CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Gig creators can view applicant resumes
CREATE POLICY "Gig creators can view applicant resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'resumes' AND
    EXISTS (
        SELECT 1 FROM applications a
        JOIN gigs g ON a.gig_id = g.id
        WHERE g.created_by = auth.uid()
        AND a.resume_url LIKE '%' || name || '%'
    )
);

-- ============================================
-- Portfolios Bucket Policies
-- ============================================

-- Users can upload their own portfolios
CREATE POLICY "Users can upload their own portfolios"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'portfolios' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own portfolios
CREATE POLICY "Users can view their own portfolios"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'portfolios' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own portfolios
CREATE POLICY "Users can update their own portfolios"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'portfolios' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own portfolios
CREATE POLICY "Users can delete their own portfolios"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'portfolios' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Gig creators can view applicant portfolios
CREATE POLICY "Gig creators can view applicant portfolios"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'portfolios' AND
    EXISTS (
        SELECT 1 FROM applications a
        JOIN gigs g ON a.gig_id = g.id
        WHERE g.created_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM unnest(a.portfolio_files) AS pf
            WHERE pf LIKE '%' || name || '%'
        )
    )
);

-- ============================================
-- Profile Photos Bucket Policies (Public)
-- ============================================

-- Anyone can view profile photos (public bucket)
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- Authenticated users can view profile photos
CREATE POLICY "Authenticated users can view profile photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'profile-photos');

-- Users can upload their own profile photos
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own profile photos
CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own profile photos
CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- Success message
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'All Storage policies created successfully! ✅';
    RAISE NOTICE 'Database setup is complete!';
    RAISE NOTICE 'Next step: Implement API routes in Next.js';
END $$;
