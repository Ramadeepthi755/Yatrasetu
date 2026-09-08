-- ==============================================================================
-- YatraSetu Migration V3: Authentication, Roles, and Enhanced Profiles
-- Product: YatraSetu ("Discover India. Connect Locally. Grow Tourism.")
-- ==============================================================================

-- 1. Users Table Enhancements
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30) DEFAULT 'PENDING'; -- PENDING, APPROVED, REJECTED
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- 2. Profiles Table Enhancements for Traveler and Partner Onboarding
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name VARCHAR(150);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS budget_preference VARCHAR(50) DEFAULT 'Mid-Range'; -- Budget, Mid-Range, Luxury, Backpacker
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_skills TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_name VARCHAR(200);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30) DEFAULT 'PENDING';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
