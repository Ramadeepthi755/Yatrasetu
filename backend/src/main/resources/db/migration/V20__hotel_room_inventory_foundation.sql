-- V20: Hotel Room Types & Inventory Foundation

-- 1. Create hotel_room_types table
CREATE TABLE IF NOT EXISTS hotel_room_types (
    id VARCHAR(50) PRIMARY KEY,
    hotel_id VARCHAR(50) NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_type_name VARCHAR(150) NOT NULL,
    description TEXT,
    max_occupancy INT NOT NULL DEFAULT 2,
    bed_configuration VARCHAR(100),
    room_size_sqft INT,
    amenities TEXT,
    is_accessible BOOLEAN NOT NULL DEFAULT FALSE,
    base_inventory_units INT NOT NULL DEFAULT 1 CHECK (base_inventory_units >= 0),
    source_type VARCHAR(50) NOT NULL DEFAULT 'PARTNER_SUBMITTED',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_demo_data BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create hotel_inventory table
CREATE TABLE IF NOT EXISTS hotel_inventory (
    id VARCHAR(50) PRIMARY KEY,
    room_type_id VARCHAR(50) NOT NULL REFERENCES hotel_room_types(id) ON DELETE CASCADE,
    inventory_date DATE,
    total_units INT NOT NULL DEFAULT 1 CHECK (total_units >= 0),
    blocked_units INT NOT NULL DEFAULT 0 CHECK (blocked_units >= 0),
    source_type VARCHAR(50) NOT NULL DEFAULT 'PARTNER_SUBMITTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_blocked_le_total CHECK (blocked_units <= total_units)
);

-- 3. Indexes for efficient room lookup and inventory retrieval
CREATE INDEX IF NOT EXISTS idx_hotel_room_types_hotel_id ON hotel_room_types(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_room_types_is_active ON hotel_room_types(is_active);
CREATE INDEX IF NOT EXISTS idx_hotel_inventory_room_type_id ON hotel_inventory(room_type_id);
CREATE INDEX IF NOT EXISTS idx_hotel_inventory_date ON hotel_inventory(inventory_date);
