# 🛡️ YatraSetu — Live Demo Fallback & Contingency Plan
## Robust Fail-Safe Procedures for High-Stakes Presentations

---

## 1. Golden Rule for Live Demonstration
**Never panic during a live demo.** YatraSetu has been engineered from the ground up with defensive fallbacks, offline deterministic engines, and graceful UI degradation.

---

## 2. Contingency Matrix & Action Steps

| Failure Scenario | Built-in Architectural Fallback | Live Demo Action / Spoken Dialogue |
| :--- | :--- | :--- |
| **A. Google Gemini API Unavailable or Rate Limited** | Backend automatically engages `DeterministicFallbackAiProvider` without throwing an exception. | *Dialogue*: "Notice how our resilient dual-engine architecture instantly falls back to our deterministic offline grounding engine, ensuring the traveler gets verified heritage itineraries even during third-party cloud outages." |
| **B. Open-Meteo Weather API Outage / Network Timeout** | 30-minute in-memory cache supplies last-known reading, or gracefully omits the weather widget. | *Dialogue*: "Our weather integration uses an in-memory cache with graceful degradation, so external weather downtime never blocks the core travel booking or exploration path." |
| **C. Internet / WiFi Disconnection** | Local Spring Boot backend and Next.js frontend continue serving database records locally (if local DB is active). | *Action*: Point to cached pages or pre-loaded browser tabs. Explain that the core catalog and deterministic rules run locally. |
| **D. High Latency / Slow Network** | UI displays sleek shimmer loading states and non-blocking asynchronous cards. | *Action*: Continue speaking naturally about the destination context while the card resolves. |
| **E. Demo Payment Simulation Inquiries** | Checkout modal prominently displays the "Demo Payment Simulation" badge. | *Dialogue*: "We clearly label this as a Demo Payment Simulation for full transparency, demonstrating end-to-end database persistence without executing real banking deductions." |
| **F. Government Dashboard Empty Filter State** | Filter pills allow resetting to "All India" or "High Pressure" nodes. | *Action*: Click "All Regions" or "Healthy" filter tab to instantly populate the full 164-node destination matrix. |

---

## 3. Pre-Demo Setup & Verification Steps

1. **Terminal 1 (Backend)**: Ensure `./mvnw spring-boot:run` is active and healthy on port `8080`.
2. **Terminal 2 (Frontend)**: Ensure `npm run dev` is active and compiled on port `3000`.
3. **Browser Tabs Preparation**:
   - Tab 1: Home / Landing Page (`http://localhost:3000`)
   - Tab 2: Hampi Destination Page (`http://localhost:3000/destinations/dest-1`)
   - Tab 3: Smart AI Trip Planner (`http://localhost:3000/plan-trip`)
   - Tab 4: Local Experience Checkout (`http://localhost:3000/experiences/exp-1`)
   - Tab 5: Government Tourism Intelligence Hub (`http://localhost:3000/government/dashboard`)
4. **Environment Check**: Confirm `SUPABASE_JWT_SECRET` and `GEMINI_API_KEY` are configured in `.env.local` / `application.yml`.
