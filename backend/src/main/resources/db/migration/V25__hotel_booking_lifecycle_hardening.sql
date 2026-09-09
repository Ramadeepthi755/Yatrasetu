-- ============================================================================
-- V25: Hotel Booking Lifecycle Hardening & Status Audit History (Phase 22.7)
-- Adds immutable booking status audit trail, cancellation policy snapshots,
-- and structured cancellation reasons for production-grade lifecycle transitions.
-- ============================================================================

-- 1. Extend hotel_bookings table with cancellation policy snapshots and structured reason codes
ALTER TABLE hotel_bookings
    ADD COLUMN IF NOT EXISTS cancellation_policy_snapshot VARCHAR(50),
    ADD COLUMN IF NOT EXISTS cancellation_deadline_hours INTEGER,
    ADD COLUMN IF NOT EXISTS cancellation_reason_code VARCHAR(50);

-- 2. Create immutable booking status history table
CREATE TABLE IF NOT EXISTS hotel_booking_status_history (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL REFERENCES hotel_bookings(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    reason VARCHAR(255),
    actor_user_id VARCHAR(50) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Indexes for efficient lookup of status history and expiry queries
CREATE INDEX IF NOT EXISTS idx_hotel_booking_history_booking ON hotel_booking_status_history(booking_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_hotel_booking_history_created ON hotel_booking_status_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_status_expires ON hotel_bookings(booking_status, expires_at) WHERE booking_status = 'PENDING_PAYMENT';
