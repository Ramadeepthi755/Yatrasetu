# Phase 22.6: Real Hotel Booking Engine Architecture & Specifications

## 1. Overview & Objective

Phase 22.6 introduces the authoritative reservation and booking engine for YatraSetu's verified partner hotel ecosystem. It establishes the critical transition from search and availability discovery (Phase 22.5) to atomic room reservation and inventory allocation.

```
Hotel
  ↓
Room Type
  ↓
Physical Inventory (Capacity)
  ↓
Rate Plan (Pricing & Tariff Structure)
  ↓
Date-Specific Availability (Deduction Engine)
  ↓
HOTEL BOOKING (Phase 22.6 Engine)
  ↓
Allocations & Expiry Worker → My Trips / Partner Operations
```

---

## 2. Core Architectural Principles & Invariants

### 2.1 Physical Capacity vs. Active Reservations
- **Immutable Physical Inventory**: Physical room capacity in `hotel_inventory` (`total_units` / `blocked_units`) is NEVER modified when bookings are created, confirmed, or cancelled.
- **Reservation Allocations**: Every night of a reservation is recorded in `hotel_booking_allocations` with `allocation_status IN ('RESERVED', 'CONFIRMED')`.
- **Dynamic Nightly Availability Calculation**:
  $$\text{AVAILABLE\_UNITS}(d) = \max\Big(0, \text{TOTAL\_UNITS}(d) - \text{BLOCKED\_UNITS}(d) - \text{ACTIVE\_RESERVED\_UNITS}(d)\Big)$$
- Active reserved units count allocations with status `RESERVED` or `CONFIRMED` where `allocated_date = d`.

### 2.2 Concurrency & Pessimistic Row Locking
- To prevent double bookings and race conditions when multiple travelers attempt to reserve remaining rooms simultaneously, booking creation acquires a pessimistic write lock on the target room type:
  ```java
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT r FROM HotelRoomType r WHERE r.id = :id")
  Optional<HotelRoomType> findByIdWithLock(@Param("id") String id);
  ```
- Under serial execution within the transaction, the engine re-evaluates nightly availability for every night of the stay. If requested rooms exceed available capacity on any single night, the transaction throws `HotelBookingException.insufficientAvailability(...)` and aborts atomically.

### 2.3 Idempotency Key Handling
- Every booking request includes an optional or generated `idempotencyKey`.
- If a client retries a request with the same idempotency key, the engine safely returns the existing booking without deducting additional inventory or creating duplicate charges.

### 2.4 Server-Authoritative Price Snapshot
- All monetary amounts are computed server-side directly from the active `HotelRatePlan`:
  $$\text{basePriceSnapshot} = \text{ratePlan.basePrice}$$
  $$\text{totalBaseAmount} = \text{basePriceSnapshot} \times \text{numberOfNights} \times \text{numberOfRooms}$$
  $$\text{taxesAmount} = 0.00 \quad (\text{if unconfigured})$$
  $$\text{totalAmount} = \text{totalBaseAmount} + \text{taxesAmount}$$
- **Price Honesty Guarantee**: Taxes are never guessed or inferred. If not explicitly configured, `taxesAmount = 0` and a clear disclosure is attached: `"Applicable taxes/fees are not currently configured/included."`
- The entire price snapshot is frozen onto the `hotel_bookings` record and is immutable.

### 2.5 Strict Payment & Lifecycle Boundary
- **Booking Status Initial State**: `PENDING_PAYMENT`
- **Payment Status Initial State**: `UNPAID`
- **Zero Fake Payments**: No fake instant confirmations or simulated gateways exist. Real payment capture will be introduced in Phase 22.7.
- **Option A Pending Expiry**: Pending reservations hold inventory for up to 30 minutes (`expires_at = created_at + 30m`). Expired pending reservations release their allocations automatically upon evaluation or scheduled cleanup.

