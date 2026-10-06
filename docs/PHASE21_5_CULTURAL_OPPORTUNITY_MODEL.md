# YATRASETU CULTURAL OPPORTUNITY SCORING & SUPPLY/DEMAND MODEL
## TECHNICAL SPECIFICATION & ALGORITHMIC ARCHITECTURE

**Project:** YatraSetu  
**Tagline:** "Discover India. Connect Locally. Grow Tourism."  
**Phase:** 21.5 (Cultural Opportunity Score & Cultural Supply/Demand Intelligence)  
**Classification:** YatraSetu Platform-Derived Intelligence Proxy  
**Date:** September 6, 2026  

---

## 1. Model Objective & Boundaries

The **YatraSetu Cultural Opportunity Score** is a deterministic intelligence metric designed to answer a central decision-support question for regional tourism authorities:

> *"Where does the YatraSetu platform identify the highest potential to connect traveler tourism demand with authentic local cultural traditions and artisan experience supply?"*

### Mandatory Disclaimers & Integrity Constraints
- **Platform-Derived Intelligence Proxy:** The Cultural Opportunity Score is derived from platform-recorded authentic cultural assets, observed traveler activity, and verified experience capacity.
- **NOT Official Economic Data:** The score does NOT represent official GDP, physical sensor footfall, government arrivals census, tax revenue, or guaranteed income.
- **Strictly Deterministic Math:** Scoring is calculated purely via closed-form deterministic arithmetic without generative AI hallucinations or non-reproducible model outputs.
- **Production Isolation:** By default, scores exclude demo data (`includeDemo = false`).

---

## 2. Mathematical Formulation

The Cultural Opportunity Score is defined on the closed interval $[0, 100]$:

$$\text{Cultural Opportunity Score} = \min\left(100, \max\left(0, T + D + S - P_{\text{gap}}\right)\right)$$

Where:
- $T \in [0, 30]$: **Tradition Component** (Strength of localized authentic cultural assets)
- $D \in [0, 35]$: **Demand Component** (Normalized traveler tourism interest)
- $S \in [0, 25]$: **Supply Component** (Opportunity headroom for artisan experience supply)
- $P_{\text{gap}} \in [0, 20]$: **Gap Penalty** (Identified ecosystem bottlenecks and deficits)

---

## 3. Component Details & Normalization

### A. Tradition Component ($T \in [0, 30]$)
Measures the localized density and statutory protection (GI-tags) of source-backed cultural traditions associated with a destination node $d$:

$$T = \min\left(30.0, \, 10.0 \cdot N_{\text{dest}} + 6.0 \cdot N_{\text{city}} + \min(8.0, 2.0 \cdot N_{\text{state}}) + 2.0 \cdot N_{\text{GI}}\right)$$

- **$N_{\text{dest}}$ (Destination-linked traditions):** Strongest local connection ($10.0$ pts each).
- **$N_{\text{city}}$ (City-linked traditions):** Urban cluster connection ($6.0$ pts each).
- **$N_{\text{state}}$ (State-level contextual traditions):** Contextual regional presence ($2.0$ pts each, capped at $8.0$ pts max to avoid inflating destinations with distant state traditions).
- **$N_{\text{GI}}$ (Geographical Indication bonus):** $+2.0$ pts per GI-tagged tradition protected under the GI Act 1999.

---

### B. Demand Component ($D \in [0, 35]$)
Measures recent planning activity (itinerary saves, travel connect requests, search volume) on the YatraSetu platform for destination $d$:

$$D = \min\left(35.0, \, \left(\frac{\text{Signals}(d)}{\max_{k}(\text{Signals}(k), 1)}\right) \times 35.0\right)$$

- **Signals Filter:** Filtered strictly by source provenance. Default production scoring uses `sourceType = OBSERVED`. Demo signals (`sourceType = DEMO`) are incorporated only when `includeDemo = true`.
- **Relative Normalization:** Scaled linearly against the platform's peak destination activity to avoid arbitrary static thresholds.

---

### C. Supply Component ($S \in [0, 25]$)
Measures the headroom and opportunity to supply new verified cultural experiences:

$$S = \begin{cases}
25.0 & \text{if } E_{\text{verified}} = 0 \quad (\text{Maximum expansion opportunity}) \\
18.0 & \text{if } E_{\text{verified}} = 1 \\
12.0 & \text{if } E_{\text{verified}} = 2 \\
8.0 & \text{if } E_{\text{verified}} = 3 \\
5.0 & \text{if } E_{\text{verified}} \ge 4 \quad (\text{Mature supply baseline})
\end{cases}$$

- **Supply vs. Opportunity Semantics:** In an opportunity model, destinations with zero or low verified experiences have the highest room for new artisan onboarding and workshop creation. As the ecosystem matures with multiple verified workshops, the opportunity component transitions from new creation to incremental optimization.

---

### D. Gap Penalty ($P_{\text{gap}} \in [0, 20]$)
Applies targeted deductions when structural bottlenecks hinder the realization of cultural tourism:

$$P_{\text{gap}} = \min(20.0, \, P_{\text{exp\_deficit}} + P_{\text{artisan\_deficit}} + P_{\text{connectivity}})$$

