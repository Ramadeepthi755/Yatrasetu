-- ============================================================================
-- V7: Destination Data Quality, Geographical Accuracy & Curated Images
-- ============================================================================

-- 1. Add missing Union Territory state record for Lakshadweep (IN-LD)

INSERT INTO states (id, state_name, region, capital_city, description, banner_image_url, created_at, updated_at)
VALUES ('IN-LD', 'Lakshadweep', 'Island Territory', 'Kavaratti', 
        'Tropical archipelago of 36 islands known for sun-kissed beaches, coral reefs and turquoise lagoons.', 
        'https://upload.wikimedia.org/wikipedia/commons/7/72/Kadmat_Island_Beach_Lakshadweep.jpg', 
        NOW(), NOW())
ON CONFLICT (id) DO UPDATE 
SET state_name = EXCLUDED.state_name, 
    region = EXCLUDED.region, 
    capital_city = EXCLUDED.capital_city, 
    updated_at = NOW();

-- 2. Ensure clean canonical cities exist with verified coordinates and state relationships

INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub, created_at, updated_at)
VALUES ('agatti', 'Agatti Island', 'IN-LD', 'Lakshadweep', 10.8533, 72.1947, 'Tier-3', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET city_name = EXCLUDED.city_name,
    state_id = EXCLUDED.state_id,
    district_name = EXCLUDED.district_name,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();


INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub, created_at, updated_at)
VALUES ('kalpeni', 'Kalpeni Island', 'IN-LD', 'Lakshadweep', 10.07, 73.65, 'Tier-3', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET city_name = EXCLUDED.city_name,
    state_id = EXCLUDED.state_id,
    district_name = EXCLUDED.district_name,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();


INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub, created_at, updated_at)
VALUES ('bangaram', 'Bangaram Island', 'IN-LD', 'Lakshadweep', 10.94, 72.29, 'Tier-3', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET city_name = EXCLUDED.city_name,
    state_id = EXCLUDED.state_id,
    district_name = EXCLUDED.district_name,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();


INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub, created_at, updated_at)
VALUES ('rameswaram', 'Rameswaram', 'IN-TN', 'Ramanathapuram', 9.2876, 79.3129, 'Tier-3', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET city_name = EXCLUDED.city_name,
    state_id = EXCLUDED.state_id,
    district_name = EXCLUDED.district_name,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();


INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub, created_at, updated_at)
VALUES ('mahabalipuram', 'Mahabalipuram', 'IN-TN', 'Chengalpattu', 12.6269, 80.1927, 'Tier-3', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET city_name = EXCLUDED.city_name,
    state_id = EXCLUDED.state_id,
    district_name = EXCLUDED.district_name,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();


INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub, created_at, updated_at)
VALUES ('madikeri', 'Madikeri', 'IN-KA', 'Kodagu', 12.4244, 75.7382, 'Tier-3', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET city_name = EXCLUDED.city_name,
    state_id = EXCLUDED.state_id,
    district_name = EXCLUDED.district_name,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();


INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub, created_at, updated_at)
VALUES ('mathura', 'Mathura', 'IN-UP', 'Mathura', 27.4924, 77.6737, 'Tier-2', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET city_name = EXCLUDED.city_name,
    state_id = EXCLUDED.state_id,
    district_name = EXCLUDED.district_name,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();


INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub, created_at, updated_at)
VALUES ('kasaragod', 'Kasaragod', 'IN-KL', 'Kasaragod', 12.51, 74.98, 'Tier-3', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET city_name = EXCLUDED.city_name,
    state_id = EXCLUDED.state_id,
    district_name = EXCLUDED.district_name,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();


INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub, created_at, updated_at)
VALUES ('anuppur', 'Anuppur', 'IN-MP', 'Anuppur', 23.1, 81.69, 'Tier-3', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET city_name = EXCLUDED.city_name,
    state_id = EXCLUDED.state_id,
    district_name = EXCLUDED.district_name,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();


INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub, created_at, updated_at)
VALUES ('araku-valley', 'Araku Valley', 'IN-AP', 'Alluri Sitharama Raju', 18.3273, 82.875, 'Tier-3', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET city_name = EXCLUDED.city_name,
    state_id = EXCLUDED.state_id,
    district_name = EXCLUDED.district_name,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();


INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub, created_at, updated_at)
VALUES ('agumbe', 'Agumbe', 'IN-KA', 'Shivamogga', 13.5074, 75.0924, 'Tier-3', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET city_name = EXCLUDED.city_name,
    state_id = EXCLUDED.state_id,
    district_name = EXCLUDED.district_name,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();


INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub, created_at, updated_at)
VALUES ('kaziranga', 'Kaziranga', 'IN-AS', 'Golaghat', 26.58, 93.17, 'Tier-3', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET city_name = EXCLUDED.city_name,
    state_id = EXCLUDED.state_id,
    district_name = EXCLUDED.district_name,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();


INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub, created_at, updated_at)
VALUES ('khajuraho', 'Khajuraho', 'IN-MP', 'Chhatarpur', 24.85, 79.93, 'Tier-3', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET city_name = EXCLUDED.city_name,
    state_id = EXCLUDED.state_id,
    district_name = EXCLUDED.district_name,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();


INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub, created_at, updated_at)
VALUES ('kailashahar', 'Kailashahar', 'IN-TR', 'Unakoti', 24.32, 92.01, 'Tier-3', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET city_name = EXCLUDED.city_name,
    state_id = EXCLUDED.state_id,
    district_name = EXCLUDED.district_name,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();


INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub, created_at, updated_at)
VALUES ('mandla', 'Mandla', 'IN-MP', 'Mandla', 22.5986, 80.3712, 'Tier-3', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET city_name = EXCLUDED.city_name,
    state_id = EXCLUDED.state_id,
    district_name = EXCLUDED.district_name,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();


INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub, created_at, updated_at)
VALUES ('keylong', 'Keylong', 'IN-HP', 'Lahaul and Spiti', 32.571, 77.032, 'Tier-3', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET city_name = EXCLUDED.city_name,
    state_id = EXCLUDED.state_id,
    district_name = EXCLUDED.district_name,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();


INSERT INTO cities (id, city_name, state_id, district_name, latitude, longitude, tier, is_tourism_hub, created_at, updated_at)
VALUES ('shillong', 'Shillong', 'IN-ML', 'East Khasi Hills', 25.5788, 91.8933, 'Tier-2', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET city_name = EXCLUDED.city_name,
    state_id = EXCLUDED.state_id,
    district_name = EXCLUDED.district_name,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();

-- 3. Correct Bastar city state assignment from Chandigarh (IN-CH) to Chhattisgarh (IN-CG)
UPDATE cities SET state_id = 'IN-CG', district_name = 'Bastar', updated_at = NOW() WHERE id = 'bastar';

-- 4. Correct anomalous destinations to accurate state, city, and district

UPDATE destinations 
SET city_id = 'madikeri', 
    district = 'Kodagu', 
    state_id = 'IN-KA', 
    region = 'South India', 
    updated_at = NOW() 
WHERE id = 'dest-8';


UPDATE destinations 
SET city_id = 'ooty', 
    district = 'Nilgiris', 
    state_id = 'IN-TN', 
    region = 'South India', 
    updated_at = NOW() 
WHERE id = 'dest-19';


UPDATE destinations 
SET city_id = 'munnar', 
    district = 'Idukki', 
    state_id = 'IN-KL', 
    region = 'South India', 
    updated_at = NOW() 
WHERE id = 'dest-20';


UPDATE destinations 
SET city_id = 'bastar', 
    district = 'Bastar', 
    state_id = 'IN-CG', 
    region = 'Central India', 
    updated_at = NOW() 
WHERE id = 'dest-24';


UPDATE destinations 
SET city_id = 'hampi', 
    district = 'Vijayanagara', 
    state_id = 'IN-KA', 
    region = 'South India', 
    updated_at = NOW() 
WHERE id = 'dest-27';


UPDATE destinations 
SET city_id = 'araku-valley', 
    district = 'Alluri Sitharama Raju', 
    state_id = 'IN-AP', 
    region = 'South India', 
    updated_at = NOW() 
WHERE id = 'dest-29';


UPDATE destinations 
SET city_id = 'rishikesh', 
    district = 'Dehradun', 
    state_id = 'IN-UT', 
    region = 'North India', 
    updated_at = NOW() 
WHERE id = 'dest-37';


UPDATE destinations 
SET city_id = 'mandla', 
    district = 'Mandla', 
    state_id = 'IN-MP', 
    region = 'Central India', 
    updated_at = NOW() 
WHERE id = 'dest-45';


UPDATE destinations 
SET city_id = 'agatti', 
    district = 'Lakshadweep', 
    state_id = 'IN-LD', 
    region = 'Island Territory', 
    updated_at = NOW() 
WHERE id = 'dest-49';


UPDATE destinations 
SET city_id = 'kalpeni', 
    district = 'Lakshadweep', 
    state_id = 'IN-LD', 
    region = 'Island Territory', 
    updated_at = NOW() 
WHERE id = 'dest-50';


UPDATE destinations 
SET city_id = 'pune', 
    district = 'Pune', 
    state_id = 'IN-MH', 
    region = 'West India', 
    updated_at = NOW() 
WHERE id = 'dest-55';


UPDATE destinations 
SET city_id = 'agumbe', 
    district = 'Shivamogga', 
    state_id = 'IN-KA', 
    region = 'South India', 
    updated_at = NOW() 
WHERE id = 'dest-59';


UPDATE destinations 
SET city_id = 'shillong', 
    district = 'East Khasi Hills', 
    state_id = 'IN-ML', 
    region = 'North East India', 
    updated_at = NOW() 
WHERE id = 'dest-67';


UPDATE destinations 
SET city_id = 'kaziranga', 
    district = 'Golaghat', 
    state_id = 'IN-AS', 
    region = 'North East India', 
    updated_at = NOW() 
WHERE id = 'dest-68';


UPDATE destinations 
SET city_id = 'khajuraho', 
    district = 'Chhatarpur', 
    state_id = 'IN-MP', 
    region = 'Central India', 
    updated_at = NOW() 
WHERE id = 'dest-69';


UPDATE destinations 
SET city_id = 'keylong', 
    district = 'Lahaul and Spiti', 
    state_id = 'IN-HP', 
    region = 'North India', 
    updated_at = NOW() 
WHERE id = 'dest-77';


UPDATE destinations 
SET city_id = 'ahmedabad', 
    district = 'Ahmedabad', 
    state_id = 'IN-GJ', 
    region = 'West India', 
    updated_at = NOW() 
WHERE id = 'dest-80';


UPDATE destinations 
SET city_id = 'kailashahar', 
    district = 'Unakoti', 
    state_id = 'IN-TR', 
    region = 'North East India', 
    updated_at = NOW() 
WHERE id = 'dest-85';


UPDATE destinations 
SET city_id = 'mahabalipuram', 
    district = 'Chengalpattu', 
    state_id = 'IN-TN', 
    region = 'South India', 
    updated_at = NOW() 
WHERE id = 'dest-86';


UPDATE destinations 
SET city_id = 'bangaram', 
    district = 'Lakshadweep', 
    state_id = 'IN-LD', 
    region = 'Island Territory', 
    updated_at = NOW() 
WHERE id = 'dest-88';


UPDATE destinations 
SET city_id = 'kasaragod', 
    district = 'Kasaragod', 
    state_id = 'IN-KL', 
    region = 'South India', 
    updated_at = NOW() 
WHERE id = 'dest-89';


UPDATE destinations 
SET city_id = 'mathura', 
    district = 'Mathura', 
    state_id = 'IN-UP', 
    region = 'North India', 
    updated_at = NOW() 
WHERE id = 'dest-90';


UPDATE destinations 
SET city_id = 'rishikesh', 
    district = 'Dehradun', 
    state_id = 'IN-UT', 
    region = 'North India', 
    updated_at = NOW() 
WHERE id = 'dest-91';


UPDATE destinations 
SET city_id = 'rameswaram', 
    district = 'Ramanathapuram', 
    state_id = 'IN-TN', 
    region = 'South India', 
    updated_at = NOW() 
WHERE id = 'dest-94';


UPDATE destinations 
SET city_id = 'hampi', 
    district = 'Vijayanagara & Bagalkot', 
    state_id = 'IN-KA', 
    region = 'South India', 
    updated_at = NOW() 
WHERE id = 'dest-95';


UPDATE destinations 
SET city_id = 'anuppur', 
    district = 'Anuppur', 
    state_id = 'IN-MP', 
    region = 'Central India', 
    updated_at = NOW() 
WHERE id = 'dest-99';


UPDATE destinations 
SET city_id = 'haridwar', 
    district = 'Haridwar', 
    state_id = 'IN-UT', 
    region = 'North India', 
    updated_at = NOW() 
WHERE id = 'dest-100';


-- 5. Populate verified destination-specific representative images for all 93 destinations
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/f/fc/BeachFun.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-1';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Leh_City_seen_from_Shanti_Stupa.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-2';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-3';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Varanasi%2C_India%2C_Ghats%2C_Cremation_ceremony_in_progress.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-4';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/6/68/Taj_Mahal%2C_Agra%2C_India.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-5';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Evening_view%2C_City_Palace%2C_Udaipur.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-6';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Alappuzha_Boat_Beauty_W.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-7';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/1/17/Tadiandamol_Valley%2C_Western_Ghats.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-8';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/1/1e/A_cross_section_of_luch_green_valley_of_Ziro.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-9';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Mawlynnong_-_Cleanest_village_of_Asia.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-10';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Landscape_of_Shimla_%2C_Himachal_Pradesh.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-11';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/4/44/McLeod_Ganj_Dharamkot_Dharmsala_Himachal_Pradesh_India_April_2014.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-12';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/0/03/Manali_City.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-13';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/d/d9/The_buddist_monastry.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-14';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Nature_of_Khajjiar.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-15';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Spiti_River_Kaza_Himachal_Jun18_D72_7232.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-16';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/7/75/5_Nubra_valley.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-17';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/6/66/ISS054-E-7809_-_View_of_Earth_%28cropped%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-18';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/d/db/Ooty_lake.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-19';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Munnar_Overview.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-20';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Vivekananda_Rock_Memorial%2C_Kanyakumari.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-21';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Rann_of_Kutch_-_White_Desert.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-22';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Final_Dhanush_002.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-23';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/9/91/Chitrakot_waterfalls.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-24';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Delight_india.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-25';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Pondicherry-Rock_beach_aerial_view.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-26';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-27';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Doriya_River_of_Majuli.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-28';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Araku-valley.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-29';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/4/49/Varkala_Beach%2C_Varkala%2C_Kerala.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-30';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/6/63/Havelock%2C_Andaman_%26_Nicobar_Islands.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-31';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Keshet_neal_island_india.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-32';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Elephant_Falls_II%2C_Shillong.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-33';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Cherrapunji.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-34';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Umngot_river%2C_Dawki.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-35';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/5/55/Dawki_River%2C_Meghalaya%2C_India.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-36';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/7/74/Trayambakeshwar_Temple_VK.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-37';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/0/00/Ganga_aarti_haridwar_01.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-38';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Golden_Temple_Amritsar_Gurudwara_%28cropped%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-40';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/2/29/Kanatal.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-41';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/8/83/Binsar_Mahadev_temple_old_structure.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-42';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Panchchuli_range_viewed_from_Kausani.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-43';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/c/c6/%27The_Holy_Ganga%27_by_Kaustubh_Nayyar.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-44';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Tiger_Kanha_National_Park.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-45';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Ranthambore_National_Park.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-46';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/8/86/Tigress_in_Bandhavgarh_NP.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-47';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/d/da/Panthera_tigris_tigris_Tidoba_20150306.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-48';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/a/af/Agatti_Airstrip.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-49';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/9/93/ISS002-E-7261_-_View_of_Lakshadweep.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-50';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/4/46/Jaisalmer_Fort.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-51';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/8/83/Pragmahal_Bhuj_Kutch_Gujarat.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-52';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Blue%2C_Green_%26_White.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-54';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/c/c1/AnaimudiPeak_DSC_4834.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-55';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/0/01/MAHABALESWAR_LANDSCAPE.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-56';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/d/db/Chikmagalur%2C_India._%287793316622%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-57';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/4/48/Amboli5.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-58';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Agumbe_View_point.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-59';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Shola_Grasslands_and_forests_in_the_Kudremukh_National_Park%2C_Western_Ghats%2C_Karnataka.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-60';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/9/9b/View_from_South_Point%2C_%28Port_Blair%2C_India%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-63';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/9/96/DarjeelingTrainFruitshop_%282%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-64';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Kangch-Goechala.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-65';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Lachung_Town.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-66';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/5/51/Living_root_bridges%2C_Nongriat_village%2C_Meghalaya2.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-67';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Beauty_of_Kaziranga_National_Park.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-68';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/e/e7/1_Khajuraho.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-69';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/4/48/Chaturbhuj_Temple%2C_Orchha.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-70';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/7/77/Almora_Uttarakhand_India_2013.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-72';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Himalayn_National_Park_01.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-75';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/0/02/Temple_at_Chitkul.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-76';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Kardhang_Biling_Bhaga_Dhauladhar_Oct22_A7C_04645.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-77';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/a/af/Bharatpur_museums.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-78';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/7/75/Spot-billed_Pelican_Rising_Flight_Ranganathittu_Feb24_D72_26266.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-79';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/0/07/Map_of_bird_sanctuary%2C_Nal_Sarovar%2C_Gujarat%2C_India.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-80';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/6/65/Gujarat_Gulfs.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-81';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Sam_sand_dunes_Jaisalmer.jpg', updated_at = NOW() WHERE id = 'dest-82';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/en/b/ba/Maravanthe_beach.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-83';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Chandrabhaga_Beach_Odisha.jpg', updated_at = NOW() WHERE id = 'dest-84';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/9/90/Unakoti_Rock_Carvings_Tripura.jpg', updated_at = NOW() WHERE id = 'dest-85';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/d/d7/A_collage_of_Mamallapuram_town_Tamil_Nadu_India.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-86';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Palolem_Beach%2C_South_Goa.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-87';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/7/72/Kadmat_Island_Beach_Lakshadweep.jpg', updated_at = NOW() WHERE id = 'dest-88';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Bakel_Fort_Beach_Kasaragod7.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-89';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Vishram_Ghat.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-90';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/0/08/Triveni_Ghat_Krishna_Arjun_Rath.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-91';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/0/04/Ahilya_Ghat_by_the_Ganges%2C_Varanasi.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-92';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/3/37/Mahabodhi_temple_at_Bodhgaya_in_Bihar_21.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-93';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Pamban_Bridge_Train_Passing.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-94';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/0/03/Pattadakal_000.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-95';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Ancient_Temple%2C_Gulmarg.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-96';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/8/83/Auli_Himalayas.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-97';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Tiruvannamalai_Montage.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-98';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/1/14/A_Hindu_temple%2C_Amarkantak_Madhya_Pradesh_India.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-99';
UPDATE destinations SET hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/6/68/Badrinath_Temple-_Uttarakhand.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original', updated_at = NOW() WHERE id = 'dest-100';

-- 6. Correct POI associations and eliminate cross-city contamination

-- Clear spurious modulo destination assignments from generic city POIs
UPDATE destination_pois
SET destination_id = NULL
WHERE id LIKE 'poi-city-%';

-- Re-assign authentic destination IDs for POIs belonging to curated destinations
UPDATE destination_pois SET destination_id = 'dest-20', city_id = 'munnar' WHERE poi_name ILIKE '%munnar%';
UPDATE destination_pois SET destination_id = 'dest-13', city_id = 'manali' WHERE poi_name ILIKE '%manali%';

-- Add authentic Hampi and Pattadakal heritage POIs
INSERT INTO destination_pois (id, poi_name, destination_id, city_id, category, latitude, longitude, tags, characteristics, entry_fee_inr, typical_duration_hours, is_active, created_at, updated_at)
VALUES
    ('poi-hampi-1', 'Virupaksha Temple', 'dest-27', 'hampi', 'Heritage & Spiritual', 15.3353, 76.4600, '{"ancient", "temple", "unesco", "heritage"}', '7th-century active temple dedicated to Lord Shiva with towering gopuram on the Tungabhadra River.', 25, 2.0, true, NOW(), NOW()),
    ('poi-hampi-2', 'Vittala Temple & Iconic Stone Chariot', 'dest-27', 'hampi', 'Heritage & Architecture', 15.3400, 76.4788, '{"unesco", "stone chariot", "musical pillars", "architecture"}', 'Grand 16th-century temple complex featuring the famous stone chariot shrine and carved musical pillars.', 40, 3.0, true, NOW(), NOW()),
    ('poi-hampi-3', 'Hemakuta Hill Temples', 'dest-27', 'hampi', 'Heritage & Scenic View', 15.3330, 76.4600, '{"sunset", "panoramic", "monuments", "ruins"}', 'Bouldered hilltop sprinkled with pre-Vijayanagara temples offering panoramic sunset vistas over Hampi ruins.', 0, 1.5, true, NOW(), NOW()),
    ('poi-hampi-4', 'Matanga Hill Sunrise Point', 'dest-27', 'hampi', 'Scenic & Trekking', 15.3340, 76.4680, '{"sunrise", "viewpoint", "trekking", "photography"}', 'Highest point in Hampi providing breathtaking 360-degree aerial views over the ruined capital city and boulder fields.', 0, 2.0, true, NOW(), NOW()),
    ('poi-hampi-5', 'Royal Enclosure & Lotus Mahal', 'dest-27', 'hampi', 'Heritage & Palaces', 15.3210, 76.4710, '{"palace", "architecture", "royal", "history"}', 'Core seat of the Vijayanagara royalty featuring the Indo-Islamic Lotus Mahal, Elephant Stables, and stepped tank.', 40, 2.5, true, NOW(), NOW()),
    ('poi-hampi-6', 'Pattadakal UNESCO Temple Complex', 'dest-95', 'hampi', 'UNESCO World Heritage', 15.9483, 75.8167, '{"unesco", "chalukya", "7th century", "architecture"}', 'Cradle of temple architecture on the Malaprabha River showcasing harmonious fusion of Nagara and Dravidian styles.', 40, 2.5, true, NOW(), NOW()),
    ('poi-hampi-7', 'Badami Cave Temples', 'dest-95', 'hampi', 'Rock-cut Heritage', 15.9189, 75.6792, '{"caves", "chalukya", "sculptures", "cliffs"}', 'Four majestic 6th-century rock-cut cave temples carved into red sandstone cliffs overlooking Agastya Lake.', 25, 2.5, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET poi_name = EXCLUDED.poi_name,
    destination_id = EXCLUDED.destination_id,
    city_id = EXCLUDED.city_id,
    category = EXCLUDED.category,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW();


-- 7. Clean up artificial states if unreferenced

DELETE FROM states WHERE id IN ('IN-KE', 'IN-MA') 
AND id NOT IN (SELECT DISTINCT state_id FROM cities) 
AND id NOT IN (SELECT DISTINCT state_id FROM destinations);
