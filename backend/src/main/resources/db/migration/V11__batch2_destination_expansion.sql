-- ==============================================================================
-- V11__batch2_destination_expansion.sql
-- YatraSetu Phase 8: Batch 2 Destination Expansion & Authentic POI/Hotel Linking
--
-- Destinations Created (3):
--   1. Mysore (Mysuru), Karnataka (dest-113, IN-KA, mysore)
--   2. Coimbatore, Tamil Nadu (dest-114, IN-TN, coimbatore)
--   3. Guwahati, Assam (dest-115, IN-AS, guwahati)
--
-- Existing Destination Fixes:
--   - Manali (dest-13): Updates city_id from 'kullu' to 'manali'
--
-- Entity Link Counts:
--   - POIs Linked: 116 (Mysore: 26, Coimbatore: 23, Guwahati: 6, Manali: 4, Chennai: 24, Bengaluru: 33)
--   - Hotels Linked: 108 (Mysore: 21, Coimbatore: 21, Guwahati: 21, Goa: 23, Pondicherry: 22)
--   - Excluded POIs: 45 preserved unlinked (poi-city-209, poi-city-383, etc.)
--
-- Strict Constraints:
--   - Zero data deletion or truncation
--   - Preserves all 93 original destinations and 12 Batch 1 destinations
--   - Preserves original hotel city_id values without alteration
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. INSERT NEW DESTINATION RECORDS (Deterministic INSERT without ON CONFLICT)
-- ------------------------------------------------------------------------------

