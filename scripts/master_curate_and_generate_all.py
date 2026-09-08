import json
import urllib.parse
import os
import sys
from state_queries import STATE_CONFIGS
from tradition_queries import TRADITION_CONFIGS
from batch_resolver import resolve_item, verify_url
from concurrent.futures import ThreadPoolExecutor

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Load raw JSONs
with open(os.path.join(REPO_ROOT, 'data/raw_db_states.json')) as f:
    raw_states = json.load(f)

with open(os.path.join(REPO_ROOT, 'data/raw_db_destinations.json')) as f:
    raw_destinations = json.load(f)

with open(os.path.join(REPO_ROOT, 'data/raw_db_traditions.json')) as f:
    raw_traditions = json.load(f)

print("=== 1. CURATING 36 STATES ===")
def process_state(s):
    sid = s['id']
    cfg = STATE_CONFIGS.get(sid, {'queries': [s['stateName']], 'fallbacks': []})
    url, source, sz, ct, dims = resolve_item(cfg['queries'], cfg.get('fallbacks'))
    return {
        'id': sid,
        'name': s['stateName'],
        'region': s.get('region'),
        'landmark': cfg.get('landmark', s['stateName']),
        'url': url,
        'source': source,
        'size': sz,
        'ctype': ct,
        'dims': dims,
        'status': 'PASS' if url else 'FAIL'
    }

with ThreadPoolExecutor(max_workers=10) as ex:
    curated_states = list(ex.map(process_state, raw_states))

st_pass = sum(1 for s in curated_states if s['status'] == 'PASS')
print(f"States Result: {st_pass}/36 PASS")

print("\n=== 2. CURATING 100 CULTURAL TRADITIONS ===")
def process_tradition(t):
    tid = t['id']
    cfg = TRADITION_CONFIGS.get(tid, {'queries': [t['traditionName'], t.get('craftType', '')], 'fallbacks': []})
    url, source, sz, ct, dims = resolve_item(cfg['queries'], cfg.get('fallbacks'))
    return {
        'id': tid,
        'name': t['traditionName'],
        'state': t.get('stateName') or t.get('stateId'),
        'craft': t.get('craftType'),
        'category': t.get('category'),
        'cluster': t.get('primaryProducingCluster'),
        'url': url,
        'source': source,
        'size': sz,
        'ctype': ct,
        'dims': dims,
        'status': 'PASS' if url else 'FAIL'
    }

with ThreadPoolExecutor(max_workers=15) as ex:
    curated_traditions = list(ex.map(process_tradition, raw_traditions))

tr_pass = sum(1 for t in curated_traditions if t['status'] == 'PASS')
print(f"Traditions Result: {tr_pass}/100 PASS")

print("\n=== 3. CURATING 164 DESTINATIONS ===")
def process_destination(d):
    did = d['id']
    name = d['destinationName']
    state = d.get('stateName', '')
    city = d.get('cityName', '')
    clean_name = name.split('(')[0].split('–')[0].split('&')[0].strip()
    
    # Try existing URL if valid
    existing_url = d.get('heroImageUrl', '')
    fallbacks = []
    if existing_url:
        clean_ext = existing_url.split('?')[0]
        fallbacks.append(clean_ext)
        fname = urllib.parse.unquote(clean_ext.split('/')[-1])
        if fname.startswith('3840px-') or fname.startswith('1280px-') or fname.startswith('800px-'):
            fname = '-'.join(fname.split('-')[1:])
        fallbacks.append(f"https://commons.wikimedia.org/wiki/Special:FilePath/{urllib.parse.quote(fname)}?width=1200")
        fallbacks.append(f"https://commons.wikimedia.org/wiki/Special:FilePath/{fname}?width=1200")
    
    queries = [
        name,
        f"{clean_name} {city}".strip(),
        f"{clean_name} {state}".strip(),
        clean_name,
        f"{city} {state}".strip() if city else state,
        city
    ]
    
    url, source, sz, ct, dims = resolve_item(queries, fallbacks)
    return {
        'id': did,
        'name': name,
        'state': state,
        'city': city,
        'district': d.get('district'),
        'url': url,
        'source': source,
        'size': sz,
        'ctype': ct,
        'dims': dims,
        'status': 'PASS' if url else 'FAIL'
    }

