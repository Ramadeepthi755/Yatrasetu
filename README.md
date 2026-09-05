# 🇮🇳 YatraSetu

### Discover India. Connect Locally. Grow Tourism.

YatraSetu is an **AI-powered tourism ecosystem** designed to connect **Travelers, Local Tourism Partners, and Government Authorities** on a single intelligent platform.

Instead of treating tourism as only a travel-booking problem, YatraSetu creates a connected ecosystem where:

- 🧳 **Travelers** can discover destinations, plan trips, find local experiences, connect with fellow travelers, and receive AI-powered assistance.
- 🏘️ **Local Partners** can showcase authentic experiences and participate in the tourism ecosystem.
- 🏛️ **Government Authorities** can understand tourism demand, destination health, local opportunities, and tourism activity through a dedicated intelligence dashboard.

---

## 🎯 Vision

To build a unified digital tourism ecosystem that helps:

- **Travelers → Discover better destinations**
- **Local Communities → Get more tourism opportunities**
- **Government → Make better data-driven tourism decisions**

---

## 🚀 Why YatraSetu?

Traditional tourism platforms mainly focus on:

- Hotels
- Tickets
- Destination information
- Travel packages

YatraSetu goes beyond booking by connecting the complete tourism ecosystem:

```text
                    🇮🇳 YatraSetu
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
      TRAVELER        PARTNER       GOVERNMENT
          │              │              │
          ▼              ▼              ▼
   Trip Planning    Local Hosts    Tourism Intelligence
   AI Assistant     Experiences    Demand Analysis
   Travel Connect   Hotels         Destination Health
   Destinations     Services       Local Opportunity
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                YatraSetu Intelligence
```

---

# ✨ Key Features

## 🧳 Traveler Features

### 🔎 Destination Discovery

- Explore Indian destinations
- State-wise discovery
- City-wise discovery
- Destination details
- Tourist attractions
- Famous regional food
- Transport and connectivity
- Hotels
- Local experiences

### 🤖 YatraSetu AI Assistant

A global AI travel assistant available across the platform.

It supports:

- Destination discovery
- Destination-specific questions
- Smart trip planning
- Travel recommendations
- Weather-aware travel context
- Current destination/page context
- YatraSetu data-grounded answers

The AI follows a **zero-hallucination approach**.

If verified YatraSetu information is unavailable, the system does not fabricate information.

---

## 🗺️ Smart Trip Planner

Travelers can create trips using:

- Destination
- Travel dates
- Budget
- Travel preferences
- Interests
- Trip style

The planner provides:

- Day-wise itinerary
- Places to visit
- Estimated costs
- Budget breakdown
- Weather context
- Price transparency
- Saved trips

---

## 🤝 Travel Connect

Travelers can discover other travelers going to similar destinations.

Matching considers:

- Destination
- Travel dates
- Interests
- Travel style
- Languages

Features include:

- Traveler profiles
- Travel matching
- Connection requests
- Connections
- In-app messaging
- Notifications

---

# 🏘️ Local Tourism Ecosystem

YatraSetu connects travelers with local tourism providers.

### Local Partners

Partners can participate as:

- Local Guides
- Experience Providers
- Tourism Service Providers

Travelers can discover:

- Local hosts
- Authentic experiences
- Local activities
- Hotels
- Tourism services

### 🔖 Data Provenance

Listings can contain provenance labels such as:

- `DATASET`
- `OFFICIAL`
- `API`
- `PARTNER_SUBMITTED`
- `USER_GENERATED`
- `DEMO`

This helps users understand where information comes from.

---

# 🏛️ Government Tourism Intelligence

One of YatraSetu's major differentiating capabilities is the **Government Tourism Intelligence** platform.

Government authorities can use a dedicated dashboard to understand tourism activity within the YatraSetu ecosystem.

## 📊 Government Dashboard

Includes:

- Tourism KPIs
- Demand trends
- Rising destinations
- High-pressure destinations
- Underutilized destinations
- Destination Health
- Activity Pressure
- Local Opportunity
- India tourism map
- Transparent Baseline Forecast
- Redistribution opportunities
- Government Action Center
- Government AI

---

## 📈 Demand Intelligence

YatraSetu can analyze available platform activity signals such as:

