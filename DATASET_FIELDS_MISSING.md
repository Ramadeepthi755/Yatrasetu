# YatraSetu — Dataset Fields Missing (`DATASET_FIELDS_MISSING.md`)

This document identifies all operational, transactional, and dynamic fields required by the YatraSetu platform features that **do NOT exist** in the supplied raw datasets under `data/raw/`. It specifies how each missing field is handled according to the **Demo Data Policy** and **Data Honesty Rules**.

---

## 1. Traveler Domain (`users` / `profiles`)

| Feature / UI Requirement | Dataset Status | Reason Absent | Handling Policy | Honesty Label / Default |
| :--- | :--- | :--- | :--- | :--- |
| **Traveler Bio** | **Not Available** | Raw recommendation users contain only demographic buckets (gender, adults count). | Generated sensibly on traveler onboarding / profile edit. | Empty by default until written by traveler; demo travelers have clearly labeled illustrative quotes. |
| **Emergency Contact** | **Not Available** | No PII or emergency contacts exist in public recommendation datasets. | Collected exclusively from authenticated travelers via `/profile`. | Null for guest / unauthenticated sessions. |
| **Personal Profile Image URL** | **Not Available** | Public user datasets do not contain user avatar images. | Custom upload or initials avatar fallback. | Colored SVG initials avatar (e.g. "AS" for Aditi Sharma). |
| **Travel Style Preference** | **Partially Available** | Available in `travel_buddies_demo.csv`, but not in `users_recommendation.csv`. | Defaulted to "Explorer" on account creation; user chooses on onboarding. | Defaults to "Comfortable Explorer" until user sets preference. |
| **Budget Preference Tier** | **Partially Available** | Stored in destination datasets as destination price tiers, but not per-traveler in user dataset. | Inferred from travel buddy budgets or selected by user. | "Mid-Range" default. |
| **Verified Traveler Status** | **Not Available** | Seed user history does not have KYC/Govt ID verification. | Only true if real traveler verifies phone / email via Supabase Auth. | **Unverified (`is_verified = false`)** by default. Never display "Government Verified Traveler" on synthetic data. |

---

## 2. Experiences Domain (`experiences`)

| Feature / UI Requirement | Dataset Status | Reason Absent | Handling Policy | Honesty Label / Default |
| :--- | :--- | :--- | :--- | :--- |
| **Experience Listings** | **Not Available** | Supplied datasets contain POIs, hotels, and destinations, but no bookable experience product catalog. | 12 benchmark sample experiences seeded in migration V4 to demonstrate cultural walks, workshops, and food tours. | **Flagged `is_demo_data = TRUE`**. UI strictly displays **`Sample Experience`** badge. |
| **Exact Schedule & Start Times** | **Not Available** | No dynamic scheduling feed exists in static CSV files. | Sensible sample departures (e.g. "06:30 AM Sunrise", "04:30 PM Sunset Walk"). | Labeled as "Sample Schedule". |
| **Activity Duration** | **Not Available** | Not in POI or destination files. | Estimated realistically from experience scope (2.5 to 6.0 hours). | Displayed in hours (e.g. "3.5 hrs"). |
| **Inclusions & Exclusions** | **Not Available** | Absent in raw POI datasets. | Formatted arrays of inclusions (e.g. "Local boat fee", "Chai and snacks", "Guide fee"). | Labeled as "Sample Inclusions". |
| **Maximum Group Capacity** | **Not Available** | No ticketing engine in raw CSVs. | Hardcoded realistic caps (6 to 12 participants). | "Up to 8 guests". |
| **Cancellation Policy** | **Not Available** | No terms of service in raw CSVs. | Standardized policy text: "Free cancellation up to 48 hours before start time". | Labeled as standard policy. |
| **Meeting Point GPS / Address** | **Not Available** | Only general city/destination coordinates exist. | Derived from primary destination centroid with realistic landmark names. | Shown on Leaflet map with property/landmark pin. |

---

## 3. Local Partner Domain (`local_hosts` / `partners`)

| Feature / UI Requirement | Dataset Status | Reason Absent | Handling Policy | Honesty Label / Default |
| :--- | :--- | :--- | :--- | :--- |
| **Government Identity Documents (Aadhaar / Tour Guide License)** | **Not Available** | `local_hosts_demo.csv` is synthetic benchmark data without official PII or government registration numbers. | Real partner onboarding flow (`/onboarding/partner`) collects document types and license numbers. | Demo hosts have verification status `PENDING`. **UI strictly labels them `Sample Guide` (never "Government Verified")**. |
| **Live Calendar Availability** | **Not Available** | Only static strings like "Weekends" or "Daily" exist in CSV. | Inquiry-based interaction model; live synchronization will connect to partner calendar APIs. | Labeled as "General Availability". |
| **Business Registration / GSTIN** | **Not Available** | Synthetic demo dataset does not contain tax IDs. | Collected during real partner onboarding. | Null for demo hosts. |
| **Bank Account / Payout Credentials** | **Not Available** | No payment recipient details in raw files. | Connected via Razorpay Route / UPI on real onboarding. | Handled via sandbox keys. |

