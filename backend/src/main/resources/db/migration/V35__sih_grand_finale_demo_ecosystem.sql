-- V35__sih_grand_finale_demo_ecosystem.sql
-- SIH Grand Finale Demo Ecosystem Data: Unified Tirupati Demo Ecosystem

-- ==============================================================================
-- 1. USERS & PROFILES (SIH DEMO IDENTITIES)
-- ==============================================================================

INSERT INTO users (id, auth_user_id, email, full_name, role, partner_subtype, is_verified, verification_status, is_active, created_at, updated_at)
VALUES 
  ('usr-sih-tourist', 'a0000000-0000-0000-0000-000000000001', 'tourist@yatrasetu.demo', 'SIH Demo Tourist', 'TRAVELER', NULL, TRUE, 'VERIFIED', TRUE, NOW(), NOW()),
  ('usr-sih-guide-ravi', 'a0000000-0000-0000-0000-000000000002', 'ravi.guide@yatrasetu.demo', 'Ravi Kumar', 'PARTNER', 'GUIDE', TRUE, 'VERIFIED', TRUE, NOW(), NOW()),
  ('usr-sih-host-lakshmi', 'a0000000-0000-0000-0000-000000000003', 'lakshmi.host@yatrasetu.demo', 'Smt. Lakshmi Prasanna', 'PARTNER', 'ARTISAN', TRUE, 'VERIFIED', TRUE, NOW(), NOW()),
  ('usr-partner-hotel-tpt', 'a0000000-0000-0000-0000-000000000004', 'tirupati.hotel@yatrasetu.demo', 'Srinivasa Rao', 'PARTNER', 'HOTEL', TRUE, 'VERIFIED', TRUE, NOW(), NOW()),
  ('usr-sih-travel-arjun', 'a0000000-0000-0000-0000-000000000005', 'arjun.travels@yatrasetu.demo', 'Arjun Varma', 'PARTNER', 'TRANSPORT', TRUE, 'VERIFIED', TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  partner_subtype = EXCLUDED.partner_subtype,
  auth_user_id = EXCLUDED.auth_user_id,
  is_verified = TRUE,
  verification_status = 'VERIFIED',
  is_active = TRUE,
  updated_at = NOW();

-- Profiles for all 5 demo accounts
INSERT INTO profiles (id, display_name, business_name, city, state, bio, phone, verification_status, created_at, updated_at)
VALUES
  ('usr-sih-tourist', 'SIH Demo Tourist', NULL, 'Hyderabad', 'Telangana', 'Passionate heritage explorer and cultural pilgrim discovering India with YatraSetu.', '+91 98765 43210', 'APPROVED', NOW(), NOW()),
  ('usr-sih-guide-ravi', 'Ravi Kumar', 'Tirupati Heritage Storytelling Walks', 'Tirupati', 'Andhra Pradesh', 'Certified heritage and spiritual walking tour storyteller with 12 years of experience guiding visitors through Seshachalam sacred sites and Vijayanagara architecture.', '+91 98480 12345', 'VERIFIED', NOW(), NOW()),
  ('usr-sih-host-lakshmi', 'Smt. Lakshmi Prasanna', 'Sri Venkateswara Kalamkari & Temple Textile Studio', 'Tirupati', 'Andhra Pradesh', 'Master Kalamkari artisan preserving the ancient Srikalahasti natural dye pen-craft and sacred temple hanging traditions.', '+91 94400 67890', 'VERIFIED', NOW(), NOW()),
  ('usr-partner-hotel-tpt', 'Srinivasa Rao', 'Tirupati Grand Residency', 'Tirupati', 'Andhra Pradesh', 'Hospitality partner providing premium, comfortable accommodations with temple shuttle services for pilgrims and travelers.', '+91 98490 55443', 'VERIFIED', NOW(), NOW()),
  ('usr-sih-travel-arjun', 'Arjun Travels', 'Arjun Travels & Regional Sightseeing', 'Tirupati', 'Andhra Pradesh', 'Professional regional transportation partner offering reliable city transfers, temple circuit cabs, and customized private travel logistics.', '+91 98480 32111', 'VERIFIED', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  business_name = EXCLUDED.business_name,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  bio = EXCLUDED.bio,
  phone = EXCLUDED.phone,
  verification_status = EXCLUDED.verification_status,
  updated_at = NOW();

-- ==============================================================================
-- 2. LOCAL HOSTS IN TIRUPATI (dest-136)
-- ==============================================================================

-- Ravi Kumar (host-5)
UPDATE local_hosts 
SET 
  user_id = 'usr-sih-guide-ravi',
  name = 'Ravi Kumar',
  state_id = 'IN-AP',
  city_id = 'tirupati',
  destination_id = 'dest-136',
  role_title = 'Heritage & Temple Guide',
  is_verified = TRUE,
  is_demo_data = FALSE,
  about = 'Specialized guide for Tirupati foothill temples, Seshachalam eco-trails, and temple architectural history.',
  price_per_hour = 350.00,
  rating = 4.9,
  updated_at = NOW()
WHERE id = 'host-5';

-- Smt. Lakshmi Prasanna (host-45)
UPDATE local_hosts 
SET 
  user_id = 'usr-sih-host-lakshmi',
  name = 'Smt. Lakshmi Prasanna',
  state_id = 'IN-AP',
  city_id = 'tirupati',
  destination_id = 'dest-136',
  role_title = 'Kalamkari Artisan & Temple Craft Weaver',
  is_verified = TRUE,
  is_demo_data = FALSE,
  about = 'Traditional Kalamkari artisan conducting hands-on sacred art workshops with organic vegetable dyes.',
  price_per_hour = 400.00,
  rating = 4.9,
  updated_at = NOW()
WHERE id = 'host-45';

-- Arjun Travels (host-125)
UPDATE local_hosts 
SET 
  user_id = 'usr-sih-travel-arjun',
  name = 'Arjun Travels',
  state_id = 'IN-AP',
  city_id = 'tirupati',
  destination_id = 'dest-136',
  role_title = 'Regional Transport & Sightseeing Partner',
  is_verified = TRUE,
  is_demo_data = FALSE,
  about = 'Premier regional travel agency and cab coordinator providing dependable temple circuit and airport transfers.',
  price_per_hour = 300.00,
  rating = 4.8,
  updated_at = NOW()
WHERE id = 'host-125';

-- ==============================================================================
-- 3. BOOKABLE EXPERIENCES & SERVICES IN TIRUPATI
-- ==============================================================================

-- Experience 1: Ravi Kumar's Guide Experience
INSERT INTO experiences (
    id, host_id, destination_id, city_id, title, description, category,
    duration_hours, price_per_person, max_group_size, included_items, requirements,
    languages, cover_image_url, is_approved, is_active, is_demo_data, status, verification_status, created_at, updated_at
) VALUES 
(
    'exp-tirupati-temple-walk',
    'host-5',
    'dest-136',
    'tirupati',
    'Tirupati Seshachalam Foothills & Temple Heritage Walk',
    'Immerse in the devotional heritage of Tirupati at the base of the sacred Seshachalam hills. Visit the ancient Sri Kapila Theertham temple, discover Chola and Vijayanagara inscriptions, explore lush foothill waterfalls, and experience living temple craft traditions with our certified local guide.',
    'Heritage & Temple Tour',
    3.5,
    1800.00,
    8,
    '{"Monuments Entry Assistance","Special Laddu Prasadam Token","Heritage Audio Receiver Guide","Chilled Mineral Water Bottle"}',
    'Meeting Point: Kapila Theertham Main Entrance, Tirupati. Modest traditional attire required for temple premises; comfortable walking footwear.',
    '{"Telugu","Hindi","English","Tamil"}',
    'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    TRUE, TRUE, FALSE, 'PUBLISHED', 'VERIFIED', NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET 
    host_id = EXCLUDED.host_id,
    destination_id = EXCLUDED.destination_id,
    city_id = EXCLUDED.city_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    duration_hours = EXCLUDED.duration_hours,
    price_per_person = EXCLUDED.price_per_person,
    max_group_size = EXCLUDED.max_group_size,
    included_items = EXCLUDED.included_items,
    requirements = EXCLUDED.requirements,
    languages = EXCLUDED.languages,
    is_approved = TRUE,
    is_active = TRUE,
    status = 'PUBLISHED',
    verification_status = 'VERIFIED',
    updated_at = NOW();

-- Experience 2: Lakshmi Prasanna's Cultural Workshop
INSERT INTO experiences (
    id, host_id, destination_id, city_id, cultural_tradition_id, title, description, category,
    duration_hours, price_per_person, max_group_size, included_items, requirements,
    languages, cover_image_url, is_approved, is_active, is_demo_data, status, verification_status, created_at, updated_at
) VALUES 
(
    'exp-tirupati-kalamkari-art',
    'host-45',
    'dest-136',
    'tirupati',
    'cult-ap-kalamkari',
    'Kalamkari Heritage Arts Workshop',
    'Discover the 3,000-year-old art of authentic Srikalahasti Kalamkari painting using organic natural dyes and bamboo tamarind-pen brushes. Master artisan Smt. Lakshmi Prasanna guides participants through hand-drawing sacred motifs on treated cotton canvas that you take home as a souvenir.',
    'Art & Craft Workshop',
    3.0,
    1200.00,
    6,
    '{"All Organic Vegetable Dyes & Treated Cotton Fabric","Handcrafted Bamboo Kalam Pen to Keep","Personalized Finished Kalamkari Artwork Canvas","Traditional Herbal Tea & Snacks"}',
    'Workshop Location: Sri Venkateswara Kalamkari Studio, Kapila Theertham Road, Tirupati. No prior artistic experience required. All organic materials provided.',
    '{"Telugu","English","Hindi"}',
    'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=1200&q=80',
    TRUE, TRUE, FALSE, 'PUBLISHED', 'VERIFIED', NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET 
    host_id = EXCLUDED.host_id,
    destination_id = EXCLUDED.destination_id,
    city_id = EXCLUDED.city_id,
    cultural_tradition_id = EXCLUDED.cultural_tradition_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    duration_hours = EXCLUDED.duration_hours,
    price_per_person = EXCLUDED.price_per_person,
    max_group_size = EXCLUDED.max_group_size,
    included_items = EXCLUDED.included_items,
    requirements = EXCLUDED.requirements,
    languages = EXCLUDED.languages,
    is_approved = TRUE,
    is_active = TRUE,
    status = 'PUBLISHED',
    verification_status = 'VERIFIED',
    updated_at = NOW();

-- Experience 3: Arjun Travels' Regional Transport Service
INSERT INTO experiences (
    id, host_id, destination_id, city_id, title, description, category,
    duration_hours, price_per_person, max_group_size, included_items, requirements,
    languages, cover_image_url, is_approved, is_active, is_demo_data, status, verification_status, created_at, updated_at
) VALUES 
(
    'exp-tirupati-sightseeing-transfer',
    'host-125',
    'dest-136',
    'tirupati',
    'Tirupati Local Sightseeing Transfer',
    'Comfortable, punctual private sightseeing transfer covering major Tirupati local landmarks including Sri Padmavathi Ammavari Temple (Tiruchanoor), Sri Govindaraja Swamy Temple, Kapila Theertham, and regional transport hubs with verified professional drivers.',
    'Transport & Sightseeing',
    6.0,
    2200.00,
    4,
    '{"Air-Conditioned Sedan Vehicle Transfer","Dedicated Experienced Chauffeur","Fuel, Toll & Parking Charges Included","Mineral Water Bottles in Cab"}',
    'Meeting Point / Pickup: Hotel lobby, Tirupati Railway Station, or Tirupati Airport. Please provide pickup details after booking. Valid government ID required for all travelers.',
    '{"Telugu","English","Hindi","Tamil"}',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
    TRUE, TRUE, FALSE, 'PUBLISHED', 'VERIFIED', NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET 
    host_id = EXCLUDED.host_id,
    destination_id = EXCLUDED.destination_id,
    city_id = EXCLUDED.city_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    duration_hours = EXCLUDED.duration_hours,
    price_per_person = EXCLUDED.price_per_person,
    max_group_size = EXCLUDED.max_group_size,
    included_items = EXCLUDED.included_items,
    requirements = EXCLUDED.requirements,
    languages = EXCLUDED.languages,
    is_approved = TRUE,
    is_active = TRUE,
    status = 'PUBLISHED',
    verification_status = 'VERIFIED',
    updated_at = NOW();

-- Supporting Provider: Smt. Lakshmi Prasanna for Kalamkari Art segment in Ravi's Walk
INSERT INTO experience_supporting_providers (
    id, experience_id, provider_id, provider_name, provider_type, role_description, status, notes, created_at, updated_at
) VALUES 
(
    'supp-tirupati-kalamkari-host',
    'exp-tirupati-temple-walk',
    'host-45',
    'Smt. Lakshmi Prasanna',
    'ARTISAN',
    'Traditional Kalamkari Temple Craft & Sacred Art Demonstration Host',
    'ACCEPTED',
    'Hosts a 30-minute temple art and sacred textile storytelling segment during the heritage walk.',
    NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET 
    experience_id = EXCLUDED.experience_id,
    provider_id = EXCLUDED.provider_id,
    provider_name = EXCLUDED.provider_name,
    provider_type = EXCLUDED.provider_type,
    role_description = EXCLUDED.role_description,
    status = 'ACCEPTED',
    updated_at = NOW();

-- ==============================================================================
-- 4. HOTEL: TIRUPATI GRAND RESIDENCY (htl-tpt-1)
-- ==============================================================================

UPDATE hotels 
SET 
  owner_id = 'usr-partner-hotel-tpt',
  hotel_name = 'Tirupati Grand Residency',
  destination_id = 'dest-136',
  city_id = 'tirupati',
  is_partner_property = TRUE,
  verification_status = 'VERIFIED',
  is_active = TRUE,
  price_per_night = 3850.00,
  address = 'Near Tirupati Railway Station, Renigunta Road, Tirupati, Andhra Pradesh 517501',
  updated_at = NOW()
WHERE id = 'htl-tpt-1';

-- ==============================================================================
-- 5. SUPABASE AUTH PROVISIONING FOR ARJUN TRAVELS
-- ==============================================================================

INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000005'::uuid,
    'authenticated',
    'authenticated',
    'arjun.travels@yatrasetu.demo',
    crypt('ArjunTravels@SIH2026', gen_salt('bf', 10)),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Arjun Varma","role":"PARTNER","partnerSubtype":"TRANSPORT"}'::jsonb,
    NOW(),
    NOW(),
    FALSE
) ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    encrypted_password = crypt('ArjunTravels@SIH2026', gen_salt('bf', 10)),
    email_confirmed_at = NOW(),
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = NOW();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    'a0000000-0000-0000-0000-000000000005'::uuid,
    'a0000000-0000-0000-0000-000000000005'::uuid,
    jsonb_build_object('sub', 'a0000000-0000-0000-0000-000000000005', 'email', 'arjun.travels@yatrasetu.demo'),
    'email',
    'a0000000-0000-0000-0000-000000000005',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (provider, provider_id) DO UPDATE SET 
    identity_data = EXCLUDED.identity_data,
    updated_at = NOW();
