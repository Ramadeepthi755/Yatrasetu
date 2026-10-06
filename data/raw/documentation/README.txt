TRIPSUTRA CONNECT — DATA PACKAGE

USE THESE:
1. destinations/curated_destinations.csv
   - 100 rich curated destination/circuit records from the uploaded JSON.
2. poi/tourist_spots.csv
   - 459 cleaned POIs with coordinates/tags.
3. poi/city_specific_pois.csv
   - 420 cleaned city-specific POIs from the uploaded city files.
4. hotels/hotels.csv
   - 1007 cleaned hotel records.
5. recommendation/reviews.csv
6. recommendation/user_history.csv
7. recommendation/users_recommendation.csv
8. geography/india_locations_census2011.csv
   - Complete Census 2011 Town/Village directory; use as geography reference, NOT current tourism data.
9. geography/india_urban_places_candidate.csv
   - Candidate urban places derived from name/type markers; validate before calling them "cities".
10. geography/tourism_cities_from_existing_data.csv
   - Cities already represented by your tourism files.

DEMO DATA:
11. demo/local_hosts_demo.csv — 300 synthetic profiles for LocalMatch.
12. demo/travel_buddies_demo.csv — 500 synthetic users for Travel Buddy demo.

DO NOT USE:
- Berlin Open-Meteo CSV uploaded earlier.
- Raw duplicate copies of files after importing this package.

IMPORTANT:
- Current destination coverage is NOT complete for every Indian city.
- Census file provides geography, not tourism attractions.
- For production, enrich POIs with OpenStreetMap/official tourism APIs/data.
- Hotel data is seed/prototype data, not live availability/pricing.
- Weather should be a live API.
- Demo local hosts/travel buddies are synthetic and must be labeled as demo data.

SUGGESTED DB:
states -> districts -> cities -> destinations -> POIs
cities -> hotels/restaurants
users -> user_history/reviews
local_hosts -> experiences/bookings
trips -> itineraries
tourism_transactions -> tourism impact
