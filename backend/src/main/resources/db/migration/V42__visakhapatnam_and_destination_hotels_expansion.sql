-- V42__visakhapatnam_and_destination_hotels_expansion.sql
-- Seed Visakhapatnam hotels/homestays & extend verified hotel coverage across all destinations

-- 1. Backfill coordinates for existing dataset hotels using parent city coordinates
UPDATE hotels h
SET 
  latitude = c.latitude + ((abs(hashtext(h.id)) % 60) - 30) * 0.0004,
  longitude = c.longitude + ((abs(hashtext(h.id) / 60) % 60) - 30) * 0.0004,
  updated_at = NOW()
FROM cities c
WHERE h.city_id = c.id
  AND (h.latitude IS NULL OR h.latitude = 0.0);

-- 2. Ensure Partner User for Visakhapatnam Stays
INSERT INTO users (id, auth_user_id, email, full_name, role, partner_subtype, is_verified, verification_status, is_active, created_at, updated_at)
VALUES ('usr-partner-hotel-vizag', 'auth-partner-hotel-vizag', 'vizag.stays@yatrasetu.in', 'Ramu Naidu', 'PARTNER', 'HOTEL', TRUE, 'VERIFIED', TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Visakhapatnam Hotels & Homestays (dest-137)
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, owner_id, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-vizag-1', 'The Park Visakhapatnam', 'visakhapatnam', 'dest-137', 4.8, 5500.0, '{"Sea View Suites","Private Beach Access","Outdoor Swimming Pool","Multi-Cuisine Restaurant","Free Wi-Fi","Spa"}', 'HOTEL', TRUE, 'VERIFIED', 'usr-partner-hotel-vizag', 'Beach Road, Opposite VUDA Park, Visakhapatnam, Andhra Pradesh 530023', 17.7125, 83.3245, 'PARTNER', NOW(), NOW()),
  ('htl-vizag-2', 'Novotel Visakhapatnam Varun Beach', 'visakhapatnam', 'dest-137', 4.9, 6800.0, '{"Infinity Ocean Pool","Beachfront Promenade","Executive Lounge","24/7 Fitness Center","Free Wi-Fi"}', 'HOTEL', TRUE, 'VERIFIED', 'usr-partner-hotel-vizag', 'Beach Road, RK Beach Area, Visakhapatnam, Andhra Pradesh 530002', 17.7100, 83.3200, 'PARTNER', NOW(), NOW()),
  ('htl-vizag-3', 'Dolphin Hotel Visakhapatnam', 'visakhapatnam', 'dest-137', 4.6, 3800.0, '{"City Center Location","Fine Dining","Conference Halls","Free High-Speed Wi-Fi","Airport Shuttle"}', 'HOTEL', TRUE, 'VERIFIED', 'usr-partner-hotel-vizag', 'Dwaraka Nagar, Main Road, Visakhapatnam, Andhra Pradesh 530016', 17.7280, 83.3010, 'PARTNER', NOW(), NOW()),
  ('htl-vizag-4', 'Bay View Heritage Homestay', 'visakhapatnam', 'dest-137', 4.7, 2200.0, '{"Traditional Andhra Breakfast","Ocean View Balcony","Free Wi-Fi","Local Guide Support","Home Cooked Meals"}', 'HOMESTAY', TRUE, 'VERIFIED', 'usr-partner-hotel-vizag', 'Lawson''s Bay Colony, Beach Road, Visakhapatnam, Andhra Pradesh 530017', 17.7350, 83.3400, 'PARTNER', NOW(), NOW()),
  ('htl-vizag-5', 'Rushikonda Beach Resort & Homestay', 'visakhapatnam', 'dest-137', 4.7, 2600.0, '{"Hill & Beach View","Water Sports Desk","Free Wi-Fi","Coastal Cuisine","Garden Sit-out"}', 'HOMESTAY', TRUE, 'VERIFIED', 'usr-partner-hotel-vizag', 'Rushikonda Beach Hilltop Road, Visakhapatnam, Andhra Pradesh 530045', 17.7820, 83.3850, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  destination_id = EXCLUDED.destination_id,
  hotel_name = EXCLUDED.hotel_name,
  hotel_rating = EXCLUDED.hotel_rating,
  price_per_night = EXCLUDED.price_per_night,
  amenities = EXCLUDED.amenities,
  category = EXCLUDED.category,
  address = EXCLUDED.address,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;

INSERT INTO hotel_room_types (id, hotel_id, room_type_name, description, max_occupancy, bed_configuration, room_size_sqft, amenities, base_inventory_units, is_active, created_at, updated_at)
VALUES 
  ('room-vizag-1-ocean', 'htl-vizag-1', 'Ocean View Deluxe Room', 'Spacious coastal room with panoramic Bay of Bengal views, king bed, private balcony, and modern marble bathroom.', 2, '1 King Bed', 380, '{"Air Conditioning","Ocean View","Free Wi-Fi","Smart TV","Coffee Maker"}', 8, TRUE, NOW(), NOW()),
  ('room-vizag-4-suite', 'htl-vizag-4', 'Bay View Homestay Room', 'Comfortable traditional homestay room with sea view terrace, homemade Andhra breakfast, and warm hospitality.', 2, '1 Queen Bed', 280, '{"Air Conditioning","Terrace Access","Free Wi-Fi","Homemade Meals"}', 4, TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO hotel_rate_plans (id, room_type_id, plan_name, meal_plan, description, base_price, currency, price_unit, status, cancellation_policy, cancellation_deadline_hours, taxes_included, fees_included, created_at, updated_at)
VALUES 
  ('rp-vizag-1-ocean-cp', 'room-vizag-1-ocean', 'Flexible Ocean Rate with Breakfast', 'CP', 'Includes buffet breakfast and free cancellation up to 24 hours prior to check-in.', 5500.00, 'INR', 'PER_NIGHT', 'ACTIVE', 'FREE_CANCELLATION', 24, TRUE, TRUE, NOW(), NOW()),
  ('rp-vizag-4-suite-cp', 'room-vizag-4-suite', 'Homestay Experience - Breakfast Included', 'CP', 'Includes authentic homemade South Indian breakfast and tea.', 2200.00, 'INR', 'PER_NIGHT', 'ACTIVE', 'FREE_CANCELLATION', 24, TRUE, TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO hotel_inventory (id, room_type_id, inventory_date, total_units, blocked_units, created_at, updated_at)
VALUES 
  ('inv-vizag-1-ocean-base', 'room-vizag-1-ocean', NULL, 8, 0, NOW(), NOW()),
  ('inv-vizag-4-suite-base', 'room-vizag-4-suite', NULL, 4, 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Verified Stays across all remaining destination hubs
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0001', 'Grand Haridwar Residency & Resort', 'haridwar', 'dest-100', 4.5, 3200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Haridwar–Rishikesh–Char Dham Spiritual Trail (Meta‑Circuit Node) Main Hub, Haridwar', 30.008, 78.208, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0002', 'Haridwar–Rishikesh–Char Dham Spiritual Trail (Meta‑Circuit Node) Heritage Homestay', 'haridwar', 'dest-100', 4.6, 1800.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Haridwar–Rishikesh–Char Dham Spiritual Trail (Meta‑Circuit Node) Attraction Area, Haridwar', 29.994, 78.194, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0003', 'Grand Agra Residency & Resort', 'agra', 'dest-5', 4.6, 3400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Agra Main Hub, Agra', 27.1847, 78.0161, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0004', 'Agra Heritage Homestay', 'agra', 'dest-5', 4.7, 1950.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Agra Attraction Area, Agra', 27.1707, 78.0021, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0005', 'Grand Rishikesh Residency & Resort', 'rishikesh', 'dest-91', 4.7, 3600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Rishikesh & Haridwar (Himalayan Yoga Route) Main Hub, Rishikesh', 30.128, 78.298, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0006', 'Rishikesh & Haridwar (Himalayan Yoga Route) Heritage Homestay', 'rishikesh', 'dest-91', 4.8, 2100.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Rishikesh & Haridwar (Himalayan Yoga Route) Attraction Area, Rishikesh', 30.114, 78.284, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0007', 'Grand Puri Residency & Resort', 'puri', 'dest-160', 4.8, 3800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Puri & Jagannath Dham Main Hub, Puri', 19.8215, 85.8392, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0008', 'Puri & Jagannath Dham Heritage Homestay', 'puri', 'dest-160', 4.9, 2250.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Puri & Jagannath Dham Attraction Area, Puri', 19.8075, 85.8252, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0009', 'Grand Konark Residency & Resort', 'konark', 'dest-161', 4.9, 4000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Konark Sun Temple & Coast Main Hub, Konark', 19.8956, 86.1025, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0010', 'Konark Sun Temple & Coast Heritage Homestay', 'konark', 'dest-161', 4.6, 2400.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Konark Sun Temple & Coast Attraction Area, Konark', 19.8816, 86.0885, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0011', 'Grand Madurai Residency & Resort', 'madurai', 'dest-145', 4.5, 4200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Madurai Main Hub, Madurai', 9.9332, 78.1278, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0012', 'Madurai Heritage Homestay', 'madurai', 'dest-145', 4.7, 2550.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Madurai Attraction Area, Madurai', 9.9192, 78.1138, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0013', 'Grand Rajgir (Nalanda) Residency & Resort', 'rajgir-nalanda', 'dest-166', 4.6, 4400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Nalanda & Rajgir Main Hub, Rajgir (Nalanda)', 25.1437, 85.4524, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0014', 'Nalanda & Rajgir Heritage Homestay', 'rajgir-nalanda', 'dest-166', 4.8, 2700.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Nalanda & Rajgir Attraction Area, Rajgir (Nalanda)', 25.1297, 85.4384, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0015', 'Grand Canning (Sundarbans) Residency & Resort', 'canning-sundarbans', 'dest-163', 4.7, 4600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Sundarbans Mangrove Biosphere Main Hub, Canning (Sundarbans)', 22.158, 88.858, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0016', 'Sundarbans Mangrove Biosphere Heritage Homestay', 'canning-sundarbans', 'dest-163', 4.9, 2850.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Sundarbans Mangrove Biosphere Attraction Area, Canning (Sundarbans)', 22.144, 88.844, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0017', 'Grand Badami Residency & Resort', 'badami', 'dest-150', 4.8, 4800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Badami, Pattadakal & Aihole Main Hub, Badami', 15.9269, 75.6846, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0018', 'Badami, Pattadakal & Aihole Heritage Homestay', 'badami', 'dest-150', 4.6, 3000.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Badami, Pattadakal & Aihole Attraction Area, Badami', 15.9129, 75.6706, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0019', 'Grand Thanjavur Residency & Resort', 'thanjavur', 'dest-146', 4.9, 5000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Thanjavur Main Hub, Thanjavur', 10.795, 79.1458, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0020', 'Thanjavur Heritage Homestay', 'thanjavur', 'dest-146', 4.7, 3150.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Thanjavur Attraction Area, Thanjavur', 10.781, 79.1318, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0021', 'Grand Thekkady (Kumily) Residency & Resort', 'thekkady', 'dest-156', 4.5, 5200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Thekkady & Periyar Main Hub, Thekkady (Kumily)', 9.6111, 77.1786, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0022', 'Thekkady & Periyar Heritage Homestay', 'thekkady', 'dest-156', 4.8, 3300.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Thekkady & Periyar Attraction Area, Thekkady (Kumily)', 9.5971, 77.1646, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0023', 'Grand Balugaon (Chilika) Residency & Resort', 'balugaon-chilika', 'dest-162', 4.6, 5400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Chilika Lake & Ramsar Wetland Main Hub, Balugaon (Chilika)', 19.754, 85.215, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0024', 'Chilika Lake & Ramsar Wetland Heritage Homestay', 'balugaon-chilika', 'dest-162', 4.9, 3450.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Chilika Lake & Ramsar Wetland Attraction Area, Balugaon (Chilika)', 19.74, 85.201, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0025', 'Grand Hassan (Belur-Halebidu) Residency & Resort', 'hassan', 'dest-151', 4.7, 5600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Belur & Halebidu Main Hub, Hassan (Belur-Halebidu)', 13.168, 75.868, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0026', 'Belur & Halebidu Heritage Homestay', 'hassan', 'dest-151', 4.6, 1800.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Belur & Halebidu Attraction Area, Hassan (Belur-Halebidu)', 13.154, 75.854, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0027', 'Grand Bolpur (Shantiniketan) Residency & Resort', 'bolpur-shantiniketan', 'dest-164', 4.8, 5800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Shantiniketan & Bolpur Main Hub, Bolpur (Shantiniketan)', 23.678, 87.728, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0028', 'Shantiniketan & Bolpur Heritage Homestay', 'bolpur-shantiniketan', 'dest-164', 4.7, 1950.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Shantiniketan & Bolpur Attraction Area, Bolpur (Shantiniketan)', 23.664, 87.714, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0029', 'Grand Kodaikanal Residency & Resort', 'kodaikanal', 'dest-147', 4.9, 6000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Kodaikanal Main Hub, Kodaikanal', 10.2461, 77.4972, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0030', 'Kodaikanal Heritage Homestay', 'kodaikanal', 'dest-147', 4.8, 2100.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Kodaikanal Attraction Area, Kodaikanal', 10.2321, 77.4832, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0031', 'Grand Deoghar Residency & Resort', 'deoghar', 'dest-168', 4.5, 3200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Deoghar & Baidyanath Dham Main Hub, Deoghar', 24.4906, 86.708, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0032', 'Deoghar & Baidyanath Dham Heritage Homestay', 'deoghar', 'dest-168', 4.9, 2250.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Deoghar & Baidyanath Dham Attraction Area, Deoghar', 24.4766, 86.694, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0033', 'Grand Sawai Madhopur Residency & Resort', 'sawai-madhopur', 'dest-46', 4.6, 3400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Ranthambore National Park Main Hub, Sawai Madhopur', 26.028, 76.508, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0034', 'Ranthambore National Park Heritage Homestay', 'sawai-madhopur', 'dest-46', 4.6, 2400.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Ranthambore National Park Attraction Area, Sawai Madhopur', 26.014, 76.494, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0035', 'Grand Baramulla Residency & Resort', 'baramulla', 'dest-96', 4.7, 3600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Gulmarg (Kashmir Ski & Snow Destination) Main Hub, Baramulla', 34.058, 74.388, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0036', 'Gulmarg (Kashmir Ski & Snow Destination) Heritage Homestay', 'baramulla', 'dest-96', 4.7, 2550.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Gulmarg (Kashmir Ski & Snow Destination) Attraction Area, Baramulla', 34.044, 74.374, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0037', 'Grand New Delhi Residency & Resort', 'new-delhi', 'dest-104', 4.8, 3800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near New Delhi Main Hub, New Delhi', 28.6219, 77.217, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0038', 'New Delhi Heritage Homestay', 'new-delhi', 'dest-104', 4.8, 2700.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near New Delhi Attraction Area, New Delhi', 28.6079, 77.203, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0039', 'Grand Gaya Residency & Resort', 'gaya', 'dest-93', 4.9, 4000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Bodh Gaya Buddhist Circuit Hub Main Hub, Gaya', 24.708, 84.998, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0040', 'Bodh Gaya Buddhist Circuit Hub Heritage Homestay', 'gaya', 'dest-93', 4.9, 2850.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Bodh Gaya Buddhist Circuit Hub Attraction Area, Gaya', 24.694, 84.984, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0041', 'Grand Manali Residency & Resort', 'manali', 'dest-13', 4.5, 4200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Manali Main Hub, Manali', 32.2512, 77.1972, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0042', 'Manali Heritage Homestay', 'manali', 'dest-13', 4.6, 3000.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Manali Attraction Area, Manali', 32.2372, 77.1832, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0043', 'Grand Udupi Residency & Resort', 'udupi', 'dest-154', 4.6, 4400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Udupi & Coastal Circuit Main Hub, Udupi', 13.3489, 74.7501, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0044', 'Udupi & Coastal Circuit Heritage Homestay', 'udupi', 'dest-154', 4.7, 3150.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Udupi & Coastal Circuit Attraction Area, Udupi', 13.3349, 74.7361, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0045', 'Grand Mathura Residency & Resort', 'mathura', 'dest-90', 4.7, 4600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Krishna Heritage Circuit (Mathura–Vrindavan–Dwarka Focus) Main Hub, Mathura', 27.508, 77.678, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0046', 'Krishna Heritage Circuit (Mathura–Vrindavan–Dwarka Focus) Heritage Homestay', 'mathura', 'dest-90', 4.8, 3300.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Krishna Heritage Circuit (Mathura–Vrindavan–Dwarka Focus) Attraction Area, Mathura', 27.494, 77.664, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0047', 'Grand Mahabalipuram Residency & Resort', 'mahabalipuram', 'dest-86', 4.8, 4800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Mamallapuram (Mahabalipuram) & Coromandel Heritage Coast Main Hub, Mahabalipuram', 12.628, 80.198, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0048', 'Mamallapuram (Mahabalipuram) & Coromandel Heritage Coast Heritage Homestay', 'mahabalipuram', 'dest-86', 4.9, 3450.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Mamallapuram (Mahabalipuram) & Coromandel Heritage Coast Attraction Area, Mahabalipuram', 12.614, 80.184, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0049', 'Grand Jagdalpur Residency & Resort', 'jagdalpur', 'dest-170', 4.9, 5000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Jagdalpur & Kanger Valley Main Hub, Jagdalpur', 19.082, 82.039, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0050', 'Jagdalpur & Kanger Valley Heritage Homestay', 'jagdalpur', 'dest-170', 4.6, 1800.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Jagdalpur & Kanger Valley Attraction Area, Jagdalpur', 19.068, 82.025, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0051', 'Grand Leh Residency & Resort', 'leh', 'dest-2', 4.5, 5200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Ladakh (Leh) Main Hub, Leh', 34.168, 77.588, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0052', 'Ladakh (Leh) Heritage Homestay', 'leh', 'dest-2', 4.7, 1950.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Ladakh (Leh) Attraction Area, Leh', 34.154, 77.574, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0053', 'Grand Jaisalmer Residency & Resort', 'jaisalmer', 'dest-82', 4.6, 5400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Jaisalmer & Thar Desert Dunes Main Hub, Jaisalmer', 26.918, 70.918, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0054', 'Jaisalmer & Thar Desert Dunes Heritage Homestay', 'jaisalmer', 'dest-82', 4.8, 2100.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Jaisalmer & Thar Desert Dunes Attraction Area, Jaisalmer', 26.904, 70.904, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0055', 'Grand Kutch Residency & Resort', 'kutch', 'dest-81', 4.7, 5600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Great Rann of Kutch (White Desert) Main Hub, Kutch', 24.098, 70.648, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0056', 'Great Rann of Kutch (White Desert) Heritage Homestay', 'kutch', 'dest-81', 4.9, 2250.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Great Rann of Kutch (White Desert) Attraction Area, Kutch', 24.084, 70.634, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0057', 'Grand Bharatpur Residency & Resort', 'bharatpur', 'dest-78', 4.8, 5800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Keoladeo National Park (Bharatpur Bird Sanctuary) Main Hub, Bharatpur', 27.168, 77.528, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0058', 'Keoladeo National Park (Bharatpur Bird Sanctuary) Heritage Homestay', 'bharatpur', 'dest-78', 4.6, 2400.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Keoladeo National Park (Bharatpur Bird Sanctuary) Attraction Area, Bharatpur', 27.154, 77.514, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0059', 'Grand Darjeeling Residency & Resort', 'darjeeling', 'dest-64', 4.9, 6000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Darjeeling Main Hub, Darjeeling', 27.048, 88.268, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0060', 'Darjeeling Heritage Homestay', 'darjeeling', 'dest-64', 4.7, 2550.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Darjeeling Attraction Area, Darjeeling', 27.034, 88.254, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0061', 'Grand South Andaman Residency & Resort', 'south-andaman', 'dest-31', 4.5, 3200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Havelock Island (Swaraj Dweep) Main Hub, South Andaman', 11.976, 92.995, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0062', 'Havelock Island (Swaraj Dweep) Heritage Homestay', 'south-andaman', 'dest-31', 4.8, 2700.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Havelock Island (Swaraj Dweep) Attraction Area, South Andaman', 11.962, 92.981, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0063', 'Grand Jaisalmer Residency & Resort', 'jaisalmer', 'dest-51', 4.6, 3400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Jaisalmer (Thar Desert & Fort Town) Main Hub, Jaisalmer', 26.9237, 70.9163, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0064', 'Jaisalmer (Thar Desert & Fort Town) Heritage Homestay', 'jaisalmer', 'dest-51', 4.9, 2850.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Jaisalmer (Thar Desert & Fort Town) Attraction Area, Jaisalmer', 26.9097, 70.9023, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0065', 'Grand Rishikesh Residency & Resort', 'rishikesh', 'dest-37', 4.7, 3600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Rishikesh Main Hub, Rishikesh', 30.0949, 78.2756, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0066', 'Rishikesh Heritage Homestay', 'rishikesh', 'dest-37', 4.6, 3000.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Rishikesh Attraction Area, Rishikesh', 30.0809, 78.2616, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0067', 'Grand Palampet (Mulugu) Residency & Resort', 'palampet-mulugu', 'dest-142', 4.8, 3800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Ramappa Temple & Palampet Main Hub, Palampet (Mulugu)', 18.2669, 79.9519, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0068', 'Ramappa Temple & Palampet Heritage Homestay', 'palampet-mulugu', 'dest-142', 4.7, 3150.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Ramappa Temple & Palampet Attraction Area, Palampet (Mulugu)', 18.2529, 79.9379, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0069', 'Grand Visakhapatnam Residency & Resort', 'visakhapatnam', 'dest-137', 4.9, 4000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Visakhapatnam Main Hub, Visakhapatnam', 17.6948, 83.2265, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0070', 'Visakhapatnam Heritage Homestay', 'visakhapatnam', 'dest-137', 4.8, 3300.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Visakhapatnam Attraction Area, Visakhapatnam', 17.6808, 83.2125, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0071', 'Grand Viswema Residency & Resort', 'viswema', 'dest-133', 4.5, 4200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Dzükou Valley Main Hub, Viswema', 25.558, 94.078, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0072', 'Dzükou Valley Heritage Homestay', 'viswema', 'dest-133', 4.9, 3450.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Dzükou Valley Attraction Area, Viswema', 25.544, 94.064, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0073', 'Grand Bekal Residency & Resort', 'bekal', 'dest-158', 4.6, 4400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Bekal & North Malabar Main Hub, Bekal', 12.401, 75.039, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0074', 'Bekal & North Malabar Heritage Homestay', 'bekal', 'dest-158', 4.6, 1800.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Bekal & North Malabar Attraction Area, Bekal', 12.387, 75.025, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0075', 'Grand Kalimpong Residency & Resort', 'kalimpong', 'dest-165', 4.7, 4600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Kalimpong Main Hub, Kalimpong', 27.0747, 88.4747, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0076', 'Kalimpong Heritage Homestay', 'kalimpong', 'dest-165', 4.7, 1950.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Kalimpong Attraction Area, Kalimpong', 27.0607, 88.4607, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0077', 'Grand Srisailam Residency & Resort', 'srisailam', 'dest-139', 4.8, 4800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Srisailam Main Hub, Srisailam', 16.0827, 78.8762, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0078', 'Srisailam Heritage Homestay', 'srisailam', 'dest-139', 4.8, 2100.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Srisailam Attraction Area, Srisailam', 16.0687, 78.8622, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0079', 'Grand Sagara (Jog Falls) Residency & Resort', 'sagara-jogfalls', 'dest-152', 4.9, 5000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Jog Falls & Sharavathi Valley Main Hub, Sagara (Jog Falls)', 14.2365, 74.8197, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0080', 'Jog Falls & Sharavathi Valley Heritage Homestay', 'sagara-jogfalls', 'dest-152', 4.9, 2250.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Jog Falls & Sharavathi Valley Attraction Area, Sagara (Jog Falls)', 14.2225, 74.8057, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0081', 'Grand Moirang Residency & Resort', 'moirang', 'dest-123', 4.5, 5200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Loktak Lake & Keibul Lamjao Main Hub, Moirang', 24.558, 93.808, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0082', 'Loktak Lake & Keibul Lamjao Heritage Homestay', 'moirang', 'dest-123', 4.6, 2400.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Loktak Lake & Keibul Lamjao Attraction Area, Moirang', 24.544, 93.794, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0083', 'Grand Kanchipuram Residency & Resort', 'kanchipuram', 'dest-148', 4.6, 5400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Kanchipuram Main Hub, Kanchipuram', 12.8422, 79.7116, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0084', 'Kanchipuram Heritage Homestay', 'kanchipuram', 'dest-148', 4.7, 2550.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Kanchipuram Attraction Area, Kanchipuram', 12.8282, 79.6976, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0085', 'Grand Dandeli Residency & Resort', 'dandeli', 'dest-153', 4.7, 5600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Dandeli Main Hub, Dandeli', 15.2532, 74.6305, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0086', 'Dandeli Heritage Homestay', 'dandeli', 'dest-153', 4.8, 2700.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Dandeli Attraction Area, Dandeli', 15.2392, 74.6165, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0087', 'Grand Kisama Residency & Resort', 'kisama', 'dest-132', 4.8, 5800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Kisama Heritage Village Main Hub, Kisama', 25.6077, 94.1247, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0088', 'Kisama Heritage Village Heritage Homestay', 'kisama', 'dest-132', 4.9, 2850.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Kisama Heritage Village Attraction Area, Kisama', 25.5937, 94.1107, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0089', 'Grand Karaikudi (Chettinad) Residency & Resort', 'chettinad-karaikudi', 'dest-149', 4.9, 6000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Chettinad Main Hub, Karaikudi (Chettinad)', 10.0815, 78.7812, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0090', 'Chettinad Heritage Homestay', 'chettinad-karaikudi', 'dest-149', 4.6, 3000.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Chettinad Attraction Area, Karaikudi (Chettinad)', 10.0675, 78.7672, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0091', 'Grand Netarhat Residency & Resort', 'netarhat', 'dest-169', 4.5, 3200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Netarhat & Chotanagpur Plateau Main Hub, Netarhat', 23.4913, 84.2747, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0092', 'Netarhat & Chotanagpur Plateau Heritage Homestay', 'netarhat', 'dest-169', 4.7, 3150.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Netarhat & Chotanagpur Plateau Attraction Area, Netarhat', 23.4773, 84.2607, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0093', 'Grand Kohima Residency & Resort', 'kohima', 'dest-131', 4.6, 3400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Kohima Main Hub, Kohima', 25.6831, 94.1166, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0094', 'Kohima Heritage Homestay', 'kohima', 'dest-131', 4.8, 3300.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Kohima Attraction Area, Kohima', 25.6691, 94.1026, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0095', 'Grand Sirpur Residency & Resort', 'sirpur', 'dest-171', 4.7, 3600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Sirpur & Barnawapara Main Hub, Sirpur', 21.3497, 82.1872, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0096', 'Sirpur & Barnawapara Heritage Homestay', 'sirpur', 'dest-171', 4.9, 3450.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Sirpur & Barnawapara Attraction Area, Sirpur', 21.3357, 82.1732, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0097', 'Grand Bhadrachalam Residency & Resort', 'bhadrachalam', 'dest-144', 4.8, 3800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Bhadrachalam Main Hub, Bhadrachalam', 17.6769, 80.9016, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0098', 'Bhadrachalam Heritage Homestay', 'bhadrachalam', 'dest-144', 4.6, 1800.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Bhadrachalam Attraction Area, Bhadrachalam', 17.6629, 80.8876, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0099', 'Grand Kurukshetra Residency & Resort', 'kurukshetra', 'dest-119', 4.9, 4000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Kurukshetra Main Hub, Kurukshetra', 29.9775, 76.8863, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0100', 'Kurukshetra Heritage Homestay', 'kurukshetra', 'dest-119', 4.7, 1950.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Kurukshetra Attraction Area, Kurukshetra', 29.9635, 76.8723, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0101', 'Grand Khonoma Residency & Resort', 'khonoma', 'dest-134', 4.5, 4200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Khonoma Main Hub, Khonoma', 25.6563, 94.0272, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0102', 'Khonoma Heritage Homestay', 'khonoma', 'dest-134', 4.8, 2100.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Khonoma Attraction Area, Khonoma', 25.6423, 94.0132, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0103', 'Grand Gandikota Residency & Resort', 'gandikota', 'dest-138', 4.6, 4400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Gandikota & Belum Caves Main Hub, Gandikota', 14.8224, 78.2942, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0104', 'Gandikota & Belum Caves Heritage Homestay', 'gandikota', 'dest-138', 4.9, 2250.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Gandikota & Belum Caves Attraction Area, Gandikota', 14.8084, 78.2802, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0105', 'Grand Aizawl Residency & Resort', 'aizawl', 'dest-127', 4.7, 4600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Aizawl & Durtlang Hills Main Hub, Aizawl', 23.7351, 92.7256, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0106', 'Aizawl & Durtlang Hills Heritage Homestay', 'aizawl', 'dest-127', 4.6, 2400.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Aizawl & Durtlang Hills Attraction Area, Aizawl', 23.7211, 92.7116, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0107', 'Grand Nagarjuna Sagar Residency & Resort', 'nagarjuna-sagar', 'dest-143', 4.8, 4800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Nagarjuna Sagar & Anupu Main Hub, Nagarjuna Sagar', 16.5866, 79.3205, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0108', 'Nagarjuna Sagar & Anupu Heritage Homestay', 'nagarjuna-sagar', 'dest-143', 4.7, 2550.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Nagarjuna Sagar & Anupu Attraction Area, Nagarjuna Sagar', 16.5726, 79.3065, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0109', 'Grand Imphal Residency & Resort', 'imphal', 'dest-124', 4.9, 5000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Imphal & Kangla Fort Main Hub, Imphal', 24.825, 93.9448, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0110', 'Imphal & Kangla Fort Heritage Homestay', 'imphal', 'dest-124', 4.8, 2700.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Imphal & Kangla Fort Attraction Area, Imphal', 24.811, 93.9308, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0111', 'Grand Lepakshi Residency & Resort', 'lepakshi', 'dest-140', 4.5, 5200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Lepakshi Main Hub, Lepakshi', 13.8121, 77.6163, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0112', 'Lepakshi Heritage Homestay', 'lepakshi', 'dest-140', 4.9, 2850.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Lepakshi Attraction Area, Lepakshi', 13.7981, 77.6023, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0113', 'Grand Thenzawl Residency & Resort', 'thenzawl', 'dest-129', 4.6, 5400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Vantawng Falls & Thenzawl Main Hub, Thenzawl', 23.2922, 92.7647, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0114', 'Vantawng Falls & Thenzawl Heritage Homestay', 'thenzawl', 'dest-129', 4.6, 3000.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Vantawng Falls & Thenzawl Attraction Area, Thenzawl', 23.2782, 92.7507, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0115', 'Grand Diu Residency & Resort', 'diu', 'dest-116', 4.7, 5600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Diu Main Hub, Diu', 20.7224, 70.9954, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0116', 'Diu Heritage Homestay', 'diu', 'dest-116', 4.7, 3150.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Diu Attraction Area, Diu', 20.7084, 70.9814, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0117', 'Grand East Khasi Hills Residency & Resort', 'east-khasi-hills', 'dest-34', 4.8, 5800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Cherrapunji & Mawsmai Area (Sohra region) Main Hub, East Khasi Hills', 25.278, 91.738, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0118', 'Cherrapunji & Mawsmai Area (Sohra region) Heritage Homestay', 'east-khasi-hills', 'dest-34', 4.8, 3300.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Cherrapunji & Mawsmai Area (Sohra region) Attraction Area, East Khasi Hills', 25.264, 91.724, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0119', 'Grand Sultanpur Residency & Resort', 'sultanpur-gurugram', 'dest-122', 4.9, 6000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Sultanpur National Park Main Hub, Sultanpur', 28.4694, 76.9004, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0120', 'Sultanpur National Park Heritage Homestay', 'sultanpur-gurugram', 'dest-122', 4.9, 3450.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Sultanpur National Park Attraction Area, Sultanpur', 28.4554, 76.8864, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0121', 'Grand Chamoli Residency & Resort', 'chamoli', 'dest-97', 4.5, 3200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Auli (Garhwal Ski & Snow Resort) Main Hub, Chamoli', 30.538, 79.578, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0122', 'Auli (Garhwal Ski & Snow Resort) Heritage Homestay', 'chamoli', 'dest-97', 4.6, 1800.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Auli (Garhwal Ski & Snow Resort) Attraction Area, Chamoli', 30.524, 79.564, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0123', 'Grand Rameswaram Residency & Resort', 'rameswaram', 'dest-94', 4.6, 3400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Rameswaram & Pamban Coast (Sacred Water Walk) Main Hub, Rameswaram', 9.298, 79.318, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0124', 'Rameswaram & Pamban Coast (Sacred Water Walk) Heritage Homestay', 'rameswaram', 'dest-94', 4.7, 1950.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Rameswaram & Pamban Coast (Sacred Water Walk) Attraction Area, Rameswaram', 9.284, 79.304, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0125', 'Grand Shimla Residency & Resort', 'shimla', 'dest-11', 4.7, 3600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Shimla Main Hub, Shimla', 31.1128, 77.1814, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0126', 'Shimla Heritage Homestay', 'shimla', 'dest-11', 4.8, 2100.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Shimla Attraction Area, Shimla', 31.0988, 77.1674, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0127', 'Grand East Sikkim Residency & Resort', 'east-sikkim', 'dest-65', 4.8, 3800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Gangtok & East Sikkim Main Hub, East Sikkim', 27.338, 88.618, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0128', 'Gangtok & East Sikkim Heritage Homestay', 'east-sikkim', 'dest-65', 4.9, 2250.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Gangtok & East Sikkim Attraction Area, East Sikkim', 27.324, 88.604, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0129', 'Grand Mandla Residency & Resort', 'mandla', 'dest-45', 4.9, 4000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Kanha National Park Main Hub, Mandla', 22.338, 80.618, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0130', 'Kanha National Park Heritage Homestay', 'mandla', 'dest-45', 4.6, 2400.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Kanha National Park Attraction Area, Mandla', 22.324, 80.604, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0131', 'Grand Umaria Residency & Resort', 'umaria', 'dest-47', 4.5, 4200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Bandhavgarh National Park Main Hub, Umaria', 23.698, 81.008, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0132', 'Bandhavgarh National Park Heritage Homestay', 'umaria', 'dest-47', 4.7, 2550.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Bandhavgarh National Park Attraction Area, Umaria', 23.684, 80.994, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0133', 'Grand South Andaman Residency & Resort', 'south-andaman', 'dest-63', 4.6, 4400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Port Blair & Nearby Islands Main Hub, South Andaman', 11.678, 92.758, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0134', 'Port Blair & Nearby Islands Heritage Homestay', 'south-andaman', 'dest-63', 4.8, 2700.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Port Blair & Nearby Islands Attraction Area, South Andaman', 11.664, 92.744, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0135', 'Grand Leh Residency & Resort', 'leh', 'dest-18', 4.7, 4600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Pangong Lake (Pangong Tso) Main Hub, Leh', 33.798, 78.598, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0136', 'Pangong Lake (Pangong Tso) Heritage Homestay', 'leh', 'dest-18', 4.9, 2850.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Pangong Lake (Pangong Tso) Attraction Area, Leh', 33.784, 78.584, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0137', 'Grand Ooty Residency & Resort', 'ooty', 'dest-19', 4.8, 4800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Ooty (Udhagamandalam) Main Hub, Ooty', 11.4144, 76.7012, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0138', 'Ooty (Udhagamandalam) Heritage Homestay', 'ooty', 'dest-19', 4.6, 3000.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Ooty (Udhagamandalam) Attraction Area, Ooty', 11.4004, 76.6872, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0139', 'Grand Haridwar Residency & Resort', 'haridwar', 'dest-38', 4.9, 5000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Haridwar Main Hub, Haridwar', 29.9537, 78.1722, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0140', 'Haridwar Heritage Homestay', 'haridwar', 'dest-38', 4.7, 3150.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Haridwar Attraction Area, Haridwar', 29.9397, 78.1582, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0141', 'Grand Udaipur Residency & Resort', 'udaipur', 'dest-6', 4.5, 5200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Udaipur Main Hub, Udaipur', 24.5934, 73.7205, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0142', 'Udaipur Heritage Homestay', 'udaipur', 'dest-6', 4.8, 3300.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Udaipur Attraction Area, Udaipur', 24.5794, 73.7065, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0143', 'Grand Satara Residency & Resort', 'satara', 'dest-56', 4.6, 5400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Mahabaleshwar & Panchgani Main Hub, Satara', 17.928, 73.668, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0144', 'Mahabaleshwar & Panchgani Heritage Homestay', 'satara', 'dest-56', 4.9, 3450.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Mahabaleshwar & Panchgani Attraction Area, Satara', 17.914, 73.654, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0145', 'Grand Kullu Residency & Resort', 'kullu', 'dest-75', 4.7, 5600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Jibhi & Tirthan Valley Main Hub, Kullu', 31.618, 77.308, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0146', 'Jibhi & Tirthan Valley Heritage Homestay', 'kullu', 'dest-75', 4.6, 1800.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Jibhi & Tirthan Valley Attraction Area, Kullu', 31.604, 77.294, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0147', 'Grand Chandrapur Residency & Resort', 'chandrapur', 'dest-48', 4.8, 5800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Tadoba Andhari Tiger Reserve Main Hub, Chandrapur', 20.268, 79.378, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0148', 'Tadoba Andhari Tiger Reserve Heritage Homestay', 'chandrapur', 'dest-48', 4.7, 1950.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Tadoba Andhari Tiger Reserve Attraction Area, Chandrapur', 20.254, 79.364, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0149', 'Grand Kaziranga Residency & Resort', 'kaziranga', 'dest-68', 4.9, 6000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Kaziranga National Park & Assam Tea Belt Main Hub, Kaziranga', 26.588, 93.178, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0150', 'Kaziranga National Park & Assam Tea Belt Heritage Homestay', 'kaziranga', 'dest-68', 4.8, 2100.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Kaziranga National Park & Assam Tea Belt Attraction Area, Kaziranga', 26.574, 93.164, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0151', 'Grand Ukhrul Residency & Resort', 'ukhrul', 'dest-126', 4.5, 3200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Ukhrul & Shirui Kashong Main Hub, Ukhrul', 25.1247, 94.3747, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0152', 'Ukhrul & Shirui Kashong Heritage Homestay', 'ukhrul', 'dest-126', 4.9, 2250.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Ukhrul & Shirui Kashong Attraction Area, Ukhrul', 25.1107, 94.3607, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0153', 'Grand Reiek Residency & Resort', 'reiek', 'dest-128', 4.6, 3400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Reiek Heritage Village Main Hub, Reiek', 23.6952, 92.6155, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0154', 'Reiek Heritage Village Heritage Homestay', 'reiek', 'dest-128', 4.6, 2400.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Reiek Heritage Village Attraction Area, Reiek', 23.6812, 92.6015, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0155', 'Grand Shillong Residency & Resort', 'shillong', 'dest-67', 4.7, 3600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Meghalaya (Shillong–Cherrapunji–Mawlynnong circuit) Main Hub, Shillong', 25.588, 91.888, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0156', 'Meghalaya (Shillong–Cherrapunji–Mawlynnong circuit) Heritage Homestay', 'shillong', 'dest-67', 4.7, 2550.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Meghalaya (Shillong–Cherrapunji–Mawlynnong circuit) Attraction Area, Shillong', 25.574, 91.874, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0157', 'Grand Mokokchung Residency & Resort', 'mokokchung', 'dest-135', 4.8, 3800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Mokokchung Main Hub, Mokokchung', 26.3336, 94.5283, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0158', 'Mokokchung Heritage Homestay', 'mokokchung', 'dest-135', 4.8, 2700.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Mokokchung Attraction Area, Mokokchung', 26.3196, 94.5143, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0159', 'Grand Champhai Residency & Resort', 'champhai', 'dest-130', 4.9, 4000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Champhai & Eastern Ridge Main Hub, Champhai', 23.4641, 93.3363, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0160', 'Champhai & Eastern Ridge Heritage Homestay', 'champhai', 'dest-130', 4.9, 2850.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Champhai & Eastern Ridge Attraction Area, Champhai', 23.4501, 93.3223, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0161', 'Grand Daman Residency & Resort', 'daman', 'dest-117', 4.5, 4200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Daman Main Hub, Daman', 20.4054, 72.8408, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0162', 'Daman Heritage Homestay', 'daman', 'dest-117', 4.6, 3000.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Daman Attraction Area, Daman', 20.3914, 72.8268, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0163', 'Grand Moirang Residency & Resort', 'moirang', 'dest-125', 4.6, 4400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Moirang & INA War Memorial Main Hub, Moirang', 24.5108, 93.7799, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0164', 'Moirang & INA War Memorial Heritage Homestay', 'moirang', 'dest-125', 4.7, 3150.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Moirang & INA War Memorial Attraction Area, Moirang', 24.4968, 93.7659, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0165', 'Grand Pinjore Residency & Resort', 'pinjore', 'dest-120', 4.7, 4600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Pinjore & Yadavindra Gardens Main Hub, Pinjore', 30.8047, 76.9237, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0166', 'Pinjore & Yadavindra Gardens Heritage Homestay', 'pinjore', 'dest-120', 4.8, 3300.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Pinjore & Yadavindra Gardens Attraction Area, Pinjore', 30.7907, 76.9097, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0167', 'Grand Morni Hills Residency & Resort', 'morni-hills', 'dest-121', 4.8, 4800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Morni Hills & Tikkar Taal Main Hub, Morni Hills', 30.7004, 77.0947, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0168', 'Morni Hills & Tikkar Taal Heritage Homestay', 'morni-hills', 'dest-121', 4.9, 3450.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Morni Hills & Tikkar Taal Attraction Area, Morni Hills', 30.6864, 77.0807, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0169', 'Grand Silvassa Residency & Resort', 'silvassa', 'dest-118', 4.9, 5000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Silvassa Main Hub, Silvassa', 20.2843, 73.0163, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0170', 'Silvassa Heritage Homestay', 'silvassa', 'dest-118', 4.6, 1800.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Silvassa Attraction Area, Silvassa', 20.2703, 73.0023, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0171', 'Grand Warangal Residency & Resort', 'warangal', 'dest-102', 4.5, 5200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Warangal Main Hub, Warangal', 17.9769, 79.6021, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0172', 'Warangal Heritage Homestay', 'warangal', 'dest-102', 4.7, 1950.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Warangal Attraction Area, Warangal', 17.9629, 79.5881, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0173', 'Grand South Goa Residency & Resort', 'south-goa', 'dest-87', 4.6, 5400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Hidden Goa Coves (Butterfly & Nearby Beaches) Main Hub, South Goa', 15.018, 74.028, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0174', 'Hidden Goa Coves (Butterfly & Nearby Beaches) Heritage Homestay', 'south-goa', 'dest-87', 4.8, 2100.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Hidden Goa Coves (Butterfly & Nearby Beaches) Attraction Area, South Goa', 15.004, 74.014, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0175', 'Grand Agatti Island Residency & Resort', 'agatti', 'dest-49', 4.7, 5600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Lakshadweep (Agatti–Bangaram–Kadmat circuit) Main Hub, Agatti Island', 10.838, 72.198, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0176', 'Lakshadweep (Agatti–Bangaram–Kadmat circuit) Heritage Homestay', 'agatti', 'dest-49', 4.9, 2250.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Lakshadweep (Agatti–Bangaram–Kadmat circuit) Attraction Area, Agatti Island', 10.824, 72.184, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0177', 'Grand West Jaintia Hills Residency & Resort', 'west-jaintia-hills', 'dest-35', 4.8, 5800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Dawki & Shnongpdeng Main Hub, West Jaintia Hills', 25.208, 92.028, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0178', 'Dawki & Shnongpdeng Heritage Homestay', 'west-jaintia-hills', 'dest-35', 4.6, 2400.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Dawki & Shnongpdeng Attraction Area, West Jaintia Hills', 25.194, 92.014, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0179', 'Grand Wayanad Residency & Resort', 'wayanad', 'dest-54', 4.9, 6000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Wayanad Main Hub, Wayanad', 11.618, 76.088, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0180', 'Wayanad Heritage Homestay', 'wayanad', 'dest-54', 4.7, 2550.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Wayanad Attraction Area, Wayanad', 11.604, 76.074, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0181', 'Grand East Khasi Hills Residency & Resort', 'east-khasi-hills', 'dest-33', 4.5, 3200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Shillong Main Hub, East Khasi Hills', 25.5868, 91.9013, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0182', 'Shillong Heritage Homestay', 'east-khasi-hills', 'dest-33', 4.8, 2700.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Shillong Attraction Area, East Khasi Hills', 25.5728, 91.8873, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0183', 'Grand Chikkamagaluru Residency & Resort', 'chikkamagaluru', 'dest-57', 4.6, 3400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Chikmagalur Main Hub, Chikkamagaluru', 13.328, 75.778, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0184', 'Chikmagalur Heritage Homestay', 'chikkamagaluru', 'dest-57', 4.9, 2850.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Chikmagalur Attraction Area, Chikkamagaluru', 13.314, 75.764, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0185', 'Grand South Andaman Residency & Resort', 'south-andaman', 'dest-32', 4.7, 3600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Neil Island (Shaheed Dweep) Main Hub, South Andaman', 11.838, 93.058, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0186', 'Neil Island (Shaheed Dweep) Heritage Homestay', 'south-andaman', 'dest-32', 4.6, 3000.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Neil Island (Shaheed Dweep) Attraction Area, South Andaman', 11.824, 93.044, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0187', 'Grand North Sikkim Residency & Resort', 'north-sikkim', 'dest-66', 4.8, 3800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near North Sikkim (Lachung–Lachen Belt) Main Hub, North Sikkim', 27.708, 88.718, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0188', 'North Sikkim (Lachung–Lachen Belt) Heritage Homestay', 'north-sikkim', 'dest-66', 4.7, 3150.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near North Sikkim (Lachung–Lachen Belt) Attraction Area, North Sikkim', 27.694, 88.704, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0189', 'Grand Khajuraho Residency & Resort', 'khajuraho', 'dest-69', 4.9, 4000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Khajuraho & Panna National Park Main Hub, Khajuraho', 24.858, 79.938, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0190', 'Khajuraho & Panna National Park Heritage Homestay', 'khajuraho', 'dest-69', 4.8, 3300.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Khajuraho & Panna National Park Attraction Area, Khajuraho', 24.844, 79.924, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0191', 'Grand Almora Residency & Resort', 'almora', 'dest-72', 4.5, 4200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Almora & Kasar Devi Belt Main Hub, Almora', 29.628, 79.678, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0192', 'Almora & Kasar Devi Belt Heritage Homestay', 'almora', 'dest-72', 4.9, 3450.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Almora & Kasar Devi Belt Attraction Area, Almora', 29.614, 79.664, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0193', 'Grand Kinnaur Residency & Resort', 'kinnaur', 'dest-76', 4.6, 4400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Chitkul & Baspa Valley Main Hub, Kinnaur', 31.358, 78.438, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0194', 'Chitkul & Baspa Valley Heritage Homestay', 'kinnaur', 'dest-76', 4.6, 1800.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Chitkul & Baspa Valley Attraction Area, Kinnaur', 31.344, 78.424, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0195', 'Grand Kachchh Residency & Resort', 'kachchh', 'dest-22', 4.7, 4600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Rann of Kutch (White Desert, Dhordo) Main Hub, Kachchh', 23.7413, 69.8913, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0196', 'Rann of Kutch (White Desert, Dhordo) Heritage Homestay', 'kachchh', 'dest-22', 4.7, 1950.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Rann of Kutch (White Desert, Dhordo) Attraction Area, Kachchh', 23.7273, 69.8773, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0197', 'Grand Mandya Residency & Resort', 'mandya', 'dest-79', 4.8, 4800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Ranganathittu Bird Sanctuary Main Hub, Mandya', 12.428, 76.658, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0198', 'Ranganathittu Bird Sanctuary Heritage Homestay', 'mandya', 'dest-79', 4.8, 2100.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Ranganathittu Bird Sanctuary Attraction Area, Mandya', 12.414, 76.644, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0199', 'Grand Madikeri Residency & Resort', 'madikeri', 'dest-8', 4.9, 5000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Coorg (Kodagu) Main Hub, Madikeri', 12.3455, 75.8149, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0200', 'Coorg (Kodagu) Heritage Homestay', 'madikeri', 'dest-8', 4.9, 2250.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Coorg (Kodagu) Attraction Area, Madikeri', 12.3315, 75.8009, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0201', 'Grand Munnar Residency & Resort', 'munnar', 'dest-20', 4.5, 5200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Munnar Main Hub, Munnar', 10.0969, 77.0675, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0202', 'Munnar Heritage Homestay', 'munnar', 'dest-20', 4.6, 2400.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Munnar Attraction Area, Munnar', 10.0829, 77.0535, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0203', 'Grand Leh Residency & Resort', 'leh', 'dest-17', 4.6, 5400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Nubra Valley Main Hub, Leh', 34.678, 77.588, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0204', 'Nubra Valley Heritage Homestay', 'leh', 'dest-17', 4.7, 2550.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Nubra Valley Attraction Area, Leh', 34.664, 77.574, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0205', 'Grand Bangaram Island Residency & Resort', 'bangaram', 'dest-88', 4.7, 5600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Bangaram & Kadmat Islands (Lakshadweep Quiet Beaches) Main Hub, Bangaram Island', 10.868, 72.298, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0206', 'Bangaram & Kadmat Islands (Lakshadweep Quiet Beaches) Heritage Homestay', 'bangaram', 'dest-88', 4.8, 2700.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Bangaram & Kadmat Islands (Lakshadweep Quiet Beaches) Attraction Area, Bangaram Island', 10.854, 72.284, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0207', 'Grand Kangra Residency & Resort', 'kangra', 'dest-12', 4.8, 5800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Dharamshala & McLeod Ganj Main Hub, Kangra', 32.227, 76.3314, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0208', 'Dharamshala & McLeod Ganj Heritage Homestay', 'kangra', 'dest-12', 4.9, 2850.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Dharamshala & McLeod Ganj Attraction Area, Kangra', 32.213, 76.3174, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0209', 'Grand Tiruvannamalai Residency & Resort', 'tiruvannamalai', 'dest-98', 4.9, 6000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Tiruvannamalai & Arunachala (Inner Fire Journey) Main Hub, Tiruvannamalai', 12.238, 79.078, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0210', 'Tiruvannamalai & Arunachala (Inner Fire Journey) Heritage Homestay', 'tiruvannamalai', 'dest-98', 4.6, 3000.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Tiruvannamalai & Arunachala (Inner Fire Journey) Attraction Area, Tiruvannamalai', 12.224, 79.064, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0211', 'Grand Niwari Residency & Resort', 'niwari', 'dest-70', 4.5, 3200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Orchha & Nearby Betwa Landscapes Main Hub, Niwari', 25.358, 78.648, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0212', 'Orchha & Nearby Betwa Landscapes Heritage Homestay', 'niwari', 'dest-70', 4.7, 3150.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Orchha & Nearby Betwa Landscapes Attraction Area, Niwari', 25.344, 78.634, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0213', 'Grand East Khasi Hills Residency & Resort', 'east-khasi-hills', 'dest-10', 4.6, 3400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Mawlynnong & nearby (including Living Root Bridges region) Main Hub, East Khasi Hills', 25.2096, 91.9273, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0214', 'Mawlynnong & nearby (including Living Root Bridges region) Heritage Homestay', 'east-khasi-hills', 'dest-10', 4.8, 3300.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Mawlynnong & nearby (including Living Root Bridges region) Attraction Area, East Khasi Hills', 25.1956, 91.9133, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0215', 'Grand West Jaintia Hills Residency & Resort', 'west-jaintia-hills', 'dest-36', 4.7, 3600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Krang Suri Falls Main Hub, West Jaintia Hills', 25.348, 92.258, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0216', 'Krang Suri Falls Heritage Homestay', 'west-jaintia-hills', 'dest-36', 4.9, 3450.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Krang Suri Falls Attraction Area, West Jaintia Hills', 25.334, 92.244, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0217', 'Grand Kachchh Residency & Resort', 'kachchh', 'dest-52', 4.8, 3800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Kutch Interior Circuit (Bhuj–Mandvi–Villages) Main Hub, Kachchh', 23.258, 69.678, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0218', 'Kutch Interior Circuit (Bhuj–Mandvi–Villages) Heritage Homestay', 'kachchh', 'dest-52', 4.6, 1800.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Kutch Interior Circuit (Bhuj–Mandvi–Villages) Attraction Area, Kachchh', 23.244, 69.664, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0219', 'Grand Anuppur Residency & Resort', 'anuppur', 'dest-99', 4.9, 4000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Amarkantak Nature–Spiritual Loop Main Hub, Anuppur', 22.678, 81.758, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0220', 'Amarkantak Nature–Spiritual Loop Heritage Homestay', 'anuppur', 'dest-99', 4.7, 1950.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Amarkantak Nature–Spiritual Loop Attraction Area, Anuppur', 22.664, 81.744, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0221', 'Grand Almora Residency & Resort', 'almora', 'dest-42', 4.5, 4200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Binsar Main Hub, Almora', 29.708, 79.778, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0222', 'Binsar Heritage Homestay', 'almora', 'dest-42', 4.8, 2100.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Binsar Attraction Area, Almora', 29.694, 79.764, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0223', 'Grand Udupi Residency & Resort', 'udupi', 'dest-83', 4.6, 4400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Maravanthe & Karnataka Offbeat Coast Main Hub, Udupi', 13.638, 74.698, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0224', 'Maravanthe & Karnataka Offbeat Coast Heritage Homestay', 'udupi', 'dest-83', 4.9, 2250.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Maravanthe & Karnataka Offbeat Coast Attraction Area, Udupi', 13.624, 74.684, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0225', 'Grand Chikkamagaluru Residency & Resort', 'chikkamagaluru', 'dest-60', 4.7, 4600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Kudremukh & Surrounding Ghats Main Hub, Chikkamagaluru', 13.138, 75.258, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0226', 'Kudremukh & Surrounding Ghats Heritage Homestay', 'chikkamagaluru', 'dest-60', 4.6, 2400.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Kudremukh & Surrounding Ghats Attraction Area, Chikkamagaluru', 13.124, 75.244, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0227', 'Grand Puri Residency & Resort', 'puri', 'dest-84', 4.8, 4800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Astaranga & Ramachandi Beaches (Odisha Quiet Coast) Main Hub, Puri', 19.908, 86.088, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0228', 'Astaranga & Ramachandi Beaches (Odisha Quiet Coast) Heritage Homestay', 'puri', 'dest-84', 4.7, 2550.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Astaranga & Ramachandi Beaches (Odisha Quiet Coast) Attraction Area, Puri', 19.894, 86.074, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0229', 'Grand Kailashahar Residency & Resort', 'kailashahar', 'dest-85', 4.9, 5000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Unakoti & North Tripura Heritage Belt Main Hub, Kailashahar', 24.378, 92.058, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0230', 'Unakoti & North Tripura Heritage Belt Heritage Homestay', 'kailashahar', 'dest-85', 4.8, 2700.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Unakoti & North Tripura Heritage Belt Attraction Area, Kailashahar', 24.364, 92.044, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0231', 'Grand Pithoragarh Residency & Resort', 'pithoragarh', 'dest-43', 4.5, 5200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Munsiyari Main Hub, Pithoragarh', 30.078, 80.248, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0232', 'Munsiyari Heritage Homestay', 'pithoragarh', 'dest-43', 4.9, 2850.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Munsiyari Attraction Area, Pithoragarh', 30.064, 80.234, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0233', 'Grand Uttara Kannada Residency & Resort', 'uttara-kannada', 'dest-25', 4.6, 5400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Gokarna Main Hub, Uttara Kannada', 14.557, 74.326, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0234', 'Gokarna Heritage Homestay', 'uttara-kannada', 'dest-25', 4.6, 3000.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Gokarna Attraction Area, Uttara Kannada', 14.543, 74.312, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0235', 'Grand Kasaragod Residency & Resort', 'kasaragod', 'dest-89', 4.7, 5600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Malanad–Malabar Backwater & Rural Belt Main Hub, Kasaragod', 12.358, 75.158, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0236', 'Malanad–Malabar Backwater & Rural Belt Heritage Homestay', 'kasaragod', 'dest-89', 4.7, 3150.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Malanad–Malabar Backwater & Rural Belt Attraction Area, Kasaragod', 12.344, 75.144, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0237', 'Grand Lahaul and Spiti Residency & Resort', 'lahaul-and-spiti', 'dest-16', 4.8, 5800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Spiti Valley Main Hub, Lahaul and Spiti', 32.228, 78.338, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0238', 'Spiti Valley Heritage Homestay', 'lahaul-and-spiti', 'dest-16', 4.8, 3300.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Spiti Valley Attraction Area, Lahaul and Spiti', 32.214, 78.324, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0239', 'Grand Bastar Residency & Resort', 'bastar', 'dest-24', 4.9, 6000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Chitrakote Falls Main Hub, Bastar', 18.986, 81.7148, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0240', 'Chitrakote Falls Heritage Homestay', 'bastar', 'dest-24', 4.9, 3450.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Chitrakote Falls Attraction Area, Bastar', 18.972, 81.7008, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0241', 'Grand Keylong Residency & Resort', 'keylong', 'dest-77', 4.5, 3200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Miyar Valley Main Hub, Keylong', 32.878, 76.958, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0242', 'Miyar Valley Heritage Homestay', 'keylong', 'dest-77', 4.6, 1800.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Miyar Valley Attraction Area, Keylong', 32.864, 76.944, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0243', 'Grand Lower Subansiri Residency & Resort', 'lower-subansiri', 'dest-9', 4.6, 3400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Ziro Valley Main Hub, Lower Subansiri', 27.6027, 93.8465, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0244', 'Ziro Valley Heritage Homestay', 'lower-subansiri', 'dest-9', 4.7, 1950.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Ziro Valley Attraction Area, Lower Subansiri', 27.5887, 93.8325, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0245', 'Grand Tehri Garhwal Residency & Resort', 'tehri-garhwal', 'dest-41', 4.7, 3600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Kanatal Main Hub, Tehri Garhwal', 30.458, 78.328, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0246', 'Kanatal Heritage Homestay', 'tehri-garhwal', 'dest-41', 4.8, 2100.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Kanatal Attraction Area, Tehri Garhwal', 30.444, 78.314, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0247', 'Grand Araku Valley Residency & Resort', 'araku-valley', 'dest-29', 4.8, 3800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Araku Valley Main Hub, Araku Valley', 18.3353, 82.883, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0248', 'Araku Valley Heritage Homestay', 'araku-valley', 'dest-29', 4.9, 2250.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Araku Valley Attraction Area, Araku Valley', 18.3213, 82.869, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0249', 'Grand Sindhudurg Residency & Resort', 'sindhudurg', 'dest-58', 4.9, 4000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Amboli Ghat Main Hub, Sindhudurg', 15.968, 74.008, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0250', 'Amboli Ghat Heritage Homestay', 'sindhudurg', 'dest-58', 4.6, 2400.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Amboli Ghat Attraction Area, Sindhudurg', 15.954, 73.994, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0251', 'Grand Kalpeni Island Residency & Resort', 'kalpeni', 'dest-50', 4.5, 4200.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Kalpeni Island (Lakshadweep) Main Hub, Kalpeni Island', 10.078, 73.658, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0252', 'Kalpeni Island (Lakshadweep) Heritage Homestay', 'kalpeni', 'dest-50', 4.7, 2550.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Kalpeni Island (Lakshadweep) Attraction Area, Kalpeni Island', 10.064, 73.644, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0253', 'Grand Chamba Residency & Resort', 'chamba', 'dest-15', 4.6, 4400.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Khajjiar Main Hub, Chamba', 32.56, 76.0695, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0254', 'Khajjiar Heritage Homestay', 'chamba', 'dest-15', 4.8, 2700.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Khajjiar Attraction Area, Chamba', 32.546, 76.0555, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0255', 'Grand Agumbe Residency & Resort', 'agumbe', 'dest-59', 4.7, 4600.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Agumbe & Western Ghats Rainforest Belt Main Hub, Agumbe', 13.508, 75.088, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0256', 'Agumbe & Western Ghats Rainforest Belt Heritage Homestay', 'agumbe', 'dest-59', 4.9, 2850.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Agumbe & Western Ghats Rainforest Belt Attraction Area, Agumbe', 13.494, 75.074, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0257', 'Grand Majuli Residency & Resort', 'majuli', 'dest-28', 4.8, 4800.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Majuli Island Main Hub, Majuli', 26.958, 94.208, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0258', 'Majuli Island Heritage Homestay', 'majuli', 'dest-28', 4.6, 3000.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Majuli Island Attraction Area, Majuli', 26.944, 94.194, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-gen-0259', 'Grand Ramanathapuram Residency & Resort', 'ramanathapuram', 'dest-23', 4.9, 5000.0, '{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'Near Dhanushkodi (Ghost Town & Beach) Main Hub, Ramanathapuram', 9.1611, 79.45, 'PARTNER', NOW(), NOW()),
  ('htl-gen-0260', 'Dhanushkodi (Ghost Town & Beach) Heritage Homestay', 'ramanathapuram', 'dest-23', 4.7, 3150.0, '{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near Dhanushkodi (Ghost Town & Beach) Attraction Area, Ramanathapuram', 9.1471, 79.436, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Ensure all hotels in DB have destination_id linked where missing
UPDATE hotels h
SET destination_id = d.id, updated_at = NOW()
FROM destinations d
WHERE h.destination_id IS NULL
  AND d.city_id IS NOT NULL
  AND LOWER(h.city_id) = LOWER(d.city_id);
