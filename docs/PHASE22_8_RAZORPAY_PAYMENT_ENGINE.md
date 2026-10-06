# Phase 22.8: Real Razorpay Payment & Payment Reconciliation Engine

> **Disclaimer**: Phase 22.8 introduces real Razorpay Test/Sandbox-mode payment processing and reconciliation. Phase 22.8 uses Razorpay test/sandbox mode (`rzp_test_...`) unless explicitly configured otherwise in production environments. Refund execution is not automated in this phase; post-payment cancellations log operational reconciliation records.

---

## 1. Executive Summary

Phase 22.8 completes the transition from pending hotel reservations to confirmed bookings by implementing a secure, server-authoritative Razorpay Test-mode payment workflow. 

### Core Architectural Axioms
1. **Never Trust the Client**: Frontend callbacks, client-calculated amounts, or browser payment confirmations are never trusted. Bookings transition to `CONFIRMED` and payments to `PAID` **only** upon cryptographic HMAC-SHA256 signature verification on the Spring Boot backend or via authenticated Razorpay webhook delivery.
2. **Immutable Price Snapshots**: Payment amounts are strictly derived from the server's immutable booking snapshot (`total_amount` converted to minor unit paise: ₹100.00 $\rightarrow$ 10000 paise).
3. **Graceful Degradation**: If Razorpay credentials (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) are unconfigured, the application runs normally and reports payment features as honestly unavailable without fabricating fake transactions or dummy provider receipts.
4. **Dataset Hotel Safety**: All 1,007 catalog dataset hotels remain non-bookable with 0 payment orders allowed.

---

## 2. Booking and Payment State Machines

Booking lifecycle and payment lifecycle are decoupled but transactionally synchronized:

```
BOOKING STATUS:
                  ┌──────────────────────┐
                  │   PENDING_PAYMENT    │
                  └──────────┬───────────┘
                             │
            Verified Payment │ (Order + Verify Signature / Webhook)
                             ▼
                  ┌──────────────────────┐
                  │      CONFIRMED       │
                  └──────────┬───────────┘
                             │
            Traveler Cancel  │
                             ▼
                  ┌──────────────────────┐
                  │      CANCELLED       │
                  └──────────────────────┘

PAYMENT STATUS:
                  ┌──────────────────────┐
                  │        UNPAID        │
                  └──────────┬───────────┘
                             │ Order Created
                             ▼
                  ┌──────────────────────┐
                  │       PENDING        │
                  └─────┬──────────┬─────┘
                        │          │
        Signature Valid │          │ Payment Failed
                        ▼          ▼
             ┌────────────┐      ┌────────────┐
             │    PAID    │      │   FAILED   │
             └────────────┘      └─────┬──────┘
                                       │ Retry Payment
                                       ▼
                                 ┌────────────┐
                                 │  PENDING   │
                                 └────────────┘
```

---

## 3. Database Model & Schema Migration (Flyway V26)

Migration `V26__hotel_payment_transactions.sql` provisions two dedicated tables:

### `hotel_payment_transactions`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | VARCHAR(50) PRIMARY KEY | Internal unique transaction ID (`tx-...`) |
| `booking_id` | VARCHAR(50) NOT NULL REFERENCES hotel_bookings(id) | Associated hotel reservation |
| `provider` | VARCHAR(50) NOT NULL | Payment provider (`RAZORPAY`) |
| `provider_order_id` | VARCHAR(100) NOT NULL UNIQUE | Razorpay Order ID (`order_...`) |
| `provider_payment_id` | VARCHAR(100) UNIQUE | Razorpay Payment ID (`pay_...`) |
| `provider_signature` | VARCHAR(255) | HMAC-SHA256 signature received from client |
| `amount` | DECIMAL(12, 2) NOT NULL | Server-authoritative transaction amount |
| `currency` | VARCHAR(10) NOT NULL | Currency code (`INR`) |
| `status` | VARCHAR(50) NOT NULL | `UNPAID`, `PENDING`, `PAID`, `FAILED`, `REFUNDED` |
| `failure_code` | VARCHAR(100) | Gateway error code (e.g. `BAD_REQUEST_ERROR`) |
| `failure_description`| TEXT | Human-readable failure description |
| `idempotency_key` | VARCHAR(100) UNIQUE | Optional idempotency key |
| `verified_at` | TIMESTAMPTZ | Timestamp of server signature verification |
| `created_at`, `updated_at` | TIMESTAMPTZ | Audit timestamps |

### `hotel_payment_webhook_events` (Durable Deduplication)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | VARCHAR(50) PRIMARY KEY | Unique webhook processing record ID |
| `event_id` | VARCHAR(100) NOT NULL UNIQUE | Razorpay event identifier (`evt_...`) |
| `event_type` | VARCHAR(100) NOT NULL | `payment.captured`, `order.paid`, `payment.failed` |
| `provider` | VARCHAR(50) NOT NULL | `RAZORPAY` |
| `payload_hash` | VARCHAR(64) | SHA-256 hash of webhook payload |
| `status` | VARCHAR(50) NOT NULL | `PROCESSED`, `IGNORED`, `FAILED` |
| `processed_at` | TIMESTAMPTZ | Timestamp of successful webhook execution |

