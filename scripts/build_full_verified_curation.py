import json
import urllib.request
import urllib.parse
import ssl
import os
import sys
from concurrent.futures import ThreadPoolExecutor

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'YatraSetuAuthoritativeCuration/3.0 (team@yatrasetu.in)'
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
            ok = (status in (200, 206) and 'image' in ctype and size > 2500)
            return ok, url, size, ctype, dims
    except Exception as e:
        return False, None, 0, str(e), 'N/A'

def get_rest_summary_image(title):
    encoded = urllib.parse.quote(title.replace(' ', '_'))
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded}"
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=6) as resp:
            d = json.loads(resp.read().decode('utf-8'))
            if 'thumbnail' in d:
                return d['thumbnail']['source'], f"Wikipedia: {d.get('title')}"
            elif 'originalimage' in d:
                return d['originalimage']['source'], f"Wikipedia: {d.get('title')}"
    except Exception:
        pass
    return None, None

def search_commons_file(query):
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
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=6) as resp:
            d = json.loads(resp.read().decode('utf-8'))
            pages = d.get('query', {}).get('pages', {})
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

def resolve_with_fallbacks(queries, direct_fallbacks=None):
    if direct_fallbacks:
        for f in direct_fallbacks:
            ok, u, sz, ct, dims = verify_live_url(f)
            if ok:
                return u, "Direct Verified Source", sz, ct, dims
    for q in queries:
        img_url, src = get_rest_summary_image(q)
        if img_url:
            ok, u, sz, ct, dims = verify_live_url(img_url)
            if ok:
                return u, src, sz, ct, dims
        img_url, src = search_commons_file(q)
        if img_url:
            ok, u, sz, ct, dims = verify_live_url(img_url)
            if ok:
                return u, src, sz, ct, dims
    return None, "Not Found", 0, None, "N/A"

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

with open(os.path.join(REPO_ROOT, 'docs/curated_data/states.json')) as f:
    curated_states = json.load(f)

with open(os.path.join(REPO_ROOT, 'data/raw_db_traditions.json')) as f:
    raw_traditions = json.load(f)

with open(os.path.join(REPO_ROOT, 'data/raw_db_destinations.json')) as f:
    raw_destinations = json.load(f)

