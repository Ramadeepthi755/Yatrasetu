import json
import urllib.request
import urllib.parse
import ssl
import time
import os
from concurrent.futures import ThreadPoolExecutor

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (YatraSetu Curation team@yatrasetu.in)'
}

def verify_live_url(url):
    if not url or not url.strip():
        return False, None, 0, 'Empty', 'N/A'
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
            data = resp.read()
            status = resp.status
            size = len(data)
            ctype = resp.headers.get('Content-Type', '')
            dims = 'Unknown'
            if len(data) > 30:
                if data.startswith(b'\x89PNG\r\n\x1a\n') and len(data) >= 24:
                    w = int.from_bytes(data[16:20], 'big')
                    h = int.from_bytes(data[20:24], 'big')
                    dims = f"{w}x{h}"
                elif data.startswith(b'\xff\xd8'):
                    idx = 2
                    while idx < min(len(data) - 9, 8192):
                        if data[idx] == 0xFF and data[idx+1] in (0xC0, 0xC1, 0xC2):
                            h = int.from_bytes(data[idx+5:idx+7], 'big')
                            w = int.from_bytes(data[idx+7:idx+9], 'big')
                            dims = f"{w}x{h}"
                            break
                        elif data[idx] == 0xFF and data[idx+1] not in (0x00, 0xFF):
                            seg_len = int.from_bytes(data[idx+2:idx+4], 'big')
                            idx += 2 + seg_len
                        else:
                            idx += 1
            ok = (status == 200 and 'image' in ctype and size > 4000)
            return ok, url, size, ctype, dims
    except Exception:
        return False, None, 0, 'Error', 'N/A'

def get_wiki_page_image(title):
    params = {
        'action': 'query',
        'format': 'json',
        'titles': title,
        'prop': 'pageimages',
        'pithumbsize': '1200'
    }
    url = f"https://en.wikipedia.org/w/api.php?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=6) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            for pid, p in data.get('query', {}).get('pages', {}).items():
                if 'thumbnail' in p:
                    src = p['thumbnail']['source']
                    return src, f"Wikipedia: {p.get('title')}"
    except Exception:
        pass
    return None, None

def search_wikimedia_commons(query):
    params = {
        'action': 'query',
        'format': 'json',
        'generator': 'search',
        'gsrnamespace': '6',
        'gsrlimit': '6',
        'gsrsearch': query,
        'prop': 'imageinfo',
        'iiprop': 'url|size|mime'
    }
    url = f"https://commons.wikimedia.org/w/api.php?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=6) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            pages = data.get('query', {}).get('pages', {})
            for pid, p in pages.items():
                title = p.get('title', '')
                info = p.get('imageinfo', [{}])[0]
                img_url = info.get('url')
                mime = info.get('mime', '')
                if img_url and ('jpeg' in mime or 'png' in mime or 'jpg' in mime):
                    file_name = title.replace('File:', '')
                    clean_url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{urllib.parse.quote(file_name)}?width=1200"
                    return clean_url, f"Wikimedia Commons: {file_name}"
    except Exception:
        pass
    return None, None

