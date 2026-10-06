# 🇮🇳 YatraSetu

### Discover India. Connect Locally. Grow Tourism.

YatraSetu is an integrated tourism ecosystem connecting **Travelers, Local Partners, and Government Authorities** through one platform.

---

## Overview

YatraSetu brings tourism discovery, AI-powered trip planning, local experiences, cultural tourism, hotel booking, traveler connections, and government tourism intelligence into one connected ecosystem.

The platform is designed to make tourism more **discoverable, personalized, authentic, connected, and beneficial to local communities**.

---

## Problem

Tourism information is fragmented across different platforms. Travelers often struggle with:

- Reliable destination information
- Personalized trip planning
- Authentic local experiences
- Finding local guides and artisans
- Hotel availability and booking
- Connecting with other travelers

At the same time, local businesses and artisans have limited digital visibility, while government authorities need actionable destination-level tourism intelligence.

### YatraSetu Solution

    YatraSetu
         │
    ┌────┼───────────────┐
    │    │               │
Traveler Partner     Government
    │    │               │
Discover Local      Intelligence
Plan     Services    Analytics
Connect  Experiences Opportunities
Book     Hotels      Actions
Experience Artisans
    │
    ▼
Local Economy
    │
    ▼
Tourism Intelligence
    │
    ▼
Local Tourism Opportunities

---

## Key Features

### 🧳 Tourism Discovery

- Explore Indian States and Union Territories
- Discover cities and destinations
- Tourist attractions and POIs
- Travel themes
- Regional food
- Cultural traditions
- Maps and connectivity

### 🤖 AI Smart Trip Planner

- Personalized itinerary generation
- Destination recommendations
- Budget-based planning
- Interest and preference-based planning
- AI tourism assistant
- Grounded responses using available platform data
- Honest handling of unavailable information

### 🏨 Hotel Ecosystem

- Hotel discovery
- Room types
- Inventory management
- Rate plans
- Date-specific availability
- Hotel booking
- Booking cancellation
- Payment processing
- Booking confirmation
- Voucher generation
- Partner hotel operations

### 💳 Razorpay Payments

- Payment order creation
- Payment verification
- Webhook processing
- HMAC-SHA256 verification
- Payment reconciliation
- Booking and payment consistency

### 🤝 Travel Connect

- Find travelers visiting similar destinations
- Destination-based matching
- Travel-date matching
- Interest matching
- Travel-style matching
- Traveler connections
- In-app messaging

### 🧑‍🎨 Local Culture & Artisan Ecosystem

- Cultural traditions
- Regional crafts
- GI-linked traditions
- Artisan experiences
- Craft workshops
- Heritage experiences
- Cultural discovery

### 🏠 Local Partner Ecosystem

- Local guides
- Hosts
- Experience providers
- Hotels and homestays
- Artisan partners
- Property management
- Inventory management
- Experience management
- Partner booking operations

### 🏛️ Government Tourism Intelligence

- Destination Health
- Tourism demand
- Activity pressure
- Local opportunity
- Accessibility
- Sustainability proxy
- Hidden-gem discovery
- Ecosystem gap detection
- Tourism redistribution opportunities
- Government action center

### 🌦️ Travel Information

- Weather information
- Transport connectivity
- Airports and railway information
- Interactive maps
- Location-based discovery

### 🔐 Authentication & Security

- Traveler authentication
- Partner authentication
- Government authentication
- Role-based access control
- Protected APIs
- Ownership validation
- Booking security
- Payment security

---

## What Makes YatraSetu Unique?

YatraSetu is **not just a travel booking platform**. It connects the complete tourism ecosystem.

    Discover
       ↓
    Plan
       ↓
    Connect
       ↓
    Book
       ↓
    Experience
       ↓
    Review
       ↓
    Tourism Impact
       ↓
    Government Intelligence
       ↓
    Local Opportunities
       ↓
    More Discovery

### Core Innovation

- One ecosystem for **Traveler + Local Partner + Government**
- AI-powered personalized trip planning
- Local economic and artisan participation
- Cultural tourism integration
- Hotel availability and booking
- Traveler-to-traveler connection
- Destination-level tourism intelligence
- Tourism redistribution insights
- Data provenance and transparency
- No-fake-data approach

---

## System Architecture

    ┌─────────────────────────────────┐
    │           YatraSetu             │
    │        Next.js Frontend         │
    └───────────────┬─────────────────┘
                    │
                    ▼
    ┌─────────────────────────────────┐
    │        Spring Boot Backend       │
    │          REST + Security         │
    └───────────────┬─────────────────┘
                    │
          ┌─────────┼─────────┐
          │         │         │
          ▼         ▼         ▼
      PostgreSQL  Gemini    External
      Supabase      AI       APIs
                              │
                  ┌───────────┼───────────┐
                  ▼           ▼           ▼
              Open-Meteo OpenStreetMap Razorpay
               Weather       Maps       Payments

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| UI | Tailwind CSS, Lucide Icons |
| Backend | Java 21, Spring Boot 3.3.x |
| API | REST APIs |
| Database | PostgreSQL, Supabase |
| Migration | Flyway |
| AI | Google Gemini |
| Payments | Razorpay |
| Maps | OpenStreetMap, Leaflet |
| Weather | Open-Meteo |
| Charts | Recharts |
| Animation | Framer Motion |