- Trip planning activity
- Destination interest
- Travel Connect activity
- Review activity

Imported historical review data is **not treated as newly generated traveler activity**.

---

## 🧠 Transparent Baseline Forecast

YatraSetu provides a transparent numerical baseline derived from platform activity.

> Numerical forecasts are presented as **Transparent Baseline Forecasts**, not unexplained AI-generated predictions.

AI can explain the forecast but does not invent numerical values.

---

## 🌡️ Activity Pressure

YatraSetu does **not** claim to measure physical tourist crowd counts.

Instead, the platform provides:

- Activity Pressure
- Estimated Activity Pressure
- YatraSetu Demand Pressure

These are platform-derived indicators based on available YatraSetu activity.

---

## ❤️ Destination Health

Destination health considers:

- Demand
- Activity Pressure
- Local Opportunity
- Accessibility
- Sustainability Proxy

Possible classifications:

```text
HEALTHY
WATCH
HIGH_PRESSURE
UNDERUTILIZED
INSUFFICIENT_DATA
```

---

## 🔄 Tourism Redistribution Opportunities

YatraSetu identifies potential opportunities to distribute tourism activity toward destinations with:

- Lower activity
- Available tourism capacity
- Local opportunities

These are presented as **potential opportunities**, not guaranteed outcomes.

---

# 🔐 Role-Based Access Control

YatraSetu has three primary roles:

```text
TRAVELER
PARTNER
GOVERNMENT
```

Authorization is enforced server-side.

| Role | Access |
|---|---|
| 🧳 Traveler | Traveler features and personal trips |
| 🏘️ Partner | Partner tourism services |
| 🏛️ Government | Government Tourism Intelligence |

Protected government APIs follow:

```text
Guest       → 401 Unauthorized
Traveler    → 403 Forbidden
Partner     → 403 Forbidden
Government  → 200 Authorized
```

---

# 🗄️ Tourism Data

The platform contains structured tourism data including:

- Destinations
- Tourist POIs
- City-specific POIs
- Hotels
- Regional foods
- Transport and connectivity
- Local hosts
- Experiences
- Travel buddies
- Reviews
- Recommendation data

YatraSetu intentionally avoids claiming complete coverage of every tourist location in India when verified tourism data is unavailable.

---

# 🛡️ Data Honesty

YatraSetu does not fabricate:

- ❌ Restaurants
- ❌ Travel agencies
- ❌ Rental providers
- ❌ Prices
- ❌ Government statistics
- ❌ Tourist arrival statistics
- ❌ Physical crowd counts
- ❌ Economic impact numbers

When verified information is unavailable, the platform clearly communicates that information is unavailable.

---

# 🏗️ Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide Icons
- Leaflet
- Recharts
- Framer Motion

## Backend

- Spring Boot
- Java 21
- Maven
- Spring Web
- Spring Data JPA
- Spring Security
- Flyway
- Jackson
- Lombok

## Database & Infrastructure

- PostgreSQL
- Supabase
- Supabase Storage
- Supabase Authentication

## AI

- Google Gemini

## External Services

- Open-Meteo
- OpenStreetMap
- Leaflet
- Razorpay

---

# 🏛️ Architecture

```text
                         YatraSetu
                            │
            ┌───────────────┼────────────────┐
            │               │                │
            ▼               ▼                ▼
        Frontend         Backend          Database
        Next.js        Spring Boot       PostgreSQL
            │               │                │
            │               ├──── AI ────────┤
            │               │    Gemini      │
            │               │
            │               ├──── Weather ───┤
            │               │   Open-Meteo   │
            │               │
            │               ├──── Payments ──┤
            │               │   Razorpay     │
            │               │
            │               └──── Maps ──────┤
            │                    OSM         │
            │
            ▼
     Traveler / Partner / Government
```

---

# 📂 Project Structure

```text
Yatrasetu/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   └── java/
│   │   └── test/
│   ├── pom.xml
│   └── mvnw
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── package.json
│   └── ...
│
├── data/
│   ├── destinations/
│   ├── poi/
│   ├── hotels/
│   ├── geography/
│   ├── recommendation/
│   └── demo/
│
└── README.md
```

---

# ⚙️ How to Run YatraSetu Locally

