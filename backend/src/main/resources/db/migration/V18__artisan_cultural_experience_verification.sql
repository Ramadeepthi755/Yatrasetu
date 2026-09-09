-- =============================================================================
-- YatraSetu Database Migration V18: Artisan Cultural Experience Verification
-- Phase 21.4 — Artisan Partner Ecosystem & Cultural Experience Management
-- =============================================================================

-- 1. Add lifecycle status and verification columns to experiences table
ALTER TABLE experiences
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30) NOT NULL DEFAULT 'UNVERIFIED',
    ADD COLUMN IF NOT EXISTS verification_notes TEXT,
    ADD COLUMN IF NOT EXISTS verified_by VARCHAR(50),
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- 2. Performance indexes for lifecycle and verification queries
CREATE INDEX IF NOT EXISTS idx_experiences_status ON experiences(status);
CREATE INDEX IF NOT EXISTS idx_experiences_verification_status ON experiences(verification_status);
CREATE INDEX IF NOT EXISTS idx_experiences_host_status ON experiences(host_id, status);
