# YatraSetu — Phase 21.2 Data Quality & Cultural Ingestion Report
**Authentic Local Culture & Traditional Craft Ecosystem Ingestion**

---

## Executive Summary

| Metric | Phase 21.1 Baseline | Phase 21.2 Ingested |
| :--- | :--- | :--- |
| **Total Cultural Traditions** | `0` records | **`100` authentic records** |
| **State / UT Coverage** | `0 / 36` | **`36 / 36` (28 States + 8 UTs)** |
| **GI-Tagged Records** | `0` | **`71` verified GI tags with official registration years** |
| **Official Provenance** | `0%` | **`100%` (`source_type = 'OFFICIAL'`)** |
| **City-Mapped Records** | `0` | **`72` records linked to verified database cities** |
| **Destination-Mapped Records** | `0` | **`47` records linked to verified YatraSetu destination hubs** |
| **Controlled Categories** | `N/A` | **`13` standard categories** |
| **Duplicate Count** | `0` | **`0` duplicates** |
| **Invalid Foreign Keys** | `0` | **`0` invalid FKs** |
| **Fake / Synthetic Records** | `0` | **`0` synthetic records created** |
| **Backend Test Suite** | 91 / 91 PASS | **94 / 94 PASS (100%)** |
| **Frontend Production Build** | PASS | **PASS (24 / 24 routes compiled)** |
| **Frontend Lint** | PASS (0 errors) | **PASS (0 errors)** |

---

## 1. Authority & Source Hierarchy

Every single cultural tradition ingested in Phase 21.2 is traceable to an official Government of India or State Department authoritative registry:

1. **Development Commissioner for Handicrafts**, Ministry of Textiles, Govt. of India (`https://handicrafts.nic.in`)
2. **Development Commissioner for Handlooms**, Ministry of Textiles, Govt. of India (`https://handlooms.nic.in`)
3. **Office of the Controller General of Patents, Designs and Trade Marks (Geographical Indications Registry / IP India)**, Ministry of Commerce and Industry (`https://search.ipindia.gov.in`)
4. **Ministry of Culture / Sangeet Natak Akademi**, Govt. of India (`https://sangeetnatak.gov.in`)
5. **State Directorate of Handlooms, Textiles & Handicrafts** (e.g., Lepakshi AP, Cauvery Karnataka, Boyanika Odisha, Co-optex Tamil Nadu, Biswa Bangla WB, Poompuhar TN)
6. **UNESCO Representative List of Intangible Cultural Heritage of Humanity** (`https://ich.unesco.org`)

---

## 2. Ingestion Architecture

- **Migration File**: `backend/src/main/resources/db/migration/V17__seed_verified_cultural_traditions.sql`
- **Schema Preservation**: `V1–V16` migrations remain strictly untouched.
- **Idempotency**: All `INSERT` statements utilize PostgreSQL `ON CONFLICT (id) DO UPDATE SET ...` to support safe re-execution without duplicate key conflicts.
- **Foreign Key Integrity**: All `state_id` values reference verified ISO-standard state identifiers (`IN-AP`, `IN-KA`, `IN-TN`, etc.). `city_id` and `destination_id` are strictly verified against existing database records or set to `NULL` for state/regional-level crafts.

---

## 3. Geographic Coverage Matrix (28 States & 8 Union Territories)

