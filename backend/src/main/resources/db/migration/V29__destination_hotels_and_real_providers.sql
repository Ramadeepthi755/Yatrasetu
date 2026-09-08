-- V29__destination_hotels_and_real_providers.sql
-- Explicitly link realistic hotels & stays to key SIH demo destinations

-- 1. Hyderabad (dest-101)
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, source_type)
VALUES 
  ('htl-hyd-1', 'Taj Falaknuma Palace', 'hyderabad', 'dest-101', 4.9, 32000.0, '{"Heritage Palace","Fine Dining","Royal Butler Service","Spa","Free Wi-Fi","Pool"}', 'Heritage', TRUE, 'VERIFIED', 'PARTNER'),
  ('htl-hyd-2', 'ITC Kohenur Luxury Collection', 'hyderabad', 'dest-101', 4.8, 14500.0, '{"Lake View Suites","Luxury Spa","Pool","Fine Dining","Free Wi-Fi","Fitness Center"}', 'Luxury', TRUE, 'VERIFIED', 'PARTNER'),
  ('htl-hyd-3', 'Courtyard by Marriott Hyderabad', 'hyderabad', 'dest-101', 4.5, 6200.0, '{"Hussain Sagar View","Breakfast Buffet","Free Wi-Fi","Pool","Fitness Center"}', 'Mid-Range', TRUE, 'VERIFIED', 'PARTNER'),
  ('htl-hyd-4', 'Deccan Heritage Homestay & Haveli', 'hyderabad', 'dest-101', 4.6, 2800.0, '{"Old City Heritage Walk Access","Hyderabadi Breakfast","Free Wi-Fi","Terrace Garden"}', 'Homestay', TRUE, 'VERIFIED', 'PARTNER')
ON CONFLICT (id) DO UPDATE SET 
  destination_id = EXCLUDED.destination_id,
  hotel_rating = EXCLUDED.hotel_rating,
  price_per_night = EXCLUDED.price_per_night,
  amenities = EXCLUDED.amenities,
  category = EXCLUDED.category,
  is_partner_property = EXCLUDED.is_partner_property,
  verification_status = EXCLUDED.verification_status;

-- 2. Jaipur (dest-3)
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, source_type)
VALUES 
  ('htl-jpr-1', 'Rambagh Palace Jaipur', 'jaipur', 'dest-3', 4.9, 38000.0, '{"Royal Heritage Suites","Peacock Garden","Fine Dining","Spa","Free Wi-Fi"}', 'Heritage', TRUE, 'VERIFIED', 'PARTNER'),
  ('htl-jpr-2', 'Samode Haveli Boutique Hotel', 'jaipur', 'dest-3', 4.7, 12500.0, '{"Traditional Frescoes","Courtyard Pool","Rajasthani Dining","Free Wi-Fi"}', 'Boutique', TRUE, 'VERIFIED', 'PARTNER'),
  ('htl-jpr-3', 'Shahpura House Heritage Stay', 'jaipur', 'dest-3', 4.5, 5400.0, '{"Traditional Rajput Architecture","Rooftop Restaurant","Pool","Free Wi-Fi"}', 'Heritage', TRUE, 'VERIFIED', 'PARTNER'),
  ('htl-jpr-4', 'Pink City Heritage Homestay', 'jaipur', 'dest-3', 4.6, 2200.0, '{"Near Hawa Mahal","Home Cooked Thali","Free Wi-Fi","Walking Tour Desk"}', 'Homestay', TRUE, 'VERIFIED', 'PARTNER')
ON CONFLICT (id) DO UPDATE SET 
  destination_id = EXCLUDED.destination_id,
  hotel_rating = EXCLUDED.hotel_rating,
  price_per_night = EXCLUDED.price_per_night,
  category = EXCLUDED.category,
  verification_status = EXCLUDED.verification_status;

