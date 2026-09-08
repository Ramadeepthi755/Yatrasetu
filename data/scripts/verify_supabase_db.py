#!/usr/bin/env python3
"""
YatraSetu Supabase PostgreSQL Verification & Inspection Tool
Safely tests database connection, inspects tables, row counts, and Flyway history.
NEVER prints passwords or secrets.
"""

import os
import sys
import psycopg2
from urllib.parse import urlparse

ENV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env')

def load_env():
    env_vars = {}
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env_vars[k.strip()] = v.strip().strip("'").strip('"')
    return env_vars

def get_db_params():
    env_vars = load_env()
    jdbc_url = env_vars.get('SPRING_DATASOURCE_URL') or os.environ.get('SPRING_DATASOURCE_URL')
    user = env_vars.get('SPRING_DATASOURCE_USERNAME') or os.environ.get('SPRING_DATASOURCE_USERNAME') or 'postgres'
    password = env_vars.get('SPRING_DATASOURCE_PASSWORD') or os.environ.get('SPRING_DATASOURCE_PASSWORD')

    if not jdbc_url or 'YOUR_PROJECT_REF' in jdbc_url:
        return None, None, None, None, None, "SPRING_DATASOURCE_URL not configured in .env"
    if not password or 'YOUR_SUPABASE_DB_PASSWORD' in password:
        return None, None, None, None, None, "SPRING_DATASOURCE_PASSWORD not configured in .env"

    # Parse jdbc:postgresql://host:port/dbname?sslmode=require
    clean_url = jdbc_url
    if clean_url.startswith('jdbc:'):
        clean_url = clean_url[5:]
    
    parsed = urlparse(clean_url)
    host = parsed.hostname
    port = parsed.port or 5432
    dbname = parsed.path.lstrip('/') if parsed.path else 'postgres'

    return host, port, dbname, user, password, None

def verify_db():
    host, port, dbname, user, password, err = get_db_params()
    if err:
        print(f"CONFIG_STATUS: {err}")
        return False

    print(f"Connecting to PostgreSQL host: {host}:{port}, db: {dbname}...")
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            dbname=dbname,
            user=user,
            password=password,
            sslmode='require',
            connect_timeout=10
        )
        cur = conn.cursor()

        # Check version
        cur.execute("SELECT version();")
        version = cur.fetchone()[0]
        print(f"PostgreSQL Version: {version.split(',')[0]}")

        # Check existing public tables
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = [r[0] for r in cur.fetchall()]
        print(f"Public Tables Count: {len(tables)}")
        print(f"Tables: {', '.join(tables) if tables else 'None (Fresh/Empty DB)'}")

        # Check flyway_schema_history
        if 'flyway_schema_history' in tables:
            cur.execute("SELECT version, description, type, script, success FROM flyway_schema_history ORDER BY installed_rank;")
            rows = cur.fetchall()
            print("\n--- Flyway Schema History ---")
            for r in rows:
                print(f"V{r[0]}: {r[1]} ({r[3]}) - Success: {r[4]}")

        # Count rows in application tables
        expected_tables = [
            'states', 'cities', 'destinations', 'destination_pois', 'hotels',
            'users', 'profiles', 'local_hosts', 'experiences', 'travel_buddies',
            'travel_buddy_requests', 'trips', 'itineraries', 'itinerary_items',
            'bookings', 'payments', 'reviews', 'user_history', 'notifications',
            'tourism_transactions', 'tourism_impact', 'audit_logs'
        ]
        
        counts = {}
        for t in expected_tables:
            if t in tables:
                cur.execute(f"SELECT COUNT(*) FROM {t};")
                counts[t] = cur.fetchone()[0]
            else:
                counts[t] = 'NOT_FOUND'

        print("\n--- Actual Table Row Counts ---")
        for t, c in counts.items():
            print(f"{t}: {c}")

        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"DATABASE_CONNECTION_ERROR: {e}")
        return False

if __name__ == '__main__':
    verify_db()
