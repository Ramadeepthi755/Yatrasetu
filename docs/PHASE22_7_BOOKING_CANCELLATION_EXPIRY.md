# Phase 22.7: Hotel Booking Cancellation & Expiry Hardening

> **Disclaimer**: Phase 22.7 hardens reservation lifecycles, allocation release, idempotency, and cancellation policies. **Phase 22.7 does not process real payments or refunds.** Payment gateway integration and refund execution belong to Phase 22.8.

---

## 1. Executive Summary

Phase 22.7 hardens the hotel booking engine by establishing a production-grade booking lifecycle state machine, deterministic allocation release, server-side cancellation policy snapshotting, structured cancellation reason codes, and dual-layer reservation expiry (background scheduler + lazy check on access).

All 1,007 catalog dataset hotels remain strictly non-bookable, and no fake payment or refund records are fabricated.

---

## 2. Booking Lifecycle & State Transition Matrix

### Formal State Machine

```
              ┌────────────────────────────────┐
              │                                │
              │        PENDING_PAYMENT         │
              │                                │
              └───────┬───────────┬────────────┘
                      │           │
          Payment     │           │  Expiry
          Success     │           │  Timeout
                      ▼           ▼
         ┌───────────────┐     ┌───────────────┐
         │               │     │               │
         │   CONFIRMED   │     │    EXPIRED    │
         │               │     │  (Terminal)   │
         └───────┬───────┘     └───────────────┘
                 │
      Traveler   │
      Cancel     │
                 ▼
         ┌───────────────┐
         │               │
         │   CANCELLED   │
         │  (Terminal)   │
         └───────────────┘
```

### Transition Validity Matrix

| Current State | Target: PENDING_PAYMENT | Target: CONFIRMED | Target: CANCELLED | Target: EXPIRED |
| :--- | :---: | :---: | :---: | :---: |
| **PENDING_PAYMENT** | N/A (Current) | Allowed (Payment) | Allowed (Cancellation) | Allowed (Timeout) |
| **CONFIRMED** | ❌ INVALID | N/A (Current) | Allowed (Subject to Policy) | ❌ INVALID |
| **CANCELLED** | ❌ INVALID | ❌ INVALID | N/A (Current / Idempotent) | ❌ INVALID |
| **EXPIRED** | ❌ INVALID | ❌ INVALID | ❌ INVALID | N/A (Current / Idempotent) |

State transitions are strictly verified via `HotelBooking.validateTransition(targetStatus)` and `canTransitionTo(targetStatus)`. Arbitrary status mutations through REST endpoints or database manipulations are rejected.

---

## 3. Booking Audit History

Every state change creates an immutable audit record in `hotel_booking_status_history` (Flyway `V25`):

