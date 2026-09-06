-- V23: Hotel Date-Specific Availability Foundation
-- Adds unique constraints to guarantee no duplicate date inventory or baseline inventory per room type

CREATE UNIQUE INDEX IF NOT EXISTS idx_hotel_inv_room_date ON hotel_inventory(room_type_id, inventory_date) WHERE inventory_date IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_hotel_inv_room_base ON hotel_inventory(room_type_id) WHERE inventory_date IS NULL;
