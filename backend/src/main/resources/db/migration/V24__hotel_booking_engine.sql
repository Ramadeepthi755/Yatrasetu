-- ============================================================================
-- V24: Hotel Real Booking Engine Foundation
-- Supports transactional booking creation, per-night reservation allocations,
-- price snapshots, and idempotency tracking without fake payment simulation.
-- ============================================================================

CREATE TABLE IF NOT EXISTS hotel_bookings (
    id VARCHAR(50) PRIMARY KEY,
    booking_reference VARCHAR(50) NOT NULL UNIQUE,
    traveler_id VARCHAR(50) NOT NULL REFERENCES users(id),
    hotel_id VARCHAR(50) NOT NULL REFERENCES hotels(id),
    room_type_id VARCHAR(50) NOT NULL REFERENCES hotel_room_types(id),
    rate_plan_id VARCHAR(50) NOT NULL REFERENCES hotel_rate_plans(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    number_of_rooms INTEGER NOT NULL DEFAULT 1,
    number_of_nights INTEGER NOT NULL DEFAULT 1,
    adults INTEGER NOT NULL DEFAULT 1,
    children INTEGER NOT NULL DEFAULT 0,
    guest_name VARCHAR(150) NOT NULL,
    guest_email VARCHAR(150) NOT NULL,
    guest_phone VARCHAR(50) NOT NULL,
    special_requests TEXT,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    price_per_night NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    taxes_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    fees_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    booking_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_PAYMENT',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
    source_type VARCHAR(50) NOT NULL DEFAULT 'PARTNER_SUBMITTED',
    idempotency_key VARCHAR(100) UNIQUE,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hotel_booking_allocations (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL REFERENCES hotel_bookings(id) ON DELETE CASCADE,
    room_type_id VARCHAR(50) NOT NULL REFERENCES hotel_room_types(id),
    allocation_date DATE NOT NULL,
    allocated_units INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance and query optimization
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_reference ON hotel_bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_traveler ON hotel_bookings(traveler_id);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_hotel ON hotel_bookings(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_status ON hotel_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_created ON hotel_bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_expires ON hotel_bookings(expires_at) WHERE booking_status = 'PENDING_PAYMENT';

CREATE INDEX IF NOT EXISTS idx_hotel_booking_allocations_query ON hotel_booking_allocations(room_type_id, allocation_date, status);
CREATE INDEX IF NOT EXISTS idx_hotel_booking_allocations_booking ON hotel_booking_allocations(booking_id);
