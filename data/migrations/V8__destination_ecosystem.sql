-- ==============================================================================
-- V8__destination_ecosystem.sql
-- Destination Ecosystem Schema & Authentic Dataset Ingestion
-- Strictly adheres to provenance: DATASET, OFFICIAL, API, PARTNER_SUBMITTED, USER_GENERATED, DEMO
-- Zero synthetic business fabrication.
-- ==============================================================================

-- 1. FAMOUS REGIONAL FOOD (Authentic dishes from curated dataset)
CREATE TABLE IF NOT EXISTS famous_foods (
    id VARCHAR(64) PRIMARY KEY,
    destination_id VARCHAR(50) NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    dish_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_vegetarian BOOLEAN,
    cuisine_type VARCHAR(100),
    image_url TEXT,
    source_type VARCHAR(50) NOT NULL DEFAULT 'DATASET',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_famous_foods_destination_id ON famous_foods(destination_id);

-- 2. RESTAURANTS (Partner / Official / Real API listings only - NO synthetic businesses)
CREATE TABLE IF NOT EXISTS restaurants (
    id VARCHAR(64) PRIMARY KEY,
    destination_id VARCHAR(50) NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    cuisine_type VARCHAR(255),
    address TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    rating NUMERIC(3, 2),
    reviews_count INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    source_type VARCHAR(50) NOT NULL DEFAULT 'PARTNER_SUBMITTED',
    phone VARCHAR(50),
    website VARCHAR(255),
    opening_hours VARCHAR(100),
    price_range VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_restaurants_destination_id ON restaurants(destination_id);

-- 3. DESTINATION TRANSPORTS (Connectivity nodes & routes)
CREATE TABLE IF NOT EXISTS destination_transports (
    id VARCHAR(64) PRIMARY KEY,
    destination_id VARCHAR(50) NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    mode VARCHAR(50) NOT NULL, -- AIRPORT, RAILWAY, BUS_ROAD, LOCAL_AUTO, METRO, TAXI, FERRY
    name VARCHAR(500) NOT NULL,
    distance_km NUMERIC(8, 2),
    description TEXT,
    road_condition TEXT,
    price_type VARCHAR(50) DEFAULT 'PRICE_UNAVAILABLE', -- PRICE_UNAVAILABLE, ESTIMATED_PRICE, EXACT_FARE
    estimated_fare_inr NUMERIC(10, 2),
    source_type VARCHAR(50) NOT NULL DEFAULT 'DATASET',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_destination_transports_destination_id ON destination_transports(destination_id);

-- 4. TRAVEL AGENCIES (Authorized/Partner listings only)
CREATE TABLE IF NOT EXISTS travel_agencies (
    id VARCHAR(64) PRIMARY KEY,
    destination_id VARCHAR(50) NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    agency_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    address TEXT,
    services_offered TEXT,
    rating NUMERIC(3, 2),
    is_verified BOOLEAN DEFAULT FALSE,
    source_type VARCHAR(50) NOT NULL DEFAULT 'PARTNER_SUBMITTED',
    phone VARCHAR(50),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_travel_agencies_destination_id ON travel_agencies(destination_id);

-- 5. RENTAL PROVIDERS (Bikes, Scooters, Cars - Authorized/Partner listings only)
CREATE TABLE IF NOT EXISTS rental_providers (
    id VARCHAR(64) PRIMARY KEY,
    destination_id VARCHAR(50) NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    provider_name VARCHAR(255) NOT NULL,
    vehicle_types VARCHAR(255),
    address TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    source_type VARCHAR(50) NOT NULL DEFAULT 'PARTNER_SUBMITTED',
    phone VARCHAR(50),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_rental_providers_destination_id ON rental_providers(destination_id);

-- 6. EXTEND HOTELS TABLE WITH INVENTORY & PROVENANCE COLUMNS
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS inventory_type VARCHAR(50) DEFAULT 'DATASET_PROPERTY';
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'DATASET';

-- 7. INGEST FAMOUS REGIONAL DISHES FROM CURATED DESTINATIONS DATASET
INSERT INTO famous_foods (id, destination_id, dish_name, source_type)
SELECT 
    'food-' || d.id || '-' || row_number() OVER (PARTITION BY d.id),
    d.id,
    trim(dish),
    'DATASET'
FROM destinations d,
LATERAL unnest(string_to_array(d.local_cuisine_must_try, '|')) AS dish
WHERE trim(dish) <> ''
ON CONFLICT (id) DO NOTHING;

-- 8. INGEST AIRPORT CONNECTIVITY FROM CURATED DESTINATIONS DATASET
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, source_type)
SELECT
    'trans-' || d.id || '-air',
    d.id,
    'AIRPORT',
    d.nearest_airport->>'name',
    CAST(NULLIF(d.nearest_airport->>'distance_km', '') AS NUMERIC),
    'Nearest airport servicing ' || d.destination_name,
    'PRICE_UNAVAILABLE',
    'DATASET'
FROM destinations d
WHERE d.nearest_airport->>'name' IS NOT NULL AND trim(d.nearest_airport->>'name') <> ''
ON CONFLICT (id) DO NOTHING;

-- 9. INGEST RAILWAY CONNECTIVITY FROM CURATED DESTINATIONS DATASET
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, source_type)
SELECT
    'trans-' || d.id || '-rail',
    d.id,
    'RAILWAY',
    d.nearest_railway->>'name',
    CAST(NULLIF(d.nearest_railway->>'distance_km', '') AS NUMERIC),
    'Nearest railway station servicing ' || d.destination_name,
    'PRICE_UNAVAILABLE',
    'DATASET'
FROM destinations d
WHERE d.nearest_railway->>'name' IS NOT NULL AND trim(d.nearest_railway->>'name') <> ''
ON CONFLICT (id) DO NOTHING;

-- 10. INGEST ROAD CONNECTIVITY FROM CURATED DESTINATIONS DATASET
INSERT INTO destination_transports (id, destination_id, mode, name, road_condition, description, price_type, source_type)
SELECT
    'trans-' || d.id || '-road',
    d.id,
    'BUS_ROAD',
    'Road Network',
    d.road_connectivity,
    d.road_connectivity,
    'PRICE_UNAVAILABLE',
    'DATASET'
FROM destinations d
WHERE d.road_connectivity IS NOT NULL AND trim(d.road_connectivity) <> ''
ON CONFLICT (id) DO NOTHING;