# Comprehensive canonical query dictionary for traditions
TRADITION_ENTITY_QUERIES = {
    "cult-an-nicobar-mat": ["Nicobarese people", "Nicobar Islands", "Andaman and Nicobar Islands"],
    "cult-an-shell-craft": ["Seashell", "Shell craft", "Shell jewelry"],
    "cult-ap-dharmavaram": ["Dharmavaram handloom pattu sarees and paavadas", "Dharmavaram sari", "Sari"],
    "cult-ap-kalamkari": ["Kalamkari", "Srikalahasti style of Kalamkari", "Machilipatnam Kalamkari"],
    "cult-ap-kondapalli": ["Kondapalli toys", "Kondapalli", "Wooden toys"],
    "cult-ap-machilipatnam": ["Machilipatnam Kalamkari", "Kalamkari", "Woodblock printing on textiles"],
    "cult-ar-apatani-weave": ["Apatani people", "Apatani textile", "Textiles of Arunachal Pradesh"],
    "cult-ar-monpa-paper": ["Monpa people", "Handmade paper", "Tawang"],
    "cult-ar-wancho-wood": ["Wancho people", "Naga wood carving", "Wood carving"],
    "cult-as-majuli-mask": ["Majuli", "Samaguri Satra", "Assamese culture mask"],
    "cult-as-muga-silk": ["Assam silk", "Muga silk", "Mekhela chador", "Antheraea assamensis"],
    "cult-as-sarthebari": ["Bell metal", "Brass utensils", "Sarthebari"],
    "cult-br-madhubani": ["Madhubani art", "Mithila painting", "Madhubani"],
    "cult-br-sikki": ["Sikki grass craft", "Basket weaving", "Handicrafts of Bihar"],
    "cult-br-sujuni": ["Sujani embroidery", "Kantha", "Embroidery of India"],
    "cult-cg-bastar-dhokra": ["Dhokra", "Bastar district", "Lost-wax casting"],
    "cult-cg-bastar-iron": ["Wrought iron", "Blacksmith Bastar", "Bastar district"],
    "cult-cg-terracotta": ["Terracotta", "Pottery in the Indian subcontinent", "Clay"],
    "cult-ch-assemblage": ["Rock Garden of Chandigarh", "Nek Chand", "Outsider art"],
    "cult-dh-warli": ["Warli painting", "Warli", "Dadra and Nagar Haveli"],
    "cult-dl-meenakari": ["Meenakari", "Vitreous enamel", "Jewellery of India"],
    "cult-dl-zardozi": ["Zardozi", "Zari", "Embroidery of India"],
    "cult-ga-azulejos": ["Azulejo", "Architecture of Goa", "Ceramic tile"],
    "cult-ga-kunbi": ["Kunbi", "Textiles of Goa", "Sari"],
    "cult-gj-bandhani": ["Bandhani", "Tie-dye", "Textiles of Gujarat"],
    "cult-gj-kutch-lippan": ["Mud relief", "Kutch district", "Bhunga"],
    "cult-gj-patan-patola": ["Patola sari", "Double ikat", "Ikat"],
    "cult-gj-rogan": ["Rogan painting", "Kutch district", "Castor oil"],
    "cult-hp-chamba-rumal": ["Chamba Rumal", "Chamba, Himachal Pradesh", "Embroidery of India"],
    "cult-hp-kangra-painting": ["Kangra painting", "Pahari painting", "Miniature painting"],
    "cult-hp-kullu-shawl": ["Kullu Shawl", "Kullu", "Shawl"],
    "cult-hr-panipat-handloom": ["Panipat", "Dhurrie", "Handloom"],
    "cult-hr-rewari-metal": ["Rewari", "Brass utensils", "Utensil"],
    "cult-jh-dhokra": ["Dhokra", "Jharkhand", "Tribal art"],
    "cult-jh-sohrai-khovar": ["Sohrai", "Khovar", "Hazaribagh"],
    "cult-jk-kani": ["Kani shawl", "Pashmina", "Kashmir shawl"],
    "cult-jk-paper-mache": ["Kashmir papier-mache", "Papier-mâché", "Handicrafts of Kashmir"],
    "cult-jk-pashmina": ["Pashmina", "Cashmere wool", "Kashmir shawl"],
    "cult-jk-wood-carving": ["Walnut wood", "Wood carving Kashmir", "Kashmir"],
    "cult-ka-bidriware": ["Bidriware", "Bidar", "Inlay"],
    "cult-ka-channapatna": ["Channapatna toys", "Lacquerware", "Wooden toy"],
    "cult-ka-ilkal": ["Ilkal sari", "Bagalkot", "Sari"],
    "cult-ka-mysore-silk": ["Mysore silk", "Mysore", "Silk in the Indian subcontinent"],
    "cult-kl-aranmula": ["Aranmula kannadi", "Metal mirror", "Aranmula"],
    "cult-kl-balaramapuram": ["Kasavu", "Mundu", "Balaramapuram"],
    "cult-kl-coir": ["Coir", "Kerala coir", "Coconut fibre"],
    "cult-kl-kathakali": ["Kathakali", "Classical Indian dance", "Kerala"],
    "cult-la-pashmina": ["Changthangi goat", "Ladakh pashmina", "Changpa"],
    "cult-la-thangka": ["Thangka", "Tibetan art", "Ladakh"],
    "cult-la-wood-carving": ["Tibetan architecture", "Wood carving Ladakh", "Ladakh"],
    "cult-ld-coir-craft": ["Lakshadweep coir", "Coir", "Coconut"],
    "cult-mh-kolhapuri": ["Kolhapuri chappal", "Kolhapur", "Leather crafting"],
    "cult-mh-paithani": ["Paithani", "Yeola", "Sari"],
    "cult-mh-warli": ["Warli painting", "Warli", "Folk art"],
    "cult-ml-khasi-cane": ["Khasi people", "Bamboo and cane crafts", "Meghalaya"],
    "cult-ml-ryndia-eri": ["Eri silk", "Meghalaya silk", "Sericulture"],
    "cult-mn-kauna-craft": ["Manipur", "Reed basket", "Basket weaving"],
    "cult-mn-longpi": ["Manipur pottery", "Longpi", "Black pottery"],
    "cult-mn-moirang-phee": ["Moirang Phee", "Textiles of Manipur", "Handloom"],
    "cult-mp-bagh": ["Bagh Print", "Bagh, Madhya Pradesh", "Woodblock printing"],
    "cult-mp-chanderi": ["Chanderi sari", "Chanderi", "Handloom"],
    "cult-mp-gond": ["Gond art", "Gondi people", "Tribal art"],
    "cult-mz-bamboo": ["Mizo people", "Bamboo crafts Mizoram", "Mizoram"],
    "cult-mz-puan": ["Puan", "Mizo people", "Textiles of Mizoram"],
    "cult-nl-naga-shawl": ["Naga people", "Textiles of Nagaland", "Hornbill Festival"],
    "cult-nl-wood-carving": ["Morung", "Naga people", "Wood carving"],
    "cult-od-applique": ["Pipili", "Appliqué", "Chandua"],
    "cult-od-pattachitra": ["Pattachitra", "Raghurajpur", "Palm-leaf manuscript"],
    "cult-od-pipili": ["Pipili", "Appliqué", "Puri, Odisha"],
    "cult-od-sambalpuri": ["Sambalpuri sari", "Sambalpur", "Ikat"],
    "cult-pb-jutti": ["Mojari", "Jutti", "Punjabi culture"],
    "cult-pb-phulkari": ["Phulkari", "Embroidery of India", "Punjab"],
    "cult-py-handmade-paper": ["Sri Aurobindo Ashram", "Handmade paper Pondicherry", "Pondicherry"],
    "cult-py-terracotta": ["Villianur", "Terracotta Puducherry", "Pondicherry"],
    "cult-rj-blue-pottery": ["Blue Pottery of Jaipur", "Jaipur", "Ceramic"],
    "cult-rj-kathputli": ["Kathputli (puppetry)", "Puppetry Rajasthan", "Rajasthan"],
    "cult-rj-pichwai": ["Pichhwai", "Nathdwara", "Shrinathji"],
    "cult-rj-thewa": ["Thewa", "Pratapgarh, Rajasthan", "Gold jewellery"],
    "cult-sk-choktse": ["Sikkim woodwork", "Tibetan furniture", "Wood carving"],
    "cult-sk-thangka": ["Thangka", "Tibetan Buddhist art", "Sikkim"],
    "cult-tg-cheriyal": ["Cheriyal scroll painting", "Nakashi art", "Telangana"],
    "cult-tg-gadwal": ["Gadwal sari", "Gadwal", "Handloom"],
    "cult-tg-pembarthi": ["Pembarthi Metal Craft", "Pembarthi", "Brass repousse"],
    "cult-tg-pochampally": ["Pochampally sari", "Bhoodan Pochampally", "Ikat"],
    "cult-tn-kanchipuram": ["Kanchipuram sari", "Kanchipuram", "Silk in the Indian subcontinent"],
    "cult-tn-swamimalai": ["Swamimalai Bronze Icons", "Chola bronzes", "Swamimalai"],
    "cult-tn-thanjavur-painting": ["Thanjavur painting", "Thanjavur", "Gold leaf"],
    "cult-tn-toda": ["Toda people", "Toda embroidery", "Nilgiris district"],
    "cult-tr-cane-bamboo": ["Bamboo and cane crafts", "Tripura", "Handicrafts of Tripura"],
    "cult-tr-risa": ["Tripuri people", "Risa (garment)", "Tripura"],
    "cult-up-banarasi": ["Banarasi sari", "Varanasi", "Brocade"],
    "cult-up-lucknow-chikan": ["Chikan (embroidery)", "Lucknow", "White work"],
    "cult-up-varanasi-silk": ["Banarasi sari", "Varanasi silk", "Brocade"],
    "cult-wb-bankura-terracotta": ["Bankura horse", "Terracotta Bankura", "Bishnupur, Bankura"],
    "cult-wb-dokra": ["Dhokra", "Bikna, Bankura", "Lost-wax casting"],
    "cult-up-firozabad-glass": ["Firozabad", "Glass bangles", "Glassblowing"],
    "cult-ut-ringal": ["Arundinaria", "Bamboo craft Uttarakhand", "Garhwal"],
    "cult-ut-thulma": ["Bhotia people", "Wool blanket Uttarakhand", "Kumaon"],
    "cult-rj-bagru-print": ["Bagru print", "Bagru, Rajasthan", "Block printing"]
}

