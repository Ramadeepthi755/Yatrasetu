-- ==============================================================================
-- YatraSetu Migration: V13__zero_coverage_states_and_ut_expansion.sql
-- Product: YatraSetu ("Discover India. Connect Locally. Grow Tourism.")
-- Purpose: Phase 13 — Zero-Coverage States & Union Territory Coverage
-- Target States/UT: Dadra & Nagar Haveli and Daman & Diu (IN-DH), Haryana (IN-HR),
--                  Manipur (IN-MN), Mizoram (IN-MZ), Nagaland (IN-NL)
-- ==============================================================================

-- 1. UNION TERRITORY: DADRA & NAGAR HAVELI AND DAMAN & DIU
INSERT INTO states (id, state_name, region, capital_city, description, banner_image_url)
VALUES (
    'IN-DH',
    'Dadra and Nagar Haveli and Daman and Diu',
    'West India',
    'Daman',
    'Explore coastal Portuguese fortresses, tranquil Arabian Sea beaches, and rich indigenous Warli tribal culture.',
    'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80'
) ON CONFLICT (id) DO UPDATE SET
    state_name = EXCLUDED.state_name,
    region = EXCLUDED.region,
    capital_city = EXCLUDED.capital_city,
    description = EXCLUDED.description;

-- 2. CITIES (20 Verified Tourism Base Cities)
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('diu', 'Diu', 'IN-DH', 'Diu', 20.7144, 70.9874, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('daman', 'Daman', 'IN-DH', 'Daman', 20.3974, 72.8328, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('silvassa', 'Silvassa', 'IN-DH', 'Dadra and Nagar Haveli', 20.2763, 73.0083, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('kurukshetra', 'Kurukshetra', 'IN-HR', 'Kurukshetra', 29.9695, 76.8783, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('pinjore', 'Pinjore', 'IN-HR', 'Panchkula', 30.7967, 76.9157, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('morni-hills', 'Morni Hills', 'IN-HR', 'Panchkula', 30.6924, 77.0867, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('sultanpur-gurugram', 'Sultanpur', 'IN-HR', 'Gurugram', 28.4614, 76.8924, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('gurugram', 'Gurugram', 'IN-HR', 'Gurugram', 28.4595, 77.0266, 'Tier-1', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('imphal', 'Imphal', 'IN-MN', 'Imphal West', 24.817, 93.9368, 'Tier-2', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('moirang', 'Moirang', 'IN-MN', 'Bishnupur', 24.5028, 93.7719, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('ukhrul', 'Ukhrul', 'IN-MN', 'Ukhrul', 25.1167, 94.3667, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('aizawl', 'Aizawl', 'IN-MZ', 'Aizawl', 23.7271, 92.7176, 'Tier-2', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('reiek', 'Reiek', 'IN-MZ', 'Mamit', 23.6872, 92.6075, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('thenzawl', 'Thenzawl', 'IN-MZ', 'Serchhip', 23.2842, 92.7567, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('champhai', 'Champhai', 'IN-MZ', 'Champhai', 23.4561, 93.3283, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('kohima', 'Kohima', 'IN-NL', 'Kohima', 25.6751, 94.1086, 'Tier-2', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('kisama', 'Kisama', 'IN-NL', 'Kohima', 25.5997, 94.1167, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('viswema', 'Viswema', 'IN-NL', 'Kohima', 25.5683, 94.1522, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('khonoma', 'Khonoma', 'IN-NL', 'Kohima', 25.6483, 94.0192, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('mokokchung', 'Mokokchung', 'IN-NL', 'Mokokchung', 26.3256, 94.5203, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;

-- 3. DESTINATIONS (20 Curated Authentic Records: dest-116 to dest-135)
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-116', 'Diu', 'IN-DH', 'diu', 'Diu', 'West India',
    20.7144, 70.9874, 15, 8.1, 'Moderate',
    ARRAY['Beach', 'Heritage', 'Relaxation', 'Photography']::TEXT[], ARRAY['Diu Fort', 'Nagoa Beach', 'Naida Caves', 'St. Paul''s Church', 'Gangeshwar Mahadev Temple']::TEXT[], ARRAY['Beach walks', 'Fort exploration', 'Cave photography', 'Water sports', 'Sunset viewing']::TEXT[],
    'Exploring the dramatic honeycomb rock formations of Naida Caves and walking the sea-facing ramparts of the 16th-century Portuguese Diu Fort.', 'Gangeshwar Mahadev Temple where five Shiva Lingas are washed daily by tidal waves, and Jallandhar Beach shrine.', 'October, November, December, January, February, March', 'June, July, August', 'November to February', 'May to July',
    2.0, 3.0, 5, 'Diu is a tranquil island enclave off the southern coast of Gujarat, renowned for its imposing Portuguese fortress, pristine horseshoe-shaped Nagoa Beach, labyrinthine Naida rock caves, and relaxed coastal atmosphere.', 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80',
    'Gujarati, Hindi, English, Portuguese', 'Fresh Arabian Sea lobster, Cozido, Daman & Diu fish koliwada, jetfish curry', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-117', 'Daman', 'IN-DH', 'daman', 'Daman', 'West India',
    20.3974, 72.8328, 12, 7.9, 'Easy',
    ARRAY['Beach', 'Heritage', 'Weekend_getaway']::TEXT[], ARRAY['Moti Daman Fort', 'Nani Daman Fort', 'Devka Beach', 'Jampore Beach', 'Church of Bom Jesus']::TEXT[], ARRAY['Fort heritage walks', 'Beach paragliding', 'Horse riding on black sand beaches', 'Colonial church tours']::TEXT[],
    'Strolling through the 400-year-old carved wooden gateway of Moti Daman Fort and watching golden sunsets on the expansive Jampore black sand beach.', 'Chapel of Our Lady of Rosary inside Moti Daman with centuries-old Portuguese gilded wood relief panels.', 'October, November, December, January, February, March', 'June, July, August', 'October to February', 'June to August',
    1.5, 2.5, 4, 'Divided by the Daman Ganga river into Moti Daman and Nani Daman, this charming coastal getaway boasts monumental Portuguese fortresses, tranquil palm-fringed beaches, and rich Indo-Portuguese heritage.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'Gujarati, Hindi, English, Portuguese', 'Prawn balchao, Damanese fish curry, chicken xacuti, local papri snacks', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-118', 'Silvassa', 'IN-DH', 'silvassa', 'Dadra and Nagar Haveli', 'West India',
    20.2763, 73.0083, 32, 7.6, 'Easy',
    ARRAY['Nature', 'Tribal_culture', 'Eco_tourism', 'Family']::TEXT[], ARRAY['Tribal Cultural Museum', 'Dudhani Lake & Water Sports', 'Vanganga Lake Garden', 'Lion Safari Wildlife Park', 'Madhuban Dam']::TEXT[], ARRAY['Boating on Dudhani Lake', 'Warli tribal art discovery', 'Wildlife safari', 'Garden walks', 'Dam reservoir sightseeing']::TEXT[],
    'Learning authentic Warli indigenous painting traditions at the Tribal Museum and speedboating across the vast forested Dudhani reservoir on the Daman Ganga river.', 'Traditional Warli tribal hamlets near Khanvel and the scenic secluded waterfront at Chauda village.', 'October, November, December, January, February, March', 'May, June', 'November to February', 'April to June',
    2.0, 3.0, 4, 'Silvassa, the capital of Dadra and Nagar Haveli, is an eco-tourism hub surrounded by lush Western Ghat foothills, forested water reservoirs, Warli indigenous tribal culture, and serene landscaped gardens.', 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
    'Warli, Gujarati, Hindi, Marathi, English', 'Ubadiyu (steamed spiced earthen pot veggies), bamboo shoot stew, sweet dalia, Mahua-infused rural delicacies', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-119', 'Kurukshetra', 'IN-HR', 'kurukshetra', 'Kurukshetra', 'North India',
    29.9695, 76.8783, 260, 8.4, 'Easy',
    ARRAY['Spiritual', 'Heritage', 'Epic_history', 'Pilgrimage']::TEXT[], ARRAY['Brahma Sarovar', 'Jyotisar Geeta Birthplace', 'Sri Krishna Museum', 'Sheikh Chilli''s Tomb', 'Sannihit Sarovar', 'Panorama and Science Centre']::TEXT[], ARRAY['Sacred lake circumambulation', 'Light and Sound show at Jyotisar', 'Museum exploration', 'Ancient stepwell visits']::TEXT[],
    'Standing beneath the ancient banyan tree at Jyotisar where Lord Krishna is believed to have delivered the Bhagavad Gita message, and watching evening aarti across Brahma Sarovar.', 'Harsh Ka Tila archaeological mound revealing continuous cultural strata from Harappan to Mughal eras.', 'October, November, December, January, February, March', 'May, June', 'October to March (International Gita Mahotsav in Dec)', 'May to July',
    1.5, 2.5, 4, 'Kurukshetra is the legendary cradle of the Mahabharata and the birthplace of the Bhagavad Gita, hosting colossal holy sarovars, Mughal architectural gems like Sheikh Chilli''s tomb, and rich archaeological museums.', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    'Hindi, Haryanvi, Punjabi, English', 'Haryanvi Bajra Khichdi with Desi Ghee, Kadhi Pakora, Kachri ki Chutney, Churma, sweet Lassi', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-120', 'Pinjore & Yadavindra Gardens', 'IN-HR', 'pinjore', 'Panchkula', 'North India',
    30.7967, 76.9157, 580, 7.8, 'Easy',
    ARRAY['Heritage', 'Gardens', 'Nature', 'Family']::TEXT[], ARRAY['Yadavindra Gardens (Pinjore Mughal Gardens)', 'Bhima Devi Temple Complex (Khajuraho of North India)', 'Pinjore Heritage Valley', 'Kaushalya River Valley']::TEXT[], ARRAY['Terraced Mughal garden walks', 'Archaeological temple exploration', 'Heritage photography', 'Evening illuminated fountain walks']::TEXT[],
    'Walking down the seven cascading terraces of Yadavindra Gardens designed by Fidai Khan in the 17th century, featuring canal waterways, pavilions, and ancient mango orchards.', 'The 8th–12th century ruined sandstone sculptures and Shiva shrine at the Bhima Devi temple complex.', 'September, October, November, December, January, February, March, April', 'June, July', 'October to March (Pinjore Mango Festival in July)', 'May to June',
    1.0, 1.5, 3, 'Nestled in the Shivalik foothills near Panchkula, Pinjore is celebrated for its historic 17th-century Mughal terraced water gardens, the ancient sculpted Bhima Devi temple ruins, and verdant orchard valleys.', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
    'Hindi, Punjabi, Haryanvi, English', 'Pinjore fresh seasonal mango desserts, Makki di Roti & Sarson da Saag, Paneer Tikka, Kulfi Falooda', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-121', 'Morni Hills & Tikkar Taal', 'IN-HR', 'morni-hills', 'Panchkula', 'North India',
    30.6924, 77.0867, 1220, 7.7, 'Easy',
    ARRAY['Hill_station', 'Nature', 'Trekking', 'Lakes']::TEXT[], ARRAY['Tikkar Taal (Bada & Chhota Taal)', 'Morni Fort', 'Adventure Park Morni', 'Karoh Peak (Highest point in Haryana)', 'Morni Herbal Forest']::TEXT[], ARRAY['Lake boating', 'Pine forest trekking', 'Camping', 'Bird watching', 'Ziplining and rope courses']::TEXT[],
    'Kayaking on the serene waters of Tikkar Taal twin lakes surrounded by dense pine forests and trekking up to Karoh Peak overlooking the Shivalik ridge.', 'Secluded herbal nature trails leading to ancient 12th-century Shiva temple ruins near Tikkar Taal.', 'September, October, November, December, January, February, March, April', 'June, July', 'October to March', 'May to June',
    1.5, 2.0, 3, 'The only hill station in Haryana, Morni Hills is an offbeat Shivalik getaway featuring serene twin lakes at Tikkar Taal, pine-scented mountain breezes, scenic ridge treks, and rich birdlife.', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    'Hindi, Haryanvi, Punjabi, English', 'Local hill mushroom curry, Ghee-roasted Makki Roti, Haryanvi Kadhi, fresh hillside herbal tea', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-122', 'Sultanpur National Park', 'IN-HR', 'sultanpur-gurugram', 'Gurugram', 'North India',
    28.4614, 76.8924, 220, 8.0, 'Easy',
    ARRAY['Wildlife', 'Birding', 'Wetland', 'Eco_tourism']::TEXT[], ARRAY['Sultanpur Bird Sanctuary Core Wetland', 'Observation Machans (Watch Towers)', 'Sultanpur Lake Walking Trail', 'Interpretation Centre & Library']::TEXT[], ARRAY['Migratory bird watching', 'Wildlife photography', 'Wetland nature walks', 'Eco-education']::TEXT[],
    'Spotting Siberian cranes, greater flamingos, and bar-headed geese from elevated watchtowers across the shimmering Ramsar wetland during peak winter migration.', 'Quiet sunrise viewpoints along the southern acacia bund where painted storks and black-necked storks nest.', 'October, November, December, January, February, March', 'April, May, June, July', 'December to February', 'May to August',
    1.0, 1.0, 2, 'A designated Ramsar Wetland and premier national park in Haryana, Sultanpur is a haven for ornithologists and nature lovers, hosting over 250 species of resident and migratory winter birds.', 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=1200&q=80',
    'Hindi, English, Haryanvi', 'Haryanvi Bathua Raita, Missi Roti with White Butter, Rabri Kheer, Dal Tadka', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-123', 'Loktak Lake & Keibul Lamjao', 'IN-MN', 'moirang', 'Bishnupur', 'North East India',
    24.55, 93.8, 768, 8.8, 'Moderate',
    ARRAY['Nature', 'Wildlife', 'Eco_tourism', 'Photography']::TEXT[], ARRAY['Keibul Lamjao National Park (Floating Phumdis)', 'Sendra Island Resort & Viewpoint', 'Sangai Deer Observation Point', 'Loktak Fishermen Floating Huts', 'Thanga Island']::TEXT[], ARRAY['Traditional canoe rides on Phumdis', 'Sangai deer spotting', 'Island homestays', 'Sunrise photography over floating islands']::TEXT[],
    'Gliding across the world''s only floating national park on traditional wooden canoes to sight the critically endangered dancing deer of Manipur (Sangai) on floating biomass phumdis.', 'Staying overnight in eco-homestays atop the floating phumdi islands run by local Meitei fishing families.', 'October, November, December, January, February, March, April', 'June, July, August', 'November to March', 'June to August',
    2.0, 3.0, 4, 'Loktak Lake is the largest freshwater lake in Northeast India, world-famous for its circular floating vegetative islands called ''Phumdis'' and Keibul Lamjao, the world''s only floating national park sheltering the rare Sangai deer.', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    'Meiteilon (Manipuri), English, Hindi', 'Kangshoi (vegetable herb stew), Singju (spicy raw veggie salad with fermented fish), Nga Thongba (Meitei fish curry), Chak-hao kheer (black rice pudding)', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-124', 'Imphal & Kangla Fort', 'IN-MN', 'imphal', 'Imphal West', 'North East India',
    24.817, 93.9368, 786, 8.3, 'Easy',
    ARRAY['Heritage', 'Culture', 'History', 'Handicrafts']::TEXT[], ARRAY['Kangla Fort & Citadel', 'Ima Keithel (Mother''s Market)', 'Manipur State Museum', 'Shaheed Minar & Bir Tikendrajit Park', 'Govindaji Temple', 'RKCS Art Gallery']::TEXT[], ARRAY['Historic fort walks', 'Shopping at the 500-year-old all-women market', 'Manipuri classical dance performances', 'Polo heritage tours']::TEXT[],
    'Exploring Ima Keithel—a 500-year-old market run entirely by over 4,000 women traders—and visiting Kangla Fort, the ancient royal seat of the Manipur Kingdom with dragon-lion Kanglasa sculptures.', 'The world''s oldest living Polo ground (Mapal Kangjeibung) where modern polo was codified from the traditional Manipuri Sagol Kangjei.', 'October, November, December, January, February, March, April', 'June, July', 'November (Sangai Festival) to March', 'June to August',
    2.0, 3.0, 5, 'Imphal, the capital of Manipur, is a vibrant historical city cradled in a lush valley, famous for the royal Kangla Fort, the world-renowned Ima Keithel women''s market, and its proud legacy as the birthplace of modern Polo.', 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80',
    'Meiteilon (Manipuri), English, Hindi', 'Eromba (mashed vegetables with smoked fish & king chilli), Chamthong stew, Sana Thongba (cottage cheese curry), Bora fritters', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-125', 'Moirang & INA War Memorial', 'IN-MN', 'moirang', 'Bishnupur', 'North East India',
    24.5028, 93.7719, 770, 7.9, 'Easy',
    ARRAY['History', 'Freedom_heritage', 'Culture', 'Spiritual']::TEXT[], ARRAY['INA Memorial Complex & Netaji Subhas Chandra Bose Museum', 'Moirang Kangla', 'Ancient Lord Eputhou Thangjing Temple', 'Loktak Lake Southern Shore']::TEXT[], ARRAY['World War II history tours', 'Netaji memorial tributes', 'Cultural festival witnessing', 'Temple heritage visits']::TEXT[],
    'Visiting the sacred spot where Colonel Shaukat Malik of the Indian National Army (INA) hoisted the Indian tricolour on Indian mainland soil for the first time on April 14, 1944.', 'The ancient rituals and Moirang Sai musical performances during the annual spring festival at the Thangjing Temple.', 'October, November, December, January, February, March, April', 'June, July', 'October to March', 'June to August',
    1.0, 1.5, 2, 'Moirang is a town of immense historical and cultural reverence in Manipur, famous as the site where the Indian National Army under Netaji Subhas Chandra Bose first hoisted the Indian flag in 1944, and home to the legendary Khamba-Thoibi folklore.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'Meiteilon (Manipuri), English, Hindi', 'Traditional Moirang fish curry, Morok Metpa (chilli chutney), Ooti (peas and bamboo soda dish), Hei-khagok salad', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-126', 'Ukhrul & Shirui Kashong', 'IN-MN', 'ukhrul', 'Ukhrul', 'North East India',
    25.1167, 94.3667, 2020, 8.0, 'Moderate',
    ARRAY['Hill_station', 'Trekking', 'Tribal_culture', 'Nature']::TEXT[], ARRAY['Shirui Kashong Peak (Shirui Lily Habitat)', 'Khangkhui Mangsor Cave (Prehistoric limestone cave)', 'Nillai Tea Estate', 'Longpi Black Pottery Village', 'Phungcham Village']::TEXT[], ARRAY['Shirui peak trekking', 'Cave exploration', 'Longpi black stoneware pottery workshop', 'Tangkhul Naga cultural interaction']::TEXT[],
    'Trekking to the mist-clad summit of Shirui Kashong to see the rare pink-white Shirui Lily (*Lilium mackliniae*), which grows nowhere else on earth, and crafting stone pottery at Longpi.', 'The prehistoric Khangkhui limestone caves where Stone Age Paleolithic artifacts were discovered.', 'October, November, December, January, February, March, April, May (Shirui Lily blooms May–June)', 'July, August', 'May to June (Lily season) and October to February', 'July to August',
    2.5, 3.5, 5, 'Ukhrul is a scenic hill town in eastern Manipur and the homeland of the Tangkhul Naga tribe, celebrated for the rare endemic Shirui Lily blooming on Shirui Peak, ancient limestone caves, and unique Longpi black earthenware.', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    'Tangkhul, Meiteilon, English, Hindi', 'Tangkhul smoked pork with bamboo shoots, seasoned perilla seeds chutney, boiled wild mountain greens, black rice cakes', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-127', 'Aizawl & Durtlang Hills', 'IN-MZ', 'aizawl', 'Aizawl', 'North East India',
    23.7271, 92.7176, 1132, 8.3, 'Easy',
    ARRAY['Hill_station', 'Culture', 'City_break', 'Churches']::TEXT[], ARRAY['Solomon''s Temple', 'Durtlang Hills Viewpoint', 'Mizoram State Museum (Babu Tlang)', 'Bara Bazar', 'KV Paradise (Taj Mahal of Mizoram)', 'Falkawn Model Village']::TEXT[], ARRAY['Panoramic ridge photography', 'Mizo textile shopping (Puan)', 'Church and heritage tours', 'Local market walks']::TEXT[],
    'Watching the illuminated mountain ridge of Aizawl from Durtlang Hills at twilight and marveling at the marble architecture of Solomon''s Temple surrounded by pine trees.', 'The bustling traditional weaving and cane stalls tucked inside the steep multistory alleys of Bara Bazar.', 'October, November, December, January, February, March, April', 'June, July, August', 'November (Chapchar Kut build-up) to March', 'June to August',
    2.0, 3.0, 5, 'Perched like a fortress along a high mountain ridge, Aizawl is the 130-year-old capital of Mizoram, featuring sweeping panoramic views, pristine church architecture, and the rich cultural legacy of the Mizo people.', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    'Mizo, English, Hindi', 'Bai (steamed vegetables with fermented pork/soybean & local herbs), Sawhchiar (Mizo meat & rice porridge), Chhangban (sticky rice bread), Sanpiau', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-128', 'Reiek Heritage Village', 'IN-MZ', 'reiek', 'Mamit', 'North East India',
    23.6872, 92.6075, 1548, 8.0, 'Easy',
    ARRAY['Trekking', 'Tribal_culture', 'Nature', 'Eco_tourism']::TEXT[], ARRAY['Reiek Tlang Mountain Peak', 'Reiek Model Heritage Village', 'Reiek Cliff Edge & Canyon Viewpoint', 'Lush Subtropical Forest Trail']::TEXT[], ARRAY['Summit ridge trekking', 'Traditional Mizo bamboo hut tours', 'Anthurium Festival attendance', 'Birdwatching']::TEXT[],
    'Trekking through dense oak and rhododendron forests to the dramatic knife-edge precipice of Reiek Peak offering 360-degree views stretching across Mizoram to the plains of Bangladesh.', 'The preserved Mizo chieftain''s house and youth dormitory (Zawlbuk) showcasing authentic pre-Christian tribal architecture.', 'September, October, November, December, January, February, March, April', 'June, July', 'October to March (Anthurium Festival in Sept/Oct)', 'June to August',
    1.5, 2.0, 3, 'Located just 29 km from Aizawl, Reiek is a pristine mountain village nestled beneath the towering Reiek Peak, renowned for its living model heritage village reflecting traditional Mizo customs and breathtaking cliff walks.', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    'Mizo, English, Hindi', 'Smoked beef and pork with local bamboo shoot, Vawksa Rep, boiled pumpkin vine stew, fresh Mizo passion fruit juice', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-129', 'Vantawng Falls & Thenzawl', 'IN-MZ', 'thenzawl', 'Serchhip', 'North East India',
    23.2842, 92.7567, 780, 8.1, 'Moderate',
    ARRAY['Nature', 'Waterfalls', 'Handloom', 'Scenic']::TEXT[], ARRAY['Vantawng Khawhthla (Highest waterfall in Mizoram - 750 ft)', 'Tuirihiau Falls (Walk-behind waterfall)', 'Thenzawl Handloom Weaving Village', 'Thenzawl Golf Course & Resort', 'Deer Park Thenzawl']::TEXT[], ARRAY['Waterfall viewing from forest pavilions', 'Walking behind the curtain of Tuirihiau Falls', 'Traditional Puan weaving workshops', 'Golfing on mountain turf']::TEXT[],
    'Walking behind the spectacular natural water curtain of Tuirihiau Falls and witnessing skilled local artisans weave colorful traditional Puan shawls on backstrap looms in Thenzawl.', 'The secluded Chawngchilhi Cave nestled in dense forests near Thenzawl wrapped in Mizo folklore.', 'September, October, November, December, January, February, March', 'June, July', 'October to February', 'June to August',
    1.5, 2.5, 3, 'Thenzawl is a tranquil plateau town famous as the handloom capital of Mizoram, flanked by the dramatic 750-foot two-tiered Vantawng Falls cascading amidst dense bamboo jungle and the walk-behind Tuirihiau Falls.', 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
    'Mizo, English, Hindi', 'Mizo traditional thali with fresh river fish, Bekang (fermented soybean chutney), Hmarcha Rawt, Bamboo shoot pickle', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-130', 'Champhai & Eastern Ridge', 'IN-MZ', 'champhai', 'Champhai', 'North East India',
    23.4561, 93.3283, 1678, 7.9, 'Moderate',
    ARRAY['Nature', 'Scenic_valleys', 'Culture', 'Border_tourism']::TEXT[], ARRAY['Champhai Rice Valley & Vineyards', 'Lianchhiari Lunglen Tlang', 'Mura Puk Ancient Caves', 'Rih Dil Lake Viewpoint / Corridor', 'Fiara Tui spring']::TEXT[], ARRAY['Valley panoramic photography', 'Vineyard visits and local grape processing', 'Archaeological cave exploration', 'Border trade market visits at Zokhawthar']::TEXT[],
    'Gazing across the expansive flat green rice plains of Champhai framed by blue Myanmar mountains, and exploring the mysterious megalithic stone monuments of Mura Puk.', 'The poignant romantic lookout point of Lianchhiari Lunglen Tlang perched high over a vertical rock wall.', 'October, November, December, January, February, March, April', 'June, July, August', 'November to March', 'June to August',
    2.0, 3.0, 4, 'Known as the ''Rice Bowl of Mizoram'', Champhai is an idyllic border town set against rolling emerald valleys and vineyard slopes, rich in Mizo folklore, ancient monoliths, and mountain panoramas.', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    'Mizo, English, Hindi', 'Champhai mountain sticky rice, smoked pork with mustard greens, fermented fish chutney, local Champhai red grape beverage', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-131', 'Kohima', 'IN-NL', 'kohima', 'Kohima', 'North East India',
    25.6751, 94.1086, 1444, 8.5, 'Easy',
    ARRAY['History', 'Culture', 'Hill_station', 'War_heritage']::TEXT[], ARRAY['Kohima War Cemetery (Commonwealth Battle of Kohima site)', 'Mary Help of Christians Cathedral', 'Nagaland State Museum', 'Kohima Village (Bara Basti)', 'Japfü Peak Viewpoint']::TEXT[], ARRAY['WWII history battlefield tours', 'Angami tribal village walks', 'Cathedral architecture viewing', 'State museum ethnographic tours']::TEXT[],
    'Reading the poignant Kohima Epitaph (''When you go home, tell them of us and say, For your tomorrow, we gave our today'') at the manicured Garrison Hill battlefield cemetery overlooking Kohima town.', 'The ancient clan gates and ceremonial headstone carvings inside Bara Basti, one of Asia''s oldest and largest traditional tribal villages.', 'October, November, December, January, February, March, April, May', 'June, July, August', 'November to January (Hornbill Festival in Dec)', 'June to August',
    2.0, 3.0, 5, 'Kohima, the hillside capital of Nagaland, is steeped in heroic World War II history from the pivotal 1944 Battle of Kohima, rich Angami Naga cultural traditions, impressive wooden cathedral architecture, and misty mountain vistas.', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    'Nagamese, Angami, English, Hindi', 'Smoked pork with Axone (fermented soybean), Bamboo shoot curry with Raja Mircha (Bhut Jolokia), Galho (Naga khichdi with herbs), Zutho (rice beverage)', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-132', 'Kisama Heritage Village', 'IN-NL', 'kisama', 'Kohima', 'North East India',
    25.5997, 94.1167, 1520, 8.7, 'Easy',
    ARRAY['Culture', 'Heritage', 'Festivals', 'Architecture']::TEXT[], ARRAY['Hornbill Festival Arena & Grand Amphitheatre', '16 Traditional Naga Tribe Morungs', 'World War II Museum Kisama', 'Bamboo & Woodcraft Exhibition Hall', 'Traditional Naga Kitchen Pavilions']::TEXT[], ARRAY['Exploring authentic tribal Morung architecture', 'Attending the annual Hornbill Festival (Dec 1–10)', 'Tasting tribal dishes from all 16 Naga tribes', 'Traditional Naga music and dance shows']::TEXT[],
    'Walking through the life-sized traditional Morungs (youth dormitories) representing each of Nagaland''s 16 major tribes, adorned with intricately carved hornbill totems, bison horns, and warrior shields.', 'The World War II archive gallery inside Kisama displaying military relics, battlefield maps, and oral histories from the 1944 Kohima offensive.', 'October, November, December, January, February, March, April', 'June, July', 'December 1–10 (Hornbill Festival)', 'June to August',
    1.5, 2.5, 4, 'Kisama Heritage Village is a dedicated cultural complex situated 12 km from Kohima in the foothills of Mount Japfü, built to preserve and showcase the authentic architecture, morungs, customs, and heritage of all 16 Naga tribes, serving as the permanent venue for the world-renowned Hornbill Festival.', 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80',
    'Nagamese, English, Angami, Hindi', 'Naga roasted pork with Anishi (fermented taro leaves), boiled wild vegetables with Naga King Chilli, Black sticky rice sweet cakes', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-133', 'Dzükou Valley', 'IN-NL', 'viswema', 'Kohima', 'North East India',
    25.55, 94.07, 2452, 8.9, 'Challenging',
    ARRAY['Trekking', 'Nature', 'High_altitude_valley', 'Adventure']::TEXT[], ARRAY['Dzükou Valley Rolling Hills & Meadows', 'Dzükou Lily Blooms Sanctuary', 'Natural Cave Shelters & Rock Camps', 'Crystal Clear Valley Meandering Streams', 'Viswema & Jakhama Trekking Trails']::TEXT[], ARRAY['High-altitude meadow trekking', 'Wilderness cave camping', 'Alpine flower photography', 'Stargazing under unpolluted dark skies']::TEXT[],
    'Trekking over the steep Shikhara ridge into the surreal, rolling bamboo-carpeted amphitheatre of Dzükou Valley, where thousands of endemic Dzükou Lilies bloom beside ice-cold meandering streams.', 'The hidden natural rock caves at the base of the valley where trekkers gather around wood fires for overnight shelter.', 'June, July, August, September (flower blooms), October, November, December (clear skies & frost)', 'Heavy monsoon downpours in late July can make trails slippery', 'June–July (Lily season) and October–December (Trekking season)', 'February to April (dry grassland season)',
    2.5, 3.5, 5, 'Straddling the border between Nagaland and Manipur at an elevation of 2,452 meters, Dzükou Valley is one of India''s most breathtaking high-altitude valley landscapes, renowned for its rolling emerald cushions of dwarf bamboo, natural caves, and the rare seasonal endemic Dzükou Lily.', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    'Angami, Nagamese, English, Hindi', 'Warm trekker noodle broth with local Naga herbs, campfire boiled potatoes with roasted chilli dip, hot black tea with mountain honey', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-134', 'Khonoma', 'IN-NL', 'khonoma', 'Kohima', 'North East India',
    25.6483, 94.0192, 1500, 8.4, 'Easy',
    ARRAY['Eco_tourism', 'Culture', 'Heritage', 'Village_life']::TEXT[], ARRAY['Khonoma Nature Conservation & Tragopan Sanctuary (KNCTS)', 'Terraced Alder-Agriculture Fields', 'Semoma Fort (Site of British resistance)', 'Traditional Angami Morungs & Carved Stone Monoliths', 'Village Craft Workshops (Cane & Bamboo)']::TEXT[], ARRAY['Eco-guided sanctuary nature walks', 'Tragopan and bird watching', 'Traditional homestay living', 'Alder-based organic farming study']::TEXT[],
    'Learning about indigenous community-led conservation in Asia''s first official Green Village, where hunting was banned in 1998 to protect the endangered Blyth''s Tragopan, and walking through stone-fortified hill bastions.', 'The 600-year-old sustainable Alder tree agroforestry systems that allow multi-generational organic farming without soil erosion.', 'September, October, November, December, January, February, March, April', 'June, July', 'October to March', 'June to August',
    1.5, 2.0, 3, 'Khonoma is an iconic 700-year-old Angami Naga village renowned as India''s First Green Village. Nestled amidst dramatic stepped rice terraces, it is celebrated for community-led biodiversity conservation, the Blyth''s Tragopan sanctuary, and historic resistance against British colonial forces.', 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
    'Angami, Nagamese, English, Hindi', 'Khonoma organic hill rice with stewed wild herbs, smoked beef with dried bamboo shoot, steamed colocasia leaves, fresh mountain spring tea', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-135', 'Mokokchung', 'IN-NL', 'mokokchung', 'Mokokchung', 'North East India',
    26.3256, 94.5203, 1325, 8.0, 'Moderate',
    ARRAY['Culture', 'Heritage', 'Scenic_hills', 'Tribal_lore']::TEXT[], ARRAY['Ungma Village (Oldest & largest Ao Naga village)', 'Longkhum Village (Scenic eagle ridge & rhododendrons)', 'Mokokchung Town Park', 'Chuchuyimlang Cultural Village', 'Langpangkong Caves']::TEXT[], ARRAY['Ao Naga clan history exploration', 'Longkhum ridge cliff walks', 'Traditional handicraft shopping', 'Village elder storytelling sessions']::TEXT[],
    'Visiting the ancient village of Ungma to see the sacred baptismal pool and the ceremonial log drums (Tsungremong), and gazing from Longkhum ridge where Ao legends say departed souls rest on their journey.', 'The ancient footpath footprint impressions of legendary Ao lovers (Jina and Etiben) etched into the stone at Longkhum.', 'October, November, December, January, February, March, April', 'June, July, August', 'October to March (Moatsu Festival in May, Tsungremong in Aug)', 'June to August',
    2.0, 3.0, 4, 'Mokokchung is the cultural and intellectual heartland of the Ao Naga tribe, perched across scenic mountain spurs, famous for its historic heritage villages like Ungma and Longkhum, ancient megaliths, and vibrant festivals.', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    'Ao, Nagamese, English, Hindi', 'Ao smoked pork with bamboo shoots and yam, Anishi (fermented yam leaves patty) curry, dried fish chutney with fresh green chillies', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;

-- 4. POINTS OF INTEREST (POIs)
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-diu-fort', 'Diu Fort', 'dest-116', 'diu', 'Fort', 20.7144, 70.9874, '16th-century Portuguese fortress surrounded by the sea on three sides with old bronze cannons and panoramic ocean ramparts.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-diu-nagoa', 'Nagoa Beach', 'dest-116', 'diu', 'Beach', 20.7042, 70.9168, 'Famous horseshoe-shaped white sand beach lined with rare African Hoka branching palm trees.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-diu-naida', 'Naida Caves', 'dest-116', 'diu', 'Caves', 20.7108, 70.9789, 'Labyrinthine network of geological hollows and tunnels carved through historic stone quarrying with natural roof light beams.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-diu-st-paul', 'St. Paul''s Church', 'dest-116', 'diu', 'Church', 20.7136, 70.9847, 'Magnificent Baroque-style Catholic church built in 1601 dedicated to Our Lady of Immaculate Conception with intricate wood carvings.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-diu-gangeshwar', 'Gangeshwar Mahadev Temple', 'dest-116', 'diu', 'Temple', 20.7078, 70.9422, 'Unique seaside rock cave shrine where five Shiva Lingas are submerged and washed naturally by incoming tidal waves.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-daman-moti-fort', 'Moti Daman Fort', 'dest-117', 'daman', 'Fort', 20.3956, 72.8315, 'Sprawling 16th-century Portuguese fortress with massive ramparts, ten bastions, and colonial government buildings.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-daman-nani-fort', 'Nani Daman Fort (St. Jerome Fort)', 'dest-117', 'daman', 'Fort', 20.4042, 72.8336, 'Historic fort across the river featuring a stone statue of St. Jerome and an open church chapel facing the harbour.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-daman-jampore', 'Jampore Beach', 'dest-117', 'daman', 'Beach', 20.3705, 72.8273, 'Expansive, tranquil beach with dark packed sand ideal for long seaside walks, watersports, and swimming in gentle tides.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-daman-devka', 'Devka Beach', 'dest-117', 'daman', 'Beach', 20.4371, 72.8379, 'Popular coastal promenade featuring an amusement park, musical fountains, and sunset viewpoints over rocky shores.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-silvassa-tribal-mus', 'Tribal Cultural Museum', 'dest-118', 'silvassa', 'Museum', 20.2741, 73.0094, 'Preserves the authentic cultural heritage of indigenous Warli, Dhodia, and Kokna tribes with traditional costumes and dioramas.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-silvassa-dudhani', 'Dudhani Lake & Water Sports', 'dest-118', 'silvassa', 'Lake', 20.155, 73.098, 'Vast water reservoir on the Madhuban Dam surrounded by forested hillocks, offering speedboating, jet skis, and shikara rides.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-silvassa-vanganga', 'Vanganga Lake Garden', 'dest-118', 'silvassa', 'Garden', 20.2917, 72.9912, 'Japanese-style landscaped garden island connected by wooden bridges with paddle boats, walking trails, and musical fountains.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-silvassa-lion-safari', 'Lion Safari Wildlife Park', 'dest-118', 'silvassa', 'Wildlife', 20.2312, 73.0245, 'Sprawling 25-hectare protected forest enclosure dedicated to the conservation of Asiatic lions in semi-natural habitats.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kru-brahma-sarovar', 'Brahma Sarovar', 'dest-119', 'kurukshetra', 'Sacred Water Tank', 29.962, 76.837, 'Colossal sacred water tank measuring 1,800 meters long, ancient epicenter of solar eclipse bathing and evening Gita aarti.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kru-jyotisar', 'Jyotisar Geeta Birthplace', 'dest-119', 'kurukshetra', 'Monument', 29.9575, 76.764, 'Venerated holy site with an ancient banyan tree where Lord Krishna revealed the celestial knowledge of the Bhagavad Gita to Arjuna.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kru-krishna-mus', 'Sri Krishna Museum', 'dest-119', 'kurukshetra', 'Museum', 29.9658, 76.8406, 'National museum depicting the life, ideals, and cultural representations of Lord Krishna through sculptures, manuscripts, and art.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kru-sheikh-chilli', 'Sheikh Chilli''s Tomb', 'dest-119', 'kurukshetra', 'Mughal Heritage', 29.9792, 76.8294, 'Exquisite 17th-century Mughal mausoleum of Sufi saint Abd-ur-Rahim featuring floral Persian designs and marble domes.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-pinjore-gardens', 'Yadavindra Gardens (Pinjore Gardens)', 'dest-120', 'pinjore', 'Mughal Garden', 30.7967, 76.9157, '17th-century Mughal garden laid out on seven descending terraces with water canals, fountains, and royal pavilions (Shish Mahal).', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-pinjore-bhima-devi', 'Bhima Devi Temple Complex', 'dest-120', 'pinjore', 'Ancient Temple Ruins', 30.7983, 76.9189, '8th to 12th-century Gurjara-Pratihara style stone temple ruins known colloquially as the Khajuraho of Northern India.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-morni-tikkar-taal', 'Tikkar Taal', 'dest-121', 'morni-hills', 'Lakes', 30.6865, 77.062, 'Scenic interconnected natural lakes (Bada Taal and Chhota Taal) situated in a lush depression surrounded by pine-covered hills.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-morni-fort', 'Morni Fort', 'dest-121', 'morni-hills', 'Fort', 30.6924, 77.0867, '17th-century hill fortress built atop a prominent Shivalik ridge offering 360-degree vistas across forested valleys.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-morni-karoh-peak', 'Karoh Peak Trail', 'dest-121', 'morni-hills', 'Trekking', 30.742, 77.104, 'Highest mountain elevation in the state of Haryana (1,467 meters) marking the natural border with Himachal Pradesh.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-sultanpur-main-wetland', 'Sultanpur Core Wetland & Lake', 'dest-122', 'sultanpur-gurugram', 'Wetland', 28.4614, 76.8924, 'Ramsar wetland providing rich aquatic feeding grounds for over 250 species of resident and winter migratory waterbirds.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-sultanpur-machan', 'Sultanpur Bird Machans & Hideouts', 'dest-122', 'sultanpur-gurugram', 'Observation Tower', 28.4635, 76.8945, 'Four strategic elevated wooden watchtowers providing panoramic birdwatching vistas without disturbing wildlife.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-loktak-keibul-lamjao', 'Keibul Lamjao National Park', 'dest-123', 'moirang', 'Floating National Park', 24.4983, 93.8567, 'The world''s only floating national park composed of continuous floating biomass phumdis, sheltering the endangered Sangai deer.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-loktak-sendra-island', 'Sendra Island & Tourist Deck', 'dest-123', 'moirang', 'Island Viewpoint', 24.5122, 93.7997, 'Elevated circular island hillock in the middle of Loktak Lake offering breathtaking aerial views of the floating circular phumdis.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-loktak-thanga-island', 'Thanga Island & Fishermen Village', 'dest-123', 'moirang', 'Island Village', 24.531, 93.824, 'Traditional island community with authentic Meitei homestays and boat jetties for traditional canoe expeditions on the lake.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-imphal-kangla-fort', 'Kangla Fort & Citadel', 'dest-124', 'imphal', 'Historic Citadel', 24.808, 93.943, 'Ancient royal seat of the Manipur Kingdom situated on the banks of the Imphal River, featuring sacred temples and coronation halls.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-imphal-ima-keithel', 'Ima Keithel (Mother''s Market)', 'dest-124', 'imphal', 'Heritage Market', 24.7981, 93.9344, 'Historic 500-year-old market complex managed and operated exclusively by thousands of married Meitei women traders.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-imphal-museum', 'Manipur State Museum', 'dest-124', 'imphal', 'Museum', 24.8012, 93.9392, 'Galleries displaying royal Meitei regalia, tribal costumes, ancient weapons, and an enormous 78-foot royal dragon boat (Hiyang Hiren).', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-imphal-govindaji', 'Shree Govindaji Temple', 'dest-124', 'imphal', 'Temple', 24.7995, 93.955, 'Golden twin-domed Vaishnavite temple built in 1846, the spiritual epicenter of devotional Raas Leela dance in Manipur.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-moirang-ina-memorial', 'INA Memorial Complex & Netaji Museum', 'dest-125', 'moirang', 'War Memorial', 24.5028, 93.7719, 'Historic site where the Indian National Army hoisted the Indian national flag on mainland soil on 14 April 1944.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-moirang-thangjing', 'Eputhou Thangjing Temple', 'dest-125', 'moirang', 'Ancient Shrine', 24.498, 93.7665, 'Centuries-old pre-Hindu Meitei shrine dedicated to deity Thangjing, the setting for the immortal romantic epic of Khamba and Thoibi.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-ukhrul-shirui-peak', 'Shirui Kashong Peak', 'dest-126', 'ukhrul', 'Mountain Peak', 25.1167, 94.4333, 'Mist-shrouded peak (2,835 m) and the sole natural biosphere on Earth where the rare pinkish-white Shirui Lily blooms in May–June.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-ukhrul-khangkhui-cave', 'Khangkhui Mangsor Cave', 'dest-126', 'ukhrul', 'Prehistoric Cave', 25.0667, 94.4833, 'Natural limestone cave system where Stone Age human habitations and Paleolithic tools were discovered by archaeologists.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-ukhrul-longpi-pottery', 'Longpi Black Pottery Village', 'dest-126', 'ukhrul', 'Craft Village', 25.21, 94.41, 'Tangkhul Naga village where unique black stoneware cooking pots are hand-sculpted from weathered serpentinite rock without a potter''s wheel.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-aizawl-solomon-temple', 'Solomon''s Temple', 'dest-127', 'aizawl', 'Church', 23.7667, 92.7167, 'Monumental white marble church with four spires and high natural cedar forest courtyards, built by the Kohhran Thianghlim.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-aizawl-durtlang', 'Durtlang Hills Viewpoint', 'dest-127', 'aizawl', 'Viewpoint', 23.7719, 92.7308, 'Highest northern ridge overlooking the sprawling, terraced multi-tiered city of Aizawl and deep valleys below.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-aizawl-museum', 'Mizoram State Museum', 'dest-127', 'aizawl', 'Museum', 23.7271, 92.7176, 'Ethnographic museum displaying traditional Mizo weapons, brass gongs, textiles, and artifacts from ancient tribal clans.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-reiek-heritage-village', 'Reiek Model Heritage Village', 'dest-128', 'reiek', 'Heritage Village', 23.6872, 92.6075, 'Reconstructed traditional Mizo tribal village showcasing authentic wooden chieftain houses (Lal In) and warrior dormitories (Zawlbuk).', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-reiek-tlang-peak', 'Reiek Tlang Summit', 'dest-128', 'reiek', 'Mountain Peak', 23.6931, 92.611, 'Striking rock promontory (1,548 m) rising over a vertical cliff with panoramic vistas over Bangladesh plains on clear days.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-thenzawl-vantawng', 'Vantawng Khawhthla Waterfall', 'dest-129', 'thenzawl', 'Waterfall', 23.256, 92.754, 'Spectacular 750-foot two-tiered cascade, the highest and most famous waterfall in Mizoram surrounded by lush bamboo jungle.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-thenzawl-tuirihiau', 'Tuirihiau Falls', 'dest-129', 'thenzawl', 'Waterfall', 23.275, 92.768, 'Scenic curtain waterfall uniquely set inside a concave limestone grotto allowing visitors to walk directly behind the falling water.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-thenzawl-handloom', 'Thenzawl Handloom Weaving Center', 'dest-129', 'thenzawl', 'Crafts', 23.2842, 92.7567, 'Handloom capital of Mizoram where skilled local weavers produce exquisite traditional Puan chei skirts and woven textiles.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-champhai-valley', 'Champhai Valley Rice Plain', 'dest-130', 'champhai', 'Scenic Valley', 23.4561, 93.3283, 'Vast, flat emerald rice bowl plain extending for miles, framed by the blue mountain peaks of Myanmar.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-champhai-mura-puk', 'Mura Puk Ancient Caves', 'dest-130', 'champhai', 'Caves', 23.489, 93.352, 'Six historical rock-cut cave chambers in Zote village where ancient Mizo villagers hid from predatory eagle-like creatures according to legend.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kohima-war-cemetery', 'Kohima War Cemetery', 'dest-131', 'kohima', 'War Memorial', 25.6669, 94.1062, 'Commonwealth war memorial on Garrison Hill honoring Allied and Indian soldiers who fell during the decisive 1944 Battle of Kohima.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kohima-cathedral', 'Mary Help of Christians Cathedral', 'dest-131', 'kohima', 'Church', 25.6617, 94.1039, 'Prominent Catholic cathedral incorporating indigenous Naga house architecture, housing one of the largest carved wooden crucifixes in Asia.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kohima-bara-basti', 'Kohima Village (Bara Basti)', 'dest-131', 'kohima', 'Tribal Village', 25.683, 94.118, 'Ancient Angami clan village on a high hill, celebrated as one of the largest traditional tribal village settlements in Asia.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kisama-hornbill-arena', 'Hornbill Festival Amphitheatre', 'dest-132', 'kisama', 'Cultural Arena', 25.5997, 94.1167, 'Central tribal arena where the annual 10-day Hornbill Festival takes place every December with traditional dance, sports, and song.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kisama-morungs', '16 Naga Tribe Morungs', 'dest-132', 'kisama', 'Tribal Architecture', 25.6005, 94.1172, 'Sixteen authentic wooden and thatch clan houses representing the distinct architecture and totems of every major Naga tribe.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kisama-wwii-museum', 'World War II Museum Kisama', 'dest-132', 'kisama', 'Museum', 25.599, 94.116, 'Museum preserving military artifacts, artillery shells, helmets, and personal wartime memorabilia from the Battle of Kohima.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-dzukou-valley-meadows', 'Dzükou Rolling Meadows & Streams', 'dest-133', 'viswema', 'Alpine Valley', 25.55, 94.07, 'Breathtaking high-altitude valley covered in dwarf bamboo cushions, natural flowers, and meandering crystal streams at 2,450 m.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-dzukou-caves', 'Dzükou Natural Rock Caves', 'dest-133', 'viswema', 'Natural Shelter', 25.552, 94.068, 'Overhanging rock formations at the valley floor used for decades by local trekkers and explorers for campfire camping.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-khonoma-sanctuary', 'Khonoma Nature Conservation & Tragopan Sanctuary', 'dest-134', 'khonoma', 'Wildlife Sanctuary', 25.6483, 94.0192, 'India''s first community-conserved nature sanctuary established in 1998 to protect the vulnerable Blyth''s Tragopan and pristine montane forests.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-khonoma-semoma-fort', 'Semoma Fort', 'dest-134', 'khonoma', 'Historic Fort', 25.651, 94.022, 'Stone hill bastion where Angami warriors gallantly defended their village against British colonial military expeditions in 1879.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-khonoma-terraces', 'Khonoma Stepped Rice Terraces', 'dest-134', 'khonoma', 'Agro-Heritage', 25.645, 94.015, 'Ancient terraced slopes cultivated using traditional Alder-tree nitrogen-fixing sustainable agroforestry systems.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-mokokchung-ungma', 'Ungma Village', 'dest-135', 'mokokchung', 'Ancient Village', 26.302, 94.508, 'The oldest and largest Ao Naga village, according to legend the first settlement founded when the Ao ancestors arrived from Chungliyimti.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-mokokchung-longkhum', 'Longkhum Village & Eagle Ridge', 'dest-135', 'mokokchung', 'Scenic Ridge', 26.248, 94.456, 'Strategic mountain ridge perched at 1,846 meters filled with rhododendrons and folklore regarding the legendary footprints of Jina and Etiben.', TRUE) ON CONFLICT (id) DO NOTHING;

-- 5. FAMOUS LOCAL FOODS
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-diu-cozido', 'dest-116', 'Portuguese Cozido & Seafood Platter', 'Traditional slow-cooked vegetable and fresh Arabian Sea catch stew seasoned with mild Portuguese herbs and olive oil.', FALSE, 'Indo-Portuguese', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-diu-fish-curry', 'dest-116', 'Diu Fresh Catch Fish Curry', 'Spicy coconut and kokum infused curry made with freshly caught pomfret or kingfish, served with steamed rice.', FALSE, 'Coastal Seafood', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-daman-prawn-balchao', 'dest-117', 'Daman Prawn Balchão', 'Fiery and tangy pickled prawn delicacy cooked in vinegar, red chillies, and aromatic spices.', FALSE, 'Indo-Portuguese', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-daman-koliwada', 'dest-117', 'Daman Koliwada Fried Fish', 'Crispy spiced batter-fried fresh catch served with mint chutney at seaside shacks.', FALSE, 'Street Food / Coastal', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-silvassa-ubadiyu', 'dest-118', 'Warli Ubadiyu', 'Indigenous winter preparation of wild country beans, yams, and herbs slow-steamed inside an inverted earthen pot buried in smoking embers.', TRUE, 'Tribal / Indigenous', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-silvassa-bamboo-stew', 'dest-118', 'Forest Bamboo Shoot & Wild Greens Stew', 'Tender forest bamboo shoots simmered with locally gathered wild forest greens and gentle mountain spices.', TRUE, 'Tribal / Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-kru-bajra-khichdi', 'dest-119', 'Haryanvi Bajra Khichdi with Desi Ghee', 'Hearty winter porridge made from crushed pearl millet and yellow moong dal, served steaming hot with a generous dollop of pure A2 desi ghee.', TRUE, 'Traditional Haryanvi', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-kru-kachri-chutney', 'dest-119', 'Kachri ki Chutney with Missi Roti', 'Tangy and spicy stone-ground condiment made from wild melon (kachri) and garlic, paired with gram flour flatbread.', TRUE, 'Traditional Haryanvi', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-pinjore-sarson-saag', 'dest-120', 'Makki di Roti & Sarson da Saag', 'Traditional slow-simmered mustard greens enriched with white churned butter, served with crisp cornmeal flatbread.', TRUE, 'North Indian / Punjabi', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-pinjore-mango-kulfi', 'dest-120', 'Pinjore Orchard Mango Kulfi', 'Dense, creamy frozen dessert prepared with reduced milk and pulp from heritage Pinjore mango orchards.', TRUE, 'Dessert', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-morni-kadi', 'dest-121', 'Pahari Kadhi Pakora', 'Comforting spiced yogurt gravy tempered with mustard seeds and fenugreek, served over hot steamed rice in the mountain breeze.', TRUE, 'Hill Cuisine', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-morni-herbal-tea', 'dest-121', 'Shivalik Wild Herbal Brew', 'Infusion of wild lemongrass, tulsi, and ginger harvested from the Morni herbal forest.', TRUE, 'Beverage', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-sultanpur-bathua-raita', 'dest-122', 'Bathua Raita & Tandoori Roti', 'Cooling spiced yogurt prepared with blanched wild goosefoot greens (bathua) and roasted cumin.', TRUE, 'Haryanvi Countryside', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-loktak-kangshoi', 'dest-123', 'Meitei Kangshoi', 'Delicate, oil-free vegetable stew cooked with seasonal vegetables, ginger, fermented fish (Ngari), and wild aromatic herbs.', FALSE, 'Manipuri Indigenous', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-loktak-singju', 'dest-123', 'Fresh Loktak Singju', 'Zesty salad of lotus stems, finely shredded cabbage, wild herbs, and roasted perilla seeds seasoned with spicy king chilli.', TRUE, 'Manipuri Salad', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-imphal-chakhao-kheer', 'dest-124', 'Chak-hao Black Rice Kheer', 'Royal dessert prepared with aromatic indigenous GI-tagged Manipuri black rice, rich milk, cardamom, and toasted nuts.', TRUE, 'Manipuri Royal Dessert', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-imphal-eromba', 'dest-124', 'Manipuri Eromba', 'Savory dish of mashed boiled vegetables, local greens, and fermented fish garnished with fresh coriander and King Chilli (U-Morok).', FALSE, 'Traditional Meitei', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-moirang-fish-thongba', 'dest-125', 'Nga Thongba (Freshwater Fish Curry)', 'Fresh Loktak carp simmered in a golden turmeric and bay leaf broth with gentle Meitei whole spices.', FALSE, 'Meitei Seafood', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-ukhrul-smoked-pork', 'dest-126', 'Tangkhul Smoked Pork with Bamboo Shoot', 'Tender wood-smoked pork slow-braised with fermented bamboo shoots and crushed Sichuan mountain pepper.', FALSE, 'Naga Tribal', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-ukhrul-black-rice-cake', 'dest-126', 'Longpi Steamed Sticky Rice Cakes', 'Traditional wholesome sticky rice cakes wrapped in wild banana leaves and steamed in Longpi black clay pots.', TRUE, 'Tangkhul Naga Snack', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-aizawl-bai', 'dest-127', 'Authentic Mizo Bai', 'Piquant soup prepared by boiling mixed seasonal vegetables, bamboo shoots, and local greens with baking soda and fermented pork/soybeans.', FALSE, 'Mizo Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-aizawl-sawhchiar', 'dest-127', 'Sawhchiar (Mizo Meat & Rice Porridge)', 'Comforting one-pot dish of short-grain rice boiled with meat cuts and fragrant local mountain herbs.', FALSE, 'Mizo Feast Dish', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-reiek-vawksa-rep', 'dest-128', 'Vawksa Rep (Smoked Pork Stir Fry)', 'Crispy woodfire-smoked pork stir-fried with tender baby mustard greens and pungent local green chillies.', FALSE, 'Mizo Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-thenzawl-bekang', 'dest-129', 'Thenzawl Bekang Chutney & Rice', 'Traditional fermented soybean paste seasoned with fiery local bird''s eye chillies, served alongside hill red rice.', TRUE, 'Mizo Condiment', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-champhai-sticky-rice', 'dest-130', 'Champhai Valley Harvest Sticky Rice', 'Fragrant steamed indigenous sticky hill rice served with fresh mountain greens and smoked chutney.', TRUE, 'Mizo Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-kohima-axone-pork', 'dest-131', 'Angami Smoked Pork with Axone', 'Iconic Naga preparation of wood-smoked pork cooked with fermented soybean cakes (Axone) and fiery Naga King Chilli (Bhut Jolokia).', FALSE, 'Naga Indigenous', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-kohima-galho', 'dest-131', 'Naga Galho', 'Hearty, nourishing rice and wild mountain herb porridge simmered with local greens and gentle spices.', TRUE, 'Naga Comfort Food', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-kisama-anishi', 'dest-132', 'Smoked Meat with Anishi (Fermented Taro)', 'Savory dish cooked using sun-dried smoked patties of fermented taro leaves (Anishi), giving a rich, earthy flavor.', FALSE, 'Hornbill Festival Tribal Dish', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-dzukou-trekker-stew', 'dest-133', 'Dzükou Campfire Herbal Stew', 'Warming mountain broth prepared with local root vegetables, ginger, and wild mountain herbs over open campfire embers.', TRUE, 'Trail Food', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-khonoma-organic-thali', 'dest-134', 'Khonoma Alder Organic Harvest Thali', 'Pure organic feast consisting of terraced hill rice, boiled indigenous mountain greens, roasted tomato chutney, and wild bamboo stew.', TRUE, 'Angami Village Organic', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-mokokchung-ao-pork', 'dest-135', 'Ao Naga Bamboo Shoot Pork Curry', 'Traditional Ao recipe of pork slow-cooked in natural bamboo sap with mountain ginger and fresh bird''s eye chillies.', FALSE, 'Ao Naga Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;

-- 6. DESTINATION TRANSPORT CONNECTIVITY
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-diu-air', 'dest-116', 'Flight', 'Diu Airport (DIU)', 8.0, 'Direct scheduled commercial flights from Mumbai connecting to Diu Airport at Nagoa.', 3500, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-diu-rail', 'dest-116', 'Train', 'Veraval Railway Station (VRL)', 85.0, 'Major broad-gauge railhead connected to Ahmedabad, Mumbai, and Delhi; connecting taxis and buses available.', 1200, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-daman-rail', 'dest-117', 'Train', 'Vapi Railway Station (VAPI)', 12.0, 'Major Western Railway junction on the Mumbai–Delhi main line with express trains stopping 24x7; 15 mins by auto/taxi.', 200, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-daman-road', 'dest-117', 'Bus / Taxi', 'NH 48 Mumbai–Surat Highway', 170.0, 'Smooth 4-lane expressway from Mumbai (approx. 3.5 hours drive via NH 48).', 2500, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-silvassa-rail', 'dest-118', 'Train', 'Vapi Railway Station (VAPI)', 18.0, 'Closest mainline railway junction to Silvassa; frequent state transport buses and auto-rickshaws available.', 250, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-silvassa-road', 'dest-118', 'Road', 'Silvassa–Bhilad Road / NH 48', 165.0, 'Convenient road access from Mumbai and Surat via NH 48 exit at Bhilad.', 2400, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-kru-rail', 'dest-119', 'Train', 'Kurukshetra Junction (KKDE)', 2.0, 'Directly on the Delhi–Amritsar main line with frequent Vande Bharat and Shatabdi Express halts.', 450, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-kru-road', 'dest-119', 'Road', 'Grand Trunk Road (NH 44)', 155.0, '6-lane national highway directly from Delhi ISBT Kashmere Gate (approx. 2.5 hours).', 300, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-pinjore-air', 'dest-120', 'Flight', 'Chandigarh International Airport (IXC)', 28.0, 'Closest domestic & international airport with rapid cab connectivity via Himalayan Expressway.', 700, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-pinjore-rail', 'dest-120', 'Train', 'Kalka Railway Station (KLK)', 5.0, 'Gateway to the UNESCO Kalka–Shimla toy train and terminal for Shatabdi Express from Delhi.', 100, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-morni-road', 'dest-121', 'Road', 'Panchkula–Morni Hill Road', 45.0, 'Scenic winding mountain road climbing through pine forests from Panchkula / Chandigarh.', 1100, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-sultanpur-road', 'dest-122', 'Road / Metro', 'Gurugram–Jhajjar Highway', 15.0, 'Short 25-minute drive from Gurugram City Center / IFFCO Chowk Metro station.', 350, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-loktak-air', 'dest-123', 'Flight', 'Bir Tikendrajit International Airport (IMF)', 42.0, 'Closest airport in Imphal with regular daily flights from Kolkata, Guwahati, and Delhi; connecting taxis take ~1 hour.', 1000, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-loktak-road', 'dest-123', 'Road', 'Tiddim Road (NH 2)', 45.0, 'Well-paved highway connecting Imphal to Moirang and Sendra Island with shared and private cabs.', 80, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-imphal-air', 'dest-124', 'Flight', 'Imphal Airport (IMF)', 8.0, 'Major Northeast airport terminal located 8 km south of the city center with prepaid taxi counters.', 300, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-imphal-road', 'dest-124', 'Road', 'Asian Highway 1 / NH 2 (Imphal–Kohima Highway)', 140.0, 'Crucial national highway link connecting Imphal to Kohima and Dimapur railhead.', 500, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-moirang-road', 'dest-125', 'Road', 'Imphal–Moirang Bus Route', 45.0, 'Regular direct bus and winger cab services operating every 30 mins from Wahengbam Leikai bus stand in Imphal.', 70, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-ukhrul-road', 'dest-126', 'Road', 'Imphal–Ukhrul Highway (NH 202)', 83.0, 'Scenic hill highway winding through green pine ridges from Imphal to Ukhrul town (approx. 3 hours).', 250, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-aizawl-air', 'dest-127', 'Flight', 'Lengpui Airport (AJL)', 32.0, 'Mizoram''s principal airport with daily flights connecting Kolkata, Guwahati, and Delhi; taxi to town takes ~1 hour.', 1200, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-aizawl-rail', 'dest-127', 'Train', 'Bairabi / Silchar Railway Station', 130.0, 'Nearest broad-gauge railhead in Assam (Silchar) connecting to all-India railway network with shared sumo services.', 600, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-reiek-road', 'dest-128', 'Road', 'Aizawl–Reiek Hill Road', 29.0, 'Paved mountain road climbing from Aizawl through lush tropical bamboo forest to Reiek village (1.5 hours).', 800, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-thenzawl-road', 'dest-129', 'Road', 'Aizawl–Thenzawl–Lunglei Highway', 90.0, 'Comfortable 3-hour drive from Aizawl on the southern highway through mountain valleys.', 400, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-champhai-road', 'dest-130', 'Road', 'Aizawl–Champhai Highway (NH 6)', 188.0, 'Eastern highway connecting Aizawl to Champhai town and Zokhawthar border checkpoint (approx. 6–7 hours).', 700, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-kohima-rail', 'dest-131', 'Train', 'Dimapur Railway Station (DMV)', 74.0, 'Nagaland''s premier railway hub with Rajdhani and express trains to Guwahati, Delhi, and Kolkata; 2.5 hours by taxi.', 400, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-kohima-air', 'dest-131', 'Flight', 'Dimapur Airport (DMU)', 72.0, 'Nearest commercial airport with daily flights connecting Kolkata and Dibrugarh; shared sumos and cabs to Kohima.', 500, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-kisama-road', 'dest-132', 'Road', 'NH 2 (Kohima–Imphal Highway)', 12.0, 'Direct 25-minute drive south along NH 2 from Kohima town center with dedicated festival shuttles during Hornbill.', 200, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-dzukou-trail', 'dest-133', 'Trek', 'Viswema / Jakhama Trailheads', 25.0, 'Accessible by taxi to Viswema trail staging point (25 km from Kohima), followed by a 4-hour scenic uphill mountain trek.', 600, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-khonoma-road', 'dest-134', 'Road', 'Kohima–Khonoma Village Road', 20.0, 'Scenic 45-minute drive west from Kohima winding past terraced rice fields and oak forests.', 500, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, estimated_fare_inr, source_type) VALUES ('trans-mokokchung-road', 'dest-135', 'Road', 'NH 2 (Kohima–Mokokchung) / Mariani Road', 150.0, 'Connected from Kohima (approx. 5 hours) and from Mariani / Jorhat railhead in Assam (approx. 3.5 hours).', 650, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
