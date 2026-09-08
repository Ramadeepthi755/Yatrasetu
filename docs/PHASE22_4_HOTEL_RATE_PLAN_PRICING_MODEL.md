# Phase 22.4 — Hotel Rate Plans & Pricing Model

**Project:** YatraSetu  
**Tagline:** "Discover India. Connect Locally. Grow Tourism."  
**Domain:** Real Hotel Rate Plans, Pricing Foundation & Commercial Tariff Ecosystem  

---

## 1. Objective

Phase 22.4 introduces the **Rate Plan & Transparent Pricing Foundation** to YatraSetu's hotel domain. By establishing structured, verified commercial tariffs directly managed by hotel partners, YatraSetu transforms the hospitality discovery experience from indicative dataset averages into transparent, authentic commercial rate options.

Crucially, this phase upholds complete **Data Honesty**:
- A configured Rate Plan defines the tariff and meal inclusions for a room type.
- A Rate Plan is **not** availability: it does not guarantee immediate vacancy for tonight. Real-time availability calculation is deferred to future phase PMS/channel manager integrations.
- Rate plans prevent fake countdowns ("Only 1 room left!"), fake dynamic markups, and fabricated discount percentages.

---

## 2. Domain Hierarchy

```
HOTEL (Verified Partner or Dataset)
  └── ROOM TYPE (Physical Layout & Occupancy)
        ├── PHYSICAL INVENTORY (Base Capacity & Maintenance Blocks)
        └── RATE PLAN (Commercial Pricing, Inclusions, Validity, Policy)
              └── [FUTURE] DATE-SPECIFIC AVAILABILITY
                    └── [FUTURE] RESERVATION / BOOKING
                          └── [FUTURE] PAYMENT & ESCROW
```

---

## 3. Rate Plan Architecture

### Entity: `HotelRatePlan`
- `id`: Unique identifier (e.g. `rate-a1b2c3d4`).
- `roomType`: Association with parent `HotelRoomType`.
- `planName`: Plan identifier (e.g., `"Breakfast Included (CP)"`, `"Deluxe Heritage Special"`).
- `mealPlan`: Standard industry meal plan enum:
  - `EP` (European Plan — Room Only)
  - `CP` (Continental Plan — Room + Breakfast)
  - `MAP` (Modified American Plan — Room + Breakfast + 1 Major Meal)
  - `AP` (American Plan — Room + All Meals)
- `description`: Notes regarding plan inclusions and dining timings.
- `basePrice`: Explicit numeric base price ($\ge 0$).
- `currency`: ISO currency code (default `"INR"`).
- `priceUnit`: Unit of pricing (default `"NIGHT"`).
- `validFrom` / `validTo`: Optional validity date intervals.
- `cancellationPolicy`: Standardized cancellation terms (`FREE_CANCELLATION`, `NON_REFUNDABLE`, `PARTIAL_REFUND`, `CUSTOM`).
- `cancellationDeadlineHours`: Notice window (e.g. 24 hours prior to check-in).
- `cancellationFeeType` / `cancellationFeeValue`: Fee configuration if applicable.
- `taxesIncluded`: Boolean flag denoting whether published tariff includes taxes.
- `feesIncluded`: Boolean flag denoting whether published tariff includes property fees.
- `sourceType`: Provenance indicator (`PARTNER_SUBMITTED`, `DATASET`, `LIVE_API`, `DEMO`).
- `status`: Lifecycle state (`DRAFT`, `ACTIVE`, `INACTIVE`).

---

## 4. Server-Side Security & Ownership

1. **Owner Derivation**:
   Rate plans inherit hotel ownership from `ratePlan.getRoomType().getHotel().getOwner()`. The server verifies that the authenticated user matches the hotel owner. Request body ownership identifiers (`ownerId`, `partnerId`) are never trusted.
2. **Cross-Partner Isolation**:
   Attempting to view, modify, activate, or delete another partner's rate plan throws `org.springframework.security.access.AccessDeniedException` (HTTP 403 Forbidden).
3. **Public Traveler Visibility Boundary**:
   A rate plan is publicly visible to travelers if and only if:
   - Parent `Hotel.isActive == true`
   - Parent `Hotel.verificationStatus == HotelVerificationStatus.VERIFIED`
   - Parent `HotelRoomType.isActive == true`
   - `HotelRatePlan.status == RatePlanStatus.ACTIVE`

---

## 5. Overlapping Validity & Conflict Resolution

- Multiple distinct meal plans (e.g., EP ₹3,800 vs CP ₹4,400) can coexist actively for the same room.
- Non-overlapping seasonal rates (e.g., Summer CP vs Winter CP) are permitted.
- Active rate plans for the **same room** with the **same meal plan** that have **overlapping date ranges** are rejected during creation and update to prevent commercial ambiguity.

---

## 6. Data Honesty & Transparent Disclosures

- **Dataset Pricing**: Dataset properties (~1,007 records) display `"Indicative Rate (Dataset)"` and never generate synthetic rate plans.
- **Partner Pricing**: Verified partner properties display `"Partner-Submitted Rate"` with clear meal and tax inclusion badges.
- **Availability Boundary**: Every rate display includes the explicit disclosure: *"Rate information is supplied by the verified property. Live availability and final booking confirmation are confirmed during direct reservation processing."*
- **No Fake Urgency**: No false room scarcity or fabricated countdown timers.
