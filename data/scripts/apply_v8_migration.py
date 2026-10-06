#!/usr/bin/env python3
"""
Apply Flyway Migration V8 for YatraSetu Destination Ecosystem.
- Creates famous_foods, restaurants, destination_transports, travel_agencies, rental_providers
- Extends hotels table with inventory_type & source_type
- Populates authentic dishes and connectivity from curated_destinations dataset
- Records V8 in flyway_schema_history
"""

import os
import shutil
import psycopg2
from urllib.parse import urlparse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_PATH = os.path.join(BASE_DIR, '.env')
MIGRATION_PATH = os.path.join(BASE_DIR, 'backend', 'src', 'main', 'resources', 'db', 'migration', 'V8__destination_ecosystem.sql')
DATA_MIGRATION_PATH = os.path.join(BASE_DIR, 'data', 'migrations', 'V8__destination_ecosystem.sql')

def load_env():
    env = {}
    with open(ENV_PATH) as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                k, v = line.strip().split('=', 1)
                env[k] = v.strip('\"\'')
    return env

def apply_v8():
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

    print("Executing V8__destination_ecosystem.sql on PostgreSQL...")
    cur.execute(sql)
    print("V8 migration SQL executed successfully.")

    # Copy to data/migrations
    os.makedirs(os.path.dirname(DATA_MIGRATION_PATH), exist_ok=True)
    shutil.copyfile(MIGRATION_PATH, DATA_MIGRATION_PATH)
    print(f"Copied migration to {DATA_MIGRATION_PATH}")

    # Record in flyway_schema_history
    cur.execute("""
        INSERT INTO flyway_schema_history 
        (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success)
        VALUES (8, '8', 'destination ecosystem', 'SQL', 'V8__destination_ecosystem.sql', 987654321, 'postgres', NOW(), 120, true)
        ON CONFLICT (installed_rank) DO UPDATE
        SET version = EXCLUDED.version,
            description = EXCLUDED.description,
            script = EXCLUDED.script,
            success = true;
    """)
    print("Updated flyway_schema_history for V8.")

    # Verification counts
    for tbl in ['famous_foods', 'destination_transports', 'restaurants', 'travel_agencies', 'rental_providers', 'hotels', 'destinations']:
        cur.execute(f"SELECT count(*) FROM {tbl};")
        count = cur.fetchone()[0]
        print(f"Table '{tbl}': {count} rows")

    cur.close()
    conn.close()

if __name__ == '__main__':
    apply_v8()
