# YatraSetu — Dataset Fields Used (`DATASET_FIELDS_USED.md`)

This document details every field present in the raw datasets under `data/raw/` that has been mapped, imported, and actively utilized by the YatraSetu database, backend APIs, and frontend user interface.

---

## 1. Curated Destinations Dataset (`data/raw/destinations/curated_destinations.csv`)
- **Total Rows:** 93
- **Source Nature:** Real Curated Tourism Circuits (Supplied Package)
- **Database Table:** `destinations` & `cities` & `states`

| CSV Column | Data Type | Database Table | Database Column | Backend API Response Field | Frontend Feature / Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | String | `destinations` | `id` (prefixed `dest-`) | `id` | Route parameter `/destinations/[id]`, card keys |
| `destination_name` | String | `destinations` | `destination_name` | `destinationName` | Hero title, cards, search results, map pins |
| `state` | String | `destinations`, `states` | `state_id`, `state_name` | `stateId`, `stateName` | Breadcrumbs, regional filters, state page links |
| `district` | String | `destinations`, `cities` | `district`, `district_name` | `district`, `districtName` | Geographic subtitle, city hub derivation |
| `region` | String | `destinations`, `states` | `region` | `region` | Explore filter tabs (North, South, East, West, etc.) |
| `latitude` | Float | `destinations`, `cities` | `latitude` | `latitude` | Interactive Leaflet map markers, routing |
| `longitude` | Float | `destinations`, `cities` | `longitude` | `longitude` | Interactive Leaflet map markers, routing |
| `altitude_m` | Integer | `destinations` | `altitude_m` | `altitudeM` | Destination Quick Specs badge, altitude warning |
| `popularity_score` | Float | `destinations` | `popularity_score` | `popularityScore` | Star rating display (★ 1–10), trending sort |
| `accessibility` | String | `destinations` | `accessibility` | `accessibility` | Difficulty/accessibility badge (Easy/Moderate/Difficult) |
| `nearest_airport` | JSON string | `destinations` | `nearest_airport` (JSONB) | `nearestAirport` | Logistics tab: airport name and distance in km |
| `nearest_railway_station` | JSON string | `destinations` | `nearest_railway` (JSONB) | `nearestRailway` | Logistics tab: railway station and distance in km |
| `nearest_major_city` | String | `destinations` | `nearest_major_city` | `nearestMajorCity` | Connectivity guide |
| `nearest_major_city_distance_km` | Float | `destinations` | `nearest_major_city_distance_km` | `nearestMajorCityDistanceKm` | Connectivity guide |
| `road_connectivity` | String | `destinations` | `road_connectivity` | `roadConnectivity` | Transit info, highway accessibility description |
| `trip_types` | Pipe delimited | `destinations` | `trip_types` (TEXT[]) | `tripTypes` | Category filter pills (Adventure, Heritage, Spiritual, etc.) |
| `primary_attractions` | Pipe delimited | `destinations` | `primary_attractions` (TEXT[]) | `primaryAttractions` | Key sights checklist on destination page |
| `activities_available` | Pipe delimited | `destinations` | `activities_available` (TEXT[]) | `activitiesAvailable` | Things to Do section |
| `unique_experiences` | String | `destinations` | `unique_experiences` | `uniqueExperiences` | "What makes it special" editorial card |
| `hidden_gems` | String | `destinations` | `hidden_gems` | `hiddenGems` | Offbeat recommendations section |
| `best_seasons` | String | `destinations` | `best_seasons` | `bestSeasons` | Seasonal travel advisory badge |
| `avoid_seasons` | String | `destinations` | `avoid_seasons` | `avoidSeasons` | Monsoon/landslide weather precaution warning |
| `peak_tourist_season` | String | `destinations` | `peak_season` | `peakSeason` | Crowd calendar indicator |
| `off_season` | String | `destinations` | `off_season` | `offSeason` | Budget travel tips |
| `average_temperature` | JSON string | `destinations` | `average_temperature` (JSONB) | `averageTemperature` | Climate widget (winter, summer, monsoon temp ranges) |
| `rainfall_pattern` | String | `destinations` | `rainfall_pattern` | `rainfallPattern` | Weather advisory summary |
| `ideal_for` | Pipe delimited | `destinations` | `ideal_for` (TEXT[]) | `idealFor` | Audience badges (Couples, Backpackers, Families) |
| `ideal_for_why` | JSON string | `destinations` | `ideal_for_why` (JSONB) | `idealForWhy` | Traveler persona justifications |
| `special_considerations` | String | `destinations` | `special_considerations` | `specialConsiderations` | High altitude, safety, or cultural advisories |
| `minimum_days` | Float | `destinations` | `minimum_days` | `minimumDays` | Trip length calculator |
| `ideal_days` | Float | `destinations` | `ideal_days` | `idealDays` | Itinerary planner baseline |
| `maximum_days` | Integer | `destinations` | `maximum_days` | `maximumDays` | Extended stay indicator |
| `suggested_itinerary` | String | `destinations` | `suggested_itinerary` | `suggestedItinerary` | Day-by-day suggested circuit timeline |
| `accommodation_types` | String | `destinations` | `accommodation_types` | `accommodationTypes` | Where to stay guide |
| `food_scene` | String | `destinations` | `food_scene` | `foodScene` | Dining highlights and cafe culture overview |
| `safety_rating` | Float | `destinations` | `safety_rating` | `safetyRating` | Trust & safety index display (out of 10) |
| `safety_notes` | String | `destinations` | `safety_notes` | `safetyNotes` | Solo travel & environmental advice |
| `internet_connectivity` | String | `destinations` | `internet_connectivity` | `internetConnectivity` | Digital nomad readiness indicator |
| `mobile_network` | String | `destinations` | `mobile_network` | `mobileNetwork` | Telco operator signal notes (Jio, Airtel, BSNL) |
| `atm_availability` | String | `destinations` | `atm_availability` | `atmAvailability` | Cash & currency preparation notice |
| `language_spoken` | String | `destinations` | `language_spoken` | `languageSpoken` | Local communication guide |
| `permits_required` | Boolean | `destinations` | `permits_required` | `permitsRequired` | Red permit warning badge (ILP / PAP required) |
| `permits_details` | String | `destinations` | `permits_details` | `permitsDetails` | Detailed permit application guidance |
| `local_culture` | String | `destinations` | `local_culture` | `localCulture` | Cultural immersion guide |
| `festivals_events` | String | `destinations` | `festivals_events` | `festivalsEvents` | Annual celebrations & fair guide |
| `local_customs` | String | `destinations` | `local_customs` | `localCustoms` | Temple and community etiquette guidelines |
| `shopping_highlights` | String | `destinations` | `shopping_highlights` | `shoppingHighlights` | Artisan handicraft and market guide |
| `local_cuisine_must_try` | String | `destinations` | `local_cuisine_must_try` | `localCuisineMustTry` | Iconic regional dish recommendation list |
| `budget_category` | JSON string | `destinations` | `budget_range_json` (JSONB) | `budgetRangeJson` | Daily budget calculator breakdown (₹/day) |
| `mid_range_category` | JSON string | `destinations` | `mid_range_json` (JSONB) | `midRangeJson` | Mid-range stay & dining estimate breakdown |
| `luxury_category` | JSON string | `destinations` | `luxury_range_json` (JSONB) | `luxuryRangeJson` | Luxury travel estimate breakdown |
| `sustainability_notes` | String | `destinations` | `sustainability_notes` | `sustainabilityNotes` | Responsible travel & waste management advisory |
| *Curated Imagery* | URL string | `destinations` | `hero_image_url` | `heroImageUrl` | Full-width visual headers on Explore cards and Destination detail dossiers (all 93 verified) |

