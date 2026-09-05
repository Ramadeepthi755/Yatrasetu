-- ==============================================================================
-- YatraSetu Phase 5: Travel Connect Migration
-- ==============================================================================

-- 1. Enhance travel_buddies table
ALTER TABLE travel_buddies ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE travel_buddies ADD COLUMN IF NOT EXISTS flexible_dates BOOLEAN DEFAULT TRUE;
ALTER TABLE travel_buddies ADD COLUMN IF NOT EXISTS notes TEXT;

-- Backfill end_date for existing demo data (4 days after travel_date if null)
UPDATE travel_buddies 
SET end_date = travel_date + INTERVAL '4 days' 
WHERE end_date IS NULL;

-- Backfill destination_id for demo records based on destination_city
UPDATE travel_buddies SET destination_id = 'dest-4' WHERE (destination_city = 'Varanasi' OR destination_city ILIKE '%Varanasi%') AND destination_id IS NULL;
UPDATE travel_buddies SET destination_id = 'dest-3' WHERE (destination_city = 'Jaipur' OR destination_city ILIKE '%Jaipur%') AND destination_id IS NULL;
UPDATE travel_buddies SET destination_id = 'dest-5' WHERE (destination_city = 'Agra' OR destination_city ILIKE '%Agra%') AND destination_id IS NULL;
UPDATE travel_buddies SET destination_id = 'dest-27' WHERE (destination_city = 'Hampi' OR destination_city ILIKE '%Hampi%') AND destination_id IS NULL;
UPDATE travel_buddies SET destination_id = 'dest-20' WHERE (destination_city = 'Munnar' OR destination_city ILIKE '%Munnar%') AND destination_id IS NULL;
UPDATE travel_buddies SET destination_id = 'dest-6' WHERE (destination_city = 'Udaipur' OR destination_city ILIKE '%Udaipur%') AND destination_id IS NULL;
UPDATE travel_buddies SET destination_id = 'dest-37' WHERE (destination_city = 'Rishikesh' OR destination_city ILIKE '%Rishikesh%') AND destination_id IS NULL;
UPDATE travel_buddies SET destination_id = 'dest-13' WHERE (destination_city = 'Manali' OR destination_city ILIKE '%Manali%') AND destination_id IS NULL;
UPDATE travel_buddies SET destination_id = 'dest-40' WHERE (destination_city = 'Amritsar' OR destination_city ILIKE '%Amritsar%') AND destination_id IS NULL;
UPDATE travel_buddies SET destination_id = 'dest-7' WHERE (destination_city = 'Alappuzha' OR destination_city ILIKE '%Alappuzha%') AND destination_id IS NULL;
UPDATE travel_buddies SET destination_id = 'dest-2' WHERE (destination_city = 'Leh' OR destination_city ILIKE '%Leh%') AND destination_id IS NULL;
UPDATE travel_buddies SET destination_id = 'dest-1' WHERE (destination_city = 'North Goa' OR destination_city = 'Panaji' OR destination_city ILIKE '%Goa%') AND destination_id IS NULL;
UPDATE travel_buddies SET destination_id = 'dest-11' WHERE (destination_city = 'Shimla' OR destination_city ILIKE '%Shimla%') AND destination_id IS NULL;

-- 2. Enhance profiles table with visibility toggle
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS travel_connect_enabled BOOLEAN DEFAULT TRUE;

-- 3. Enhance travel_buddy_requests table indexes
CREATE INDEX IF NOT EXISTS idx_buddy_req_sender ON travel_buddy_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_buddy_req_receiver ON travel_buddy_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_buddy_req_status ON travel_buddy_requests(status);
CREATE INDEX IF NOT EXISTS idx_buddy_req_dest ON travel_buddy_requests(destination_id);

-- 4. Create messages table for safe internal messaging between connected travelers
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(50) PRIMARY KEY,
    connection_id VARCHAR(50) NOT NULL REFERENCES travel_buddy_requests(id) ON DELETE CASCADE,
    sender_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_messages_conn ON messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