# Comprehensive targeted canonical queries for all 100 traditions
TRADITION_CANONICAL_TARGETS = {
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
    "cult-as-muga-silk": ["Muga silk", "Assam silk", "Mekhela chador"],
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
    "cult-gj-patan-patola": ["Patola", "Patola sari", "Double ikat"],
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
    "cult-ld-coir-craft": ["Lakshadweep", "Coir", "Coconut"],
    "cult-mh-kolhapuri": ["Kolhapuri chappal", "Kolhapur", "Leather crafting"],
    "cult-mh-paithani": ["Paithani", "Yeola", "Sari"],
    "cult-mh-warli": ["Warli painting", "Warli", "Folk art"],
    "cult-ml-khasi-cane": ["Khasi people", "Bamboo and cane crafts", "Meghalaya"],
    "cult-ml-ryndia-eri": ["Eri silk", "Meghalaya silk", "Sericulture"],
    "cult-mn-kauna-craft": ["Manipur", "Basket weaving", "Reed bed"],
    "cult-mn-longpi": ["Manipur pottery", "Longpi", "Black pottery"],
    "cult-mn-moirang-phee": ["Textiles of Manipur", "Moirang Phee", "Handloom"],
    "cult-mp-bagh": ["Bagh Print", "Bagh, Madhya Pradesh", "Woodblock printing"],
    "cult-mp-chanderi": ["Chanderi sari", "Chanderi", "Handloom"],
    "cult-mp-gond": ["Gond art", "Gondi people", "Tribal art"],
    "cult-mz-bamboo": ["Mizo people", "Bamboo crafts Mizoram", "Mizoram"],
    "cult-mz-puan": ["Puan", "Mizo people", "Textiles of Mizoram"],
    "cult-nl-naga-shawl": ["Naga people", "Textiles of Nagaland", "Hornbill Festival"],
    "cult-nl-wood-carving": ["Morung", "Naga people", "Wood carving"],
    "cult-od-cuttack-tarakasi": ["Filigree", "Cuttack", "Silver filigree"],
    "cult-od-pattachitra": ["Pattachitra", "Raghurajpur", "Palm-leaf manuscript"],
    "cult-od-pipili": ["Pipili", "Appliqué", "Chandua"],
    "cult-od-sambalpuri": ["Sambalpuri sari", "Sambalpur", "Ikat"],
    "cult-pb-jutti": ["Mojari", "Jutti", "Punjabi culture"],
    "cult-pb-phulkari": ["Phulkari", "Embroidery of India", "Punjab"],
    "cult-py-handmade-paper": ["Sri Aurobindo Ashram", "Handmade paper", "Pondicherry"],
    "cult-py-terracotta": ["Villianur", "Terracotta Puducherry", "Pondicherry"],
    "cult-rj-bagru-print": ["Bagru print", "Bagru, Rajasthan", "Block printing"],
    "cult-rj-blue-pottery": ["Blue Pottery of Jaipur", "Jaipur", "Ceramic"],
    "cult-rj-kathputli": ["Kathputli (puppetry)", "Puppetry Rajasthan", "Rajasthan"],
    "cult-rj-pichwai": ["Pichhwai", "Nathdwara", "Shrinathji"],
    "cult-rj-thewa": ["Thewa", "Pratapgarh, Rajasthan", "Gold jewellery"],
    "cult-sk-choktse": ["Sikkim", "Tibetan furniture", "Wood carving"],
    "cult-sk-thangka": ["Thangka", "Tibetan Buddhist art", "Sikkim"],
    "cult-tg-cheriyal": ["Cheriyal scroll painting", "Nakashi art", "Telangana"],
    "cult-tg-gadwal": ["Gadwal sari", "Gadwal", "Handloom"],
    "cult-tg-pembarthi": ["Brass", "Pembarthi, Jangaon district", "Sheet metal"],
    "cult-tg-pochampally": ["Pochampally sari", "Bhoodan Pochampally", "Ikat"],
    "cult-tn-kanchipuram": ["Kanchipuram sari", "Kanchipuram", "Silk in the Indian subcontinent"],
    "cult-tn-swamimalai": ["Swamimalai Bronze Icons", "Chola bronzes", "Swamimalai"],
    "cult-tn-thanjavur-painting": ["Thanjavur painting", "Thanjavur", "Gold leaf"],
    "cult-tn-toda": ["Toda people", "Toda embroidery", "Nilgiris district"],
    "cult-tr-cane-bamboo": ["Bamboo and cane crafts", "Tripura", "Handicrafts of Tripura"],
    "cult-tr-risa": ["Riha (garment)", "Tripuri people", "Tripura"],
    "cult-up-banarasi": ["Banarasi sari", "Varanasi", "Brocade"],
    "cult-up-firozabad-glass": ["Firozabad", "Glass bangles", "Glassblowing"],
    "cult-up-lucknow-chikan": ["Chikan (embroidery)", "Lucknow", "White work"],
    "cult-up-moradabad-brass": ["Moradabad", "Brass", "Metalware"],
    "cult-up-varanasi-silk": ["Banarasi sari", "Varanasi silk", "Brocade"],
    "cult-ut-aipan": ["Aipan art", "Kumaon division", "Folk art"],
    "cult-ut-ringal": ["Arundinaria", "Bamboo craft Uttarakhand", "Garhwal"],
    "cult-ut-thulma": ["Bhotia", "Wool blanket Uttarakhand", "Kumaon division"],
    "cult-wb-baluchari": ["Baluchari Sari", "Bishnupur, Bankura", "Sari"],
    "cult-wb-bankura-terracotta": ["Bankura horse", "Terracotta Bankura", "Bishnupur, Bankura"],
    "cult-wb-dokra": ["Dhokra", "Bikna, Bankura", "Lost-wax casting"],
    "cult-wb-kantha": ["Kantha", "Nakshi kantha", "Embroidery of India"]
}

