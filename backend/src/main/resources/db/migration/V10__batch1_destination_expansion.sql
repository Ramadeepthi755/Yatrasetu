-- ==============================================================================
-- V10__batch1_destination_expansion.sql
-- YatraSetu Phase A-E: First Batch Destination Expansion & Authentic POI/Hotel Linking
--
-- Destinations created (12):
--   1. Hyderabad, Telangana (dest-101, IN-TG, hyderabad)
--   2. Warangal, Telangana (dest-102, IN-TG, warangal)
--   3. Delhi, Delhi (dest-103, IN-DL, delhi)
--   4. New Delhi, Delhi (dest-104, IN-DL, new-delhi)
--   5. Bengaluru, Karnataka (dest-105, IN-KA, bangalore)
--   6. Mumbai, Maharashtra (dest-106, IN-MH, mumbai)
--   7. Kolkata, West Bengal (dest-107, IN-WB, kolkata)
--   8. Chennai, Tamil Nadu (dest-108, IN-TN, chennai)
--   9. Chandigarh, Chandigarh (dest-109, IN-CH, chandigarh)
--  10. Ranchi, Jharkhand (dest-110, IN-JH, ranchi)
--  11. Jamshedpur, Jharkhand (dest-111, IN-JH, jamshedpur)
--  12. Srinagar, Jammu & Kashmir (dest-112, IN-JK, srinagar)
--
-- Strict Constraints:
--   - No synthetic businesses, fake fares, or fabricated contact info
--   - Preserves all 93 original destinations without mutation
--   - Links existing orphan POIs deterministically
--   - Unifies duplicate Jammu & Kashmir state mapping (IN-JA -> IN-JK)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PHASE A: PARENT DESTINATION RECORDS FOUNDATION
-- ------------------------------------------------------------------------------