# Specific destination queries
def get_dest_queries(d):
    name = d['destinationName']
    city = d.get('cityName') or ''
    state = d.get('stateName') or ''
    clean_name = name.split('(')[0].split('–')[0].split('&')[0].strip()
    
    special_overrides = {
        'dest-92': ['Dashashwamedh Ghat', 'Varanasi Ghats', 'Ganges in Varanasi'],
        'dest-160': ['Jagannath Temple, Puri', 'Puri Beach', 'Puri, Odisha'],
        'dest-106': ['Gateway of India', 'Marine Drive, Mumbai', 'Mumbai'],
        'dest-136': ['Tirumala Venkateswara Temple', 'Tirupati', 'Chandragiri Fort, Andhra Pradesh'],
        'dest-112': ['Dal Lake', 'Shalimar Bagh, Srinagar', 'Srinagar'],
        'dest-150': ['Badami cave temples', 'Pattadakal', 'Aihole'],
        'dest-159': ['Lingaraja Temple', 'Mukteshvara Temple, Bhubaneswar', 'Bhubaneswar'],
        'dest-163': ['Sundarbans', 'Sundarbans National Park', 'Royal Bengal tiger Sundarbans'],
        'dest-146': ['Brihadisvara Temple, Thanjavur', 'Thanjavur Maratha Palace', 'Thanjavur'],
        'dest-168': ['Baidyanath Temple', 'Deoghar', 'Trikut Pahar'],
        'dest-164': ['Visva-Bharati University', 'Santiniketan', 'Bolpur'],
        'dest-151': ['Chennakeshava Temple, Belur', 'Hoysaleswara Temple', 'Halebidu'],
        'dest-81': ['Rann of Kutch', 'Great Rann of Kutch', 'White Desert Kutch'],
        'dest-2': ['Leh Palace', 'Shanti Stupa, Ladakh', 'Leh'],
        'dest-4': ['Kashi Vishwanath Temple', 'Ganga Aarti Varanasi', 'Varanasi'],
        'dest-100': ['Badrinath Temple', 'Kedarnath Temple', 'Haridwar'],
        'dest-102': ['Thousand Pillar Temple', 'Warangal Fort', 'Warangal'],
        'dest-103': ['Red Fort', 'Humayun\'s Tomb', 'Delhi'],
        'dest-104': ['India Gate', 'Rashtrapati Bhavan', 'New Delhi'],
        'dest-105': ['Bangalore Palace', 'Vidhana Soudha', 'Bengaluru'],
        'dest-107': ['Victoria Memorial, Kolkata', 'Howrah Bridge', 'Kolkata'],
        'dest-108': ['Marina Beach', 'Kapaleeshwarar Temple', 'Chennai'],
        'dest-109': ['Hawa Mahal', 'Amber Fort', 'Jaipur'],
        'dest-110': ['Sabarmati Ashram', 'Adalaj Stepwell', 'Ahmedabad'],
        'dest-111': ['Golden Temple', 'Jallianwala Bagh', 'Amritsar'],
        'dest-113': ['Mirik Lake', 'Tiger Hill, Darjeeling', 'Darjeeling'],
        'dest-114': ['Shimla Ridge', 'Viceregal Lodge, Shimla', 'Shimla'],
        'dest-115': ['Rohtang Pass', 'Solang Valley', 'Manali, Himachal Pradesh'],
        'dest-116': ['Nainital Lake', 'Naina Devi Temple', 'Nainital'],
        'dest-117': ['Mussoorie Mall Road', 'Kempty Falls', 'Mussoorie'],
        'dest-118': ['Munnar tea plantation', 'Anamudi', 'Munnar'],
        'dest-119': ['Ooty Lake', 'Nilgiri Mountain Railway', 'Ooty'],
        'dest-120': ['Kodaikanal Lake', 'Pillar Rocks', 'Kodaikanal'],
        'dest-121': ['Abbey Falls', 'Raja\'s Seat', 'Madikeri'],
        'dest-122': ['Mount Abu Sunset Point', 'Dilwara Temples', 'Mount Abu'],
        'dest-123': ['Mahabaleshwar viewpoint', 'Venna Lake', 'Mahabaleshwar'],
        'dest-124': ['Lonavala Khandala', 'Tiger Point Lonavala', 'Lonavala'],
        'dest-125': ['Gangtok MG Marg', 'Rumtek Monastery', 'Gangtok'],
        'dest-126': ['Nohkalikai Falls', 'Cherrapunji root bridge', 'Cherrapunji'],
        'dest-127': ['Umiam Lake', 'Ward\'s Lake, Shillong', 'Shillong'],
        'dest-128': ['Tawang Monastery', 'Sela Pass', 'Tawang'],
        'dest-129': ['Kaziranga rhino', 'Kaziranga National Park', 'Assam'],
        'dest-130': ['Jim Corbett National Park tiger', 'Jim Corbett National Park', 'Corbett'],
        'dest-131': ['Ranthambore Fort', 'Ranthambore National Park', 'Sawai Madhopur'],
        'dest-132': ['Bandhavgarh tiger', 'Bandhavgarh National Park', 'Umaria'],
        'dest-133': ['Kanha National Park tiger', 'Kanha Tiger Reserve', 'Mandla'],
        'dest-134': ['Gir National Park lion', 'Gir Forest National Park', 'Sasan Gir'],
        'dest-135': ['Periyar National Park lake', 'Thekkady', 'Periyar'],
        'dest-137': ['Madurai Meenakshi Temple', 'Thirumalai Nayakkar Mahal', 'Madurai'],
        'dest-138': ['Rameswaram Temple', 'Pamban Bridge', 'Rameswaram'],
        'dest-139': ['Vivekananda Rock Memorial', 'Kanyakumari sunset', 'Kanyakumari'],
        'dest-140': ['Padmanabhaswamy Temple', 'Kovalam Beach', 'Thiruvananthapuram'],
        'dest-141': ['Chinese Fishing Nets Kochi', 'Fort Kochi', 'Kochi'],
        'dest-142': ['Alleppey houseboat', 'Alappuzha Backwaters', 'Alappuzha'],
        'dest-143': ['Mysore Palace', 'Chamundi Hills', 'Mysuru'],
        'dest-144': ['Virupaksha Temple', 'Hampi ruins', 'Hampi'],
        'dest-145': ['Gokarna Om Beach', 'Mahabaleshwar Temple, Gokarna', 'Gokarna'],
        'dest-147': ['Shore Temple, Mahabalipuram', 'Pancha Rathas', 'Mahabalipuram'],
        'dest-148': ['Promenade Beach Puducherry', 'Auroville Dome', 'Pondicherry'],
        'dest-149': ['Calangute Beach Goa', 'Fort Aguada', 'Goa'],
    }
    
    if d['id'] in special_overrides:
        return special_overrides[d['id']]
    
    q = []
    if name: q.append(name)
    if clean_name and clean_name != name: q.append(clean_name)
    if clean_name and city: q.append(f"{clean_name} {city}")
    if clean_name and state: q.append(f"{clean_name} {state}")
    if city: q.append(city)
    return q

