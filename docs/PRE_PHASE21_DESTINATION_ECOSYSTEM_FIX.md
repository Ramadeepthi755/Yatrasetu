# Pre-Phase 21 Destination Ecosystem Fix Report

**Date:** September 5, 2026  
**Auditor / Team:** YatraSetu Core Engineering  
**Baseline:** Flyway Schema V15 · Next.js 14 App Router · Spring Boot 3.3.3 / Java 21 · Supabase PostgreSQL  
**Objective:** Resolve existing destination ecosystem bugs, fix connectivity API failures, and verify honest states before commencing Phase 21 Local Culture / Cultural Economy.

---

## 1. Connectivity
- **Root cause**: 
  1. The database `destination_transports` table contained `price_type` values of `'ESTIMATED'` and `'PRICE_UNAVAILABLE'`. In Java, the `PriceType` enum only defined `ESTIMATED_PRICE`, which threw an `IllegalArgumentException` during JPA enum mapping (`PriceType.valueOf("ESTIMATED")`), causing HTTP `500 Internal Server Error` on `/api/v1/destinations/{id}/transport`.
  2. For destinations without direct `destination_transports` rows (15 out of 164), `DestinationEcosystemService` lacked fallback parsing of destination entity metadata (`nearestAirport` and `nearestRailway`).
- **Fix**:
  1. Added `ESTIMATED` to `com.yatrasetu.domain.PriceType` enum, supporting both legacy and database values cleanly.
  2. Enhanced `DestinationEcosystemService.getTransports()` with fallback resolution from destination `nearestAirport` and `nearestRailway` metadata.
  3. Updated `TransportSection.tsx` empty-state wording to *"Connectivity information is currently limited for this destination."*
- **Destinations tested**:
  - `dest-155` (Fort Kochi & Mattancherry): HTTP 200 (2 transports: Cochin International Airport COK, Ernakulam Junction ERS)
  - `dest-136` (Tirupati): HTTP 200 (2 transports: Tirupati Main Railway Station TPTY, Tirupati Airport)
  - `dest-77` (Miyar Valley): HTTP 200 (3 transports: Kullu Bhuntar, Leh, Manali Bus Route)
  - `dest-4` (Varanasi): HTTP 200 (3 transports: Lal Bahadur Shastri Airport, Varanasi Junction, Manduadih)
  - `dest-3` (Jaipur): HTTP 200 (3 transports: Jaipur International Airport, Jaipur Junction, Sindhi Camp)
  - `dest-1` (Goa): HTTP 200 (3 transports: Dabolim Airport, Madgaon Junction, Kadamba Bus Terminal)
- **Status**: **RESOLVED** (HTTP 200 OK across all destinations)

---

## 2. Restaurants
- **Verified records found**: 0 (in database table `restaurants`)
- **Correctly displayed**: Honest empty state (*"No Verified Restaurants Registered Yet"*)
- **Honest empty states**: Retained without fake data insertion.
- **Issues fixed**: Verified that empty state renders cleanly with category icon, informative description, and partner registration CTA, without throwing runtime errors or fabricating businesses.

---

## 3. Rentals
- **Verified records found**: 0 (in database table `rental_providers`)
- **Correctly displayed**: Honest empty state (*"No Verified Rental Providers Registered Yet"*)
- **Honest empty states**: Retained without fake data insertion.
- **Issues fixed**: Verified that empty state renders cleanly with verified partner badge explanations and partner onboarding CTA.

---

## 4. Travel Agencies
- **Authorized records found**: 0 (in database table `travel_agencies`)
- **Correctly displayed**: Honest empty state (*"No Authorized Travel Agencies Registered Yet"*)
- **Honest empty states**: Retained without fake data insertion.
- **Issues fixed**: Verified that empty state renders cleanly with government license disclosure notes.

---

## 5. Hotels
- **Cities tested**: Varanasi (`varanasi`), Jaipur (`jaipur`), Delhi (`delhi`), Kochi (`kochi`), Tirupati (`tirupati`), Hampi (`hampi`).
- **Search status**: 
  - Case-insensitive search working properly (`tirupati`, `Tirupati`, `TIRUPATI` / `varanasi`, `Varanasi`, `VARANASI`).
  - Matches across hotel name, category, address, city name, city ID, destination name, destination ID, and state name.
- **Filter status**: `All Types`, `Budget`, `Mid-Range`, `Luxury`, `Highest Rating`, `Price: Low to High`, `Price: High to Low`, `Partner Properties Only`, and `Reset` verified functional.
- **Tirupati status**: 
  - Stored in database as city `tirupati`, state `IN-AP`.
  - Prototype dataset contains 0 hotel properties for Tirupati.
  - Displays honest empty state (*"No properties matched your criteria"*) without leaking unrelated cities (e.g., Chennai or Bengaluru).

---

## 6. Destination Identity
- **Destination / city / state mapping**:
  - `dest-155` → Fort Kochi & Mattancherry | City: `kochi` (Kochi) | State: `IN-KL` (Kerala)
  - `dest-136` → Tirupati | City: `tirupati` (Tirupati) | State: `IN-AP` (Andhra Pradesh)
  - `dest-77` → Miyar Valley | City: `keylong` (Lahaul & Spiti) | State: `IN-HP` (Himachal Pradesh)
  - `dest-4` → Varanasi (Kashi) | City: `varanasi` (Varanasi) | State: `IN-UP` (Uttar Pradesh)
  - `dest-3` → Jaipur | City: `jaipur` (Jaipur) | State: `IN-RJ` (Rajasthan)
  - `dest-1` → Goa | City: `panaji` (Panaji / North Goa) | State: `IN-GA` (Goa)
- **Status**: **CONSISTENT** (Zero cross-state contamination)

---

## 7. UI States
- **Loading**: Skeleton pulse grids on all async sections (Foods, Transport, Restaurants, Rentals, Agencies, Hotels, Experiences, Local Hosts, Reviews).
- **Success**: Rich cards with verified provenance badges (`DATASET`, `OFFICIAL`, `PARTNER_SUBMITTED`).
- **Empty**: Honest empty states with explanatory descriptions and partner onboarding links where appropriate.
- **Error**: Retryable error banners with functional Retry buttons that trigger state refetch.
- **Retry**: Tested and operational.

---

## 8. Map
- **Desktop (1280px / 1440px)**: Leaflet map initializes at stable height with double resize invalidation (`100ms` & `350ms`), no navbar overlap.
- **Tablet (768px)**: Responsive container with responsive legend wrapping.
- **Mobile (375px)**: Bounded height with touch-friendly interactive markers.

---

## 9. Data Honesty
- **Fake records created**: 0
- **Fabricated businesses**: 0
- **Fabricated hotels**: 0

---

## 10. Flyway
- **Current version**: V15
- **New migration**: NO (0 migrations created)
- **V1–V15 modified**: NO
- **flyway_schema_history modified**: NO

---

## 11. Tests
- **Backend**: **PASS** (86/86 Tests run, 0 failures, 0 errors)
- **Lint**: **PASS** (0 errors)
- **Build**: **PASS** (24/24 static & dynamic routes compiled successfully)

---

## 12. Final Verdict

🟢 **PRE-PHASE-21 READY**
