# 🛡️ YatraSetu — Data Honesty & Provenance Policy
## Ethical Data Taxonomy, Transparent Metrics & Provenance Boundaries

---

## 1. Core Philosophy: Zero Hallucination & Zero Fabrication
In mission-critical public platforms and tourism governance, **trust is paramount**. YatraSetu strictly enforces a Zero-Hallucination and Zero-Fabrication policy across all user journeys, AI interactions, and analytical dashboards.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA PROVENANCE LABELS                          │
├───────────────────────┬────────────────────────────────────────────────┤
│ Label                 │ Source & Definition                            │
├───────────────────────┼────────────────────────────────────────────────┤
│ [STRUCTURED_FACT]     │ Verified entity in PostgreSQL database.        │
│ [DERIVED_METRIC]      │ Transparently computed from platform activity. │
│ [BASELINE_FORECAST]   │ Mathematical trend extrapolation.              │
│ [AI_EXPLANATION]      │ Qualitative synthesis and domain guidance.     │
│ [UNAVAILABLE_INFO]    │ Explicit refusal when data is not grounded.    │
└───────────────────────┴────────────────────────────────────────────────┘
```

---

## 2. Dataset Classification & Provenance Boundaries

### 2.1 Verified Heritage Catalog (`DATASET` / `OFFICIAL`)
- **Coverage**: 39 States/UTs, 202 Canonical Cities, 164 Curated Destinations, 937 Points of Interest, 334 Famous Foods, 380 Transports, and 1,007 Accommodations.
- **Verification**: Sourced from official state tourism inventories, archaeological surveys, and curated geographic catalogs.
- **Boundary**: Does not claim 100% coverage of all unverified rural hamlets in India.

### 2.2 Historical Seed Reviews (`DATASET`)
- **Inventory**: 999 review rows ingested during initial baseline seeding.
- **Honesty Standard**:
  - Explicitly marked in the database with `is_imported_dataset = true` and `is_verified_booking = false`.
  - Never displayed as newly booked traveler transactions or platform demand signals.
  - Used strictly for sentiment modeling and historical baseline context.

### 2.3 Local Hosts & Community Experiences (`PARTNER_SUBMITTED` / `DEMO`)
- **Inventory**: 300 registered host profiles and 12 community experiences.
- **Honesty Standard**:
  - Sample profiles demonstrate platform capabilities for independent guides and artisans.
  - Production verification requires valid Government ID / Tourism Guide licensing uploaded through the Partner Portal.

### 2.4 Travel Buddies (`USER_GENERATED` / `DEMO`)
- **Inventory**: 500 travel buddy profiles across destinations.
- **Honesty Standard**:
  - Pre-seeded profiles demonstrate destination-specific matching algorithms.
  - Flagged internally with `is_demo_data = true` to isolate test data from real organic user registrations.

---

## 3. Tourism Intelligence Metrics: What They Are vs. What They Are NOT

| Platform Metric | What It IS | What It IS NOT |
| :--- | :--- | :--- |
| **Activity Pressure** | A platform-derived index (0–100) aggregating traveler search, trip planning, and booking interest within YatraSetu. | Physical tourist footfall, turnstile counts, or IoT gate sensor statistics. |
| **Destination Health Score** | A deterministic multi-factor index balancing demand, pressure inverse, host density, transit, and sustainability proxy. | Official State Government pollution/environmental audit scores. |
| **Transparent Baseline Forecast**| A mathematical exponential moving-average extrapolation with seasonal window weighting. | An AI-predicted real-world visitor guarantee. |
| **Ecosystem Gaps** | A heuristic ratio flagging localized deficits in registered guides, homestays, or transport. | Official Ministry of Labour employment censuses. |
| **Demand Redistribution** | Proximity-based recommendation corridors ($\le 250\text{ km}$) showing where excess demand could be routed. | Mandatory government rerouting or flight diversion directives. |

---

## 4. Payment Simulation Trust Boundary
- **Current Status**: **DEMO PAYMENT SIMULATION**.
- **User Interface**: The booking modal prominently displays an amber **"Demo Payment Simulation"** badge.
- **Honesty Standard**:
  - Fully persists booking records (`bookings` and `payments` tables) to demonstrate the complete workflow.
  - Transparently states to users and evaluators that no real banking charge is executed until live merchant payment gateway credentials (e.g., Razorpay / UPI) are provisioned.
  - No mock webhooks or fabricated bank transaction IDs are claimed as live banking settlement.

---

## 5. AI Refusal Standards
When users prompt the AI Assistant for data outside YatraSetu's verified grounding:

1. **Municipal Revenue Inquiries**:
   > *"Official municipal tourism revenue figures and tax receipts are currently unavailable from external government endpoints. YatraSetu provides Activity Pressure Proxies and Local Opportunity Scores calculated strictly from verified platform demand signals."*
2. **Real-Time Physical Footfall Inquiries**:
   > *"YatraSetu does not operate physical IoT gate sensors or camera censuses. We track digital platform interest and carrying-capacity proxies to support administrative decision-making."*
3. **Unverified Commercial Businesses (Cafes / Taxis)**:
   > *"In accordance with YatraSetu's Zero-Hallucination Policy, we display only verified partner listings and official data. We do not invent restaurant names, phone numbers, or live taxi fares."*