with ThreadPoolExecutor(max_workers=20) as ex:
    curated_destinations = list(ex.map(process_destination, raw_destinations))

dst_pass = sum(1 for d in curated_destinations if d['status'] == 'PASS')
print(f"Destinations Result: {dst_pass}/164 PASS")

# Save curated datasets
os.makedirs(os.path.join(REPO_ROOT, 'docs/curated_data'), exist_ok=True)
with open(os.path.join(REPO_ROOT, 'docs/curated_data/states.json'), 'w') as f:
    json.dump(curated_states, f, indent=2)

with open(os.path.join(REPO_ROOT, 'docs/curated_data/destinations.json'), 'w') as f:
    json.dump(curated_destinations, f, indent=2)

with open(os.path.join(REPO_ROOT, 'docs/curated_data/traditions.json'), 'w') as f:
    json.dump(curated_traditions, f, indent=2)

print("\nDatasets saved to docs/curated_data/")

# Generate Flyway V27 Migration SQL
v27_sql_path = os.path.join(REPO_ROOT, 'backend/src/main/resources/db/migration/V27__curate_authentic_images_for_states_traditions_destinations.sql')
with open(v27_sql_path, 'w') as f:
    f.write("-- ============================================================================\n")
    f.write("-- YatraSetu Migration V27: Curate Authentic Place & Craft Photography\n")
    f.write("-- ============================================================================\n")
    f.write("-- 1. Update 36 States & UTs with place-specific verified banner images\n")
    f.write("-- 2. Update 100 Cultural Traditions with verified craft/art photography\n")
    f.write("-- 3. Update 164 Destinations with verified destination hero images\n")
    f.write("-- ============================================================================\n\n")

    f.write("-- ----------------------------------------------------------------------------\n")
    f.write("-- SECTION 1: 36 STATES & UNION TERRITORIES BANNER IMAGES\n")
    f.write("-- ----------------------------------------------------------------------------\n")
    for s in curated_states:
        if s['url']:
            clean_u = s['url'].replace("'", "''")
            f.write(f"UPDATE states SET banner_image_url = '{clean_u}', updated_at = NOW() WHERE id = '{s['id']}';\n")

    f.write("\n-- ----------------------------------------------------------------------------\n")
    f.write("-- SECTION 2: 100 CULTURAL TRADITION AUTHENTIC CRAFT IMAGES\n")
    f.write("-- ----------------------------------------------------------------------------\n")
    for t in curated_traditions:
        if t['url']:
            clean_u = t['url'].replace("'", "''")
            f.write(f"UPDATE cultural_traditions SET image_url = '{clean_u}', updated_at = NOW() WHERE id = '{t['id']}';\n")
        else:
            f.write(f"UPDATE cultural_traditions SET image_url = NULL, updated_at = NOW() WHERE id = '{t['id']}';\n")

    f.write("\n-- ----------------------------------------------------------------------------\n")
    f.write("-- SECTION 3: 164 DESTINATION HERO IMAGES\n")
    f.write("-- ----------------------------------------------------------------------------\n")
    for d in curated_destinations:
        if d['url']:
            clean_u = d['url'].replace("'", "''")
            f.write(f"UPDATE destinations SET hero_image_url = '{clean_u}', updated_at = NOW() WHERE id = '{d['id']}';\n")
        else:
            f.write(f"UPDATE destinations SET hero_image_url = NULL, updated_at = NOW() WHERE id = '{d['id']}';\n")

print(f"Generated Flyway migration: {v27_sql_path}")
