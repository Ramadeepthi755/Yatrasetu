-- V21: Hotel Rate Plans & Pricing Foundation

CREATE TABLE IF NOT EXISTS hotel_rate_plans (
    id VARCHAR(50) PRIMARY KEY,
    room_type_id VARCHAR(50) NOT NULL REFERENCES hotel_room_types(id) ON DELETE CASCADE,
    plan_name VARCHAR(150) NOT NULL,
    meal_plan VARCHAR(50) NOT NULL DEFAULT 'EP',
    description TEXT,
    base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    price_unit VARCHAR(50) NOT NULL DEFAULT 'PER_NIGHT',
    valid_from DATE,
    valid_to DATE,
    cancellation_policy VARCHAR(50) NOT NULL DEFAULT 'FREE_CANCELLATION',
    cancellation_deadline_hours INT NOT NULL DEFAULT 24 CHECK (cancellation_deadline_hours >= 0),
    cancellation_fee_type VARCHAR(50) NOT NULL DEFAULT 'NONE',
    cancellation_fee_value NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (cancellation_fee_value >= 0),
    taxes_included BOOLEAN NOT NULL DEFAULT FALSE,
    fees_included BOOLEAN NOT NULL DEFAULT FALSE,
    source_type VARCHAR(50) NOT NULL DEFAULT 'PARTNER_SUBMITTED',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    is_demo_data BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_rate_valid_dates CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)
);

-- Indexes for rate plan lookups and validity scoping
CREATE INDEX IF NOT EXISTS idx_hotel_rate_plans_room_type_id ON hotel_rate_plans(room_type_id);
CREATE INDEX IF NOT EXISTS idx_hotel_rate_plans_status ON hotel_rate_plans(status);
CREATE INDEX IF NOT EXISTS idx_hotel_rate_plans_meal_plan ON hotel_rate_plans(meal_plan);
CREATE INDEX IF NOT EXISTS idx_hotel_rate_plans_validity ON hotel_rate_plans(valid_from, valid_to);
