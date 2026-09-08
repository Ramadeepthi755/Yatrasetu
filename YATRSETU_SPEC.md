# YatraSetu System Specification (YATRSETU_SPEC.md)

**Product Name:** YatraSetu  
**Tagline:** "Discover India. Connect Locally. Grow Tourism."  
**Target Ecosystem:** Tourists & Travelers | Local Tourism Providers & Hosts | Government & Tourism Authorities  
**Version:** 1.0.0-PROTOTYPE  
**Last Updated:** August 2026  

---

## 1. Product Vision & Ecosystem Architecture

YatraSetu is an AI-powered, nationwide tourism ecosystem connecting three primary stakeholder groups through a unified, accessible, and high-performance digital platform:

```
+------------------------------------------------------------------------------------+
|                                    YatraSetu                                       |
+--------------------------+------------------------------+--------------------------+
|       1. TRAVELER        |       2. LOCAL PARTNER       |      3. GOVERNMENT       |
| Discover -> Plan         | Register -> Create Offerings | Observe -> Analyze       |
| Connect -> Book          | Discovered -> Get Bookings   | Identify Gaps/Trends     |
| Experience -> Review     | Earn -> Scale Locally        | Measure Impact & Support |
+--------------------------+------------------------------+--------------------------+
```

### Strategic Objectives
1. **Redistribute Tourism Demand:** Surface emerging destinations, circuits, and hidden gems alongside iconic attractions to ease over-tourism and foster regional economic development.
2. **Empower Grassroots Communities:** Directly connect travelers to verified local guides, artisans, home chefs, cultural hosts, and adventure guides, ensuring local communities benefit from tourism.
3. **Actionable Governance Intelligence:** Provide tourism boards and authorities with real-time, aggregated data on tourist movement, sentiment signals, transaction value, and infrastructure bottlenecks.

---

## 2. Core Differentiators

### A. YatraSetu Local (Host & Guide Connection)
- Connects travelers directly with verified local hosts, guides, storytellers, photographers, artisans, and culinary experts.
- **Explainable Matching Engine:** Matches travelers based on a deterministic multi-factor model:
  - Interest Compatibility (35%)
  - Language Compatibility (20%)
  - Location/Proximity (15%)
  - Budget Alignment (15%)
  - Rating & Experience (10%)
  - Availability (5%)
- Gemini AI generates natural language rationale explaining *why* a particular host was recommended, while the underlying score is mathematically computed.

### B. YatraSetu Connect (Traveler-to-Traveler Matchmaking)
- Allows travelers to find travel companions / buddies visiting the same destination or circuit during overlapping dates.
- **Strict In-App Boundary:** All matching, search, compatibility reviews, and trip groups operate strictly inside YatraSetu (`/travel-connect`, `/travel-connect/users/{userId}`). No external redirection or external site popups.
- Match factors: Destination alignment, date overlap, budget compatibility, travel style, and shared interests.

---

## 3. Stakeholder Roles & Access Control

| Stakeholder Role | Subtypes / Categories | Primary Capabilities |
| :--- | :--- | :--- |
| **TRAVELER** | Solo, Couple, Family, Group | Explore destinations, AI trip planning, book hotels & experiences, search local hosts, travel buddy connect, in-app payments, verified reviews, notification center. |
| **PARTNER** | Local Host, Guide, Experience Provider, Hotel/Homestay, Restaurant, Artisan, Photographer | Manage business/host profile, create experiences & service listings, set pricing & availability calendars, manage booking requests, track earnings & payout stats. Verification required before verified badge. |
| **GOVERNMENT** | State Tourism Board, District Collectorate, Ministry of Tourism | Aggregated tourism analytics, destination opportunity indices, sentiment & complaint clustering, seasonal movement forecasts, infrastructure signal tracking, transaction impact reporting. |

---

## 4. Privacy, Permissions & Geo-Safety

- **Contextual Permission Requests:** Never prompt for all browser permissions on login. Permissions are requested only when a specific feature triggers it (e.g., location requested only on "Places near me").
- **Graceful Fallback:** If location is denied, the application gracefully provides manual State/City/Destination selection filters without degradation.
- **Location Privacy Safeguard:** Exact GPS coordinates of travelers are never exposed to other travelers. Only city/district/approximate region is shown in Travel Connect and community features.

