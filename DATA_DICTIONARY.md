# YatraSetu Data Dictionary (DATA_DICTIONARY.md)

## 1. Relational Database Schema & Entities

The YatraSetu database is structured as a fully normalized relational PostgreSQL database hosted on Supabase.

---

### Entity: `states`
Geographic primary level (States and Union Territories).
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | `PRIMARY KEY` | Normalized State Code or slug (e.g. `IN-KA`, `IN-GA`, `kerala`) |
| `state_name` | `VARCHAR(100)` | `NOT NULL, UNIQUE` | Name of the State / UT |
| `region` | `VARCHAR(50)` | `NOT NULL` | Geographic region (North, South, East, West, North East, Central) |
| `capital_city` | `VARCHAR(100)` | `NULLABLE` | Capital city name |
| `description` | `TEXT` | `NULLABLE` | Cultural overview and tourism summary |
| `banner_image_url` | `TEXT` | `NULLABLE` | Representative state tourism hero image |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Record creation timestamp |

---

### Entity: `cities`
Administrative or tourist hub cities within states.
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | `PRIMARY KEY` | Unique slug/ID (e.g. `kochi`, `hampi`, `jaipur`) |
| `city_name` | `VARCHAR(100)` | `NOT NULL` | Formal city name |
| `state_id` | `VARCHAR(50)` | `REFERENCES states(id)` | Foreign key to state |
| `district_name` | `VARCHAR(100)` | `NULLABLE` | District name |
| `latitude` | `DECIMAL(10,7)` | `NOT NULL` | Centroid latitude |
| `longitude` | `DECIMAL(10,7)` | `NOT NULL` | Centroid longitude |
| `tier` | `VARCHAR(10)` | `DEFAULT 'Tier-2'` | Urban classification tier |
| `is_tourism_hub` | `BOOLEAN` | `DEFAULT TRUE` | Tourism relevance flag |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Record creation timestamp |

---

### Entity: `destinations`
Curated destinations, circuits, and major tourism zones.
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | `PRIMARY KEY` | Unique destination slug (e.g. `goa`, `munnar`, `varanasi`) |
| `destination_name` | `VARCHAR(150)` | `NOT NULL` | Display name of the destination |
| `state_id` | `VARCHAR(50)` | `REFERENCES states(id)` | Parent state reference |
| `city_id` | `VARCHAR(50)` | `REFERENCES cities(id)` | Nearest hub city reference |
| `region` | `VARCHAR(50)` | `NULLABLE` | Region tag (e.g. West India, Western Ghats) |
| `latitude` | `DECIMAL(10,7)` | `NOT NULL` | Centroid latitude for weather and map |
| `longitude` | `DECIMAL(10,7)` | `NOT NULL` | Centroid longitude for weather and map |
| `popularity_score` | `DECIMAL(3,1)` | `DEFAULT 5.0` | Historic popularity index (1.0 to 10.0) |
| `accessibility` | `VARCHAR(50)` | `DEFAULT 'Easy'` | Transport accessibility tier (Easy, Moderate, Remote) |
| `trip_types` | `TEXT[]` | `NOT NULL` | Array of tags: `[Beach, Cultural, Food, Heritage, Nature]` |
| `ideal_for` | `TEXT[]` | `NOT NULL` | Array: `[Solo, Couple, Family, Friends]` |
| `best_seasons` | `VARCHAR(100)` | `NULLABLE` | Recommended visiting seasons (e.g. `Winter | Post-Monsoon`) |
| `budget_daily_min` | `DECIMAL(10,2)` | `DEFAULT 1500.0` | Minimum estimated budget per day in INR |
| `budget_daily_max` | `DECIMAL(10,2)` | `DEFAULT 5000.0` | Maximum estimated budget per day in INR |
| `safety_rating` | `DECIMAL(3,1)` | `DEFAULT 8.0` | Safety index score (1.0 to 10.0) |
| `description` | `TEXT` | `NOT NULL` | Rich description of destination |
| `hero_image_url` | `TEXT` | `NULLABLE` | High-resolution hero image URL |
| `suggested_itinerary_summary` | `TEXT` | `NULLABLE` | Reference itinerary blueprint |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Record creation timestamp |

---

### Entity: `destination_pois`
Points of Interest, attractions, viewpoints, monuments, and cultural sites.
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | `PRIMARY KEY` | Unique POI identifier |
| `destination_id` | `VARCHAR(50)` | `REFERENCES destinations(id)` | Foreign key to destination |
| `city_id` | `VARCHAR(50)` | `REFERENCES cities(id)` | Foreign key to city |
| `poi_name` | `VARCHAR(200)` | `NOT NULL` | Name of monument / viewpoint / attraction |
| `category` | `VARCHAR(50)` | `DEFAULT 'Attraction'` | Category (Monument, Nature, Temple, Beach, Market) |
| `latitude` | `DECIMAL(10,7)` | `NOT NULL` | Exact POI latitude |
| `longitude` | `DECIMAL(10,7)` | `NOT NULL` | Exact POI longitude |
| `tags` | `TEXT[]` | `NULLABLE` | Tags: `[scenic, tea, photography, heritage]` |
| `entry_fee_inr` | `DECIMAL(8,2)` | `DEFAULT 0.0` | Ticket/entry fee |
| `typical_duration_hours`| `DECIMAL(3,1)` | `DEFAULT 2.0` | Average time spent |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Creation timestamp |

