# ✅ YatraSetu — SIH Live Demo Verification Checklist
## Pre-Evaluation Operational Runbook & Readiness Verification

---

## 1. System & Server Health Checks (T - 30 Minutes)
- [ ] **Backend Server Active**: `./mvnw spring-boot:run` running smoothly on port `8080`.
- [ ] **Frontend Server Active**: `npm run dev` running on port `3000`.
- [ ] **Database Connectivity**: PostgreSQL on Supabase reachable; Flyway migrations verified at version `15`.
- [ ] **Actuator Probes**: `GET http://localhost:8080/actuator/health` returns `{"status":"UP"}`.
- [ ] **External Services Configured**: `GEMINI_API_KEY` loaded in environment.
- [ ] **No Console Errors**: DevTools console clean on `localhost:3000`.

---

## 2. Browser Tabs Pre-Arranged (T - 10 Minutes)
- [ ] **Tab 1: Landing Page** (`http://localhost:3000`)
- [ ] **Tab 2: Explore Catalog** (`http://localhost:3000/explore`)
- [ ] **Tab 3: Hampi Destination** (`http://localhost:3000/destinations/dest-1`)
- [ ] **Tab 4: Smart Trip Planner** (`http://localhost:3000/plan-trip`)
- [ ] **Tab 5: Local Experience** (`http://localhost:3000/experiences/exp-1`)
- [ ] **Tab 6: Travel Connect** (`http://localhost:3000/travel-connect`)
- [ ] **Tab 7: Government Dashboard** (`http://localhost:3000/government/dashboard`)

---

## 3. Core Workflow Dry-Run Verification (T - 5 Minutes)
- [ ] **Explore Navigation**: Karnataka $\to$ Hampi loads POIs, foods, transports, and hotels cleanly.
- [ ] **AI Trip Planner**: Generates a 3-day itinerary with grounded POI IDs and budget numbers within 3–5 seconds.
- [ ] **Demo Payment**: Experience booking checkout displays amber "Demo Payment Simulation" badge and completes smoothly.
- [ ] **Travel Connect**: Buddy profiles load with compatibility tags and connection request buttons.
- [ ] **Government Dashboard**: India Health Map renders; alerts display for Goa / Jaipur; redistribution cards active.
- [ ] **Action Center**: Creating a test action saves and appears in table; status can transition to `IN_PROGRESS`.
- [ ] **AI Refusal Test**: Asking *"What is India's tourism revenue today?"* returns clean `[UNAVAILABLE_INFORMATION]` refusal without crashing.

---

## 4. Audio-Visual & Device Readiness
- [ ] Laptop charger connected.
- [ ] Screen display scaling set to 100% (avoiding cropped navigation elements).
- [ ] System notifications muted / Do Not Disturb enabled.
- [ ] Backup mobile hotspot active in case venue WiFi encounters latency.
