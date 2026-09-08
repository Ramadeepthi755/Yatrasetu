# 🇮🇳 YatraSetu — 3-Minute Technical Explanation
## Technical Architecture, Stack, Security & AI Grounding

---

## 1. High-Level Technical Overview
YatraSetu is built on a **modern, decoupled, cloud-native microservices-ready architecture** engineered for high throughput, sub-50ms API responses, fail-closed security, and zero-hallucination artificial intelligence.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS 14 (FRONTEND)                                 │
│  - App Router (React 18 / TypeScript / Tailwind CSS)                            │
│  - Interactive Leaflet.js India Map & Recharts Analytics                        │
│  - Global AI Assistant Drawer & Responsive Glassmorphic UI                      │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ HTTPS / REST (X-Request-Id, JWT Auth)
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      SPRING BOOT 3.3.x (BACKEND)                                │
│  - Java 21 LTS / Spring Web / Spring Security / Spring Data JPA                 │
│  - CorrelationIdFilter (MDC Log Tracing)                                        │
│  - SupabaseAuthenticationFilter (HMAC-SHA256 Cryptographic Signature & exp)     │
│  - RateLimitingFilter (In-Memory Sliding-Window Token Bucket)                    │
│  - RestTemplate Timeouts (Gemini: 5s/15s, Open-Meteo: 3s/5s)                    │
│  - GlobalExceptionHandler (Sanitized 500 Responses, Leak-Proof Error DTO)      │
│  - Spring Boot Actuator (/actuator/health, /actuator/info)                      │
└──────────────────┬─────────────────────┬─────────────────────┬──────────────────┘
                   │                     │                     │
                   ▼                     ▼                     ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│  POSTGRESQL 17 / FLYWAY │ │    GEMINI AI ENGINE     │ │  EXTERNAL WEATHER & MAP │