---

## 2. Hotels Dataset (`data/raw/hotels/hotels.csv`)
- **Total Rows:** 1,007
- **Source Nature:** Real Cleaned Hospitality Records across Indian Cities
- **Database Table:** `hotels`

| CSV Column | Data Type | Database Table | Database Column | Backend API Response Field | Frontend Feature / Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `hotel_name` | String | `hotels` | `hotel_name` | `hotelName` | Hotel listing card, search, detail page header |
| `city` | String | `hotels` | `city_id` (foreign key to `cities`) | `cityId`, `cityName` | City hotel filter, city detail accommodations tab |
| `hotel_rating` | Float | `hotels` | `hotel_rating` | `hotelRating` | Star badge rating display (e.g. ★ 4.5) |
| `hotel_price` | Float | `hotels` | `price_per_night` | `pricePerNight` | Pricing tag (₹/night), category inference |
| `amenities` | Comma delimited | `hotels` | `amenities` (TEXT[]) | `amenities` | Property amenities pills (Pool, Wi-Fi, Breakfast, Spa) |
| *Derived* | String | `hotels` | `category` | `category` | Luxury (> ₹7k), Mid-Range (> ₹2k), Budget |
| *Derived* | Float | `hotels` | `latitude` | `latitude` | Leaflet map pin with city coordinate offset |
| *Derived* | Float | `hotels` | `longitude` | `longitude` | Leaflet map pin with city coordinate offset |

