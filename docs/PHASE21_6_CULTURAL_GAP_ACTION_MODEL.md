# Phase 21.6 — Cultural Ecosystem Gap & Government Action Engine Model

## 1. Problem & Context
In Phase 21.5, YatraSetu introduced the **Cultural Opportunity Score** and **Cultural Supply/Demand Matrix**, which deterministically identified cultural heritage potential across 164 monitored destinations in India based on:
$$\text{Cultural Opportunity Score} = \min\Big(100, \max\big(0, \text{Tradition} + \text{Demand} + \text{Supply} - \text{GapPenalty}\big)\Big)$$

However, analytics and scorecards alone do not enable regional tourism boards and authorities to take operational action. Phase 21.6 elevates the platform from pure opportunity identification to platform-derived **Ecosystem Gap Detection**, **Government Action Recommendation**, and **Action Lifecycle Tracking**.

---

## 2. Existing Architecture Reused
Phase 21.6 rigorously builds on the proven foundation of YatraSetu:
- **`CulturalTradition`** (V16 & V17): 100 source-backed heritage traditions across all 36 States & UTs (71 GI-tagged).
- **`Experience` & `LocalHost`** (V16 & V18): Verified artisan workshops and cultural master hosts.
- **`tourism_ecosystem_gaps`** (V15): Reused schema for storing detected bottlenecks.
- **`tourism_government_actions`** (V15): Reused schema for idempotent lifecycle tracking (`LOGGED`/`OPEN`, `IN_PROGRESS`, `RESOLVED`, `DISMISSED`).
- **`CulturalOpportunityService`** (Phase 21.5): In-memory bulk evaluation of tradition, demand, and supply signals.
- **`GovernmentCulturalOpportunityController`** (Phase 21.5): Official RBAC baseline (`ROLE_GOVERNMENT`).

---

## 3. Cultural Ecosystem Gap Definitions

Phase 21.6 defines six deterministic ecosystem gaps:

| Gap Type | Trigger Conditions | Example Wording / Evidence |
| :--- | :--- | :--- |
| **`CULTURAL_EXPERIENCE_DEFICIT`** | Authentic cultural traditions $> 0$, observed platform demand $\ge 10$, and verified cultural experiences $= 0$. | *"High cultural opportunity and observed platform demand coexist with 0 verified cultural experiences in YatraSetu."* |
| **`ARTISAN_PARTNER_DEFICIT`** | Authentic traditions $> 0$ (especially GI-tagged) and verified artisan partners $= 0$. | *"Heritage cultural craft traditions exist with 0 verified local artisan partners on YatraSetu."* |
| **`CONNECTIVITY_GAP`** | Nearest airport/railway distance $> 100\text{ km}$ or poor/remote road connectivity with active traveler demand. | *"Traveler interest exists for remote cultural hub; last-mile transport infrastructure remains constrained."* |
| **`STAYS_DEFICIT`** | Destination has active demand and cultural significance, but YatraSetu hotel/homestay listings $\le 1$. | *"YatraSetu accommodation coverage is insufficient to absorb potential cultural visitors."* |
| **`GUIDE_HOST_DEFICIT`** | Observed demand $\ge 15$ and verified local hosts $\le 1$. | *"YatraSetu verified host coverage is insufficient for personalized cultural interpretation."* |
| **`CULTURAL_DATA_GAP`** | Monitored destination with 0 structured cultural tradition mappings. | *"Rich regional cultural heritage with insufficient structured cultural tradition documentation on YatraSetu."* |

---

## 4. Gap Severity Calculation Rules

Gap severity is deterministic and explainable without hidden heuristics or AI multipliers:

- **`CRITICAL`**: Cultural Opportunity Score $\ge 75$ AND `verifiedExperiences == 0` (or `observedDemandSignals >= 25` with 0 experiences).
- **`HIGH`**: Cultural Opportunity Score $\ge 50$ (or `observedDemandSignals >= 15` with supply deficit).
- **`MEDIUM`**: Cultural Opportunity Score $\ge 30$ (or emerging cultural hub with lower demand).
- **`LOW`**: Cultural Opportunity Score $< 30$ with modest potential.
- **`INSUFFICIENT_DATA`**: Destination lacks sufficient signal volume to make an honest assessment.

---

## 5. Government Action Engine & Priority Rules

For each detected gap, the engine generates an actionable, platform-derived intervention recommendation:

