# Phase 22.2 — Real Hotel Partner Onboarding & Verification Model

**Project:** YatraSetu  
**Phase:** 22.2  
**Status:** GREEN  
**Date:** September 2026  

---

## 1. Problem Statement Alignment

> **"Student Innovation – A solution/idea that can boost the current situation of the tourism industries including hotels, travel and others."**

The Indian hospitality industry outside major metropolitan chains—consisting of regional boutique stays, heritage havelis, authentic homestays, and local guest houses—faces severe discoverability and credibility barriers on global aggregator platforms. Often, these authentic accommodation businesses are marginalized by high commission gatekeepers or overshadowed by unverified, scraped listings that promise fake availability.

Phase 22.2 establishes an authentic, supply-side **Hotel Partner Onboarding & Verification Ecosystem** on YatraSetu. It allows real hoteliers and homestay hosts to join using the existing `ROLE_PARTNER` role, register legitimate property specifications under strict server-side ownership, progress through a transparent verification lifecycle reviewed by authorized Government tourism boards, and earn an official **YatraSetu Verified Partner** trust seal. Crucially, it preserves data honesty by drawing strict boundaries against fake live inventory, fake real-time room counts, or fake instant bookings.

---

## 2. Hotel Partner Architecture & Identity

### 2.1 Role & Subtype Reuse
- **No Duplicate Role Created:** Utilizes the established `ROLE_PARTNER` without creating `ROLE_HOTEL`.
- **Subtype Support:** Supports `PartnerSubtype.HOTEL` and `PartnerSubtype.HOMESTAY` in existing partner profile models.
- **Identity Linkage:**
  $$\text{User} \xrightarrow{\text{ROLE\_PARTNER}} \text{Partner Profile} \xrightarrow{\text{owner\_id}} \text{Hotel / Accommodation Listing}$$

### 2.2 Server-Side Ownership Rules
1. **Creation:** A partner with `ROLE_PARTNER` can register a hotel property. The authenticated user ID is automatically assigned as `owner_id` (derived exclusively from the Spring Security `Authentication` context).
2. **Access & Mutation:**
   - Partner A can modify and delete properties where `hotel.owner_id == authenticatedUserId`.
   - Partner A attempting to edit Partner B's property returns `403 FORBIDDEN`.
   - Travelers attempting to mutate properties return `403 FORBIDDEN`.
   - Unauthenticated requests return `401 UNAUTHORIZED`.
3. **No Client ID Trust:** Request bodies and headers containing `ownerId` or `partnerId` are ignored; identity is resolved from server-side JWT authentication principal.

---

## 3. Property Lifecycle & State Machine

The verification state machine is strictly defined by the `HotelVerificationStatus` enum:

```
[ UNVERIFIED / DRAFT ]
        │
        │ Partner clicks "Submit for Verification"
        ▼
[ PENDING_REVIEW ]
   │           │
   │ Approve   │ Reject (with mandatory audit reason)
   ▼           ▼
[ VERIFIED ]   [ REJECTED ] ──(Partner edits details)──► [ UNVERIFIED / DRAFT ]
   │
   │ Suspend (Authority action)
   ▼
[ SUSPENDED ]
```

### Re-Verification Trigger for Verified Properties
When a `VERIFIED` property has sensitive operational fields modified by its owner:
- Fields: `hotelName`, `cityId`, `address`, `category`
- Action: Status automatically transitions back to `PENDING_REVIEW` with an audit note recorded in `verificationNotes` indicating re-submission due to property detail alteration.

---

## 4. Property Provenance vs. Verification Distinction

YatraSetu maintains absolute separation between **Source Provenance** and **Partner Verification**:

| Entity State | `source_type` | `owner_id` | `is_partner_property` | `verification_status` | Public Traveler Presentation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dataset Hotel** | `DATASET` | `NULL` | `false` | `UNVERIFIED` | Standard property information; no partner badge; explicit dataset provenance |
| **Partner Draft** | `PARTNER_SUBMITTED` | `User.id` | `true` | `UNVERIFIED` | Hidden from verified partner queries; visible in owner's Partner Hub |
| **Partner In Review**| `PARTNER_SUBMITTED` | `User.id` | `true` | `PENDING_REVIEW` | Hidden from verified partner queries; in Government Verification Queue |
| **Verified Partner Stay**| `PARTNER_SUBMITTED` | `User.id` | `true` | `VERIFIED` | Displays **YatraSetu Verified Partner** trust seal; contact & booking enquiry details |
| **Rejected / Suspended**| `PARTNER_SUBMITTED` | `User.id` | `true` | `REJECTED` / `SUSPENDED` | Excluded from verified public search |

---

## 5. Government Verification Workflow

Authorized Regional Tourism Authority / Government officials (`ROLE_GOVERNMENT`) have access to the dedicated **Hotel & Accommodation Partner Verification Queue**:

1. **Queue Inspection:** Fetches all properties in `PENDING_REVIEW` status (`GET /api/v1/government/hotels/pending`).
2. **Audit Parameters:** Displays property name, accommodation type, state/city, physical address, GPS coordinates, owner details, contact phone, contact email, website, and submission timestamp.
3. **Review Actions:**
   - **Approve:** Transitions status to `VERIFIED`, populates `verified_by` (auditor username/ID) and `verified_at` (server timestamp), and stores verification notes.
   - **Reject:** Transitions status to `REJECTED`, requires `rejectionReason`, which is immediately rendered in the partner's hub so they can rectify issues.
   - **Suspend:** Transitions status to `SUSPENDED` if hospitality standards or safety compliance are violated.
4. **Self-Verification Prevention:** Partners attempting to call Government review endpoints return `403 FORBIDDEN`.

---

## 6. Geographic Validation & Duplicate Protection

- **City & State Integrity:** Server-side verification confirms that the specified `cityId` exists within the active geographical hierarchy and matches destination linkage if provided.
- **Coordinate Boundary Checks:** Validates that submitted latitudes [6.0°N – 38.0°N] and longitudes [68.0°E – 98.0°E] fall within legitimate Indian territorial bounds.
- **Duplicate Protection:** Prevents duplicate listings by validating normalized `(hotelName, cityId)` tuples during partner registration. If a similar property already exists, a clear validation conflict is returned.

---

## 7. Data Honesty & Future Inventory Boundary

Phase 22.2 strictly forbids and prevents:
- **No Fake Real-Time Availability:** Does not state "3 rooms left" or "Available tonight" without live PMS integration.
- **No Fake Dynamic Pricing:** Displays honest base/indicative room rates and booking enquiry contact numbers without fabricated countdown discounts.
- **No Fake Instant Booking Engine:** Travelers can contact verified partner properties directly; transactional room booking engines remain deferred to future Phase 22 inventory stages.
- **No False Government Certification Claims:** Uses the precise badge **"YatraSetu Verified Partner"** (verified via platform review workflow) rather than claiming non-existent Ministry of Tourism certification.