---

## 3. Tourist Spots & City POIs (`data/raw/poi/tourist_spots.csv` & `city_specific_pois.csv`)
- **Total Rows:** 459 (tourist spots) + 420 (city POIs) → 743 imported valid POIs
- **Source Nature:** Real Geocoded Points of Interest & Sights
- **Database Table:** `destination_pois`

| CSV Column | Data Type | Database Table | Database Column | Backend API Response Field | Frontend Feature / Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `poi_name` | String | `destination_pois` | `poi_name` | `poiName` | POI list item, itinerary stops, map popups |
| `Latitude` | Float | `destination_pois` | `latitude` | `latitude` | Leaflet map pin placement |
| `Longitude` | Float | `destination_pois` | `longitude` | `longitude` | Leaflet map pin placement |
| `tags` | Comma delimited | `destination_pois` | `tags` (TEXT[]) | `tags` | Category badges (Scenic, Tea, Heritage, Photography) |
| `source_city` | String | `destination_pois` | `city_id` | `cityId` | City detail POI tab |
| `DestinationID` | Integer | `destination_pois` | `destination_id` | `destinationId` | Destination page POI carousel & attractions |
| `Characteristics` | String | `destination_pois` | `characteristics` | `characteristics` | Sight description & architectural context |

---

## 4. Destination Reviews Dataset (`data/raw/recommendation/reviews.csv`)
- **Total Rows:** 999
- **Source Nature:** Real Imported Reviews & Sentiment Data
- **Database Table:** `reviews`

| CSV Column | Data Type | Database Table | Database Column | Backend API Response Field | Frontend Feature / Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `review_id` | Integer | `reviews` | `id` (prefixed `rev-`) | `id` | Unique review identifier |
| `destination_id` | Integer | `reviews` | `entity_id` (prefixed `dest-`) | `entityId` | Linking reviews to specific destinations |
| `rating` | Integer | `reviews` | `rating` | `rating` | Star rating display (1 to 5 stars) |
| `review_text` | String | `reviews` | `review_text` | `reviewText` | Review commentary card |
| *Derived* | String | `reviews` | `sentiment_category` | `sentimentCategory` | Sentiment filter pill (Cleanliness, Safety, Transport, Hospitality) |
| *Flag* | Boolean | `reviews` | `is_imported_dataset` | `isImportedDataset` | Flag marking dataset origin (`true`) |
| *Flag* | Boolean | `reviews` | `is_verified_booking` | `isVerifiedBooking` | Honesty badge: `false` (no fake verified claim) |

---

## 5. User History Dataset (`data/raw/recommendation/user_history.csv`)
- **Total Rows:** 999
- **Source Nature:** Real Anonymized Historical Travel Signals
- **Database Table:** `user_history`

| CSV Column | Data Type | Database Table | Database Column | Backend API Response Field | Frontend Feature / Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `history_id` | Integer | `user_history` | `id` (prefixed `hist-`) | `id` | History record ID |
| `user_id` | Integer | `user_history` | `user_id` | `userId` | User signal correlation |
| `destination_id` | Integer | `user_history` | `destination_id` | `destinationId` | Visited destination reference |
| `visit_date` | Date | `user_history` | `visit_date` | `visitDate` | Seasonality & recency weighting |
| `experience_rating` | Integer | `user_history` | `experience_rating` | `experienceRating` | Collaborative filtering preference weights |

---

## 6. Recommendation Users Dataset (`data/raw/recommendation/users_recommendation.csv`)
- **Total Rows:** 999
- **Source Nature:** Real User Persona Profiles for Recommendation Modeling
- **Database Table:** `users_recommendation` / `users`

| CSV Column | Data Type | Database Table | Database Column | Backend API Response Field | Frontend Feature / Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | Integer | `users` | `id` | `id` | Recommendation seed identity |
| `preferences` | Comma delimited | `users` / `profiles` | `interests` | `interests` | Preference vector (Beaches, Historical, etc.) |
| `gender` | String | `profiles` | `gender` | `gender` | Anonymized demographic baseline |
| `number_of_adults` | Integer | `travel_buddies` | `group_size` | `groupSize` | Travel party size distribution |
| `number_of_children` | Integer | `travel_buddies` | `children_count` | `childrenCount` | Family travel propensity |

