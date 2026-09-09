import json

with open('/Users/kumarjd/Yatrasetu/docs/curated_data/traditions.json') as f:
    traditions = json.load(f)

failed = [t for t in traditions if t['status'] != 'PASS']
print(f"Failed traditions: {len(failed)}")
for t in failed:
    print(f"[{t['id']}] {t['name']} ({t['state']}) - craft: {t.get('craft')}")
