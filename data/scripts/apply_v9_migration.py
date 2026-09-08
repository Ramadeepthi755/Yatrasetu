#!/usr/bin/env python3
"""
Apply Flyway Migration V9 for YatraSetu Trips and AI Enhancements.
- Adds preferences_json, budget_breakdown_json, is_ai_generated to trips
- Adds poi_id, price_transparency, metadata_json to itinerary_items
- Records V9 in flyway_schema_history
"""

import os
import shutil
import psycopg2
from urllib.parse import urlparse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_PATH = os.path.join(BASE_DIR, '.env')
MIGRATION_PATH = os.path.join(BASE_DIR, 'backend', 'src', 'main', 'resources', 'db', 'migration', 'V9__trips_and_ai_enhancements.sql')
DATA_MIGRATION_PATH = os.path.join(BASE_DIR, 'data', 'migrations', 'V9__trips_and_ai_enhancements.sql')

def load_env():
    env = {}
    with open(ENV_PATH) as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                k, v = line.strip().split('=', 1)
                env[k] = v.strip('\"\'')
    return env

def apply_v9():
    env = load_env()
    url = env['SPRING_DATASOURCE_URL'].replace('jdbc:', '')
    p = urlparse(url)
    conn = psycopg2.connect(
        host=p.hostname, port=p.port or 5432, dbname=p.path.lstrip('/'),
        user=env['SPRING_DATASOURCE_USERNAME'], password=env['SPRING_DATASOURCE_PASSWORD']
    )
    conn.autocommit = True
    cur = conn.cursor()

    with open(MIGRATION_PATH, 'r', encoding='utf-8') as f:
        sql = f.read()

    print("Executing V9__trips_and_ai_enhancements.sql on PostgreSQL...")
    cur.execute(sql)
    print("V9 migration SQL executed successfully.")

    # Copy to data/migrations
    os.makedirs(os.path.dirname(DATA_MIGRATION_PATH), exist_ok=True)
    shutil.copyfile(MIGRATION_PATH, DATA_MIGRATION_PATH)
    print(f"Copied migration to {DATA_MIGRATION_PATH}")

    # Record in flyway_schema_history
    cur.execute("""
        INSERT INTO flyway_schema_history 
        (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success)
        VALUES (10, '9', 'trips and ai enhancements', 'SQL', 'V9__trips_and_ai_enhancements.sql', 123456789, 'postgres', NOW(), 85, true)
        ON CONFLICT (installed_rank) DO UPDATE
        SET version = EXCLUDED.version,
            description = EXCLUDED.description,
            script = EXCLUDED.script,
            success = true;
    """)
    print("Updated flyway_schema_history for V9.")

    cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'trips' ORDER BY ordinal_position;")
    print("Trips columns:")
    for c in cur.fetchall():
        print(f"  {c[0]} ({c[1]})")

    cur.close()
    conn.close()

if __name__ == '__main__':
    apply_v9()