## 📋 Prerequisites

Install the following:

- Git
- Java 21
- Node.js 18+ / 20+
- npm

Check installations:

```bash
git --version
java -version
node -v
npm -v
```

Java should be **Java 21**.

---

## 1️⃣ Clone the Repository

Open Terminal:

```bash
git clone https://github.com/Ramadeepthi755/Yatrasetu.git
```

Then:

```bash
cd Yatrasetu
```

---

## 2️⃣ Start the Backend

Open **Terminal 1**.

From the project folder:

```bash
cd backend
```

Run:

```bash
./mvnw spring-boot:run
```

Backend:

```text
http://localhost:8080
```

Keep Terminal 1 running.

### Windows

```bash
mvnw.cmd spring-boot:run
```

> ⚠️ Correct command: `./mvnw spring-boot:run`

---

## 3️⃣ Start the Frontend

Open **Terminal 2**.

From the project folder:

```bash
cd Yatrasetu/frontend
```

Install dependencies:

```bash
npm install
```

Start frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

## 🚀 Quick Start

### Terminal 1 — Backend

```bash
git clone https://github.com/Ramadeepthi755/Yatrasetu.git
cd Yatrasetu/backend
./mvnw spring-boot:run
```

### Terminal 2 — Frontend

```bash
cd Yatrasetu/frontend
npm install
npm run dev
```

### Open Application

```text
http://localhost:3000
```

---

# 👤 Demo Accounts

## 🧳 Traveler

**Aditi Sharma**

Demo Traveler

## 🏘️ Local Partner

**Rajesh Guide**

Demo Partner  
Rajesh Heritage Walks  
Hampi, Karnataka

## 🏛️ Government

**Director General of Tourism**

Demo Government

---

# 🤖 Test YatraSetu AI

After starting both servers, open:

```text
http://localhost:3000
```

Open the YatraSetu AI Assistant and test:

```text
which destination can i visit in tamilnadu
```

```text
What are the best heritage destinations to visit this month?
```

```text
Show me destinations in Karnataka
```

```text
Tell me about Goa
```

```text
What peaceful destinations do you have?
```

```text
Tell me about Mysore
```

The AI should use available YatraSetu data and should not fabricate information.

---

# 🏛️ Test Government Dashboard

Login using the Government demo account.

Explore:

- Tourism KPIs
- Demand Trends
- Rising Destinations
- High Pressure Destinations
- Underutilized Destinations
- Destination Health
- Activity Pressure
- Local Opportunity
- Transparent Baseline Forecast
- Redistribution Opportunities
- Government Action Center
- Government AI

---

# 🧪 Testing

## Backend Tests

```bash
cd Yatrasetu/backend
./mvnw test
```

## Frontend Lint

```bash
cd Yatrasetu/frontend
npm run lint
```

## Frontend Production Build

```bash
cd Yatrasetu/frontend
npm run build
```

---

# 🔄 Team Git Workflow

Before starting work:

```bash
git checkout main
git pull origin main
```

Create your own feature branch:

```bash
git checkout -b feature/<feature-name>
```

Example:

```bash
git checkout -b feature/improve-ai-assistant
```

After making changes:

```bash
git status
```

Review:

```bash
git diff
```

Run tests:

```bash
cd backend
./mvnw test
```

Run frontend checks:

```bash
cd ../frontend
npm run lint
npm run build
```

---

# 📤 Commit and Push

Go back to project root:

```bash
cd ..
```

Add changes:

```bash
git add .
```

Commit:

```bash
git commit -m "feat: describe your change"
```

Example:

```bash
git commit -m "feat: improve AI assistant"
```

Push your branch:

```bash
git push -u origin feature/improve-ai-assistant
```

Then create a **Pull Request** on GitHub.

> ⚠️ Do not directly push feature changes to `main`.

---

# 🔀 Pull Request Workflow

```text
                    GitHub
                       │
                     main
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      Member 1      Member 2     Member 3
       branch        branch       branch
          │            │            │
          ▼            ▼            ▼
       commit        commit       commit
          │            │            │
          └────────────┼────────────┘
                       ▼
                 Pull Request
                       │
                       ▼
                     Review
                       │
                       ▼
                     Merge
                       │
                       ▼
                      main
```

