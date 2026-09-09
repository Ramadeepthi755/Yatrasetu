-- ============================================================================
-- YatraSetu Migration V15: Tourism Intelligence Deepening & Destination Health
-- ============================================================================
-- Design Principles:
-- 1. Non-destructive: Existing V1-V14 tables and data are strictly preserved
-- 2. Enhanced Action Lifecycle: status, priority, resolution_notes, resolved_at on tourism_government_actions
-- 3. Local Ecosystem Gaps: Tracks verified supply bottlenecks (guide, stay, experience, connectivity)
-- 4. Idempotency & Safe Indexing
-- ============================================================================

-- 1. Enhance tourism_government_actions with lifecycle and priority fields
ALTER TABLE tourism_government_actions 
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'LOGGED',
    ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    ADD COLUMN IF NOT EXISTS resolution_notes TEXT,
    ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_gov_actions_status ON tourism_government_actions(status);
CREATE INDEX IF NOT EXISTS idx_gov_actions_priority ON tourism_government_actions(priority);
CREATE INDEX IF NOT EXISTS idx_gov_actions_created_at ON tourism_government_actions(created_at DESC);

-- 2. Tourism Ecosystem Gaps Table
CREATE TABLE IF NOT EXISTS tourism_ecosystem_gaps (
    id VARCHAR(50) PRIMARY KEY,
    destination_id VARCHAR(50) NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    gap_type VARCHAR(50) NOT NULL, -- GUIDE_HOST_DEFICIT, STAYS_DEFICIT, EXPERIENCE_DEFICIT, CONNECTIVITY_GAP
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW
    description TEXT NOT NULL,
    suggested_intervention TEXT NOT NULL,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_dest_gap UNIQUE (destination_id, gap_type)
);

CREATE INDEX IF NOT EXISTS idx_ecosystem_gaps_dest ON tourism_ecosystem_gaps(destination_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_gaps_type ON tourism_ecosystem_gaps(gap_type);
CREATE INDEX IF NOT EXISTS idx_ecosystem_gaps_severity ON tourism_ecosystem_gaps(severity);
