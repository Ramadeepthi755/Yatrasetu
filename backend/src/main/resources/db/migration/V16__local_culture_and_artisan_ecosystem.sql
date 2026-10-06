-- ============================================================================
-- YatraSetu Migration V16: Local Culture & Artisan Ecosystem Foundation
-- ============================================================================
-- Design Principles:
-- 1. Non-destructive: Existing V1-V15 tables and data are strictly preserved
-- 2. Clean separation of structured cultural heritage facts from transient experiences
-- 3. Geographic integrity: State-level, City-level, and Destination-level mapping
-- 4. Idempotency & Safe Indexing
-- 5. ZERO bulk seed data in V16 (Foundation Phase)
-- ============================================================================

-- 1. Cultural Traditions Table
CREATE TABLE IF NOT EXISTS cultural_traditions (
    id VARCHAR(64) PRIMARY KEY,
    state_id VARCHAR(50) NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    city_id VARCHAR(50) REFERENCES cities(id) ON DELETE SET NULL,
    destination_id VARCHAR(50) REFERENCES destinations(id) ON DELETE SET NULL,
    tradition_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    craft_type VARCHAR(150),
    historical_origin TEXT,
    materials_used TEXT,
    cultural_significance TEXT,
    is_gi_tagged BOOLEAN NOT NULL DEFAULT FALSE,
    gi_tag_year VARCHAR(10),
    primary_producing_cluster VARCHAR(255),
    source_organization VARCHAR(255) DEFAULT 'Ministry of Textiles / DC Handicrafts',
    source_type VARCHAR(50) NOT NULL DEFAULT 'OFFICIAL',
    source_url TEXT,
    image_url TEXT,
    provenance TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cultural_traditions_state ON cultural_traditions(state_id);
CREATE INDEX IF NOT EXISTS idx_cultural_traditions_city ON cultural_traditions(city_id);
CREATE INDEX IF NOT EXISTS idx_cultural_traditions_dest ON cultural_traditions(destination_id);
CREATE INDEX IF NOT EXISTS idx_cultural_traditions_category ON cultural_traditions(category);
CREATE INDEX IF NOT EXISTS idx_cultural_traditions_active ON cultural_traditions(is_active);

-- 2. Extend experiences table with optional cultural_tradition_id
ALTER TABLE experiences
    ADD COLUMN IF NOT EXISTS cultural_tradition_id VARCHAR(64) REFERENCES cultural_traditions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_experiences_cultural_tradition ON experiences(cultural_tradition_id);
