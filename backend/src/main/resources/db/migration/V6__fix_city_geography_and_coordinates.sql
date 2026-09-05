-- ==============================================================================
-- V6__fix_city_geography_and_coordinates.sql
-- Safe corrective migration for city geography, district, state & coordinates
-- Fixes 61 cities previously populated with fallback coords (20.5937, 78.9629) or IN-DL
-- Fixes 7 Srinagar local hosts mapped to IN-DL
-- Adds IN-CG (Chhattisgarh) state record
-- ==============================================================================

-- 1. Ensure Chhattisgarh state exists
INSERT INTO states (id, state_name, region, capital_city, description, created_at, updated_at)
VALUES ('IN-CG', 'Chhattisgarh', 'Central India', 'Raipur', 'Explore the lush forests, ancient temples, waterfalls, and rich tribal heritage of Chhattisgarh.', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Correct geography, districts, and coordinates for all 61 affected cities
UPDATE cities SET state_id = 'IN-GJ', district_name = 'Ahmedabad', latitude = 23.0225000, longitude = 72.5714000, updated_at = NOW() WHERE id = 'ahmedabad';
UPDATE cities SET state_id = 'IN-UP', district_name = 'Prayagraj', latitude = 25.4358000, longitude = 81.8463000, updated_at = NOW() WHERE id = 'allahabad';
UPDATE cities SET state_id = 'IN-MH', district_name = 'Amravati', latitude = 20.9374000, longitude = 77.7796000, updated_at = NOW() WHERE id = 'amravati';
UPDATE cities SET state_id = 'IN-MH', district_name = 'Aurangabad', latitude = 19.8762000, longitude = 75.3433000, updated_at = NOW() WHERE id = 'aurangabad';
UPDATE cities SET state_id = 'IN-KA', district_name = 'Bengaluru Urban', latitude = 12.9716000, longitude = 77.5946000, updated_at = NOW() WHERE id = 'bangalore';
UPDATE cities SET state_id = 'IN-KA', district_name = 'Bengaluru Urban', latitude = 12.9716000, longitude = 77.5946000, updated_at = NOW() WHERE id = 'bengaluru';
UPDATE cities SET state_id = 'IN-OD', district_name = 'Khordha', latitude = 20.2961000, longitude = 85.8245000, updated_at = NOW() WHERE id = 'bhubaneswar';
UPDATE cities SET state_id = 'IN-CH', district_name = 'Chandigarh', latitude = 30.7333000, longitude = 76.7794000, updated_at = NOW() WHERE id = 'chandigarh';
UPDATE cities SET state_id = 'IN-TN', district_name = 'Chennai', latitude = 13.0827000, longitude = 80.2707000, updated_at = NOW() WHERE id = 'chennai';
UPDATE cities SET state_id = 'IN-TN', district_name = 'Coimbatore', latitude = 11.0168000, longitude = 76.9558000, updated_at = NOW() WHERE id = 'coimbatore';
UPDATE cities SET state_id = 'IN-DL', district_name = 'Central Delhi', latitude = 28.6139000, longitude = 77.2090000, updated_at = NOW() WHERE id = 'delhi';
UPDATE cities SET state_id = 'IN-WB', district_name = 'Paschim Bardhaman', latitude = 23.5204000, longitude = 87.3119000, updated_at = NOW() WHERE id = 'durgapur';
UPDATE cities SET state_id = 'IN-HR', district_name = 'Faridabad', latitude = 28.4089000, longitude = 77.3178000, updated_at = NOW() WHERE id = 'faridabad';
UPDATE cities SET state_id = 'IN-GJ', district_name = 'Gandhinagar', latitude = 23.2156000, longitude = 72.6369000, updated_at = NOW() WHERE id = 'gandhinagar';
UPDATE cities SET state_id = 'IN-UP', district_name = 'Ghaziabad', latitude = 28.6692000, longitude = 77.4538000, updated_at = NOW() WHERE id = 'ghaziabad';
UPDATE cities SET state_id = 'IN-GA', district_name = 'North Goa', latitude = 15.2993000, longitude = 74.1240000, updated_at = NOW() WHERE id = 'goa';
UPDATE cities SET state_id = 'IN-AS', district_name = 'Kamrup Metropolitan', latitude = 26.1445000, longitude = 91.7362000, updated_at = NOW() WHERE id = 'guwahati';
UPDATE cities SET state_id = 'IN-MP', district_name = 'Gwalior', latitude = 26.2183000, longitude = 78.1828000, updated_at = NOW() WHERE id = 'gwalior';
UPDATE cities SET state_id = 'IN-KA', district_name = 'Vijayanagara', latitude = 15.3350000, longitude = 76.4600000, updated_at = NOW() WHERE id = 'hampi';
UPDATE cities SET state_id = 'IN-JH', district_name = 'Hazaribagh', latitude = 23.9961000, longitude = 85.3670000, updated_at = NOW() WHERE id = 'hazaribagh';
UPDATE cities SET state_id = 'IN-TG', district_name = 'Hyderabad', latitude = 17.3850000, longitude = 78.4867000, updated_at = NOW() WHERE id = 'hyderabad';
UPDATE cities SET state_id = 'IN-MP', district_name = 'Indore', latitude = 22.7196000, longitude = 75.8577000, updated_at = NOW() WHERE id = 'indore';
UPDATE cities SET state_id = 'IN-JH', district_name = 'East Singhbhum', latitude = 22.8046000, longitude = 86.2029000, updated_at = NOW() WHERE id = 'jamshedpur';
UPDATE cities SET state_id = 'IN-RJ', district_name = 'Jodhpur', latitude = 26.2389000, longitude = 73.0243000, updated_at = NOW() WHERE id = 'jodhpur';
UPDATE cities SET state_id = 'IN-UP', district_name = 'Kanpur Nagar', latitude = 26.4499000, longitude = 80.3319000, updated_at = NOW() WHERE id = 'kanpur';
UPDATE cities SET state_id = 'IN-JK', district_name = 'Srinagar', latitude = 34.0837000, longitude = 74.7973000, updated_at = NOW() WHERE id = 'kashmir';
UPDATE cities SET state_id = 'IN-KL', district_name = 'Ernakulam', latitude = 9.9312000, longitude = 76.2673000, updated_at = NOW() WHERE id = 'kochi';
UPDATE cities SET state_id = 'IN-WB', district_name = 'Kolkata', latitude = 22.5726000, longitude = 88.3639000, updated_at = NOW() WHERE id = 'kolkata';
UPDATE cities SET state_id = 'IN-KL', district_name = 'Kottayam', latitude = 9.6175000, longitude = 76.4301000, updated_at = NOW() WHERE id = 'kumarakom';
UPDATE cities SET state_id = 'IN-UP', district_name = 'Lucknow', latitude = 26.8467000, longitude = 80.9462000, updated_at = NOW() WHERE id = 'lucknow';
UPDATE cities SET state_id = 'IN-PB', district_name = 'Ludhiana', latitude = 30.9010000, longitude = 75.8573000, updated_at = NOW() WHERE id = 'ludhiana';
UPDATE cities SET state_id = 'IN-TN', district_name = 'Madurai', latitude = 9.9252000, longitude = 78.1198000, updated_at = NOW() WHERE id = 'madurai';
UPDATE cities SET state_id = 'IN-HP', district_name = 'Kullu', latitude = 32.2432000, longitude = 77.1892000, updated_at = NOW() WHERE id = 'manali';
UPDATE cities SET state_id = 'IN-KA', district_name = 'Dakshina Kannada', latitude = 12.9141000, longitude = 74.8560000, updated_at = NOW() WHERE id = 'mangalore';
UPDATE cities SET state_id = 'IN-KA', district_name = 'Dakshina Kannada', latitude = 12.9141000, longitude = 74.8560000, updated_at = NOW() WHERE id = 'mangaluru';
UPDATE cities SET state_id = 'IN-UP', district_name = 'Meerut', latitude = 28.9845000, longitude = 77.7064000, updated_at = NOW() WHERE id = 'meerut';
UPDATE cities SET state_id = 'IN-MH', district_name = 'Mumbai City', latitude = 19.0760000, longitude = 72.8777000, updated_at = NOW() WHERE id = 'mumbai';
UPDATE cities SET state_id = 'IN-KL', district_name = 'Idukki', latitude = 10.0889000, longitude = 77.0595000, updated_at = NOW() WHERE id = 'munnar';
UPDATE cities SET state_id = 'IN-KA', district_name = 'Mysuru', latitude = 12.2958000, longitude = 76.6394000, updated_at = NOW() WHERE id = 'mysore';
UPDATE cities SET state_id = 'IN-KA', district_name = 'Mysuru', latitude = 12.2958000, longitude = 76.6394000, updated_at = NOW() WHERE id = 'mysuru';
UPDATE cities SET state_id = 'IN-MH', district_name = 'Nagpur', latitude = 21.1458000, longitude = 79.0882000, updated_at = NOW() WHERE id = 'nagpur';
UPDATE cities SET state_id = 'IN-MH', district_name = 'Nashik', latitude = 19.9975000, longitude = 73.7898000, updated_at = NOW() WHERE id = 'nashik';
UPDATE cities SET state_id = 'IN-DL', district_name = 'New Delhi', latitude = 28.6139000, longitude = 77.2090000, updated_at = NOW() WHERE id = 'new-delhi';
UPDATE cities SET state_id = 'IN-UP', district_name = 'Gautam Buddha Nagar', latitude = 28.5355000, longitude = 77.3910000, updated_at = NOW() WHERE id = 'noida';
UPDATE cities SET state_id = 'IN-TN', district_name = 'Nilgiris', latitude = 11.4102000, longitude = 76.6950000, updated_at = NOW() WHERE id = 'ooty';
UPDATE cities SET state_id = 'IN-GA', district_name = 'North Goa', latitude = 15.4909000, longitude = 73.8278000, updated_at = NOW() WHERE id = 'panaji';
UPDATE cities SET state_id = 'IN-BR', district_name = 'Patna', latitude = 25.5941000, longitude = 85.1376000, updated_at = NOW() WHERE id = 'patna';
UPDATE cities SET state_id = 'IN-PY', district_name = 'Puducherry', latitude = 11.9416000, longitude = 79.8083000, updated_at = NOW() WHERE id = 'pondicherry';
UPDATE cities SET state_id = 'IN-MH', district_name = 'Pune', latitude = 18.5204000, longitude = 73.8567000, updated_at = NOW() WHERE id = 'pune';
UPDATE cities SET state_id = 'IN-MP', district_name = 'Raipur', latitude = 21.2514000, longitude = 81.6296000, updated_at = NOW() WHERE id = 'raipur';
UPDATE cities SET state_id = 'IN-JH', district_name = 'Ranchi', latitude = 23.3441000, longitude = 85.3096000, updated_at = NOW() WHERE id = 'ranchi';
UPDATE cities SET state_id = 'IN-UT', district_name = 'Dehradun', latitude = 30.0869000, longitude = 78.2676000, updated_at = NOW() WHERE id = 'rishikesh';
UPDATE cities SET state_id = 'IN-SK', district_name = 'East Sikkim', latitude = 27.3389000, longitude = 88.6065000, updated_at = NOW() WHERE id = 'sikkim';
UPDATE cities SET state_id = 'IN-JK', district_name = 'Srinagar', latitude = 34.0837000, longitude = 74.7973000, updated_at = NOW() WHERE id = 'srinagar';
UPDATE cities SET state_id = 'IN-AP', district_name = 'Tirupati', latitude = 13.6288000, longitude = 79.4192000, updated_at = NOW() WHERE id = 'tirupati';
UPDATE cities SET state_id = 'IN-KL', district_name = 'Thiruvananthapuram', latitude = 8.5241000, longitude = 76.9366000, updated_at = NOW() WHERE id = 'trivandrum';
UPDATE cities SET state_id = 'IN-GJ', district_name = 'Vadodara', latitude = 22.3072000, longitude = 73.1812000, updated_at = NOW() WHERE id = 'vadodara';
UPDATE cities SET state_id = 'IN-KL', district_name = 'Thiruvananthapuram', latitude = 8.7379000, longitude = 76.7163000, updated_at = NOW() WHERE id = 'varkala';
UPDATE cities SET state_id = 'IN-AP', district_name = 'NTR', latitude = 16.5062000, longitude = 80.6480000, updated_at = NOW() WHERE id = 'vijayawada';
UPDATE cities SET state_id = 'IN-AP', district_name = 'Visakhapatnam', latitude = 17.6868000, longitude = 83.2185000, updated_at = NOW() WHERE id = 'visakhapatnam';
UPDATE cities SET state_id = 'IN-TG', district_name = 'Hanamkonda', latitude = 17.9689000, longitude = 79.5941000, updated_at = NOW() WHERE id = 'warangal';

-- 3. Correct Srinagar local hosts that fell back to IN-DL due to 'and' vs '&' naming
UPDATE local_hosts SET state_id = 'IN-JK', updated_at = NOW()
WHERE city_id = 'srinagar' AND state_id = 'IN-DL';


