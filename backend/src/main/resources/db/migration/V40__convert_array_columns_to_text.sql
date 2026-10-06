-- =============================================================================
-- YatraSetu Database Migration V40: Convert Array Columns to TEXT for JPA Compatibility
-- =============================================================================

ALTER TABLE experiences ALTER COLUMN included_items TYPE TEXT USING included_items::text;
ALTER TABLE experiences ALTER COLUMN languages TYPE TEXT USING languages::text;

ALTER TABLE local_hosts ALTER COLUMN languages TYPE TEXT USING languages::text;
ALTER TABLE local_hosts ALTER COLUMN skills TYPE TEXT USING skills::text;
ALTER TABLE local_hosts ALTER COLUMN interests TYPE TEXT USING interests::text;