# Targeted canonical queries for destinations based on name/city
def get_dest_queries(d):
    name = d['destinationName']
    city = d.get('cityName') or ''
    state = d.get('stateName') or ''
    dist = d.get('district') or ''
    
    clean_name = name.split('(')[0].split('–')[0].split('&')[0].split('/')[0].strip()
    
    # Landmark specific overrides
    specifics = {
        'dest-10': ['Mawlynnong', 'Living root bridge', 'Cherrapunji'],
        'dest-100': ['Haridwar', 'Char Dham', 'Rishikesh'],
        'dest-102': ['Thousand Pillar Temple', 'Warangal Fort', 'Warangal'],
        'dest-103': ['Red Fort', 'Humayun\'s Tomb', 'Delhi'],
        'dest-104': ['India Gate', 'Rashtrapati Bhavan', 'New Delhi'],
        'dest-105': ['Bangalore Palace', 'Vidhana Soudha', 'Bengaluru'],
        'dest-106': ['Gateway of India', 'Marine Drive, Mumbai', 'Mumbai'],
        'dest-107': ['Victoria Memorial, Kolkata', 'Howrah Bridge', 'Kolkata'],
        'dest-108': ['Marina Beach', 'Kapaleeshwarar Temple', 'Chennai'],
        'dest-109': ['Rock Garden of Chandigarh', 'Chandigarh', 'Sukhna Lake'],
        'dest-112': ['Dal Lake', 'Shalimar Bagh, Srinagar', 'Srinagar'],
        'dest-115': ['Kamakhya Temple', 'Guwahati', 'Assam'],
        'dest-118': ['Silvassa', 'Diu Fort', 'Dadra and Nagar Haveli'],
        'dest-119': ['Brahma Sarovar', 'Kurukshetra', 'Jyotisar'],
        'dest-120': ['Yadavindra Gardens', 'Pinjore', 'Panchkula district'],
        'dest-121': ['Morni Hills', 'Tikkar Taal', 'Panchkula district'],
        'dest-124': ['Kangla Fort', 'Imphal', 'Loktak Lake'],
        'dest-127': ['Aizawl', 'Durtlang Hills', 'Mizoram'],
        'dest-128': ['Reiek', 'Mizoram', 'Aizawl district'],
        'dest-129': ['Vantawng Falls', 'Thenzawl', 'Serchhip district'],
        'dest-130': ['Champhai', 'Mizoram', 'Rih Dil'],
        'dest-131': ['Kohima', 'Kohima War Cemetery', 'Nagaland'],
        'dest-134': ['Khonoma', 'Nagaland', 'Kohima district'],
        'dest-137': ['Visakhapatnam', 'Rishikonda Beach', 'Kailasagiri'],
        'dest-139': ['Mallikarjuna Temple, Srisailam', 'Srisailam', 'Srisailam Dam'],
        'dest-140': ['Veerabhadra Temple, Lepakshi', 'Lepakshi', 'Nandi (bull)'],
        'dest-150': ['Badami cave temples', 'Pattadakal', 'Aihole'],
        'dest-151': ['Chennakeshava Temple, Belur', 'Hoysaleswara Temple', 'Halebidu'],
        'dest-152': ['Jog Falls', 'Sharavathi River', 'Shimoga district'],
        'dest-154': ['Udupi', 'Sri Krishna Matha, Udupi', 'Malpe Beach'],
        'dest-155': ['Fort Kochi', 'Chinese fishing nets', 'Mattancherry Palace'],
        'dest-156': ['Periyar National Park', 'Thekkady', 'Periyar Lake'],
        'dest-157': ['Kovalam', 'Kovalam Beach', 'Lighthouse Beach, Kovalam'],
        'dest-158': ['Bekal Fort', 'Kasaragod district', 'Bekal Beach'],
        'dest-159': ['Lingaraja Temple', 'Mukteshvara Temple, Bhubaneswar', 'Bhubaneswar'],
        'dest-160': ['Jagannath Temple, Puri', 'Puri Beach', 'Puri, Odisha'],
        'dest-161': ['Konark Sun Temple', 'Konark', 'Chariot wheel'],
        'dest-162': ['Chilika Lake', 'Nalabana Bird Sanctuary', 'Puri district'],
        'dest-163': ['Sundarbans National Park', 'Sundarbans', 'Royal Bengal tiger'],
        'dest-164': ['Santiniketan', 'Visva-Bharati University', 'Bolpur'],
        'dest-166': ['Nalanda mahavihara', 'Nalanda', 'Rajgir'],
        'dest-167': ['Golghar', 'Patna', 'Pataliputra'],
        'dest-168': ['Baidyanath Temple', 'Deoghar', 'Trikut Pahar'],
        'dest-169': ['Netarhat', 'Chota Nagpur Plateau', 'Latehar district'],
        'dest-170': ['Kanger Ghati National Park', 'Chitrakote Falls', 'Jagdalpur'],
        'dest-171': ['Sirpur Group of Monuments', 'Barnawapara Wildlife Sanctuary', 'Sirpur, Chhattisgarh'],
        'dest-18': ['Pangong Tso', 'Pangong Lake', 'Ladakh'],
        'dest-22': ['Rann of Kutch', 'Great Rann of Kutch', 'Dhordo'],
        'dest-23': ['Dhanushkodi', 'Pamban Bridge', 'Rameswaram'],
        'dest-24': ['Chitrakote Waterfalls', 'Bastar district', 'Indravati River'],
        'dest-28': ['Majuli', 'Brahmaputra River', 'Assam'],
        'dest-31': ['Radhanagar Beach', 'Havelock Island', 'Andaman Islands'],
        'dest-32': ['Neil Island', 'Shaheed Dweep', 'Andaman Islands'],
        'dest-34': ['Nohkalikai Falls', 'Cherrapunji', 'Living root bridge'],
        'dest-35': ['Dawki', 'Umngot River', 'Meghalaya'],
        'dest-36': ['Krang Suri Falls', 'Jaintia Hills', 'Meghalaya'],
        'dest-49': ['Agatti Island', 'Lakshadweep', 'Coral reef'],
        'dest-50': ['Kalpeni', 'Lakshadweep', 'Lagoon'],
        'dest-52': ['Bhuj', 'Aina Mahal', 'Kutch district'],
        'dest-55': ['Tamhini Ghat', 'Mulshi Dam', 'Western Ghats'],
        'dest-56': ['Mahabaleshwar', 'Panchgani', 'Venna Lake'],
        'dest-58': ['Amboli, Sindhudurg', 'Amboli Falls', 'Sindhudurg district'],
        'dest-59': ['Agumbe', 'Western Ghats rainforest', 'Shimoga district'],
        'dest-60': ['Kudremukh', 'Kudremukh National Park', 'Chikkamagaluru district'],
        'dest-63': ['Cellular Jail', 'Port Blair', 'Ross Island, South Andaman'],
        'dest-65': ['Rumtek Monastery', 'Gangtok', 'East Sikkim'],
        'dest-66': ['Gurudongmar Lake', 'Lachung', 'North Sikkim'],
        'dest-67': ['Double Decker Living Root Bridge', 'Shillong', 'Meghalaya'],
        'dest-68': ['Kaziranga National Park', 'Assam tea', 'Golaghat'],
        'dest-69': ['Khajuraho Group of Monuments', 'Panna National Park', 'Kandariya Mahadeva Temple'],
        'dest-70': ['Orchha', 'Orchha Fort complex', 'Betwa River'],
        'dest-72': ['Kasar Devi', 'Almora', 'Binsar'],
        'dest-75': ['Tirthan Valley', 'Great Himalayan National Park', 'Jibhi'],
        'dest-76': ['Chitkul', 'Baspa Valley', 'Kinnaur'],
        'dest-77': ['Lahaul and Spiti district', 'Keylong', 'Himalayas'],
        'dest-78': ['Keoladeo National Park', 'Bharatpur Bird Sanctuary', 'Bharatpur, Rajasthan'],
        'dest-79': ['Ranganathittu Bird Sanctuary', 'Kaveri River', 'Mandya district'],
        'dest-80': ['Nal Sarovar Bird Sanctuary', 'Sanand', 'Gujarat'],
        'dest-81': ['Rann of Kutch', 'Great Rann of Kutch', 'White Desert'],
        'dest-82': ['Sam Sand Dunes', 'Jaisalmer Fort', 'Thar Desert'],
        'dest-83': ['Maravanthe', 'NH 66 (India)', 'Udupi district'],
        'dest-84': ['Ramachandi Temple', 'Puri, Odisha', 'Bay of Bengal'],
        'dest-85': ['Unakoti', 'Unakoti district', 'Tripura'],
        'dest-86': ['Shore Temple', 'Mahabalipuram', 'Pancha Rathas'],
        'dest-87': ['Butterfly Beach, Goa', 'Palolem Beach', 'South Goa'],
        'dest-88': ['Bangaram Atoll', 'Kadmat Island', 'Lakshadweep'],
        'dest-89': ['Kasaragod', 'Bekal Fort', 'Malabar Coast'],
        'dest-90': ['Krishna Janmasthan Temple Complex', 'Dwarkadhish Temple', 'Mathura'],
        'dest-91': ['Triveni Ghat', 'Lakshman Jhula', 'Har Ki Pauri'],
        'dest-92': ['Dashashwamedh Ghat', 'Ganges in Varanasi', 'Varanasi'],
        'dest-93': ['Mahabodhi Temple', 'Bodh Gaya', 'Gaya district'],
        'dest-94': ['Ramanathaswamy Temple', 'Pamban Bridge', 'Rameswaram'],
        'dest-95': ['Virupaksha Temple', 'Pattadakal', 'Hampi'],
        'dest-96': ['Gulmarg', 'Gulmarg Gondola', 'Baramulla district'],
        'dest-97': ['Auli, India', 'Ski resort', 'Chamoli district'],
        'dest-98': ['Annamalaiyar Temple', 'Arunachala', 'Tiruvannamalai'],
        'dest-99': ['Amarkantak', 'Narmada River', 'Anuppur district']
    }
    
    if d['id'] in specifics:
        return specifics[d['id']]
    
    q = []
    if clean_name: q.append(clean_name)
    if city and city != clean_name: q.append(city)
    if clean_name and state: q.append(f"{clean_name} {state}")
    if city and state: q.append(f"{city} {state}")
    return q