```sql
CREATE TABLE hotel_booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES hotel_bookings(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    reason VARCHAR(100),
    actor_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

- Records capture `previous_status`, `new_status`, structured `reason`, `actor_user_id`, and `created_at`.
- No sensitive traveler PII or credentials are saved in audit history.
- Creation of the initial booking logs `previous_status = null` -> `new_status = PENDING_PAYMENT`.

---

## 4. Pending Reservation Expiry

1. **Configurable Expiry Duration**:
   - Config key: `app.hotel.booking.pending-expiry-minutes` (Default: `30` minutes).
   - Timestamp `expires_at` is computed on the server at reservation creation time (`now + expiryMinutes`). Frontend client timestamps are never trusted.
2. **Dual Expiry Mechanisms**:
   - **Background Job**: `HotelBookingExpiryScheduler` runs periodically (default: `app.hotel.booking.expiry-interval-ms: 60000`, 60s) to batch-expire stale reservations across the platform.
   - **Lazy Expiry on Access**: When fetching a booking by reference or ID, `checkAndExpireIfStale()` checks `expiresAt < now` and transactionally transitions stale reservations to `EXPIRED` before returning data.
3. **Inventory Release**:
   - On expiry, all active nightly allocations for that booking transition from `ACTIVE` / `RESERVED` to `RELEASED`.
   - Inventory is immediately freed up for other travelers.
   - Physical hotel inventory units (`total_units`, `blocked_units`) are never touched.

---

## 5. Cancellation Policy & Enforcement

### Server-Side Policy Snapshotting
When a booking is created, the active rate plan's cancellation policy is snapped into the booking record:
- `cancellation_policy_snapshot` (e.g. `FREE_CANCELLATION`, `NON_REFUNDABLE`, `PARTIAL_REFUND`, `CUSTOM`, `CANCELLATION_POLICY_UNAVAILABLE`)
- `cancellation_deadline_hours` (e.g. 24, 48 hours before check-in)
- Rate plans lacking a structured policy store `CANCELLATION_POLICY_UNAVAILABLE` honestly without asserting false guarantees.

### Structured Reason Codes (`CancellationReasonCode`)
- `TRAVELER_REQUEST`
- `PAYMENT_TIMEOUT`
- `PROPERTY_UNAVAILABLE`
- `SYSTEM_EXPIRY`
- `CHANGE_OF_PLANS`
- `FOUND_BETTER_PRICE`
- `OTHER`

User-provided reason notes are sanitized and length-capped (`<= 500` chars).

---

## 6. Allocation Release & Concurrency Safety

1. **Deterministic Release**:
   - Nightly allocations query: `findByBookingIdAndStatus(bookingId, AllocationStatus.ACTIVE)`
   - Status updated: `allocation.setStatus(AllocationStatus.RELEASED)`.
   - Availability calculation sums only `ACTIVE` allocations; `RELEASED` allocations have 0 impact on remaining capacity.
2. **PostgreSQL Pessimistic Locking**:
   - Booking creation uses `SELECT ... FOR UPDATE` on `HotelInventory` date range rows to prevent race conditions and overbooking.
   - Concurrent cancellations and creation requests are serialized safely via database transaction locks.
3. **Idempotency**:
   - Repeated cancellation calls on an already cancelled booking return the cancelled booking idempotently without double-releasing allocations or throwing 500 errors.
   - Repeated expiry calls execute as a no-op once allocations are marked `RELEASED`.
   - Creation requests with the same `Idempotency-Key` and matching request payload safely return the existing booking.

---

## 7. Security & RBAC Enforcement

- **Traveler Access**: Travelers can only cancel and view bookings where `booking.userId == authenticatedUserId`.
- **Partner Access**: Partners can view bookings for their verified hotel properties via `/api/v1/partner/hotels/{hotelId}/bookings`. Full traveler email and phone numbers are masked (`j***@example.com`, `+91 ******1234`). Partners cannot invoke traveler cancellation endpoints (returns 403 Forbidden).
- **Government / Admin**: Public operational or traveler endpoints are restricted with role checks.
- **Unauthenticated**: Returns 401 Unauthorized.

---

## 8. Frontend Implementation

1. **My Trips (`/trips`)**:
   - Clear badge indicators for `PENDING PAYMENT`, `CONFIRMED`, `CANCELLED`, `EXPIRED`.
   - Pending reservations display an interactive **Cancel** button opening a structured cancellation modal with reasons and confirmation.
   - Explicit disclaimer: *"Refund status unavailable until payment processing is implemented in Phase 22.8."*
2. **Partner Dashboard (`/partner/dashboard`)**:
   - Displays real-time booking statuses including `EXPIRED` and `CANCELLED`.
   - Traveler PII remains masked.

---

## 9. Verification & Test Evidence

### Backend Test Suites
- `Phase22_7HotelBookingLifecycleTest`: **12/12 passed**
  1. `pendingPaymentBooking_CanBeCancelled_AndAllocationsReleased`
  2. `cancellation_RestoresRoomAvailability`
  3. `cancellation_IsIdempotent`
  4. `expiredBooking_TransitionsToEXPIRED_AndReleasesAllocations`
  5. `expiredBooking_CannotBeCancelled_IntoCancelled`
  6. `expiredBooking_CannotBeConfirmed`
  7. `expiry_IsIdempotent`
  8. `datasetHotels_RemainStrictlyNonBookable`
  9. `travelerOwnership_EnforcedOnCancellation`
  10. `priceSnapshot_AndBookingReference_RemainImmutable`
  11. `concurrency_CancellationRaceWithNewBookingCreation_MaintainsInventoryIntegrity`
  12. `concurrentCancellations_SameBooking_HandledSafely`
- All Phase 22 Suites (`Phase22*`): **99/99 passed**
- Full Backend Test Suite: **230/230 passed**

### Frontend Verification
- `npm run lint`: **Passed (0 errors)**
- `npm run build`: **Passed (24/24 static/dynamic pages compiled cleanly)**

### Database Integrity
- Flyway migration `V25__hotel_booking_lifecycle_hardening.sql` validated and applied.
- Dataset hotels: exactly **1,007** preserved in database.
