#!/usr/bin/env python3
import psycopg2
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from verify_supabase_db import get_db_params

def get_affected_cities():
    host, port, dbname, user, password, err = get_db_params()
    conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password, sslmode='require')
    cur = conn.cursor()

    cur.execute("""
        SELECT c.id, c.city_name, c.district_name, c.state_id, s.state_name, c.latitude, c.longitude
        FROM cities c
        LEFT JOIN states s ON c.state_id = s.id
        WHERE c.state_id = 'IN-DL' AND c.id NOT IN ('delhi', 'new-delhi')
           OR (abs(c.latitude - 20.5937) < 0.001 AND abs(c.longitude - 78.9629) < 0.001)
        ORDER BY c.city_name;
    """)
    rows = cur.fetchall()
    print(f"Total affected cities: {len(rows)}")
    for r in rows:
        print(f"'{r[0]}': ('{r[1]}', '{r[2]}', '{r[3]}', '{r[4]}', {r[5]}, {r[6]}),")

    cur.close()
    conn.close()

if __name__ == '__main__':
    get_affected_cities()
