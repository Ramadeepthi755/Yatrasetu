# Architectural Decision Records (DECISIONS.md)

This document records the key architectural decisions, context, and rationales for the **YatraSetu** platform.

---

## ADR-001: Product Identity and Naming
- **Status:** Accepted
- **Context:** The product vision requires a clean, independent, and forward-looking tourism platform connecting tourists, local communities, and government authorities.
- **Decision:** The official and exclusive name of the platform is **YatraSetu** (Tagline: *"Discover India. Connect Locally. Grow Tourism."*). Any historic references or legacy dataset naming (e.g. TripSutra) are treated solely as reference artifacts; no legacy branding or code is to be used.

---

## ADR-002: Technology Stack (Spring Boot Java 21 + Next.js TypeScript)
- **Status:** Accepted
- **Context:** The application requires high-performance, SEO-friendly public pages, real-time client interactions (maps, AI chat, filters), and enterprise-grade transactional backend logic (payments, bookings, deterministic matching, role-based analytics).
- **Decision:**
  - **Frontend:** Next.js (App Router, TypeScript) with Tailwind CSS, Lucide icons, Leaflet, and Recharts.
  - **Backend:** Java 21 with Spring Boot 3.3+, JPA/Hibernate, Spring Security, and Maven/Gradle.
  - **Database:** Managed PostgreSQL (Supabase) with strict relational schemas, foreign keys, and indexes.

---

## ADR-003: Deterministic & Explainable Scoring Model
- **Status:** Accepted
- **Context:** Matching tourists to local hosts and travel companions must be objective, fair, predictable, and explainable to users.
- **Decision:**
  - **YatraSetu Local Matching:** Computed using deterministic weighted formula:
    - Interests (35%)
    - Language Compatibility (20%)
    - Proximity/Location (15%)
    - Budget (15%)
    - Rating & Track Record (10%)
    - Availability (5%)
  - Gemini AI provides natural-language justifications for the match results, but never directly determines the business logic or score arbitrarily.

---

## ADR-004: In-App Travel Connect Integrity
- **Status:** Accepted
- **Context:** Travel companion search must provide a safe, unified experience without dropping users out to third-party portals or external social media links.
- **Decision:** All Travel Connect flows operate strictly on internal routes (`/travel-connect`, `/travel-connect/users/{userId}`). Exact traveler GPS coordinates are shielded for privacy; only approximate city/district centroids are shown.

---

## ADR-005: Grounded AI Itinerary Generation
- **Status:** Accepted
- **Context:** AI trip planners often suffer from hallucinations, creating fake hotels, invalid attraction timings, or wrong prices.
- **Decision:** The AI trip planning pipeline retrieves verified destination POIs, hotel tiers, host pricing, and Open-Meteo forecasts from the backend before invoking Gemini. Gemini is instructed to organize the schedule strictly from the provided context in structured JSON format.

---

## ADR-006: Server-Side Payment & Booking Verification
- **Status:** Accepted
- **Context:** Financial transactions must be resilient against client-side tampering.
- **Decision:** Razorpay Test Mode orders are created server-side. Booking status transitions from `PENDING` to `CONFIRMED` only after verifying the cryptographic HMAC-SHA256 signature received in the payment callback on the Spring Boot backend.

---

## ADR-007: Verified Reviews vs. Historical Dataset Transparency
- **Status:** Accepted
- **Context:** Review provenance must be clear to maintain user trust and avoid misleading users.
- **Decision:** Reviews submitted through active platform bookings are marked `is_verified_booking = true`. Imported seed reviews are tagged as `is_imported_dataset = true` and clearly rendered with appropriate attribution badges.

---

## ADR-008: Government Analytics Data Provenance
- **Status:** Accepted
- **Context:** Government dashboards should provide valuable intelligence without misleading officials into treating platform activity as national census statistics.
- **Decision:** All metrics on the Government Portal (`/government`) are strictly labeled with data provenance:
  - *Platform-generated metric* (YatraSetu platform transactions)
  - *Official Reference Data* (Census 2011 / Ministry of Tourism baselines)
  - *AI-derived Insight* (Opportunity scoring and trend forecasting)

---

## ADR-009: Unified Canonical Migration System
- **Status:** Accepted
- **Context:** Avoid duplicate or drifting migration systems between backend and data scripts.
- **Decision:** Spring Boot Flyway migrations (`backend/src/main/resources/db/migration/`) are the single canonical source of truth for schema DDL and seed migrations, mirrored in `data/migrations/`.

---

## ADR-010: Dataset Separation of User History and Reviews
- **Status:** Accepted
- **Context:** `user_history.csv` contains user visitation logs for recommendation algorithms, while `reviews.csv` contains qualitative review text.
- **Decision:** `user_history.csv` is mapped strictly to the `user_history` entity as recommendation signals. `reviews.csv` is mapped to `reviews` with `is_imported_dataset = true` and `is_verified_booking = false`.

---

## ADR-011: Synthetic Demo Data Isolation
- **Status:** Accepted
- **Context:** Prototype data for local hosts and travel buddies must not masquerade as real verified users.
- **Decision:** All demo hosts and travel buddies imported from `demo/local_hosts_demo.csv` and `demo/travel_buddies_demo.csv` are explicitly tagged with `is_demo_data = true`.

---

## ADR-012: Graceful Startup and Offline Resilience
- **Status:** Accepted
- **Context:** Developers and testing environments should be able to compile, run tests, and inspect the application shell without requiring active live external database or API secrets.
- **Decision:** The Spring Boot backend uses conditional Flyway execution, H2 in-memory testing profiles, and placeholder-safe configurations to ensure immediate compilation and test execution.

---

## ADR-013: Spatial Search, Privacy-Preserving Geolocation & Lazy Leaflet Mapping
- **Status:** Accepted
- **Context:** Explore India discovery requires interactive maps and search across 28 states, 138 cities, 93 destinations, 743 POIs, and 1,007 hotels without bogging down browser memory or compromising user location privacy.
- **Decision:**
  - Search queries execute server-side via SQL `LIKE` and indexed filter parameters; datasets are never downloaded in bulk to the client.
  - Interactive Leaflet mapping is loaded lazily with Next.js dynamic client rendering (`ssr: false`) and only loads markers relevant to the active state, city, or destination.
  - User geolocation is strictly opt-in, computed on-demand via Haversine distance, and never persisted or exposed across public profiles.

