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
