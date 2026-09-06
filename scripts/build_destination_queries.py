import json
import urllib.parse
from master_resolver import find_verified_url_for_query, verify_single_url
from concurrent.futures import ThreadPoolExecutor

with open('/Users/kumarjd/.gemini/antigravity-ide/brain/930bdc6f-e6c4-4c9f-a1a6-299f5766828b/scratch/destinations.json') as f:
    destinations = json.load(f)

print(f"Generating queries for {len(destinations)} destinations...")

def get_destination_queries(d):
    name = d['destinationName']
    state = d.get('stateName', '')
    city = d.get('cityName', '')
    dist = d.get('district', '')
    
    # Strip circuit suffixes for clean queries
    clean_name = name.split('(')[0].split('–')[0].split('&')[0].strip()
    
    queries = [
        f"{name}",
        f"{clean_name} {city}".strip(),
        f"{clean_name} {state}".strip(),
        f"{clean_name}",
        f"{city} {state}".strip(),
        f"{city}"
    ]
    return [q for q in queries if q]

def resolve_dest(d):
    did = d['id']
    queries = get_destination_queries(d)
    
    # Also check if existing heroImageUrl was already valid
    existing_url = d.get('heroImageUrl')
    if existing_url and '?' in existing_url and 'wikimedia' in existing_url:
        clean_existing = existing_url.split('?')[0]
        ok, st, sz, ct = verify_single_url(clean_existing)
        if ok:
            return {
                'id': did,
                'name': d['destinationName'],
                'state': d.get('stateName'),
                'city': d.get('cityName'),
                'url': clean_existing,
                'filename': clean_existing.split('/')[-1],
                'size': sz,
                'ctype': ct,
                'status': 'PASS'
            }
    
    url, filename, size, ctype = find_verified_url_for_query(queries)
    return {
        'id': did,
        'name': d['destinationName'],
        'state': d.get('stateName'),
        'city': d.get('cityName'),
        'url': url,
        'filename': filename,
        'size': size,
        'ctype': ctype,
        'status': 'PASS' if url else 'FAIL'
    }

print("Resolving all 164 Destinations in parallel...")
with ThreadPoolExecutor(max_workers=20) as ex:
    dest_results = list(ex.map(resolve_dest, destinations))

passed = [d for d in dest_results if d['status'] == 'PASS']
failed = [d for d in dest_results if d['status'] != 'PASS']
print(f"Destinations Resolved: {len(passed)}/164 PASS (Failed: {len(failed)})\n")

for d in failed:
    print(f"FAILED: [{d['id']}] {d['name']} ({d['state']})")

with open('/Users/kumarjd/.gemini/antigravity-ide/brain/930bdc6f-e6c4-4c9f-a1a6-299f5766828b/scratch/curated_destinations.json', 'w') as f:
    json.dump(dest_results, f, indent=2)

print("Saved scratch/curated_destinations.json")