---

## 5. UI/UX Design System & Principles

- **Visual Palette:**
  - Deep Indigo: `#312E81` (Primary branding & headers)
  - Saffron: `#F59E0B` (Accent & CTA highlights)
  - Teal: `#0F766E` (Secondary accent & nature badges)
  - Warm Ivory: `#FFFBF5` (Background surface)
  - Charcoal: `#171717` (High-contrast text)
  - Slate: `#64748B` (Secondary text & borders)
  - Emerald: `#059669` (Success & verification badges)
  - Crimson: `#DC2626` (Destructive/Error alerts)
- **Aesthetic Direction:** Warm Indian cultural heritage blended with clean modern software ergonomics.
- **Accessibility:** WCAG AA compliant contrast, full keyboard navigation, screen reader ARIA labels, semantic markup.

---

## 6. Core Traveler Routes

- `/` / `/home` — Personalized discovery, search, nearby places, curated circuits, hidden gems, trending hosts.
- `/explore` — Hierarchical exploration (India -> State -> City -> Destination) with filters (Region, Budget, Style, Category).
- `/states/[stateId]` — State overview, top circuits, cities, cultural festivals, seasonal guide.
- `/cities/[cityId]` — City intelligence, POIs, top stays, dining, verified local guides.
- `/destinations/[destinationId]` — Comprehensive destination detail (Hero, weather, attractions, budget breakdown, hotels, experiences, local hosts, travel buddies, map, verified reviews).
- `/plan-trip` — Interactive AI Trip Planner (Gemini-backed + DB grounded).
- `/trips/[tripId]` — Saved trip itinerary view, edit schedule, add experiences/stays.
- `/local` — YatraSetu Local directory, filter hosts by skill, language, rating, destination.
- `/local/[hostId]` — Local host profile, verified badges, offerings, booking modal, verified reviews.
- `/travel-connect` — Travel buddy discovery with date, destination, and interest matching.
- `/travel-connect/users/[userId]` — Traveler profile (privacy-safe), compatibility breakdown, connect request.
- `/hotels/[hotelId]` — Hotel details, room types, amenities, availability, booking trigger.
- `/experiences/[experienceId]` — Curated local experience details, host info, time slots, guest pricing.
- `/bookings` & `/bookings/[bookingId]` — Booking management, Razorpay payment completion, booking vouchers.
- `/notifications` — In-app updates for booking confirmations, connection requests, travel alerts.
- `/profile` & `/settings` — User preferences, past trips, verified badges, language settings.

---

## 7. AI & External Integration Guardrails

1. **AI Subsystem (Google Gemini):**
   - AI generates structured JSON itineraries and contextual suggestions.
   - All hotels, POIs, prices, and host details are strictly grounded in relational database records.
   - Fallback mechanisms for API degradation or rate limits.
2. **Weather API (Open-Meteo):**
   - Free tier, real-time forecast used to dynamically adjust daily itinerary recommendations (e.g., indoor museums during heavy rain).
3. **Maps & Geo Data (Leaflet + OpenStreetMap):**
   - Interactive POI mapping, route plotting, and regional cluster visualization without expensive proprietary map APIs.
4. **Payments (Razorpay Test Mode):**
   - Server-side order creation (`POST /api/v1/payments/create-order`) and cryptographic HMAC SHA256 signature verification (`POST /api/v1/payments/verify`) before confirming any booking.

---

## 8. Government Tourism Intelligence Specification

The Government Dashboard (`/government`) provides macro-level aggregated insights:
1. **Tourism Overview:** Total visitor footfall trends, spending distribution across sectors (stays vs local guides vs dining).
2. **Emerging Destination Opportunity Score:** Algorithmic calculation based on search velocity, plan additions, host supply gap, and review sentiments.
3. **Sentiment & Feedback Signal Engine:** NLP topic extraction categorizing reviews into Cleanliness, Transport, Safety, Local Hospitality, and Infrastructure.
4. **Platform vs. Official Data Transparency:** Every chart and metric is explicitly labeled as either:
   - *Platform-generated metric* (YatraSetu active transactions)
   - *Official Reference Data* (Census 2011 / Ministry of Tourism baselines)
   - *AI-derived Insight* (Opportunity scoring and trend forecasting)
