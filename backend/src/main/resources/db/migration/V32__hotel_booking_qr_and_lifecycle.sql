-- ============================================================================
-- V32: Hotel Booking QR Check-In, Full Lifecycle & Reviews
-- Supports:
-- 1. REQUESTED, ACCEPTED, CONFIRMED, CHECKED_IN, CHECKED_OUT, REJECTED statuses
-- 2. Secure QR check-in token (YATRASETU-HOTEL-CHECKIN:<token>)
-- 3. Payment methods (ONLINE, PAY_AT_HOTEL)
-- 4. Check-in and check-out timestamps
-- 5. Verified hotel reviews and rejection reason
-- ============================================================================

ALTER TABLE hotel_bookings
    ADD COLUMN IF NOT EXISTS qr_token VARCHAR(120) UNIQUE,
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) NOT NULL DEFAULT 'ONLINE',
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS review_rating NUMERIC(3, 1),
    ADD COLUMN IF NOT EXISTS review_comment TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_hotel_bookings_qr_token ON hotel_bookings(qr_token);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_payment_method ON hotel_bookings(payment_method);
