-- Seed Official Government SIH Demo User for Government Dashboard authentication

INSERT INTO users (
    id,
    auth_user_id,
    email,
    full_name,
    role,
    is_verified,
    verification_status,
    is_active,
    created_at,
    updated_at
)
VALUES (
    'usr-sih-government',
    'auth-official@tourism.gov.in',
    'official@tourism.gov.in',
    'Ministry of Tourism Official',
    'GOVERNMENT',
    true,
    'VERIFIED',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET
    role = 'GOVERNMENT',
    verification_status = 'VERIFIED',
    is_verified = true,
    is_active = true,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO profiles (
    id,
    display_name,
    verification_status,
    created_at,
    updated_at
)
VALUES (
    'usr-sih-government',
    'Ministry of Tourism Official',
    'VERIFIED',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;