### Recommended Interventions
1. **`CULTURAL_EXPERIENCE_DEFICIT`** $\to$ *"Prioritize onboarding and verification of authentic cultural experiences and workshops."*
2. **`ARTISAN_PARTNER_DEFICIT`** $\to$ *"Identify and onboard eligible artisan/community craft clusters for heritage monetization."*
3. **`CONNECTIVITY_GAP`** $\to$ *"Review last-mile connectivity information and potential visitor access improvements."*
4. **`STAYS_DEFICIT`** $\to$ *"Encourage verified accommodation ecosystem participation where appropriate."*
5. **`GUIDE_HOST_DEFICIT`** $\to$ *"Encourage qualified local cultural guide/host participation."*
6. **`CULTURAL_DATA_GAP`** $\to$ *"Conduct structured cultural documentation and heritage mapping."*

### Action Priority Matrix
$$\text{Priority} = \begin{cases} 
\text{CRITICAL}, & \text{if Severity is CRITICAL or (Opportunity} \ge 80 \text{ and Demand} \ge 20) \\
\text{HIGH}, & \text{if Severity is HIGH or Opportunity} \ge 60 \\
\text{MEDIUM}, & \text{if Severity is MEDIUM or Opportunity} \ge 40 \\
\text{LOW}, & \text{otherwise}
\end{cases}$$

---

## 6. Action Lifecycle & Deduplication

### Deterministic Identity
Each platform-generated action has a unique, deterministic synthetic ID:
$$\text{Action ID} = \text{act-cult-}\{\text{destinationId}\}\text{-}\{\text{gapType}\}$$

### Idempotency & Deduplication Rules
- When `/api/v1/government/cultural-actions/generate` or synchronization runs, existing actions with status `OPEN`, `IN_PROGRESS`, `RESOLVED`, or `DISMISSED` are preserved.
- Existing resolution notes, timestamps, and officer attribution are **never overwritten**.
- No duplicate rows are created in the database or response lists on repeated requests.

### State Transitions
$$\text{OPEN} \rightleftharpoons \text{IN_PROGRESS} \longrightarrow \text{RESOLVED} \quad (\text{or } \text{DISMISSED})$$

---

## 7. API Contracts & RBAC

All endpoints are protected by `@PreAuthorize("hasRole('GOVERNMENT')")`:

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/government/cultural-actions/gaps` | List detected cultural ecosystem gaps | 200 (Gov), 401 (Guest), 403 (Other) |
| `GET` | `/api/v1/government/cultural-actions/gaps/overview` | Aggregated counts & breakdown of gaps | 200 (Gov), 401 (Guest), 403 (Other) |
| `GET` | `/api/v1/government/cultural-actions/gaps/destination/{id}` | Gaps for a specific destination | 200 (Gov), 401 (Guest), 403 (Other) |
| `GET` | `/api/v1/government/cultural-actions` | Filtered list of cultural government actions | 200 (Gov), 401 (Guest), 403 (Other) |
| `GET` | `/api/v1/government/cultural-actions/{id}` | Detailed action record | 200 (Gov), 401 (Guest), 403 (Other) |
| `POST` | `/api/v1/government/cultural-actions/generate` | Trigger bulk deterministic action generation | 200 (Gov), 401 (Guest), 403 (Other) |
| `PATCH`| `/api/v1/government/cultural-actions/{id}/status` | Update lifecycle status & resolution notes | 200 (Gov), 401 (Guest), 403 (Other) |

---

## 8. Data Honesty & Provenance

### Strict Linguistic Honesty
- ✅ *"YatraSetu verified cultural experience coverage is insufficient"*
- ❌ *"No cultural experiences exist."*
- ✅ *"YatraSetu accommodation coverage is insufficient"*
- ❌ *"No hotels exist."*
- ✅ *"YatraSetu verified host coverage is insufficient"*
- ❌ *"There are no guides in this destination."*

### Provenance Tracking
All action outputs include explicit metadata:
- `provenance: "PLATFORM_DERIVED"`
- `dataMode: "OBSERVED"` (or `"DEMO"` when explicitly toggled)
- `honestyDisclaimer`: Transparent declaration that recommendations represent platform-derived decision support and not official state directives.

---

## 9. Performance & Bulk Processing
- Avoids $N+1$ query loops by fetching destinations, traditions, demand signals, hosts, and experiences in batch repository queries.
- In-memory scoring and gap evaluation processes all 164 monitored destinations in $< 50\text{ ms}$.