print("=== 1. VERIFYING 36 STATES ===")
def check_state(s):
    ok, u, sz, ct, dims = verify_live_url(s['url'])
    return {
        'id': s['id'],
        'name': s['name'],
        'region': s.get('region'),
        'landmark': s.get('landmark', s['name']),
        'url': u if ok else None,
        'source': s.get('source', 'Wikimedia'),
        'size': sz,
        'ctype': ct,
        'dims': dims,
        'status': 'PASS' if ok else 'FAIL'
    }

with ThreadPoolExecutor(max_workers=10) as ex:
    verified_states = list(ex.map(check_state, curated_states))
st_pass = sum(1 for s in verified_states if s['status'] == 'PASS')
print(f"States: {st_pass}/36 PASS")

print("\n=== 2. RESOLVING 100 CULTURAL TRADITIONS ===")
def resolve_tradition(t):
    tid = t['id']
    queries = TRADITION_CANONICAL_TARGETS.get(tid, [t['traditionName'], t.get('craftType', '')])
    queries.append(t['traditionName'])
    if t.get('craftType'): queries.append(t['craftType'])
    
    url, src, sz, ct, dims = resolve_with_fallbacks(queries)
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
    verified_traditions = list(ex.map(resolve_tradition, raw_traditions))
tr_pass = sum(1 for t in verified_traditions if t['status'] == 'PASS')
print(f"Traditions: {tr_pass}/100 PASS")

