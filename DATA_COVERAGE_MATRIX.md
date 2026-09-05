# YatraSetu — Destination Ecosystem Data Coverage Matrix (`DATA_COVERAGE_MATRIX.md`)

**Audit & Architecture Timestamp:** September 2026  
**Coverage Scope:** 28 States • 138 Cities • 93 Curated Destinations  
**Core Source Hierarchy:**  
`DATASET` &rarr; `OFFICIAL` &rarr; `REAL API` &rarr; `VERIFIED PARTNER` &rarr; `USER GENERATED` &rarr; `DEMO ONLY WHEN ABSOLUTELY NECESSARY`

---

## 1. Operational Categories Inventory & Coverage Analysis

| Operational Category | Available in Supplied Datasets? | Primary Source of Truth | Current Record Count | Key Fields Available | Key Fields Missing | Data Nature | External API Required? | Future Integration Roadmap |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Destination Profile & Overview** | **Yes (100%)** | `data/raw/destinations/curated_destinations.csv` | 93 curated destinations | `id`, `name`, `state`, `district`, `region`, `coordinates`, `altitude`, `popularity`, `best_seasons`, `itinerary`, `ideal_for`, `safety` | Real-time crowd index | **Real Curated** | No (Seeded in DB) | Department of Tourism live advisories feed |
| **2. Destination Images** | **Yes (100%)** | Public-domain Wikimedia Commons / Tourism Archives (V7) | 93 verified images (1 per destination) | `hero_image_url`, `alt_text` | User-submitted gallery uploads | **Curated Public Domain** | No (Stored in DB) | Cloudinary / Supabase Storage user photo submissions |
| **3. Places to Visit (Attractions / POIs)** | **Yes (100%)** | `curated_destinations.csv` + `tourist_spots.csv` + `city_specific_pois.csv` | 743 POIs | `id`, `poi_name`, `destination_id`, `city_id`, `category`, `latitude`, `longitude`, `entry_fee_inr`, `typical_duration_hours`, `tags` | Live queue wait times, audio guide audio tracks | **Real Curated** | No (Seeded in DB) | ASI (Archaeological Survey of India) ticketing API |
| **4. Hidden Gems** | **Yes (100%)** | `curated_destinations.csv` (`hidden_gems`) | 93 destination gems | Editorial description of offbeat spots, scenic sunrise points, secluded river ghats | Real-time accessibility status | **Real Curated** | No (Seeded in DB) | Community explorer verification workflow |
| **5. Famous Local Food / Cultural Dishes** | **Yes (100%)** | `curated_destinations.csv` (`local_cuisine_must_try`) | 93 destinations (~450 authentic dishes) | `dish_name`, `destination_id`, `city_id`, `cultural_origin`, `dietary_type`, `traditional_context` | Exact nutritional facts | **Real Curated (Dataset)** | No (Seeded in DB) | Culinary history database / GI tag registry |
| **6. Restaurants & Dining Spots** | **No** | Verified Local Partners / Google Places API / Zomato | 0 (0 fake records) | Table architecture & API ready (`id`, `name`, `cuisine`, `rating`, `address`, `source_type`, `verified`) | Live operating hours, real-time table availability, digital menu | **Pending Real Partner / API Data** | Yes (Google Places / Partner Submissions) | Google Places API integration & Partner Onboarding |
| **7. Hotels & Accommodations** | **Yes (100%)** | `data/raw/hotels/hotels.csv` | 1,007 properties | `hotel_name`, `city_id`, `hotel_rating`, `price_per_night`, `amenities`, `category` (Hotel, Resort, Homestay, Heritage) | Live room inventory, instant booking confirmation | **Real Imported Dataset** | Yes for live booking | Channel Manager / PMS connectivity (Staah, RateGain) |
| **8. Local Guides & Hosts** | **Partial (Demo)** | `data/raw/demo/local_hosts_demo.csv` | 300 demo profiles | `name`, `city_id`, `role_title`, `languages`, `skills`, `bio` | Govt Tour Guide license verification, live calendar availability | **Synthetic Demo (`Sample Guide`)** | No | Digilocker KYC & Ministry of Tourism Guide Registry |
| **9. Local Experiences** | **Partial (Demo)** | Migration V4 Benchmark Catalog | 12 benchmark sample experiences | `title`, `destination_id`, `price_inr`, `duration`, `inclusions`, `meeting_point` | Dynamic departure time booking slots | **Synthetic Demo (`Sample Experience`)** | No | Partner Experience Creator Portal (`/partner/dashboard`) |
| **10. Travel Agencies & Tour Operators** | **No** | Verified Partner Submissions / IATO / MoT Registry | 0 (0 fake records) | Table architecture & API ready (`id`, `name`, `agency_type`, `phone`, `website`, `services`, `verified`) | Verified office registration documents | **Pending Real Partner Data** | No | Indian Association of Tour Operators (IATO) verified feed |
| **11. Transport & Connectivity (Air/Rail/Road)** | **Yes (Logistics)** | `curated_destinations.csv` (`nearest_airport`, `nearest_railway_station`, `road_connectivity`) | 93 logistics records | Airport/station name, distance in km, connectivity highway descriptions, price indicators (`ESTIMATED_PRICE` / `PRICE_UNAVAILABLE`) | Live flight schedules, real-time PNR/train seat availability | **Real Curated Logistics** | Yes for live booking | IRCTC Railway API, RedBus / State RTC APIs, Amadeus Flight API |
| **12. Bike & Scooter Rentals** | **No** | Local Fleet Partners / Verified Providers | 0 (0 fake records) | Table architecture & API ready (`id`, `provider_name`, `vehicle_types`, `price_notes`, `availability_status`) | Live fleet telematics / GPS, instant security deposit checkout | **Pending Real Partner Data** | No | Fleet management partner integration |
| **13. Meteorological Signals & Weather** | **Yes (Live API)** | Open-Meteo Public Meteorological API (`api.open-meteo.com`) | Dynamic live queries | Temperature (°C), weather code, wind speed, relative humidity, UV index | Historical micro-climate weather radar | **Real Live API** | **Yes (Open-Meteo REST API)** | Real-time weather warnings & IMD alerts integration |
| **14. Geographic Maps & Navigation** | **Yes (Live GIS)** | OpenStreetMap / Leaflet GIS Engine | Dynamic geographic rendering | Verified coordinates (latitude/longitude), bounding centroids, POI pins | Live turn-by-turn road traffic | **Real GIS Reference** | Yes (OSM tiles) | Mapbox / Google Maps route optimization API |
| **15. Travel Connect (Travel Buddies)** | **Partial (Demo + Live)** | `data/raw/demo/travel_buddies_demo.csv` + Live User Requests | 500 demo buddies + live request queue | Destination, travel dates, style, budget, group size, interests | Live GPS location sharing | **Demo + Live User Generated** | No | WebSockets / Push Notifications for real-time connection alerts |

