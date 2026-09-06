import json
import os

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

with open(os.path.join(REPO_ROOT, 'docs/curated_data/states.json')) as f:
    states = json.load(f)

with open(os.path.join(REPO_ROOT, 'docs/curated_data/traditions.json')) as f:
    traditions = json.load(f)

with open(os.path.join(REPO_ROOT, 'docs/curated_data/destinations.json')) as f:
    destinations = json.load(f)

v27_path = os.path.join(REPO_ROOT, 'backend/src/main/resources/db/migration/V27__curate_authentic_images_for_states_traditions_destinations.sql')

with open(v27_path, 'w') as f:
    f.write("-- ============================================================================\n")
    f.write("-- YatraSetu Migration V27: Curate Authentic Place & Craft Photography\n")
    f.write("-- ============================================================================\n")
    f.write("-- 1. Update 36 States & UTs with place-specific verified banner images\n")
    f.write("-- 2. Update 100 Cultural Traditions with verified craft photography (or NULL for honest unavailable)\n")
    f.write("-- 3. Update 164 Destinations with verified destination hero images\n")
    f.write("-- ============================================================================\n\n")

    f.write("-- ----------------------------------------------------------------------------\n")
    f.write("-- SECTION 1: 36 STATES & UNION TERRITORIES BANNER IMAGES\n")
    f.write("-- ----------------------------------------------------------------------------\n")
    for s in states:
        sid = s['id']
        url = s.get('url')
        if url:
            escaped_url = url.replace("'", "''")
            f.write(f"UPDATE states SET banner_image_url = '{escaped_url}', updated_at = NOW() WHERE id = '{sid}';\n")
        else:
            f.write(f"UPDATE states SET banner_image_url = NULL, updated_at = NOW() WHERE id = '{sid}';\n")

    f.write("\n-- ----------------------------------------------------------------------------\n")
    f.write("-- SECTION 2: 100 CULTURAL TRADITIONS CRAFT IMAGES\n")
    f.write("-- ----------------------------------------------------------------------------\n")
    for t in traditions:
        tid = t['id']
        url = t.get('url')
        if url and t.get('status') == 'PASS':
            escaped_url = url.replace("'", "''")
            f.write(f"UPDATE cultural_traditions SET image_url = '{escaped_url}', updated_at = NOW() WHERE id = '{tid}';\n")
        else:
            f.write(f"UPDATE cultural_traditions SET image_url = NULL, updated_at = NOW() WHERE id = '{tid}';\n")

    f.write("\n-- ----------------------------------------------------------------------------\n")
    f.write("-- SECTION 3: 164 DESTINATIONS HERO IMAGES\n")
    f.write("-- ----------------------------------------------------------------------------\n")
    for d in destinations:
        did = d['id']
        url = d.get('url')
        if url and d.get('status') == 'PASS':
            escaped_url = url.replace("'", "''")
            f.write(f"UPDATE destinations SET hero_image_url = '{escaped_url}', updated_at = NOW() WHERE id = '{did}';\n")
        else:
            f.write(f"UPDATE destinations SET hero_image_url = NULL, updated_at = NOW() WHERE id = '{did}';\n")

print(f"Generated clean V27 migration SQL at: {v27_path}")
