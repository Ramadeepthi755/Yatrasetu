-- ==============================================================================
-- YatraSetu Migration: V14__south_and_east_tier_a_expansion.sql
-- Product: YatraSetu ("Discover India. Connect Locally. Grow Tourism.")
-- Purpose: Phase 14 — Critical South & East Tier-A Destination Expansion
-- Scope: 36 Tier-A Destinations, 27 New Cities, 108 POIs, 72 Foods, 72 Transports, 153 Hotel Links
-- Target Regions: South India (AP, TG, TN, KA, KL) & East India (OD, WB, BR, JH, CG)
-- ==============================================================================

-- 1. CANONICAL BASE CITIES (27 Verified New Cities)
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('gandikota', 'Gandikota', 'IN-AP', 'YSR Kadapa', 14.8144, 78.2862, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('srisailam', 'Srisailam', 'IN-AP', 'Nandyal', 16.0747, 78.8682, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('lepakshi', 'Lepakshi', 'IN-AP', 'Sri Sathya Sai', 13.8041, 77.6083, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('palampet-mulugu', 'Palampet (Mulugu)', 'IN-TG', 'Mulugu', 18.2589, 79.9439, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('nagarjuna-sagar', 'Nagarjuna Sagar', 'IN-TG', 'Nalgonda', 16.5786, 79.3125, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('bhadrachalam', 'Bhadrachalam', 'IN-TG', 'Bhadradri Kothagudem', 17.6689, 80.8936, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('thanjavur', 'Thanjavur', 'IN-TN', 'Thanjavur', 10.787, 79.1378, 'Tier-2', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('kodaikanal', 'Kodaikanal', 'IN-TN', 'Dindigul', 10.2381, 77.4892, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('kanchipuram', 'Kanchipuram', 'IN-TN', 'Kanchipuram', 12.8342, 79.7036, 'Tier-2', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('chettinad-karaikudi', 'Karaikudi (Chettinad)', 'IN-TN', 'Sivaganga', 10.0735, 78.7732, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('badami', 'Badami', 'IN-KA', 'Bagalkot', 15.9189, 75.6766, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('hassan', 'Hassan (Belur-Halebidu)', 'IN-KA', 'Hassan', 13.0072, 76.0962, 'Tier-2', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('sagara-jogfalls', 'Sagara (Jog Falls)', 'IN-KA', 'Shivamogga', 14.167, 75.033, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('dandeli', 'Dandeli', 'IN-KA', 'Uttara Kannada', 15.2452, 74.6225, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('thekkady', 'Thekkady (Kumily)', 'IN-KL', 'Idukki', 9.6031, 77.1706, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('kovalam', 'Kovalam', 'IN-KL', 'Thiruvananthapuram', 8.402, 76.978, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('bekal', 'Bekal', 'IN-KL', 'Kasaragod', 12.393, 75.031, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('konark', 'Konark', 'IN-OD', 'Puri', 19.8876, 86.0945, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('balugaon-chilika', 'Balugaon (Chilika)', 'IN-OD', 'Khordha', 19.746, 85.207, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('canning-sundarbans', 'Canning (Sundarbans)', 'IN-WB', 'South 24 Parganas', 22.31, 88.66, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('bolpur-shantiniketan', 'Bolpur (Shantiniketan)', 'IN-WB', 'Birbhum', 23.67, 87.72, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('kalimpong', 'Kalimpong', 'IN-WB', 'Kalimpong', 27.0667, 88.4667, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('rajgir-nalanda', 'Rajgir (Nalanda)', 'IN-BR', 'Nalanda', 25.03, 85.42, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('deoghar', 'Deoghar', 'IN-JH', 'Deoghar', 24.4826, 86.7, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('netarhat', 'Netarhat', 'IN-JH', 'Latehar', 23.4833, 84.2667, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('jagdalpur', 'Jagdalpur', 'IN-CG', 'Bastar', 19.074, 82.031, 'Tier-2', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub) VALUES ('sirpur', 'Sirpur', 'IN-CG', 'Mahasamund', 21.3417, 82.1792, 'Tier-3', TRUE) ON CONFLICT (id) DO NOTHING;

-- 2. DESTINATIONS (36 Authentic Tier-A Records: dest-136 to dest-171)
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, trip_types, primary_attractions, activities_available,
    unique_experiences, hidden_gems, best_seasons, avoid_seasons, peak_season, off_season,
    minimum_days, ideal_days, maximum_days, description, hero_image_url, language_spoken,
    local_cuisine_must_try, is_active
) VALUES (
    'dest-136', 'Tirupati', 'IN-AP', 'tirupati', 'Tirupati', 'South India',
    13.6288, 79.4192, 150, 9.5, 'Easy',
    ARRAY['Pilgrimage', 'Spiritual', 'Heritage', 'Family']::TEXT[], ARRAY['Sri Venkateswara Swamy Temple (Tirumala)', 'Sri Kapila Theertham', 'Silathoranam (Natural Stone Arch)', 'Sri Govindaraja Swamy Temple', 'Chandragiri Fort']::TEXT[], ARRAY['Temple darshan', 'Walking the Alipiri footpath trail', 'Exploring Vijayanagara fort ramparts', 'Visiting geological stone formations']::TEXT[],
    'Ascending the holy Tirumala hills via traditional stone stairway footpaths amidst the Seshachalam forest biosphere.', 'Silathoranam, a rare natural geological stone arch dating back millions of years on the Tirumala ridge, and the historic Chandragiri Fort.', 'September, October, November, December, January, February, March', 'May, June', 'September to February', 'May to July',
    1.5, 2.5, 4, 'Tirupati is one of India''s most venerated pilgrimage hubs, set at the foothills of the holy Seshachalam ranges where the ancient Sri Venkateswara temple presides atop the seven peaks of Tirumala.', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    'Telugu, Tamil, Hindi, English', 'Tirupati Srivari Laddu, Andhra temple pulihora, ghee curd rice, traditional South Indian thali', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-137', 'Visakhapatnam', 'IN-AP', 'visakhapatnam', 'Visakhapatnam', 'South India',
    17.6868, 83.2185, 5, 8.9, 'Easy',
    ARRAY['Coastal', 'Beach', 'Heritage', 'City_break']::TEXT[], ARRAY['Ramakrishna (RK) Beach', 'INS Kursura Submarine Museum', 'Kailasagiri', 'Rushikonda Beach', 'Yarada Beach', 'TU 142 Aircraft Museum']::TEXT[], ARRAY['Beach walking', 'Submarine museum guided tour', 'Ropeway ride to Kailasagiri', 'Water sports at Rushikonda']::TEXT[],
    'Walking inside the decommissioned Soviet-built INS Kursura submarine right along the scenic beach road promenade.', 'Dolphin''s Nose lighthouse promontory offering sweeping views of the natural harbour and secluded Yarada cove.', 'October, November, December, January, February, March', 'May, June', 'November to February', 'May to August',
    2.0, 3.0, 5, 'Visakhapatnam (Vizag) is Andhra Pradesh''s premier port metropolis, cradled between the verdant Eastern Ghats and the azure waters of the Bay of Bengal, famous for clean beaches, naval museums, and scenic coastal drives.', 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
    'Telugu, Hindi, English', 'Coastal Andhra fish pulusu, bamboo chicken, Royyala vepudu, Madugula halwa', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-138', 'Gandikota & Belum Caves', 'IN-AP', 'gandikota', 'YSR Kadapa', 'South India',
    14.8144, 78.2862, 320, 8.4, 'Moderate',
    ARRAY['Adventure', 'Geological', 'Heritage', 'Photography']::TEXT[], ARRAY['Pennar River Gorge', 'Gandikota Fort', 'Madhavaraya Temple', 'Belum Caves', 'Raghunatha Swamy Temple']::TEXT[], ARRAY['Gorge edge sunrise photography', 'Exploring 13th-century red granite fort', 'Subterranean cave exploration at Belum', 'Camping on the plateau']::TEXT[],
    'Standing at the edge of the 300-foot vertical gorge of red sandstone cut by the Pennar River, overlooking the historic fortress.', 'The massive subterranean chambers and stalactite formations in Belum Caves, extending over 3 kilometres under the Rayalaseema plain.', 'October, November, December, January, February', 'April, May, June', 'November to January', 'April to August',
    1.5, 2.0, 3, 'Gandikota is renowned for its spectacular gorge formed by the Pennar River carving through the Erramala hills, complemented by the medieval Gandikota Fort and the extensive subterranean passages of Belum Caves nearby.', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    'Telugu, Hindi, English', 'Rayalaseema ragi sankati, natu kodi pulusu, uggani bajji, pesarattu', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-139', 'Srisailam', 'IN-AP', 'srisailam', 'Nandyal', 'South India',
    16.0747, 78.8682, 476, 8.8, 'Moderate',
    ARRAY['Pilgrimage', 'Spiritual', 'Nature', 'Wildlife']::TEXT[], ARRAY['Sri Bhramaramba Mallikarjuna Swamy Temple', 'Srisailam Dam', 'Pathalaganga', 'Nagarjunsagar-Srisailam Tiger Reserve', 'Akkamahadevi Caves']::TEXT[], ARRAY['Jyotirlinga and Shakti Peetha worship', 'Pathalaganga ropeway and boat ride', 'Dam gorge viewing', 'Forest wildlife drive']::TEXT[],
    'Visiting one of the rare shrines that is simultaneously one of the 12 sacred Jyotirlingas and one of the 18 Maha Shakti Peethas, set deep in the Nallamala forests.', 'Akkamahadevi Caves reached via a scenic motorboat journey across the Krishna river reservoir followed by a short forest trek.', 'October, November, December, January, February, March', 'April, May', 'October to February', 'April to June',
    1.5, 2.5, 3, 'Perched atop the Nallamala hills along the deep Krishna River gorge, Srisailam is a celebrated spiritual and ecological sanctuary housing the ancient Mallikarjuna Swamy Jyotirlinga and the sprawling Nagarjunsagar-Srisailam Tiger Reserve.', 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    'Telugu, Kannada, Hindi, English', 'Srisailam prasadam, Andhra meals, pulihora, pesarattu, gongura pachadi', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-140', 'Lepakshi', 'IN-AP', 'lepakshi', 'Sri Sathya Sai', 'South India',
    13.8041, 77.6083, 680, 8.2, 'Easy',
    ARRAY['Heritage', 'Architecture', 'Spiritual', 'Photography']::TEXT[], ARRAY['Veerabhadra Temple', 'Hanging Pillar', 'Monolithic Nandi', 'Nagalinga Sculpture', 'Kalyana Mandapa']::TEXT[], ARRAY['Exploring 16th-century Vijayanagara rock architecture', 'Inspecting the famous hanging pillar engineering', 'Photographing monolithic granite carvings']::TEXT[],
    'Witnessing the legendary Hanging Pillar of Veerabhadra Temple and the colossal monolithic Nandi sculpted from a single granite boulder.', 'Intricate ceiling mural frescoes depicting scenes from the Ramayana and Mahabharata using natural vegetable mineral dyes.', 'October, November, December, January, February, March', 'April, May', 'November to February', 'April to June',
    1.0, 1.0, 2, 'Lepakshi is a treasure trove of 16th-century Vijayanagara art and engineering, world-famous for its Veerabhadra Temple, the mysterious Hanging Pillar, exquisite ceiling murals, and one of the largest monolithic Nandi statues in India.', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    'Telugu, Kannada, English', 'Rayalaseema jowar roti, ennegayi brinjal, bobbattu, curd rice', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-141', 'Vijayawada & Amaravati', 'IN-AP', 'vijayawada', 'NTR', 'South India',
    16.5062, 80.648, 11, 8.7, 'Easy',
    ARRAY['Heritage', 'Spiritual', 'Buddhist', 'Cultural']::TEXT[], ARRAY['Kanaka Durga Temple', 'Undavalli Caves', 'Prakasam Barrage', 'Amaravati Maha Stupa', 'Dhyana Buddha Statue', 'Bhavani Island']::TEXT[], ARRAY['Hilltop temple darshan overlooking Krishna river', 'Exploring 7th-century rock-cut monolithic caves', 'Visiting ancient Buddhist relics at Amaravati', 'River island boating']::TEXT[],
    'Standing before the ancient 4th-century four-storied rock-cut Undavalli Caves housing a monolithic reclining Vishnu sculpted from solid sandstone.', 'The tranquil Buddhist heritage complex at Amaravati containing the historic 2,000-year-old Maha Stupa site and the monumental 125-foot Dhyana Buddha statue.', 'October, November, December, January, February, March', 'May, June', 'October to February', 'April to August',
    1.5, 2.5, 4, 'Located on the banks of the sacred Krishna River, Vijayawada and nearby Amaravati form a major cultural and historical axis featuring the celebrated hilltop Kanaka Durga Temple, ancient Buddhist stupas, and early rock-cut architecture.', 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
    'Telugu, Hindi, English', 'Vijayawada punugulu, Gongura mutton, ulavacharu biryani, Andhra meals', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-142', 'Ramappa Temple & Palampet', 'IN-TG', 'palampet-mulugu', 'Mulugu', 'South India',
    18.2589, 79.9439, 215, 8.9, 'Moderate',
    ARRAY['UNESCO', 'Heritage', 'Architecture', 'Photography']::TEXT[], ARRAY['Ramappa Temple (Rudreshwara)', 'Ramappa Lake', 'Katamlingeshwara Temple', 'Ghanpur Group of Temples']::TEXT[], ARRAY['Studying UNESCO World Heritage architecture', 'Inspecting floating brick technology', 'Boating on Ramappa Lake', 'Exploring Kakatiya temple ruins']::TEXT[],
    'Admiring the intricate black basalt bracket figures (Madanikas) and floating-brick shikhara of the 800-year-old Kakatiya masterpiece.', 'The peaceful 13th-century Ghanpur group of temples (Kota Gullu) nestled amidst farmland just 8 km north of Ramappa.', 'October, November, December, January, February, March', 'April, May', 'November to February', 'April to June',
    1.0, 1.5, 2, 'Inscribed as a UNESCO World Heritage Site, Ramappa Temple (Rudreshwara) at Palampet showcases the pinnacle of Kakatiya art, celebrated for its lightweight floating bricks, sandbox foundation engineering, and exquisite black basalt carvings.', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    'Telugu, Hindi, English', 'Telangana sarva pindi, pacchi pulusu, jowar roti, natukodi vepudu', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-143', 'Nagarjuna Sagar & Anupu', 'IN-TG', 'nagarjuna-sagar', 'Nalgonda', 'South India',
    16.5786, 79.3125, 175, 8.3, 'Easy',
    ARRAY['Heritage', 'Buddhist', 'Nature', 'Family']::TEXT[], ARRAY['Nagarjuna Sagar Dam', 'Nagarjunakonda Island Museum', 'Anupu Buddhist Amphitheatre', 'Ethipothala Falls', 'Launch Boat Station']::TEXT[], ARRAY['Reservoir launch boat cruise', 'Exploring Buddhist island museum', 'Visiting ancient Roman-style amphitheatre at Anupu', 'Ghat waterfall viewing']::TEXT[],
    'Taking a passenger boat across the vast Krishna reservoir to Nagarjunakonda island, which preserves ancient Buddhist stupas and monastery relics.', 'Anupu, a reconstructed 3rd-century Buddhist site on the reservoir banks featuring an open-air amphitheatre and university hall.', 'October, November, December, January, February, March', 'May, June', 'October to February', 'April to July',
    1.0, 2.0, 3, 'Nagarjuna Sagar is a remarkable confluence of modern engineering and ancient Buddhist heritage, home to one of the world''s largest masonry dams, the island archaeological museum of Nagarjunakonda, and the cascade of Ethipothala Falls.', 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
    'Telugu, Hindi, English', 'Krishna river fresh fish fry, Telangana mutton curry, jowar roti, gongura rice', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-144', 'Bhadrachalam', 'IN-TG', 'bhadrachalam', 'Bhadradri Kothagudem', 'South India',
    17.6689, 80.8936, 50, 8.5, 'Moderate',
    ARRAY['Pilgrimage', 'Spiritual', 'Riverfront', 'Nature']::TEXT[], ARRAY['Sri Sita Ramachandraswamy Temple', 'Godavari River Ghats', 'Parnasala', 'Papikondalu Boat Launch']::TEXT[], ARRAY['Temple darshan and Godavari snanam', 'Visiting epic Parnasala hermitage', 'Papikondalu river cruise through gorge hills', 'Forest temple trail']::TEXT[],
    'Cruising down the sacred Godavari River on a multi-deck boat as the river cuts dramatically through the misty hills of the Papikondalu range.', 'Parnasala (35 km away), a tranquil riverfront hamlet where Lord Rama, Sita, and Lakshmana are believed to have resided during their forest exile.', 'October, November, December, January, February, March', 'May, June', 'March to April (Sri Rama Navami) and November to January', 'May to August',
    1.5, 2.0, 3, 'Resting on the serene banks of the sacred Godavari River, Bhadrachalam is a celebrated pilgrimage destination famed for the 17th-century Sri Sita Ramachandraswamy Temple built by Bhakta Ramadasu and as the primary gateway to the Papikondalu river gorge.', 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    'Telugu, Hindi, English', 'Bhadrachalam laddu prasadam, Godavari pulasa fish curry, traditional South Indian thali, pulihora', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-145', 'Madurai', 'IN-TN', 'madurai', 'Madurai', 'South India',
    9.9252, 78.1198, 101, 9.4, 'Easy',
    ARRAY['Heritage', 'Spiritual', 'Cultural', 'Food_walk']::TEXT[], ARRAY['Meenakshi Sundareswarar Temple', 'Thirumalai Nayakkar Mahal', 'Gandhi Memorial Museum', 'Alagar Kovil', 'Vandiyur Mariamman Teppakulam']::TEXT[], ARRAY['Exploring 14 towering sculpted gopurams of Meenakshi Temple', 'Witnessing the nightly divine procession ceremony', 'Sound and light show at Thirumalai Nayakkar palace', 'Madurai midnight street food trail']::TEXT[],
    'Witnessing the thousands of sculpted and painted granite figures lining the colossal 1000-pillar hall of the ancient Meenakshi Sundareswarar temple.', 'Thiruparankundram rock-cut cave temple (one of the six abodes of Murugan) carved into a single monolithic granite hillock on the city outskirts.', 'October, November, December, January, February, March', 'May, June', 'October to March (especially during Chithirai Festival in April)', 'May to July',
    1.5, 2.5, 4, 'Known as the Athens of the East and the cultural soul of Tamil Nadu, Madurai is an ancient temple city on the banks of the Vaigai River, renowned for the architectural marvel of the Meenakshi Amman Temple, grand Nayak palaces, and vibrant culinary traditions.', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    'Tamil, English, Hindi', 'Madurai Kari Dosa, Jigarthanda, Bun Parotta, Kothu Parotta, Malli Idli', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-146', 'Thanjavur', 'IN-TN', 'thanjavur', 'Thanjavur', 'South India',
    10.787, 79.1378, 57, 9.2, 'Easy',
    ARRAY['UNESCO', 'Heritage', 'Architecture', 'Cultural']::TEXT[], ARRAY['Brihadisvara Temple (Peruvudaiyar Kovil)', 'Thanjavur Maratha Palace', 'Saraswathi Mahal Library', 'Schwartz Church', 'Rajarajan Art Gallery']::TEXT[], ARRAY['Inspecting UNESCO Great Living Chola Temples', 'Admiring 80-tonne granite monolithic kumbam cupola', 'Viewing medieval palm-leaf manuscripts at Saraswathi Mahal', 'Buying authentic Thanjavur gold-foil paintings']::TEXT[],
    'Gazing up at the colossal 216-foot granite vimana of Brihadisvara Temple, constructed over 1,000 years ago without binding mortar by Emperor Raja Raja Chola I.', 'The century-old Thanjavur Royal Palace Art Gallery housing a peerless collection of Chola bronze masterpieces, including the Nataraja and Ardhanarishvara.', 'October, November, December, January, February, March', 'May, June', 'November to February', 'May to August',
    1.5, 2.0, 3, 'Thanjavur (Tanjore) was the glorious royal capital of the Chola Empire, celebrated worldwide for the UNESCO World Heritage Brihadisvara Temple, centuries-old bronze casting heritage, Classical Carnatic music roots, and distinctive gold-embossed Tanjore paintings.', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    'Tamil, English, Hindi', 'Thanjavur royal sambar, Ashoka halwa, Tanjore thali, degree filter coffee', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-147', 'Kodaikanal', 'IN-TN', 'kodaikanal', 'Dindigul', 'South India',
    10.2381, 77.4892, 2133, 9.1, 'Moderate',
    ARRAY['Hill_station', 'Nature', 'Relaxation', 'Family']::TEXT[], ARRAY['Kodaikanal Lake', 'Coaker''s Walk', 'Pillar Rocks', 'Bryant Park', 'Silver Cascade Falls', 'Pine Forest', 'Dolphin''s Nose']::TEXT[], ARRAY['Boating on star-shaped Kodai lake', 'Cycling around lake promenade', 'Walking through misty pine forests', 'Cliff-edge viewpoint trekking']::TEXT[],
    'Strolling along Coaker''s Walk on a misty morning as clouds roll over the steep southern valleys and watching the iconic Kurinji flower hills.', 'Berijam Lake, a serene freshwater reservoir set deep inside a protected forest reserve accessible only with special forest department permits.', 'October, November, December, January, February, March, April, May', 'July, August', 'April to June and September to January', 'July to August',
    2.0, 3.0, 5, 'Affectionately called the ''Princess of Hill Stations'', Kodaikanal sits at an elevation of 2,133 metres amidst the Palani Hills of Tamil Nadu, famous for its star-shaped central lake, towering Pillar Rocks, pine forest trails, and cool mountain climate.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'Tamil, English, Hindi', 'Homemade hill chocolates, warm Tibetan momos, Kodai cheese, hot masala chai, fresh plums and pears', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-148', 'Kanchipuram', 'IN-TN', 'kanchipuram', 'Kanchipuram', 'South India',
    12.8342, 79.7036, 83, 8.8, 'Easy',
    ARRAY['Heritage', 'Spiritual', 'Architecture', 'Handicrafts']::TEXT[], ARRAY['Ekambareswarar Temple', 'Kailasanathar Temple', 'Varadharaja Perumal Temple', 'Kanchi Kamakshi Amman Temple', 'Silk Weaving Cooperative Societies']::TEXT[], ARRAY['Exploring 8th-century Pallava stone architecture at Kailasanathar', 'Visiting the 3,500-year-old mango tree shrine at Ekambareswarar', 'Observing traditional pit-loom pure mulberry silk weaving', 'Purchasing certified Kanchipuram silk sarees']::TEXT[],
    'Walking inside the sand-stone sculpted courtyards of the 8th-century Pallava Kailasanathar Temple, the oldest structural temple in Kanchipuram.', 'Vaikunta Perumal Temple, showcasing unique 8th-century multi-tiered sanctums and sculpted stone relief panels chronicling Pallava royal history.', 'October, November, December, January, February, March', 'May, June', 'November to February', 'April to June',
    1.0, 1.5, 2, 'Revered as the ''City of a Thousand Temples'' and the silk capital of South India, Kanchipuram is a renowned historical centre in Tamil Nadu celebrating ancient Pallava and Chola architectural treasures alongside master handloom silk weaving.', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    'Tamil, Telugu, English', 'Kanchipuram idli, traditional South Indian thali, kovil puliyodharai, sweet pongal', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-149', 'Chettinad', 'IN-TN', 'chettinad-karaikudi', 'Sivaganga', 'South India',
    10.0735, 78.7732, 85, 8.6, 'Easy',
    ARRAY['Heritage', 'Culinary', 'Architecture', 'Cultural']::TEXT[], ARRAY['Chettinad Mansions of Kanadukathan', 'Athangudi Handmade Tile Workshops', 'Chettinad Heritage Museum', 'Karpaga Vinayakar Temple (Pillayarpatti)', 'Kaviarasu Kannadasan Memorial']::TEXT[], ARRAY['Touring 19th-century 1000-window palatial mansions', 'Watching artisans hand-press Athangudi decorative tiles', 'Participating in authentic Chettinad culinary workshops', 'Exploring antique brassware markets']::TEXT[],
    'Staying in a restored 19th-century Nattukottai Chettiar mansion with Burmese teak pillars, Italian marble floors, and Belgium crystal chandeliers.', 'The centuries-old rock-cut cave shrine of Pillayarpatti Karpaga Vinayakar Temple carved out of a granite hillock in the 4th–7th century.', 'October, November, December, January, February, March', 'April, May', 'November to February', 'April to June',
    1.5, 2.0, 3, 'Chettinad is a captivating cultural and culinary heritage region in Tamil Nadu, famed for its palatial Nattukottai Chettiar heritage mansions, vibrant Athangudi handmade terracotta tiles, and world-celebrated aromatic Chettinad cuisine.', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    'Tamil, English', 'Chettinad chicken curry, Kozhukattai, Kuzhi Paniyaram, Vellai Paniyaram, Athangudi snacks', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-150', 'Badami, Pattadakal & Aihole', 'IN-KA', 'badami', 'Bagalkot', 'South India',
    15.9189, 75.6766, 586, 9.3, 'Moderate',
    ARRAY['UNESCO', 'Heritage', 'Architecture', 'Photography']::TEXT[], ARRAY['Badami Cave Temples', 'Agastya Lake', 'Bhuthanatha Group of Temples', 'Pattadakal UNESCO Monuments', 'Aihole Durga Temple Complex', 'Ravana Phadi Cave']::TEXT[], ARRAY['Exploring 6th-century Chalukya rock-cut cave temples', 'Witnessing sandstone cliffs reflected in Agastya Lake', 'Studying UNESCO World Heritage monuments at Pattadakal', 'Architectural exploration of Aihole''s 125 stone temples']::TEXT[],
    'Viewing the 18-armed dancing Nataraja carving in Cave 1 at Badami and walking among the apsidal stone temple ruins of Aihole, the cradle of temple architecture.', 'Bhuthanatha temples situated at the quiet water''s edge of Agastya Lake, surrounded by towering red sandstone cliffs.', 'October, November, December, January, February, March', 'April, May', 'November to February', 'April to June',
    2.0, 3.0, 4, 'Badami, Pattadakal, and Aihole form the historic heartland of the Early Chalukya dynasty, famed for red sandstone rock-cut cave temples, UNESCO World Heritage monuments, and pioneering classical temple architecture.', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    'Kannada, Hindi, English', 'North Karnataka jowar rotti, enne gai brinjal, shenga chutney, badami peda, holige', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-151', 'Belur & Halebidu', 'IN-KA', 'hassan', 'Hassan', 'South India',
    13.16, 75.86, 975, 9.1, 'Easy',
    ARRAY['UNESCO', 'Heritage', 'Architecture', 'Photography']::TEXT[], ARRAY['Chennakeshava Temple (Belur)', 'Hoysaleswara Temple (Halebidu)', 'Kedareshwara Temple', 'Jain Basadi Complex (Halebidu)', 'Shravanabelagola Monolith']::TEXT[], ARRAY['Studying UNESCO-inscribed Hoysala Sacred Ensembles', 'Admiring soapstone lathe-turned pillars', 'Inspecting intricate filigree-like stone wall reliefs', 'Visiting nearby colossal Gommateshwara statue']::TEXT[],
    'Marveling at the soapstone friezes of Belur and Halebidu, depicting thousands of detailed elephants, lions, cavalry, and celestial dancers carved with jewelry-like precision.', 'Kedareshwara Temple at Halebidu, a star-shaped soapstone temple exhibiting delicate bracket sculptures amidst manicured lawns.', 'September, October, November, December, January, February, March', 'April, May', 'October to February', 'April to June',
    1.5, 2.0, 3, 'Inscribed as UNESCO World Heritage Sites under the Sacred Ensembles of the Hoysalas, Belur and Halebidu represent the crowning zenith of 12th-century Hoysala soapstone architecture, famed for star-shaped temple platforms and hyper-detailed filigree stone carvings.', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    'Kannada, Hindi, English', 'Hassan akki rotti, bisi bele bath, Mysore pak, South Karnataka thali', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-152', 'Jog Falls & Sharavathi Valley', 'IN-KA', 'sagara-jogfalls', 'Shivamogga', 'South India',
    14.2285, 74.8117, 475, 8.8, 'Moderate',
    ARRAY['Waterfall', 'Nature', 'Western_ghats', 'Photography']::TEXT[], ARRAY['Jog Falls (Raja, Roarer, Rocket, Rani)', 'Sharavathi Valley Wildlife Sanctuary', 'Linganamakki Dam', 'Honnemaradu Backwaters', 'Kanoor Kote Fort Trek']::TEXT[], ARRAY['Viewing 253-metre plunge waterfall from Watkins platform', 'Descending 1,400 steps to the gorge base (when open)', 'Kayaking and camping at Honnemaradu backwaters', 'Rainforest canopy birdwatching']::TEXT[],
    'Witnessing the Sharavathi River plunge down a dramatic 253-metre sheer vertical cliff in four distinct, roaring cascades.', 'Honnemaradu, a tranquil island hamlet on the reservoir of the Linganamakki dam renowned for pristine kayaking, canoeing, and stargazing.', 'July, August, September, October, November, December', 'March, April, May', 'August to October (monsoon flow)', 'March to May',
    1.5, 2.0, 3, 'Jog Falls is one of India''s most breathtaking segmented plunge waterfalls, where the Sharavathi River drops 253 metres across a steep canyon in four thunderous cascades—Raja, Roarer, Rocket, and Rani—amidst the lush biodiversity of the Western Ghats.', 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
    'Kannada, Hindi, English', 'Malnad thodadevu, jackfruit papad, halasina hannina kadabu, neer dosa', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-153', 'Dandeli', 'IN-KA', 'dandeli', 'Uttara Kannada', 'South India',
    15.2452, 74.6225, 473, 8.7, 'Moderate',
    ARRAY['Adventure', 'Wildlife', 'River_rafting', 'Nature']::TEXT[], ARRAY['Kali River White Water Rafting', 'Dandeli Wildlife Sanctuary', 'Syntheri Rocks', 'Shiroli Peak', 'Kavala Caves', 'Supa Dam']::TEXT[], ARRAY['Grade 2–3 white water rafting on the Kali River', 'Kayaking and coracle boating', 'Open-jeep wildlife safari in dense teak-hornbill forests', 'Trekking to limestone Kavala caves']::TEXT[],
    'Navigating the rapids of the pristine Kali River surrounded by dense Western Ghats rainforest canopy and spotting the Great Indian Hornbill.', 'Syntheri Rocks, a massive 300-foot monolithic granite ravine carved by the rushing Kaneri river, home to hundreds of nesting rock pigeons and wild bees.', 'October, November, December, January, February, March, April, May', 'July, August', 'October to May (rafting season)', 'July to August',
    2.0, 3.0, 4, 'Nestled on the banks of the Kali River amidst the lush Western Ghats, Dandeli is South India''s premier adventure and wildlife hub, renowned for thrilling white-water river rafting, dense hornbill habitats, and limestone cave treks.', 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
    'Kannada, Marathi, Konkani, Hindi, English', 'North Canara fish curry, bamboo shoot sukka, jowar rotti, jackfruit fry, sol kadi', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-154', 'Udupi & Coastal Circuit', 'IN-KA', 'udupi', 'Udupi', 'South India',
    13.3409, 74.7421, 39, 9.0, 'Easy',
    ARRAY['Spiritual', 'Coastal', 'Culinary', 'Beach']::TEXT[], ARRAY['Sri Krishna Matha', 'Kanakana Kindi', 'Malpe Beach', 'St. Mary''s Island', 'Kaup Beach & Lighthouse', 'Anegudde Vinayaka Temple']::TEXT[], ARRAY['Viewing Krishna deity through the sacred Kanakana Kindi window', 'Ferry excursion to columnar basalt rock formations of St. Mary''s Island', 'Walking the sea walkway at Malpe', 'Sampling authentic Udupi vegetarian thali at temple mutts']::TEXT[],
    'Taking a passenger boat to St. Mary''s Island to walk among rare hexagonal columnar basalt lava rock formations created millions of years ago.', 'Kaup Beach with its historic 1901 colonial black-and-white striped lighthouse standing atop a massive coastal sea rock.', 'October, November, December, January, February, March', 'June, July, August', 'October to February (especially during Paryaya festival every two years)', 'June to August',
    1.5, 2.5, 4, 'Udupi is a celebrated coastal and spiritual gem of Karnataka, world-renowned as the birthplace of Udupi vegetarian cuisine, home to the 13th-century Sri Krishna Matha founded by Saint Madhvacharya, and gateway to pristine beaches and the geological wonder of St. Mary''s Islands.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'Kannada, Tulu, Konkani, English', 'Authentic Udupi vegetarian thali, Goli Baje, Masala Dosa, Neer Dosa, Patrode, Kadubu', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-155', 'Fort Kochi & Mattancherry', 'IN-KL', 'kochi', 'Ernakulam', 'South India',
    9.965, 76.242, 3, 9.4, 'Easy',
    ARRAY['Heritage', 'Cultural', 'Colonial', 'Arts']::TEXT[], ARRAY['Chinese Fishing Nets', 'St. Francis Church', 'Mattancherry Dutch Palace', 'Paradesi Synagogue (Jew Town)', 'Santa Cruz Basilica', 'Kochi-Muziris Biennale Hub']::TEXT[], ARRAY['Watching cantilevered Chinese fishing nets operate at sunset', 'Walking historic colonial lanes and spice markets', 'Admiring Ramayana murals in Dutch Palace', 'Attending evening Kathakali and Kalaripayattu performances']::TEXT[],
    'Watching the centuries-old cantilevered Chinese fishing nets lowered into the Arabian Sea waters against a golden sunset along Vasco da Gama square.', 'Jew Town antique warehouses and the 1568 Paradesi Synagogue paved with hand-painted blue-and-white willow pattern Chinese ceramic tiles.', 'October, November, December, January, February, March', 'June, July', 'November to February (especially during Kochi-Muziris Biennale)', 'June to August',
    1.5, 2.5, 4, 'Fort Kochi and Mattancherry form the historic spice-trade gateway of Kerala, where Portuguese, Dutch, British, and Jewish heritage seamlessly blend with traditional Malabar culture, ancient churches, cantilevered Chinese fishing nets, and contemporary international art.', 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80',
    'Malayalam, English, Hindi', 'Malabar fish curry, Appam with stew, Karimeen pollichathu, Kerala beef fry, Pazhampori', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-156', 'Thekkady & Periyar', 'IN-KL', 'thekkady', 'Idukki', 'South India',
    9.6031, 77.1706, 900, 9.2, 'Moderate',
    ARRAY['Wildlife', 'Nature', 'Spice_plantation', 'Eco_tourism']::TEXT[], ARRAY['Periyar Tiger Reserve', 'Periyar Lake Boat Safari', 'Spice Plantations of Kumily', 'Elephant Camp', 'Mangala Devi Kannagi Temple', 'Kadathanadan Kalari Centre']::TEXT[], ARRAY['Boating on Periyar Lake to view wild elephants and bison', 'Guided bamboo rafting and jungle trekking with forest tribal guides', 'Touring aromatic cardamom, pepper, and cinnamon plantations', 'Watching live Kalaripayattu martial arts shows']::TEXT[],
    'Cruising on a quiet boat across Periyar Lake surrounded by the submerged tree stumps of an ancient forest while herds of wild elephants come to the water''s edge.', 'Chellarkovil viewpoint, a quiet eco-tourism slope overlooking the cascading waterfalls and vast green plains of neighbouring Tamil Nadu.', 'October, November, December, January, February, March, April', 'June, July', 'November to February', 'June to August',
    1.5, 2.5, 4, 'Set amidst the misty Cardamom Hills of Kerala, Thekkady is home to the renowned Periyar National Park and Tiger Reserve, famous for lake boat safaris, wild elephant herds, lush spice plantations, and forest bamboo rafting adventures.', 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
    'Malayalam, Tamil, English, Hindi', 'Cardamom spiced tea, Kerala sadhya, Kappa and fish curry, banana chips in pure coconut oil', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-157', 'Kovalam & South Coast', 'IN-KL', 'kovalam', 'Thiruvananthapuram', 'South India',
    8.402, 76.978, 5, 9.1, 'Easy',
    ARRAY['Beach', 'Wellness', 'Ayurveda', 'Relaxation']::TEXT[], ARRAY['Lighthouse Beach', 'Hawah Beach', 'Samudra Beach', 'Vizhinjam Rock Cut Cave Temple', 'Vizhinjam Marine Aquarium', 'Halcyon Castle']::TEXT[], ARRAY['Climbing the 118-foot Vizhinjam lighthouse for 360-degree ocean views', 'Traditional Ayurvedic rejuvenation massages', 'Surfing and swimming in crescent coves', 'Seaside seafood dining']::TEXT[],
    'Climbing the iconic red-and-white striped Vizhinjam lighthouse atop Kurumkal hill for panoramic views of three adjacent crescent beaches and the Arabian Sea.', '8th-century Vizhinjam Rock Cut Cave Temple housing single-stone bas-relief sculptures of Vinadhara Dakshinamurti and Shiva-Parvati.', 'October, November, December, January, February, March', 'June, July', 'November to February', 'June to August',
    2.0, 3.0, 5, 'Kovalam is Kerala''s world-famous beach haven, comprising three adjacent crescent beaches separated by rocky headlands, famed for the historic Vizhinjam Lighthouse, gentle surf, Ayurvedic wellness retreats, and seaside promenades.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'Malayalam, English, Hindi, Tamil', 'Fresh coastal tiger prawns, Malabar squid roast, tender coconut water, Kerala sadhya, fish moilee', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-158', 'Bekal & North Malabar', 'IN-KL', 'bekal', 'Kasaragod', 'South India',
    12.393, 75.031, 15, 8.8, 'Moderate',
    ARRAY['Heritage', 'Coastal_fort', 'Beach', 'Cultural']::TEXT[], ARRAY['Bekal Fort', 'Bekal Beach & Observation Tower', 'Kappil Beach', 'Chandragiri Fort', 'Ananthapura Lake Temple', 'Valiyaparamba Backwaters']::TEXT[], ARRAY['Walking the sea-facing ramparts of the keyhole-shaped fort', 'Exploring the observation tower and ammunition rooms', 'Attending seasonal Theyyam rituals in North Malabar shrines', 'Boating on the Chandragiri river estuary']::TEXT[],
    'Walking along the wave-lashed outer laterite ramparts of the 350-year-old Bekal Fort, the largest and best-preserved fort in Kerala.', 'Ananthapura Lake Temple (30 km north), Kerala''s only lake temple, built in the middle of a rectangular spring-fed pond and guarded by sacred vegetarian crocodiles.', 'October, November, December, January, February, March', 'June, July, August', 'November to February', 'June to August',
    1.5, 2.0, 3, 'Located on the scenic North Malabar coast, Bekal is famous for the majestic 17th-century keyhole-shaped Bekal Fort jutting into the Arabian Sea, golden palm-fringed beaches, tranquil backwater estuaries, and the vibrant living ritual art of Theyyam.', 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80',
    'Malayalam, Kannada, Tulu, English', 'Malabar biryani, Kallummakkaya (mussels) fry, Unnakkayi, Pathiri with chicken curry', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-159', 'Bhubaneswar', 'IN-OD', 'bhubaneswar', 'Khordha', 'East India',
    20.2961, 85.8245, 45, 9.3, 'Easy',
    ARRAY['Heritage', 'Spiritual', 'Architecture', 'City_break']::TEXT[], ARRAY['Lingaraj Temple', 'Mukteswar Temple', 'Rajarani Temple', 'Udayagiri and Khandagiri Caves', 'Dhauli Shanti Stupa', 'Odisha State Museum', 'Nandankanan Zoological Park']::TEXT[], ARRAY['Exploring 10th-century Kalinga sandstone architecture', 'Tracing Ashokan rock edicts and Buddhist peace pagoda at Dhauli', 'Exploring 1st-century BCE Jain cave cells at Udayagiri', 'Browsing Odisha ikat handloom and silver filigree craft']::TEXT[],
    'Standing beneath the 55-metre deula of the 11th-century Lingaraj Temple and admiring the exquisite Torana gateway of Mukteswar Temple, the ''Gem of Odisha Architecture''.', 'Chausathi Yogini Temple at Hirapur (15 km away), one of only four hypaethral circular 64-Yogini sandstone shrines preserved in India.', 'October, November, December, January, February, March', 'May, June', 'November to February', 'May to August',
    2.0, 3.0, 4, 'Known as the ''Temple City of India'', Bhubaneswar boasts over a millennium of continuous Kalinga architectural evolution, from the ornate 10th-century Mukteswar and Rajarani temples to ancient Jain rock caves and Ashokan peace edicts.', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    'Odia, Hindi, English', 'Dalma, Chhena Poda, Dahibara Aloodum, Machha Besara, Rasagola, Pakhala Bhata', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-160', 'Puri & Jagannath Dham', 'IN-OD', 'puri', 'Puri', 'East India',
    19.8135, 85.8312, 10, 9.6, 'Easy',
    ARRAY['Pilgrimage', 'Spiritual', 'Beach', 'Cultural']::TEXT[], ARRAY['Sri Jagannath Temple', 'Golden Beach (Blue Flag Certified)', 'Swargadwar Beach', 'Gundicha Temple', 'Raghurajpur Heritage Crafts Village', 'Puri Beach Market']::TEXT[], ARRAY['Mahaprasad dining (Ananda Bazar)', 'Watching sunrise and sea breeze walks at Golden Beach', 'Visiting the artisan village of Raghurajpur for Pattachitra paintings', 'Witnessing annual Ratha Yatra festival']::TEXT[],
    'Partaking in the sacred Mahaprasad at Ananda Bazar, cooked exclusively in unglazed earthen pots stacked atop wood fires in the world''s largest traditional temple kitchen.', 'Raghurajpur Heritage Crafts Village (12 km away), a living cultural village where every household preserves master traditions of Pattachitra scroll painting and palm-leaf engraving.', 'October, November, December, January, February, March', 'May, June', 'June–July (Ratha Yatra) and October to February', 'May to August',
    2.0, 3.0, 5, 'Puri is one of the four sacred Char Dham pilgrimage sites of India, situated along the Bay of Bengal coast, world-renowned for the 12th-century Jagannath Temple, the monumental annual Ratha Yatra, Blue Flag-certified beaches, and master Pattachitra art.', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    'Odia, Bengali, Hindi, English', 'Jagannath Temple Mahaprasad, Khaja, Malpua, Chhena Jhili, coastal crab curry', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-161', 'Konark Sun Temple & Coast', 'IN-OD', 'konark', 'Puri', 'East India',
    19.8876, 86.0945, 5, 9.4, 'Easy',
    ARRAY['UNESCO', 'Heritage', 'Architecture', 'Coastal']::TEXT[], ARRAY['Sun Temple (Black Pagoda)', 'Chandrabhaga Beach', 'Konark Archaeological Museum', 'Konark Sun Temple Light & Sound Show', 'Ramachandi Beach & River Estuary', 'Kuruma Buddhist Site']::TEXT[], ARRAY['Admiring 24 carved stone chariot wheels and celestial musician sculptures', 'Watching golden sunrise at Chandrabhaga Beach', 'Visiting the modern interpretation centre', 'Attending the Konark Classical Dance Festival (December)']::TEXT[],
    'Tracing the intricate mathematical time-telling carvings on the 24 massive stone wheels of Surya''s chariot at the UNESCO Sun Temple.', 'Ramachandi Beach, a serene shoreline where the Kushabhadra River meets the Bay of Bengal, offering water sports and calm boat cruises.', 'October, November, December, January, February, March', 'May, June', 'December (Konark Dance Festival) and October to February', 'May to August',
    1.0, 1.5, 2, 'Konark is world-famous for its 13th-century UNESCO World Heritage Sun Temple built by King Narasimhadeva I, conceived as a colossal stone chariot of the Sun God drawn by seven horses, complemented by the pristine sands of Chandrabhaga Beach.', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    'Odia, Hindi, English', 'Coastal fried prawns, Chhena Jhili, Pakhala Bhata, coconut water, fresh seafood', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-162', 'Chilika Lake & Ramsar Wetland', 'IN-OD', 'balugaon-chilika', 'Khordha', 'East India',
    19.746, 85.207, 2, 9.1, 'Easy',
    ARRAY['Nature', 'Wildlife', 'Lagoon', 'Birdwatching']::TEXT[], ARRAY['Nalabana Bird Sanctuary', 'Mangalajodi Bird Village', 'Satapada Dolphin Viewpoint', 'Kalijai Island Temple', 'Barkul OTDC Water Sports']::TEXT[], ARRAY['Spotting endangered Irrawaddy dolphins at Satapada', 'Eco-boat birdwatching among migratory flocks in Mangalajodi wetlands', 'Visiting Kalijai island temple by motorized boat', 'Sampling fresh Chilika lake crab and tiger prawns']::TEXT[],
    'Taking a wooden silent punt boat through the reeds of Mangalajodi to photograph thousands of migratory wetland birds feeding within arm''s reach.', 'Beacon Island and Breakfast Island near Rambha, showcasing historical colonial stone pavilions surrounded by green lagoon waters and rocky hillocks.', 'October, November, December, January, February, March', 'May, June', 'November to February (migratory bird season)', 'May to August',
    1.5, 2.5, 3, 'Chilika is a vast brackish water coastal lagoon and Ramsar wetland on the Bay of Bengal coast, home to the rare Irrawaddy dolphin, over a million migratory birds in winter, peaceful island shrines, and rich coastal fishing communities.', 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
    'Odia, Hindi, English', 'Chilika lake crab kassa, freshwater jumbo prawn roast, fried fish, Odia dalma', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-163', 'Sundarbans Mangrove Biosphere', 'IN-WB', 'canning-sundarbans', 'South 24 Parganas', 'East India',
    22.15, 88.85, 3, 9.3, 'Moderate',
    ARRAY['UNESCO', 'Wildlife', 'Nature', 'Eco_tourism']::TEXT[], ARRAY['Sundarbans National Park', 'Sajnekhali Watchtower & Mangrove Interpretation Centre', 'Sudhanyakhali Watchtower', 'Dobanki Canopy Walk', 'Netidhopani Ruins', 'Jharkhali Tiger Rescue Centre']::TEXT[], ARRAY['Multi-day motorized boat safari through estuarine mangrove channels', 'Canopy walk suspended above mangrove forest floor at Dobanki', 'Wildlife watching for Royal Bengal Tigers, saltwater crocodiles, and spotted deer', 'Exploring honey-gatherer folklore and Bonbibi temple shrines']::TEXT[],
    'Gliding silently on a wooden safari boat through narrow tidal mangrove creeks while looking for Royal Bengal tigers and mudskippers in the world''s largest halophytic mangrove forest.', 'Burir Dabri watchtower on the Indo-Bangladesh border river channel featuring a mud-walk trail over mangrove breathing roots (pneumatophores).', 'October, November, December, January, February, March', 'May, June, July, August', 'November to February', 'May to August',
    2.0, 3.0, 4, 'Inscribed as a UNESCO World Heritage Site, the Sundarbans encompasses the world''s largest deltaic mangrove forest across the confluence of the Ganges, Brahmaputra, and Meghna rivers, famed for its swimming Royal Bengal Tigers, saltwater crocodiles, and rich estuarine biodiversity.', 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
    'Bengali, Hindi, English', 'Sundarbans fresh bhetki paturi, river prawn curry (chingri malai), pure wild mangrove honey, hot khichuri with ilish', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-164', 'Shantiniketan & Bolpur', 'IN-WB', 'bolpur-shantiniketan', 'Birbhum', 'East India',
    23.67, 87.72, 56, 9.1, 'Easy',
    ARRAY['UNESCO', 'Cultural', 'Heritage', 'Arts']::TEXT[], ARRAY['Visva-Bharati University Campus', 'Rabindra Bhavana & Museum (Uttarayan Complex)', 'Upasana Griha (Prayer Hall)', 'Kala Bhavana (Fine Arts)', 'Sonajhuri Forest Saturday Haat', 'Amar Kutir Crafts Complex']::TEXT[], ARRAY['Exploring UNESCO World Heritage open-air university campus', 'Browsing artisanal leather, kantha embroidery, and dokra crafts at Sonajhuri Haat', 'Listening to live Baul folk singers under the Sonajhuri forest canopy', 'Touring Tagore''s five heritage residences']::TEXT[],
    'Listening to the mystical ektara music of wandering Baul folk minstrels in the red-soil Sonajhuri forest during the lively Saturday afternoon tribal haat.', 'Kankalitala Temple (9 km away), a serene Shakti Peetha on the banks of the Kopai River with sacred bathing ponds and quiet village paths.', 'October, November, December, January, February, March', 'May, June', 'December (Poush Mela), March (Basanta Utsav), and November to February', 'May to August',
    1.5, 2.0, 3, 'Inscribed as a UNESCO World Heritage Site, Shantiniketan is the celebrated cultural sanctuary founded by Nobel Laureate Rabindranath Tagore in the red-soil heartland of Birbhum, renowned for its open-air educational ethos, Visva-Bharati university, vibrant Poush Mela, and Baul musical heritage.', 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80',
    'Bengali, Hindi, English', 'Traditional Bengali Rarh thali, Postor bora, Ilish bhapa, Mishti doi, Nolen gurer rosogolla, Sonajhuri street snacks', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-165', 'Kalimpong', 'IN-WB', 'kalimpong', 'Kalimpong', 'East India',
    27.0667, 88.4667, 1250, 8.8, 'Moderate',
    ARRAY['Hill_station', 'Himalayan', 'Monastery', 'Nature']::TEXT[], ARRAY['Deolo Hill Viewpoint', 'Durpin Monastery (Zang Dhok Palri Phodang)', 'Morgan House', 'Cactus & Orchid Nurseries (Pineview Nursery)', 'Dr. Graham''s Homes', 'Lava & Rishyap Forest Trails']::TEXT[], ARRAY['Viewing panoramic snow peaks of Mt. Kanchenjunga from Deolo Hill', 'Spinning prayer wheels and studying Tibetan murals at Durpin Monastery', 'Paragliding over Teesta river valleys', 'Visiting international award-winning exotic cactus gardens']::TEXT[],
    'Enjoying panoramic sunrise vistas of Mount Kanchenjunga reflected across the mist-shrouded Teesta river gorge from the high gardens of Deolo Hill.', 'Lava pine forest and Neora Valley National Park gateway (32 km away), home to red pandas, clouded leopards, and rich Himalayan birdlife.', 'September, October, November, December, January, February, March, April, May', 'July, August', 'October to December and March to May', 'July to August',
    1.5, 2.5, 4, 'Perched on a scenic ridge overlooking the Teesta River in the Eastern Himalayas, Kalimpong is famous for spectacular views of Mt. Kanchenjunga, historic Tibetan Buddhist monasteries, colonial stone mansions, exotic flower nurseries, and peaceful pine trails.', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    'Nepali, Bengali, Hindi, English, Tibetan', 'Kalimpong cheese (Himalayan Gouda), Steamed pork and veg momos, Thukpa, Churpee soup, Phagshapa', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-166', 'Nalanda & Rajgir', 'IN-BR', 'rajgir-nalanda', 'Nalanda', 'East India',
    25.1357, 85.4444, 73, 9.4, 'Easy',
    ARRAY['UNESCO', 'Buddhist', 'Heritage', 'Spiritual']::TEXT[], ARRAY['Nalanda Mahavihara Archaeological Ruins (UNESCO)', 'Nalanda Archaeological Museum', 'Vishwa Shanti Stupa (Rajgir Ropeway)', 'Gridhakuta (Vulture''s Peak)', 'Venuvana Monastery', 'Saptaparni Cave', 'Cyclopean Wall of Rajgir']::TEXT[], ARRAY['Exploring 5th-century red brick monastic university ruins', 'Riding the chairlift ropeway to Vishwa Shanti Stupa', 'Meditating at Gridhakuta peak where Lord Buddha delivered sermons', 'Inspecting ancient 2,500-year-old Cyclopean stone fortifications']::TEXT[],
    'Walking through the monumental red-brick excavated classrooms, monasteries, and grand votive stupas of Nalanda, the world''s most celebrated ancient seat of higher learning.', 'Saptaparni Cave on Vaibhava Hill, the historic venue of the First Buddhist Council held immediately after Lord Buddha''s Mahaparinirvana in 483 BCE.', 'October, November, December, January, February, March', 'May, June', 'November to February', 'May to August',
    1.5, 2.5, 3, 'Nalanda and Rajgir constitute the glorious ancient heartland of Magadha in Bihar. Nalanda is a UNESCO World Heritage Site representing the ancient monastic residential university that flourished from the 5th to 12th century, while Rajgir was the fortified royal capital of Emperor Bimbisara and a revered spiritual centre for Buddhism and Jainism.', 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    'Hindi, Magahi, English', 'Bihari Litti Chokha, Silao ka Khaja, Sattu Paratha, Thekua, Tilkut', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-167', 'Patna & Pataliputra Heritage', 'IN-BR', 'patna', 'Patna', 'East India',
    25.5941, 85.1376, 53, 9.0, 'Easy',
    ARRAY['Heritage', 'Spiritual', 'Historical', 'City_break']::TEXT[], ARRAY['Bihar Museum', 'Takht Sri Patna Sahib', 'Golghar', 'Patna Museum', 'Kumhrar (Ancient Mauryan Ruins)', 'Mahavir Mandir', 'Gandhi Ghat Ganga Aarti']::TEXT[], ARRAY['Exploring world-class artifacts at the landmark Bihar Museum', 'Visiting the birthplace of Guru Gobind Singh Ji at Takht Sri Patna Sahib', 'Viewing evening Ganga Aarti from Gandhi Ghat river promenade', 'Inspecting 80-pillared Mauryan hall ruins at Kumhrar']::TEXT[],
    'Viewing the exquisite 3rd-century BCE Didarganj Yakshi polished sandstone sculpture at the state-of-the-art Bihar Museum.', 'Kumhrar archaeological site preserving the excavated wooden palisades and monolithic polished stone pillar foundations of Emperor Ashoka''s Pataliputra royal assembly hall.', 'October, November, December, January, February, March', 'May, June', 'November to February (especially during Chhath Puja and Prakash Parv)', 'May to August',
    1.5, 2.0, 3, 'Patna, the ancient imperial capital of Pataliputra, sits gracefully along the holy River Ganga. It is a historical metropolis spanning three millennia of Indian history, from the Mauryan Empire of Chandragupta and Ashoka to the birthplace of the tenth Sikh Guru, Sri Guru Gobind Singh Ji.', 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80',
    'Hindi, Magahi, Bhojpuri, Maithili, English', 'Bihari Litti Chokha, Bihari Kebab, Sattu Sharbat, Anarsa, Balushahi, Pedakiya', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-168', 'Deoghar & Baidyanath Dham', 'IN-JH', 'deoghar', 'Deoghar', 'East India',
    24.4826, 86.7, 254, 9.1, 'Easy',
    ARRAY['Pilgrimage', 'Spiritual', 'Heritage', 'Nature']::TEXT[], ARRAY['Baba Baidyanath Jyotirlinga Temple', 'Naulakha Mandir', 'Trikuta Parvat (Trikut Hills & Ropeway)', 'Tapovan Caves', 'Nandan Pahar', 'Satsang Ashram']::TEXT[], ARRAY['Jyotirlinga darshan and holy water offering', 'Riding the Trikut Hills ropeway across three mountain peaks', 'Exploring rock-cut hermit caves at Tapovan', 'Walking temple pond promenades at Shivaganga']::TEXT[],
    'Visiting Baba Baidyanath Dham, one of the revered 12 Jyotirlingas, where millions of saffron-clad Kanwariyas bring holy Ganga water on foot during the sacred month of Shravan.', 'Trikut Pahar, a holy three-peaked hillock housing the hermitage of Sage Bamdev, offering panoramic views over the Santhal Parganas forest canopy.', 'October, November, December, January, February, March', 'May, June', 'July–August (Shravani Mela) and October to February', 'May to August',
    1.5, 2.0, 3, 'Deoghar (the ''Abode of Gods'') is a celebrated spiritual destination in Jharkhand, famous for the ancient Baba Baidyanath Jyotirlinga temple complex, the sacred Shravani Mela pilgrimage, the historic Naulakha Mandir, and the scenic ropeway of Trikuta Parvat.', 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    'Hindi, Khortha, Santhali, Bengali, English', 'Deoghar Peda, Tilkut, Litti Chokha, Dhuska with Ghugni, Malpua', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-169', 'Netarhat & Chotanagpur Plateau', 'IN-JH', 'netarhat', 'Latehar', 'East India',
    23.4833, 84.2667, 1128, 8.6, 'Moderate',
    ARRAY['Hill_station', 'Nature', 'Waterfall', 'Sunset_point']::TEXT[], ARRAY['Magnolia Sunset Point', 'Upper Ghaghri Waterfalls', 'Lower Ghaghri Waterfalls', 'Koel River Viewpoint', 'Lodh Falls (Burha Gagh)', 'Netarhat Pine Forest', 'Netarhat Residential School Campus']::TEXT[], ARRAY['Watching dramatic sunrises and sunsets from Magnolia Point', 'Trekking through dense chir pine and sal forests', 'Visiting Lodh Falls (highest waterfall in Jharkhand)', 'Camping on the high Chotanagpur pat plateau']::TEXT[],
    'Watching the sunset from Magnolia Point as the evening sun dips below the rolling blue mountain ranges of the Chotanagpur plateau.', 'Lodh Falls (Burha Gagh), dropping 143 metres in multiple tiers inside the deep Sal forests of Latehar (60 km from Netarhat).', 'October, November, December, January, February, March', 'May, June', 'November to February', 'April to June',
    1.5, 2.5, 3, 'Celebrated as the ''Queen of Chotanagpur'', Netarhat is an enchanting hill station situated at an altitude of 1,128 metres on a secluded laterite plateau in Jharkhand, famous for majestic sunrises, pine forests, pristine waterfalls, and cool mountain air.', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    'Hindi, Sadri, Oraon, Mundari, English', 'Jharkhandi Marua roti, Chilka Roti, Rugra mushroom curry, Bamboo shoot fry, Pitha', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-170', 'Jagdalpur & Kanger Valley', 'IN-CG', 'jagdalpur', 'Bastar', 'East India',
    19.074, 82.031, 552, 9.0, 'Moderate',
    ARRAY['National_park', 'Nature', 'Caves', 'Tribal_culture']::TEXT[], ARRAY['Kanger Valley National Park', 'Kutumsar Caves', 'Tirathgarh Waterfalls', 'Dandak & Kailash Caves', 'Bastar Palace (Jagdalpur)', 'Bastar Dhokra & Bell Metal Craft Villages', 'Anthropological Museum']::TEXT[], ARRAY['Exploring subterranean limestone karst caves with local forest guides', 'Swimming under the multi-tiered cascades of Tirathgarh Falls', 'Spotting the Bastar Hill Myna (state bird)', 'Visiting weekly tribal haats and watching lost-wax Dhokra bronze casting']::TEXT[],
    'Descending into the 330-metre subterranean chambers of Kutumsar Caves with solar lanterns to observe blind cave fish and prehistoric limestone stalactite pillars.', 'Dandak Caves inside Kanger Valley, filled with undisturbed natural crystal stalagmite formations and echoing limestone chambers.', 'October, November, December, January, February, March', 'May, June', 'October to February (especially during 75-day Bastar Dussehra)', 'May to August',
    2.0, 3.0, 4, 'Jagdalpur is the cultural capital of the legendary Bastar region, serving as the gateway to the biodiverse Kanger Valley National Park, the subterranean limestone formations of Kutumsar Caves, the cascading Tirathgarh Falls, and ancient indigenous tribal heritage.', 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
    'Hindi, Halbi, Gondi, Chhattisgarhi, English', 'Bastar Chaprah (red ant chutney), Mahua delicacies, Aamat bamboo stew, Bafauri, Chila', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
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
    'dest-171', 'Sirpur & Barnawapara', 'IN-CG', 'sirpur', 'Mahasamund', 'East India',
    21.3417, 82.1792, 260, 8.5, 'Moderate',
    ARRAY['Heritage', 'Archaeology', 'Buddhist', 'Wildlife']::TEXT[], ARRAY['Laxman Temple (7th-century Red Brick)', 'Surang Tila (1000-pillar Pyramid Complex)', 'Teevardev Buddhist Vihara', 'Gandheshwar Temple (Mahanadi River)', 'Barnawapara Wildlife Sanctuary', 'Sirpur Archaeological Museum']::TEXT[], ARRAY['Exploring 7th-century Gupta and Somavamshi red-brick temple engineering', 'Ascending the grand terrace steps of Surang Tila', 'Studying Buddhist viharas and stone monastery carvings', 'Jungle safari in Barnawapara sanctuary']::TEXT[],
    'Standing before the exquisite 7th-century red-brick carved doorway of Laxman Temple, one of the finest and best-preserved brick temples in all of India.', 'Surang Tila, a monumental stone temple complex built on a high stepped pyramidal platform with earthquake-resistant subterranean stone chambers.', 'October, November, December, January, February, March', 'May, June', 'January–February (Sirpur National Dance Festival) and October to February', 'April to June',
    1.5, 2.0, 3, 'Located on the banks of the sacred Mahanadi River, Sirpur was the ancient capital of the South Kosala kingdom. It is a major archaeological treasure trove boasting the 7th-century brick Laxman Temple, grand Buddhist monasteries, and the nearby biodiverse Barnawapara Wildlife Sanctuary.', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    'Chhattisgarhi, Hindi, English', 'Chhattisgarhi Fara (steamed rice dumplings), Bafauri, Dubki kadhi, Angakar roti, Thetari', TRUE
) ON CONFLICT (id) DO UPDATE SET
    destination_name = EXCLUDED.destination_name,
    city_id = EXCLUDED.city_id,
    state_id = EXCLUDED.state_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    description = EXCLUDED.description,
    is_active = TRUE;

-- 3. DESTINATION POINTS OF INTEREST (108 Verified POIs: 3 per Destination)
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-tirupati-venkateswara', 'Sri Venkateswara Swamy Temple (Tirumala)', 'dest-136', 'tirupati', 'Temple', 13.6833, 79.3472, 'Historic hilltop shrine dedicated to Lord Venkateswara atop the sacred seven hills of Tirumala.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-tirupati-kapila-theertham', 'Sri Kapila Theertham', 'dest-136', 'tirupati', 'Temple', 13.6521, 79.4267, 'Ancient Shiva temple and sacred mountain waterfall located at the base of the Tirumala foothills.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-tirupati-silathoranam', 'Silathoranam (Natural Rock Arch)', 'dest-136', 'tirupati', 'Geological', 13.689, 79.3495, 'Rare natural rock arch formation of geological significance situated on the Tirumala ridge.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-vizag-rk-beach', 'Ramakrishna Beach & INS Kursura', 'dest-137', 'visakhapatnam', 'Beach', 17.7126, 83.3324, 'Urban coastline featuring the preserved INS Kursura submarine museum and seaside promenade.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-vizag-kailasagiri', 'Kailasagiri Hilltop Park', 'dest-137', 'visakhapatnam', 'Viewpoint', 17.7492, 83.3421, 'Elevated hilltop park with panoramic sea views, giant Shiva-Parvati statues, and ropeway transit.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-vizag-rushikonda', 'Rushikonda Beach', 'dest-137', 'visakhapatnam', 'Beach', 17.7828, 83.3853, 'Certified Blue Flag beach surrounded by green hills, popular for swimming and seasonal water sports.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-gandikota-gorge', 'Pennar River Gorge & Viewpoint', 'dest-138', 'gandikota', 'Geological', 14.8144, 78.2862, 'Dramatic natural gorge carved by the Pennar River through red sandstone cliffs alongside Gandikota Fort.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-gandikota-madhavaraya', 'Madhavaraya Temple & Granary', 'dest-138', 'gandikota', 'Heritage', 14.8118, 78.2845, '16th-century Vijayanagara-era temple complex featuring a towering gopuram and carved stone pillars.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-belum-caves', 'Belum Caves', 'dest-138', 'gandikota', 'Caves', 15.1028, 78.1119, 'Extensive subterranean limestone cave network featuring natural stalactite and stalagmite formations.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-srisailam-mallikarjuna', 'Mallikarjuna Swamy Temple', 'dest-139', 'srisailam', 'Temple', 16.0747, 78.8682, 'Ancient fortified temple complex revered as both a Shiva Jyotirlinga and a Shakti Peetha shrine.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-srisailam-dam', 'Srisailam Dam Viewpoint', 'dest-139', 'srisailam', 'Scenic', 16.0867, 78.8972, 'Massive hydroelectric gravity dam spanning the deep Krishna River gorge in the Nallamala hills.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-srisailam-pathalaganga', 'Pathalaganga & Ropeway', 'dest-139', 'srisailam', 'Riverfront', 16.0833, 78.8711, 'Sacred river bathing ghat reached via mechanical ropeway descending 200 metres into the gorge.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-lepakshi-veerabhadra', 'Veerabhadra Temple & Hanging Pillar', 'dest-140', 'lepakshi', 'Temple', 13.8041, 77.6083, '16th-century Vijayanagara temple famous for its 70 carved stone pillars and architectural hanging column.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-lepakshi-nandi', 'Monolithic Lepakshi Nandi', 'dest-140', 'lepakshi', 'Monument', 13.803, 77.612, 'Colossal monolithic granite sculpture of Lord Shiva''s mount Nandi measuring 4.5 metres high and 8 metres long.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-lepakshi-nagalinga', 'Monolithic Multi-hooded Nagalinga', 'dest-140', 'lepakshi', 'Heritage', 13.8045, 77.608, 'Giant seven-hooded serpent carved from single granite rock shielding a black stone Shiva lingam.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-vijayawada-kanaka-durga', 'Kanaka Durga Temple', 'dest-141', 'vijayawada', 'Temple', 16.5167, 80.6078, 'Prominent hilltop temple dedicated to Goddess Durga situated on Indrakeeladri hill above the Krishna River.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-vijayawada-undavalli', 'Undavalli Rock-Cut Caves', 'dest-141', 'vijayawada', 'Caves', 16.4967, 80.5819, '4th–7th century monolithic four-tiered rock-cut cave monument featuring a colossal reclining Vishnu carving.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-amaravati-dhyana-buddha', 'Amaravati Dhyana Buddha & Stupa', 'dest-141', 'vijayawada', 'Buddhist', 16.5772, 80.3556, 'Historic Buddhist site on the Krishna River home to ancient Satavahana stupa ruins and a monumental Buddha statue.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-ramappa-temple', 'Ramappa Temple (Kakatiya Rudreshwara)', 'dest-142', 'palampet-mulugu', 'UNESCO', 18.2589, 79.9439, '13th-century UNESCO World Heritage Site temple built on a star-shaped platform with floating brick superstructure.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-ramappa-lake', 'Ramappa Lake & Boating', 'dest-142', 'palampet-mulugu', 'Lake', 18.253, 79.938, 'Magnificent Kakatiya-era earthen irrigation reservoir surrounded by forested hillocks.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-ghanpur-temples', 'Ghanpur Group of Temples (Kota Gullu)', 'dest-142', 'palampet-mulugu', 'Heritage', 18.312, 79.954, 'Ensemble of 22 ancient Kakatiya temple shrines showcasing intricate stone masonry and porticos.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-nsagar-dam', 'Nagarjuna Sagar Dam Viewpoint', 'dest-143', 'nagarjuna-sagar', 'Scenic', 16.5786, 79.3125, 'Monumental 124-metre-high masonry dam spanning the Krishna River with 26 crest gates.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-nsagar-konda', 'Nagarjunakonda Island Museum', 'dest-143', 'nagarjuna-sagar', 'Museum', 16.525, 79.245, 'Island archaeological museum preserving ancient Buddhist sculptures, stupa relics, and coins.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-nsagar-ethipothala', 'Ethipothala Falls', 'dest-143', 'nagarjuna-sagar', 'Waterfall', 16.5317, 79.3528, '70-foot multi-stream cascade on the Chandravanka stream with a crocodile breeding sanctuary at the base.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-bhadra-temple', 'Sri Sita Ramachandraswamy Temple', 'dest-144', 'bhadrachalam', 'Temple', 17.6689, 80.8936, 'Famous 17th-century Vaishnavite temple on the Godavari banks housing the enshrined murti of Sri Rama.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-bhadra-parnasala', 'Parnasala Heritage Site', 'dest-144', 'bhadrachalam', 'Heritage', 17.925, 80.887, 'Scenic riverfront location with ancient sculptures depicting episodes from the Ramayana forest exile.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-bhadra-godavari-ghat', 'Godavari River Bathing Ghats', 'dest-144', 'bhadrachalam', 'Riverfront', 17.666, 80.891, 'Wide stone steps descending into the Godavari River used for holy dips, evening aartis, and boat cruises.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-madurai-meenakshi', 'Meenakshi Sundareswarar Temple', 'dest-145', 'madurai', 'Temple', 9.9195, 78.1193, 'Ancient Dravidian temple complex featuring 14 magnificent gopurams, the Ashta Shakti Mandapam, and Hall of Thousand Pillars.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-madurai-nayak-palace', 'Thirumalai Nayakkar Mahal', 'dest-145', 'madurai', 'Palace', 9.915, 78.1239, '17th-century palace combining Dravidian and Rajput-Islamic architecture with massive stucco pillars.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-madurai-teppakulam', 'Vandiyur Mariamman Teppakulam', 'dest-145', 'madurai', 'Heritage', 9.91, 78.1519, 'Massive square temple tank with an island pavilion mandapam built by King Thirumalai Nayak.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-thanjavur-brihadisvara', 'Brihadisvara Temple (Big Temple)', 'dest-146', 'thanjavur', 'UNESCO', 10.7828, 79.1318, '11th-century UNESCO World Heritage granite masterpiece built by Emperor Raja Raja Chola I.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-thanjavur-palace', 'Thanjavur Maratha Palace Complex', 'dest-146', 'thanjavur', 'Palace', 10.7915, 79.1367, 'Royal palace featuring the 7-storey bell tower, Darbar halls, and royal arsenals.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-thanjavur-saraswathi-lib', 'Saraswathi Mahal Library', 'dest-146', 'thanjavur', 'Museum', 10.7918, 79.1362, 'One of the oldest libraries in Asia preserving rare palm-leaf and paper manuscripts in multiple Indian languages.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kodai-lake', 'Kodaikanal Lake & Promenade', 'dest-147', 'kodaikanal', 'Lake', 10.234, 77.485, 'Centuries-old man-made star-shaped lake surrounded by weeping willows, rowboats, and cycle pathways.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kodai-pillar-rocks', 'Pillar Rocks Viewpoint', 'dest-147', 'kodaikanal', 'Viewpoint', 10.21, 77.47, 'Trio of dramatic vertical granite boulders rising 122 metres high over the misty Palani valley.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kodai-coakers-walk', 'Coaker''s Walk & Bryant Park', 'dest-147', 'kodaikanal', 'Nature', 10.232, 77.495, 'One-kilometre scenic pedestrian path paved along the steep mountain ridge overlooking the southern plains.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kanchi-kailasanathar', 'Kailasanathar Temple', 'dest-148', 'kanchipuram', 'Heritage', 12.842, 79.69, 'Oldest structural temple in Kanchipuram built by Pallava King Rajasimha in early 8th century with intricate sandstone carvings.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kanchi-ekambareswarar', 'Ekambareswarar Temple', 'dest-148', 'kanchipuram', 'Temple', 12.847, 79.7, 'Monumental Shiva temple representing the Earth element (Prithvi Lingam) with a 59-metre-tall Rajagopuram.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kanchi-varadharaja', 'Varadharaja Perumal Temple', 'dest-148', 'kanchipuram', 'Temple', 12.819, 79.725, 'Major Divya Desam Vaishnavite temple famed for its 100-pillar mandapam carved from single stone blocks and underground gold/silver lizard reliefs.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-chettinad-palace', 'Kanadukathan Chettinad Palace', 'dest-149', 'chettinad-karaikudi', 'Palace', 10.15, 78.79, 'Magnificent 19th-century heritage mansion showcasing Burmese teak wood carvings, stained glass, and courtyards.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-athangudi-tiles', 'Athangudi Handmade Tile Studios', 'dest-149', 'chettinad-karaikudi', 'Crafts', 10.16, 78.74, 'Artisanal village where traditional decorative geometric and floral floor tiles are hand-cast from local sand and natural dyes.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-pillayarpatti-temple', 'Pillayarpatti Karpaga Vinayakar Temple', 'dest-149', 'chettinad-karaikudi', 'Temple', 10.12, 78.68, 'Ancient rock-cut cave temple dedicated to Lord Ganesha featuring a 6-foot bas-relief monolithic stone carving.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-badami-caves', 'Badami Rock-Cut Cave Temples', 'dest-150', 'badami', 'Heritage', 15.9189, 75.6766, 'Four 6th-century sandstone rock-cut cave temples dedicated to Shiva, Vishnu, and Jain Tirthankaras.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-pattadakal-unesco', 'Pattadakal UNESCO Group of Monuments', 'dest-150', 'badami', 'UNESCO', 15.948, 75.816, '7th–8th century UNESCO World Heritage sanctuary featuring a harmonious blend of Rekha-Nagara and Dravidian temple styles.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-aihole-durga', 'Aihole Durga Temple Complex', 'dest-150', 'badami', 'Architecture', 16.019, 75.882, '6th-century apsidal stone temple with an open pillared peristyle gallery and intricate friezes.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-belur-chennakeshava', 'Chennakeshava Temple (Belur)', 'dest-151', 'hassan', 'UNESCO', 13.1625, 75.8597, '12th-century Hoysala masterpiece dedicated to Vishnu, built over 103 years by King Vishnuvardhana.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-halebidu-hoysaleswara', 'Hoysaleswara Temple (Halebidu)', 'dest-151', 'hassan', 'UNESCO', 13.2133, 75.9944, 'Twin-shrine star-shaped soapstone temple celebrated for its endless bands of detailed narrative wall relief sculptures.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-shravanabelagola-gommata', 'Gommateshwara Monolith (Shravanabelagola)', 'dest-151', 'hassan', 'Heritage', 12.858, 76.485, 'Colossal 57-foot-tall monolithic granite statue of Bahubali carved in 981 CE atop Vindhyagiri hill.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-jog-falls-viewpoint', 'Jog Falls Main Viewpoint', 'dest-152', 'sagara-jogfalls', 'Waterfall', 14.2285, 74.8117, 'Direct viewpoint platform facing the 253-metre segmented four-fold cascade of the Sharavathi River.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-linganamakki-dam', 'Linganamakki Dam Reservoir', 'dest-152', 'sagara-jogfalls', 'Scenic', 14.195, 74.832, 'Sprawling reservoir dam spanning the Sharavathi River creating expansive inland island backwaters.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-honnemaradu', 'Honnemaradu Nature Camp', 'dest-152', 'sagara-jogfalls', 'Eco_tourism', 14.17, 74.86, 'Eco-tourism island haven on the backwaters popular for non-motorized watersports and wilderness camping.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-dandeli-kali-rafting', 'Kali River Rafting Base', 'dest-153', 'dandeli', 'Adventure', 15.25, 74.63, 'Main launching station for 9.5-km Grade 2 and 3 white water rafting on the Kali River.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-dandeli-syntheri', 'Syntheri Rocks Ravine', 'dest-153', 'dandeli', 'Geological', 15.21, 74.6, 'Dramatic 300-foot monolithic granite ravine carved by the Kaneri stream inside the deep forest.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-dandeli-sanctuary', 'Dandeli Wildlife Sanctuary', 'dest-153', 'dandeli', 'Wildlife', 15.23, 74.65, 'Protected moist deciduous forest sanctuary renowned as a prime habitat for the Great Indian Hornbill, black panthers, and elephants.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-udupi-krishna-matha', 'Sri Krishna Matha & Kanakana Kindi', 'dest-154', 'udupi', 'Temple', 13.3425, 74.7522, '13th-century Dvaita monastery and temple complex where Lord Krishna is worshipped through a silver-plated 9-hole window.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-udupi-st-marys', 'St. Mary''s Island Basalt Formations', 'dest-154', 'udupi', 'Geological', 13.379, 74.672, 'National Geological Monument featuring unique hexagonal columnar basaltic lava rock pillars in the Arabian Sea.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-udupi-malpe-beach', 'Malpe Beach & Sea Walkway', 'dest-154', 'udupi', 'Beach', 13.355, 74.698, 'Golden sand beach featuring a scenic sea walkway path projecting 450 metres into the ocean.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kochi-chinese-nets', 'Chinese Fishing Nets (Cheena Vala)', 'dest-155', 'kochi', 'Heritage', 9.968, 76.241, 'Cantilevered shore-operated fishing nets introduced by 14th-century Chinese traders lining the harbour entrance.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kochi-mattancherry-palace', 'Mattancherry Palace (Dutch Palace)', 'dest-155', 'kochi', 'Palace', 9.958, 76.259, '16th-century Portuguese-built palace showcasing central Kerala temple-style mural paintings of the Ramayana.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kochi-jew-synagogue', 'Paradesi Synagogue & Jew Town', 'dest-155', 'kochi', 'Heritage', 9.9575, 76.2595, 'Oldest active synagogue in the Commonwealth, established in 1568 with Belgian crystal chandeliers and Chinese hand-painted floor tiles.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-thekkady-periyar-lake', 'Periyar Lake Boat Safari', 'dest-156', 'thekkady', 'Wildlife', 9.466, 77.143, 'Artificial lake sanctuary within Periyar Tiger Reserve allowing viewing of wild elephants, sambar, and gaur along the banks.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-thekkady-spice-gardens', 'Kumily Spice Plantation Walk', 'dest-156', 'thekkady', 'Nature', 9.608, 77.168, 'Lush botanical plantation cultivating black pepper vines, green cardamom, cinnamon, clove, and vanilla.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-thekkady-kalari', 'Kadathanadan Kalari & Kathakali Centre', 'dest-156', 'thekkady', 'Cultural', 9.605, 77.166, 'Traditional cultural amphitheatre hosting nightly demonstrations of ancient Kalaripayattu martial arts and classical Kathakali dance.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kovalam-lighthouse-beach', 'Lighthouse Beach & Vizhinjam Lighthouse', 'dest-157', 'kovalam', 'Beach', 8.388, 76.979, 'Southernmost crescent beach named after the 30-metre striped lighthouse offering panoramic coastal vistas.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kovalam-hawah-beach', 'Hawah Beach (Eve''s Beach)', 'dest-157', 'kovalam', 'Beach', 8.396, 76.975, 'Picturesque central bay fringed by high palm groves, popular for morning catamaran boat rides with local fishermen.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kovalam-vizhinjam-caves', 'Vizhinjam Rock-Cut Cave Shrine', 'dest-157', 'kovalam', 'Heritage', 8.379, 77.002, '8th-century early Pandyan granite rock-cut cave cell housing unfinished sculpted panels of Lord Shiva.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-bekal-fort', 'Bekal Fort & Ramparts', 'dest-158', 'bekal', 'Coastal_fort', 12.393, 75.031, '17th-century keyhole-shaped coastal laterite fortress with ocean-facing bastions and central observation tower.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-bekal-beach-park', 'Bekal Fort Beach Walkway', 'dest-158', 'bekal', 'Beach', 12.398, 75.028, 'Expansive golden beach landscaped with illuminated walking pathways and coastal gardens.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-bekal-ananthapura', 'Ananthapura Lake Temple', 'dest-158', 'bekal', 'Temple', 12.584, 74.982, 'Ancient 9th-century Hindu temple situated in the middle of a rectangular freshwater lake in North Malabar.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-bbsr-lingaraj', 'Lingaraj Temple', 'dest-159', 'bhubaneswar', 'Temple', 20.2382, 85.8336, '11th-century monument of Kalinga architecture with a 55-metre stone tower dedicated to Harihara (Shiva-Vishnu).', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-bbsr-mukteswar', 'Mukteswar & Rajarani Temples', 'dest-159', 'bhubaneswar', 'Heritage', 20.242, 85.835, '10th-century Kalinga temple renowned for its carved arched torana gateway and miniature narrative reliefs.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-bbsr-udayagiri-caves', 'Udayagiri & Khandagiri Rock Caves', 'dest-159', 'bhubaneswar', 'Caves', 20.261, 85.787, '1st-century BCE rock-cut Jain monastic shelters featuring Hathigumpha Brahmi inscriptions of King Kharavela.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-puri-jagannath', 'Sri Jagannath Temple', 'dest-160', 'puri', 'Temple', 19.8048, 85.818, '12th-century Char Dham shrine dedicated to Lord Jagannath, Balabhadra, and Subhadra with a 65-metre tower.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-puri-golden-beach', 'Puri Golden Beach (Blue Flag)', 'dest-160', 'puri', 'Beach', 19.799, 85.828, 'Certified Blue Flag coastal stretch with clean golden sands, lifeguards, and beachside promenades.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-puri-raghurajpur', 'Raghurajpur Heritage Craft Village', 'dest-160', 'puri', 'Crafts', 19.882, 85.824, 'Living heritage village of master traditional artists specializing in Pattachitra paintings and Gotipua folk dance.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-konark-sun-temple', 'Konark Sun Temple (UNESCO)', 'dest-161', 'konark', 'UNESCO', 19.8876, 86.0945, '13th-century architectural marvel shaped as a colossal 24-wheeled stone chariot drawn by seven galloping horses.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-konark-chandrabhaga', 'Chandrabhaga Blue Flag Beach', 'dest-161', 'konark', 'Beach', 19.87, 86.11, 'Clean, expansive beach famous for sunrise viewpoints and sacred magha saptami gatherings.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-konark-museum', 'Konark Archaeological Museum', 'dest-161', 'konark', 'Museum', 19.891, 86.092, 'Four gallery museum preserving salvaged sandstone sculptures, celestial dancers, and historical architectural fragments.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-chilika-satapada', 'Satapada Dolphin Watching Base', 'dest-162', 'balugaon-chilika', 'Wildlife', 19.67, 85.43, 'Estuarine boat launch point for observing natural pods of endangered Irrawaddy dolphins and Sea Mouth.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-chilika-mangalajodi', 'Mangalajodi Birding Eco-Village', 'dest-162', 'balugaon-chilika', 'Eco_tourism', 19.92, 85.42, 'Community-managed wetland sanctuary hosting over 150 species of winter migratory birds.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-chilika-kalijai', 'Kalijai Island & Temple', 'dest-162', 'balugaon-chilika', 'Temple', 19.72, 85.25, 'Sacred island shrine in the heart of the lagoon dedicated to Goddess Kalijai, the guardian deity of local fishermen.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-sundarbans-sajnekhali', 'Sajnekhali Watchtower & Nature Centre', 'dest-163', 'canning-sundarbans', 'Wildlife', 22.12, 88.77, 'Forest headquarters with a crocodile pond, turtle hatchery, and high watchtower facing sweetwater ponds.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-sundarbans-sudhanyakhali', 'Sudhanyakhali Watchtower', 'dest-163', 'canning-sundarbans', 'Wildlife', 22.1, 88.8, 'Prominent observation watchtower overlooking an open sweetwater pond frequented by tigers, deer, and wild boars.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-sundarbans-dobanki', 'Dobanki Canopy Walkway', 'dest-163', 'canning-sundarbans', 'Nature', 22.05, 88.75, 'Half-kilometre elevated, caged canopy walkway offering bird''s-eye views over the dense mangrove canopy at 20 feet.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-shantiniketan-uttarayan', 'Uttarayan Complex & Rabindra Bhavana', 'dest-164', 'bolpur-shantiniketan', 'UNESCO', 23.678, 87.687, 'Tagore''s five heritage architectural homes (Udayan, Konark, Shyamali, Punashcha, Udichi) and memorial museum.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-shantiniketan-upasana', 'Upasana Griha (Prayer Hall)', 'dest-164', 'bolpur-shantiniketan', 'Heritage', 23.676, 87.689, 'Stunning 1863 prayer hall built with Belgian stained-glass panels and Belgian marble floors by Maharshi Debendranath Tagore.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-shantiniketan-sonajhuri', 'Sonajhuri Forest & Saturday Haat', 'dest-164', 'bolpur-shantiniketan', 'Cultural', 23.685, 87.665, 'Enchanting forest of acacia trees where tribal artisans, kantha embroiderers, and Baul musicians gather for weekly craft markets.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kalimpong-deolo', 'Deolo Hill Park & Viewpoint', 'dest-165', 'kalimpong', 'Viewpoint', 27.09, 88.48, 'Highest point in Kalimpong town (1,704 m) offering 360-degree vistas of Kanchenjunga, Relli valley, and Teesta river.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kalimpong-durpin', 'Durpin Monastery (Zang Dhok Palri)', 'dest-165', 'kalimpong', 'Monastery', 27.042, 88.455, 'Consecrated by the Dalai Lama in 1976, housing rare Tibetan Buddhist Kangyur scriptures and 3D mandalas.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kalimpong-morgan-house', 'Morgan House Heritage Lodge', 'dest-165', 'kalimpong', 'Heritage', 27.046, 88.459, 'Classic 1930s British stone colonial mansion set on rolling green golf courses overlooking mountain peaks.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-nalanda-ruins', 'Nalanda Mahavihara Archaeological Ruins', 'dest-166', 'rajgir-nalanda', 'UNESCO', 25.1357, 85.4444, 'UNESCO World Heritage Site containing the monumental red-brick excavated stupas, shrines, and viharas of ancient Nalanda University.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-rajgir-shanti-stupa', 'Vishwa Shanti Stupa & Ropeway', 'dest-166', 'rajgir-nalanda', 'Buddhist', 25.011, 85.433, 'Massive white marble peace pagoda atop Ratnagiri Hill accessed via India''s oldest scenic single-seater ropeway.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-rajgir-gridhakuta', 'Gridhakuta Peak (Vulture''s Peak)', 'dest-166', 'rajgir-nalanda', 'Spiritual', 25.013, 85.438, 'Sacred rocky summit where Lord Buddha spent months meditating and delivered the Lotus and Heart Sutras.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-patna-bihar-museum', 'Bihar Museum', 'dest-167', 'patna', 'Museum', 25.612, 85.118, 'World-class cultural museum complex showcasing over 2,000 years of regional history, Didarganj Yakshi, and Mauryan arts.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-patna-sahib', 'Takht Sri Patna Sahib', 'dest-167', 'patna', 'Spiritual', 25.594, 85.228, 'One of the five sacred Takhts of Sikhism, marking the birthplace of Guru Gobind Singh Ji on the banks of the Ganges.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-patna-golghar', 'Golghar Granary & Ganga Viewpoint', 'dest-167', 'patna', 'Heritage', 25.62, 85.143, 'Unique beehive-shaped 1786 colonial monolithic granary with spiral external stairways offering panoramic views over the Ganges.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-deoghar-baidyanath', 'Baba Baidyanath Jyotirlinga Temple', 'dest-168', 'deoghar', 'Temple', 24.4925, 86.7, 'Ancient stone temple complex housing one of the 12 sacred Jyotirlingas with 21 associated shrines.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-deoghar-trikut', 'Trikuta Parvat & Ropeway', 'dest-168', 'deoghar', 'Viewpoint', 24.5, 86.84, 'Three-peaked sacred hill (755 m) featuring a passenger cable car ropeway offering sweeping views of Santhal Parganas.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-deoghar-naulakha', 'Naulakha Mandir', 'dest-168', 'deoghar', 'Temple', 24.475, 86.715, '146-foot-tall Radha-Krishna temple built in 1940 resembling the Ramakrishna Belur Math architecture.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-netarhat-magnolia', 'Magnolia Sunset Point', 'dest-169', 'netarhat', 'Viewpoint', 23.475, 84.255, 'Iconic plateau cliff viewpoint famous for panoramic sunsets across the Vindhya–Satpura hill ranges.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-netarhat-upper-ghaghri', 'Upper Ghaghri Waterfall', 'dest-169', 'netarhat', 'Waterfall', 23.49, 84.27, 'Scenic waterfall cascading over rocky shelves inside a secluded pine and eucalyptus woodland 4 km from town.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-netarhat-koel-view', 'Koel River Valley Viewpoint', 'dest-169', 'netarhat', 'Scenic', 23.48, 84.26, 'High vantage point overlooking the serpentine course of the Koel River meandering through tribal valleys below.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kanger-kutumsar', 'Kutumsar Subterranean Karst Caves', 'dest-170', 'jagdalpur', 'Caves', 18.88, 81.95, '330-metre subterranean limestone cave system famed for stalactites, stalagmites, and blind cave fish.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-kanger-tirathgarh', 'Tirathgarh Multi-Tiered Falls', 'dest-170', 'jagdalpur', 'Waterfall', 18.91, 81.86, 'Magnificent 300-foot segmented cascade on the Kanger River tumbling over stepped rock ledges in the forest.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-jagdalpur-palace', 'Bastar Palace & Anthropological Museum', 'dest-170', 'jagdalpur', 'Heritage', 19.076, 82.035, 'Historic seat of the Bastar Bhanj royal dynasty and museum documenting indigenous tribal arts and lifestyle.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-sirpur-laxman-temple', 'Laxman Temple (7th-century Brick Shrine)', 'dest-171', 'sirpur', 'Heritage', 21.343, 82.177, '7th-century architectural masterpiece built of burnt red bricks featuring elaborate carved stone doorframes.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-sirpur-surang-tila', 'Surang Tila Temple Complex', 'dest-171', 'sirpur', 'Heritage', 21.346, 82.181, 'Magnificent temple complex perched on a 30-foot-high stepped terrace with 32 carved pillars and 5 Shiva lingams.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, characteristics, is_active) VALUES ('poi-sirpur-barnawapara', 'Barnawapara Wildlife Sanctuary', 'dest-171', 'sirpur', 'Wildlife', 21.4, 82.42, 'Sanctuary of teak and sal forests (25 km away) home to leopards, wild boars, sambar, chital, and over 150 bird species.', TRUE) ON CONFLICT (id) DO NOTHING;

-- 4. FAMOUS LOCAL FOODS (72 Authentic Regional Foods: 2 per Destination)
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-tirupati-laddu', 'dest-136', 'Tirupati Srivari Laddu Prasadam', 'Sacred gram flour, sugar, pure ghee, cashew, and cardamom sweet offering.', TRUE, 'Andhra Temple', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-tirupati-pulihora', 'dest-136', 'Andhra Temple Pulihora & Curd Rice', 'Tamarind and curry leaf seasoned rice paired with soothing tempered mustard curd rice.', TRUE, 'Andhra Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-vizag-chepala-pulusu', 'dest-137', 'Coastal Andhra Chepala Pulusu', 'Spicy and tangy tamarind-based sea fish curry cooked with traditional Andhra whole spices.', FALSE, 'Coastal Andhra', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-vizag-madugula-halwa', 'dest-137', 'Madugula Halwa', 'Centuries-old regional dessert prepared from wheat milk extract, pure ghee, dry fruits, and sugar.', TRUE, 'Andhra Sweet', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-gandikota-ragi-sankati', 'dest-138', 'Rayalaseema Ragi Sankati & Natu Kodi', 'Hearty steamed finger millet ball served with fiery country chicken gravy prepared with local spices.', FALSE, 'Rayalaseema', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-gandikota-uggani', 'dest-138', 'Rayalaseema Uggani with Mirchi Bajji', 'Seasoned puffed rice breakfast specialty tempered with roasted gram powder and green chilli fritters.', TRUE, 'Rayalaseema', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-srisailam-prasadam', 'dest-139', 'Srisailam Annam Prasadam & Ladoo', 'Temple prasadam comprising spiced sambar rice, sweet pongal, and pure ghee ladoo.', TRUE, 'Andhra Temple', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-srisailam-pesarattu', 'dest-139', 'Andhra Pesarattu Upma', 'Whole green gram crepe stuffed with savoury semolina upma, served with fresh ginger chutney.', TRUE, 'Andhra Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-lepakshi-jowar-roti', 'dest-140', 'Rayalaseema Jonnatte with Ennegayi', 'Rustic sorghum flatbread served with spicy stuffed baby brinjal gravy and groundnut chutney.', TRUE, 'Rayalaseema', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-lepakshi-bobbattu', 'dest-140', 'Ghee Bobbattu (Sweet Flatbread)', 'Traditional festive sweet flatbread filled with sweet lentil and jaggery paste roasted in desi ghee.', TRUE, 'Andhra Sweet', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-vijayawada-punugulu', 'dest-141', 'Vijayawada Crispy Punugulu', 'Iconic street-food snack made from fermented rice-lentil batter fried golden and served with fiery peanut and ginger chutney.', TRUE, 'Andhra Street Food', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-vijayawada-ulavacharu', 'dest-141', 'Andhra Ulavacharu Biryani', 'Slow-cooked horsegram reduction layered with spiced fragrant rice and caramelized shallots.', TRUE, 'Andhra Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-ramappa-sarva-pindi', 'dest-142', 'Telangana Sarva Pindi', 'Savory crispy skillet pancake made with rice flour, crushed peanuts, chana dal, sesame seeds, and curry leaves.', TRUE, 'Telangana Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-ramappa-pacchi-pulusu', 'dest-142', 'Telangana Pacchi Pulusu & Rice', 'Raw uncooked tamarind rasam infused with roasted green chillies, spring onions, and fresh coriander.', TRUE, 'Telangana Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-nsagar-fish-fry', 'dest-143', 'Krishna River Spiced Fish Fry', 'Freshly caught river catch marinated in stone-ground Telangana spices and shallow fried crisp.', FALSE, 'Telangana Riverine', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-nsagar-jowar-roti', 'dest-143', 'Telangana Jonna Rotte with Gongura', 'Hand-patted roasted sorghum flatbread served with fiery tangy sorrel leaf chutney.', TRUE, 'Telangana Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-bhadra-laddu', 'dest-144', 'Bhadrachalam Devasthanam Prasadam', 'Traditional sanctified offering of pure ghee besan laddu and tamarind pulihora.', TRUE, 'Telangana Temple', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-bhadra-meals', 'dest-144', 'Godavari Traditional Thali', 'Traditional South Indian rice platter featuring spicy rasam, bendakaya vepudu, and sweet payasam.', TRUE, 'Telangana Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-madurai-jigarthanda', 'dest-145', 'Authentic Madurai Famous Jigarthanda', 'Iconic cooling beverage made with almond gum (badam pisin), nannari root syrup, condensed milk, and basundi ice cream.', TRUE, 'Madurai Beverage', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-madurai-bun-parotta', 'dest-145', 'Madurai Crispy Bun Parotta & Salna', 'Multi-layered, fluffy golden parotta shaped like a bakery bun, paired with aromatic spicy country chicken salna.', FALSE, 'Madurai Street Food', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-thanjavur-ashoka-halwa', 'dest-146', 'Thanjavur Ashoka Halwa', 'Silky smooth dessert prepared from roasted yellow moong dal, sugar, cardamom, and ghee, garnished with fried cashews.', TRUE, 'Tamil Sweet', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-thanjavur-filter-coffee', 'dest-146', 'Kumbakonam / Tanjore Degree Coffee', 'Freshly brewed chicory-blended decoction frothed with boiling pure cow milk in traditional brass dabarah and tumbler.', TRUE, 'Tamil Beverage', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-kodai-chocolates', 'dest-147', 'Artisanal Homemade Kodai Chocolates', 'Rich handcrafted dark and milk chocolates blended with roasted almonds, raisins, and mint.', TRUE, 'Hill Station Specialty', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-kodai-tibetan-momos', 'dest-147', 'Piping Hot Steamed Hill Momos', 'Steamed vegetable or chicken dumplings served with spicy garlic-red chilli dipping sauce in the mountain cold.', FALSE, 'Hill Street Food', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-kanchi-idli', 'dest-148', 'Authentic Kanchipuram Kovil Idli', 'Traditional cylindrical spiced idli steamed in dried Bauhinia leaves seasoned with black pepper, cumin, ginger, and ghee.', TRUE, 'Tamil Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-kanchi-puliyodharai', 'dest-148', 'Temple Puliyodharai & Sakkarai Pongal', 'Aromatic tamarind rice seasoned with fenugreek and roasted peanuts paired with jaggery ghee sweet pongal.', TRUE, 'Tamil Temple', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-chettinad-chicken', 'dest-149', 'Authentic Chettinad Chicken Masala', 'Spicy aromatic curry prepared with freshly roasted stone-ground spices including star anise, kalpasi, and peppercorns.', FALSE, 'Chettinad Cuisine', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-chettinad-paniyaram', 'dest-149', 'Kuzhi Paniyaram & Vellai Paniyaram', 'Golden fermented rice-dal dumplings cooked in cast-iron moulds, served with fiery tomato and spicy garlic chutney.', TRUE, 'Chettinad Snack', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-badami-jowar-rotti', 'dest-150', 'North Karnataka Jowar Rotti Oota', 'Unleavened crispy sorghum flatbread served with stuffed spicy brinjal (enne gai), pulse curry, and peanut chutney powder.', TRUE, 'North Karnataka', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-badami-peda', 'dest-150', 'Dharwad / Badami Milk Peda', 'Traditional caramelized condensed milk confection rolled in castor sugar crystals.', TRUE, 'Karnataka Sweet', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-belur-akki-rotti', 'dest-151', 'Karnataka Akki Rotti with Coconut Chutney', 'Crisp, fragrant rice flour flatbread kneaded with grated coconut, onions, and dill leaves.', TRUE, 'Karnataka Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-belur-bisi-bele-bath', 'dest-151', 'Mysore Bisi Bele Bath', 'Spiced hot lentil-rice porridge cooked with vegetables, tamarind, and aromatic freshly ground spice blend.', TRUE, 'Karnataka Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-jog-malnad-kadabu', 'dest-152', 'Malnad Steamed Jackfruit Kadabu', 'Fragrant steamed rice and sweet wild jackfruit cakes wrapped in teak leaves, served with fresh coconut milk.', TRUE, 'Malnad Cuisine', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-jog-neer-dosa', 'dest-152', 'Malnad Neer Dosa with Ghasghase Payasa', 'Paper-thin delicate rice crepes paired with aromatic poppy-seed and jaggery dessert.', TRUE, 'Karnataka Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-dandeli-bamboo-sukka', 'dest-153', 'Forest Bamboo Shoot Sukka', 'Tender wild forest bamboo shoots cooked dry with grated coconut, roasted spices, and curry leaves.', TRUE, 'Tribal / Forest', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-dandeli-fish-curry', 'dest-153', 'North Canara Spiced Fish Curry', 'Freshwater catch simmered in a coconut milk and kokum-infused golden gravy, served with hot rice.', FALSE, 'Coastal Karnataka', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-udupi-saaru-thali', 'dest-154', 'Authentic Udupi Brahmin Pure Veg Thali', 'Traditional meal served on plantain leaves featuring menasinkai saaru, kootu, kosambari, payasa, and fresh rasam without onion or garlic.', TRUE, 'Udupi Cuisine', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-udupi-goli-baje', 'dest-154', 'Crispy Mangalore / Udupi Goli Baje', 'Fluffy fried dumplings prepared from sour curd, flour, ginger, curry leaves, and green chillies.', TRUE, 'Udupi Snack', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-kochi-karimeen-pollichathu', 'dest-155', 'Kerala Karimeen Pollichathu', 'Pearl spot fish marinated in shallots, ginger, green chillies, and kokum, wrapped in banana leaf and slow-roasted on a griddle.', FALSE, 'Kerala Seafood', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-kochi-appam-stew', 'dest-155', 'Kerala Appam with Vegetable / Chicken Stew', 'Soft fermented rice hopper with a spongy centre served with creamy coconut milk vegetable stew.', TRUE, 'Kerala Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-thekkady-kappa-fish', 'dest-156', 'Kerala Kappa Meen Curry', 'Boiled and tempered tapioca roots served with fiery red Malabar fish curry prepared with kudampuli (pot tamarind).', FALSE, 'Kerala Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-thekkady-cardamom-chai', 'dest-156', 'Cardamom Hills Spiced Tea', 'Freshly brewed mountain tea infused with crushed fresh green cardamom, ginger, and cloves from local estates.', TRUE, 'Hill Beverage', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-kovalam-fish-moilee', 'dest-157', 'Kerala Coastal Fish Moilee', 'Tender kingfish fillet gently poached in a creamy coconut milk broth with green chillies, curry leaves, and ginger.', FALSE, 'Kerala Seafood', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-kovalam-prawn-roast', 'dest-157', 'Travancore Prawn Pepper Roast', 'Succulent Arabian Sea prawns pan-roasted with shallots, crushed black pepper, garlic, and curry leaves.', FALSE, 'Kerala Seafood', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-bekal-thalassery-biryani', 'dest-158', 'Malabar / Thalassery Dum Biryani', 'Aromatic short-grain Kaima rice cooked with tender marinated chicken, ghee, fried onions, cashews, and raisins.', FALSE, 'Malabar Cuisine', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-bekal-kallummakkaya', 'dest-158', 'Malabar Stuffed Mussels (Arikadukka)', 'Fresh sea mussels stuffed with seasoned spiced rice paste and shallow-fried golden in coconut oil.', FALSE, 'Malabar Snack', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-bbsr-chhena-poda', 'dest-159', 'Odisha Chhena Poda', 'Caramelized baked dessert made with fresh cottage cheese, sugar, cardamom, and cashew nuts, wrapped in sal leaves and slow-baked.', TRUE, 'Odia Sweet', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-bbsr-dahibara', 'dest-159', 'Cuttack–Bhubaneswar Dahibara Aloodum', 'Soft lentil vadas soaked in tempered buttermilk served with spicy potato curry and ghugni pea gravy.', TRUE, 'Odia Street Food', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-puri-khaja', 'dest-160', 'Puri Jagannath Khaja', 'Layered, crispy golden sweet fritter made of refined flour and coated in caramelized sugar syrup.', TRUE, 'Odia Sweet', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-puri-mahaprasad', 'dest-160', 'Sacred Jagannath Mahaprasad', 'Traditional 56-offering feast cooked in earthen pots including Kanika sweet rice, Dalma, Besara, and Sweet Rice.', TRUE, 'Odia Temple', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-konark-chhena-jhili', 'dest-161', 'Nimapada Chhena Jhili', 'Fresh cottage cheese patties fried golden in ghee and dipped in a light, cardamom-infused sugar syrup.', TRUE, 'Odia Sweet', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-konark-prawn-curry', 'dest-161', 'Coastal Odia Chingudi Kassa', 'Fresh coastal tiger prawns cooked in a spicy onion-ginger-garlic gravy with roasted garam masala.', FALSE, 'Odia Seafood', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-chilika-crab', 'dest-162', 'Chilika Jumbo Crab Kassa', 'Giant freshwater lagoon crabs braised in an intensely aromatic onion, garlic, mustard, and green cardamom gravy.', FALSE, 'Odia Seafood', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-chilika-prawns', 'dest-162', 'Chilika Tiger Prawn Fry', 'Freshly caught tiger prawns spiced with turmeric, crushed red chilli, and pan-seared with curry leaves.', FALSE, 'Odia Seafood', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-sundarbans-bhetki-paturi', 'dest-163', 'Sundarbans Bhetki Paturi', 'Fresh estuary bhetki fish coated in stone-ground mustard paste, wrapped in banana leaf and pan-steamed.', FALSE, 'Bengali Cuisine', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-sundarbans-chingri-malai', 'dest-163', 'Chingri Malai Curry', 'Fresh delta river prawns simmered in a silky coconut milk gravy with mild green chillies and whole garam masala.', FALSE, 'Bengali Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-shantiniketan-posto-bora', 'dest-164', 'Rarh Postor Bora & Rice', 'Crispy pan-fried fritters prepared from freshly ground poppy seed paste, green chillies, and onions.', TRUE, 'Bengali Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-shantiniketan-nolen-gur', 'dest-164', 'Nolen Gurer Sandesh', 'Seasonal winter cottage cheese confection flavored with fresh fragrant date-palm jaggery.', TRUE, 'Bengali Sweet', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-kalimpong-cheese', 'dest-165', 'Kalimpong Artisanal Himalayan Cheese & Lollipops', 'Locally cured semi-hard cow''s milk Gouda cheese and chewy dried yak cheese (Churpee).', TRUE, 'Himalayan Dairy', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-kalimpong-thukpa', 'dest-165', 'Tibetan Gyathuk / Thukpa', 'Piping hot hearty noodle broth prepared with fresh mountain greens, egg noodles, ginger, and roasted chilli oil.', TRUE, 'Tibetan / Hill', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-nalanda-silao-khaja', 'dest-166', 'GI-Tagged Silao Khaja', 'Centuries-old crispy multi-layered golden pastry prepared from wheat flour, ghee, and sugar syrup between Nalanda and Rajgir.', TRUE, 'Bihari Sweet', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-nalanda-litti-chokha', 'dest-166', 'Authentic Bihari Litti Chokha', 'Woodfire-baked whole wheat balls stuffed with spiced sattu (roasted gram flour), dipped in pure desi ghee and served with roasted eggplant and tomato mash.', TRUE, 'Bihari Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-patna-sattu-sharbat', 'dest-167', 'Patna Masala Sattu Sharbat', 'Wholesome roasted gram flour drink blended with chilled water, black salt, roasted cumin, lemon juice, and green chillies.', TRUE, 'Bihari Beverage', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-patna-anarsa', 'dest-167', 'Bihari Ghee Anarsa', 'Traditional festive delicacy made of soaked rice flour, jaggery, and sesame seeds deep fried in pure ghee.', TRUE, 'Bihari Sweet', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-deoghar-peda', 'dest-168', 'Famous Deoghar Milk Peda', 'Traditional fudge sweet made with slow-roasted caramelized mawa (khoya), pure cow milk, and cardamom.', TRUE, 'Jharkhand Sweet', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-deoghar-dhuska', 'dest-168', 'Jharkhandi Dhuska with Chana Ghugni', 'Deep-fried savory rice-chana dal fritters served hot with spicy black chickpea curry and green chutney.', TRUE, 'Jharkhand Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-netarhat-rugra', 'dest-169', 'Jharkhandi Rugra / Putu Curry', 'Indigenous wild edible puffball mushroom gathered from sal forest floors, cooked in a spicy rustic garlic gravy.', TRUE, 'Tribal Cuisine', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-netarhat-marua-roti', 'dest-169', 'Marua Roti with Saag', 'Wholesome finger millet flatbread paired with stir-fried wild forest greens and roasted red chilli chutney.', TRUE, 'Jharkhand Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-bastar-aamat', 'dest-170', 'Bastar Aamat (Bamboo Forest Stew)', 'Traditional indigenous mixed vegetable soup slow-simmered with bamboo shoots and tempered in garlic and mustard.', TRUE, 'Bastar Tribal', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-bastar-chila', 'dest-170', 'Chhattisgarhi Rice Chila with Tomato Chutney', 'Thin savory crepes prepared from rice batter, seasoned with cumin, and served with spicy roasted tomato-garlic dip.', TRUE, 'Chhattisgarhi Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-sirpur-fara', 'dest-171', 'Chhattisgarhi Rice Fara / Muthiya', 'Steamed or pan-fried savory rice flour dumplings seasoned with mustard seeds, sesame, and green chillies.', TRUE, 'Chhattisgarhi Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO famous_foods (id, destination_id, dish_name, description, is_vegetarian, cuisine_type, source_type) VALUES ('food-sirpur-bafauri', 'dest-171', 'Chana Dal Bafauri with Mint Chutney', 'Healthy steamed spiced chana dal dumplings, an oil-free traditional regional delicacy.', TRUE, 'Chhattisgarhi Traditional', 'OFFICIAL') ON CONFLICT (id) DO NOTHING;

-- 5. DESTINATION TRANSPORT CONNECTIVITY (72 Verified Routes: 2 per Destination)
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-tirupati-rail', 'dest-136', 'RAILWAY', 'Tirupati Main Railway Station (TPTY)', 1.5, 'Major South Coast railway junction connected by daily express trains from all major Indian metros.', 'ESTIMATED', 400, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-tirupati-air', 'dest-136', 'AIRPORT', 'Tirupati International Airport (TIR)', 15.0, 'Domestic airport with scheduled daily flights from Bengaluru, Hyderabad, Chennai, and New Delhi.', 'ESTIMATED', 3200, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-vizag-air', 'dest-137', 'AIRPORT', 'Visakhapatnam International Airport (VTZ)', 8.0, 'Major coastal airport offering flights to Singapore, Kuala Lumpur, and all key domestic hubs.', 'ESTIMATED', 3500, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-vizag-rail', 'dest-137', 'RAILWAY', 'Visakhapatnam Junction (VSKP)', 2.0, 'Major A1 railway terminal connected to Chennai, Kolkata, Hyderabad, and Delhi main lines.', 'ESTIMATED', 450, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-gandikota-rail', 'dest-138', 'RAILWAY', 'Jammalamadugu Railway Station (JMDG)', 18.0, 'Nearest railway station with passenger and express connectivity; cabs available to the fort.', 'ESTIMATED', 150, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-gandikota-road', 'dest-138', 'BUS_ROAD', 'NH 67 Kadapa–Jammalamadugu Route', 80.0, 'State and national highway access from Kadapa (80 km) and Bengaluru (280 km).', 'ESTIMATED', 350, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-srisailam-rail', 'dest-139', 'RAILWAY', 'Markapur Road Railway Station (MRK)', 85.0, 'Nearest rail connection on Guntur–Hubballi line with connecting buses and taxis to Srisailam.', 'ESTIMATED', 250, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-srisailam-road', 'dest-139', 'BUS_ROAD', 'Nallamala Ghat Road (NH 765)', 215.0, 'Well-maintained highway connecting Hyderabad (215 km) through the scenic Nallamala forest checkposts.', 'ESTIMATED', 600, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-lepakshi-rail', 'dest-140', 'RAILWAY', 'Hindupur Railway Station (HUP)', 14.0, 'Nearby railway station on the Bengaluru–Dharmavaram line with regular express train connections.', 'ESTIMATED', 50, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-lepakshi-road', 'dest-140', 'BUS_ROAD', 'NH 44 (Bengaluru–Hyderabad Highway)', 120.0, 'Direct 2.5-hour drive from Bengaluru International Airport via 6-lane NH 44 and Kodikonda checkpost.', 'ESTIMATED', 300, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-vijayawada-rail', 'dest-141', 'RAILWAY', 'Vijayawada Junction (BZA)', 1.0, 'One of India''s largest railway junctions connecting North, South, East, and West trunk lines.', 'ESTIMATED', 350, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-vijayawada-air', 'dest-141', 'AIRPORT', 'Vijayawada International Airport (VGA)', 18.0, 'Modern domestic airport at Gannavaram with daily connections to Hyderabad, Bengaluru, Delhi, and Chennai.', 'ESTIMATED', 3000, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-ramappa-rail', 'dest-142', 'RAILWAY', 'Kazipet / Warangal Junction', 65.0, 'Major railway node connecting Hyderabad, Delhi, and Chennai with direct bus and taxi access to Palampet.', 'ESTIMATED', 250, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-ramappa-road', 'dest-142', 'BUS_ROAD', 'Warangal–Mulugu–Palampet Highway (NH 163)', 68.0, 'Scenic 1.5-hour highway drive from Warangal city through rustic Telangana countryside.', 'ESTIMATED', 150, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-nsagar-rail', 'dest-143', 'RAILWAY', 'Macherla Railway Station (MCLA)', 24.0, 'Branch railway line connected to Guntur and Secunderabad with regular passenger trains.', 'ESTIMATED', 80, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-nsagar-road', 'dest-143', 'BUS_ROAD', 'Hyderabad–Nagarjuna Sagar Highway', 150.0, 'Direct 3-hour drive from Hyderabad (150 km) along well-paved state highway.', 'ESTIMATED', 450, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-bhadra-rail', 'dest-144', 'RAILWAY', 'Bhadrachalam Road Railway Station (BDCR)', 40.0, 'Railhead located at Kothagudem with daily trains from Hyderabad and Vijayawada.', 'ESTIMATED', 150, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-bhadra-road', 'dest-144', 'BUS_ROAD', 'Hyderabad–Khammam–Bhadrachalam Route', 310.0, 'Direct overnight and day bus connectivity from Hyderabad, Warangal, and Vijayawada.', 'ESTIMATED', 450, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-madurai-air', 'dest-145', 'AIRPORT', 'Madurai International Airport (IXM)', 12.0, 'Major international airport connecting Colombo, Dubai, Singapore, and all major Indian metros.', 'ESTIMATED', 3200, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-madurai-rail', 'dest-145', 'RAILWAY', 'Madurai Junction (MDU)', 1.0, 'A1 railway junction with Vande Bharat Express and superfast trains connecting Chennai, Bengaluru, and Kanyakumari.', 'ESTIMATED', 400, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-thanjavur-rail', 'dest-146', 'RAILWAY', 'Thanjavur Junction (TJ)', 1.0, 'Well-connected railway station on the Southern Railway network with regular express trains to Chennai, Tiruchirappalli, and Madurai.', 'ESTIMATED', 250, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-thanjavur-air', 'dest-146', 'AIRPORT', 'Tiruchirappalli International Airport (TRZ)', 55.0, 'Closest international airport (55 km away via 4-lane NH 83) with direct flights to Singapore, Dubai, and Chennai.', 'ESTIMATED', 1500, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-kodai-rail', 'dest-147', 'RAILWAY', 'Kodai Road Railway Station (KQN)', 80.0, 'Nearest rail connection on the Dindigul–Madurai line with connecting taxis climbing the ghat road.', 'ESTIMATED', 300, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-kodai-road', 'dest-147', 'BUS_ROAD', 'Batlagundu–Kodaikanal Ghat Road (SH 156)', 120.0, 'Scenic 3.5-hour mountain ascent from Madurai Airport via well-engineered ghat roads.', 'ESTIMATED', 2200, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-kanchi-rail', 'dest-148', 'RAILWAY', 'Kanchipuram Railway Station (CJ)', 1.0, 'Railway station on the Arakkonam–Chengalpattu line with suburban and passenger train connectivity to Chennai.', 'ESTIMATED', 50, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-kanchi-road', 'dest-148', 'BUS_ROAD', 'Bengaluru–Chennai Highway (NH 48)', 75.0, 'Rapid 1.5-hour highway drive from Chennai International Airport via 6-lane NH 48.', 'ESTIMATED', 250, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-chettinad-rail', 'dest-149', 'RAILWAY', 'Karaikkudi Junction (KKDI)', 1.0, 'Direct broad-gauge rail junction connected to Chennai, Madurai, Tiruchirappalli, and Rameswaram.', 'ESTIMATED', 250, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-chettinad-road', 'dest-149', 'BUS_ROAD', 'Tiruchirappalli–Karaikudi Highway (NH 336)', 85.0, 'Smooth 1.5-hour highway drive from Tiruchirappalli International Airport.', 'ESTIMATED', 1800, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-badami-rail', 'dest-150', 'RAILWAY', 'Badami Railway Station (BDM)', 5.0, 'Railway station on the Hubballi–Gadag–Solapur line with direct train connections from Bengaluru, Mumbai, and Hyderabad.', 'ESTIMATED', 300, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-badami-road', 'dest-150', 'BUS_ROAD', 'Hubballi–Bagalkot Highway', 105.0, 'Smooth 2.5-hour highway drive from Hubballi Airport (105 km).', 'ESTIMATED', 2200, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-belur-rail', 'dest-151', 'RAILWAY', 'Hassan Junction (HAS)', 38.0, 'Major rail junction with direct express trains connecting Bengaluru, Mysuru, and Mangaluru.', 'ESTIMATED', 200, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-belur-road', 'dest-151', 'BUS_ROAD', 'Bengaluru–Hassan–Belur Highway (NH 75)', 220.0, 'Smooth 4-lane expressway from Bengaluru (approx. 4 hours drive).', 'ESTIMATED', 500, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-jog-rail', 'dest-152', 'RAILWAY', 'Talguppa Railway Station (TLGP)', 14.0, 'Terminal railway station 14 km from the falls with daily express train connections to Bengaluru and Mysuru.', 'ESTIMATED', 100, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-jog-road', 'dest-152', 'BUS_ROAD', 'Bengaluru–Shivamogga–Sagara Highway (NH 69)', 375.0, 'Scenic highway drive through the Malnad region from Bengaluru (375 km) or Mangaluru (180 km).', 'ESTIMATED', 600, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-dandeli-rail', 'dest-153', 'RAILWAY', 'Alnavar Junction (LWR)', 32.0, 'Nearest railway junction on the Hubballi–Goa line with connecting taxi services to Dandeli.', 'ESTIMATED', 150, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-dandeli-road', 'dest-153', 'BUS_ROAD', 'Hubballi–Dharwad–Dandeli Road', 75.0, 'Scenic 2-hour drive from Hubballi Airport (75 km) or Goa International Airport (130 km).', 'ESTIMATED', 1600, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-udupi-rail', 'dest-154', 'RAILWAY', 'Udupi Railway Station (UD)', 3.0, 'Key station on the Konkan Railway network with daily Vande Bharat, Rajdhani, and express trains.', 'ESTIMATED', 350, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-udupi-air', 'dest-154', 'AIRPORT', 'Mangaluru International Airport (IXE)', 55.0, 'Closest international airport (55 km via 4-lane NH 66) with connections to Mumbai, Bengaluru, and the Middle East.', 'ESTIMATED', 1500, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-kochi-air', 'dest-155', 'AIRPORT', 'Cochin International Airport (COK)', 36.0, 'First fully solar-powered airport in the world with extensive international and domestic flights.', 'ESTIMATED', 3200, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-kochi-rail', 'dest-155', 'RAILWAY', 'Ernakulam Junction (ERS)', 10.0, 'Major South Railway junction connected to all parts of India with Water Metro and road taxi access to Fort Kochi.', 'ESTIMATED', 350, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-thekkady-rail', 'dest-156', 'RAILWAY', 'Kottayam Railway Station (KTYM)', 108.0, 'Mainline railway station in Kerala with buses and taxis climbing the rubber-spice ghat road.', 'ESTIMATED', 400, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-thekkady-road', 'dest-156', 'BUS_ROAD', 'Kollam–Theni Highway (NH 183)', 140.0, 'Scenic 3.5-hour mountain drive through tea and cardamom hills from Madurai (140 km) or Kochi (155 km).', 'ESTIMATED', 3200, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-kovalam-air', 'dest-157', 'AIRPORT', 'Thiruvananthapuram International Airport (TRV)', 14.0, 'Direct airport access just 25 minutes from the beach connecting Middle East and Indian metros.', 'ESTIMATED', 3000, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-kovalam-rail', 'dest-157', 'RAILWAY', 'Thiruvananthapuram Central (TVC)', 15.0, 'Major rail terminus in Kerala with daily Rajdhani and express trains; pre-paid taxis take ~30 mins.', 'ESTIMATED', 450, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-bekal-rail', 'dest-158', 'RAILWAY', 'Kasaragod / Kanhangad Railway Station', 12.0, 'Regular express trains on the Mangaluru–Kozhikode mainline stop at nearby Kanhangad and Kasaragod.', 'ESTIMATED', 200, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-bekal-air', 'dest-158', 'AIRPORT', 'Mangaluru International Airport (IXE)', 72.0, 'Closest airport (72 km north) offering daily flights to Mumbai, Bengaluru, Chennai, and Gulf destinations.', 'ESTIMATED', 2000, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-bbsr-air', 'dest-159', 'AIRPORT', 'Biju Patnaik International Airport (BBI)', 4.0, 'Principal airport with daily flights connecting all major Indian metros and direct flights to Dubai and Bangkok.', 'ESTIMATED', 3500, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-bbsr-rail', 'dest-159', 'RAILWAY', 'Bhubaneswar Railway Station (BBS)', 1.0, 'Major East Coast railway hub on the Howrah–Chennai mainline served by Vande Bharat and Rajdhani trains.', 'ESTIMATED', 400, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-puri-rail', 'dest-160', 'RAILWAY', 'Puri Railway Station (PURI)', 2.0, 'Major coastal railway terminus with daily direct express and Vande Bharat trains to Howrah, New Delhi, and Ahmedabad.', 'ESTIMATED', 350, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-puri-road', 'dest-160', 'BUS_ROAD', 'Bhubaneswar–Puri Marine Highway (NH 316)', 60.0, 'Smooth 4-lane expressway connecting Bhubaneswar Airport and city center in 1 hour.', 'ESTIMATED', 1200, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-konark-road-puri', 'dest-161', 'BUS_ROAD', 'Puri–Konark Marine Drive', 35.0, 'Scenic coastal highway connecting Puri (35 km) and Bhubaneswar (65 km).', 'ESTIMATED', 800, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-konark-rail', 'dest-161', 'RAILWAY', 'Puri Railway Station (PURI)', 35.0, 'Nearest railway junction with continuous taxi and regular bus connectivity along the Marine Drive.', 'ESTIMATED', 150, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-chilika-rail', 'dest-162', 'RAILWAY', 'Balugaon Railway Station (BALU)', 3.0, 'Mainline railway station directly on the Howrah–Chennai line with express trains stopping 24x7.', 'ESTIMATED', 200, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-chilika-road', 'dest-162', 'BUS_ROAD', 'Chennai–Kolkata Highway (NH 16)', 95.0, 'Direct 2-hour drive from Bhubaneswar Airport (95 km) via 6-lane NH 16 to Barkul / Balugaon.', 'ESTIMATED', 1800, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-sundarbans-rail', 'dest-163', 'RAILWAY', 'Canning Railway Station (CAN)', 28.0, 'Suburban railhead connecting Sealdah (Kolkata) with local trains every 30 minutes; connecting sumos/autos to Godkhali boat ghat.', 'ESTIMATED', 40, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-sundarbans-road', 'dest-163', 'BUS_ROAD', 'Kolkata–Basanti Highway to Godkhali Port', 85.0, 'Direct 3-hour road drive from Kolkata (85 km) to Godkhali ferry boarding point for safari boats.', 'ESTIMATED', 2500, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-shantiniketan-rail', 'dest-164', 'RAILWAY', 'Bolpur Shantiniketan Railway Station (BHP)', 2.0, 'Directly connected by frequent express trains like Shantiniketan Express, Vande Bharat, and Kavi Guru from Howrah/Sealdah (approx. 2.5 hours).', 'ESTIMATED', 150, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-shantiniketan-road', 'dest-164', 'BUS_ROAD', 'Kolkata–Burdwan–Bolpur Highway (NH 19)', 160.0, 'Smooth 3.5-hour highway drive from Kolkata through lush Bengal agricultural plains.', 'ESTIMATED', 2200, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-kalimpong-rail', 'dest-165', 'RAILWAY', 'New Jalpaiguri Junction (NJP)', 72.0, 'Major North Bengal railway hub with direct superfast trains from Kolkata, Delhi, and Guwahati; shared sumos and taxis take ~2.5 hours.', 'ESTIMATED', 300, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-kalimpong-air', 'dest-165', 'AIRPORT', 'Bagdogra International Airport (IXB)', 75.0, 'Nearest operational airport connected to all major Indian metros; picturesque 2.5-hour hill drive along the Teesta River (NH 10).', 'ESTIMATED', 2200, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-nalanda-rail', 'dest-166', 'RAILWAY', 'Rajgir / Nalanda Railway Station', 2.0, 'Connected to Patna and New Delhi by direct Shramjeevi Express and Vande Bharat services.', 'ESTIMATED', 150, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-nalanda-road', 'dest-166', 'BUS_ROAD', 'Patna–Bakhtiyarpur–Nalanda Highway (NH 31 & NH 20)', 85.0, 'Direct 2-hour drive from Patna International Airport (85 km) along 4-lane national highway.', 'ESTIMATED', 1800, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-patna-air', 'dest-167', 'AIRPORT', 'Jay Prakash Narayan Airport (PAT)', 5.0, 'Major airport in the state capital with dozens of daily flights to Delhi, Mumbai, Bengaluru, and Kolkata.', 'ESTIMATED', 3200, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-patna-rail', 'dest-167', 'RAILWAY', 'Patna Junction (PNBE)', 1.0, 'A1 railway junction connected to all corners of India with Vande Bharat, Rajdhani, and express trains.', 'ESTIMATED', 400, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-deoghar-air', 'dest-168', 'AIRPORT', 'Deoghar Airport (DGH)', 7.0, 'Modern domestic airport with scheduled daily flights from New Delhi, Kolkata, Bengaluru, and Patna.', 'ESTIMATED', 3200, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-deoghar-rail', 'dest-168', 'RAILWAY', 'Jasidih Junction (JSME)', 7.0, 'Major railway junction on the Howrah–Delhi mainline served by Rajdhani, Vande Bharat, and Poorva Express trains.', 'ESTIMATED', 100, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-netarhat-rail', 'dest-169', 'RAILWAY', 'Ranchi Railway Station (RNC)', 155.0, 'Major rail junction in the state capital with trains to Delhi, Mumbai, and Kolkata; cabs take ~3.5 hours.', 'ESTIMATED', 350, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-netarhat-road', 'dest-169', 'BUS_ROAD', 'Ranchi–Lohardaga–Netarhat Highway (NH 143A)', 155.0, 'Picturesque mountain road climbing through sal forests from Ranchi (155 km).', 'ESTIMATED', 2800, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-jagdalpur-rail', 'dest-170', 'RAILWAY', 'Jagdalpur Railway Station (JDB)', 2.0, 'Railway station connected to Visakhapatnam via the scenic Araku valley mountain railway line.', 'ESTIMATED', 250, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-jagdalpur-air', 'dest-170', 'AIRPORT', 'Maa Danteshwari Airport (JGB)', 3.0, 'Regional airport with regular flights connecting Raipur and Hyderabad.', 'ESTIMATED', 2500, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-sirpur-rail', 'dest-171', 'RAILWAY', 'Mahasamund / Raipur Junction', 38.0, 'Nearest railway station at Mahasamund (38 km) and major junction at Raipur (78 km).', 'ESTIMATED', 200, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;
INSERT INTO destination_transports (id, destination_id, mode, name, distance_km, description, price_type, estimated_fare_inr, source_type) VALUES ('trans-sirpur-road', 'dest-171', 'BUS_ROAD', 'Raipur–Arang–Sirpur Highway (NH 53)', 78.0, 'Direct 1.5-hour highway drive from Swami Vivekananda Airport, Raipur (78 km).', 'ESTIMATED', 1800, 'OFFICIAL') ON CONFLICT (id) DO NOTHING;

-- 6. LINK PRE-SEEDED UNLINKED HOTELS (153 Verified Properties)
UPDATE hotels SET destination_id = 'dest-141' WHERE city_id = 'vijayawada' AND destination_id IS NULL;
UPDATE hotels SET destination_id = 'dest-155' WHERE city_id = 'kochi' AND destination_id IS NULL;
UPDATE hotels SET destination_id = 'dest-159' WHERE city_id = 'bhubaneswar' AND destination_id IS NULL;
UPDATE hotels SET destination_id = 'dest-167' WHERE city_id = 'patna' AND destination_id IS NULL;
UPDATE hotels SET destination_id = 'dest-21' WHERE city_id = 'kanyakumari' AND destination_id IS NULL;
UPDATE hotels SET destination_id = 'dest-30' WHERE city_id = 'varkala' AND destination_id IS NULL;
UPDATE hotels SET destination_id = 'dest-7' WHERE city_id = 'kumarakom' AND destination_id IS NULL;
UPDATE hotels SET destination_id = 'dest-157' WHERE city_id = 'trivandrum' AND destination_id IS NULL;
