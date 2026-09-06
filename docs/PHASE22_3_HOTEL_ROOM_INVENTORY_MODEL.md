# Phase 22.3 — Real Hotel Room Types & Inventory Foundation Model

## 1. Executive Summary & Objective

In **YatraSetu** ("Discover India. Connect Locally. Grow Tourism."), authentic tourism growth requires decoupling property-level listings from room-level physical capacity. Prior to Phase 22.3, hotel listings represented property metadata without structured room types or physical unit counts.

Phase 22.3 establishes the **Real Hotel Room Types & Inventory Foundation** for partner-owned hotels.

### The Real Hospitality Domain Architecture
```
HOTEL (Property Metadata, Location, Ownership, Verification)
  ↓
ROOM TYPE (Deluxe King, Heritage Haveli Suite, Family Studio)
  ↓
INVENTORY (Physical units capacity in property, maintenance blocks)
  ↓
[Future Phase: RATE PLAN (EP/CP/MAP, Cancellation terms, dynamic pricing)]
  ↓
[Future Phase: AVAILABILITY (Date-specific bookable units)]
  ↓
[Future Phase: BOOKING (Reservation lifecycle)]
  ↓
[Future Phase: PAYMENT (Razorpay / UPI Settlement)]
```

---

## 2. Core Principles & Strict Boundaries

1. **Property $\neq$ Room Type**:
   A hotel property (e.g., "Royal Heritage Haveli") possesses multiple distinct physical room categories (e.g., "Deluxe Haveli Room", "Royal Suite", "Courtyard Standard").
2. **Total Inventory $\neq$ Live Date Availability**:
   - **Total Inventory**: The physical property unit capacity registered by the partner (e.g., 8 physical rooms).
   - **Live Availability**: The number of unbooked, sellable units on a specific calendar date (e.g., "3 available on Oct 10").
   - *Phase 22.3 strictly presents physical inventory capacity and forbids fabricated live availability claims (no "Only 2 rooms left!", "Instant confirmation", or fake counters).*
3. **No Fabricated Pricing**:
   Nightly rates and dynamic pricing belong to future Rate Plan architecture. No fake prices are attached to room inventories.
4. **Dataset Property Isolation**:
   The ~1,007 curated baseline hotel records remain dataset entries (`source_type = DATASET`) without fabricated rooms or fake inventory. If room configurations are not explicitly provided, the traveler view shows an honest empty state.
5. **Strict Server-Side Ownership Hierarchy**:
   Room types inherit ownership directly from the parent hotel (`hotel.owner_id == auth_user.id`). Cross-partner mutations return HTTP 403 Forbidden.

---

## 3. Database Schema (`V20__hotel_room_inventory_foundation.sql`)

```sql
CREATE TABLE IF NOT EXISTS hotel_room_types (
    id VARCHAR(64) PRIMARY KEY,
    hotel_id VARCHAR(64) NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_type_name VARCHAR(128) NOT NULL,
    description TEXT,
    max_occupancy INT NOT NULL DEFAULT 2,
    bed_configuration VARCHAR(64),
    room_size_sqft INT,
    amenities JSONB DEFAULT '[]'::jsonb,
    is_accessible BOOLEAN DEFAULT FALSE,
    base_inventory_units INT NOT NULL DEFAULT 1,
    source_type VARCHAR(32) NOT NULL DEFAULT 'PARTNER_SUBMITTED',
    is_active BOOLEAN DEFAULT TRUE,
    is_demo_data BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_room_occupancy CHECK (max_occupancy >= 1),
    CONSTRAINT chk_base_inventory CHECK (base_inventory_units >= 0)
);

CREATE TABLE IF NOT EXISTS hotel_inventory (
    id VARCHAR(64) PRIMARY KEY,
    room_type_id VARCHAR(64) NOT NULL REFERENCES hotel_room_types(id) ON DELETE CASCADE,
    inventory_date DATE,
    total_units INT NOT NULL DEFAULT 1,
    blocked_units INT NOT NULL DEFAULT 0,
    source_type VARCHAR(32) NOT NULL DEFAULT 'PARTNER_SUBMITTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_inv_total_nonneg CHECK (total_units >= 0),
    CONSTRAINT chk_inv_blocked_nonneg CHECK (blocked_units >= 0),
    CONSTRAINT chk_inv_blocked_lte_total CHECK (blocked_units <= total_units)
);
```

---

## 4. REST API Specification

### 4.1 Traveler Public APIs
- `GET /api/v1/hotels/{hotelId}/rooms`
  - Returns active room types for public hotels.
  - Filter: Only returns rooms if parent hotel is active and not `REJECTED` or `SUSPENDED`.

### 4.2 Partner Management APIs (`@PreAuthorize("hasRole('PARTNER')")`)
- `GET /api/v1/partner/hotels/{hotelId}/rooms`
  - Lists all room types owned by the authenticated partner.
- `POST /api/v1/partner/hotels/{hotelId}/rooms`
  - Registers a new room type and creates its baseline inventory.
  - Duplicate protection: Rejects case-insensitive duplicate room names for the same property.
- `GET /api/v1/partner/hotels/{hotelId}/rooms/{roomTypeId}`
  - Retrieves a specific room type owned by the partner.
- `PUT /api/v1/partner/hotels/{hotelId}/rooms/{roomTypeId}`
  - Updates room specs (bed config, room size, amenities, occupancy, accessible flag, active flag).
- `DELETE /api/v1/partner/hotels/{hotelId}/rooms/{roomTypeId}`
  - Removes a room type and cleanly cascades associated inventory records.
- `GET /api/v1/partner/hotels/{hotelId}/rooms/{roomTypeId}/inventory`
  - Retrieves baseline and date-specific physical inventory records.
- `POST /api/v1/partner/hotels/{hotelId}/rooms/{roomTypeId}/inventory`
  - Updates baseline or date-specific physical capacity and maintenance blocks.
  - Validates `totalUnits >= 0`, `blockedUnits >= 0`, and `blockedUnits <= totalUnits`.

---

## 5. Security & RBAC Isolation

| Role / Actor | Read Public Rooms | Read Partner Rooms | Create / Edit Room | Manage Physical Capacity | Delete Room |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Anonymous / Guest** | ✅ (Verified Stays) | ❌ (401) | ❌ (401) | ❌ (401) | ❌ (401) |
| **ROLE_TRAVELER** | ✅ (Verified Stays) | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) |
| **ROLE_PARTNER (Owner)** | ✅ | ✅ (Own Only) | ✅ (Own Only) | ✅ (Own Only) | ✅ (Own Only) |
| **ROLE_PARTNER (Other)** | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) |
| **ROLE_GOVERNMENT** | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) |

---

## 6. Future Integration Roadmap

- **Phase 22.4**: Hotel Rate Plans (EP, CP, MAP, AP), Cancellation Policies, and Pricing Rules.
- **Phase 22.5**: Calendar-based Real-time Availability Engine.
- **Phase 22.6**: Direct PMS / Channel Manager Integrations (RateTiger, Staah, Cloudbeds).
