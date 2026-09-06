import json
import urllib.parse
from master_resolver import find_verified_url_for_query, verify_single_url
from concurrent.futures import ThreadPoolExecutor

# 1. Curate 36 States
STATE_QUERIES = {
    "IN-AN": ["Radhanagar Beach Havelock Island", "Havelock Island Andaman", "Cellular Jail Port Blair"],
    "IN-AP": ["Tirumala 090615", "Tirumala Venkateswara Temple", "Araku Valley Andhra Pradesh"],
    "IN-AR": ["Tawang Monastery, Arunachal Pradesh", "Tawang Monastery", "Arunachal Pradesh landscape"],
    "IN-AS": ["Indian rhino pair in Kaziranga National Park", "Kaziranga National Park", "Kamakhya Temple Guwahati"],
    "IN-BR": ["Mahabodhi Temple Bodh Gaya", "Nalanda University Ruins", "Nalanda archaeological site"],
    "IN-CH": ["Rock Garden of Chandigarh", "Chandigarh Capitol Complex", "Sukhna Lake Chandigarh"],
    "IN-CG": ["Chitrakote Falls", "Chitrakote Waterfalls Bastar", "Chitrakot Waterfall"],
    "IN-DH": ["Diu Fort", "Fort of Diu", "Naida Caves Diu"],
    "IN-DL": ["Humayun's Tomb in Delhi", "India Gate Delhi", "Qutb Minar Delhi"],
    "IN-GA": ["Basilica of Bom Jesus", "Palolem Beach Goa", "Dudhsagar Falls Goa"],
    "IN-GJ": ["Sun Temple Modhera Gujarat", "Rann of Kutch", "Statue of Unity"],
    "IN-HR": ["Brahma Sarovar Kurukshetra", "Kurukshetra Brahma Sarovar", "Sultanpur National Park"],
    "IN-HP": ["Key Monastery Spiti", "Spiti Valley Himachal Pradesh", "Rohtang Pass Himachal"],
    "IN-JK": ["Dal Lake Hazratbal Srinagar", "Dal Lake Srinagar", "Gulmarg Jammu Kashmir"],
    "IN-JH": ["Hundru Falls Ranchi", "Baidyanath Temple Deoghar", "Betla National Park"],
    "IN-KA": ["Virupaksha Temple Hampi", "Mysore Palace Karnataka", "Hampi monuments"],
    "IN-KL": ["Houseboat in Kerala Backwaters", "Alleppey backwaters Kerala", "Munnar tea gardens"],
    "IN-LA": ["Pangong Tso Ladakh", "Pangong Lake", "Leh Palace Ladakh"],
    "IN-LD": ["Agatti Island Lakshadweep", "Bangaram Island Lakshadweep", "Kavaratti Lakshadweep"],
    "IN-MP": ["Khajuraho Group of Monuments", "Kandariya Mahadeva Temple", "Gwalior Fort Madhya Pradesh"],
    "IN-MH": ["Mumbai 03-2016 30 Gateway of India", "Gateway of India Mumbai", "Ellora Caves Maharashtra"],
    "IN-MN": ["Loktak Lake Manipur", "Keibul Lamjao National Park", "Kangla Fort Imphal"],
    "IN-ML": ["Living Root Bridges Cherrapunji", "Double Decker Living Root Bridge", "Nohkalikai Falls Meghalaya"],
    "IN-MZ": ["Vantawng Falls", "Aizawl Mizoram", "Reiek Mizoram"],
    "IN-NL": ["Dzukou Valley", "Kisama Heritage Village Nagaland", "Hornbill Festival Nagaland"],
    "IN-OD": ["Konarka Temple", "Konark Sun Temple", "Jagannath Temple Puri"],
    "IN-PY": ["Promenade Beach Pondicherry", "Auroville Matrimandir", "Puducherry French Quarter"],
    "IN-PB": ["Golden Temple Amritsar India", "Harmandir Sahib Amritsar", "Golden Temple Amritsar"],
    "IN-RJ": ["Hawa Mahal 2011", "Hawa Mahal Jaipur", "Amber Fort Jaipur"],
    "IN-SK": ["Gurudongmar Lake Sikkim", "Kanchenjunga Sikkim", "Rumtek Monastery Sikkim"],
    "IN-TN": ["An aerial view of Madurai city from atop of Meenakshi Amman temple", "Meenakshi Amman Temple Madurai", "Brihadisvara Temple Thanjavur"],
    "IN-TG": ["Charminar Hyderabad 1", "Golconda Fort Hyderabad", "Charminar Hyderabad"],
    "IN-TR": ["Unakoti Rock Carvings", "Unakoti Tripura", "Ujjayanta Palace Agartala"],
    "IN-UP": ["Taj Mahal, Agra, India", "Taj Mahal Agra", "Varanasi Ganga Ghats"],
    "IN-UT": ["Kedarnath Temple", "Badrinath Temple Uttarakhand", "Rishikesh Ganga Uttarakhand"],
    "IN-WB": ["Victoria Memorial Kolkata", "Howrah Bridge Kolkata", "Darjeeling Himalayan Railway"]
}

def resolve_state(item):
    sid, queries = item
    url, filename, size, ctype = find_verified_url_for_query(queries)
    return {
        'state_id': sid,
        'queries': queries,
        'url': url,
        'filename': filename,
        'size': size,
        'ctype': ctype,
        'status': 'PASS' if url else 'FAIL'
    }

print("Resolving all 36 States...")
with ThreadPoolExecutor(max_workers=10) as ex:
    state_results = list(ex.map(resolve_state, STATE_QUERIES.items()))

passed = [s for s in state_results if s['status'] == 'PASS']
print(f"States Resolved: {len(passed)}/36 PASS\n")
for s in state_results:
    print(f"[{s['state_id']}] -> {s['status']} | {s.get('filename')} | {s.get('size')} bytes")
    if s['status'] != 'PASS':
        print(f"   FAILED queries: {s['queries']}")

with open('/Users/kumarjd/.gemini/antigravity-ide/brain/930bdc6f-e6c4-4c9f-a1a6-299f5766828b/scratch/curated_states.json', 'w') as f:
    json.dump(state_results, f, indent=2)
