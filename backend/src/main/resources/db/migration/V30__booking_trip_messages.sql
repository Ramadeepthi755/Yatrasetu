-- V30: Trip-scoped In-App Messaging for Confirmed Bookings between Tourist and Assigned Provider

CREATE TABLE IF NOT EXISTS booking_messages (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL REFERENCES experience_bookings(id) ON DELETE CASCADE,
    sender_id VARCHAR(50) NOT NULL REFERENCES users(id),
    receiver_id VARCHAR(50) NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_booking_messages_booking ON booking_messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_messages_sender ON booking_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_booking_messages_receiver ON booking_messages(receiver_id);
