# Phase 22.5: Date-Specific Real Hotel Availability Model

## 1. Architectural Overview

Phase 22.5 implements the **Date-Specific Real Hotel Availability Engine** for YatraSetu, providing a mathematically sound, tamper-proof, multi-night stay availability calculation engine without generating synthetic bookings, fake inventory, or fabricated room types.

```
Hotel Property
  │
  ├── Room Types (Deluxe, Suite, Standard)
  │     │
  │     ├── Physical Inventory Pool
  │     │     ├── Baseline Capacity (inventory_date IS NULL)
  │     │     └── Date-Specific Overrides (inventory_date = 'YYYY-MM-DD')
  │     │
  │     └── Rate Plans (Flexible, Non-Refundable, Breakfast Included)
  │           └── [Draws from same physical inventory pool; does NOT multiply units]
  │
  └── Availability Engine (Evaluates [checkIn, checkOut) night by night)
        └── availableUnits(date) = effectiveTotal(date) - blocked(date) - reserved(date [=0 in 22.5])
```

---

## 2. Mathematical Availability Formulation

### 2.1 Date Semantics & Window
- For stay dates `[checkIn, checkOut)`:
  - `checkIn` is **inclusive**.
  - `checkOut` is **exclusive** (checkout morning; guests vacate rooms).
  - Total evaluated nights: $N = \text{checkOut} - \text{checkIn}$.

### 2.2 Nightly Capacity Calculation
For each requested night $d \in [\text{checkIn}, \text{checkOut})$:
$$\text{effectiveTotalUnits}(d) = \begin{cases} \text{dateSpecific.totalUnits}(d) & \text{if date-specific record exists for } d \\ \text{baseline.totalUnits} & \text{otherwise} \end{cases}$$
$$\text{effectiveBlockedUnits}(d) = \begin{cases} \text{dateSpecific.blockedUnits}(d) & \text{if date-specific record exists for } d \\ \text{baseline.blockedUnits} & \text{otherwise} \end{cases}$$
$$\text{reservedUnits}(d) = 0 \quad (\text{Phase 22.6 reserved architectural boundary})$$
$$\text{availableUnits}(d) = \max(0, \text{effectiveTotalUnits}(d) - \text{effectiveBlockedUnits}(d) - \text{reservedUnits}(d))$$

### 2.3 Multi-Night Stay Overall Room Availability
$$\text{overallAvailableUnits} = \min_{d \in [\text{checkIn}, \text{checkOut})} \text{availableUnits}(d)$$

---

## 3. Rate Plan & Physical Inventory Separation

1. **Independent Concepts**:
   - Physical inventory represents real physical rooms (walls, beds, keys).
   - Rate plans represent commercial pricing conditions, meal plans, and cancellation terms.
2. **No Multiplicative Inventory**:
   - A room type with 4 available physical units and 3 active rate plans (e.g. EP ₹4,500, CP ₹5,000, MAP ₹6,200) still has **4 available physical units**.
   - Availability is computed on the physical room type pool.

---

## 4. Availability Status Lifecycle

| Status | Condition | Description |
|---|---|---|
| `AVAILABLE` | $\text{overallAvailableUnits} > 2$ | Comfortable physical inventory available across all requested nights. |
| `LIMITED` | $0 < \text{overallAvailableUnits} \le 2$ | Low physical inventory left across stay window. |
| `SOLD_OUT` | $\text{overallAvailableUnits} = 0$ (inventory exists) | All units are blocked/booked on one or more stay nights. |
| `UNAVAILABLE_DATA` | No legitimate room types or inventory records exist | Honest status for dataset catalog properties. |

---

## 5. Dataset Hotel Isolation & Data Honesty

- **Dataset Properties (1,007 properties)**:
  - Do NOT have synthetic room types.
  - Do NOT have synthetic inventory rows.
  - Do NOT generate fake availability badges or countdown timers.
  - Public availability API honestly returns:
    ```json
    {
      "status": "UNAVAILABLE_DATA",
      "isLiveAvailability": false,
      "provenance": "DATASET",
      "note": "Live availability is not currently provided for this dataset property.",
      "rooms": []
    }
    ```

---

## 6. Batch Querying & Performance Architecture

- To prevent $O(N)$ database roundtrips across multi-night stays:
  - `findByRoomTypeIdInAndInventoryDateBetween(roomTypeIds, startDate, endDate)` fetches all relevant date-specific overrides in a single SQL query.
  - `findByRoomTypeIdInAndInventoryDateIsNull(roomTypeIds)` fetches baseline capacities in a single SQL query.
  - In-memory date resolution builds the continuous calendar map per room type.

---

## 7. Security & Partner Authorization

- **Server-Side Verification**:
  - `hotel.getOwner().getEmail().equals(authenticatedUserEmail)` strictly validated.
  - Partner A receives `403 AccessDeniedException` when attempting to query or update Partner B's inventory.
  - Bounds clamping ensures `totalUnits >= 0`, `blockedUnits >= 0`, and `blockedUnits <= totalUnits`.

---

## 8. Phase 22.6 Readiness

The engine is structured with `reservedUnits = 0` as an explicit architectural boundary. When Phase 22.6 is introduced, `HotelAvailabilityService` can incorporate real active reservation holds into the subtraction formula without breaking the foundational inventory model.