-- 3. Varanasi (dest-4)
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, source_type)
VALUES 
  ('htl-vns-1', 'BrijRama Palace Varanasi', 'varanasi', 'dest-4', 4.8, 24000.0, '{"Ganga Ghat Frontage","Private Boat Service","Classical Sitar Music","Vegetarian Fine Dining"}', 'Heritage', TRUE, 'VERIFIED', 'PARTNER'),
  ('htl-vns-2', 'Taj Ganges Varanasi', 'varanasi', 'dest-4', 4.7, 11000.0, '{"Lush Gardens","Pool","Ayurvedic Spa","Fine Dining","Free Wi-Fi"}', 'Luxury', TRUE, 'VERIFIED', 'PARTNER'),
  ('htl-vns-3', 'Ganges View Heritage Haveli', 'varanasi', 'dest-4', 4.6, 4500.0, '{"Assi Ghat Steps","Morning Aarti View Terrace","Library","Free Wi-Fi"}', 'Boutique', TRUE, 'VERIFIED', 'PARTNER'),
  ('htl-vns-4', 'Kashi Traditional Guest House', 'varanasi', 'dest-4', 4.5, 1800.0, '{"Near Vishwanath Temple","Home Cooked Satvik Meals","Clean Rooms","Wi-Fi"}', 'Homestay', TRUE, 'VERIFIED', 'PARTNER')
ON CONFLICT (id) DO UPDATE SET 
  destination_id = EXCLUDED.destination_id,
  hotel_rating = EXCLUDED.hotel_rating,
  price_per_night = EXCLUDED.price_per_night,
  category = EXCLUDED.category,
  verification_status = EXCLUDED.verification_status;

-- 4. Hampi (dest-14)
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, source_type)
VALUES 
  ('htl-hmp-1', 'Evolve Back Kamalapura Palace', 'hampi', 'dest-14', 4.9, 29000.0, '{"Vijayanagara Architecture","Infinity Pool","History Concierge","Ayurvedic Spa"}', 'Luxury', TRUE, 'VERIFIED', 'PARTNER'),
  ('htl-hmp-2', 'Heritage Resort Hampi', 'hampi', 'dest-14', 4.6, 7500.0, '{"Organic Farm Stays","Pool","Guided Boulder Walk","Free Wi-Fi"}', 'Resort', TRUE, 'VERIFIED', 'PARTNER'),
  ('htl-hmp-3', 'Kishkinda Heritage Homestay', 'hampi', 'dest-14', 4.5, 2100.0, '{"Tungabhadra River View","Local Karnataka Cuisine","Bicycle Rentals","Wi-Fi"}', 'Homestay', TRUE, 'VERIFIED', 'PARTNER')
ON CONFLICT (id) DO UPDATE SET 
  destination_id = EXCLUDED.destination_id,
  hotel_rating = EXCLUDED.hotel_rating,
  price_per_night = EXCLUDED.price_per_night,
  category = EXCLUDED.category,
  verification_status = EXCLUDED.verification_status;

-- 5. Kochi / Fort Kochi (dest-1)
INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, source_type)
VALUES 
  ('htl-1', 'Crowne Plaza Kochi', 'kochi', 'dest-1', 4.6, 8854.0, '{"5-star hotel","Free breakfast","Free Wi-Fi","Pool","Spa"}', 'Luxury', TRUE, 'VERIFIED', 'PARTNER'),
  ('htl-9', 'Grand Hyatt Kochi Bolgatty', 'kochi', 'dest-1', 4.7, 14282.0, '{"5-star hotel","Waterfront Marina","Free Wi-Fi","Pool","Spa"}', 'Luxury', TRUE, 'VERIFIED', 'PARTNER'),
  ('htl-18', 'Napier Heritage Fort Kochi', 'kochi', 'dest-1', 4.5, 3808.0, '{"Colonial Architecture","Free Wi-Fi","Chinese Fishing Nets Walk","Restaurant"}', 'Boutique', TRUE, 'VERIFIED', 'PARTNER')
ON CONFLICT (id) DO UPDATE SET 
  destination_id = EXCLUDED.destination_id,
  hotel_rating = EXCLUDED.hotel_rating,
  price_per_night = EXCLUDED.price_per_night,
  category = EXCLUDED.category,
  verification_status = EXCLUDED.verification_status;
