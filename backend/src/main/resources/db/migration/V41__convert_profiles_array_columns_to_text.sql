-- =============================================================================
-- YatraSetu Database Migration V41: Convert Profiles Array Columns to TEXT for JPA Compatibility
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'languages' AND udt_name = '_text'
    ) THEN
        EXECUTE 'ALTER TABLE profiles ALTER COLUMN languages TYPE TEXT USING array_to_string(languages, '','')';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'interests' AND udt_name = '_text'
    ) THEN
        EXECUTE 'ALTER TABLE profiles ALTER COLUMN interests TYPE TEXT USING array_to_string(interests, '','')';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'partner_skills' AND udt_name = '_text'
    ) THEN
        EXECUTE 'ALTER TABLE profiles ALTER COLUMN partner_skills TYPE TEXT USING array_to_string(partner_skills, '','')';
    END IF;
END $$;