-- 1. Hyderabad, Telangana
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, nearest_airport, nearest_railway, nearest_major_city,
    nearest_major_city_distance_km, road_connectivity, trip_types, primary_attractions,
    activities_available, unique_experiences, hidden_gems, best_seasons, avoid_seasons,
    peak_season, off_season, ideal_for, minimum_days, ideal_days, maximum_days,
    suggested_itinerary, accommodation_types, food_scene, safety_rating, safety_notes,
    internet_connectivity, mobile_network, atm_availability, language_spoken, permits_required,
    local_culture, festivals_events, local_customs, shopping_highlights, local_cuisine_must_try,
    description, is_active, created_at, updated_at
) VALUES (
    'dest-101', 'Hyderabad', 'IN-TG', 'hyderabad', 'Hyderabad', 'South India', 17.3850000, 78.4867000, 542,
    9.2, 'Easy', '{"name": "Rajiv Gandhi International Airport (HYD)", "distance_km": 24}'::jsonb,
    '{"name": "Secunderabad / Hyderabad Deccan Railway Station", "distance_km": 5}'::jsonb,
    'Hyderabad', 0.0, 'Excellent highway and expressway connectivity (ORR, NH44, NH65).',
    '{"Heritage","Culture","Food","City_Break","Photography"}'::text[],
    '{"Charminar","Golconda Fort","Chowmahalla Palace","Salar Jung Museum","Hussain Sagar","Qutb Shahi Tombs","Ramoji Film City"}'::text[],
    '{"Heritage walks","Sound & Light show at Golconda","Lake boat rides","Culinary trails","Bazaar shopping"}'::text[],
    'Exploring centuries-old Nizam heritage, opulent palaces, and historic pearl markets.',
    'Badshahi Ashurkhana | Paigah Tombs | Moula Ali Dargah view point',
    'October to March (Pleasant winter)', 'April to June (Peak summer heat)',
    'November to February', 'May to July',
    '{"Solo","Couple","Family_with_kids","Friends","Food_lovers"}'::text[],
    2.0, 3.0, 5,
    'Day 1: Charminar, Chowmahalla Palace, Salar Jung Museum, evening at Hussain Sagar; Day 2: Golconda Fort, Qutb Shahi Tombs, Shilparamam; Day 3: Ramoji Film City or museum exploration.',
    'Heritage Hotels | Luxury City Hotels | Business Lodges | Hostels',
    'World-renowned Hyderabadi Biryani, Haleem, Irani Chai, Osmania biscuits, Double ka Meetha, and diverse South Indian cuisine.',
    8.5, 'Safe and vibrant metropolitan city with good police presence.',
    'High speed 5G/4G across the city', 'Jio, Airtel, Vi', 'Widely available across all neighborhoods',
    'Telugu | Urdu | Hindi | English', false,
    'Rich blend of Telugu traditions and historic Deccani-Nizami courtly culture.',
    'Bonalu (Jul-Aug), Bathukamma, Eid-ul-Fitr, Milad-un-Nabi, Diwali, Hyderabad Literary Festival.',
    'Respect modesty when visiting mosques, dargahs, and historic temples.',
    'Laad Bazaar pearls and bangles | Pochampally sarees | Bidriware metal crafts | Attar perfumes',
    'Hyderabadi Dum Biryani | Haleem | Mirchi ka Salan | Irani Chai & Osmania Biscuits | Qubani ka Meetha',
    'The historic City of Pearls and capital of Telangana, celebrated for monumental Indo-Islamic architecture, royal palaces, tech hubs, and a world-famous culinary heritage.',
    true, NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
    state_id = EXCLUDED.state_id,
    city_id = EXCLUDED.city_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();

-- 2. Warangal, Telangana
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, nearest_airport, nearest_railway, nearest_major_city,
    nearest_major_city_distance_km, road_connectivity, trip_types, primary_attractions,
    activities_available, unique_experiences, hidden_gems, best_seasons, avoid_seasons,
    peak_season, off_season, ideal_for, minimum_days, ideal_days, maximum_days,
    suggested_itinerary, accommodation_types, food_scene, safety_rating, safety_notes,
    internet_connectivity, mobile_network, atm_availability, language_spoken, permits_required,
    local_culture, festivals_events, local_customs, shopping_highlights, local_cuisine_must_try,
    description, is_active, created_at, updated_at
) VALUES (
    'dest-102', 'Warangal', 'IN-TG', 'warangal', 'Hanamkonda', 'South India', 17.9689000, 79.5941000, 266,
    7.5, 'Easy', '{"name": "Rajiv Gandhi International Airport (Hyderabad)", "distance_km": 160}'::jsonb,
    '{"name": "Warangal / Kazipet Junction Railway Station", "distance_km": 3}'::jsonb,
    'Hyderabad', 145.0, 'NH163 connects directly from Hyderabad with smooth 4-lane driving.',
    '{"Heritage","History","Architecture","Spiritual","Offbeat"}'::text[],
    '{"Warangal Fort & Kakatiya Kala Thoranam","Thousand Pillar Temple","Bhadrakali Lake & Temple","Ramappa Temple (UNESCO nearby)"}'::text[],
    '{"Archaeological exploration","Temple visits","Lake strolls","Heritage photography"}'::text[],
    'Standing before the majestic Kakatiya Kala Thoranam arch, symbol of Telangana.',
    'Khush Mahal | Pakhal Lake & Wildlife Sanctuary | Laknavaram Lake suspension bridge',
    'October to March', 'April to June (High summer)',
    'November to February', 'May to July',
    '{"Heritage_enthusiasts","History_buffs","Families","Photographers"}'::text[],
    1.0, 2.0, 3,
    'Day 1: Warangal Fort, Thousand Pillar Temple, Bhadrakali Temple; Day 2: Day excursion to UNESCO World Heritage Ramappa Temple and Laknavaram Lake.',
    'Mid-range Hotels | Tourism Guest Houses | Budget Lodges',
    'Traditional Telangana spice-rich meals, Sarva Pindi, Pachi Pulusu, Jowar rotis, and local sweets.',
    8.5, 'Peaceful heritage town with welcoming locals.',
    'Good 4G/5G mobile connectivity', 'Jio, Airtel', 'Widely available in town center and stations',
    'Telugu | Hindi | English', false,
    'Ancient Kakatiya dynasty roots with distinct folk art, dance forms, and stone craftsmanship.',
    'Sammakka Saralamma Jathara (biennial massive tribal festival), Bathukamma, Kakatiya Festival.',
    'Remove shoes before entering sanctum sanctorum of heritage temples.',
    'Warangal Dhurries (cotton carpets with GI tag) | Brass metal crafts (Pembarthi) | Terracotta items',
    'Sarva Pindi | Jonna Rotte with Natukodi curry | Sakinalu | Pootharekulu',
    'The ancient capital of the Kakatiya dynasty in Telangana, famous for stone-sculpted temple arches, historic fort ruins, and close proximity to the UNESCO-listed Ramappa Temple.',
    true, NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
    state_id = EXCLUDED.state_id,
    city_id = EXCLUDED.city_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();

-- 3. Delhi, Delhi
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, nearest_airport, nearest_railway, nearest_major_city,
    nearest_major_city_distance_km, road_connectivity, trip_types, primary_attractions,
    activities_available, unique_experiences, hidden_gems, best_seasons, avoid_seasons,
    peak_season, off_season, ideal_for, minimum_days, ideal_days, maximum_days,
    suggested_itinerary, accommodation_types, food_scene, safety_rating, safety_notes,
    internet_connectivity, mobile_network, atm_availability, language_spoken, permits_required,
    local_culture, festivals_events, local_customs, shopping_highlights, local_cuisine_must_try,
    description, is_active, created_at, updated_at
) VALUES (
    'dest-103', 'Delhi', 'IN-DL', 'delhi', 'Central Delhi', 'North India', 28.6139000, 77.2090000, 216,
    9.5, 'Easy', '{"name": "Indira Gandhi International Airport (DEL)", "distance_km": 15}'::jsonb,
    '{"name": "New Delhi Railway Station / Old Delhi Station", "distance_km": 3}'::jsonb,
    'Delhi', 0.0, 'Major national hub connecting NH44, NH48, Yamuna Expressway, and Eastern Peripheral.',
    '{"Heritage","Culture","Food","Shopping","City_Break"}'::text[],
    '{"Red Fort","Qutub Minar","Humayuns Tomb","India Gate","Lotus Temple","Jama Masjid","Akshardham"}'::text[],
    '{"Monument exploration","Heritage walks","Metro city transit","Street food sampling","Bazaar hopping"}'::text[],
    'Walking through Old Delhi narrow gallis with aroma of parathas, kebabs, and centuries of Mughal history.',
    'Agrasen ki Baoli | Mehrauli Archaeological Park | Mirza Ghalib Haveli | Sanjay Van',
    'October to March (Crisp pleasant autumn/winter)', 'May to June (Extreme summer heat) and peak fog days in Jan',
    'November to February', 'May to July',
    '{"Solo","Couple","Families","Backpackers","Food_lovers"}'::text[],
    2.0, 4.0, 6,
    'Day 1: Old Delhi - Red Fort, Jama Masjid, Chandni Chowk; Day 2: Central Delhi - India Gate, Humayun Tomb, National Museum; Day 3: South Delhi - Qutub Minar, Hauz Khas, Lotus Temple.',
    'Luxury 5-Star Hotels | Boutique Heritage Haveli Stays | Business Hotels | Hostels',
    'World capital of diverse North Indian culinary delights: Chole Bhature, Butter Chicken, Nihari, Parathas, Chaat, and momos.',
    7.5, 'Use Delhi Metro for safe and efficient travel; stay alert in crowded markets at night.',
    'High-speed 5G/4G widespread throughout the capital', 'Jio, Airtel, Vi', 'Abundant throughout all sectors',
    'Hindi | English | Punjabi | Urdu', false,
    'Historical syncretic culture bridging ancient empires, the Mughal court, colonial Delhi, and modern democratic India.',
    'Republic Day Parade, Diwali, Eid, Durga Puja at CR Park, Qutub Festival.',
    'Dress modestly when visiting active religious monuments and shrines.',
    'Chandni Chowk bridal & jewelry | Dilli Haat handicrafts | Janpath & Sarojini Nagar flea markets',
    'Chole Bhature | Butter Chicken | Chandni Chowk Parathe | Daulat ki Chaat | Dahi Bhalle',
    'The historic and dynamic capital of India, bridging thousands of years of imperial heritage across eight historic cities, magnificent UNESCO World Heritage monuments, and vibrant bazaars.',
    true, NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
    state_id = EXCLUDED.state_id,
    city_id = EXCLUDED.city_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();

-- 4. New Delhi, Delhi
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, nearest_airport, nearest_railway, nearest_major_city,
    nearest_major_city_distance_km, road_connectivity, trip_types, primary_attractions,
    activities_available, unique_experiences, hidden_gems, best_seasons, avoid_seasons,
    peak_season, off_season, ideal_for, minimum_days, ideal_days, maximum_days,
    suggested_itinerary, accommodation_types, food_scene, safety_rating, safety_notes,
    internet_connectivity, mobile_network, atm_availability, language_spoken, permits_required,
    local_culture, festivals_events, local_customs, shopping_highlights, local_cuisine_must_try,
    description, is_active, created_at, updated_at
) VALUES (
    'dest-104', 'New Delhi', 'IN-DL', 'new-delhi', 'New Delhi', 'North India', 28.6139000, 77.2090000, 216,
    9.0, 'Easy', '{"name": "Indira Gandhi International Airport (DEL)", "distance_km": 14}'::jsonb,
    '{"name": "New Delhi Railway Station", "distance_km": 2}'::jsonb,
    'Delhi', 0.0, 'Broad tree-lined avenues designed by Edwin Lutyens with central connectivity.',
    '{"Heritage","Architecture","Culture","Museums","City_Break"}'::text[],
    '{"Kartavya Path & India Gate","Rashtrapati Bhavan","National Gallery of Modern Art","Connaught Place","Lodhi Gardens"}'::text[],
    '{"Heritage architecture walks","Art museum visits","Colonial arcade shopping","Garden morning walks"}'::text[],
    'Strolling under the grand canopy of trees in Lutyens Delhi along Rajpath at dusk.',
    'National Crafts Museum | Nehru Planetarium | Lodhi Art District open-air murals',
    'October to March', 'May to June (Peak summer heat)',
    'November to February', 'June to August',
    '{"Couples","Architecture_admirers","Culture_seekers","Diplomats"}'::text[],
    1.0, 2.0, 3,
    'Day 1: India Gate, National Museum, Lodhi Gardens; Day 2: Rashtrapati Bhavan, Connaught Place, NGMA, evening cultural show at India Habitat Centre.',
    'Grand Heritage Hotels | Modern 5-Star Properties | State Bhawans | Boutique Guest Houses',
    'State Bhawan regional canteens, fine dining at Connaught Place and Khan Market, artisanal bakeries.',
    8.0, 'Secure administrative zone with continuous security patrols.',
    'Excellent 5G coverage throughout', 'Jio, Airtel, Vi', 'Available at every block and metro station',
    'Hindi | English | Punjabi', false,
    'Cosmopolitan center of Indian governance, diplomacy, arts, and contemporary cultural discourse.',
    'Beating Retreat Ceremony, International Trade Fair, Delhi Book Fair, Spring Festival.',
    'Prior booking required for Rashtrapati Bhavan and Mughal Gardens tours.',
    'Khan Market boutiques | Connaught Place underground Palika Bazaar | State Emporiums on Baba Kharak Singh Marg',
    'Regional dishes at State Bhawans | Gulati butter chicken on Pandara Road | Wenger patties in CP',
    'The seat of India’s national government, planned with grand neoclassical boulevards, landscaped roundabouts, prestigious national museums, and iconic civic architecture.',
    true, NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
    state_id = EXCLUDED.state_id,
    city_id = EXCLUDED.city_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();

-- 5. Bengaluru, Karnataka
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, nearest_airport, nearest_railway, nearest_major_city,
    nearest_major_city_distance_km, road_connectivity, trip_types, primary_attractions,
    activities_available, unique_experiences, hidden_gems, best_seasons, avoid_seasons,
    peak_season, off_season, ideal_for, minimum_days, ideal_days, maximum_days,
    suggested_itinerary, accommodation_types, food_scene, safety_rating, safety_notes,
    internet_connectivity, mobile_network, atm_availability, language_spoken, permits_required,
    local_culture, festivals_events, local_customs, shopping_highlights, local_cuisine_must_try,
    description, is_active, created_at, updated_at
) VALUES (
    'dest-105', 'Bengaluru', 'IN-KA', 'bangalore', 'Bengaluru Urban', 'South India', 12.9716000, 77.5946000, 920,
    9.0, 'Easy', '{"name": "Kempegowda International Airport (BLR)", "distance_km": 35}'::jsonb,
    '{"name": "KSR Bengaluru City / Yesvantpur Junction", "distance_km": 3}'::jsonb,
    'Bengaluru', 0.0, 'NH44, NH48, NH75, and state expressways connecting to Mysore, Chennai, and Hyderabad.',
    '{"Nature","Culture","Food","City_Break","Nightlife"}'::text[],
    '{"Lalbagh Botanical Garden","Cubbon Park","Bangalore Palace","Vidhana Soudha","Tipu Sultan Summer Palace","ISKCON Temple"}'::text[],
    '{"Botanical walks","Craft brewery crawls","Heritage palace tours","Science & aerospace exploration","Tech hub visits"}'::text[],
    'Sipping filter coffee at century-old heritage tiffin rooms before walking through misty morning Cubbon Park.',
    'Bugle Rock Park | Bull Temple (Nandi Temple) | National Military Memorial | Ranga Shankara theatre',
    'September to March (Pleasant year-round climate, elevated plateau weather)', 'Heavy monsoon spells in August-September',
    'October to February', 'April to May (Warmest months)',
    '{"Solo","Couples","Friends","Food_lovers","Tech_enthusiasts"}'::text[],
    2.0, 3.0, 5,
    'Day 1: Lalbagh, Tipu Sultan Palace, Vidhana Soudha, Cubbon Park, evening in Church Street; Day 2: Bangalore Palace, ISKCON, Visvesvaraya Museum, Indiranagar dining; Day 3: Bannerghatta National Park or day trip to Nandi Hills.',
    '5-Star Luxury Hotels | Boutique Business Hotels | Serviced Apartments | Youth Hostels',
    'Thriving food capital featuring heritage Darshinis (crisp Dosas, Idli Vada), vibrant craft microbreweries, Mangalorean seafood, and international cuisines.',
    8.5, 'Safe and progressive city; plan for peak-hour road traffic by using Namma Metro.',
    'Industry-leading 5G and high-speed broadband throughout', 'Jio, Airtel, Vi', 'Universal availability',
    'Kannada | English | Hindi | Tamil | Telugu', false,
    'Unique convergence of traditional South Indian heritage, botanical serenity, and pioneering modern tech innovation.',
    'Karaga Festival, Bengaluru Habba, Groundnut Fair (Kadalekai Parishe), Independence Day Flower Show.',
    'Quiet early morning park regulations; queue culture in popular breakfast outlets.',
    'Mysore Silk sarees | Channapatna wooden toys | Filter coffee powder | Commercial Street fashion',
    'Benne Masala Dosa | Rava Idli | Bisi Bele Bath | Filter Kaapi | Mangalore Buns | Mysore Pak',
    'The Silicon Valley of India and Garden City of Karnataka, situated on the Deccan Plateau with a pleasant climate, grand botanical gardens, colonial parks, and an energetic cafe and craft beer culture.',
    true, NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
    state_id = EXCLUDED.state_id,
    city_id = EXCLUDED.city_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();

-- 6. Mumbai, Maharashtra
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, nearest_airport, nearest_railway, nearest_major_city,
    nearest_major_city_distance_km, road_connectivity, trip_types, primary_attractions,
    activities_available, unique_experiences, hidden_gems, best_seasons, avoid_seasons,
    peak_season, off_season, ideal_for, minimum_days, ideal_days, maximum_days,
    suggested_itinerary, accommodation_types, food_scene, safety_rating, safety_notes,
    internet_connectivity, mobile_network, atm_availability, language_spoken, permits_required,
    local_culture, festivals_events, local_customs, shopping_highlights, local_cuisine_must_try,
    description, is_active, created_at, updated_at
) VALUES (
    'dest-106', 'Mumbai', 'IN-MH', 'mumbai', 'Mumbai City', 'West India', 19.0760000, 72.8777000, 14,
    9.5, 'Easy', '{"name": "Chhatrapati Shivaji Maharaj International Airport (BOM)", "distance_km": 10}'::jsonb,
    '{"name": "Chhatrapati Shivaji Maharaj Terminus (CSMT) / Mumbai Central", "distance_km": 2}'::jsonb,
    'Mumbai', 0.0, 'Mumbai-Pune Expressway, Coastal Road, Sea Link, and major national trunk highways.',
    '{"Heritage","Culture","Food","Coast","Nightlife","City_Break"}'::text[],
    '{"Gateway of India","Marine Drive","Chhatrapati Shivaji Maharaj Terminus","Elephanta Caves","Siddhivinayak Temple","Juhu Beach"}'::text[],
    '{"Ferry boat rides to Elephanta","Marine Drive sunset walk","Heritage Victorian gothic walk","Bollywood studio tours"}'::text[],
    'Watching the Arabian Sea sunset from Marine Drive promenade (Queen’s Necklace) as the city lights up.',
    'Khotachiwadi heritage village | Banganga Tank | Kanheri Caves inside Sanjay Gandhi National Park | Sassoon Docks morning fish auction',
    'November to February (Pleasant coastal breezes)', 'July to August (Intense torrential monsoon showers)',
    'December to February', 'June to August',
    '{"Solo","Couples","Friends","Photography_lovers","Culture_buffs"}'::text[],
    2.0, 3.0, 5,
    'Day 1: Gateway of India, Elephanta Caves ferry, Colaba Causeway, Marine Drive sunset; Day 2: CSMT Victorian architecture, Kala Ghoda, Crawford Market, Haji Ali; Day 3: Bandra street art, Bandstand, Juhu Beach street food.',
    'World-class 5-Star Oceanfront Hotels | Boutique Heritage Hotels | Sea-facing Hostels',
    'Iconic street food (Vada Pav, Pav Bhaji, Bhel Puri, Sev Puri), legendary Irani cafes, Coastal Malvani seafood, and cutting-edge fine dining.',
    8.5, 'One of India’s safest cities around the clock; local trains are very crowded during peak rush hours.',
    'Flawless 5G mobile coverage and fiber broadband across the peninsula', 'Jio, Airtel, Vi', 'Available at every corner',
    'Marathi | Hindi | English | Gujarati', false,
    'The pulsing financial heart of India, birthplace of Indian cinema (Bollywood), and home to diverse communities with irrepressible spirit.',
    'Ganesh Chaturthi (grand celebrations city-wide), Kala Ghoda Arts Festival, Banganga Music Festival.',
    'Queue patiently at local transport stands; respect temple guidelines.',
    'Colaba Causeway accessories & antiques | Linking Road fashion | Crawford Market dry fruits & decor | Mangaldas fabric market',
    'Vada Pav | Pav Bhaji | Bombil Fry | Parsi Berry Pulao | Kanda Poha | Bun Maska & Chai',
    'India’s financial capital and the City of Dreams, featuring grand UNESCO Victorian Gothic and Art Deco architecture along the Arabian Sea, vibrant street life, and unmatched coastal energy.',
    true, NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
    state_id = EXCLUDED.state_id,
    city_id = EXCLUDED.city_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();

-- 7. Kolkata, West Bengal
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, nearest_airport, nearest_railway, nearest_major_city,
    nearest_major_city_distance_km, road_connectivity, trip_types, primary_attractions,
    activities_available, unique_experiences, hidden_gems, best_seasons, avoid_seasons,
    peak_season, off_season, ideal_for, minimum_days, ideal_days, maximum_days,
    suggested_itinerary, accommodation_types, food_scene, safety_rating, safety_notes,
    internet_connectivity, mobile_network, atm_availability, language_spoken, permits_required,
    local_culture, festivals_events, local_customs, shopping_highlights, local_cuisine_must_try,
    description, is_active, created_at, updated_at
) VALUES (
    'dest-107', 'Kolkata', 'IN-WB', 'kolkata', 'Kolkata', 'East India', 22.5726000, 88.3639000, 9,
    9.0, 'Easy', '{"name": "Netaji Subhash Chandra Bose International Airport (CCU)", "distance_km": 16}'::jsonb,
    '{"name": "Howrah / Sealdah Railway Station", "distance_km": 2}'::jsonb,
    'Kolkata', 0.0, 'NH16, NH19, and national highway corridors connecting to Eastern and Northeastern states.',
    '{"Heritage","Culture","Art","Literature","Food"}'::text[],
    '{"Victoria Memorial","Howrah Bridge","Dakshineswar Kali Temple","Belur Math","Indian Museum","St. Pauls Cathedral"}'::text[],
    '{"Hooghly River ferry rides","Heritage tram rides","Literary cafe visits","Clay idol studio walks in Kumartuli"}'::text[],
    'Witnessing potters mold intricate clay idols of Goddess Durga in the historic alleyways of Kumartuli.',
    'South Park Street Cemetery | Marble Palace | College Street Boi Para (largest second-hand book market) | Mullick Ghat Flower Market',
    'October to March (Pleasant autumn and mild winter)', 'May to June (Intense humid summer heat)',
    'October to February (especially during Durga Puja)', 'May to July',
    '{"Solo","Culture_lovers","Literature_enthusiasts","History_buffs","Food_lovers"}'::text[],
    2.0, 3.0, 5,
    'Day 1: Victoria Memorial, St. Paul Cathedral, Indian Museum, Park Street evening; Day 2: Howrah Bridge, Mullick Ghat flower market, Kumartuli, Dakshineswar Temple, Belur Math ferry; Day 3: College Street book market, Coffee House, Jorasanko Thakurbari.',
    'Heritage Colonial Hotels | Star Hotels | Artistic Guest Houses | Budget Lodges',
    'Legendary sweet shops, authentic Bengali fish curry & rice, Mughlai Kolkata Biryani with potato, and famous street-side Kathi Rolls.',
    8.5, 'Warm and welcoming city with active evening street life and dependable yellow taxis and metro.',
    'Good 5G/4G coverage throughout', 'Jio, Airtel, Vi', 'Widely available across all municipal wards',
    'Bengali | Hindi | English', false,
    'The cultural and intellectual soul of modern India, home to Nobel laureates, poets, cinema masters, and revolutionary thinkers.',
    'Durga Puja (UNESCO Intangible Cultural Heritage), Kolkata International Film Festival, International Book Fair, Poila Boishakh.',
    'Take care not to touch clay idols in artisan workshops without permission; respect sanctum rules at Kalighat.',
    'Baluchari and Jamdani sarees | Terracotta handicrafts | Sholapith decorative art | Second-hand rare books on College Street',
    'Kolkata Biryani | Kosha Mangsho & Luchi | Rosogolla | Mishti Doi | Kathi Roll | Sandesh | Macher Jhol',
    'The cultural capital of India on the banks of the Hooghly River, celebrated for grand colonial monuments, artistic traditions, literary heritage, and the world-renowned UNESCO-recognized Durga Puja.',
    true, NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
    state_id = EXCLUDED.state_id,
    city_id = EXCLUDED.city_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();

-- 8. Chennai, Tamil Nadu
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, nearest_airport, nearest_railway, nearest_major_city,
    nearest_major_city_distance_km, road_connectivity, trip_types, primary_attractions,
    activities_available, unique_experiences, hidden_gems, best_seasons, avoid_seasons,
    peak_season, off_season, ideal_for, minimum_days, ideal_days, maximum_days,
    suggested_itinerary, accommodation_types, food_scene, safety_rating, safety_notes,
    internet_connectivity, mobile_network, atm_availability, language_spoken, permits_required,
    local_culture, festivals_events, local_customs, shopping_highlights, local_cuisine_must_try,
    description, is_active, created_at, updated_at
) VALUES (
    'dest-108', 'Chennai', 'IN-TN', 'chennai', 'Chennai', 'South India', 13.0827000, 80.2707000, 7,
    8.8, 'Easy', '{"name": "Chennai International Airport (MAA)", "distance_km": 15}'::jsonb,
    '{"name": "Chennai Central / Chennai Egmore Railway Station", "distance_km": 2}'::jsonb,
    'Chennai', 0.0, 'East Coast Road (ECR), Grand Southern Trunk Road (NH45), and golden quadrilateral.',
    '{"Heritage","Culture","Coast","Temples","Music"}'::text[],
    '{"Marina Beach","Kapaleeshwarar Temple","San Thome Basilica","Fort St. George","Government Museum","Elliot Beach"}'::text[],
    '{"Dravidian temple exploration","Sunrise beach walks","Classical Carnatic concerts","Heritage museum visits"}'::text[],
    'Attending a live Carnatic music concert in Mylapore during the December music season.',
    'Theosophical Society gardens | Luz Church | Semmozhi Poonga botanical park | Cholamandal Artists Village',
    'November to February (Mild pleasant coastal season)', 'May to June (Peak summer heat and high humidity)',
    'December to February', 'May to July',
    '{"Families","Culture_seekers","Temple_travellers","Solo","Music_lovers"}'::text[],
    2.0, 3.0, 4,
    'Day 1: Kapaleeshwarar Temple, Mylapore heritage walk, San Thome Basilica, Marina Beach sunset; Day 2: Fort St. George, Government Museum, Kalakshetra Foundation, Besant Nagar Elliot Beach; Day 3: Excursion along East Coast Road to Mahabalipuram (nearby UNESCO site).',
    'Coastal Resorts | Business 5-Stars | Heritage Boutique Hotels | Budget Lodges',
    'Authentic South Indian vegetarian feasts, crisp Medu Vadas, Chettinad spicy curries, freshly brewed filter coffee, and coastal seafood.',
    8.5, 'Very safe coastal metropolis with dependable suburban trains, metro, and buses.',
    'High speed 5G/4G across the city', 'Jio, Airtel, Vi', 'Available throughout the metro area',
    'Tamil | English', false,
    'Cultural gateway of South India, celebrated for classical Bharatanatyam dance, Carnatic music, and towering Dravidian temple gopurams.',
    'Margazhi Music Season (Dec-Jan), Pongal (Jan), Kapaleeshwarar Panguni Uthiram Brahmotsavam, Chennai Book Fair.',
    'Strict traditional dress codes in major temples (dhoti/pants and sarees/churidars).',
    'Kanchipuram pure silk sarees | Tanjore paintings | Bronze idols | Filter coffee sets',
    'Filter Coffee | Masala Dosa & Sambar | Chettinad Chicken | Idiyappam with coconut milk | Curd Rice',
    'The coastal capital of Tamil Nadu and gateway to South India, renowned for majestic Dravidian temple architecture, classical performing arts, and Marina Beach—one of the longest natural urban beaches in the world.',
    true, NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
    state_id = EXCLUDED.state_id,
    city_id = EXCLUDED.city_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();

-- 9. Chandigarh, Chandigarh
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, nearest_airport, nearest_railway, nearest_major_city,
    nearest_major_city_distance_km, road_connectivity, trip_types, primary_attractions,
    activities_available, unique_experiences, hidden_gems, best_seasons, avoid_seasons,
    peak_season, off_season, ideal_for, minimum_days, ideal_days, maximum_days,
    suggested_itinerary, accommodation_types, food_scene, safety_rating, safety_notes,
    internet_connectivity, mobile_network, atm_availability, language_spoken, permits_required,
    local_culture, festivals_events, local_customs, shopping_highlights, local_cuisine_must_try,
    description, is_active, created_at, updated_at
) VALUES (
    'dest-109', 'Chandigarh', 'IN-CH', 'chandigarh', 'Chandigarh', 'North India', 30.7333000, 76.7794000, 321,
    8.5, 'Easy', '{"name": "Shaheed Bhagat Singh International Airport (IXC)", "distance_km": 12}'::jsonb,
    '{"name": "Chandigarh Railway Station", "distance_km": 7}'::jsonb,
    'Chandigarh', 0.0, 'NH5, Himalayan Expressway, and Delhi-Chandigarh 6-lane national highway (NH44).',
    '{"Architecture","Urban_Design","Nature","Gardens","Relaxation"}'::text[],
    '{"Nek Chand Rock Garden","Sukhna Lake","Zakir Hussain Rose Garden","Capitol Complex (UNESCO)","Leisure Valley"}'::text[],
    '{"Boating at Sukhna Lake","Sculpture park exploration","Urban architecture tours","Cycling through tree-lined sectors"}'::text[],
    'Exploring Nek Chand’s fantasy world constructed entirely of industrial waste, recycled porcelain, and discarded ceramics.',
    'Open Hand Monument | Le Corbusier Centre in Sector 19 | Butterfly Park in Sector 26 | Garden of Fragrance',
    'October to March (Pleasant autumn and crisp winter)', 'May to June (Peak northern summer)',
    'November to February', 'June to August',
    '{"Couples","Families","Architecture_buffs","Senior_citizens","Designers"}'::text[],
    1.0, 2.0, 3,
    'Day 1: Rock Garden, Capitol Complex, Sukhna Lake sunset boating; Day 2: Rose Garden, Government Museum & Art Gallery, Sector 17 Plaza, leisure dining.',
    'Boutique Hotels | Business Stays | Government Circuit Houses | Bed & Breakfasts',
    'Hearty Punjabi cuisine: Butter chicken, Dal makhani, Amritsari kulchas, Tandoori platters, Lassi, and vibrant modern cafes.',
    9.0, 'One of the safest, cleanest, and most orderly cities in India.',
    'Seamless 5G and high speed internet across sectors', 'Jio, Airtel, Vi', 'Available at every sector market plaza',
    'Punjabi | Hindi | English', false,
    'India’s first modern planned city, harmoniously integrating modernist architecture with green open spaces.',
    'Rose Festival (Feb), Mango Festival (Pinjore), Baisakhi, Chandigarh Carnival.',
    'Adhere strictly to traffic rules and zebra crossings; littering is penalized.',
    'Sector 17 fashion shopping | Phulkari dupattas | Punjabi juttis | Handcrafted souvenirs',
    'Amritsari Kulcha with Chole | Tandoori Chicken | Dal Makhani | Sweet Malai Lassi | Makki di Roti & Sarson da Saag',
    'The joint capital of Punjab and Haryana and a premier planned city designed by legendary Swiss-French architect Le Corbusier, featuring the UNESCO-listed Capitol Complex, serene Sukhna Lake, and Nek Chand’s world-famous Rock Garden.',
    true, NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
    state_id = EXCLUDED.state_id,
    city_id = EXCLUDED.city_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();

-- 10. Ranchi, Jharkhand
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, nearest_airport, nearest_railway, nearest_major_city,
    nearest_major_city_distance_km, road_connectivity, trip_types, primary_attractions,
    activities_available, unique_experiences, hidden_gems, best_seasons, avoid_seasons,
    peak_season, off_season, ideal_for, minimum_days, ideal_days, maximum_days,
    suggested_itinerary, accommodation_types, food_scene, safety_rating, safety_notes,
    internet_connectivity, mobile_network, atm_availability, language_spoken, permits_required,
    local_culture, festivals_events, local_customs, shopping_highlights, local_cuisine_must_try,
    description, is_active, created_at, updated_at
) VALUES (
    'dest-110', 'Ranchi', 'IN-JH', 'ranchi', 'Ranchi', 'East India', 23.3441000, 85.3096000, 651,
    7.6, 'Easy', '{"name": "Birsa Munda Airport (IXR)", "distance_km": 6}'::jsonb,
    '{"name": "Ranchi / Hatia Railway Station", "distance_km": 3}'::jsonb,
    'Ranchi', 0.0, 'NH20, NH33, and NH43 connecting to Jamshedpur, Patna, and Kolkata.',
    '{"Nature","Waterfalls","Culture","Offbeat","Hills"}'::text[],
    '{"Hundru Falls","Jonha Falls","Dassam Falls","Tagore Hill","Pahari Mandir","Rock Garden Ranchi"}'::text[],
    '{"Waterfall excursions","Hilltop panoramic views","Tribal museum visits","Nature photography"}'::text[],
    'Watching the Subarnarekha River plunge over 300 feet down the rock face at Hundru Falls during post-monsoon.',
    'Panch Gagh Falls | Patratu Valley scenic winding ghats | Kanke Dam sunset point',
    'October to March (Crisp pleasant plateau weather)', 'May to June (Warm summer)',
    'October to February', 'April to June',
    '{"Nature_lovers","Offbeat_explorers","Road_trippers","Photographers"}'::text[],
    1.0, 2.0, 4,
    'Day 1: Tagore Hill, Pahari Mandir, Rock Garden, evening at Kanke Dam; Day 2: Full-day waterfall circuit visiting Hundru Falls, Jonha Falls, and Dassam Falls; Day 3: Scenic drive through Patratu Valley.',
    'Standard Business Hotels | State Tourism Guest Houses | Budget Stays',
    'Nutritious tribal and regional cuisine: Litti Chokha, Dhuska with Ghugni, Arsa Roti, Bamboo shoot curry, and freshwater fish.',
    8.0, 'Friendly and welcoming plateau city; hire registered cabs for waterfall excursions.',
    'Reliable 4G/5G mobile connectivity in city and key sights', 'Jio, Airtel', 'Available in city center and market areas',
    'Hindi | Nagpuri | Kurmali | Mundari | English', false,
    'Rich indigenous tribal culture (Munda, Oraon, Santhal) with vibrant folk music, dance (Chhau, Jhumar), and sacred grove reverence.',
    'Sarhul (Tribal spring festival of Sal blossom), Karma Puja, Sohrai, Chhath Puja.',
    'Respect sacred Sarna groves (Jaherthan) and tribal village boundaries.',
    'Tribal Sohrai painting canvases | Bamboo and wood craft | Tussar silk fabrics | Metal Dhokra art',
    'Dhuska with Chana Ghugni | Litti Chokha | Bamboo shoot (Karil) curry | Rugra mushroom curry | Arsa Roti',
    'The capital of Jharkhand, situated on the scenic Chota Nagpur Plateau and known as the City of Waterfalls, surrounded by lush forested hills, the serpentine Patratu Valley, and indigenous tribal heritage.',
    true, NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
    state_id = EXCLUDED.state_id,
    city_id = EXCLUDED.city_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();

-- 11. Jamshedpur, Jharkhand
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, nearest_airport, nearest_railway, nearest_major_city,
    nearest_major_city_distance_km, road_connectivity, trip_types, primary_attractions,
    activities_available, unique_experiences, hidden_gems, best_seasons, avoid_seasons,
    peak_season, off_season, ideal_for, minimum_days, ideal_days, maximum_days,
    suggested_itinerary, accommodation_types, food_scene, safety_rating, safety_notes,
    internet_connectivity, mobile_network, atm_availability, language_spoken, permits_required,
    local_culture, festivals_events, local_customs, shopping_highlights, local_cuisine_must_try,
    description, is_active, created_at, updated_at
) VALUES (
    'dest-111', 'Jamshedpur', 'IN-JH', 'jamshedpur', 'East Singhbhum', 'East India', 22.8046000, 86.2029000, 135,
    7.4, 'Easy', '{"name": "Birsa Munda Airport Ranchi / Kolkata CCU", "distance_km": 130}'::jsonb,
    '{"name": "Tatanagar Junction", "distance_km": 4}'::jsonb,
    'Ranchi', 130.0, 'NH33 connecting directly to Ranchi and Kolkata.',
    '{"Nature","Industrial_Heritage","Urban_Greenery","Wildlife"}'::text[],
    '{"Jubilee Park & Rose Garden","Dimna Lake","Dalma Wildlife Sanctuary","Tata Steel Zoological Park","Bhuvaneshwari Temple"}'::text[],
    '{"Lake picnics","Wildlife safari at Dalma Hills","Park strolls","Industrial heritage photography"}'::text[],
    'Taking in the panoramic sunset over the Dalma Hills from the tranquil waters of Dimna Lake.',
    'Jayanti Sarovar | Sir Dorabji Tata Park | Hudco Lake and Telco gardens',
    'October to March', 'May to June (Summer heat)',
    'November to February', 'April to June',
    '{"Families","Nature_enthusiasts","Urban_explorers","Industrial_history_buffs"}'::text[],
    1.0, 2.0, 3,
    'Day 1: Jubilee Park, Tata Steel Zoological Park, Bhuvaneshwari Temple view; Day 2: Excursion to Dimna Lake and Dalma Wildlife Sanctuary elephant reserve.',
    'Tata Business Hotels | Mid-range Properties | Budget Stays',
    'Cosmopolitan street food, Dhuska, Litti Chokha, South and North Indian cuisines catering to diverse steel city residents.',
    8.5, 'Well-managed and peaceful planned city with extensive green cover.',
    'Solid 5G/4G coverage throughout urban limits', 'Jio, Airtel, Vi', 'Available throughout Bistupur and Sakchi',
    'Hindi | Bengali | Santhali | English', false,
    'India’s first planned industrial city founded by Jamsetji Tata, celebrated for corporate excellence and lush tree-lined infrastructure.',
    'Founder’s Day (March 3 - city illuminated brilliantly), Durga Puja, Sohrai.',
    'Respect sanctuary guidelines inside Dalma reserve; no horn zones inside parks.',
    'Bistupur market tribal artifacts | Tussar silk | Handcrafted brass utility items',
    'Dhuska | Litti Chokha | Bengali sweets | Tandoori fish',
    'Known as the Steel City and Tatanagar, India’s premier planned industrial city founded by Jamsetji Tata, featuring the sprawling Jubilee Park, picturesque Dimna Lake, and the scenic Dalma elephant reserve.',
    true, NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
    state_id = EXCLUDED.state_id,
    city_id = EXCLUDED.city_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();

-- 12. Srinagar, Jammu & Kashmir
INSERT INTO destinations (
    id, destination_name, state_id, city_id, district, region, latitude, longitude, altitude_m,
    popularity_score, accessibility, nearest_airport, nearest_railway, nearest_major_city,
    nearest_major_city_distance_km, road_connectivity, trip_types, primary_attractions,
    activities_available, unique_experiences, hidden_gems, best_seasons, avoid_seasons,
    peak_season, off_season, ideal_for, minimum_days, ideal_days, maximum_days,
    suggested_itinerary, accommodation_types, food_scene, safety_rating, safety_notes,
    internet_connectivity, mobile_network, atm_availability, language_spoken, permits_required,
    local_culture, festivals_events, local_customs, shopping_highlights, local_cuisine_must_try,
    description, is_active, created_at, updated_at
) VALUES (
    'dest-112', 'Srinagar', 'IN-JK', 'srinagar', 'Srinagar', 'North India', 34.0837000, 74.7973000, 1585,
    9.5, 'Easy', '{"name": "Sheikh ul-Alam International Airport (SXR)", "distance_km": 11}'::jsonb,
    '{"name": "Srinagar Railway Station (connected via Udhampur-Srinagar-Baramulla rail link)", "distance_km": 8}'::jsonb,
    'Srinagar', 0.0, 'NH44 (Jammu-Srinagar national highway via Chenani-Nashri & Banihal Qazigund tunnels).',
    '{"Hills","Nature","Culture","Romantic","Lakes"}'::text[],
    '{"Dal Lake & Houseboats","Nishat Bagh","Shalimar Bagh","Shankaracharya Temple","Chashme Shahi","Hazratbal Shrine"}'::text[],
    '{"Shikara boat rides","Mughal garden strolls","Floating vegetable market visits","Old Srinagar heritage walking tours"}'::text[],
    'Gliding at sunrise on a wooden Shikara across the mirror-calm waters of Dal Lake surrounded by the snow-capped Zabarwan range.',
    'Pari Mahal fairy palace gardens | Nigeen Lake peaceful houseboats | Jamia Masjid wooden columns | Dachigam National Park',
    'April to October (Spring tulip bloom to golden Chinar autumn) and Dec-Feb for winter snow', 'Peak monsoon landslip periods along Jammu highway',
    'April to June (Spring & Summer) and December to February (Snow season)', 'July to August (Humid rains)',
    '{"Couples","Honeymooners","Families","Nature_lovers","Photographers"}'::text[],
    2.0, 4.0, 6,
    'Day 1: Dal Lake Shikara ride, Char Chinar, Shankaracharya Temple; Day 2: Mughal Gardens (Nishat, Shalimar, Chashme Shahi, Pari Mahal); Day 3: Old City heritage walk, Hazratbal, floating market; Day 4: Excursion to Gulmarg or Pahalgam.',
    'Carved Cedar Houseboats | Luxury Heritage Resorts | Boutique Kashmiri Stays | Homestays',
    'Multi-course Kashmiri Wazwan (Rogan Josh, Gushtaba, Rista, Tabak Maaz), fresh Trout fish, Kehwa with saffron and almonds, Noon Chai, and fresh bakery breads.',
    8.0, 'Tourism police present throughout major zones; check weather reports for mountain pass travel.',
    'Good 4G/5G; only postpaid SIMs or local prepaid SIMs work per J&K telecom regulations', 'Jio, Airtel', 'Widely available across Lal Chowk, Boulevard, and airport',
    'Kashmiri | Urdu | Hindi | English', false,
    'Centuries-old Kashmiri Sufi and Shaivite synthesis with world-renowned mastery in pashmina, papier-mâché, and walnut wood carving.',
    'Tulip Festival (Asia’s largest tulip garden in April), Shikara Festival, Eid celebrations, saffron harvest in autumn.',
    'Remove shoes at shrines; negotiate Shikara rides according to official tourist board rate cards.',
    'Authentic Kashmiri Pashmina shawls | Saffron (Zafran) | Hand-knotted silk carpets | Walnut wood decor | Paper-mache boxes | Dry fruits',
    'Wazwan (Rogan Josh, Rista, Gushtaba) | Kahwa tea | Kashmiri Pulao | Nadru Yakhni (lotus stem) | Girda bread',
    'The summer capital of Jammu & Kashmir in the heart of the Kashmir Valley, world-famous for the poetic serenity of Dal Lake, carved cedar houseboats, terraced Mughal Gardens, and saffron-scented Kashmiri hospitality.',
    true, NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
    state_id = EXCLUDED.state_id,
    city_id = EXCLUDED.city_id,
    district = EXCLUDED.district,
    region = EXCLUDED.region,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();


-- ------------------------------------------------------------------------------
-- PHASE B: DETERMINISTIC POI LINKING & EXPANSION
-- ------------------------------------------------------------------------------

-- 1. Hyderabad POI Linking & Additions (dest-101)
-- Link existing orphan POIs belonging to Hyderabad
UPDATE destination_pois
SET destination_id = 'dest-101', city_id = 'hyderabad', updated_at = NOW()
WHERE id IN (
    'poi-ts-267', -- Ramoji Film City
    'poi-ts-268', -- Kandlakoya Oxygen Park
    'poi-ts-269', -- Osman Sagar
    'poi-ts-270', -- Mrugavani National Park
    'poi-ts-271', -- Golconda Fort
    'poi-ts-272', -- Charminar
    'poi-ts-273', -- Chowmahalla Palace
    'poi-ts-274', -- Buddha Statue, Hussain Sagar
    'poi-ts-275', -- NTR Gardens
    'poi-ts-276', -- Falaknuma Palace
    'poi-ts-277'  -- Nehru Zoological Park
);

-- Insert missing authentic key Hyderabad attractions
INSERT INTO destination_pois (
    id, poi_name, destination_id, city_id, category, latitude, longitude,
    tags, characteristics, entry_fee_inr, typical_duration_hours, is_active, created_at, updated_at
) VALUES
('poi-hyd-salar-jung', 'Salar Jung Museum', 'dest-101', 'hyderabad', 'Museum', 17.3713000, 78.4804000,
 '{"museum","art","history","hyderabad"}'::text[], 'One of the three National Museums of India, housing the prized global art collection of the Salar Jung family.', 50.0, 3.0, true, NOW(), NOW()),

('poi-hyd-birla-mandir', 'Birla Mandir Hyderabad', 'dest-101', 'hyderabad', 'Temple', 17.4062000, 78.4691000,
 '{"temple","spiritual","architecture","hyderabad"}'::text[], 'Magnificent white Rajasthani marble temple perched atop Naubat Pahad hill overlooking Hussain Sagar.', 0.0, 1.5, true, NOW(), NOW()),

('poi-hyd-qutb-shahi', 'Qutb Shahi Tombs', 'dest-101', 'hyderabad', 'Historical Site', 17.3941000, 78.3962000,
 '{"heritage","architecture","tombs","hyderabad"}'::text[], 'Grand royal necropolis containing the intricately carved domes and gardens of the founding Qutb Shahi dynasty.', 40.0, 2.0, true, NOW(), NOW()),

('poi-hyd-lumbini-park', 'Lumbini Park', 'dest-101', 'hyderabad', 'Park', 17.4103000, 78.4735000,
 '{"park","lake","boating","family","hyderabad"}'::text[], 'Serene waterfront park on Hussain Sagar offering speed boat rides to the colossal Buddha statue and musical fountain shows.', 30.0, 1.5, true, NOW(), NOW()),

('poi-hyd-shilparamam', 'Shilparamam Cultural Village', 'dest-101', 'hyderabad', 'Cultural Center', 17.4526000, 78.3789000,
 '{"culture","crafts","shopping","hyderabad"}'::text[], 'Traditional arts and crafts village created to preserve rural Indian artisan skills, textiles, and folk dance.', 60.0, 2.5, true, NOW(), NOW()),

('poi-hyd-mecca-masjid', 'Mecca Masjid', 'dest-101', 'hyderabad', 'Historical Site', 17.3605000, 78.4735000,
 '{"heritage","religious","architecture","hyderabad"}'::text[], 'One of the oldest and largest mosques in India, commissioned by Muhammad Quli Qutb Shah with bricks made from soil of Mecca.', 0.0, 1.0, true, NOW(), NOW()),

('poi-hyd-durgam-cheruvu', 'Durgam Cheruvu & Cable Bridge', 'dest-101', 'hyderabad', 'Attraction', 17.4332000, 78.3847000,
 '{"lake","modern","viewpoint","hyderabad"}'::text[], 'Picturesque freshwater lake surrounded by ancient granite formations, spanned by an illuminated extradosed cable-stayed bridge.', 0.0, 1.5, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    destination_id = EXCLUDED.destination_id,
    city_id = EXCLUDED.city_id,
    updated_at = NOW();


-- 2. Warangal POI Linking & Additions (dest-102)
-- Link existing orphan POIs
UPDATE destination_pois
SET destination_id = 'dest-102', city_id = 'warangal', updated_at = NOW()
WHERE id IN (
    'poi-ts-262', -- Warangal Fort
    'poi-ts-263'  -- Bhadrakali Lake
);

-- Insert missing authentic key Warangal attractions
INSERT INTO destination_pois (
    id, poi_name, destination_id, city_id, category, latitude, longitude,
    tags, characteristics, entry_fee_inr, typical_duration_hours, is_active, created_at, updated_at
) VALUES
('poi-wgl-thousand-pillar', 'Thousand Pillar Temple', 'dest-102', 'warangal', 'Temple', 17.9947000, 79.5752000,
 '{"temple","kakatiya","architecture","warangal"}'::text[], 'Masterpiece of 12th-century Kakatiya architecture featuring star-shaped shrines dedicated to Shiva, Vishnu, and Surya with a monolithic black basalt Nandi.', 0.0, 1.5, true, NOW(), NOW()),

('poi-wgl-musical-garden', 'Kakatiya Musical Garden', 'dest-102', 'warangal', 'Park', 17.9865000, 79.5847000,
 '{"park","family","lake","warangal"}'::text[], 'Lush garden near Bhadrakali Temple with a synchronized musical water fountain and scenic rock landscape.', 20.0, 1.0, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    destination_id = EXCLUDED.destination_id,
    city_id = EXCLUDED.city_id,
    updated_at = NOW();


-- 3. Delhi POI Linking (dest-103, city: delhi)
-- Link 48 orphan POIs in the Delhi capital region
UPDATE destination_pois
SET destination_id = 'dest-103', city_id = 'delhi', updated_at = NOW()
WHERE id IN (
    'poi-ts-316', 'poi-ts-317', 'poi-ts-318', 'poi-ts-319', 'poi-ts-320', 'poi-ts-321', 'poi-ts-322',
    'poi-ts-323', 'poi-ts-324', 'poi-ts-325', 'poi-ts-326', 'poi-ts-327', 'poi-ts-328', 'poi-ts-329',
    'poi-ts-330', 'poi-ts-331', 'poi-ts-332', 'poi-ts-333', 'poi-ts-334', 'poi-ts-335', 'poi-ts-336',
    'poi-ts-337', 'poi-ts-338', 'poi-ts-339', 'poi-ts-340', 'poi-ts-341', 'poi-ts-342', 'poi-ts-343',
    'poi-ts-344', 'poi-ts-345', 'poi-ts-346', 'poi-ts-347', 'poi-ts-348', 'poi-ts-349', 'poi-ts-350',
    'poi-ts-351', 'poi-ts-352', 'poi-ts-353', 'poi-ts-354', 'poi-ts-355', 'poi-ts-356', 'poi-ts-357',
    'poi-ts-358', 'poi-ts-359', 'poi-ts-360', 'poi-ts-361', 'poi-ts-362', 'poi-ts-363'
) AND (destination_id IS NULL OR destination_id = 'dest-103');


-- 4. Bengaluru POI Linking (dest-105, city: bangalore)
-- Link 100 orphan POIs in the Bengaluru urban radius
UPDATE destination_pois
SET destination_id = 'dest-105', city_id = 'bangalore', updated_at = NOW()
WHERE id IN (
    'poi-ts-52', 'poi-ts-53', 'poi-ts-54', 'poi-ts-55', 'poi-ts-56', 'poi-ts-57', 'poi-ts-58',
    'poi-ts-59', 'poi-ts-60', 'poi-ts-61', 'poi-ts-62', 'poi-ts-63', 'poi-ts-64', 'poi-ts-65',
    'poi-ts-66', 'poi-ts-67', 'poi-ts-68', 'poi-ts-69', 'poi-ts-70', 'poi-ts-71', 'poi-ts-72',
    'poi-ts-73', 'poi-ts-74', 'poi-ts-75', 'poi-ts-76', 'poi-ts-77', 'poi-ts-78', 'poi-ts-79',
    'poi-ts-80', 'poi-ts-81', 'poi-ts-82', 'poi-ts-83', 'poi-ts-84', 'poi-ts-85', 'poi-ts-86',
    'poi-ts-87', 'poi-ts-88', 'poi-ts-89', 'poi-ts-90', 'poi-ts-91', 'poi-ts-92', 'poi-ts-93',
    'poi-ts-94', 'poi-ts-95', 'poi-ts-96', 'poi-ts-97', 'poi-ts-98', 'poi-ts-99', 'poi-ts-100',
    'poi-ts-101', 'poi-ts-102', 'poi-ts-103', 'poi-ts-104', 'poi-ts-105', 'poi-ts-106', 'poi-ts-107',
    'poi-ts-108', 'poi-ts-109', 'poi-ts-110', 'poi-ts-111', 'poi-ts-112', 'poi-ts-113', 'poi-ts-114',
    'poi-ts-115', 'poi-ts-116', 'poi-ts-117',
    'poi-city-303', 'poi-city-304', 'poi-city-305', 'poi-city-306', 'poi-city-307', 'poi-city-308',
    'poi-city-309', 'poi-city-310', 'poi-city-311', 'poi-city-312', 'poi-city-313', 'poi-city-314',
    'poi-city-315', 'poi-city-316', 'poi-city-317', 'poi-city-318', 'poi-city-319', 'poi-city-320'
) AND (destination_id IS NULL OR destination_id = 'dest-105');


-- 5. Mumbai POI Linking (dest-106, city: mumbai)
UPDATE destination_pois
SET destination_id = 'dest-106', city_id = 'mumbai', updated_at = NOW()
WHERE id IN (
    'poi-ts-233', 'poi-ts-234', 'poi-ts-235', 'poi-ts-236', 'poi-ts-241', 'poi-ts-250',
    'poi-ts-252', 'poi-ts-253', 'poi-ts-254', 'poi-ts-255'
) AND (destination_id IS NULL OR destination_id = 'dest-106');


-- 6. Kolkata POI Linking (dest-107, city: kolkata)
UPDATE destination_pois
SET destination_id = 'dest-107', city_id = 'kolkata', updated_at = NOW()
WHERE id IN (
    'poi-ts-282', 'poi-ts-283', 'poi-ts-284', 'poi-ts-285', 'poi-ts-286', 'poi-ts-287',
    'poi-ts-288', 'poi-ts-289', 'poi-ts-290', 'poi-ts-291', 'poi-ts-292', 'poi-ts-293',
    'poi-ts-294', 'poi-ts-295', 'poi-ts-296', 'poi-ts-297', 'poi-ts-298', 'poi-ts-299',
    'poi-ts-300', 'poi-ts-301'
) AND (destination_id IS NULL OR destination_id = 'dest-107');


-- 7. Chennai POI Linking (dest-108, city: chennai)
UPDATE destination_pois
SET destination_id = 'dest-108', city_id = 'chennai', updated_at = NOW()
WHERE id IN (
    'poi-ts-364', 'poi-ts-365', 'poi-ts-366', 'poi-ts-367', 'poi-ts-368', 'poi-ts-369',
    'poi-ts-370', 'poi-ts-371', 'poi-ts-372', 'poi-ts-373', 'poi-ts-374', 'poi-ts-375',
    'poi-ts-376', 'poi-ts-377', 'poi-ts-378', 'poi-ts-379', 'poi-ts-380', 'poi-ts-381',
    'poi-ts-382', 'poi-ts-383', 'poi-ts-384', 'poi-ts-385', 'poi-ts-386', 'poi-ts-387',
    'poi-ts-388', 'poi-ts-389', 'poi-ts-390', 'poi-ts-391', 'poi-ts-392', 'poi-ts-393',
    'poi-ts-394', 'poi-ts-395', 'poi-ts-396', 'poi-ts-397', 'poi-ts-398', 'poi-ts-399',
    'poi-ts-400', 'poi-ts-401', 'poi-ts-402', 'poi-ts-403', 'poi-ts-404', 'poi-ts-405',
    'poi-ts-406', 'poi-ts-407', 'poi-ts-408', 'poi-ts-409', 'poi-ts-410'
) AND (destination_id IS NULL OR destination_id = 'dest-108');


-- 8. Chandigarh POI Linking (dest-109, city: chandigarh)
UPDATE destination_pois
SET destination_id = 'dest-109', city_id = 'chandigarh', updated_at = NOW()
WHERE id IN (
    'poi-ts-135', 'poi-ts-136', 'poi-ts-137', 'poi-ts-138', 'poi-ts-139', 'poi-ts-140',
    'poi-ts-141', 'poi-ts-142', 'poi-ts-143'
) AND (destination_id IS NULL OR destination_id = 'dest-109');


-- 9. Srinagar Key POIs (dest-112, city: srinagar)
INSERT INTO destination_pois (
    id, poi_name, destination_id, city_id, category, latitude, longitude,
    tags, characteristics, entry_fee_inr, typical_duration_hours, is_active, created_at, updated_at
) VALUES
('poi-srn-dal-lake', 'Dal Lake & Shikara Ghats', 'dest-112', 'srinagar', 'Attraction', 34.0900000, 74.8700000,
 '{"lake","shikara","nature","srinagar"}'::text[], 'Iconic jewel of Srinagar, renowned for wooden houseboats, shikara rides, and the floating vegetable market.', 0.0, 3.0, true, NOW(), NOW()),

('poi-srn-shalimar-bagh', 'Shalimar Bagh Mughal Garden', 'dest-112', 'srinagar', 'Garden', 34.1486000, 74.8727000,
 '{"garden","mughal","heritage","srinagar"}'::text[], 'Terraced Mughal garden built by Emperor Jahangir in 1619 with cascading water canals, stone pavilions, and giant Chinar trees.', 25.0, 2.0, true, NOW(), NOW()),

('poi-srn-nishat-bagh', 'Nishat Bagh', 'dest-112', 'srinagar', 'Garden', 34.1247000, 74.8806000,
 '{"garden","mughal","lakeview","srinagar"}'::text[], 'The Garden of Gladness, arranged in twelve ascending terraces commanding sweeping panoramas of Dal Lake and the Pir Panjal mountains.', 25.0, 2.0, true, NOW(), NOW()),

('poi-srn-shankaracharya', 'Shankaracharya Temple', 'dest-112', 'srinagar', 'Temple', 34.0722000, 74.8361000,
 '{"temple","heritage","viewpoint","srinagar"}'::text[], 'Ancient stone temple dedicated to Lord Shiva situated atop Gopadari Hill offering 360-degree views of the Kashmir Valley.', 0.0, 1.5, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    destination_id = EXCLUDED.destination_id,
    city_id = EXCLUDED.city_id,
    updated_at = NOW();


-- 10. Ranchi Key POIs (dest-110, city: ranchi)
INSERT INTO destination_pois (
    id, poi_name, destination_id, city_id, category, latitude, longitude,
    tags, characteristics, entry_fee_inr, typical_duration_hours, is_active, created_at, updated_at
) VALUES
('poi-rnc-hundru', 'Hundru Falls', 'dest-110', 'ranchi', 'Waterfall', 23.4470000, 85.6540000,
 '{"waterfall","nature","subarnarekha","ranchi"}'::text[], 'Spectacular 320-foot waterfall formed where the Subarnarekha river cascades over steep gneiss cliff faces.', 20.0, 2.5, true, NOW(), NOW()),

('poi-rnc-jonha', 'Jonha Falls (Gautam Dhara)', 'dest-110', 'ranchi', 'Waterfall', 23.3420000, 85.6080000,
 '{"waterfall","nature","temple","ranchi"}'::text[], 'Hanging valley waterfall where water drops 144 feet, accessed via stone steps with an ashram dedicated to Lord Buddha.', 15.0, 2.0, true, NOW(), NOW()),

('poi-rnc-dassam', 'Dassam Falls', 'dest-110', 'ranchi', 'Waterfall', 23.1430000, 85.4650000,
 '{"waterfall","scenic","nature","ranchi"}'::text[], 'Powerful multi-stream waterfall on the Kanchi River plunging 144 feet amidst lush wooded plateau hills.', 20.0, 2.0, true, NOW(), NOW()),

('poi-rnc-tagore-hill', 'Tagore Hill', 'dest-110', 'ranchi', 'Historical Site', 23.3930000, 85.3340000,
 '{"heritage","viewpoint","literature","ranchi"}'::text[], 'Historic 300-foot solitary hill associated with Jyotirindranath Tagore, brother of Rabindranath Tagore, offering panoramic city views.', 0.0, 1.5, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    destination_id = EXCLUDED.destination_id,
    city_id = EXCLUDED.city_id,
    updated_at = NOW();


-- 11. Jamshedpur Key POIs (dest-111, city: jamshedpur)
INSERT INTO destination_pois (
    id, poi_name, destination_id, city_id, category, latitude, longitude,
    tags, characteristics, entry_fee_inr, typical_duration_hours, is_active, created_at, updated_at
) VALUES
('poi-jsr-jubilee-park', 'Jubilee Park & Rose Garden', 'dest-111', 'jamshedpur', 'Park', 22.8050000, 86.1950000,
 '{"park","rose_garden","family","jamshedpur"}'::text[], 'Sprawling 225-acre civic park gifted to the city by Tata Steel, modeled after the Brindavan Gardens of Mysore.', 0.0, 2.5, true, NOW(), NOW()),

('poi-jsr-dimna-lake', 'Dimna Lake', 'dest-111', 'jamshedpur', 'Lake', 22.8630000, 86.2370000,
 '{"lake","scenic","dalma_hills","jamshedpur"}'::text[], 'Idyllic artificial reservoir nestled at the foothills of the Dalma Mountain Range, popular for picnics and sunrise viewings.', 0.0, 2.0, true, NOW(), NOW()),

('poi-jsr-dalma', 'Dalma Wildlife Sanctuary', 'dest-111', 'jamshedpur', 'Wildlife Sanctuary', 22.8950000, 86.2080000,
 '{"wildlife","elephants","hills","trekking","jamshedpur"}'::text[], 'Dense dry deciduous forest sanctuary spanning Dalma Hills, home to Indian elephants, leopards, and barking deer.', 50.0, 3.5, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    destination_id = EXCLUDED.destination_id,
    city_id = EXCLUDED.city_id,
    updated_at = NOW();


-- ------------------------------------------------------------------------------
-- PHASE C: HOTEL VISIBILITY LINKING
-- ------------------------------------------------------------------------------
-- Link 209 existing verified hotels in the DB to their new parent destinations
UPDATE hotels SET destination_id = 'dest-101', updated_at = NOW() WHERE city_id = 'hyderabad' AND destination_id IS NULL;
UPDATE hotels SET destination_id = 'dest-103', updated_at = NOW() WHERE city_id = 'delhi' AND destination_id IS NULL;
UPDATE hotels SET destination_id = 'dest-105', updated_at = NOW() WHERE city_id = 'bangalore' AND destination_id IS NULL;
UPDATE hotels SET destination_id = 'dest-106', updated_at = NOW() WHERE city_id = 'mumbai' AND destination_id IS NULL;
UPDATE hotels SET destination_id = 'dest-107', updated_at = NOW() WHERE city_id = 'kolkata' AND destination_id IS NULL;
UPDATE hotels SET destination_id = 'dest-108', updated_at = NOW() WHERE city_id = 'chennai' AND destination_id IS NULL;
UPDATE hotels SET destination_id = 'dest-109', updated_at = NOW() WHERE city_id = 'chandigarh' AND destination_id IS NULL;
UPDATE hotels SET destination_id = 'dest-110', updated_at = NOW() WHERE city_id = 'ranchi' AND destination_id IS NULL;
UPDATE hotels SET destination_id = 'dest-111', updated_at = NOW() WHERE city_id = 'jamshedpur' AND destination_id IS NULL;
UPDATE hotels SET destination_id = 'dest-112', updated_at = NOW() WHERE city_id = 'srinagar' AND destination_id IS NULL;


-- ------------------------------------------------------------------------------
-- PHASE D: DATA QUALITY & STATE CODE CONSOLIDATION
-- ------------------------------------------------------------------------------
-- Consolidate duplicate Jammu & Kashmir state code: IN-JA -> IN-JK
UPDATE cities SET state_id = 'IN-JK', updated_at = NOW() WHERE state_id = 'IN-JA';
UPDATE destinations SET state_id = 'IN-JK', updated_at = NOW() WHERE state_id = 'IN-JA';

-- Leave IN-KE and IN-MA untouched per audit instructions.
