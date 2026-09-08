import json
import urllib.parse
import ssl
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from batch_resolver import verify_url, search_wikimedia, get_wikipedia_lead_image

TRADITION_CANONICAL_ENTRIES = {
    "cult-an-nicobar-mat": ["Nicobarese people", "Andaman and Nicobar Islands", "Nicobar Islands"],
    "cult-an-shell-craft": ["Seashell", "Shell craft", "Shell jewelry"],
    "cult-ap-dharmavaram": ["Dharmavaram handloom pattu sarees and paavadas", "Sari", "Silk in the Indian subcontinent"],
    "cult-ap-kalamkari": ["Kalamkari", "Srikalahasti style of Kalamkari", "Machilipatnam Kalamkari"],
    "cult-ap-kondapalli": ["Kondapalli toys", "Kondapalli", "Wooden toys"],
    "cult-ap-machilipatnam": ["Machilipatnam Kalamkari", "Woodblock printing on textiles", "Block printing"],
    "cult-ar-apatani-weave": ["Apatani people", "Textiles of Arunachal Pradesh", "Apatani"],
    "cult-ar-monpa-paper": ["Monpa people", "Handmade paper", "Tawang"],
    "cult-ar-wancho-wood": ["Wancho people", "Wood carving", "Naga people"],
    "cult-as-majuli-mask": ["Majuli", "Samaguri Satra", "Assamese culture"],
    "cult-as-muga-silk": ["Assam silk", "Muga silk", "Mekhela chador"],
    "cult-as-sarthebari": ["Bell metal", "Brass", "Sarthebari"],
    "cult-br-madhubani": ["Madhubani art", "Mithila painting", "Madhubani"],
    "cult-br-sikki": ["Sikki grass craft", "Basket weaving", "Handicrafts of Bihar"],
    "cult-br-sujuni": ["Sujani embroidery", "Embroidery of India", "Kantha"],
    "cult-cg-bastar-dhokra": ["Dhokra", "Bastar district", "Lost-wax casting"],
    "cult-cg-bastar-iron": ["Wrought iron", "Blacksmith", "Bastar district"],
    "cult-cg-terracotta": ["Terracotta", "Pottery in the Indian subcontinent", "Clay"],
    "cult-ch-assemblage": ["Rock Garden of Chandigarh", "Nek Chand", "Outsider art"],
    "cult-dh-warli": ["Warli painting", "Warli", "Dadra and Nagar Haveli"],
    "cult-dl-meenakari": ["Meenakari", "Vitreous enamel", "Jewellery of India"],
    "cult-dl-zardozi": ["Zardozi", "Zari", "Embroidery of India"],
    "cult-ga-azulejos": ["Azulejo", "Architecture of Goa", "Ceramic tile"],
    "cult-ga-kunbi": ["Kunbi", "Textiles of Goa", "Sari"],
    "cult-gj-bandhani": ["Bandhani", "Tie-dye", "Textiles of Gujarat"],
    "cult-gj-kutch-lippan": ["Mud relief", "Kutch district", "Bhunga"],
    "cult-gj-patan-patola": ["Patola sari", "Ikat", "Double ikat"],
    "cult-gj-rogan": ["Rogan painting", "Kutch district", "Castor oil"],
    "cult-hp-chamba-rumal": ["Chamba Rumal", "Chamba, Himachal Pradesh", "Embroidery of India"],
    "cult-hp-kangra-painting": ["Kangra painting", "Pahari painting", "Miniature painting"],
    "cult-hp-kullu-shawl": ["Kullu Shawl", "Kullu", "Shawl"],
    "cult-hr-panipat-handloom": ["Panipat", "Dhurrie", "Handloom"],
    "cult-hr-rewari-metal": ["Rewari", "Brass", "Utensil"],
    "cult-jh-dhokra": ["Dhokra", "Jharkhand", "Tribal art"],
    "cult-jh-sohrai-khovar": ["Sohrai", "Khovar", "Hazaribagh"],
    "cult-jk-kani": ["Pashmina", "Kashmir shawl", "Weaving"],
    "cult-jk-paper-mache": ["Kashmir papier-mache", "Papier-mâché", "Handicrafts of Kashmir"],
    "cult-jk-pashmina": ["Pashmina", "Cashmere wool", "Kashmir shawl"],
    "cult-jk-wood-carving": ["Walnut wood", "Wood carving", "Kashmir"],
    "cult-ka-bidriware": ["Bidriware", "Bidar", "Inlay"],
    "cult-ka-channapatna": ["Channapatna toys", "Lacquerware", "Wooden toy"],
    "cult-ka-ilkal": ["Ilkal sari", "Bagalkot", "Sari"],
    "cult-ka-mysore-silk": ["Mysore silk", "Mysore", "Silk in the Indian subcontinent"],
    "cult-kl-aranmula": ["Aranmula kannadi", "Metal mirror", "Aranmula"],
    "cult-kl-balaramapuram": ["Kasavu", "Mundu", "Balaramapuram"],
    "cult-kl-coir": ["Coir", "Kerala", "Coconut"],
    "cult-kl-kathakali": ["Kathakali", "Classical Indian dance", "Kerala"],
    "cult-la-pashmina": ["Changthangi goat", "Ladakh", "Changpa"],
    "cult-la-thangka": ["Thangka", "Tibetan art", "Ladakh"],
    "cult-la-wood-carving": ["Tibetan architecture", "Wood carving", "Ladakh"],
    "cult-ld-coir-craft": ["Lakshadweep", "Coir", "Coconut"],
    "cult-mh-kolhapuri": ["Kolhapuri chappal", "Kolhapur", "Leather crafting"],
    "cult-mh-paithani": ["Paithani", "Yeola", "Sari"],
    "cult-mh-warli": ["Warli painting", "Warli", "Folk art"],
    "cult-ml-khasi-cane": ["Khasi people", "Bamboo and cane crafts", "Meghalaya"],
    "cult-ml-ryndia-eri": ["Eri silk", "Meghalaya", "Sericulture"],
    "cult-mn-kauna-craft": ["Manipur", "Reed bed", "Basket weaving"],
    "cult-mn-longpi": ["Manipur pottery", "Longpi", "Pottery"],
    "cult-mn-moirang-phee": ["Moirang Phee", "Textiles of Manipur", "Handloom"],
    "cult-mp-bagh": ["Bagh Print", "Bagh, Madhya Pradesh", "Woodblock printing"],
    "cult-mp-chanderi": ["Chanderi sari", "Chanderi", "Handloom"],
    "cult-mp-gond": ["Gond art", "Gondi people", "Tribal art"],
    "cult-mz-bamboo": ["Mizo people", "Bamboo", "Mizoram"],
    "cult-mz-puan": ["Puan", "Mizo people", "Textiles of Mizoram"],
    "cult-nl-naga-shawl": ["Naga people", "Textiles of Nagaland", "Hornbill Festival"],
    "cult-nl-wood-carving": ["Morung", "Naga people", "Wood carving"],
    "cult-od-applique": ["Pipili", "Appliqué", "Chandua"],
    "cult-od-pattachitra": ["Pattachitra", "Raghurajpur", "Palm-leaf manuscript"],
    "cult-od-pipili": ["Pipili", "Appliqué", "Puri, Odisha"],
    "cult-od-sambalpuri": ["Sambalpuri sari", "Sambalpur", "Ikat"],
    "cult-pb-jutti": ["Mojari", "Jutti", "Punjabi culture"],
    "cult-pb-phulkari": ["Phulkari", "Embroidery of India", "Punjab"],
    "cult-py-handmade-paper": ["Sri Aurobindo Ashram", "Handmade paper", "Pondicherry"],
    "cult-py-terracotta": ["Villianur", "Terracotta", "Pondicherry"],
    "cult-rj-blue-pottery": ["Blue Pottery of Jaipur", "Jaipur", "Ceramic"],
    "cult-rj-kathputli": ["Kathputli (puppetry)", "Puppetry", "Rajasthan"],
    "cult-rj-pichwai": ["Pichhwai", "Nathdwara", "Shrinathji"],
    "cult-rj-thewa": ["Thewa", "Pratapgarh, Rajasthan", "Gold jewellery"],
    "cult-sk-choktse": ["Sikkim", "Tibetan furniture", "Wood carving"],
    "cult-sk-thangka": ["Thangka", "Tibetan Buddhist art", "Sikkim"],
    "cult-tg-cheriyal": ["Cheriyal scroll painting", "Nakashi art", "Telangana"],
    "cult-tg-gadwal": ["Gadwal sari", "Gadwal", "Handloom"],
    "cult-tg-pembarthi": ["Pembarthi", "Brass", "Repoussé and chasing"],
    "cult-tg-pochampally": ["Pochampally sari", "Bhoodan Pochampally", "Ikat"],
    "cult-tn-kanchipuram": ["Kanchipuram sari", "Kanchipuram", "Silk in the Indian subcontinent"],
    "cult-tn-swamimalai": ["Swamimalai Bronze Icons", "Chola bronzes", "Swamimalai"],
    "cult-tn-thanjavur-painting": ["Thanjavur painting", "Thanjavur", "Gold leaf"],
    "cult-tn-toda": ["Toda people", "Toda embroidery", "Nilgiris district"],
    "cult-tr-cane-bamboo": ["Bamboo and cane crafts", "Tripura", "Handicrafts of Tripura"],
    "cult-tr-risa": ["Tripuri people", "Risa (garment)", "Tripura"],
    "cult-up-banarasi": ["Banarasi sari", "Varanasi", "Brocade"],
    "cult-up-lucknow-chikan": ["Chikan (embroidery)", "Lucknow", "White work"],
    "cult-up-moradabad-brass": ["Moradabad", "Brass", "Handicrafts of Uttar Pradesh"],
    "cult-ut-aipan": ["Aipan art", "Kumaon division", "Folk art"],
    "cult-ut-ringal": ["Bamboo", "Uttarakhand", "Garhwal division"],
    "cult-ut-thulma": ["Bhotia", "Uttarakhand", "Wool"],
    "cult-wb-baluchari": ["Baluchari sari", "Bishnupur, Bankura", "Sari"],
    "cult-wb-kantha": ["Kantha", "Nakshi kantha", "West Bengal"],
    "cult-wb-terracotta": ["Bankura horse", "Bishnupur, Bankura", "Terracotta temples of Bishnupur"]
}

