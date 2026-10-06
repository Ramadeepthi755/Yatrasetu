-- =============================================================================
-- YatraSetu Database Migration V39: Guide Verification Applications Ecosystem
-- =============================================================================

CREATE TABLE IF NOT EXISTS guide_applications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    guide_name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    category VARCHAR(100) DEFAULT 'GUIDE',
    business_name VARCHAR(200),
    operating_state VARCHAR(100),
    operating_city VARCHAR(100),
    address TEXT,
    description TEXT,
    skills TEXT,
    indicative_pricing VARCHAR(100),
    languages TEXT,
    linkedin_url VARCHAR(255),
    instagram_url VARCHAR(255),
    digilocker_verified BOOLEAN DEFAULT FALSE,
    aadhaar_last4 VARCHAR(4),
    residency_city VARCHAR(100),
    residency_years INT,
    residency_proof_ref VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW',
    reviewer_notes TEXT,
    reviewed_by VARCHAR(50),
    reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_guide_apps_user_id ON guide_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_guide_apps_status ON guide_applications(status);

-- Seed demo pending guide verification application for SIH Presentation queue using existing SIH demo guide user (usr-sih-guide-ravi)
INSERT INTO guide_applications (
    id, user_id, guide_name, email, category, business_name, operating_state, operating_city,
    address, description, skills, indicative_pricing, languages, linkedin_url, instagram_url,
    digilocker_verified, aadhaar_last4, residency_city, residency_years, residency_proof_ref,
    status, reviewer_notes, submitted_at, created_at, updated_at
) VALUES (
    'gapp-sih-demo-1',
    'usr-sih-guide-ravi',
    'Ravi Kumar',
    'ravi.guide@yatrasetu.demo',
    'GUIDE',
    'Ravi Heritage & Temple Walks',
    'Andhra Pradesh',
    'Tirupati',
    'Near Kapila Theertham, Tirupati, Andhra Pradesh 517501',
    'Expert storyteller with 8+ years experience offering architectural, historical and temple heritage tours across Tirumala and Tirupati.',
    'Storytelling, Temple Architecture, Heritage Photography',
    '₹500 / hr',
    'Telugu, English, Hindi',
    'https://linkedin.com/in/ravi-kumar-guide',
    'https://instagram.com/ravi_tirupati_walks',
    TRUE,
    '4829',
    'Tirupati',
    8,
    'utility_bill_tirupati_residency_proof.pdf',
    'PENDING_REVIEW',
    'Awaiting government verification for official heritage guide badge.',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours',
    NOW()
) ON CONFLICT (id) DO NOTHING;