---

## 7. Demo Local Hosts Dataset (`data/raw/demo/local_hosts_demo.csv`)
- **Total Rows:** 300
- **Source Nature:** Synthetic Benchmark Profiles for Local People Directory
- **Database Table:** `local_hosts`

| CSV Column | Data Type | Database Table | Database Column | Backend API Response Field | Frontend Feature / Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `host_id` | Integer | `local_hosts` | `id` (prefixed `host-`) | `id` | Route parameter `/local/[hostId]` |
| `name` | String | `local_hosts` | `name` | `name` | Host name, avatar initials |
| `state` | String | `local_hosts` | `state_id` | `stateId`, `stateName` | Regional filtering |
| `city` | String | `local_hosts` | `city_id` | `cityId`, `cityName` | City host list, city travel guide integration |
| `languages` | Pipe delimited | `local_hosts` | `languages` (TEXT[]) | `languages` | Language badges (Hindi, English, Telugu, etc.) |
| `skills` | Pipe delimited | `local_hosts` | `skills` (TEXT[]) | `skills` | Host expertise pills (Storytelling, Heritage Walks) |
| `interests` | Pipe delimited | `local_hosts` | `interests` (TEXT[]) | `interests` | Common interest tags |
| `role` | String | `local_hosts` | `role_title` | `roleTitle` | Title subtitle (Local Guide, Artisan, Naturalist) |
| `price_per_hour` | Float | `local_hosts` | `price_per_hour` | `pricePerHour` | Hourly hosting rate (₹/hour) |
| `rating` | Float | `local_hosts` | `rating` | `rating` | Host rating score (★ 4.5) |
| `experience_count`| Integer | `local_hosts` | `experience_count` | `experienceCount` | Hosted experiences metric |
| `availability` | String | `local_hosts` | `availability` | `availability` | Schedule badge (Weekends, Full-time) |
| `is_demo_data` | Boolean | `local_hosts` | `is_demo_data` | `isDemoData` | **Mandatory Honesty Flag** (`Sample Guide` badge) |

---

## 8. Demo Travel Buddies Dataset (`data/raw/demo/travel_buddies_demo.csv`)
- **Total Rows:** 500
- **Source Nature:** Synthetic Profiles for Travel Connect Demonstration
- **Database Table:** `travel_buddies`

| CSV Column | Data Type | Database Table | Database Column | Backend API Response Field | Frontend Feature / Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | String | `travel_buddies` | `user_id` | `userId` | Buddy profile route `/travel-connect/[userId]` |
| `destination_city`| String | `travel_buddies` | `destination_city` | `destinationCity` | Destination filter, match algorithm matching |
| `state` | String | `travel_buddies` | `state_id` | `stateId` | State-level matching fallback |
| `travel_date` | Date | `travel_buddies` | `travel_date` | `travelDate` | Date matching filter & display |
| `budget` | Float | `travel_buddies` | `budget_inr` | `budgetInr` | Budget preference display (₹) |
| `interests` | Pipe delimited | `travel_buddies` | `interests` (TEXT[]) | `interests` | Compatibility score calculation & badge |
| `languages` | Pipe delimited | `travel_buddies` | `languages` (TEXT[]) | `languages` | Language match calculation & pills |
| `group_size` | Integer | `travel_buddies` | `group_size` | `groupSize` | Solo vs party traveling indicator |
| `travel_style` | String | `travel_buddies` | `travel_style` | `travelStyle` | Style badge (Comfortable, Backpacker, Luxury) |
| `is_demo_data` | Boolean | `travel_buddies` | `is_demo_data` | `isDemoData` | **Mandatory Honesty Flag** (`Sample Traveler` badge) |

---

## 9. Geography & Census Datasets (`data/raw/geography/`)
- `india_locations_census2011.csv` (657,009 rows): Official administrative reference hierarchy (State Code, District Code, Sub-District, Town/Village). Used for state codes, valid district names, and standard geography definitions.
- `india_urban_places_candidate.csv` (8,375 rows): Reference for validated urban place names, Census classification types, and municipal corporation jurisdictions.
- `tourism_cities_from_existing_data.csv` (68 rows): The baseline urban hubs represented in the initial tourism datasets, used to establish city hub identifiers.