def resolve_single_tradition(item):
    tid = item['id']
    topics = TRADITION_CANONICAL_ENTRIES.get(tid, [item['traditionName']])
    for topic in topics:
        img, title = get_wikipedia_lead_image(topic)
        if img:
            ok, st, sz, ct, dims = verify_url(img)
            if ok:
                return {
                    'id': tid,
                    'name': item['traditionName'],
                    'state': item.get('stateName') or item.get('stateId'),
                    'craft': item.get('craftType'),
                    'category': item.get('category'),
                    'cluster': item.get('primaryProducingCluster'),
                    'url': img,
                    'source': f"Wikipedia: {title}",
                    'size': sz,
                    'ctype': ct,
                    'dims': dims,
                    'status': 'PASS'
                }
        candidates = search_wikimedia(topic)
        for c in candidates:
            ok, st, sz, ct, dims = verify_url(c['url'])
            if ok:
                return {
                    'id': tid,
                    'name': item['traditionName'],
                    'state': item.get('stateName') or item.get('stateId'),
                    'craft': item.get('craftType'),
                    'category': item.get('category'),
                    'cluster': item.get('primaryProducingCluster'),
                    'url': c['url'],
                    'source': f"Wikimedia: {c['file_name']}",
                    'size': sz,
                    'ctype': ct,
                    'dims': dims,
                    'status': 'PASS'
                }
    return {
        'id': tid,
        'name': item['traditionName'],
        'state': item.get('stateName') or item.get('stateId'),
        'craft': item.get('craftType'),
        'category': item.get('category'),
        'cluster': item.get('primaryProducingCluster'),
        'url': None,
        'source': 'Not Found',
        'size': 0,
        'ctype': None,
        'dims': 'N/A',
        'status': 'FAIL'
    }

with open('/Users/kumarjd/.gemini/antigravity-ide/brain/930bdc6f-e6c4-4c9f-a1a6-299f5766828b/scratch/traditions.json') as f:
    raw_traditions = json.load(f)

print("Resolving all 100 traditions with Wikipedia canonical topics in parallel...")
with ThreadPoolExecutor(max_workers=20) as ex:
    resolved_traditions = list(ex.map(resolve_single_tradition, raw_traditions))

passed = [t for t in resolved_traditions if t['status'] == 'PASS']
failed = [t for t in resolved_traditions if t['status'] != 'PASS']
print(f"Traditions Resolved: {len(passed)}/100 PASS (Failed: {len(failed)})\n")

for f in failed:
    print(f"FAILED: [{f['id']}] {f['name']} ({f['state']})")

with open('/Users/kumarjd/Yatrasetu/docs/curated_data/traditions.json', 'w') as f:
    json.dump(resolved_traditions, f, indent=2)

print("Saved docs/curated_data/traditions.json")