---

## Project Structure

    Yatrasetu/
    │
    ├── backend/
    │   ├── src/
    │   │   ├── main/
    │   │   │   ├── java/
    │   │   │   └── resources/
    │   │   └── test/
    │   ├── pom.xml
    │   └── mvnw
    │
    ├── frontend/
    │   ├── app/
    │   ├── components/
    │   ├── context/
    │   ├── hooks/
    │   ├── lib/
    │   ├── public/
    │   └── package.json
    │
    ├── data/
    │   ├── destinations/
    │   ├── hotels/
    │   ├── poi/
    │   ├── geography/
    │   └── recommendation/
    │
    ├── docs/
    │
    └── README.md

---

## Getting Started

### Requirements

- Java 21
- Node.js 18+
- npm
- PostgreSQL or Supabase

---

## Run Locally

### 1. Clone Repository

    git clone https://github.com/Ramadeepthi755/Yatrasetu.git
    cd Yatrasetu

### 2. Backend Setup

    cd backend

Configure the required environment variables:

    DATABASE_URL
    DATABASE_USERNAME
    DATABASE_PASSWORD

    GEMINI_API_KEY

    RAZORPAY_KEY_ID
    RAZORPAY_KEY_SECRET
    RAZORPAY_WEBHOOK_SECRET

Run backend tests:

    ./mvnw test

Start the backend:

    ./mvnw spring-boot:run

### 3. Frontend Setup

Open another terminal:

    cd frontend
    npm install
    npm run dev

Open the application:

    http://localhost:3000

---

## Testing

### Backend Tests

    cd backend
    ./mvnw test

### Frontend Lint

    cd frontend
    npm run lint

### Frontend Production Build

    npm run build

### Flyway Validation

    cd backend
    ./mvnw flyway:validate
    ./mvnw flyway:info

---

## User Roles

    ┌──────────────────────────────────────┐
    │              YATRASETU               │
    ├──────────────┬────────────┬──────────┤
    │   Traveler   │  Partner   │Government│
    ├──────────────┼────────────┼──────────┤
    │ Explore      │ Properties │ Analytics│
    │ AI Planner   │ Rooms      │ Insights │
    │ Hotels       │ Inventory  │ Gaps     │
    │ Travel       │ Experiences│ Actions  │
    │ Connect      │ Bookings   │ Tourism  │
    │ Culture      │ Services   │ Health   │
    └──────────────┴────────────┴──────────┘

### 🧳 Traveler

- Discover destinations
- Plan trips with AI
- Connect with travelers
- Discover culture and experiences
- Check hotel availability
- Book hotels
- Make payments
- View bookings and vouchers

### 🤝 Partner

- Manage properties
- Manage rooms
- Manage inventory
- Manage rate plans
- Manage experiences
- View bookings
- Participate in the local tourism ecosystem

### 🏛️ Government

- View tourism intelligence
- Monitor destination health
- Identify ecosystem gaps
- Discover hidden-gem opportunities
- Analyze redistribution opportunities
- Review partner submissions
- Manage tourism actions

---

## Data & AI Principles

YatraSetu follows a simple principle:

> **If reliable information is unavailable, do not fabricate it.**

The platform uses provenance such as:

    DATASET
    OFFICIAL
    API
    PARTNER_SUBMITTED
    USER_GENERATED
    DEMO

The system avoids fabricating:

- Hotel availability
- Hotel prices
- Businesses
- Experiences
- Government statistics
- Tourism revenue
- Crowd or footfall numbers
- Unsupported destination information

AI responses are grounded in available platform information.

---

## Current Scope

| Category | Coverage |
|---|---:|
| States / UTs | 36 |
| Destinations | 164 |
| Tourist POIs | 937 |
| Hotel Records | 1,007 |
| Cultural Traditions | 100 |
| GI-linked Traditions | 71 |
| City-linked Cultural Traditions | 72 |
| Destination-linked Cultural Traditions | 47 |

> Some datasets are curated, reference, or demo data. Hotel catalog records are not automatically live inventory, and government intelligence represents platform-derived signals rather than official government statistics.

---

## Future Scope

- Live OTA and hotel integrations
- More verified local partners
- Larger live tourism datasets
- Advanced recommendation models
- Production notification services
- Real-world tourism authority integrations
- Advanced tourism analytics
- Production-scale deployment

---

## Vision

> **Make every journey across India more discoverable, connected, authentic, and beneficial to local communities.**

### 🇮🇳 YatraSetu

**Discover India. Connect Locally. Grow Tourism.**