1. **Cultural Experience Deficit ($P_{\text{exp\_deficit}} = 10.0$ pts):**
   - Trigger: $N_{\text{traditions}} \ge 1 \land (\text{Signals} \ge 3 \lor D \ge 8.0) \land E_{\text{verified}} = 0$.
   - Authentic heritage assets exist alongside active traveler demand, but 0 verified cultural experiences are listed.
2. **Artisan Partner Deficit ($P_{\text{artisan\_deficit}} = 5.0$ pts):**
   - Trigger: $N_{\text{traditions}} \ge 1 \land H_{\text{artisan}} = 0$.
   - No verified artisan hosts registered in the local destination cluster.
3. **Connectivity Constraint ($P_{\text{connectivity}} = 5.0$ pts):**
   - Trigger: Destination accessibility is classified as "Difficult" or transit nodes $\le 1$.

---

## 4. Insufficient Data Protocol

When a destination has:
$$\text{Total Traditions} = 0 \quad \land \quad \text{Observed Demand Signals} = 0$$

- **Status:** `INSUFFICIENT_DATA`
- **Score:** `null` (Never output a misleading `0/100` or fabricated baseline)
- **Confidence:** `INSUFFICIENT`
- **Explanation:** *"Insufficient production data to calculate a reliable Cultural Opportunity Score."*

---

## 5. Confidence Levels

| Confidence Level | Criteria |
|---|---|
| **HIGH** | $\ge 1$ destination-linked tradition, $\ge 4$ observed demand signals, complete transport metadata. |
| **MEDIUM** | $\ge 1$ city/state-level tradition, $\ge 1$ observed demand signal. |
| **LOW** | Only contextual state traditions or 0 demand signals recorded. |
| **INSUFFICIENT** | Missing baseline traditions and demand signals. |

---

## 6. Cultural Supply / Demand Matrix

To support strategic government decision-making, destinations are mapped into a 4-quadrant matrix:

```
                      LOW SUPPLY (E_verified ≤ 1)       HIGH SUPPLY (E_verified ≥ 2)
HIGH DEMAND (D ≥ 12)  [HIGH DEMAND • LOW SUPPLY]        [HIGH DEMAND • HIGH SUPPLY]
                      → High Opportunity / Deficit      → Mature Cultural Ecosystem
                      (Onboard Master Artisans)         (Quality Assurance & Off-Peak)

LOW DEMAND (D < 12)   [LOW DEMAND • LOW SUPPLY]         [LOW DEMAND • HIGH SUPPLY]
                      → Early Stage / Latent            → Cultural Depth / Underutilized
                      (Grassroots Documentation)        (Promote Featured Circuits)
```

---

## 7. Opportunity Classification Thresholds

- **Score $\ge 80.0$:** `HIGH_OPPORTUNITY` (Prime candidate for immediate artisan onboarding)
- **Score $60.0$–$79.9$:** `MODERATE_OPPORTUNITY` (Balanced cultural tourism potential)
- **Score $40.0$–$59.9$:** `EMERGING_OPPORTUNITY` (Developing cultural interest or supply)
- **Score $< 40.0$:** `LOWER_OPPORTUNITY` (Early stage or constrained nodes)
- **Score is `null`:** `INSUFFICIENT_DATA`

---

## 8. Worked Mathematical Examples

### Example 1: High Opportunity Hub (Srikalahasti, AP)
- **Traditions:** Srikalahasti Kalamkari (Destination-linked, GI-tagged) $\implies T = 10.0 + 2.0 = 12.0$ (plus state contextual $4.0$) $\implies T = 16.0$
- **Demand:** 35 observed signals ($D = 24.5$)
- **Supply:** 0 verified experiences ($S = 25.0$)
- **Gap Penalty:** Experience Deficit ($-10.0$) + Artisan Deficit ($-5.0$) $\implies P_{\text{gap}} = 15.0$
- **Calculation:**
  $$\text{Raw Score} = 16.0 + 24.5 + 25.0 - 15.0 = 50.5 \implies 50.5$$
  *(When artisan partners are onboarded, gap penalty drops to 0, raising score to $65.5$).*

### Example 2: Mature Cultural Ecosystem (Jaipur Old City, Rajasthan)
- **Traditions:** Blue Pottery, Kathputlis, Sanganeri Handblock $\implies T = 30.0$ (clamped)
- **Demand:** Peak platform demand ($D = 35.0$)
- **Supply:** 3 verified masterclass experiences ($S = 8.0$)
- **Gap Penalty:** 0 ($P_{\text{gap}} = 0.0$)
- **Calculation:**
  $$\text{Raw Score} = 30.0 + 35.0 + 8.0 - 0.0 = 73.0 \implies \text{MODERATE_OPPORTUNITY} \text{ (Mature Ecosystem)}$$

---

## 9. Model Limitations

1. **Platform Sampling Sensitivity:** The score reflects active YatraSetu traveler searches and bookings; informal unmapped municipal tourism is not captured.
2. **Seasonal Variation:** Demand components fluctuate across tourist seasons.
3. **Decoupled Verification:** Verified supply relies strictly on experiences that have passed formal government accreditation.
