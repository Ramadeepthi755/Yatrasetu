# YatraSetu System Architecture (ARCHITECTURE.md)

## 1. High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------------------------+
|                                      CLIENT LAYER (Next.js 14+)                                   |
|   +-------------------+  +-------------------+  +--------------------+  +---------------------+   |
|   |  Traveler Portal  |  |  Partner Portal   |  | Govt Intelligence  |  |   Map/Geo Views     |   |
|   |  (React/Tailwind) |  |  (React/Tailwind) |  | (Recharts/Insights)|  | (Leaflet/OSM Layer) |   |
|   +-------------------+  +-------------------+  +--------------------+  +---------------------+   |
+-------------------------------------------------+-------------------------------------------------+
                                                  | HTTPS / REST / JSON
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                BACKEND API GATEWAY (Spring Boot 3 / Java 21)                      |
|                                                                                                   |
|   +-------------------------------------------------------------------------------------------+   |
|   | Security & Authorization Filter (Supabase JWT / RBAC / Role & Ownership Evaluator)        |   |
|   +-------------------------------------------------------------------------------------------+   |
|                                                                                                   |
|   +-------------------+  +-------------------+  +--------------------+  +---------------------+   |
|   | Destination & POI |  |   Local Match     |  |   Travel Connect   |  |   Booking & Orders  |   |
|   |      Module       |  |     Engine        |  |       Engine       |  |       Module        |   |
|   +-------------------+  +-------------------+  +--------------------+  +---------------------+   |
|   | AI Trip Planner   |  |  Verified Reviews |  | Govt Analytics     |  |   Notification Hub  |   |
|   | (Gemini Grounded) |  |     Pipeline      |  | & Opportunity Score|  |       Service       |   |
|   +-------------------+  +-------------------+  +--------------------+  +---------------------+   |
+-------------------+-------------------+-------------------+-------------------+-------------------+
                    |                   |                   |                   |
                    v                   v                   v                   v