│  - Supabase Cloud DB    │ │  - Google Gemini API    │ │  - Open-Meteo REST API  │
│  - V1–V15 Migrations    │ │  - Context Retrieval    │ │    (30-min Memory Cache)│
│  - 39 States, 202 Cities│ │  - Deterministic Fallback│ │  - OpenStreetMap Tiles  │
│  - 164 Dests, 937 POIs  │ │  - Provenance Categorizer│ │  - Leaflet Engine      │
│  - 0 Orphan Records     │ │  - Prompt Injection Guard│ │  - Demo Payment Sandbox │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
```

---

## 2. Frontend Layer (Next.js 14 App Router)
- **Framework**: Next.js 14 with React 18, Server Components, and TypeScript.
- **Styling & Design System**: Tailwind CSS with custom HSL theme variables, sleek dark-mode glassmorphism (`backdrop-blur-md`), and micro-animations via Framer Motion.
- **Data Visualization & Mapping**:
  - **Leaflet.js & OpenStreetMap**: Interactive geospatial rendering of destination coordinates, carrying capacity pressure heat indicators, and redistribution corridors.
  - **Recharts**: Dynamic demand trend charts, seasonal baseline forecast curves, and health score bar graphs.
- **Resilience & State**: Dedicated error boundaries for HTTP 401, 403, 404, 429, and 500, with non-blocking graceful fallback across dashboard widgets.

---

## 3. Backend Layer (Spring Boot 3.3.x / Java 21)
- **Runtime**: Java 21 LTS utilizing virtual-thread ready Spring Boot 3.3.4.
- **Data Access**: Spring Data JPA with Hibernate, HikariCP connection pool (10 max connections, SSL connection enforcement), and batch querying.
- **REST Endpoints**: 74 structured endpoints across 18 controllers covering Catalog Exploration, AI Trip Planning, Travel Connect, Partner Management, and Government Intelligence.
- **Health & Probes**: Integrated `spring-boot-starter-actuator` exposing `/actuator/health` (liveness/readiness probes checking live DB connectivity) and `/actuator/info`.

---

## 4. Database & Migration Layer (PostgreSQL / Flyway)
- **Engine**: Managed PostgreSQL 17 on Supabase Cloud.
- **Flyway Migrations**: 16 versioned migration scripts (V1 through V15 + V13 expansion), strictly validated and executed:
  - `V1`: Initial core schema (users, profiles, states, cities, destinations, POIs, foods, transports, hotels).
  - `V2`: Curated all-India heritage seed data.
  - `V3–V11`: Regional expansions, coordinates normalization, and review ingestion.
  - `V12`: Government Tourism Intelligence foundation.
  - `V13–V14`: South, East, and zero-coverage State & UT tier-A destination expansion.
  - `V15`: Deepened tourism intelligence tables (ecosystem gaps, dynamic redistribution, government actions, health scores).
- **Data Baseline**: 39 States/UTs, 202 Canonical Cities, 164 Destinations, 937 POIs, 334 Foods, 380 Transports, 1,007 Accommodations, 500 Travel Buddies, 0 Orphan Records.

---

## 5. Security & Authentication Architecture
- **Fail-Closed Model**: Unverified requests are rejected immediately at the filter level without reaching downstream services.
- **Cryptographic JWT Signature Verification**:
  - Validates HMAC-SHA256 signature using the configured `app.supabase.jwt-secret`.
  - Validates `exp` timestamp to prevent replay of expired tokens.
  - Profile-gated: Mock authentication headers (`X-Test-User-Email`) and mock tokens are strictly blocked in production.
- **Role-Based Access Control (RBAC)**:
  - `Guest` $\to$ `/api/v1/government/**`: **401 Unauthorized**
  - `Traveler` $\to$ `/api/v1/government/**`: **403 Forbidden**
  - `Partner` $\to$ `/api/v1/government/**`: **403 Forbidden**
  - `Government` $\to$ `/api/v1/government/**`: **200 OK**
- **Ownership Validation**: Traveler A cannot access Traveler B’s trips; Partner A cannot mutate Partner B’s experiences.
- **Rate Limiting**: Sliding-window token bucket (`RateLimitingFilter`) enforcing 15 req/min on AI endpoints, 30 req/min on social mutations, 20 req/min on auth, and 120 req/min on public catalog. Returns HTTP 429 before expensive downstream processing.
- **Sanitized Error Responses**: `GlobalExceptionHandler` masks internal SQL errors and stack traces into safe, standardized error DTOs.

---

## 6. AI Engine & Grounding Guardrails
- **Dual-Engine Architecture**:
  1. **Primary LLM**: Google Gemini API via `GeminiAiProvider` with configured connect (5s) and read (15s) timeouts.
  2. **Deterministic Fallback**: `DeterministicFallbackAiProvider` providing instantaneous, offline, zero-hallucination responses if external AI is throttled or offline.
- **Context Grounding**: `AiContextRetrievalService` retrieves exact database records (POIs, entry fees, transport types, best seasons, live cached weather) and injects them as factual boundaries.
- **Provenance Brackets**: AI outputs are strictly categorized:
  - `[STRUCTURED_FACT]`: Information directly matched to database entities.
  - `[DERIVED_PLATFORM_METRIC]`: Values derived from platform activity proxies.
  - `[TRANSPARENT_BASELINE_FORECAST]`: Historical trend extrapolations.
  - `[AI_EXPLANATION]`: Strategic advice and qualitative synthesis.
  - `[UNAVAILABLE_INFORMATION]`: Explicit refusals for ungrounded statistics.
- **Prompt Injection Defense**: Regex pattern matcher intercepts jailbreak attempts (`"ignore previous instructions"`, `"system prompt"`) and returns safe refusals.

---

## 7. Government Tourism Intelligence Engine
- **Destination Health Index**: Composite algorithm balancing demand volume (25%), activity pressure inverse (25%), local host opportunity (20%), transit connectivity (15%), and environmental sustainability proxy (15%).
- **Dynamic Redistribution Algorithm**: Geographic clustering ($\le 250\text{ km}$) pairing high-pressure primary hubs with compatible secondary cultural nodes to compute relief potential.
- **Ecosystem Gap Detection**: Automated rules flagging guide deficits ($> 5$ POIs, 0 guides), homestay shortages, or transit bottlenecks.
- **Government Action Lifecycle**: End-to-end tracking of government directives (`LOGGED` $\to$ `IN_PROGRESS` $\to$ `RESOLVED`) with full official attribution.
