-- ==============================================================================
-- V26: Hotel Payment Transactions & Webhook Idempotency Engine
-- Phase 22.8 — Real Razorpay Sandbox Payment & Reconciliation Model
-- ==============================================================================

CREATE TABLE IF NOT EXISTS hotel_payment_transactions (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL REFERENCES hotel_bookings(id) ON DELETE RESTRICT,
    provider VARCHAR(50) NOT NULL DEFAULT 'RAZORPAY',
    provider_order_id VARCHAR(100) NOT NULL UNIQUE,
    provider_payment_id VARCHAR(100) UNIQUE,
    provider_signature VARCHAR(255),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- UNPAID, PENDING, PAID, FAILED, REFUNDED
    failure_code VARCHAR(100),
    failure_description TEXT,
    idempotency_key VARCHAR(100) UNIQUE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hotel_payments_booking_id ON hotel_payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_hotel_payments_order_id ON hotel_payment_transactions(provider_order_id);
CREATE INDEX IF NOT EXISTS idx_hotel_payments_status ON hotel_payment_transactions(status);

CREATE TABLE IF NOT EXISTS hotel_payment_webhook_events (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'RAZORPAY',
    payload_hash VARCHAR(64),
    status VARCHAR(50) NOT NULL DEFAULT 'PROCESSED',
    processed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hotel_webhook_event_id ON hotel_payment_webhook_events(event_id);
