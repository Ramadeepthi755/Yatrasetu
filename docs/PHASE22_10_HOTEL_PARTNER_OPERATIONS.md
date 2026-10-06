# Phase 22.10 — Hotel Partner Operations & Property Management

## 1. Executive Summary & Architecture
Phase 22.10 establishes complete, end-to-end, authoritative operational workflows for hotel partners in YatraSetu. It connects the partner property lifecycle from registration, geographic validation, and government verification review to multi-room inventory management, rate plan pricing, live booking visibility, and real platform performance analytics.

```
PARTNER REGISTRATION
       ↓
PROPERTY SETUP (Draft)
       ↓
SUBMIT FOR VERIFICATION (Pending Review)
       ↓
GOVERNMENT/ADMIN REVIEW (Verified / Rejected / Suspended)
       ↓
ROOM TYPES & PHYSICAL UNITS
       ↓
PHYSICAL INVENTORY (Total & Blocked Units)
       ↓
RATE PLANS & PRICING (Active Meal Plans & Cancellation Rules)
       ↓
AUTHORITATIVE AVAILABILITY MATRIX (Total − Blocked − Reserved)
       ↓
LIVE BOOKINGS (Masked PII, Immutable Snapshots)
       ↓
PERFORMANCE & CAPACITY ANALYTICS (Real Platform Booking Value)
```

---

## 2. Dataset Hotel Safety Boundary
> **CRITICAL ARCHITECTURAL GUARANTEE:**
> Dataset hotels (1,007 catalog properties) are **catalog-only** and **cannot be claimed, edited, or operated by partners**.

- Provenance for dataset hotels remains `sourceType = DATASET`, `isPartnerProperty = false`, and `owner = null`.
- Server-side authorization blocks any claim, modification, inventory addition, rate plan attachment, or booking creation against dataset hotels.
- All partner operations require genuine partner-created properties with `sourceType = PARTNER_SUBMITTED` and strict owner matching (`hotel.owner.id == authenticatedPartnerId`).

---

## 3. Strict Server-Side Ownership Model & RBAC
All partner mutating and viewing operations strictly validate ownership on the server side:
- **GUEST / Anonymous**: HTTP 401 Unauthorized.
- **TRAVELER**: HTTP 403 Forbidden.
- **GOVERNMENT**: Read-only review access to pending verification properties; mutation endpoints restricted.
- **PARTNER A vs PARTNER B**: Strict isolation (`hotel.owner.id == authenticatedPartner.id`). Partner B receives HTTP 403 Forbidden when attempting to view or alter Partner A's hotel, rooms, inventory, rate plans, bookings, or analytics.
- **Mass Assignment Protection**: Client requests cannot alter authoritative fields such as `ownerId`, `verificationStatus`, `sourceType`, `isPartnerProperty`, `paymentStatus`, or `bookingStatus`.

---

## 4. Property Lifecycle & Sensitive Edit Triggers
1. **DRAFT / UNVERIFIED**: Partner creates property with validated geographic details (City, State, Destination, Coordinates).
2. **PENDING_REVIEW**: Partner submits property for review via `POST /api/v1/partner/hotels/{id}/submit`.
3. **VERIFIED**: Government official approves via `POST /api/v1/admin/hotels/{id}/verify`.
4. **REJECTED**: Official provides rejection reason; partner edits and resubmits.
5. **SUSPENDED**: Official suspends property; property becomes immediately non-bookable while preserving historical bookings.
6. **Sensitive Edit Invalidation**: If a `VERIFIED` property's core details (hotel name, city, address, or category) are modified by the partner, the system automatically invalidates verification and resets `verificationStatus = PENDING_REVIEW`.

---

## 5. Room Type & Inventory Safety Invariants
- **Duplicate Protection**: Room type names are unique per property.
- **Physical Capacity**: `baseInventoryUnits >= 0`, `maxOccupancy >= 1`.
- **Physical Inventory Bounds**: For any date, $0 \le \text{blockedUnits} \le \text{totalUnits}$.
- **Reservation Floor Protection**: Physical `totalUnits` **cannot be reduced below current active reservations** ($\text{totalUnits} \ge \text{activeReservedUnits}$). Attempts to reduce capacity below existing holds/confirmations are rejected with HTTP 400.
- **Authoritative Availability**:
  $$\text{availableUnits} = \max(0, \text{totalUnits} - \text{blockedUnits} - \text{activeReservedUnits})$$
  Availability is never stored as an editable column or computed on the frontend.

---