---

## 4. Travel Connect Domain (`travel_buddies` / `travel_buddy_requests`)

| Feature / UI Requirement | Dataset Status | Reason Absent | Handling Policy | Honesty Label / Default |
| :--- | :--- | :--- | :--- | :--- |
| **Planned Return Dates** | **Partially Available** | Only `travel_date` (departure) is in CSV; return date was missing. | Inferred as `travel_date + ideal_days` from destination data. | Displayed as range (e.g. "2026-10-02 – 2026-10-05"). |
| **Flexible Dates Indicator** | **Not Available** | Not present in demo CSV. | Seeded as boolean (`flexible_dates: true/false`). | "Flexible" badge when true. |
| **Live Connection Requests & Messages** | **Not Available** | Dynamic user-generated communication records cannot exist in static seed files. | Interactive database tables `travel_buddy_requests` and `messages` created in migration V5. | 0 live rows initially. Only generated when an authenticated user sends a connection request or chat message. |
| **Match Scoring Percentage** | **Not Available** | Not a stored field. | Dynamically computed on-the-fly via deterministic algorithm (Destination 35%, Dates 25%, Style 15%, Interests 15%, Language 10%). | Displayed as "XX% Match" with tooltip explaining deterministic scoring. |

---

## 5. Booking & Payment Domain (`bookings` / `payments`)

| Feature / UI Requirement | Dataset Status | Reason Absent | Handling Policy | Honesty Label / Default |
| :--- | :--- | :--- | :--- | :--- |
| **Live Hotel Room Availability & Inventory** | **Not Available** | `hotels.csv` is an unlinked static snapshot with no Property Management System (PMS) connectivity. | Prototype directory with inquiry request simulation. | **UI strictly displays `Prototype Hotel Directory`** and "Inquiry Sent to Hotelier" instead of instant confirmed booking. |
| **Payment Gateway Transactions** | **Not Available** | No real bank transactions. | Razorpay TEST mode integration (`rzp_test_...`). | **Test Mode Only**. Real money transactions and fake live receipts are strictly prohibited. |
| **Confirmed Booking Vouchers** | **Not Available** | No GDS / CRS ticketing engine. | Prototype confirmation receipts with "Test Order / Sandbox Booking" stamp. | Labeled as "Sandbox Confirmation". |

---

## 6. Government Analytics Domain (`government_overview`)

| Feature / UI Requirement | Dataset Status | Reason Absent | Handling Policy | Honesty Label / Default |
| :--- | :--- | :--- | :--- | :--- |
| **Official Central / State Tourism Statistics** | **Not Available** | No live Ministry of Tourism API feed exists in project. `india_locations_census2011.csv` is a static town/village directory, not a tourism KPI feed. | Separated in UI into **"Official Reference: Census 2011 Baselines"** vs **"Platform Metrics"**. | Never fabricate live government footfall stats; label official data as Census baselines. |
| **AI Tourism Opportunity Scores** | **Not Available** | Advanced algorithmic pipeline planned for Phase 10. | Labeled as "AI-Derived Signals (Phase 10 Preview)". | Clearly disclosed as predictive index, not historical government fact. |
| **Local Economic Impact / Tourism Leakage** | **Not Available** | Requires completed financial transaction ledger. | Labeled as "Platform Metrics: Grassroots Inflow Tracking (Phase 10)". | Clearly marked as platform-tracked metric. |

---

## 7. Weather Domain

| Feature / UI Requirement | Dataset Status | Reason Absent | Handling Policy | Honesty Label / Default |
| :--- | :--- | :--- | :--- | :--- |
| **Live Meteorological Signals** | **Not Available** | Project raw data included a static Berlin Open-Meteo CSV, which must **NEVER** be used for Indian tourism. | Open-Meteo live REST API (`https://api.open-meteo.com/v1/forecast`) queried dynamically using actual destination latitude/longitude. | Real live weather tagged with "Live Weather via Open-Meteo API"; static fallback tagged "Seasonal Climate Benchmark". |

---

## 8. Destination Imagery Domain (`hero_image_url`)

| Feature / UI Requirement | Dataset Status | Reason Absent | Handling Policy | Honesty Label / Default |
| :--- | :--- | :--- | :--- | :--- |
| **Curated Destination Hero Imagery** | **Fully Resolved (V7)** | `curated_destinations.csv` lacked image URLs, leaving `hero_image_url = NULL` across all 93 records. | Curated and verified representative high-resolution imagery for all 93 destinations from public-domain / Wikimedia Commons archives with HTTP 200 validation. | Destination-specific images mapped directly in database; neutral themed vector/gradient fallback acts strictly as runtime error guard. Alt text provides clear, factual descriptions without misleading branding. |