def resolve_entity(queries, existing_url=None):
    # 1. Test existing URL if given
    if existing_url:
        ok, u, sz, ct, dims = verify_live_url(existing_url)
        if ok:
            return u, "Existing Verified URL", sz, ct, dims
        # Try unescaping/fixing thumbnail URL
        clean_ext = existing_url.split('?')[0]
        fname = urllib.parse.unquote(clean_ext.split('/')[-1])
        if fname.startswith('3840px-') or fname.startswith('1280px-') or fname.startswith('800px-'):
            fname = '-'.join(fname.split('-')[1:])
        fix_url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{urllib.parse.quote(fname)}?width=1200"
        ok, u, sz, ct, dims = verify_live_url(fix_url)
        if ok:
            return u, f"Cleaned Wikimedia File: {fname}", sz, ct, dims

    # 2. Try Wikipedia PageImages
    for q in queries:
        img_url, src = get_wiki_page_image(q)
        if img_url:
            ok, u, sz, ct, dims = verify_live_url(img_url)
            if ok:
                return u, src, sz, ct, dims

    # 3. Try Wikimedia Commons Search
    for q in queries:
        img_url, src = search_wikimedia_commons(q)
        if img_url:
            ok, u, sz, ct, dims = verify_live_url(img_url)
            if ok:
                return u, src, sz, ct, dims

    return None, "Not Found", 0, None, "N/A"