---

# 💡 What Team Members Should Review

## 🐛 Bugs

- Functional bugs
- API errors
- Authentication issues
- Incorrect data
- Broken navigation

## 🎨 UI/UX

- Mobile responsiveness
- Accessibility
- Loading states
- Empty states
- Navigation
- Dashboard usability

## 🤖 AI

- Destination retrieval
- AI response quality
- Grounding
- Hallucination
- Prompt injection protection
- Trip planning

## 🗄️ Data

- Destination mapping
- City/state relationships
- POI quality
- Hotel data
- Provenance
- Duplicate data

## 🔐 Security

- Authentication
- RBAC
- API authorization
- Ownership checks
- Sensitive data exposure

## 🚀 SIH Innovation

Review:

- Novelty
- Government usefulness
- Local community impact
- Scalability
- Sustainability
- Real-world feasibility

---

# 🚫 Important Rules for Contributors

Do NOT:

- ❌ Push directly to `main`
- ❌ Force push
- ❌ Reset the shared database
- ❌ Truncate production-like tables
- ❌ Delete existing Flyway migrations
- ❌ Modify migration history
- ❌ Commit API keys
- ❌ Commit passwords
- ❌ Commit Supabase secrets
- ❌ Disable security just to make tests pass

---

# 🔐 Security

Never commit sensitive information such as:

- API keys
- Database passwords
- Gemini API keys
- Supabase secrets
- Razorpay secrets

Do not commit:

```text
.env
.env.local
*.key
*.pem
credentials.json
service-account.json
```

---

# ✅ Before Creating a Pull Request

Make sure:

- [ ] Backend runs successfully
- [ ] Frontend runs successfully
- [ ] Feature works correctly
- [ ] Backend tests pass
- [ ] Frontend lint passes
- [ ] Frontend production build passes
- [ ] No secrets are committed
- [ ] No unrelated files are modified
- [ ] Existing features still work
- [ ] Authentication still works
- [ ] RBAC/security is preserved
- [ ] Database migrations are safe

---

# 🗺️ Core YatraSetu Flow

```text
Login
  ↓
Explore India
  ↓
State
  ↓
City
  ↓
Destination
  ↓
Plan My Trip
  ↓
YatraSetu AI
  ↓
LocalMatch
  ↓
Local Profile
  ↓
Experience / Hotel
  ↓
Booking
  ↓
My Trips
  ↓
Review
  ↓
Tourism Impact
```

---

# 🎯 Innovation

YatraSetu is not only a tourism discovery or booking platform.

Its core idea is to connect:

```text
Traveler Activity
       ↓
Tourism Intelligence
       ↓
Local Economic Opportunity
       ↓
Destination Management
       ↓
Government Decision Support
```

This creates a connected feedback loop between:

**Travelers ↔ Local Communities ↔ Government**

---

# 🚀 Future Roadmap

Potential future capabilities include:

- Tourist safety and incident intelligence
- Multilingual voice-based travel assistant
- Offline/PWA travel mode
- Advanced demand forecasting
- Destination redistribution intelligence
- Destination health improvements
- Verified partner ecosystem expansion
- More real-world tourism data integrations
- Advanced sustainability analytics
- Government action workflows

---

# 📌 Current Project Status

- ✅ Traveler ecosystem
- ✅ Local partner ecosystem
- ✅ Government Tourism Intelligence
- ✅ AI Travel Assistant
- ✅ Smart Trip Planner
- ✅ Travel Connect
- ✅ Destination ecosystem
- ✅ Hotels
- ✅ Local experiences
- ✅ Government dashboard
- ✅ Destination Health
- ✅ Demand signals
- ✅ Activity Pressure
- ✅ Local Opportunity
- ✅ Transparent Baseline Forecast
- ✅ Redistribution opportunities
- ✅ Role-based access control
- ✅ Data provenance
- ✅ PostgreSQL / Supabase integration
- ✅ Flyway database migrations
- ✅ Backend tests
- ✅ Frontend lint/build validation

---

# 🇮🇳 YatraSetu

### Discover India. Connect Locally. Grow Tourism.

**Travelers • Local Communities • Government**

Built to create a smarter, more connected, and more sustainable tourism ecosystem for India.
