#!/usr/bin/env python3
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from verify_corrections import CITY_CORRECTIONS

SQL_PATH_BACKEND = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    'backend', 'src', 'main', 'resources', 'db', 'migration',
    'V6__fix_city_geography_and_coordinates.sql'
)
SQL_PATH_DATA = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'migrations',
    'V6__fix_city_geography_and_coordinates.sql'
)

def generate_v6():
    lines = [
        "-- ==============================================================================",
        "-- V6__fix_city_geography_and_coordinates.sql",
        "-- Safe corrective migration for city geography, district, state & coordinates",
        "-- Fixes 61 cities previously populated with fallback coords (20.5937, 78.9629) or IN-DL",
        "-- Fixes 7 Srinagar local hosts mapped to IN-DL",
        "-- Adds IN-CG (Chhattisgarh) state record",
        "-- ==============================================================================",
        "",
        "-- 1. Ensure Chhattisgarh state exists",
        "INSERT INTO states (id, state_name, region, capital_city, description, created_at, updated_at)",
        "VALUES ('IN-CG', 'Chhattisgarh', 'Central India', 'Raipur', 'Explore the lush forests, ancient temples, waterfalls, and rich tribal heritage of Chhattisgarh.', NOW(), NOW())",
        "ON CONFLICT (id) DO NOTHING;",
        "",
        "-- 2. Correct geography, districts, and coordinates for all 61 affected cities",
    ]

    for city_id in sorted(CITY_CORRECTIONS.keys()):
        city_name, district, state_id, lat, lon = CITY_CORRECTIONS[city_id]
        dist_escaped = district.replace("'", "''")
        lines.append(
            f"UPDATE cities SET state_id = '{state_id}', district_name = '{dist_escaped}', "
            f"latitude = {lat:.7f}, longitude = {lon:.7f}, updated_at = NOW() "
            f"WHERE id = '{city_id}';"
        )

    lines.extend([
        "",
        "-- 3. Correct Srinagar local hosts that fell back to IN-DL due to 'and' vs '&' naming",
        "UPDATE local_hosts SET state_id = 'IN-JK', updated_at = NOW()",
        "WHERE city_id = 'srinagar' AND state_id = 'IN-DL';",
        ""
    ])

    sql_content = "\n".join(lines)
    
    with open(SQL_PATH_BACKEND, 'w') as f:
        f.write(sql_content)
    print(f"Wrote {SQL_PATH_BACKEND}")

    with open(SQL_PATH_DATA, 'w') as f:
        f.write(sql_content)
    print(f"Wrote {SQL_PATH_DATA}")

if __name__ == '__main__':
    generate_v6()
