#!/usr/bin/env python3
import psycopg2
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from verify_supabase_db import get_db_params

def audit():
    host, port, dbname, user, password, err = get_db_params()
    conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password, sslmode='require')
    cur = conn.cursor()

    print("=== 1. HYDERABAD ROW ===")
    cur.execute("""
        SELECT c.id, c.city_name, c.district_name, c.state_id, s.state_name, c.latitude, c.longitude
        FROM cities c
        LEFT JOIN states s ON c.state_id = s.id
        WHERE c.id = 'hyderabad' OR c.city_name ILIKE '%hyderabad%';
    """)
    for r in cur.fetchall():
        print(r)

    print("\n=== 2. CITIES WITH DEFAULT COORDINATES (20.5937, 78.9629) ===")
    cur.execute("""
        SELECT c.id, c.city_name, c.district_name, c.state_id, s.state_name, c.latitude, c.longitude
        FROM cities c
        LEFT JOIN states s ON c.state_id = s.id
        WHERE ABS(c.latitude - 20.5937) < 0.0001 AND ABS(c.longitude - 78.9629) < 0.0001
        ORDER BY c.city_name;
    """)
    rows = cur.fetchall()
    print(f"Count: {len(rows)}")
    for r in rows:
        print(f"  {r[0]}: {r[1]} | State: {r[3]} ({r[4]}) | Coords: ({r[5]}, {r[6]})")

    print("\n=== 3. CITIES WITH STATE IN-DL (DELHI) ===")
    cur.execute("""
        SELECT c.id, c.city_name, c.district_name, c.state_id, s.state_name, c.latitude, c.longitude
        FROM cities c
        LEFT JOIN states s ON c.state_id = s.id
        WHERE c.state_id = 'IN-DL'
        ORDER BY c.city_name;
    """)
    rows = cur.fetchall()
    print(f"Count: {len(rows)}")
    for r in rows:
        print(f"  {r[0]}: {r[1]} | Coords: ({r[5]}, {r[6]})")

    print("\n=== 4. TOTAL CITIES IN DB ===")
    cur.execute("""
        SELECT c.id, c.city_name, c.district_name, c.state_id, s.state_name, c.latitude, c.longitude
        FROM cities c
        LEFT JOIN states s ON c.state_id = s.id
        ORDER BY c.city_name;
    """)
    all_cities = cur.fetchall()
    print(f"Total cities: {len(all_cities)}")

    cur.close()
    conn.close()

if __name__ == '__main__':
    audit()