print("\n=== 3. RESOLVING 164 DESTINATIONS ===")
def resolve_dest(d):
    did = d['id']
    queries = get_dest_queries(d)
    
    existing = d.get('heroImageUrl')
    fallbacks = []
    if existing:
        clean_ext = existing.split('?')[0]
        fallbacks.append(clean_ext)
        fname = urllib.parse.unquote(clean_ext.split('/')[-1])
        if fname.startswith('3840px-') or fname.startswith('1280px-') or fname.startswith('800px-'):
            fname = '-'.join(fname.split('-')[1:])
        fallbacks.append(f"https://commons.wikimedia.org/wiki/Special:FilePath/{urllib.parse.quote(fname)}?width=1200")
    
    url, src, sz, ct, dims = resolve_with_fallbacks(queries, fallbacks)
    return {
        'id': did,
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
    verified_destinations = list(ex.map(resolve_dest, raw_destinations))
dst_pass = sum(1 for d in verified_destinations if d['status'] == 'PASS')
print(f"Destinations: {dst_pass}/164 PASS")

# Save outputs
with open(os.path.join(REPO_ROOT, 'docs/curated_data/states.json'), 'w') as f:
    json.dump(verified_states, f, indent=2)

with open(os.path.join(REPO_ROOT, 'docs/curated_data/traditions.json'), 'w') as f:
    json.dump(verified_traditions, f, indent=2)

with open(os.path.join(REPO_ROOT, 'docs/curated_data/destinations.json'), 'w') as f:
    json.dump(verified_destinations, f, indent=2)

# Generate Flyway V27 Migration
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
    for s in verified_states:
        if s['url']:
            clean_u = s['url'].replace("'", "''")
            f.write(f"UPDATE states SET banner_image_url = '{clean_u}', updated_at = NOW() WHERE id = '{s['id']}';\n")

    f.write("\n-- ----------------------------------------------------------------------------\n")
    f.write("-- SECTION 2: 100 CULTURAL TRADITION AUTHENTIC CRAFT IMAGES\n")
    f.write("-- ----------------------------------------------------------------------------\n")
    for t in verified_traditions:
        if t['url']:
            clean_u = t['url'].replace("'", "''")
            f.write(f"UPDATE cultural_traditions SET image_url = '{clean_u}', updated_at = NOW() WHERE id = '{t['id']}';\n")
        else:
            f.write(f"UPDATE cultural_traditions SET image_url = NULL, updated_at = NOW() WHERE id = '{t['id']}';\n")

    f.write("\n-- ----------------------------------------------------------------------------\n")
    f.write("-- SECTION 3: 164 DESTINATION HERO IMAGES\n")
    f.write("-- ----------------------------------------------------------------------------\n")
    for d in verified_destinations:
        if d['url']:
            clean_u = d['url'].replace("'", "''")
            f.write(f"UPDATE destinations SET hero_image_url = '{clean_u}', updated_at = NOW() WHERE id = '{d['id']}';\n")
        else:
            f.write(f"UPDATE destinations SET hero_image_url = NULL, updated_at = NOW() WHERE id = '{d['id']}';\n")

print(f"\nGenerated Flyway migration: {v27_sql_path}")
