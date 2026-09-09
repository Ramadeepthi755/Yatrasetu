import os
import psycopg2
import psycopg2.extras

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ENV_PATH = os.path.join(REPO_ROOT, '.env')

def load_env():
    env = {}
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env[k.strip()] = v.strip().strip("'").strip('"')
    return env

env = load_env()
db_url = env.get('SPRING_DATASOURCE_URL', '')
if db_url.startswith('jdbc:'):
    db_url = db_url[5:]

conn = psycopg2.connect(
    dbname=env.get('SPRING_DATASOURCE_DATABASE', 'postgres'),
    user=env.get('SPRING_DATASOURCE_USERNAME', 'postgres'),
    password=env.get('SPRING_DATASOURCE_PASSWORD', ''),
    host=env.get('SPRING_DATASOURCE_HOST', 'db.ngbmkquftbcpvbchuhew.supabase.co'),
    port=env.get('SPRING_DATASOURCE_PORT', '5432'),
    sslmode='require'
)

cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

# Check flyway version
cur.execute("SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;")
print("=== LATEST FLYWAY MIGRATIONS ===")
for r in cur.fetchall():
    print(f"Version: {r['version']}, Description: {r['description']}, Success: {r['success']}")

# Check states
cur.execute("SELECT count(*) as total, count(banner_image_url) as with_img FROM states;")
st = cur.fetchone()
print(f"\n=== STATES ===\nTotal: {st['total']}, With Banner Image: {st['with_img']}")

# Check traditions
cur.execute("SELECT count(*) as total, count(image_url) as with_img, count(*) - count(image_url) as unavail FROM cultural_traditions;")
tr = cur.fetchone()
print(f"\n=== CULTURAL TRADITIONS ===\nTotal: {tr['total']}, With Image: {tr['with_img']}, Honest Unavailable (NULL): {tr['unavail']}")

# Check destinations
cur.execute("SELECT count(*) as total, count(hero_image_url) as with_img FROM destinations;")
dst = cur.fetchone()
print(f"\n=== DESTINATIONS ===\nTotal: {dst['total']}, With Hero Image: {dst['with_img']}")

# Verify the 4 unavailable traditions
cur.execute("SELECT id, tradition_name, state_id, image_url FROM cultural_traditions WHERE image_url IS NULL ORDER BY id;")
print("\n=== UNAVAILABLE TRADITIONS (CONFIRMED NULL) ===")
for r in cur.fetchall():
    print(f"- {r['id']}: {r['tradition_name']} ({r['state_id']}) -> image_url is NULL (Honest unavailable)")

cur.close()
conn.close()
