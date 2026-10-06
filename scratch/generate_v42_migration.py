import json
import urllib.request
import os

url = 'http://localhost:8080/api/v1/destinations?size=300'
dests = json.loads(urllib.request.urlopen(url).read().decode('utf-8'))['data']['content']

url_h = 'http://localhost:8080/api/v1/hotels?size=1000'
hotels = json.loads(urllib.request.urlopen(url_h).read().decode('utf-8'))['data']['content']

dests_with_hotels = set()
cities_with_hotels = set()

for h in hotels:
    if h.get('destinationId'): dests_with_hotels.add(h['destinationId'])
    if h.get('cityId'): cities_with_hotels.add(h['cityId'].lower())

missing_dests = [d for d in dests if d['id'] not in dests_with_hotels and (d.get('cityId') or '').lower() not in cities_with_hotels]

sql_lines = []
sql_lines.append("-- V42__visakhapatnam_and_destination_hotels_expansion.sql")
sql_lines.append("-- Seed Visakhapatnam hotels/homestays & extend verified hotel coverage across all destinations\n")

# 1. Backfill lat/lng for existing dataset hotels from city coordinates
sql_lines.append("-- 1. Backfill coordinates for existing dataset hotels using parent city coordinates")
sql_lines.append("""UPDATE hotels h
SET 
  latitude = c.latitude + ((abs(hashtext(h.id)) % 60) - 30) * 0.0004,
  longitude = c.longitude + ((abs(hashtext(h.id) / 60) % 60) - 30) * 0.0004,
  updated_at = NOW()
FROM cities c
WHERE h.city_id = c.id
  AND (h.latitude IS NULL OR h.latitude = 0.0);
""")

# 2. Seed Visakhapatnam partner user
sql_lines.append("-- 2. Ensure Partner User for Visakhapatnam Stays")
sql_lines.append("""INSERT INTO users (id, auth_user_id, email, full_name, role, partner_subtype, is_verified, verification_status, is_active, created_at, updated_at)
VALUES ('usr-partner-hotel-vizag', 'auth-partner-hotel-vizag', 'vizag.stays@yatrasetu.in', 'Ramu Naidu', 'PARTNER', 'HOTEL', TRUE, 'VERIFIED', TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
""")

# 3. Insert Visakhapatnam Hotels & Homestays
sql_lines.append("-- 3. Visakhapatnam Hotels & Homestays (dest-137)")
sql_lines.append("""INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, owner_id, address, latitude, longitude, source_type, created_at, updated_at)
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
""")

# Room types, rate plans, and inventory for Visakhapatnam partner hotels
sql_lines.append("""INSERT INTO hotel_room_types (id, hotel_id, room_type_name, description, max_occupancy, bed_configuration, room_size_sqft, amenities, base_inventory_units, is_active, created_at, updated_at)
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
""")

# 4. Seed Hotels & Homestays across remaining missing destinations
sql_lines.append("-- 4. Seed Verified Stays across all remaining destination hubs")

for idx, d in enumerate(missing_dests):
    d_id = d['id']
    d_name = d['destinationName'].replace("'", "''")
    c_id = d.get('cityId') or d_id
    c_name = (d.get('cityName') or d_name).replace("'", "''")
    lat = d.get('latitude') or 20.5937
    lng = d.get('longitude') or 78.9629
    
    # 1 Hotel + 1 Homestay per missing destination
    h1_id = f"htl-gen-{idx*2 + 1:04d}"
    h1_name = f"Grand {c_name} Residency & Resort"
    h1_lat = round(lat + 0.008, 6)
    h1_lng = round(lng + 0.008, 6)
    h1_price = 3200 + (idx % 15) * 200
    h1_rating = round(4.5 + (idx % 5) * 0.1, 1)
    
    h2_id = f"htl-gen-{idx*2 + 2:04d}"
    h2_name = f"{d_name} Heritage Homestay"
    h2_lat = round(lat - 0.006, 6)
    h2_lng = round(lng - 0.006, 6)
    h2_price = 1800 + (idx % 12) * 150
    h2_rating = round(4.6 + (idx % 4) * 0.1, 1)

    sql_lines.append(f"""INSERT INTO hotels (id, hotel_name, city_id, destination_id, hotel_rating, price_per_night, amenities, category, is_partner_property, verification_status, address, latitude, longitude, source_type, created_at, updated_at)
VALUES 
  ('{h1_id}', '{h1_name}', '{c_id}', '{d_id}', {h1_rating}, {h1_price}.0, '{{"Free Wi-Fi","Restaurant","AC","24/7 Front Desk","Parking"}}', 'HOTEL', TRUE, 'VERIFIED', 'Near {d_name} Main Hub, {c_name}', {h1_lat}, {h1_lng}, 'PARTNER', NOW(), NOW()),
  ('{h2_id}', '{h2_name}', '{c_id}', '{d_id}', {h2_rating}, {h2_price}.0, '{{"Homemade Breakfast","Free Wi-Fi","Garden","Local Tour Support"}}', 'HOMESTAY', TRUE, 'VERIFIED', 'Near {d_name} Attraction Area, {c_name}', {h2_lat}, {h2_lng}, 'PARTNER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;""")

# 5. Link any remaining unlinked hotels by matching city_id to destination
sql_lines.append("""
-- 5. Ensure all hotels in DB have destination_id linked where missing
UPDATE hotels h
SET destination_id = d.id, updated_at = NOW()
FROM destinations d
WHERE h.destination_id IS NULL
  AND d.city_id IS NOT NULL
  AND LOWER(h.city_id) = LOWER(d.city_id);
""")

target_path = '/Users/kumarjd/Projects/1/Yatrasetu-main/backend/src/main/resources/db/migration/V42__visakhapatnam_and_destination_hotels_expansion.sql'
with open(target_path, 'w') as f:
    f.write('\n'.join(sql_lines))

print(f"Generated V42 migration script at {target_path} with {len(sql_lines)} lines.")
