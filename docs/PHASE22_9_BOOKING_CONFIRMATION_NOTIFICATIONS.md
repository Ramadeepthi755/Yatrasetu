# Phase 22.9 — Hotel Booking Confirmation, Voucher & Notification Engine

## 1. Executive Summary

Phase 22.9 introduces an authoritative, server-driven confirmation experience, multi-party in-app notification engine, chronological status history timeline, and secure OpenPDF-generated PDF booking voucher/receipt system for verified hotel reservations.

All financial amounts, pricing provenance, tax disclosures, and cancellation policies are derived strictly from immutable booking snapshot records created during Phase 22.6 and verified during Phase 22.8. No prices, taxes, discounts, or external communications are fabricated.

---

## 2. Booking & Payment Invariant

A reservation displays **"Booking Confirmed"** and becomes eligible for official voucher generation **if and only if**:
- `bookingStatus == CONFIRMED`
- `paymentStatus == PAID`

### Strict State Mapping:
| Booking Status | Payment Status | UI Presentation | Actions |
|---|---|---|---|
| `CONFIRMED` | `PAID` | **Booking Confirmed · Payment Verified** | View Details, Download PDF Voucher, Cancel (if policy allows) |
| `PENDING_PAYMENT` | `UNPAID` / `PENDING` | **Payment Pending · Unpaid Reservation** | Pay Now / Retry Payment, Cancel Reservation |
| `EXPIRED` | `UNPAID` / `FAILED` | **Reservation Expired** | Search Again (Inventory Released) |
| `CANCELLED` | `PAID` | **Reservation Cancelled** | *Refund Processing Unautomated Disclosure* |
| `CANCELLED` | `UNPAID` | **Reservation Cancelled** | Inventory Released |

---

## 3. Customer-Facing Confirmation Identifier

- **Audit Decision**: The existing `bookingReference` (e.g., `YTS-2026-XXXXXX`) already fulfills all security and collision-safety requirements (server-generated, cryptographically random alphanumeric, non-sequential, immutable, and safe for sharing with hotel partners).
- To avoid duplicate identifiers, `bookingReference` serves directly as the customer-facing `confirmationNumber`.

---

## 4. Authoritative Confirmation Snapshot & Price/Tax Honesty

The confirmation snapshot (`BookingConfirmationDto`) encapsulates:
- **Property Details**: Hotel name, verified address, city, state, star rating, partner claim status.
- **Stay Details**: Check-in, check-out, duration in nights, room type, number of rooms, adults, children.
- **Guest Snapshot**: Primary guest full name, email, phone number, special requests.
- **Financial Snapshot**: Base price snapshot, configured taxes (`0.00` if unconfigured), fees (`0.00`), total amount, currency.
- **Honest Tax Disclosure**: If `taxesAmount == 0`, explicitly states *"Taxes and service fees are not currently configured/included in this baseline tariff."* Never manufactures GST or service fees.
- **Cancellation Policy Snapshot**: Preserves historical rate-plan cancellation policy string, type (`FREE_CANCELLATION` / `NON_REFUNDABLE`), and deadline hours from the booking record.

---

## 5. Chronological Booking Status Timeline

The booking timeline is derived from the immutable `hotel_booking_status_history` table:
1. `BOOKING_CREATED` / `PENDING_PAYMENT` (Initial inventory block and reservation creation)
2. `PAYMENT_VERIFIED` / `CONFIRMED` (Razorpay signature/webhook verification)
3. Lifecycle terminations: `CANCELLED` (with structured reason code) or `EXPIRED` (with allocation release reason).

---

## 6. Official PDF Booking Voucher Architecture

- Generated server-side using **OpenPDF 2.0.3** (`com.github.librepdf:openpdf:2.0.3`).
- **Endpoint**: `GET /api/v1/bookings/{bookingReference}/voucher`
- **Output**: `application/pdf` with `Content-Disposition: attachment; filename="YatraSetu-Voucher-{bookingReference}.pdf"`.
- **Security & RBAC**:
  - **Traveler**: Authorized only for bookings owned by the authenticated user.
  - **Hotel Partner**: Authorized only for bookings at properties owned by the partner.
  - **Government**: Denied individual traveler voucher access (403 Forbidden).
  - **Guest / Unauthenticated**: Denied (401 Unauthorized).
  - **Sensitive Data Exclusion**: Never embeds card numbers, CVVs, UPI IDs, Razorpay API secrets, or internal database sequential IDs.

---

## 7. Multi-Party In-App Notification Engine

- **Notification Creation**:
  - Emits traveler confirmation: *"Your hotel booking {ref} at {hotelName} is confirmed. Payment verified."*
  - Emits partner property owner notification: *"New confirmed reservation {ref} received for {hotelName} ({checkIn} to {checkOut}, {rooms} room(s))."*
- **Idempotency & Deduplication**:
  - Database-backed deduplication prevents duplicate notifications on repeated payment verification calls or duplicate webhook events.
- **Non-Blocking Delivery**:
  - Notification delivery failures are logged as warnings and never abort or rollback a confirmed booking transaction.
- **Read State Idempotency**:
  - `POST /api/v1/notifications/{id}/read` and `POST /api/v1/notifications/read-all` are strictly idempotent and enforce user ownership.

---

## 8. Boundaries & Honest Disclosures

- **Refund Boundary**: *"Phase 22.9 does not implement automated refunds. Payment was verified; cancellation refund processing is not automated in the current YatraSetu payment flow."*
- **Email/SMS Boundary**: *"Phase 22.9 provides in-app notification support and does not claim external email/SMS delivery."*
- **Catalog Dataset Integrity**: 1,007 catalog dataset hotels remain strictly read-only and non-bookable.

---

## 9. API Endpoints Reference

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/bookings/{ref}/confirmation` | Traveler Owner, Property Owner, Gov | Get authoritative confirmation snapshot & timeline |
| `GET` | `/api/v1/bookings/{ref}/voucher` | Traveler Owner, Property Owner | Download authoritative PDF voucher |
| `GET` | `/api/v1/notifications` | Authenticated User | Get user in-app notifications |
| `GET` | `/api/v1/notifications/unread-count` | Authenticated User | Get unread notification count |
| `POST` | `/api/v1/notifications/{id}/read` | Notification Owner | Mark notification as read |
| `POST` | `/api/v1/notifications/read-all` | Authenticated User | Mark all user notifications as read |
