import sys
from state_mappings import STATE_IMAGE_MAPPINGS
from image_verifier import verify_image_url
from concurrent.futures import ThreadPoolExecutor

print("=== VERIFYING 36 STATES IMAGERY ===")
items = []
for state_id, info in STATE_IMAGE_MAPPINGS.items():
    items.append({
        'id': state_id,
        'name': info['name'],
        'landmark': info['landmark'],
        'image_url': info['url']
    })

with ThreadPoolExecutor(max_workers=15) as ex:
    results = list(ex.map(verify_image_url, items))

pass_count = sum(1 for r in results if r['validation']['status'] == 'PASS')
print(f"Verified States: {pass_count}/{len(results)} PASS\n")

for r in results:
    v = r['validation']
    print(f"[{r['id']}] {r['name']} ({r['landmark']}) -> {v['status']} (HTTP {v['http_code']}, {v['content_type']}, {v['dimensions']}, {v['size_bytes']} bytes)")
    if v['status'] != 'PASS':
        print(f"   FAILED URL: {r['image_url']} (Error: {v['error']})")