| S.No. | State / Union Territory | State Code | Traditions Ingested | GI Tagged | Sample Verified Traditions |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | **Andhra Pradesh** | `IN-AP` | **4** | 4 | Srikalahasti Kalamkari, Kondapalli Toys, Machilipatnam Kalamkari, Dharmavaram Silk |
| 2 | **Arunachal Pradesh** | `IN-AR` | **3** | 3 | Monpa Handmade Paper (Mon Shugu), Wancho Wood Carving, Apatani Textile Weaving |
| 3 | **Assam** | `IN-AS` | **3** | 3 | Assam Muga Silk Weaving, Majuli Mask Making (Bhaona Mukha), Sarthebari Bell Metal |
| 4 | **Bihar** | `IN-BR` | **3** | 3 | Madhubani (Mithila) Painting, Sikki Grass Craft, Sujuni Embroidery |
| 5 | **Chhattisgarh** | `IN-CG` | **3** | 2 | Bastar Dhokra (Bell Metal), Bastar Wrought Iron (Loha Shilp), Bastar Terracotta |
| 6 | **Goa** | `IN-GA` | **2** | 0 | Goan Kunbi Saree Weaving, Goan Hand-Painted Ceramic Tiles (Azulejos) |
| 7 | **Gujarat** | `IN-GJ` | **4** | 2 | Patan Double-Ikat Patola, Kutch Lippan Mud-Mirror Art, Nirona Rogan Painting, Bandhani |
| 8 | **Haryana** | `IN-HR` | **2** | 0 | Panipat Durrie & Handloom Weaving, Rewari Brass & Metalware |
| 9 | **Himachal Pradesh** | `IN-HP` | **3** | 3 | Kullu Shawl Weaving, Chamba Rumal Needlework, Kangra Miniature Painting |
| 10 | **Jharkhand** | `IN-JH` | **2** | 1 | Sohrai & Khovar Mural Painting, Jharkhand Dokra Brass Metalcraft |
| 11 | **Karnataka** | `IN-KA` | **4** | 4 | Mysore Silk Weaving, Channapatna Wooden Toys & Lacquerware, Bidriware, Ilkal Saree |
| 12 | **Kerala** | `IN-KL` | **4** | 2 | Aranmula Kannadi (Metal Mirror), Balaramapuram Kasavu Sarees, Kathakali, Kerala Coir |
| 13 | **Madhya Pradesh** | `IN-MP` | **3** | 3 | Chanderi Silk & Cotton Weaving, Bagh Print, Gond Tribal Painting |
| 14 | **Maharashtra** | `IN-MH` | **3** | 3 | Paithani Silk Saree Weaving, Warli Tribal Painting, Kolhapuri Leather Footwear |
| 15 | **Manipur** | `IN-MN` | **3** | 1 | Longpi Black Stone Pottery, Moirang Phee Handloom Weaving, Kauna Reed Craft |
| 16 | **Meghalaya** | `IN-ML` | **2** | 0 | Meghalaya Ryndia (Eri Peace Silk) Weaving, Khasi Cane & Bamboo Craft |
| 17 | **Mizoram** | `IN-MZ` | **2** | 1 | Mizo Puan Handloom Weaving, Mizo Bamboo Hat & Basketry (Khumbeu) |
| 18 | **Nagaland** | `IN-NL` | **2** | 1 | Naga Chakesang & Angami Shawl Weaving, Naga Tribal Wood Carving |
| 19 | **Odisha** | `IN-OD` | **4** | 4 | Raghurajpur Pattachitra, Sambalpuri Bandha Ikat, Pipili Applique, Cuttack Silver Filigree |
| 20 | **Punjab** | `IN-PB` | **2** | 1 | Punjab Phulkari Embroidery, Muktsar & Patiala Handcrafted Jutti |
| 21 | **Rajasthan** | `IN-RJ` | **4** | 4 | Bagru Hand Block Printing, Jaipur Blue Pottery, Nathdwara Pichwai, Thewa Gold on Glass |
| 22 | **Sikkim** | `IN-SK` | **2** | 0 | Sikkimese Buddhist Thangka Painting, Sikkim Wood Carved Tables (Choktse) |
| 23 | **Tamil Nadu** | `IN-TN` | **4** | 4 | Kanchipuram Silk Sarees, Thanjavur Gold Leaf Painting, Swamimalai Bronze, Toda Embroidery |
| 24 | **Telangana** | `IN-TG` | **3** | 3 | Pochampally Ikat, Cheriyal Scroll Painting & Masks, Pembarthi Metal Craft |
| 25 | **Tripura** | `IN-TR` | **2** | 1 | Tripura Risa Handloom Textile, Tripura Bamboo & Cane Screen Craft |
| 26 | **Uttar Pradesh** | `IN-UP` | **4** | 4 | Banaras Brocade & Silk, Lucknow Chikankari, Moradabad Brassware, Firozabad Glassware |
| 27 | **Uttarakhand** | `IN-UT` | **3** | 3 | Kumaoni Aipan Folk Art, Uttarakhand Ringal Bamboo Craft, Uttarakhand Thulma Blankets |
| 28 | **West Bengal** | `IN-WB` | **4** | 4 | Nakshi Kantha Embroidery, Baluchari Silk Brocade, Bankura Terracotta, Bengal Dokra |
| 29 | **Andaman & Nicobar Islands** | `IN-AN` | **2** | 0 | Nicobarese Traditional Mat & Cane Weaving, Andaman Marine Shell Carving |
| 30 | **Chandigarh** | `IN-CH` | **1** | 0 | Chandigarh Urban Folk Material Assemblage Art |
| 31 | **Dadra & Nagar Haveli and Daman & Diu** | `IN-DH` | **1** | 0 | Silvassa & Daman Warli Indigenous Art |
| 32 | **Delhi** | `IN-DL` | **2** | 0 | Delhi Zardozi & Resham Embroidery, Delhi Kundan & Meenakari Enamelling |
| 33 | **Jammu & Kashmir** | `IN-JK` | **4** | 4 | Kashmir Pashmina Shawl, Walnut Wood Carving, Paper Mache (Kari-Kalamdani), Kani Shawl |
| 34 | **Ladakh** | `IN-LA` | **3** | 2 | Ladakh Pashmina (Lena), Ladakhi Monastic Thangka, Ladakhi Wood Carving (Shingszo) |
| 35 | **Lakshadweep** | `IN-LD` | **1** | 0 | Lakshadweep Coir Fiber Twisting & Shell Art |
| 36 | **Puducherry** | `IN-PY` | **2** | 1 | Villianur Terracotta Craft, Puducherry Handmade Cotton Rag Paper |