---

### Entity: `hotels`
Accommodations, homestays, heritage resorts, and hotels.
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | `PRIMARY KEY` | Unique hotel identifier |
| `city_id` | `VARCHAR(50)` | `REFERENCES cities(id)` | Associated city |
| `destination_id` | `VARCHAR(50)` | `REFERENCES destinations(id)` | Associated destination |
| `hotel_name` | `VARCHAR(200)` | `NOT NULL` | Property name |
| `hotel_rating` | `DECIMAL(3,1)` | `DEFAULT 4.0` | Review rating (1.0 to 5.0) |
| `price_per_night` | `DECIMAL(10,2)` | `NOT NULL` | Base room price per night in INR |
| `amenities` | `TEXT[]` | `NOT NULL` | Array: `[Free Wi-Fi, Pool, Spa, Breakfast, AC]` |
| `category` | `VARCHAR(50)` | `DEFAULT 'Mid-Range'`| Category (Budget, Mid-Range, Luxury, Homestay) |
| `is_partner_property` | `BOOLEAN` | `DEFAULT FALSE` | True if onboarded via Partner portal |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Creation timestamp |

---

### Entity: `users` & `profiles`
User accounts and profile metadata (Travelers, Partners, Government Officials).
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID / VARCHAR(50)`| `PRIMARY KEY` | Supabase Auth User UUID |
| `email` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | User email address |
| `full_name` | `VARCHAR(150)` | `NOT NULL` | User full name |
| `role` | `VARCHAR(30)` | `NOT NULL` | Enum: `TRAVELER`, `PARTNER`, `GOVERNMENT` |
| `partner_subtype` | `VARCHAR(50)` | `NULLABLE` | Enum: `LOCAL_HOST`, `GUIDE`, `HOTEL`, `ARTISAN`, etc. |
| `avatar_url` | `TEXT` | `NULLABLE` | Profile photo URL |
| `languages` | `TEXT[]` | `DEFAULT '{}'` | Spoken languages |
| `interests` | `TEXT[]` | `DEFAULT '{}'` | Travel interests `[Nature, Heritage, Food]` |
| `travel_style` | `VARCHAR(50)` | `DEFAULT 'Explorer'`| Style: `[Backpacker, Luxury, Explorer, Relaxed]` |
| `home_city` | `VARCHAR(100)` | `NULLABLE` | Origin / home city |
| `is_verified` | `BOOLEAN` | `DEFAULT FALSE` | KYC / Identity verification badge |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Account creation timestamp |

---

### Entity: `local_hosts` & `experiences`
Community tourism hosts, guides, artisans, and their experience offerings.
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | `PRIMARY KEY` | Unique host identifier |
| `user_id` | `VARCHAR(50)` | `REFERENCES users(id)` | User reference |
| `city_id` | `VARCHAR(50)` | `REFERENCES cities(id)` | Host operating city |
| `destination_id` | `VARCHAR(50)` | `REFERENCES destinations(id)` | Host operating destination |
| `role_title` | `VARCHAR(100)` | `NOT NULL` | e.g., "Certified Heritage Guide", "Tea Estate Host" |
| `skills` | `TEXT[]` | `NOT NULL` | Skills `[Storytelling, Birdwatching, Photography]` |
| `price_per_hour` | `DECIMAL(10,2)` | `NOT NULL` | Hourly rate in INR |
| `rating` | `DECIMAL(3,1)` | `DEFAULT 4.5` | Host rating |
| `experience_count` | `INT` | `DEFAULT 0` | Completed bookings count |
| `availability_pattern` | `VARCHAR(50)` | `DEFAULT 'Flexible'` | Schedule (Weekends, Weekdays, All Days) |
| `is_demo_data` | `BOOLEAN` | `DEFAULT FALSE` | True if loaded from synthetic demo dataset |

---

### Entity: `travel_buddies` & `travel_buddy_requests`
Traveler connection pool for matching companions.
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | `PRIMARY KEY` | Unique entry identifier |
| `user_id` | `VARCHAR(50)` | `REFERENCES users(id)` | Traveler user ID |
| `destination_id` | `VARCHAR(50)` | `REFERENCES destinations(id)` | Target destination |
| `travel_date` | `DATE` | `NOT NULL` | Expected travel start date |
| `budget_inr` | `DECIMAL(10,2)` | `NOT NULL` | Target trip budget |
| `interests` | `TEXT[]` | `NOT NULL` | Target interests |
| `travel_style` | `VARCHAR(50)` | `NOT NULL` | Adventure, Relaxed, Culture, etc. |
| `is_demo_data` | `BOOLEAN` | `DEFAULT FALSE` | Demo synthetic flag |

---

### Entity: `trips` & `itineraries`
AI-generated and user-customized travel plans.
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | `PRIMARY KEY` | Unique trip identifier |
| `user_id` | `VARCHAR(50)` | `REFERENCES users(id)` | Trip owner |
| `destination_id` | `VARCHAR(50)` | `REFERENCES destinations(id)` | Target destination |
| `start_date` | `DATE` | `NOT NULL` | Trip start date |
| `end_date` | `DATE` | `NOT NULL` | Trip end date |
| `total_days` | `INT` | `NOT NULL` | Day duration |
| `total_budget_inr` | `DECIMAL(10,2)` | `NOT NULL` | Estimated total budget |
| `traveler_count` | `INT` | `DEFAULT 1` | Number of travelers |
| `itinerary_json` | `JSONB` | `NOT NULL` | Structured daily schedule with POIs, hosts, stays |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Trip creation timestamp |

---

### Entity: `bookings` & `payments`
Transactions for stays, guide hire, and local experiences.
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | `PRIMARY KEY` | Unique booking reference (`YS-BK-XXXXX`) |
| `user_id` | `VARCHAR(50)` | `REFERENCES users(id)` | Booking customer |
| `booking_type` | `VARCHAR(30)` | `NOT NULL` | `HOTEL`, `LOCAL_HOST`, `EXPERIENCE` |
| `item_id` | `VARCHAR(50)` | `NOT NULL` | ID of hotel / host / experience |
| `booking_date` | `DATE` | `NOT NULL` | Service start date |
| `guest_count` | `INT` | `DEFAULT 1` | Number of guests |
| `total_amount_inr` | `DECIMAL(10,2)` | `NOT NULL` | Final amount payable |
| `status` | `VARCHAR(30)` | `DEFAULT 'PENDING'` | `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED` |
| `razorpay_order_id` | `VARCHAR(100)` | `NULLABLE` | Razorpay Order ID |
| `razorpay_payment_id`| `VARCHAR(100)` | `NULLABLE` | Razorpay Payment ID |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Booking creation timestamp |

---

### Entity: `reviews`
Reviews for destinations, hotels, and local hosts.
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | `PRIMARY KEY` | Unique review ID |
| `user_id` | `VARCHAR(50)` | `REFERENCES users(id)` | Reviewer |
| `entity_type` | `VARCHAR(30)` | `NOT NULL` | `DESTINATION`, `HOTEL`, `LOCAL_HOST` |
| `entity_id` | `VARCHAR(50)` | `NOT NULL` | ID of reviewed destination / hotel / host |
| `booking_id` | `VARCHAR(50)` | `NULLABLE, REFERENCES bookings(id)` | Associated completed booking reference |
| `rating` | `INT` | `CHECK (rating BETWEEN 1 AND 5)` | Star rating |
| `review_text` | `TEXT` | `NOT NULL` | Review feedback comment |
| `is_verified_booking`| `BOOLEAN` | `DEFAULT FALSE` | True only if linked to verified completed booking |
| `is_imported_dataset`| `BOOLEAN` | `DEFAULT FALSE` | True for historical dataset reviews |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Review timestamp |

---

## 2. Raw Dataset Mapping Matrix

| Raw CSV File | Record Count | Target Normalized Entity | Key Field Transformations |
| :--- | :--- | :--- | :--- |
| `destinations/curated_destinations.csv` | 100 rows | `destinations`, `states`, `cities` | Split `state`, `district`, parse JSON airport/railway strings, normalize `trip_types` & `ideal_for` into arrays. |
| `poi/tourist_spots.csv` | 459 rows | `destination_pois` | Map `poi_id`, `poi_name`, `Latitude`, `Longitude`, clean and parse comma-separated `tags`. |
| `poi/city_specific_pois.csv` | 420 rows | `destination_pois` | Link `source_city` -> `cities(id)`, link `DestinationID` -> `destinations(id)`. |
| `hotels/hotels.csv` | 1007 rows | `hotels` | Map `hotel_name`, `hotel_rating`, `city` -> `cities(id)`, parse `amenities` string to array, clean `hotel_price`. |
| `demo/local_hosts_demo.csv` | 300 rows | `local_hosts`, `profiles` | Flag `is_demo_data=TRUE`, parse pipe-separated `languages`, `skills`, `interests`. |
| `demo/travel_buddies_demo.csv` | 500 rows | `travel_buddies` | Flag `is_demo_data=TRUE`, map `destination_city` -> `destinations(id)`. |
| `recommendation/reviews.csv` | 500+ rows | `reviews` | Mark `is_imported_dataset=TRUE`, `is_verified_booking=FALSE`. |
| `recommendation/user_history.csv` | 500+ rows | `user_history` | Historical visitation dataset for recommendation baseline. |
| `geography/tourism_cities_from_existing_data.csv` | 30+ rows | `cities` | Ensure all core tourism hubs have normalized city entries. |