---

## 2. Provenance Classification Standards

Every operational entity in YatraSetu stores a mandatory `source_type`:

1. **`DATASET`**:
   - Sourced directly from curated, verified datasets provided in the project (`curated_destinations.csv`, `hotels.csv`, `tourist_spots.csv`).
   - Highest internal authority.
2. **`OFFICIAL`**:
   - Sourced from official government bodies (Ministry of Tourism, Census of India, ASI, State Tourism Boards).
3. **`API`**:
   - Dynamically retrieved from real, verified external web services (e.g. Open-Meteo for live weather signals).
4. **`PARTNER_SUBMITTED`**:
   - Registered directly by verified local business operators through the partner portal. Marked with `verified = true` only after administrative verification.
5. **`USER_GENERATED`**:
   - Created by authentic platform travelers (reviews, travel buddy requests, public tips).
6. **`DEMO`**:
   - Benchmark synthetic data used exclusively where no real dataset exists. Must always be visibly labeled (`Sample Guide`, `Sample Experience`).

---

## 3. Empty State & Data Honesty Protocol

When real-world records for an operational category (e.g. Restaurants, Travel Agencies, Scooter Rentals) have not yet been registered for a destination:
1. **Never fabricate dummy businesses**: No fake phone numbers, invented names, or artificial reviews.
2. **Honest System Notice**: Display **"Information currently unavailable"**.
3. **Partner Call-to-Action**: Provide a direct onboarding registration link:
   - *"Are you a licensed restaurant or cafe in [Destination]? Register as a Verified Partner."*
   - *"Do you offer two-wheeler or car rentals in [Destination]? Register your fleet on YatraSetu."*
4. **Zero Page Failure**: Decoupled progressive loading ensures that an empty category never impacts the rendering of POIs, hotels, cultural foods, or weather.