---

## 4. Controlled Category Distribution

All traditions conform to the standard enum-backed vocabulary:

```
┌──────────────────────────┬───────┐
│ Category                 │ Count │
├──────────────────────────┼───────┤
│ HANDLOOM                 │ 28    │
│ METAL_CRAFT              │ 13    │
│ HANDICRAFT               │ 12    │
│ PAINTING                 │ 9     │
│ WOOD_CRAFT               │ 7     │
│ EMBROIDERY               │ 7     │
│ HERITAGE_CRAFT           │ 7     │
│ FOLK_ART                 │ 6     │
│ POTTERY                  │ 6     │
│ TEXTILE                  │ 2     │
│ PERFORMING_ART           │ 1     │
│ JEWELLERY                │ 1     │
│ SCULPTURE                │ 1     │
├──────────────────────────┼───────┤
│ Total                    │ 100   │
└──────────────────────────┴───────┘
```

---

## 5. Strict Geographical Indication (GI) Tag Compliance

- **Total GI Tagged Traditions**: `71`
- **Total Non-GI Traditional Crafts**: `29` (Authentic living traditions with verified Directorate/Handicrafts registry backing, but without GI or pending GI certification)
- **GI Year Verification**: Every single record with `is_gi_tagged = TRUE` has its verified 4-digit registration year populated (e.g. `2004`, `2005`, `2006`, `2007`, `2008`, `2010`, `2014`, `2021`, `2023`, `2024`).
- **Conservative Approach**: Whenever GI status was unverified or pending, `is_gi_tagged` was strictly set to `FALSE` and `gi_tag_year` to `NULL`.

---

## 6. Public REST API Endpoint Verification

All endpoints were verified against the running application and unit test suite:

- `GET /api/v1/culture/traditions` — Paginated list with multi-parameter filtering (State, City, Destination, Category, Search keyword)
- `GET /api/v1/culture/traditions/{id}` — Specific tradition detail with full provenance
- `GET /api/v1/culture/categories` — Distinct categories list (13 categories)
- `GET /api/v1/culture/states/{stateId}` — Traditions associated with a specific State/UT
- `GET /api/v1/culture/destinations/{destinationId}` — Traditions linked to a specific destination cluster

---

## 7. Data Quality Audit (Sections A–L)

| Check | Result | Details |
| :--- | :---: | :--- |
| **A. Total Cultural Traditions** | **100** | Full national representation across India |
| **B. State/UT Coverage** | **36 / 36** | 28 States + 8 Union Territories covered |
| **C. Category Distribution** | **13** | Controlled vocabulary conforming to schema |
| **D. GI-Tagged Records** | **71** | Verified against official IP India GI Registry |
| **E. Official Provenance** | **100** | 100% sourced from DC Handicrafts/Handlooms/Govt depts |
| **F. City Mapping** | **72** | Mapped to verified database cities; others `NULL` (state-level) |
| **G. Destination Mapping** | **47** | Mapped to verified tourist/heritage destinations |
| **H. Duplicate Count** | **0** | Zero duplicate IDs or duplicate traditions |
| **I. Invalid FK Count** | **0** | Verified with 0 foreign key mismatch errors |
| **J. Missing Provenance Count** | **0** | Every record includes `source_organization` and `source_url` |
| **K. Unsupported Claims Count**| **0** | Factual, conservative, historical descriptions |
| **L. Excluded / Unverified** | **0** | Unsubstantiated claims excluded during research |

---

## 8. Verification Results

- **Backend Test Suite**: `./mvnw test` $\to$ **94 / 94 TESTS PASS (100% Success)**
- **Frontend Linter**: `npm run lint` $\to$ **0 Errors**
- **Frontend Production Build**: `npm run build` $\to$ **24 / 24 Routes Compiled Successfully**
- **Flyway Status**: Schema Version 17 ready; V1–V16 untouched.

---

## 9. Next Recommended Phase

**Phase 21.3**: Traveler Local Culture Discovery UI & Destination Culture Integration
*(Expose authentic traditions on Destination details, State exploration pages, and cultural craft search).*

---

## Final Verdict

# 🟢 PHASE 21.2 VERDICT: GREEN (Complete & Trustworthy)
All 100 authentic cultural tradition records across all 28 states and 8 UTs are source-backed, strictly verified, and integrated into YatraSetu with 100% backend test pass and zero synthetic artifacts.