## 6. Rate Plan Pricing & Immutability
- **Pricing**: Base price $> 0$, currency = `INR`, pricing unit = `NIGHT`.
- **Meal Plans**: Supported standard codes: `EP` (Room Only), `CP` (Bed & Breakfast), `MAP` (Half Board), `AP` (Full Board).
- **Cancellation Policies**: `FREE_CANCELLATION`, `NON_REFUNDABLE`, `PARTIAL_REFUND`, `CUSTOM`.
- **Booking Snapshot Immutability**: Modifying or deactivating a rate plan never mutates historical booking prices or commercial snapshots.

---

## 7. Bookability Status Logic
Derived dynamically without redundant database storage:
- `UNVERIFIED`: Property in draft.
- `PENDING_VERIFICATION`: Awaiting government review.
- `VERIFIED_BUT_INCOMPLETE`: Verified, but missing active room types or active rate plans.
- `VERIFIED_BUT_INACTIVE`: Verified, but `isActive == false`.
- `BOOKABLE`: `VERIFIED` + `isActive == true` + $\ge 1$ active room type + $\ge 1$ active rate plan.
- `SUSPENDED`: Temporarily locked by government review.

---

## 8. Authoritative Platform Analytics
Metrics are calculated strictly from database booking records and payment transactions:
- **Platform Booking Value**: Sum of `totalAmount` for bookings where `paymentStatus == PAID`.
- **Confirmed Bookings**: Total bookings where `bookingStatus == CONFIRMED`.
- **Pending Payment**: Total bookings where `bookingStatus == PENDING_PAYMENT`.
- **Expired Bookings**: Total expired uncompleted reservations.
- **Cancelled Bookings**: Total cancelled reservations.
- **Reserved Room Nights**: Total night allocations reserved across active stays.
- **Inventory Coverage Days**: Count of next 30 days with configured inventory.
- **Honest Platform Disclosures**: Clearly labelled as *"YatraSetu Platform Metric"* and gross settled booking value without fabricating fictitious hotel profit or occupancy rates.

---

## 9. API Specifications
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/partner/hotels` | List hotels owned by authenticated partner |
| `POST` | `/api/v1/partner/hotels` | Register new partner hotel in draft status |
| `GET` | `/api/v1/partner/hotels/{id}` | Get hotel details (owner only) |
| `PUT` | `/api/v1/partner/hotels/{id}` | Update hotel details (resets verification if sensitive) |
| `DELETE` | `/api/v1/partner/hotels/{id}` | Delete draft hotel (owner only) |
| `POST` | `/api/v1/partner/hotels/{id}/submit` | Submit hotel for verification |
| `GET` | `/api/v1/partner/hotels/{id}/analytics` | Get authoritative platform performance analytics |
| `GET` | `/api/v1/partner/hotels/{id}/rooms` | List room types for hotel |
| `POST` | `/api/v1/partner/hotels/{id}/rooms` | Create room type with capacity |
| `PUT` | `/api/v1/partner/hotels/{id}/rooms/{roomId}` | Update room type details |
| `DELETE` | `/api/v1/partner/hotels/{id}/rooms/{roomId}` | Delete room type (blocked if active reservations) |
| `GET` | `/api/v1/partner/hotels/{id}/rooms/{roomId}/inventory` | Get date inventory records |
| `POST` | `/api/v1/partner/hotels/{id}/rooms/{roomId}/inventory` | Update date or baseline physical inventory |
| `POST` | `/api/v1/partner/hotels/{id}/rooms/{roomId}/inventory/bulk` | Bulk set date inventory range (up to 90 days) |
| `GET` | `/api/v1/partner/hotels/{id}/rooms/{roomId}/inventory/calendar` | Get authoritative 30-day capacity calendar |
| `GET` | `/api/v1/partner/hotels/{id}/rooms/{roomId}/rate-plans` | List rate plans for room type |
| `POST` | `/api/v1/partner/hotels/{id}/rooms/{roomId}/rate-plans` | Create rate plan |
| `PUT` | `/api/v1/partner/hotels/{id}/rooms/{roomId}/rate-plans/{planId}` | Update rate plan |
| `PATCH` | `/api/v1/partner/hotels/{id}/rooms/{roomId}/rate-plans/{planId}/activate` | Activate rate plan |
| `PATCH` | `/api/v1/partner/hotels/{id}/rooms/{roomId}/rate-plans/{planId}/deactivate` | Deactivate rate plan |
| `DELETE` | `/api/v1/partner/hotels/{id}/rooms/{roomId}/rate-plans/{planId}` | Delete rate plan |
| `GET` | `/api/v1/partner/hotels/{id}/bookings` | View bookings with masked traveler PII |

---

## 10. Verification & Quality Matrix
- **Backend Tests**: 273/273 tests passing (142/142 Phase 22 tests).
- **Frontend Build**: 0 errors, 24 static and dynamic routes compiled successfully.
- **Database Baseline**: Flyway V26 compliant.
- **Security Validation**: IDOR, horizontal privilege escalation, catalog takeover, and mass-assignment protected.