def run():
    print("=== 1. CURATING 36 STATES ===")
    with open('docs/curated_data/states.json') as f:
        states = json.load(f)

    def process_st(s):
        url, src, sz, ct, dims = resolve_entity([s.get('landmark', s['name']), s['name']], s.get('url'))
        return {
            'id': s['id'],
            'name': s['name'],
            'region': s.get('region'),
            'landmark': s.get('landmark', s['name']),
            'url': url,
            'source': src,
            'size': sz,
            'ctype': ct,
            'dims': dims,
            'status': 'PASS' if url else 'FAIL'
        }

    with ThreadPoolExecutor(max_workers=10) as ex:
        curated_states = list(ex.map(process_st, states))

    st_pass = sum(1 for s in curated_states if s['status'] == 'PASS')
    print(f"States: {st_pass}/36 PASS")

    print("\n=== 2. CURATING 100 CULTURAL TRADITIONS ===")
    with open('data/raw_db_traditions.json') as f:
        traditions = json.load(f)

    def process_tr(t):
        tid = t['id']
        queries = TRADITION_ENTITY_QUERIES.get(tid, [t['traditionName'], t.get('craftType', '')])
        url, src, sz, ct, dims = resolve_entity(queries, t.get('imageUrl'))
        return {
            'id': tid,
            'name': t['traditionName'],
            'state': t.get('stateName') or t.get('stateId'),
            'craft': t.get('craftType'),
            'category': t.get('category'),
            'cluster': t.get('primaryProducingCluster'),
            'url': url,
            'source': src,
            'size': sz,
            'ctype': ct,
            'dims': dims,
            'status': 'PASS' if url else 'FAIL'
        }

    with ThreadPoolExecutor(max_workers=15) as ex:
        curated_traditions = list(ex.map(process_tr, traditions))

    tr_pass = sum(1 for t in curated_traditions if t['status'] == 'PASS')
    print(f"Traditions: {tr_pass}/100 PASS")

    print("\n=== 3. CURATING 164 DESTINATIONS ===")
    with open('data/raw_db_destinations.json') as f:
        destinations = json.load(f)

    def process_dst(d):
        queries = get_dest_queries(d)
        url, src, sz, ct, dims = resolve_entity(queries, d.get('heroImageUrl'))
        return {
            'id': d['id'],
            'name': d['destinationName'],
            'state': d.get('stateName'),
            'city': d.get('cityName'),
            'district': d.get('district'),
            'url': url,
            'source': src,
            'size': sz,
            'ctype': ct,
            'dims': dims,
            'status': 'PASS' if url else 'FAIL'
        }

    with ThreadPoolExecutor(max_workers=20) as ex:
        curated_destinations = list(ex.map(process_dst, destinations))

    dst_pass = sum(1 for d in curated_destinations if d['status'] == 'PASS')
    print(f"Destinations: {dst_pass}/164 PASS")

    # Save curated JSON files
    os.makedirs('docs/curated_data', exist_ok=True)
    with open('docs/curated_data/states.json', 'w') as f:
        json.dump(curated_states, f, indent=2)

    with open('docs/curated_data/traditions.json', 'w') as f:
        json.dump(curated_traditions, f, indent=2)

    with open('docs/curated_data/destinations.json', 'w') as f:
        json.dump(curated_destinations, f, indent=2)

    # Generate Flyway V27 SQL
    v27_sql_path = 'backend/src/main/resources/db/migration/V27__curate_authentic_images_for_states_traditions_destinations.sql'
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

    print(f"\nGenerated Flyway migration: {v27_sql_path}")

if __name__ == '__main__':
    run()