+-----------------------+ +-----------------------+ +----------------+ +--------------------+
| PostgreSQL (Supabase) | | Google Gemini AI API  | | Open-Meteo API | | Razorpay Test Mode |
| Relational DB Storage | | Structured Reasoning  | | Weather Signal | | Payment Processing |
+-----------------------+ +-----------------------+ +----------------+ +--------------------+
```

---

## 2. Technology Stack Selection & Rationale

| Layer | Technology | Version / Tooling | Architectural Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Web** | Next.js (App Router), React, TypeScript | Next.js 14+, React 18+ | High SEO performance for tourism pages, server component rendering, fast interactive client islands. |
| **Styling & UI** | Tailwind CSS, Lucide Icons, Framer Motion | Tailwind v3.4+, shadcn/ui patterns | Modular design token system, lightweight bundle, zero runtime CSS overhead, accessible primitives. |
| **Mapping** | Leaflet, React-Leaflet, OpenStreetMap | Leaflet 1.9+ | Cost-effective, performant, privacy-preserving geospatial visualization without vendor lock-in. |
| **Charts/Data** | Recharts | Recharts 2.x | High-performance SVG charting for government analytics and partner revenue reporting. |
| **Backend API** | Java 21, Spring Boot 3.x | Spring Boot 3.3+, Spring Data JPA, Spring Security | Enterprise-grade type safety, robust domain modeling, clean transactional integrity, high throughput. |
| **Database** | PostgreSQL | Supabase Managed Postgres 15+ | Relational schema with foreign keys, JSONB support for structured categories, ACID transactions for bookings. |
| **AI Subsystem** | Google Gemini (Gemini 2.5/Flash) | Google GenAI Java/REST Client | State-of-the-art reasoning, deterministic JSON schema enforcement, grounded itinerary generation. |
| **Weather** | Open-Meteo API | Open-Meteo REST | Open, no-key, real-time meteorological conditions for intelligent itinerary adjustments. |
| **Payments** | Razorpay Payment Gateway (Test Mode) | Razorpay Java SDK | Standard Indian payment gateway supporting UPI, Cards, NetBanking with server-side HMAC validation. |

---

## 3. Backend Modular Architecture (Clean Layered Pattern)

Each backend domain is organized strictly across four architectural layers:
1. **Controller Layer (`web/rest`):** DTO validation (`@Valid`), HTTP status mapping, endpoint routing.
2. **Service Layer (`service`):** Core business logic, transaction boundaries (`@Transactional`), deterministic score calculation, AI grounding orchestration.
3. **Repository Layer (`repository`):** Spring Data JPA repositories, optimized queries, pagination (`Pageable`), indexing.
4. **Domain Model Layer (`domain`):** JPA entities with strict relational constraints and audit timestamps.

### Key Domain Modules:
- `auth`: JWT token verification, role extraction (`TRAVELER`, `PARTNER`, `GOVERNMENT`), user context provider.
- `destination`: Hierarchical query service (State -> City -> Destination -> POIs), search and filtering.
- `local`: Host profiles, skills, verification status, and the 6-factor deterministic Local Matching Engine.
- `travelconnect`: Buddy profiles, travel style scoring, connection request lifecycle.
- `planner`: Multi-day itinerary generator combining DB inventory, weather forecast, and Gemini structured output.
- `booking`: Inventory locking, pricing calculator, booking state machine (`PENDING` -> `CONFIRMED` -> `COMPLETED` / `CANCELLED`).
- `payment`: Razorpay order creation and HMAC-SHA256 signature verification.
- `review`: Verified review submission linked directly to completed booking references.
- `government`: Aggregation engine for visitor trends, local spend distribution, sentiment mining, and opportunity scoring.

---

## 4. Frontend Route Structure & Layout Hierarchy

```
frontend/src/app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (traveler)/
│   ├── layout.tsx (Desktop Header + Mobile Bottom Nav)
│   ├── page.tsx (Personalized Home)
│   ├── explore/page.tsx (Hierarchical India Discovery)
│   ├── states/[stateId]/page.tsx
│   ├── cities/[cityId]/page.tsx
│   ├── destinations/[destinationId]/page.tsx
│   ├── plan-trip/page.tsx (AI Planner Form & Interactive Builder)
│   ├── trips/[tripId]/page.tsx
│   ├── local/
│   │   ├── page.tsx (Host Discovery & Filter)
│   │   └── [hostId]/page.tsx (Host Detail & Booking Modal)
│   ├── travel-connect/
│   │   ├── page.tsx (Buddy Discovery by Destination/Date)
│   │   └── users/[userId]/page.tsx (Buddy Profile & Connect Action)
│   ├── hotels/[hotelId]/page.tsx
│   ├── experiences/[experienceId]/page.tsx
│   ├── bookings/
│   │   ├── page.tsx (Booking History)
│   │   └── [bookingId]/page.tsx (Voucher & Payment Checkout)
│   ├── reviews/page.tsx
│   └── profile/page.tsx
├── (partner)/
│   └── partner/
│       ├── layout.tsx (Partner Sidebar & Header)
│       ├── dashboard/page.tsx (Earnings, Bookings, Ratings)
│       ├── experiences/page.tsx (Create/Manage Offerings)
│       └── bookings/page.tsx
└── (government)/
    └── government/
        ├── layout.tsx (Gov Intelligence Sidebar)
        ├── dashboard/page.tsx (Macro Overview & Metrics)
        ├── destinations/page.tsx (Emerging Spots & Opportunity Indices)
        ├── sentiment/page.tsx (Signal & Complaint Mining)
        └── impact/page.tsx (Local Economic Transaction Value)
```

---

## 5. Security & Data Protection Architecture

1. **Role-Based Access Control (RBAC):**
   - Public access: Destination discovery, search, view public host/hotel cards.
   - Traveler access: Itinerary creation, booking initiation, payment, messaging, buddy requests.
   - Partner access: Service listing CRUD, calendar management, booking approvals, earnings dashboard.
   - Government access: Authorized clearance required; access restricted to aggregated analytics only.
2. **Payment Integrity Guardrail:**
   - Client is NEVER trusted for payment confirmation.
   - The backend creates Razorpay order IDs with exact calculated amounts.
   - Upon payment callback, the backend validates `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` using server-side HMAC-SHA256 before updating status to `CONFIRMED`.
3. **Geo-Privacy Shield:**
   - Raw user coordinates are never stored in public profiles.
   - Proximity calculations happen server-side or are rounded to the nearest city/district centroid.