-- dest-113: Mysore (Mysuru), Karnataka
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    ideal_for, description, is_active, created_at, updated_at
) VALUES (
    'dest-113', 'Mysore (Mysuru)', 'IN-KA', 'mysore', 'Mysuru', 'South India', 12.2958000, 76.6394000, 763,
    8.9, 'Easy',
    ARRAY['Heritage', 'Cultural', 'Royal Architecture', 'Spiritual'],
    ARRAY['Mysore Palace', 'Chamundeshwari Temple', 'Brindavan Gardens', 'Mysore Zoo', 'Jaganmohan Palace'],
    ARRAY['Palace Tours', 'Heritage Walks', 'Silk & Sandalwood Shopping', 'Garden Light Shows'],
    ARRAY['Families', 'History Enthusiasts', 'Culture Seekers', 'Photographers'],
    'The cultural capital of Karnataka, Mysore is world-renowned for its majestic royal palaces, rich heritage, vibrant Dasara festival, and aromatic sandalwood.',
    true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- dest-114: Coimbatore, Tamil Nadu
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    ideal_for, description, is_active, created_at, updated_at
) VALUES (
    'dest-114', 'Coimbatore', 'IN-TN', 'coimbatore', 'Coimbatore', 'South India', 11.0168000, 76.9558000, 411,
    8.4, 'Easy',
    ARRAY['Spiritual', 'Wellness', 'Eco-Tourism', 'Heritage'],
    ARRAY['Adiyogi Shiva Statue', 'Marudhamalai Temple', 'Gedee Car Museum', 'Siruvani Waterfalls', 'Velliangiri Hills'],
    ARRAY['Meditation & Yoga', 'Temple Pilgrimage', 'Nature Treks', 'Automotive History Tours'],
    ARRAY['Spiritual Seekers', 'Families', 'Nature Lovers', 'Weekend Travelers'],
    'Known as the Manchester of South India, Coimbatore combines thriving commerce with serene spiritual sanctuaries like Adiyogi, ancient temples, and the Western Ghats.',
    true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- dest-115: Guwahati, Assam
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    ideal_for, description, is_active, created_at, updated_at
) VALUES (
    'dest-115', 'Guwahati', 'IN-AS', 'guwahati', 'Kamrup Metropolitan', 'North East', 26.1445000, 91.7362000, 55,
    8.7, 'Easy',
    ARRAY['River Heritage', 'Spiritual', 'Cultural', 'Gateway'],
    ARRAY['Sri Umananda Temple', 'Sukreshwar Mandir', 'IIT Guwahati Campus', 'Nehru Park', 'Pan Bazar'],
    ARRAY['Brahmaputra River Cruises', 'Island Temple Visits', 'Assamese Handicraft Shopping', 'Stargazing'],
    ARRAY['Culture Travelers', 'Spiritual Pilgrims', 'Nature Photographers', 'Gateway Explorers'],
    'The bustling gateway to Northeast India situated on the mighty Brahmaputra river, famed for sacred river island shrines, vibrant bazaars, and Assam heritage.',
    true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. EXISTING DESTINATION CORRECTIONS
-- ------------------------------------------------------------------------------

-- Fix Manali destination city mapping from 'kullu' to 'manali'
UPDATE destinations
SET city_id = 'manali', updated_at = CURRENT_TIMESTAMP
WHERE id = 'dest-13' AND city_id = 'kullu';

-- ------------------------------------------------------------------------------
-- 3. POI LINKING (116 APPROVED POIs)
-- ------------------------------------------------------------------------------

-- Mysore POIs (26 records: 25 base unlinked + 1 canonical market)
UPDATE destination_pois
SET destination_id = 'dest-113', city_id = 'mysore', updated_at = CURRENT_TIMESTAMP
WHERE id IN (
    'poi-city-324', 'poi-city-325', 'poi-city-326', 'poi-city-327', 'poi-city-328',
    'poi-city-329', 'poi-city-330', 'poi-city-331', 'poi-city-332', 'poi-city-333',
    'poi-city-334', 'poi-city-335', 'poi-city-336', 'poi-city-338', 'poi-city-339',
    'poi-city-340', 'poi-city-341', 'poi-city-342', 'poi-city-343', 'poi-city-344',
    'poi-city-345', 'poi-city-349', 'poi-city-350', 'poi-city-351', 'poi-city-352',
    'poi-ts-132'
) AND destination_id IS NULL;

-- Coimbatore POIs (23 records: 11 Class A + 12 Class B)
UPDATE destination_pois
SET destination_id = 'dest-114', city_id = 'coimbatore', updated_at = CURRENT_TIMESTAMP
WHERE id IN (
    'poi-city-1', 'poi-city-2', 'poi-city-3', 'poi-city-4', 'poi-city-5',
    'poi-city-6', 'poi-city-7', 'poi-city-10', 'poi-city-11', 'poi-city-12',
    'poi-city-13', 'poi-city-14', 'poi-city-15', 'poi-city-16', 'poi-city-17',
    'poi-city-18', 'poi-city-19', 'poi-city-20', 'poi-city-21', 'poi-city-22',
    'poi-city-23', 'poi-city-24', 'poi-city-25'
) AND destination_id IS NULL;

-- Guwahati POIs (6 records: Class A urban attractions)
UPDATE destination_pois
SET destination_id = 'dest-115', city_id = 'guwahati', updated_at = CURRENT_TIMESTAMP
WHERE id IN (
    'poi-city-152', 'poi-city-153', 'poi-city-155', 'poi-city-156', 'poi-city-157',
    'poi-city-158'
) AND destination_id IS NULL;

-- Manali POIs (4 records: 1 Class A + 3 Class B canonical)
UPDATE destination_pois
SET destination_id = 'dest-13', city_id = 'manali', updated_at = CURRENT_TIMESTAMP
WHERE id IN (
    'poi-ts-412', 'poi-ts-415', 'poi-ts-424', 'poi-ts-455'
) AND destination_id IS NULL;

-- Chennai Remaining Urban POIs (24 records — poi-city-209 excluded)
UPDATE destination_pois
SET destination_id = 'dest-108', city_id = 'chennai', updated_at = CURRENT_TIMESTAMP
WHERE id IN (
    'poi-city-185', 'poi-city-186', 'poi-city-187', 'poi-city-188', 'poi-city-189',
    'poi-city-190', 'poi-city-191', 'poi-city-192', 'poi-city-193', 'poi-city-194',
    'poi-city-195', 'poi-city-196', 'poi-city-197', 'poi-city-198', 'poi-city-199',
    'poi-city-200', 'poi-city-201', 'poi-city-202', 'poi-city-203', 'poi-city-204',
    'poi-city-205', 'poi-city-206', 'poi-city-207', 'poi-city-208'
) AND destination_id IS NULL;

-- Bengaluru Remaining Urban POIs (33 records, using canonical city_id 'bangalore')
UPDATE destination_pois
SET destination_id = 'dest-105', city_id = 'bangalore', updated_at = CURRENT_TIMESTAMP
WHERE id IN (
    'poi-city-321', 'poi-city-322',
    'poi-city-353', 'poi-city-354', 'poi-city-355', 'poi-city-356', 'poi-city-357',
    'poi-city-358', 'poi-city-359', 'poi-city-360', 'poi-city-361', 'poi-city-362',
    'poi-city-363', 'poi-city-364', 'poi-city-365', 'poi-city-366', 'poi-city-367',
    'poi-city-368', 'poi-city-369', 'poi-city-370', 'poi-city-371', 'poi-city-372',
    'poi-city-373', 'poi-city-374', 'poi-city-375', 'poi-city-376', 'poi-city-377',
    'poi-city-378', 'poi-city-379', 'poi-city-380', 'poi-city-381', 'poi-city-382',
    'poi-city-384'
) AND destination_id IS NULL;

-- ------------------------------------------------------------------------------
-- 4. HOTEL RELATIONSHIPS (108 HOTELS, PRESERVING ORIGINAL city_id)
-- ------------------------------------------------------------------------------

-- Mysore Hotels (21 records)
UPDATE hotels
SET destination_id = 'dest-113', updated_at = CURRENT_TIMESTAMP
WHERE city_id = 'mysore' AND destination_id IS NULL;

-- Coimbatore Hotels (21 records)
UPDATE hotels
SET destination_id = 'dest-114', updated_at = CURRENT_TIMESTAMP
WHERE city_id = 'coimbatore' AND destination_id IS NULL;

-- Guwahati Hotels (21 records)
UPDATE hotels
SET destination_id = 'dest-115', updated_at = CURRENT_TIMESTAMP
WHERE city_id = 'guwahati' AND destination_id IS NULL;

-- Goa Hotels (23 records)
UPDATE hotels
SET destination_id = 'dest-1', updated_at = CURRENT_TIMESTAMP
WHERE city_id = 'goa' AND destination_id IS NULL;

-- Pondicherry Hotels (22 records)
UPDATE hotels
SET destination_id = 'dest-26', updated_at = CURRENT_TIMESTAMP
WHERE city_id = 'pondicherry' AND destination_id IS NULL;
