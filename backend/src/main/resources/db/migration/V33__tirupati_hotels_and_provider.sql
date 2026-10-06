-- V33__tirupati_hotels_and_provider.sql
-- Seed Tirupati Grand Residency & authentic partner stays in Tirupati (dest-136)

-- 1. Ensure Partner User for Tirupati Hotel exists or link to demo partner
INSERT INTO users (
    id,
    auth_user_id,
    email,
    full_name,
    role,
    partner_subtype,
    is_verified,
    verification_status,
    is_active,
    created_at,
    updated_at
)
VALUES (
    'usr-partner-hotel-tpt',
    'auth-partner-hotel-tpt',
    'tirupati.grand@yatrasetu.in',
    'Srinivasa Rao',
    'PARTNER',
    'HOTEL',
    TRUE,
    'VERIFIED',
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 2. Hotels in Tirupati (dest-136)
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, owner_id, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('htl-tpt-1', 'Tirupati Grand Residency', 'tirupati', 'dest-136', 4.8, 3850.0, '{"Free High-Speed Wi-Fi","Complimentary Temple Shuttle","Vegetarian Multi-Cuisine Restaurant","24/7 Front Desk","Air Conditioning","Free Parking"}', 'HOTEL', TRUE, 'VERIFIED', 'usr-partner-hotel-tpt', 'Near Tirupati Railway Station, Renigunta Road, Tirupati, Andhra Pradesh 517501', 13.6300, 79.4200, 'PARTNER', NOW(), NOW()),
  ('htl-tpt-2', 'Saptagiri Heritage Haveli & Homestay', 'tirupati', 'dest-136', 4.7, 2400.0, '{"Traditional South Indian Breakfast","Hill View Terrace","Free Wi-Fi","Local Guide Desk","Ayurvedic Steam Bath"}', 'HOMESTAY', TRUE, 'VERIFIED', 'usr-partner-hotel-tpt', 'Kapila Theertham Road, Alipiri Foot Hills, Tirupati 517507', 13.6450, 79.4180, 'PARTNER', NOW(), NOW()),
  ('htl-tpt-3', 'Fortune Select Grand Ridge', 'tirupati', 'dest-136', 4.6, 6200.0, '{"Luxury Suites","Swimming Pool","Spa & Wellness Center","Fine Dining Restaurant","Free Wi-Fi","Airport Shuttle"}', 'RESORT', TRUE, 'VERIFIED', 'usr-partner-hotel-tpt', 'Shilparamam Theme Park, Tiruchanoor Road, Tirupati 517503', 13.6180, 79.4350, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  destination_id = EXCLUDED.destination_id,
  hotel_name = EXCLUDED.hotel_name,
  hotel_rating = EXCLUDED.hotel_rating,
  price_per_night = EXCLUDED.price_per_night,
  amenities = EXCLUDED.amenities,
  category = EXCLUDED.category,
  is_partner_property = EXCLUDED.is_partner_property,
  verification_status = EXCLUDED.verification_status,
  owner_id = EXCLUDED.owner_id,
  address = EXCLUDED.address,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;

-- Also ensure partner hotels have owner_id assigned to usr-partner-hotel-tpt if null
UPDATE hotels SET owner_id = 'usr-partner-hotel-tpt' WHERE is_partner_property = TRUE AND owner_id IS NULL;

-- 3. Room Types for Tirupati Grand Residency (htl-tpt-1)
INSERT INTO hotel_room_types (id, hotel_id, room_type_name, description, max_occupancy, bed_configuration, room_size_sqft, amenities, base_inventory_units, is_active, created_at, updated_at)
VALUES 
  ('room-tpt-1-deluxe', 'htl-tpt-1', 'Deluxe Temple View Room', 'Spacious air-conditioned room with king bed, balcony with view of Seshachalam hills, modern ensuite bathroom and high-speed Wi-Fi.', 2, '1 King Bed', 340, '{"Air Conditioning","Balcony","Free Wi-Fi","Smart TV","Tea/Coffee Maker","Hot Water Geyser"}', 10, TRUE, NOW(), NOW()),
  ('room-tpt-1-suite', 'htl-tpt-1', 'Executive Family Suite', 'Large two-bedroom suite ideal for pilgrim families with living area, twin queen beds, sofa seating, and complimentary fruit basket.', 4, '2 Queen Beds', 580, '{"Air Conditioning","Living Room","Free Wi-Fi","Mini Fridge","2 Ensuite Bathrooms","Temple Shuttle Priority"}', 5, TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  room_type_name = EXCLUDED.room_type_name,
  description = EXCLUDED.description,
  max_occupancy = EXCLUDED.max_occupancy,
  base_inventory_units = EXCLUDED.base_inventory_units;

-- 4. Rate Plans for Tirupati Grand Residency Rooms
INSERT INTO hotel_rate_plans (id, room_type_id, plan_name, meal_plan, description, base_price, currency, price_unit, status, cancellation_policy, cancellation_deadline_hours, taxes_included, fees_included, created_at, updated_at)
VALUES 
  ('rp-tpt-1-deluxe-cp', 'room-tpt-1-deluxe', 'Standard Flexible - Breakfast Included', 'CP', 'Includes complimentary traditional Andhra breakfast buffet and free cancellation up to 24 hours prior to check-in.', 3850.00, 'INR', 'PER_NIGHT', 'ACTIVE', 'FREE_CANCELLATION', 24, TRUE, TRUE, NOW(), NOW()),
  ('rp-tpt-1-deluxe-ep', 'room-tpt-1-deluxe', 'Room Only - Non-Refundable', 'EP', 'Special advance purchase rate without meal plan. Non-refundable upon booking.', 3200.00, 'INR', 'PER_NIGHT', 'ACTIVE', 'NON_REFUNDABLE', 0, TRUE, TRUE, NOW(), NOW()),
  ('rp-tpt-1-suite-map', 'room-tpt-1-suite', 'Family Pilgrim Special - Breakfast & Dinner', 'MAP', 'Includes complimentary buffet breakfast and wholesome Satvik dinner for the entire family.', 6500.00, 'INR', 'PER_NIGHT', 'ACTIVE', 'FREE_CANCELLATION', 48, TRUE, TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  base_price = EXCLUDED.base_price,
  status = EXCLUDED.status,
  meal_plan = EXCLUDED.meal_plan;

-- 5. Baseline Inventory for Tirupati Grand Residency Rooms
INSERT INTO hotel_inventory (id, room_type_id, inventory_date, total_units, blocked_units, created_at, updated_at)
VALUES 
  ('inv-tpt-1-deluxe-base', 'room-tpt-1-deluxe', NULL, 10, 0, NOW(), NOW()),
  ('inv-tpt-1-suite-base', 'room-tpt-1-suite', NULL, 5, 0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  total_units = EXCLUDED.total_units,
  blocked_units = EXCLUDED.blocked_units;
