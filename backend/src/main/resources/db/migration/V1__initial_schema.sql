-- ==============================================================================
-- YatraSetu Initial Database Schema Migration (V1__initial_schema.sql)
-- Product: YatraSetu ("Discover India. Connect Locally. Grow Tourism.")
-- Target: PostgreSQL 15+ (Supabase)
-- ==============================================================================

-- Enable UUID extension if supported
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. GEOGRAPHY & ADMINISTRATIVE BOUNDARIES
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS states (
    id VARCHAR(50) PRIMARY KEY,
    state_name VARCHAR(100) NOT NULL UNIQUE,
    region VARCHAR(50) NOT NULL, -- North, South, East, West, North East, Central
    capital_city VARCHAR(100),
    description TEXT,
    banner_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cities (
    id VARCHAR(50) PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL,
    state_id VARCHAR(50) NOT NULL REFERENCES states(id) ON DELETE RESTRICT,
    district_name VARCHAR(100),
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    tier VARCHAR(20) DEFAULT 'Tier-2',
    is_tourism_hub BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cities_name_state UNIQUE (city_name, state_id)
);

CREATE INDEX IF NOT EXISTS idx_cities_state_id ON cities(state_id);
CREATE INDEX IF NOT EXISTS idx_cities_is_tourism_hub ON cities(is_tourism_hub);

-- ------------------------------------------------------------------------------
-- 2. DESTINATIONS & POINTS OF INTEREST (POIs)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS destinations (
    id VARCHAR(50) PRIMARY KEY,
    destination_name VARCHAR(150) NOT NULL,
    state_id VARCHAR(50) NOT NULL REFERENCES states(id) ON DELETE RESTRICT,
    city_id VARCHAR(50) REFERENCES cities(id) ON DELETE SET NULL,
    district VARCHAR(150),
    region VARCHAR(50),
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    altitude_m INT,
    popularity_score DECIMAL(3, 1) DEFAULT 5.0,
    accessibility VARCHAR(50) DEFAULT 'Easy',
    nearest_airport JSONB,
    nearest_railway JSONB,
    nearest_major_city VARCHAR(100),
    nearest_major_city_distance_km DECIMAL(8, 2),
    road_connectivity TEXT,
    trip_types TEXT[] NOT NULL DEFAULT '{}',
    primary_attractions TEXT[] NOT NULL DEFAULT '{}',
    activities_available TEXT[] NOT NULL DEFAULT '{}',
    unique_experiences TEXT,
    hidden_gems TEXT,
    best_seasons TEXT,
    avoid_seasons TEXT,
    peak_season TEXT,
    off_season TEXT,
    average_temperature JSONB,
    rainfall_pattern TEXT,
    ideal_for TEXT[] NOT NULL DEFAULT '{}',
    ideal_for_why JSONB,
    special_considerations TEXT,
    minimum_days DECIMAL(3, 1) DEFAULT 2.0,
    ideal_days DECIMAL(3, 1) DEFAULT 4.0,
    maximum_days INT DEFAULT 7,
    suggested_itinerary TEXT,
    accommodation_types TEXT,
    food_scene TEXT,
    safety_rating DECIMAL(3, 1) DEFAULT 8.0,
    safety_notes TEXT,
    internet_connectivity TEXT,
    mobile_network TEXT,
    atm_availability TEXT,
    language_spoken VARCHAR(150),
    permits_required BOOLEAN DEFAULT FALSE,
    permits_details TEXT,
    local_culture TEXT,
    festivals_events TEXT,
    local_customs TEXT,
    shopping_highlights TEXT,
    local_cuisine_must_try TEXT,
    budget_range_json JSONB,
    mid_range_json JSONB,
    luxury_range_json JSONB,
    description TEXT,
    hero_image_url TEXT,
    user_reviews_summary TEXT,
    recent_developments TEXT,
    sustainability_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_destinations_state_id ON destinations(state_id);
CREATE INDEX IF NOT EXISTS idx_destinations_city_id ON destinations(city_id);
CREATE INDEX IF NOT EXISTS idx_destinations_popularity ON destinations(popularity_score);

CREATE TABLE IF NOT EXISTS destination_pois (
    id VARCHAR(50) PRIMARY KEY,
    poi_name VARCHAR(200) NOT NULL,
    destination_id VARCHAR(50) REFERENCES destinations(id) ON DELETE SET NULL,
    city_id VARCHAR(50) REFERENCES cities(id) ON DELETE SET NULL,
    category VARCHAR(50) DEFAULT 'Attraction',
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    characteristics TEXT,
    entry_fee_inr DECIMAL(8, 2) DEFAULT 0.0,
    typical_duration_hours DECIMAL(3, 1) DEFAULT 2.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pois_destination_id ON destination_pois(destination_id);
CREATE INDEX IF NOT EXISTS idx_pois_city_id ON destination_pois(city_id);

-- ------------------------------------------------------------------------------
-- 3. ACCOMMODATION / HOTELS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hotels (
    id VARCHAR(50) PRIMARY KEY,
    hotel_name VARCHAR(200) NOT NULL,
    city_id VARCHAR(50) REFERENCES cities(id) ON DELETE SET NULL,
    destination_id VARCHAR(50) REFERENCES destinations(id) ON DELETE SET NULL,
    hotel_rating DECIMAL(3, 1) DEFAULT 4.0,
    price_per_night DECIMAL(10, 2) NOT NULL,
    amenities TEXT[] DEFAULT '{}',
    category VARCHAR(50) DEFAULT 'Mid-Range',
    address TEXT,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    is_partner_property BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hotels_city_id ON hotels(city_id);
CREATE INDEX IF NOT EXISTS idx_hotels_destination_id ON hotels(destination_id);
CREATE INDEX IF NOT EXISTS idx_hotels_price ON hotels(price_per_night);

-- ------------------------------------------------------------------------------
-- 4. USERS & PROFILES (STAKEHOLDERS: TRAVELER, PARTNER, GOVERNMENT)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'TRAVELER', -- TRAVELER, PARTNER, GOVERNMENT
    partner_subtype VARCHAR(50), -- LOCAL_HOST, GUIDE, HOTEL, ARTISAN, etc.
    avatar_url TEXT,
    phone VARCHAR(30),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    home_city VARCHAR(100),
    state_id VARCHAR(50) REFERENCES states(id) ON DELETE SET NULL,
    languages TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    travel_style VARCHAR(50) DEFAULT 'Explorer',
    bio TEXT,
    emergency_contact VARCHAR(50),
    notification_preferences JSONB DEFAULT '{"email": true, "in_app": true}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 5. LOCAL HOSTS & EXPERIENCES (YATRASETU LOCAL)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS local_hosts (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    state_id VARCHAR(50) REFERENCES states(id) ON DELETE RESTRICT,
    city_id VARCHAR(50) REFERENCES cities(id) ON DELETE RESTRICT,
    destination_id VARCHAR(50) REFERENCES destinations(id) ON DELETE SET NULL,
    languages TEXT[] NOT NULL DEFAULT '{}',
    skills TEXT[] NOT NULL DEFAULT '{}',
    interests TEXT[] NOT NULL DEFAULT '{}',
    role_title VARCHAR(100) NOT NULL DEFAULT 'Local Guide',
    price_per_hour DECIMAL(10, 2) NOT NULL DEFAULT 300.0,
    rating DECIMAL(3, 1) DEFAULT 4.5,
    experience_count INT DEFAULT 0,
    availability VARCHAR(50) DEFAULT 'Flexible',
    is_verified BOOLEAN DEFAULT FALSE,
    is_demo_data BOOLEAN DEFAULT FALSE,
    about TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_local_hosts_city ON local_hosts(city_id);
CREATE INDEX IF NOT EXISTS idx_local_hosts_destination ON local_hosts(destination_id);
CREATE INDEX IF NOT EXISTS idx_local_hosts_demo ON local_hosts(is_demo_data);

CREATE TABLE IF NOT EXISTS experiences (
    id VARCHAR(50) PRIMARY KEY,
    host_id VARCHAR(50) NOT NULL REFERENCES local_hosts(id) ON DELETE CASCADE,
    destination_id VARCHAR(50) REFERENCES destinations(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- Food Walk, Heritage Tour, Craft Workshop, Adventure
    duration_hours DECIMAL(3, 1) NOT NULL DEFAULT 3.0,
    price_per_person DECIMAL(10, 2) NOT NULL,
    max_group_size INT DEFAULT 8,
    included_items TEXT[] DEFAULT '{}',
    requirements TEXT,
    languages TEXT[] DEFAULT '{}',
    cover_image_url TEXT,
    is_approved BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_experiences_host_id ON experiences(host_id);
CREATE INDEX IF NOT EXISTS idx_experiences_destination_id ON experiences(destination_id);

-- ------------------------------------------------------------------------------
-- 6. TRAVEL CONNECT (BUDDY MATCHMAKING)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS travel_buddies (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    destination_city VARCHAR(100) NOT NULL,
    destination_id VARCHAR(50) REFERENCES destinations(id) ON DELETE SET NULL,
    state_id VARCHAR(50) REFERENCES states(id) ON DELETE SET NULL,
    travel_date DATE NOT NULL,
    budget_inr DECIMAL(10, 2) NOT NULL,
    interests TEXT[] NOT NULL DEFAULT '{}',
    languages TEXT[] NOT NULL DEFAULT '{}',
    group_size INT DEFAULT 1,
    travel_style VARCHAR(50) NOT NULL DEFAULT 'Explorer',
    is_demo_data BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_travel_buddies_dest ON travel_buddies(destination_id);
CREATE INDEX IF NOT EXISTS idx_travel_buddies_date ON travel_buddies(travel_date);
CREATE INDEX IF NOT EXISTS idx_travel_buddies_demo ON travel_buddies(is_demo_data);

CREATE TABLE IF NOT EXISTS travel_buddy_requests (
    id VARCHAR(50) PRIMARY KEY,
    sender_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    destination_id VARCHAR(50) REFERENCES destinations(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, ACCEPTED, DECLINED, CANCELLED
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 7. TRIPS & ITINERARIES (AI PLANNER & SAVED TRIPS)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS trips (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    destination_id VARCHAR(50) NOT NULL REFERENCES destinations(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    traveler_count INT DEFAULT 1,
    budget_category VARCHAR(50) DEFAULT 'Mid-Range',
    total_budget_inr DECIMAL(10, 2) NOT NULL,
    weather_summary JSONB,
    status VARCHAR(30) DEFAULT 'PLANNING', -- PLANNING, CONFIRMED, COMPLETED, CANCELLED
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_destination_id ON trips(destination_id);

CREATE TABLE IF NOT EXISTS itineraries (
    id VARCHAR(50) PRIMARY KEY,
    trip_id VARCHAR(50) NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    theme VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itinerary_items (
    id VARCHAR(50) PRIMARY KEY,
    itinerary_id VARCHAR(50) NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
    item_type VARCHAR(30) NOT NULL, -- POI, HOTEL, EXPERIENCE, LOCAL_HOST, MEAL
    item_id VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    time_slot VARCHAR(50), -- MORNING, AFTERNOON, EVENING, NIGHT
    duration_hours DECIMAL(3, 1),
    estimated_cost_inr DECIMAL(10, 2) DEFAULT 0.0,
    rationale TEXT,
    order_index INT NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------------------------
-- 8. BOOKINGS & PAYMENTS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY, -- Formatted: YS-BK-YYYYMMDD-XXXXX
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    booking_type VARCHAR(30) NOT NULL, -- HOTEL, LOCAL_HOST, EXPERIENCE
    item_id VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    guest_count INT NOT NULL DEFAULT 1,
    subtotal_inr DECIMAL(10, 2) NOT NULL,
    tax_inr DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    total_amount_inr DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, COMPLETED, CANCELLED
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    razorpay_order_id VARCHAR(100) NOT NULL UNIQUE,
    razorpay_payment_id VARCHAR(100) UNIQUE,
    razorpay_signature VARCHAR(255),
    amount_inr DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(30) NOT NULL DEFAULT 'CREATED', -- CREATED, SUCCESS, FAILED
    payment_method VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(razorpay_order_id);

-- ------------------------------------------------------------------------------
-- 9. REVIEWS & USER HISTORY (CLEAR SEPARATION)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    entity_type VARCHAR(30) NOT NULL, -- DESTINATION, HOTEL, LOCAL_HOST, EXPERIENCE
    entity_id VARCHAR(50) NOT NULL,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL,
    is_verified_booking BOOLEAN DEFAULT FALSE,
    is_imported_dataset BOOLEAN DEFAULT FALSE,
    sentiment_category VARCHAR(50), -- Transport, Cleanliness, Safety, Hospitality, General
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_entity ON reviews(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(is_verified_booking);
CREATE INDEX IF NOT EXISTS idx_reviews_imported ON reviews(is_imported_dataset);

CREATE TABLE IF NOT EXISTS user_history (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    destination_id VARCHAR(50) NOT NULL,
    visit_date DATE,
    experience_rating INT,
    source VARCHAR(50) DEFAULT 'HISTORICAL_DATASET',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_history_user ON user_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_history_dest ON user_history(destination_id);

-- ------------------------------------------------------------------------------
-- 10. NOTIFICATIONS, AUDIT & GOVERNMENT TOURISM IMPACT
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- BOOKING, PAYMENT, BUDDY_REQUEST, ALERT, SYSTEM
    reference_link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);

CREATE TABLE IF NOT EXISTS tourism_transactions (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE SET NULL,
    destination_id VARCHAR(50) REFERENCES destinations(id) ON DELETE SET NULL,
    state_id VARCHAR(50) REFERENCES states(id) ON DELETE SET NULL,
    sector VARCHAR(50) NOT NULL, -- HOTEL, LOCAL_GUIDE, HANDICRAFT, FOOD, ADVENTURE
    amount_inr DECIMAL(10, 2) NOT NULL,
    local_partner_payout_inr DECIMAL(10, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tourism_trans_dest ON tourism_transactions(destination_id);
CREATE INDEX IF NOT EXISTS idx_tourism_trans_date ON tourism_transactions(transaction_date);

CREATE TABLE IF NOT EXISTS tourism_impact (
    id VARCHAR(50) PRIMARY KEY,
    destination_id VARCHAR(50) NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    year_month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    total_travelers INT DEFAULT 0,
    total_platform_spend_inr DECIMAL(12, 2) DEFAULT 0.0,
    local_host_earnings_inr DECIMAL(12, 2) DEFAULT 0.0,
    sentiment_index DECIMAL(3, 1) DEFAULT 4.0,
    opportunity_score DECIMAL(3, 1) DEFAULT 5.0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_impact_dest_month UNIQUE (destination_id, year_month)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    actor_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(50),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
