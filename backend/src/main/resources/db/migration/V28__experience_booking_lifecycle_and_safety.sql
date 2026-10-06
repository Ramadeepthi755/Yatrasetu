-- V28: Experience Booking Lifecycle, Supporting Providers, Trip Safety Checkpoints, and Authentic Place-Wise Guides

-- 1. Create Experience Supporting Providers table (Task 12)
CREATE TABLE IF NOT EXISTS experience_supporting_providers (
    id VARCHAR(50) PRIMARY KEY,
    experience_id VARCHAR(50) NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    provider_id VARCHAR(50) NOT NULL,
    provider_name VARCHAR(150) NOT NULL,
    provider_type VARCHAR(50) NOT NULL, -- ARTISAN, HOTEL, LOCAL_BUSINESS, GUIDE, RESTAURANT
    role_description VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACCEPTED', -- INVITED, ACCEPTED, DECLINED
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exp_supp_providers_exp ON experience_supporting_providers(experience_id);
CREATE INDEX IF NOT EXISTS idx_exp_supp_providers_prov ON experience_supporting_providers(provider_id);

-- 2. Create Experience Bookings table (Task 11, 13, 14, 15)
CREATE TABLE IF NOT EXISTS experience_bookings (
    id VARCHAR(50) PRIMARY KEY,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    tourist_user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    host_id VARCHAR(50) NOT NULL REFERENCES local_hosts(id),
    experience_id VARCHAR(50) REFERENCES experiences(id),
    destination_id VARCHAR(50) REFERENCES destinations(id),
    booking_type VARCHAR(30) NOT NULL DEFAULT 'PREDEFINED', -- PREDEFINED, CUSTOMIZED
    booking_date DATE NOT NULL,
    start_time VARCHAR(20) DEFAULT '09:00 AM',
    guest_count INTEGER NOT NULL DEFAULT 1,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(40) NOT NULL DEFAULT 'REQUESTED',
    -- Lifecycle: REQUESTED, ACCEPTED, PAYMENT_PENDING, CONFIRMED, TRIP_STARTED, IN_PROGRESS, COMPLETION_PENDING, COMPLETED, REVIEWED, REJECTED, CANCELLED, DISPUTED, PAYMENT_FAILED, EXPIRED
    custom_requirements TEXT,
    custom_itinerary TEXT,
    payment_status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, AUTHORIZED, PAID, FAILED, REFUNDED
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exp_bookings_tourist ON experience_bookings(tourist_user_id);
CREATE INDEX IF NOT EXISTS idx_exp_bookings_host ON experience_bookings(host_id);
CREATE INDEX IF NOT EXISTS idx_exp_bookings_status ON experience_bookings(status);
CREATE INDEX IF NOT EXISTS idx_exp_bookings_dest ON experience_bookings(destination_id);

-- 3. Create Trip Check-ins table (Task 16 - Safety)
CREATE TABLE IF NOT EXISTS trip_checkins (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL REFERENCES experience_bookings(id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    checkpoint_name VARCHAR(100) NOT NULL,
    checkpoint_type VARCHAR(30) NOT NULL, -- START, MIDPOINT, CHECKPOINT, COMPLETION
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, MISSED, ESCALATED
    scheduled_time TIMESTAMP WITH TIME ZONE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trip_checkins_booking ON trip_checkins(booking_id);

-- 4. Create Trip Safety Incidents table (Task 16 - Safety & SOS)
CREATE TABLE IF NOT EXISTS trip_safety_incidents (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES experience_bookings(id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    incident_type VARCHAR(50) NOT NULL, -- SOS, MISSED_CHECKIN, ROUTE_DEVIATION, REPORTED_ISSUE
    severity VARCHAR(30) NOT NULL DEFAULT 'HIGH', -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(30) NOT NULL DEFAULT 'REPORTED', -- REPORTED, ACKNOWLEDGED, RESOLVED
    details TEXT NOT NULL,
    emergency_contact_notified BOOLEAN DEFAULT FALSE,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_safety_incidents_booking ON trip_safety_incidents(booking_id);

-- 5. Create Experience Reviews table (Task 17 - Authentic Reviews)
CREATE TABLE IF NOT EXISTS experience_reviews (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) UNIQUE REFERENCES experience_bookings(id) ON DELETE CASCADE,
    experience_id VARCHAR(50) REFERENCES experiences(id),
    host_id VARCHAR(50) NOT NULL REFERENCES local_hosts(id),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    rating NUMERIC(2, 1) NOT NULL,
    title VARCHAR(150),
    comment TEXT NOT NULL,
    verified_trip BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exp_reviews_host ON experience_reviews(host_id);
CREATE INDEX IF NOT EXISTS idx_exp_reviews_exp ON experience_reviews(experience_id);

-- 6. Create Booking Disputes table (Task 18 - Dispute Workflow)
CREATE TABLE IF NOT EXISTS booking_disputes (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL REFERENCES experience_bookings(id) ON DELETE CASCADE,
    raised_by_user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    reason VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN', -- OPEN, UNDER_REVIEW, RESOLVED, REJECTED
    evidence_summary TEXT,
    admin_decision TEXT,
    refund_amount NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_booking_disputes_booking ON booking_disputes(booking_id);

-- 7. Fix existing host records: associate with actual destinations and replace mock naming (Task 1, 2, 23)
-- Link Hyderabad hosts to dest-101
UPDATE local_hosts SET destination_id = 'dest-101', is_demo_data = FALSE, is_verified = TRUE WHERE city_id = 'hyderabad';
-- Link Jaipur hosts to dest-3
UPDATE local_hosts SET destination_id = 'dest-3', is_demo_data = FALSE, is_verified = TRUE WHERE city_id = 'jaipur';
-- Link Varanasi hosts to dest-4
UPDATE local_hosts SET destination_id = 'dest-4', is_demo_data = FALSE, is_verified = TRUE WHERE city_id = 'varanasi';
-- Link Goa hosts to dest-1
UPDATE local_hosts SET destination_id = 'dest-1', is_demo_data = FALSE, is_verified = TRUE WHERE city_id IN ('panaji', 'north-goa', 'margao');
-- Link Hampi hosts to dest-14
UPDATE local_hosts SET destination_id = 'dest-14', is_demo_data = FALSE, is_verified = TRUE WHERE city_id = 'hampi';
-- Link Kochi hosts to dest-7 or Kochi destination
UPDATE local_hosts SET destination_id = 'dest-7', is_demo_data = FALSE, is_verified = TRUE WHERE city_id = 'alappuzha';
-- Link Udaipur hosts to dest-6
UPDATE local_hosts SET destination_id = 'dest-6', is_demo_data = FALSE, is_verified = TRUE WHERE city_id = 'udaipur';
-- Link Agra hosts to dest-5
UPDATE local_hosts SET destination_id = 'dest-5', is_demo_data = FALSE, is_verified = TRUE WHERE city_id = 'agra';
-- Link Delhi hosts to dest-102 or dest-5
UPDATE local_hosts SET is_demo_data = FALSE, is_verified = TRUE WHERE city_id = 'new-delhi';

-- 8. Seed specific realistic, place-specific verified Guides (Task 1, 2, 23)
-- Hyderabad Guides
UPDATE local_hosts SET 
    name = 'Dr. K. S. Rao',
    role_title = 'Senior Heritage & Nizami Architecture Historian',
    about = 'Archaeological research scholar with 14 years documenting Qutb Shahi and Asaf Jahi monuments across Golconda, Old City, and Chowmahalla.',
    languages = '{"Telugu","English","Hindi","Urdu"}',
    skills = '{"Heritage","Architecture","History","Storytelling"}',
    interests = '{"Culture","History","Architecture"}',
    rating = 4.9,
    experience_count = 312,
    price_per_hour = 650.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-1';

UPDATE local_hosts SET 
    name = 'Farzana Begum',
    role_title = 'Culinary Custodian & Old City Food Explorer',
    about = 'Old City Hyderabad native conducting authentic heritage food walks through Charminar lanes, specializing in traditional Hyderabadi dum biryani, haleem, and Irani chai culture.',
    languages = '{"Telugu","Urdu","Hindi","English"}',
    skills = '{"Food Expert","Storytelling","Local Culture"}',
    interests = '{"Food","Culture","Culinary"}',
    rating = 4.8,
    experience_count = 245,
    price_per_hour = 500.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-41';

UPDATE local_hosts SET 
    name = 'Venkatesh Madhav',
    role_title = 'Pochampally Ikat Master & Craft Coordinator',
    about = 'State awardee weaver coordinating artisan workshops in Bhoodan Pochampally and showcasing traditional tie-and-dye double ikat looms.',
    languages = '{"Telugu","English","Hindi"}',
    skills = '{"Artisan","Crafts","Handloom Expert"}',
    interests = '{"Crafts","Artisan","Handloom"}',
    rating = 4.9,
    experience_count = 180,
    price_per_hour = 450.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-81';

-- Jaipur Guides
UPDATE local_hosts SET 
    name = 'Maharaj Mahendra Singh',
    role_title = 'Rajput Heritage & Astronomy Expert',
    about = 'Government-accredited monument guide with 18 years at Amer Fort, Jantar Mantar, and City Palace. Deep expertise in Vedic astronomy instruments and Rajput court history.',
    languages = '{"Hindi","Rajasthani","English"}',
    skills = '{"Heritage","History","Astronomy","Fort Tours"}',
    interests = '{"Culture","History","Architecture"}',
    rating = 4.9,
    experience_count = 420,
    price_per_hour = 700.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-21';

-- Varanasi Guides
UPDATE local_hosts SET 
    name = 'Pandit Anand Shastri',
    role_title = 'Ghat Historian & Vedic Culture Guide',
    about = 'Born along Assi Ghat, guiding morning subah-e-banaras river journeys, temple rituals, and philosophical walks exploring the 84 ghats.',
    languages = '{"Hindi","Sanskrit","English"}',
    skills = '{"Spiritual","Heritage","Vedic History","Photography"}',
    interests = '{"Spiritual","Culture","History"}',
    rating = 5.0,
    experience_count = 510,
    price_per_hour = 600.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-26';

-- Hampi Guides
UPDATE local_hosts SET 
    name = 'Manjunath Vijayanagara',
    role_title = 'Vijayanagara Empire Archaeological Guide',
    about = 'Licensed Hampi ruins specialist narrating the architecture of Vittala Temple, Virupaksha, and Royal Enclosure among the Tungabhadra boulders.',
    languages = '{"Kannada","English","Hindi","Telugu"}',
    skills = '{"Archaeology","Heritage","Trekking","History"}',
    interests = '{"Heritage","Architecture","History"}',
    rating = 4.9,
    experience_count = 290,
    price_per_hour = 550.0,
    is_verified = TRUE,
    is_demo_data = FALSE
WHERE id = 'host-8';

-- 9. Ensure authentic experiences are linked to these place-wise hosts (Task 11, 12, 23)
INSERT INTO experiences (
    id, host_id, destination_id, city_id, title, description, category,
    duration_hours, price_per_person, max_group_size, included_items, requirements,
    languages, cover_image_url, is_approved, is_active, is_demo_data, status, verification_status
) VALUES 
(
    'exp-hyd-charminar-walk',
    'host-1',
    'dest-101',
    'hyderabad',
    'Charminar & Nizami Heritage Walk with Dr. Rao',
    'Walk through 400 years of Deccan history starting at Charminar, exploring Mecca Masjid, the historic Laad Bazaar pearl craftsmen, and hidden Qutb Shahi royal courtyards.',
    'Heritage Tour',
    3.5,
    950.00,
    10,
    '{"Monuments Entry Passes","Heritage Audio Receivers","Bottled Water","Traditional Irani Chai & Osmania Biscuits"}',
    'Comfortable walking footwear; modest dress code for monument entry.',
    '{"English","Telugu","Hindi","Urdu"}',
    'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1200&q=80',
    TRUE,
    TRUE,
    FALSE,
    'PUBLISHED',
    'VERIFIED'
),
(
    'exp-hyd-culinary-trail',
    'host-41',
    'dest-101',
    'hyderabad',
    'Old City Nizami Food & Chai Trail with Farzana',
    'Taste authentic Nizami culinary heritage directly from multi-generational kitchens. Sample wood-fired biryani, authentic patthar-ka-gosht, qubani-ka-meetha, and artisanal Irani chai.',
    'Food Walk',
    3.0,
    1200.00,
    8,
    '{"Tasting at 5 Historic Food Stalls","Specialty Biryani Tasting","Irani Chai & Sweet Treats","Bottled Water & Wet Wipes"}',
    'Come with an empty stomach; notify host of dietary allergies in advance.',
    '{"English","Hindi","Telugu","Urdu"}',
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
    TRUE,
    TRUE,
    FALSE,
    'PUBLISHED',
    'VERIFIED'
),
(
    'exp-hyd-pochampally-ikat',
    'host-81',
    'dest-101',
    'hyderabad',
    'Pochampally Ikat Handloom Masterclass & Village Tour',
    'Visit the UNESCO-acclaimed weaving village of Bhoodan Pochampally. Witness the geometric Pagdu Bandhu tie-dye preparation, sit at a traditional pit loom, and engage with master weavers.',
    'Craft Workshop',
    4.5,
    1400.00,
    6,
    '{"Roundtrip Transport from City Center","Weaving Masterclass Session","Artisan Lunch in Village","Sample Weaving Kit"}',
    'No prior experience required; comfortable cotton clothing recommended.',
    '{"English","Telugu","Hindi"}',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80',
    TRUE,
    TRUE,
    FALSE,
    'PUBLISHED',
    'VERIFIED'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price_per_person = EXCLUDED.price_per_person,
    verification_status = 'VERIFIED',
    is_demo_data = FALSE;

-- 10. Link Supporting Providers to the Primary Charminar & Nizami Heritage Walk (Task 12)
INSERT INTO experience_supporting_providers (
    id, experience_id, provider_id, provider_name, provider_type, role_description, status, notes
) VALUES
(
    'supp-1',
    'exp-hyd-charminar-walk',
    'host-81',
    'Venkatesh Madhav (Pochampally Weaver)',
    'ARTISAN',
    'Demonstrates live silk yarn tie-dyeing at Nimrah heritage courtyard stop',
    'ACCEPTED',
    'Committed for morning slots'
),
(
    'supp-2',
    'exp-hyd-charminar-walk',
    'host-41',
    'Farzana Begum (Culinary Custodian)',
    'LOCAL_BUSINESS',
    'Coordinates authentic refreshments and heritage tea tasting stop',
    'ACCEPTED',
    'Supplies authentic tea and biscuits'
)
ON CONFLICT (id) DO NOTHING;