---

## 4. Payment Lifecycle & API Endpoints

### 1. Order Creation
- **Endpoint**: `POST /api/v1/bookings/{bookingReference}/payment/order`
- **Security**: `hasRole('TRAVELER')` + Booking ownership check.
- **Workflow**:
  1. Validates that booking exists, belongs to caller, is in `PENDING_PAYMENT` status, and has not expired.
  2. Multiplies authoritative `booking.totalAmount` by 100 to obtain `amountInPaise` (`Long`).
  3. Reuses an active pending order if already created, or calls Razorpay `/v1/orders` API via `PaymentProvider`.
  4. Stores transaction in `hotel_payment_transactions` with `status = PENDING`.
  5. Returns `providerOrderId`, `keyId`, `amountInPaise`, and `currency`.

### 2. Signature Verification & Confirmation
- **Endpoint**: `POST /api/v1/bookings/{bookingReference}/payment/verify`
- **Security**: `hasRole('TRAVELER')` + Booking ownership check.
- **Payload**: `{ razorpayOrderId, razorpayPaymentId, razorpaySignature }`
- **Workflow**:
  1. Calculates `HMAC-SHA256(orderId + "|" + paymentId, keySecret)`.
  2. Compares signature in constant time with `MessageDigest.isEqual()`.
  3. If invalid, marks transaction as `FAILED` and rejects with `409 Conflict`.
  4. If valid, performs an atomic database transaction:
     - Updates `HotelBooking`: `bookingStatus = CONFIRMED`, `paymentStatus = PAID`.
     - Updates `HotelPaymentTransaction`: `status = PAID`, `verifiedAt = now()`.
     - Records immutable audit history in `hotel_booking_status_history` (`PAYMENT_VERIFIED`).
     - Emits in-app traveler notification.
  5. Idempotent: Repeated verification with the same payment ID returns the confirmed booking safely.

### 3. Webhook Handling
- **Endpoint**: `POST /api/v1/payments/razorpay/webhook`
- **Security**: Validates header `X-Razorpay-Signature` against `RAZORPAY_WEBHOOK_SECRET`.
- **Workflow**:
  1. Computes `HMAC-SHA256(payload, webhookSecret)` and rejects invalid payloads with `400 Bad Request`.
  2. Checks `hotel_payment_webhook_events` for `eventId` unique constraint (deduplicating redundant delivery).
  3. Reconciles `payment.captured` / `order.paid` to confirm pending bookings.
  4. Records `payment.failed` with gateway failure codes.

---

## 5. Concurrency & Race Condition Handlers

1. **Concurrent Duplicate Verification Requests**:
   - Multiple simultaneous verification requests for the same order/booking are serialized via database transactions. Only the first transitions state and writes audit logs; subsequent requests return the existing confirmed state idempotently.
2. **Late Payment After Expiry**:
   - If payment verification arrives after booking was marked `EXPIRED` (and allocations were released), the booking **remains EXPIRED**. Inventory is **not** resurrected. The transaction is logged with reason `LATE_PAYMENT_RECONCILIATION_REQUIRED` for operational handling.
3. **Late Payment After Cancellation**:
   - If payment verification arrives after booking was cancelled, the booking **remains CANCELLED**.

---

## 6. Frontend Integration

1. **My Trips (`/trips`)**:
   - `PENDING_PAYMENT`: Displays "Payment Pending · Unpaid Reservation" and an interactive **Pay Now** button.
   - Dynamically loads `https://checkout.razorpay.com/v1/checkout.js` in Test mode upon click.
   - Prevents duplicate clicks with local processing state (`payingBookingRef`).
   - Automatically invokes server-side verification upon successful checkout.
   - `CONFIRMED`: Displays "Booking Confirmed · Payment Verified" green badge.
   - `FAILED`: Displays "Payment Failed" with "Retry Payment" option.
2. **Partner Dashboard (`/partner/dashboard`)**:
   - Displays real-time booking and payment status (`PAID`, `UNPAID`, `PENDING`, `FAILED`).
   - Maintains full traveler PII masking (`j***@example.com`, `+91 ******1234`).

---

## 7. Verification Evidence

### Backend Test Results
- `Phase22_8HotelPaymentEngineTest`: **12/12 PASSED**
- All Phase 22 Suites (`Phase22*`): **111/111 PASSED**
- Full Backend Test Suite: **242/242 PASSED**

### Frontend Lint & Build
- `npm run lint`: **0 errors**
- `npm run build`: **24/24 pages compiled cleanly**

### Database Integrity
- Flyway migration `V26__hotel_payment_transactions.sql` applied.
- Dataset hotels: exactly **1,007** preserved (0 fake transactions inserted).
