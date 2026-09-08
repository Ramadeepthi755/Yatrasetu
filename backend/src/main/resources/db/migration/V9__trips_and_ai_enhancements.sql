-- ==============================================================================
-- YATRASETU V9: Trips and AI Enhancements Migration
-- Non-destructive enhancements to trips and itinerary_items tables
-- ==============================================================================

ALTER TABLE trips ADD COLUMN IF NOT EXISTS preferences_json JSONB;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS budget_breakdown_json JSONB;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE;

ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS poi_id VARCHAR(50);
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS price_transparency VARCHAR(30) DEFAULT 'ESTIMATED';
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS metadata_json JSONB;

CREATE INDEX IF NOT EXISTS idx_itinerary_items_poi_id ON itinerary_items(poi_id);
