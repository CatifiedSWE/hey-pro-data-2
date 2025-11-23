-- ============================================
-- GIGS MODULE - DATABASE TABLES SETUP
-- Execute this script in Supabase SQL Editor
-- ============================================

-- Step 1: Update user_profiles table
-- Add contact information fields
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_complete ON user_profiles(is_profile_complete);

-- ============================================
-- Step 2: Create gigs table
-- ============================================
CREATE TABLE IF NOT EXISTS gigs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    qualifying_criteria TEXT,
    amount DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'AED',
    status VARCHAR(50) DEFAULT 'active', -- active, closed, draft
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for gigs
CREATE INDEX IF NOT EXISTS idx_gigs_created_by ON gigs(created_by);
CREATE INDEX IF NOT EXISTS idx_gigs_status ON gigs(status);
CREATE INDEX IF NOT EXISTS idx_gigs_created_at ON gigs(created_at DESC);

-- ============================================
-- Step 3: Create gig_dates table
-- ============================================
CREATE TABLE IF NOT EXISTS gig_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
    month VARCHAR(20) NOT NULL,
    days VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_gig_dates_gig_id ON gig_dates(gig_id);

-- ============================================
-- Step 4: Create gig_locations table
-- ============================================
CREATE TABLE IF NOT EXISTS gig_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
    location_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_gig_locations_gig_id ON gig_locations(gig_id);

-- ============================================
-- Step 5: Create applications table
-- ============================================
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
    applicant_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, shortlisted, confirmed, released
    cover_letter TEXT,
    portfolio_links TEXT[], -- Array of URLs
    resume_url TEXT,
    portfolio_files TEXT[], -- Array of file URLs
    notes TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_application_per_gig UNIQUE(gig_id, applicant_user_id)
);

-- Indexes for applications
CREATE INDEX IF NOT EXISTS idx_applications_gig_id ON applications(gig_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- ============================================
-- Step 6: Create applicant_skills table
-- ============================================
CREATE TABLE IF NOT EXISTS applicant_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_skill UNIQUE(user_id, skill_name)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_applicant_skills_user ON applicant_skills(user_id);

-- ============================================
-- Step 7: Create referrals table
-- ============================================
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, declined
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_referral UNIQUE(gig_id, referred_user_id, referrer_user_id)
);

-- Indexes for referrals
CREATE INDEX IF NOT EXISTS idx_referrals_gig ON referrals(gig_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);

-- ============================================
-- Step 8: Create crew_availability table
-- ============================================
CREATE TABLE IF NOT EXISTS crew_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
    availability_date DATE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_date_availability UNIQUE(user_id, availability_date)
);

-- Indexes for crew_availability
CREATE INDEX IF NOT EXISTS idx_crew_availability_user ON crew_availability(user_id);
CREATE INDEX IF NOT EXISTS idx_crew_availability_date ON crew_availability(availability_date);
CREATE INDEX IF NOT EXISTS idx_crew_availability_gig ON crew_availability(gig_id);

-- ============================================
-- Step 9: Create crew_contacts table
-- ============================================
CREATE TABLE IF NOT EXISTS crew_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    department VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_gig_user_dept UNIQUE(gig_id, user_id, department)
);

-- Indexes for crew_contacts
CREATE INDEX IF NOT EXISTS idx_crew_contacts_gig ON crew_contacts(gig_id);
CREATE INDEX IF NOT EXISTS idx_crew_contacts_department ON crew_contacts(department);

-- ============================================
-- Step 10: Create notifications table
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
    related_application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- Database Functions
-- ============================================

-- Function: Get Gig with Full Details
CREATE OR REPLACE FUNCTION get_gig_full_details(gig_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'gig', row_to_json(g.*),
        'dates', (SELECT json_agg(row_to_json(gd.*)) FROM gig_dates gd WHERE gd.gig_id = gig_uuid),
        'locations', (SELECT json_agg(row_to_json(gl.*)) FROM gig_locations gl WHERE gl.gig_id = gig_uuid),
        'applications_count', (SELECT COUNT(*) FROM applications a WHERE a.gig_id = gig_uuid),
        'creator', (
            SELECT json_build_object(
                'id', up.user_id,
                'legal_first_name', up.legal_first_name,
                'legal_surname', up.legal_surname,
                'profile_photo_url', up.profile_photo_url
            )
            FROM user_profiles up
            WHERE up.user_id = g.created_by
        )
    ) INTO result
    FROM gigs g
    WHERE g.id = gig_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check Availability Conflicts
CREATE OR REPLACE FUNCTION check_availability_conflicts(
    user_uuid UUID,
    check_date DATE
)
RETURNS JSON AS $$
DECLARE
    conflicts JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'gig', row_to_json(g.*),
            'application_status', a.status,
            'date', check_date
        )
    ) INTO conflicts
    FROM applications a
    JOIN gigs g ON a.gig_id = g.id
    WHERE a.applicant_user_id = user_uuid
    AND a.status IN ('confirmed', 'shortlisted');
    
    RETURN COALESCE(conflicts, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_gigs_updated_at
    BEFORE UPDATE ON gigs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crew_availability_updated_at
    BEFORE UPDATE ON crew_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Success message
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'All tables created successfully! ✅';
    RAISE NOTICE 'Next step: Run 02_rls_policies.sql to set up security';
END $$;
