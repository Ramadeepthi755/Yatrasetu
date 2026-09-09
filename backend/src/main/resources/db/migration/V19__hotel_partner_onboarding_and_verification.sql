-- V19: Hotel Partner Onboarding & Verification Ecosystem

-- 1. Extend hotels table with partner ownership & verification fields
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS owner_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30) NOT NULL DEFAULT 'UNVERIFIED';
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS verified_by VARCHAR(50);
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS official_website VARCHAR(255);
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS check_in_time VARCHAR(50);
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS check_out_time VARCHAR(50);
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS is_demo_data BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Indexes for efficient partner querying and government verification queue
CREATE INDEX IF NOT EXISTS idx_hotels_owner_id ON hotels(owner_id);
CREATE INDEX IF NOT EXISTS idx_hotels_verification_status ON hotels(verification_status);
CREATE INDEX IF NOT EXISTS idx_hotels_is_partner_property ON hotels(is_partner_property);