### 2.6 Dataset Protection Boundary
- The 1,007 catalog dataset properties (`source_type = 'DATASET'`) are read-only exploratory data and strictly non-bookable.
- Attempting to book a dataset property immediately returns `400 Bad Request` (`HOTEL_NOT_BOOKABLE`).

### 2.7 Strict RBAC & PII Masking
- **Travelers**: Can create bookings and view/manage their own bookings (`/api/v1/bookings/my-bookings`, `/api/v1/bookings/{bookingReference}`).
- **Partners**: Can view bookings only for hotels they own (`/api/v1/partner/hotels/{hotelId}/bookings`). Traveler PII is masked (e.g. `R*** D***`, `r***@***.com`, `+91 ******1234`) to respect data privacy.
- **Unauthenticated Users**: Blocked with `401 Unauthorized`.

---

## 3. Database Schema (Flyway V24)

### `hotel_bookings`
```sql
CREATE TABLE hotel_bookings (
    id VARCHAR(64) PRIMARY KEY,
    booking_reference VARCHAR(32) NOT NULL UNIQUE,
    idempotency_key VARCHAR(128) UNIQUE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    hotel_id VARCHAR(64) NOT NULL REFERENCES hotels(id),
    room_type_id VARCHAR(64) NOT NULL REFERENCES hotel_room_types(id),
    rate_plan_id VARCHAR(64) NOT NULL REFERENCES hotel_rate_plans(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    number_of_nights INT NOT NULL,
    number_of_rooms INT NOT NULL DEFAULT 1,
    adults INT NOT NULL DEFAULT 1,
    children INT NOT NULL DEFAULT 0,
    base_price_snapshot NUMERIC(12,2) NOT NULL,
    taxes_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    pricing_disclosure TEXT,
    booking_status VARCHAR(32) NOT NULL DEFAULT 'PENDING_PAYMENT',
    payment_status VARCHAR(32) NOT NULL DEFAULT 'UNPAID',
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(64),
    special_requests TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### `hotel_booking_allocations`
```sql
CREATE TABLE hotel_booking_allocations (
    id VARCHAR(64) PRIMARY KEY,
    booking_id VARCHAR(64) NOT NULL REFERENCES hotel_bookings(id) ON DELETE CASCADE,
    room_type_id VARCHAR(64) NOT NULL REFERENCES hotel_room_types(id),
    allocated_date DATE NOT NULL,
    units_allocated INT NOT NULL DEFAULT 1,
    allocation_status VARCHAR(32) NOT NULL DEFAULT 'RESERVED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_booking_room_date UNIQUE (booking_id, room_type_id, allocated_date)
);
```

---

## 4. API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/hotels/{hotelId}/bookings` | Create atomic room reservation | Traveler |
| `GET` | `/api/v1/bookings/my-bookings` | List authenticated traveler's bookings | Traveler |
| `GET` | `/api/v1/bookings/{bookingReference}` | Get booking details by reference | Traveler (Owner) / Admin |
| `POST` | `/api/v1/bookings/{bookingReference}/cancel` | Cancel booking & release inventory allocations | Traveler (Owner) |
| `GET` | `/api/v1/partner/hotels/{hotelId}/bookings` | List hotel bookings with masked traveler PII | Partner (Hotel Owner) |

---

## 5. Expiry & Cancellation Model

1. **Pending Expiry (30 Minutes)**:
   - When a booking is created, `expires_at = now() + 30 minutes`.
   - `HotelBookingService.checkAndExpireBookingIfPending(booking)` evaluates on-demand or periodic workers.
   - If `now() > expires_at` and `bookingStatus == PENDING_PAYMENT`, status transitions to `EXPIRED` and all allocations transition to `RELEASED`.
2. **User Cancellation**:
   - Traveler cancels via `POST /api/v1/bookings/{reference}/cancel`.
   - Status transitions to `CANCELLED`, `cancelled_at = now()`, all allocations transition to `RELEASED`.
   - Released allocations are immediately excluded from active reserved units, restoring nightly available capacity for other travelers.
