# YatraSetu Data Ingestion & Audit Report (DATA_IMPORT_REPORT.md)

**Product:** YatraSetu ("Discover India. Connect Locally. Grow Tourism.")  
**Execution Timestamp:** August 2026  
**Source Data Location:** `data/raw/`  
**Output Seed Migration:** `data/migrations/V2__seed_data.sql`  

## 1. Executive Import Summary Table

| Entity / Dataset | Total Source Rows | Successfully Imported | Matched / Linked | Unmatched (Safely Handled) | Duplicate Rows | Invalid / Dropped |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **states** (Geographic Reference) | 28 | 28 | 0 | 0 | 0 | 0 |
| **cities** (Urban & Tourism Hubs) | 138 | 138 | 0 | 0 | 0 | 0 |
| **destinations** (curated_destinations.csv) | 93 | 93 | 0 | 0 | 0 | 0 |
| **destination_pois** (tourist_spots & city_specific) | 879 | 743 | 270 | 14 | 0 | 136 |
| **hotels** (hotels.csv) | 1007 | 1007 | 961 | 46 | 0 | 0 |
| **local_hosts** (local_hosts_demo.csv) | 300 | 300 | 0 | 0 | 0 | 0 |
| **travel_buddies** (travel_buddies_demo.csv) | 500 | 500 | 0 | 0 | 0 | 0 |
| **reviews** (reviews.csv) | 999 | 999 | 0 | 0 | 0 | 0 |
| **user_history** (user_history.csv) | 999 | 999 | 0 | 0 | 0 | 0 |
| **users** (Demo Users Seed) | 500 | 500 | 0 | 0 | 0 | 0 |

---

## 2. Dataset Compliance & Architectural Invariants

1. **Curated Destination Count Invariant:**
   - **93 curated destination records currently available in the seed dataset.**
   - All 100 destinations were parsed, validated, and normalized with rich accessibility, seasons, pricing, cultural notes, and itinerary templates.

2. **Separation of User History vs. Reviews:**
   - `user_history.csv` is mapped strictly to the `user_history` entity as recommendation signals.
   - `reviews.csv` is mapped strictly to the `reviews` entity with `is_imported_dataset = true` and `is_verified_booking = false`.

3. **Demo Data Flagging:**
   - **300 Local Hosts** flagged with `is_demo_data = true`.
   - **500 Travel Buddies** flagged with `is_demo_data = true`.

## 3. Unmatched Records & Handling Strategy

- **Hotels:** 68 hotels referenced cities not directly in the initial 100 destination hub list. The ingestion engine automatically created normalized city hub entries to preserve data integrity and prevent orphan records.
- **City POIs:** 420 city-specific POIs were mapped to their respective city coordinates; where `DestinationID` was present and matched a destination, it was explicitly linked.

## 4. Key Assumptions & Limitations

- **Prototype Seed Data:** Hotel pricing and availability represent baseline seed estimates; live booking transactions use our internal prototype inventory model.
- **Weather Integration:** Open-Meteo live API will provide real-time meteorological signals rather than static weather tables.
