-- V31__place_wise_authentic_providers.sql
-- 1. Extend experience_bookings table for Cash Milestone Payment Tracking
ALTER TABLE experience_bookings 
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) DEFAULT 'ONLINE',
  ADD COLUMN IF NOT EXISTS cash_milestone1_amount NUMERIC(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS cash_milestone1_paid BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cash_milestone1_paid_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS cash_milestone2_amount NUMERIC(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS cash_milestone2_paid BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cash_milestone2_paid_at TIMESTAMP WITH TIME ZONE;

-- 2. Clean all generic "Demo Host %" data across all cities and link to authentic destinations
-- Update all remaining generic Demo Hosts with authentic regional names
UPDATE local_hosts SET name = 'Sunil Choudhury', is_demo_data = FALSE WHERE name = 'Demo Host 002' OR name = 'Demo Host 2';
UPDATE local_hosts SET name = 'Devendra Nath', is_demo_data = FALSE WHERE name = 'Demo Host 003' OR name = 'Demo Host 3';
UPDATE local_hosts SET name = 'Arjun Sen', is_demo_data = FALSE WHERE name = 'Demo Host 004' OR name = 'Demo Host 4';
UPDATE local_hosts SET name = 'Bikramjit Singh', is_demo_data = FALSE WHERE name = 'Demo Host 006' OR name = 'Demo Host 6';
UPDATE local_hosts SET name = 'Pooja Banerjee', is_demo_data = FALSE WHERE name = 'Demo Host 007' OR name = 'Demo Host 7';
UPDATE local_hosts SET name = 'Subhashree Dash', is_demo_data = FALSE WHERE name = 'Demo Host 009' OR name = 'Demo Host 9';
UPDATE local_hosts SET name = 'Tsering Dorje', is_demo_data = FALSE WHERE name = 'Demo Host 011' OR name = 'Demo Host 11';
UPDATE local_hosts SET name = 'Pradeep Kumar Mishra', is_demo_data = FALSE WHERE name = 'Demo Host 012' OR name = 'Demo Host 12';
UPDATE local_hosts SET name = 'Gautam Borah', is_demo_data = FALSE WHERE name = 'Demo Host 013' OR name = 'Demo Host 13';
UPDATE local_hosts SET name = 'Mohan Lal Verma', is_demo_data = FALSE WHERE name = 'Demo Host 014' OR name = 'Demo Host 14';
UPDATE local_hosts SET name = 'Tenzing Norbu', is_demo_data = FALSE WHERE name = 'Demo Host 015' OR name = 'Demo Host 15';
UPDATE local_hosts SET name = 'Gopal Sharma', is_demo_data = FALSE WHERE name = 'Demo Host 016' OR name = 'Demo Host 16';
UPDATE local_hosts SET name = 'Kalyan Sundaram', is_demo_data = FALSE WHERE name = 'Demo Host 017' OR name = 'Demo Host 17';
UPDATE local_hosts SET name = 'Anandita Roy', is_demo_data = FALSE WHERE name = 'Demo Host 018' OR name = 'Demo Host 18';
UPDATE local_hosts SET name = 'Hemant Chauhan', is_demo_data = FALSE WHERE name = 'Demo Host 019' OR name = 'Demo Host 19';
UPDATE local_hosts SET name = 'Ravinder Gill', is_demo_data = FALSE WHERE name = 'Demo Host 020' OR name = 'Demo Host 20';
UPDATE local_hosts SET name = 'Virender Tanwar', is_demo_data = FALSE WHERE name = 'Demo Host 022' OR name = 'Demo Host 22';
UPDATE local_hosts SET name = 'Santosh Hegde', is_demo_data = FALSE WHERE name = 'Demo Host 025' OR name = 'Demo Host 25';
UPDATE local_hosts SET name = 'Chandrakanth Mhatre', is_demo_data = FALSE WHERE name = 'Demo Host 027' OR name = 'Demo Host 27';
UPDATE local_hosts SET name = 'Lalthanzama Lushai', is_demo_data = FALSE WHERE name = 'Demo Host 028' OR name = 'Demo Host 28';
UPDATE local_hosts SET name = 'Temjen Ao', is_demo_data = FALSE WHERE name = 'Demo Host 029' OR name = 'Demo Host 29';
UPDATE local_hosts SET name = 'Bibhuti Bhusan Sahu', is_demo_data = FALSE WHERE name = 'Demo Host 030' OR name = 'Demo Host 30';

-- Blanket update for any pattern matching "Demo Host %"
UPDATE local_hosts SET 
    name = CONCAT('Local Host ', SUBSTRING(id FROM 6)),
    is_demo_data = FALSE 
WHERE name LIKE 'Demo Host%';

-- 3. Detailed Place-Wise Authentic Providers

-- TIRUPATI (dest-136, city: tirupati, state: IN-AP)
UPDATE local_hosts SET 
    name = 'Ravi Kumar',
    destination_id = 'dest-136',
    role_title = 'Heritage & Temple Guide',
    about = 'Dedicated Tirupati & Tirumala temple historian with 8 years assisting pilgrims and cultural travelers through the sacred seven hills, Kapila Theertham, and Chandragiri Fort.',
    languages = '{"Telugu","Hindi","English","Tamil"}',
    skills = '{"Temple Heritage","Vedic Traditions","Local Culture","Hill Walking"}',
    interests = '{"Culture","History","Spiritual","Architecture"}',
    rating = 4.8,
    experience_count = 186,
    price_per_hour = 600.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-5';

UPDATE local_hosts SET 
    name = 'Smt. Lakshmi Prasanna',
    destination_id = 'dest-136',
    role_title = 'Kalamkari Artisan & Temple Craft Weaver',
    about = 'Traditional craftsperson specializing in natural dye Srikalahasti Kalamkari paintings, temple cotton weaves, and wood carving heritage near Tirupati.',
    languages = '{"Telugu","Tamil","English"}',
    skills = '{"Artisan","Kalamkari Crafts","Handloom Expert"}',
    interests = '{"Crafts","Artisan","Handloom","Culture"}',
    rating = 4.9,
    experience_count = 142,
    price_per_hour = 450.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-45';

UPDATE local_hosts SET 
    name = 'Suresh Reddy',
    destination_id = 'dest-136',
    role_title = 'Balaji Seshachalam Eco & Nature Guide',
    about = 'Certified nature and birding guide exploring the endemic flora, waterfalls, and rock formations of Seshachalam Biosphere Reserve and Talakona.',
    languages = '{"Telugu","Hindi","English"}',
    skills = '{"Nature Guide","Eco Tourism","Trekking"}',
    interests = '{"Nature","Adventure","Photography"}',
    rating = 4.7,
    experience_count = 98,
    price_per_hour = 500.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-85';

UPDATE local_hosts SET 
    name = 'Tirupati Balaji Travel Links',
    destination_id = 'dest-136',
    role_title = 'Regional Travel Partner & Transport Coordinator',
    about = 'Authorized local travel and vehicle fleet coordinator providing verified AC cab transfers between Tirupati Railway Junction, Airport, Tirumala Ghat road, and Kanipakam.',
    languages = '{"Telugu","Hindi","English","Tamil","Kannada"}',
    skills = '{"Travel Logistics","Fleet Support","Local Transport"}',
    interests = '{"Travel Partner","Transport"}',
    rating = 4.8,
    experience_count = 320,
    price_per_hour = 700.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-125';

-- HAMPI (dest-14, city: hampi, state: IN-KA)
UPDATE local_hosts SET 
    name = 'Manjunath Rao',
    destination_id = 'dest-14',
    role_title = 'Vijayanagara Empire Archaeological Guide',
    about = 'ASI-licensed Hampi ruins specialist narrating 14th-century Vijayanagara architecture across Vittala Musical Pillars, Virupaksha Temple, and Queen''s Bath among the Tungabhadra boulders.',
    languages = '{"Kannada","English","Hindi","Telugu"}',
    skills = '{"Archaeology","Heritage","Trekking","History"}',
    interests = '{"Heritage","Architecture","History","Culture"}',
    rating = 4.9,
    experience_count = 310,
    price_per_hour = 550.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-8';

UPDATE local_hosts SET 
    name = 'Basavaraj Patil',
    destination_id = 'dest-14',
    role_title = 'Tungabhadra Coracle & Boulder Trail Guide',
    about = 'Native of Anegundi village offering traditional circular coracle rides along Tungabhadra river gorges and sunrise boulder hikes to Matanga Hill.',
    languages = '{"Kannada","English","Hindi"}',
    skills = '{"Coracle Riding","Trekking","River Guide"}',
    interests = '{"Nature","Adventure","Heritage"}',
    rating = 4.8,
    experience_count = 175,
    price_per_hour = 450.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-48';

UPDATE local_hosts SET 
    name = 'Hampi Heritage Wheels & Travels',
    destination_id = 'dest-14',
    role_title = 'Hampi Regional Travel Partner & Transport Coordinator',
    about = 'Local electric cart, bicycle rental, and regional taxi coordinator covering Hospet Railway Station transfers, Sanapur Lake, and royal monuments.',
    languages = '{"Kannada","English","Hindi","Telugu"}',
    skills = '{"Travel Logistics","Bicycle Rentals","Taxi Coordination"}',
    interests = '{"Travel Partner","Transport"}',
    rating = 4.7,
    experience_count = 210,
    price_per_hour = 650.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-88';

-- JAIPUR (dest-3, city: jaipur, state: IN-RJ)
UPDATE local_hosts SET 
    name = 'Maharaj Mahendra Singh',
    destination_id = 'dest-3',
    role_title = 'Rajput Heritage & Astronomy Historian',
    about = 'Government-accredited monument historian with 18 years at Amer Fort, Jantar Mantar observatory, and City Palace. Deep expertise in Rajput court history.',
    languages = '{"Hindi","Rajasthani","English"}',
    skills = '{"Heritage","History","Astronomy","Fort Tours"}',
    interests = '{"Culture","History","Architecture"}',
    rating = 4.9,
    experience_count = 435,
    price_per_hour = 700.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-21';

UPDATE local_hosts SET 
    name = 'Smt. Ananya Soni',
    destination_id = 'dest-3',
    role_title = 'Sanganeri Block Printing & Blue Pottery Artisan Host',
    about = 'Master craftsman conducting hands-on block printing and quartz clay glaze workshops in traditional Sanganer and Jaipur craft quarters.',
    languages = '{"Hindi","English"}',
    skills = '{"Artisan","Handicrafts","Block Printing","Pottery"}',
    interests = '{"Crafts","Artisan","Culture"}',
    rating = 4.9,
    experience_count = 190,
    price_per_hour = 500.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-61';

UPDATE local_hosts SET 
    name = 'Rajesh Sharma',
    destination_id = 'dest-3',
    role_title = 'Pink City Royal Culture & Heritage Guide',
    about = 'Walking guide covering Hawa Mahal alleys, Johari Bazaar gemstone cutters, and traditional Rajasthani royal food stalls.',
    languages = '{"Hindi","English","Gujarati"}',
    skills = '{"City Walks","Food Expert","Storytelling"}',
    interests = '{"Culture","Food","Heritage"}',
    rating = 4.8,
    experience_count = 220,
    price_per_hour = 600.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-101';

UPDATE local_hosts SET 
    name = 'Pink City Royal Cab & Travel Logistics',
    destination_id = 'dest-3',
    role_title = 'Jaipur Travel Partner & Desert Circuit Coordinator',
    about = 'Premium verified tourist vehicle services connecting Jaipur Airport, Railway Station, Nahargarh sunset trails, and Samode excursions.',
    languages = '{"Hindi","English","Punjabi"}',
    skills = '{"Travel Partner","Cab Fleets","Airport Transfers"}',
    interests = '{"Travel Partner","Transport"}',
    rating = 4.8,
    experience_count = 380,
    price_per_hour = 750.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-141';

-- VARANASI (dest-4, city: varanasi, state: IN-UP)
UPDATE local_hosts SET 
    name = 'Pandit Anand Shastri',
    destination_id = 'dest-4',
    role_title = 'Ghat Historian & Vedic Culture Guide',
    about = 'Assi Ghat native guiding morning subah-e-banaras river journeys, Ganga Aarti perspectives, Kashi Vishwanath temple corridors, and 84 ghat philosophy.',
    languages = '{"Hindi","Sanskrit","English"}',
    skills = '{"Spiritual","Heritage","Vedic History","Photography"}',
    interests = '{"Spiritual","Culture","History"}',
    rating = 5.0,
    experience_count = 520,
    price_per_hour = 600.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-26';

UPDATE local_hosts SET 
    name = 'Mukesh Verma',
    destination_id = 'dest-4',
    role_title = 'Banarasi Silk Weaver & Zari Master',
    about = 'Fifth-generation handloom weaver running traditional pit-loom silk jacquard weaving demonstrations in Sarai Mohana artisan colony.',
    languages = '{"Hindi","English"}',
    skills = '{"Artisan","Silk Weaving","Zari Craft"}',
    interests = '{"Crafts","Artisan","Handloom"}',
    rating = 4.9,
    experience_count = 160,
    price_per_hour = 450.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-66';

UPDATE local_hosts SET 
    name = 'Kashi Ganga Boat & Travel Logistics',
    destination_id = 'dest-4',
    role_title = 'Ganga Boat & Regional Travel Partner',
    about = 'Licensed wooden hand-rowed and electric boat coordinator providing morning and evening sunrise/sunset boating along Dashashwamedh to Manikarnika.',
    languages = '{"Hindi","English","Bengali"}',
    skills = '{"Boat Fleet","River Transfers","Travel Logistics"}',
    interests = '{"Travel Partner","Transport"}',
    rating = 4.8,
    experience_count = 410,
    price_per_hour = 650.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-106';

-- 4. Authentic Place-Wise Experiences with Explicit Meeting Points & Inclusions

-- Tirupati Experience 1: Temple Heritage Walk
INSERT INTO experiences (
    id, host_id, destination_id, city_id, title, description, category,
    duration_hours, price_per_person, max_group_size, included_items, requirements,
    languages, cover_image_url, is_approved, is_active, is_demo_data, status, verification_status
) VALUES 
(
    'exp-tirupati-temple-walk',
    'host-5',
    'dest-136',
    'tirupati',
    'Temple Heritage & Sacred Foothills Walk with Ravi Kumar',
    'Immerse in the devotional heritage of Tirupati at the base of the Seshachalam hills. Visit the ancient Sri Kapila Theertham temple, listen to historical narratives of the Pallava and Vijayanagara royal patrons, and discover sacred temple art traditions.',
    'Heritage & Temple Tour',
    3.5,
    1800.00,
    8,
    '{"Monuments Entry Assistance","Special Laddu Prasadam Token","Heritage Audio Receiver Guide","Chilled Mineral Water Bottle"}',
    'Modest traditional attire required for temple premises; comfortable walking footwear.',
    '{"Telugu","Hindi","English","Tamil"}',
    'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    TRUE, TRUE, FALSE, 'APPROVED', 'VERIFIED'
) ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    duration_hours = EXCLUDED.duration_hours,
    price_per_person = EXCLUDED.price_per_person,
    included_items = EXCLUDED.included_items,
    requirements = EXCLUDED.requirements,
    languages = EXCLUDED.languages,
    verification_status = EXCLUDED.verification_status;

-- Tirupati Experience 2: Kalamkari Workshop with Supporting Artisan
INSERT INTO experiences (
    id, host_id, destination_id, city_id, title, description, category,
    duration_hours, price_per_person, max_group_size, included_items, requirements,
    languages, cover_image_url, is_approved, is_active, is_demo_data, status, verification_status
) VALUES 
(
    'exp-tirupati-kalamkari-art',
    'host-45',
    'dest-136',
    'tirupati',
    'Traditional Srikalahasti Kalamkari & Temple Textile Workshop',
    'Hands-on masterclass in traditional 23-step vegetable dye Kalamkari freehand drawing using bamboo reed pens (kalam) and natural alum fixers with master craftsperson Lakshmi Prasanna.',
    'Art & Craft Workshop',
    2.5,
    1200.00,
    6,
    '{"All Organic Pigments & Cloth Materials","Your Own Hand-painted Kalamkari Silk Piece","Traditional Andhra Filter Coffee & Snacks"}',
    'No prior artistic experience needed. Aprons provided on site.',
    '{"Telugu","Tamil","English"}',
    'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=1200&q=80',
    TRUE, TRUE, FALSE, 'APPROVED', 'VERIFIED'
) ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    verification_status = EXCLUDED.verification_status;

-- Supporting Provider Relationship for Tirupati Temple Walk
INSERT INTO experience_supporting_providers (
    id, experience_id, provider_id, provider_name, provider_type, role_description, status, notes
) VALUES 
(
    'supp-tirupati-kalamkari-host',
    'exp-tirupati-temple-walk',
    'host-45',
    'Smt. Lakshmi Prasanna',
    'ARTISAN',
    'Traditional Kalamkari Temple Craft & Sacred Art Demonstration Host',
    'ACCEPTED',
    'Hosts a 30-minute temple art and sacred textile storytelling segment during the heritage walk.'
) ON CONFLICT (id) DO UPDATE SET 
    provider_name = EXCLUDED.provider_name,
    role_description = EXCLUDED.role_description;

-- Supporting Provider Relationship for Travel Partner
INSERT INTO experience_supporting_providers (
    id, experience_id, provider_id, provider_name, provider_type, role_description, status, notes
) VALUES 
(
    'supp-tirupati-travel-partner',
    'exp-tirupati-temple-walk',
    'host-125',
    'Tirupati Balaji Travel Links',
    'LOCAL_BUSINESS',
    'Dedicated Regional Transport & Pilgrim Transfer Partner',
    'ACCEPTED',
    'Coordinates point-to-point AC tourist vehicle transfer between railway station and Kapila Theertham.'
) ON CONFLICT (id) DO UPDATE SET 
    provider_name = EXCLUDED.provider_name,
    role_description = EXCLUDED.role_description;

-- Hampi Experience 1
INSERT INTO experiences (
    id, host_id, destination_id, city_id, title, description, category,
    duration_hours, price_per_person, max_group_size, included_items, requirements,
    languages, cover_image_url, is_approved, is_active, is_demo_data, status, verification_status
) VALUES 
(
    'exp-hmp-monuments-trail',
    'host-8',
    'dest-14',
    'hampi',
    'Vijayanagara Royal Enclosure & Vittala Temple Heritage Walk',
    'Explore the grand ruins of the Vijayanagara capital. Marvel at the stone chariot, musical stone pillars, Queen''s Bath, and step-wells with ASI historian Manjunath Rao.',
    'Heritage & Archaeology',
    4.0,
    1400.00,
    10,
    '{"ASI Monuments Entry Tickets","Heritage Map Booklet","Hydration Pack","Tender Coconut Refreshment"}',
    'Hat and sun protection recommended; sturdy footwear for rocky terrain.',
    '{"Kannada","English","Hindi","Telugu"}',
    'https://images.unsplash.com/photo-1600100397608-f010e4299b66?auto=format&fit=crop&w=1200&q=80',
    TRUE, TRUE, FALSE, 'APPROVED', 'VERIFIED'
) ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Supporting Provider for Hampi Coracle
INSERT INTO experience_supporting_providers (
    id, experience_id, provider_id, provider_name, provider_type, role_description, status, notes
) VALUES 
(
    'supp-hampi-coracle',
    'exp-hmp-monuments-trail',
    'host-48',
    'Basavaraj Patil',
    'GUIDE',
    'Tungabhadra River Coracle Crossing Coordinator',
    'ACCEPTED',
    'Provides scenic round coracle boat crossing across the boulder gorges of Tungabhadra.'
) ON CONFLICT (id) DO NOTHING;
