-- ============================================
-- GIGS MODULE - ROW LEVEL SECURITY POLICIES
-- Execute this script AFTER 01_database_tables.sql
-- ============================================

-- ============================================
-- Step 1: Enable RLS on All Tables
-- ============================================
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gig_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE gig_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 2: Gigs Table Policies
-- ============================================

-- Anyone can view active gigs
CREATE POLICY "Anyone can view active gigs"
ON gigs FOR SELECT
TO authenticated
USING (status = 'active');

-- Users can view their own gigs (all statuses)
CREATE POLICY "Users can view their own gigs"
ON gigs FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- Users with complete profile can create gigs
CREATE POLICY "Complete profiles can create gigs"
ON gigs FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid()
        AND is_profile_complete = true
    )
);

-- Users can update their own gigs
CREATE POLICY "Users can update their own gigs"
ON gigs FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Users can delete their own gigs
CREATE POLICY "Users can delete their own gigs"
ON gigs FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- ============================================
-- Step 3: Gig Dates Policies
-- ============================================

-- Anyone can view gig dates for active gigs or their own gigs
CREATE POLICY "Anyone can view gig dates"
ON gig_dates FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_dates.gig_id
        AND (gigs.status = 'active' OR gigs.created_by = auth.uid())
    )
);

-- Gig creators can insert dates
CREATE POLICY "Gig creators can insert dates"
ON gig_dates FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_dates.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Gig creators can update dates
CREATE POLICY "Gig creators can update dates"
ON gig_dates FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_dates.gig_id
        AND gigs.created_by = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_dates.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Gig creators can delete dates
CREATE POLICY "Gig creators can delete dates"
ON gig_dates FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_dates.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- ============================================
-- Step 4: Gig Locations Policies
-- ============================================

-- Anyone can view gig locations
CREATE POLICY "Anyone can view gig locations"
ON gig_locations FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_locations.gig_id
        AND (gigs.status = 'active' OR gigs.created_by = auth.uid())
    )
);

-- Gig creators can insert locations
CREATE POLICY "Gig creators can insert locations"
ON gig_locations FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_locations.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Gig creators can update locations
CREATE POLICY "Gig creators can update locations"
ON gig_locations FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_locations.gig_id
        AND gigs.created_by = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_locations.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Gig creators can delete locations
CREATE POLICY "Gig creators can delete locations"
ON gig_locations FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_locations.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- ============================================
-- Step 5: Applications Policies
-- ============================================

-- Users can view their own applications
CREATE POLICY "Users can view their own applications"
ON applications FOR SELECT
TO authenticated
USING (applicant_user_id = auth.uid());

-- Gig creators can view applications to their gigs (but not see other applicants from applicant's view)
CREATE POLICY "Gig creators can view applications"
ON applications FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = applications.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Complete profiles can apply (not to own gigs)
CREATE POLICY "Complete profiles can apply"
ON applications FOR INSERT
TO authenticated
WITH CHECK (
    -- User has complete profile
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid()
        AND is_profile_complete = true
    )
    AND 
    -- Not applying to own gig
    NOT EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_id
        AND gigs.created_by = auth.uid()
    )
    AND
    -- User is the applicant
    applicant_user_id = auth.uid()
);

-- Users can update their own applications (only certain fields)
CREATE POLICY "Users can update their applications"
ON applications FOR UPDATE
TO authenticated
USING (applicant_user_id = auth.uid())
WITH CHECK (applicant_user_id = auth.uid());

-- Gig creators can update application status
CREATE POLICY "Gig creators can update application status"
ON applications FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = applications.gig_id
        AND gigs.created_by = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = applications.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- ============================================
-- Step 6: Applicant Skills Policies
-- ============================================

-- Users can view all skills (needed to show on applications)
CREATE POLICY "Anyone can view skills"
ON applicant_skills FOR SELECT
TO authenticated
USING (true);

-- Users can insert their own skills
CREATE POLICY "Users can insert their own skills"
ON applicant_skills FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own skills
CREATE POLICY "Users can update their own skills"
ON applicant_skills FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own skills
CREATE POLICY "Users can delete their own skills"
ON applicant_skills FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- Step 7: Referrals Policies
-- ============================================

-- Users can view referrals where they are involved
CREATE POLICY "Users can view their referrals"
ON referrals FOR SELECT
TO authenticated
USING (
    referred_user_id = auth.uid() OR
    referrer_user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = referrals.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Users can create referrals
CREATE POLICY "Users can create referrals"
ON referrals FOR INSERT
TO authenticated
WITH CHECK (referrer_user_id = auth.uid());

-- Users can update referrals they created or received
CREATE POLICY "Users can update their referrals"
ON referrals FOR UPDATE
TO authenticated
USING (
    referred_user_id = auth.uid() OR
    referrer_user_id = auth.uid()
)
WITH CHECK (
    referred_user_id = auth.uid() OR
    referrer_user_id = auth.uid()
);

-- ============================================
-- Step 8: Crew Availability Policies
-- ============================================

-- Users can view their own availability
CREATE POLICY "Users can view their own availability"
ON crew_availability FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Gig creators can view crew availability for their gigs
CREATE POLICY "Gig creators can view crew availability"
ON crew_availability FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = crew_availability.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Users can view availability of people who applied to their gigs
CREATE POLICY "Gig creators can view applicant availability"
ON crew_availability FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM applications a
        JOIN gigs g ON a.gig_id = g.id
        WHERE a.applicant_user_id = crew_availability.user_id
        AND g.created_by = auth.uid()
    )
);

-- Users can insert their own availability
CREATE POLICY "Users can insert their own availability"
ON crew_availability FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own availability
CREATE POLICY "Users can update their own availability"
ON crew_availability FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own availability
CREATE POLICY "Users can delete their own availability"
ON crew_availability FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- Step 9: Crew Contacts Policies
-- ============================================

-- Only gig creators can view contacts for their gigs
CREATE POLICY "Gig creators can view contacts"
ON crew_contacts FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = crew_contacts.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Gig creators can insert contacts
CREATE POLICY "Gig creators can insert contacts"
ON crew_contacts FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = crew_contacts.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Gig creators can update contacts
CREATE POLICY "Gig creators can update contacts"
ON crew_contacts FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = crew_contacts.gig_id
        AND gigs.created_by = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = crew_contacts.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Gig creators can delete contacts
CREATE POLICY "Gig creators can delete contacts"
ON crew_contacts FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = crew_contacts.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- ============================================
-- Step 10: Notifications Policies
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- System can create notifications (handled by service role in API)
CREATE POLICY "Service can create notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON notifications FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- Success message
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'All RLS policies created successfully! ✅';
    RAISE NOTICE 'Next step: Set up Storage buckets in Supabase Dashboard';
    RAISE NOTICE 'Then run 03_storage_policies.sql';
END $$;
