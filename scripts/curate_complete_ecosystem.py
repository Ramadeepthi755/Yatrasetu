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
    'User-Agent': 'YatraSetuAuthoritativeCuration/2.0 (team@yatrasetu.in)'
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

# Targeted canonical queries for all destinations
def get_dest_canonical_queries(d):
    name = d['destinationName']
    city = d.get('cityName') or ''
    state = d.get('stateName') or ''
    
    # Specific landmarks for all destinations
    dest_map = {
        'dest-1': ['Goa', 'Calangute', 'Basilica of Bom Jesus'],
        'dest-2': ['Leh', 'Leh Palace', 'Shanti Stupa, Ladakh'],
        'dest-3': ['Jaipur', 'Hawa Mahal', 'Amber Fort'],
        'dest-4': ['Varanasi', 'Kashi Vishwanath Temple', 'Dashashwamedh Ghat'],
        'dest-5': ['Agra', 'Taj Mahal', 'Agra Fort'],
        'dest-6': ['Rishikesh', 'Lakshman Jhula', 'Triveni Ghat'],
        'dest-7': ['Amritsar', 'Golden Temple', 'Jallianwala Bagh'],
        'dest-8': ['Udaipur', 'City Palace, Udaipur', 'Lake Pichola'],
        'dest-9': ['Hampi', 'Virupaksha Temple', 'Vijayanagara'],
        'dest-10': ['Mawlynnong', 'Living root bridge', 'Cherrapunji'],
        'dest-11': ['Shimla', 'The Ridge, Shimla', 'Viceregal Lodge, Shimla'],
        'dest-12': ['Dharamshala', 'McLeod Ganj', 'Kangra Valley'],
        'dest-13': ['Manali, Himachal Pradesh', 'Solang Valley', 'Rohtang Pass'],
        'dest-14': ['Mysore Palace', 'Mysore', 'Chamundi Hills'],
        'dest-15': ['Ooty', 'Nilgiri Mountain Railway', 'Ooty Lake'],
        'dest-16': ['Munnar', 'Anamudi', 'Tea plantation'],
        'dest-17': ['Alappuzha', 'Kerala backwaters', 'Vembanad'],
        'dest-18': ['Kochi', 'Fort Kochi', 'Chinese fishing nets'],
        'dest-19': ['Pondicherry', 'Promenade Beach', 'Auroville'],
        'dest-20': ['Madurai', 'Meenakshi Temple', 'Thirumalai Nayakkar Mahal'],
        'dest-21': ['Mahabalipuram', 'Shore Temple', 'Pancha Rathas'],
        'dest-22': ['Kanyakumari', 'Vivekananda Rock Memorial', 'Thiruvalluvar Statue'],
        'dest-23': ['Tirupati', 'Venkateswara Temple, Tirumala', 'Tirumala'],
        'dest-24': ['Hyderabad', 'Charminar', 'Golconda Fort'],
        'dest-25': ['Khajuraho Group of Monuments', 'Kandariya Mahadeva Temple', 'Khajuraho'],
        'dest-26': ['Bodh Gaya', 'Mahabodhi Temple', 'Bodhi Tree'],
        'dest-27': ['Darjeeling', 'Tiger Hill, Darjeeling', 'Darjeeling Himalayan Railway'],
        'dest-28': ['Gangtok', 'Rumtek Monastery', 'Nathu La'],
        'dest-29': ['Shillong', 'Umiam Lake', 'Elephant Falls, Shillong'],
        'dest-30': ['Kaziranga National Park', 'Indian rhinoceros', 'Assam'],
        'dest-31': ['Puri, Odisha', 'Jagannath Temple, Puri', 'Puri Beach'],
        'dest-32': ['Konark Sun Temple', 'Konark', 'Chariot wheel'],
        'dest-33': ['Bhubaneswar', 'Lingaraja Temple', 'Mukteshvara Temple, Bhubaneswar'],
        'dest-34': ['Jodhpur', 'Mehrangarh', 'Jaswant Thada'],
        'dest-35': ['Jaisalmer', 'Jaisalmer Fort', 'Thar Desert'],
        'dest-36': ['Pushkar', 'Brahma Temple, Pushkar', 'Pushkar Lake'],
        'dest-37': ['Mount Abu', 'Dilwara Temples', 'Nakki Lake'],
        'dest-38': ['Ranthambore National Park', 'Ranthambore Fort', 'Bengal tiger'],
        'dest-39': ['Jim Corbett National Park', 'Bengal tiger', 'Nainital'],
        'dest-40': ['Nainital', 'Naini Lake', 'Naina Devi Temple'],
        'dest-41': ['Mussoorie', 'Kempty Falls', 'Mall Road, Mussoorie'],
        'dest-42': ['Haridwar', 'Har Ki Pauri', 'Ganga Aarti'],
        'dest-43': ['Kedarnath Temple', 'Kedarnath', 'Rudraprayag district'],
        'dest-44': ['Badrinath Temple', 'Badrinath', 'Chamoli district'],
        'dest-45': ['Valley of Flowers National Park', 'Hemkund Sahib', 'Nanda Devi'],
        'dest-46': ['Auli', 'Auli, India', 'Ski resort'],
        'dest-47': ['Kausani', 'Trishul (mountain)', 'Bageshwar district'],
        'dest-48': ['Ranikhet', 'Ranikhet', 'Almora district'],
        'dest-49': ['Almora', 'Kasar Devi', 'Almora'],
        'dest-50': ['Chopta', 'Tungnath', 'Chandrashila'],
        'dest-51': ['Gokarna, India', 'Om Beach, Gokarna', 'Mahabaleshwar Temple, Gokarna'],
        'dest-52': ['Coorg', 'Madikeri', 'Abbey Falls'],
        'dest-53': ['Chikmagalur', 'Mullayanagiri', 'Baba Budangiri'],
        'dest-54': ['Kabini River', 'Nagarhole National Park', 'Kabini'],
        'dest-55': ['Bandipur National Park', 'Tiger reserve', 'Chamarajanagar district'],
        'dest-56': ['Badami, India', 'Badami cave temples', 'Agastya Lake'],
        'dest-57': ['Pattadakal', 'Group of Monuments at Pattadakal', 'Virupaksha Temple, Pattadakal'],
        'dest-58': ['Aihole', 'Durga temple, Aihole', 'Chalukya architecture'],
        'dest-59': ['Bijapur, Karnataka', 'Gol Gumbaz', 'Ibrahim Rauza'],
        'dest-60': ['Belur, Karnataka', 'Chennakeshava Temple, Belur', 'Hassan district'],
        'dest-61': ['Halebidu', 'Hoysaleswara Temple', 'Hassan district'],
        'dest-62': ['Shravanabelagola', 'Gommateshwara statue', 'Hassan district'],
        'dest-63': ['Murudeshwara', 'Murdeshwar Temple', 'Shiva statue'],
        'dest-64': ['Dandeli', 'Kali River (Karnataka)', 'Dandeli Wildlife Sanctuary'],
        'dest-65': ['Jog Falls', 'Sharavathi River', 'Shimoga district'],
        'dest-66': ['Kudremukh', 'Kudremukh National Park', 'Chikkamagaluru district'],
        'dest-67': ['Agumbe', 'Agumbe Rainforest Research Station', 'Western Ghats'],
        'dest-68': ['Udupi', 'Sri Krishna Matha, Udupi', 'Malpe'],
        'dest-69': ['Mangalore', 'Panambur Beach', 'Kadri Manjunath Temple'],
        'dest-70': ['Karwar', 'Rabindranath Tagore Beach', 'Uttara Kannada'],
        'dest-71': ['Varkala', 'Varkala Beach', 'Varkala Cliff'],
        'dest-72': ['Kovalam', 'Kovalam Beach', 'Lighthouse Beach, Kovalam'],
        'dest-73': ['Wayanad district', 'Banasura Sagar Dam', 'Edakkal Caves'],
        'dest-74': ['Thekkady', 'Periyar National Park', 'Periyar Lake'],
        'dest-75': ['Bekal Fort', 'Kasaragod district', 'Bekal Beach'],
        'dest-76': ['Athirappilly Falls', 'Chalakudy River', 'Thrissur district'],
        'dest-77': ['Vagamon', 'Vagamon Pine Forest', 'Idukki district'],
        'dest-78': ['Poovar', 'Poovar Island', 'Neyyar River'],
        'dest-79': ['Kumarakom', 'Vembanad', 'Kumarakom Bird Sanctuary'],
        'dest-80': ['Silent Valley National Park', 'Palakkad district', 'Nilgiri Biosphere Reserve'],
        'dest-81': ['Rann of Kutch', 'Great Rann of Kutch', 'White Desert'],
        'dest-82': ['Gir National Park', 'Asiatic lion', 'Sasan Gir'],
        'dest-83': ['Somnath temple', 'Somnath', 'Veraval'],
        'dest-84': ['Dwarka', 'Dwarkadhish Temple', 'Gomti Ghat'],
        'dest-85': ['Statue of Unity', 'Sardar Sarovar Dam', 'Kevadiya'],
        'dest-86': ['Sun Temple, Modhera', 'Modhera', 'Mehsana district'],
        'dest-87': ['Rani ki Vav', 'Patan, Gujarat', 'Stepwell'],
        'dest-88': ['Champaner-Pavagadh Archaeological Park', 'Pavagadh', 'Kalika Mata Temple, Pavagadh'],
        'dest-89': ['Saputara', 'Dang district, India', 'Sahyadri'],
        'dest-90': ['Lothal', 'Indus Valley Civilisation', 'Dholavira'],
        'dest-91': ['Dholavira', 'Kutch district', 'Indus Valley Civilisation'],
        'dest-92': ['Dashashwamedh Ghat', 'Ganges in Varanasi', 'Varanasi'],
        'dest-93': ['Sarnath', 'Dhamek Stupa', 'Ashoka Pillar'],
        'dest-94': ['Ayodhya', 'Ram Mandir, Ayodhya', 'Saryu'],
        'dest-95': ['Mathura', 'Krishna Janmasthan Temple Complex', 'Vrindavan'],
        'dest-96': ['Vrindavan', 'Prem Mandir, Vrindavan', 'Bankey Bihari Temple'],
        'dest-97': ['Fatehpur Sikri', 'Buland Darwaza', 'Salim Chishti Tomb'],
        'dest-98': ['Prayagraj', 'Triveni Sangam', 'Allahabad Fort'],
        'dest-99': ['Jhansi Fort', 'Jhansi', 'Rani Mahal, Jhansi'],
        'dest-100': ['Badrinath Temple', 'Kedarnath Temple', 'Haridwar'],
        'dest-101': ['Charminar', 'Hyderabad', 'Golconda Fort'],
        'dest-102': ['Thousand Pillar Temple', 'Warangal Fort', 'Warangal'],
        'dest-103': ['Red Fort', 'Humayun\'s Tomb', 'Delhi'],
        'dest-104': ['India Gate', 'Rashtrapati Bhavan', 'New Delhi'],
        'dest-105': ['Bangalore Palace', 'Vidhana Soudha', 'Bengaluru'],
        'dest-106': ['Gateway of India', 'Marine Drive, Mumbai', 'Mumbai'],
        'dest-107': ['Victoria Memorial, Kolkata', 'Howrah Bridge', 'Kolkata'],
        'dest-108': ['Marina Beach', 'Kapaleeshwarar Temple', 'Chennai'],
        'dest-109': ['Rock Garden of Chandigarh', 'Chandigarh', 'Sukhna Lake'],
        'dest-110': ['Sabarmati Ashram', 'Adalaj Stepwell', 'Ahmedabad'],
        'dest-111': ['Golden Temple', 'Jallianwala Bagh', 'Amritsar'],
        'dest-112': ['Dal Lake', 'Shalimar Bagh, Srinagar', 'Srinagar'],
        'dest-113': ['Mirik', 'Mirik Lake', 'Darjeeling'],
        'dest-114': ['Shimla', 'The Ridge, Shimla', 'Mall Road, Shimla'],
        'dest-115': ['Kamakhya Temple', 'Guwahati', 'Brahmaputra River'],
        'dest-116': ['Nainital', 'Naini Lake', 'Nainital district'],
        'dest-117': ['Mussoorie', 'Kempty Falls', 'Mussoorie'],
        'dest-118': ['Silvassa', 'Diu Fort', 'Dadra and Nagar Haveli'],
        'dest-119': ['Brahma Sarovar', 'Kurukshetra', 'Jyotisar'],
        'dest-120': ['Yadavindra Gardens', 'Pinjore', 'Panchkula district'],
        'dest-121': ['Morni Hills', 'Tikkar Taal', 'Panchkula district'],
        'dest-122': ['Mount Abu', 'Dilwara Temples', 'Nakki Lake'],
        'dest-123': ['Mahabaleshwar', 'Venna Lake', 'Elephant\'s Head Point'],
        'dest-124': ['Kangla Fort', 'Imphal', 'Loktak Lake'],
        'dest-125': ['Gangtok', 'Rumtek Monastery', 'MG Marg, Gangtok'],
        'dest-126': ['Nohkalikai Falls', 'Cherrapunji', 'Living root bridge'],
        'dest-127': ['Aizawl', 'Durtlang Hills', 'Mizoram'],
        'dest-128': ['Reiek', 'Mizoram', 'Aizawl district'],
        'dest-129': ['Vantawng Falls', 'Thenzawl', 'Serchhip district'],
        'dest-130': ['Champhai', 'Mizoram', 'Rih Dil'],
        'dest-131': ['Kohima', 'Kohima War Cemetery', 'Naga Heritage Village, Kisama'],
        'dest-132': ['Bandhavgarh National Park', 'Umaria district', 'Bengal tiger'],
        'dest-133': ['Kanha Tiger Reserve', 'Mandla district', 'Bengal tiger'],
        'dest-134': ['Khonoma', 'Nagaland', 'Kohima district'],
        'dest-135': ['Thekkady', 'Periyar National Park', 'Idukki district'],
        'dest-136': ['Venkateswara Temple, Tirumala', 'Tirupati', 'Tirumala hills'],
        'dest-137': ['Visakhapatnam', 'Rishikonda Beach', 'Kailasagiri'],
        'dest-138': ['Rameswaram', 'Ramanathaswamy Temple', 'Pamban Bridge'],
        'dest-139': ['Srisailam', 'Mallikarjuna Temple, Srisailam', 'Srisailam Dam'],
        'dest-140': ['Lepakshi', 'Veerabhadra Temple, Lepakshi', 'Nandi (bull)'],
        'dest-141': ['Fort Kochi', 'Chinese fishing nets', 'Mattancherry Palace'],
        'dest-142': ['Alappuzha', 'Vembanad', 'Kerala backwaters'],
        'dest-143': ['Mysore Palace', 'Mysuru', 'Brindavan Gardens'],
        'dest-144': ['Virupaksha Temple', 'Hampi', 'Vijayanagara'],
        'dest-145': ['Om Beach, Gokarna', 'Gokarna, India', 'Kudle Beach'],
        'dest-146': ['Brihadisvara Temple, Thanjavur', 'Thanjavur', 'Thanjavur Maratha Palace'],
        'dest-147': ['Shore Temple', 'Mahabalipuram', 'Pancha Rathas'],
        'dest-148': ['Promenade Beach', 'Pondicherry', 'Auroville'],
        'dest-149': ['Calangute', 'Fort Aguada', 'Goa'],
        'dest-150': ['Badami cave temples', 'Pattadakal', 'Aihole'],
        'dest-151': ['Chennakeshava Temple, Belur', 'Hoysaleswara Temple', 'Halebidu'],
        'dest-152': ['Somnathpur', 'Chennakesava Temple, Somanathapura', 'Mysore district'],
        'dest-153': ['Kumbakonam', 'Adi Kumbeswarar Temple', 'Mahamaham tank, Kumbakonam'],
        'dest-154': ['Chettinad', 'Karaikudi', 'Chettinad mansion'],
        'dest-155': ['Rameshwaram', 'Pamban Bridge', 'Dhanushkodi'],
        'dest-156': ['Chidambaram', 'Nataraja Temple, Chidambaram', 'Thillai Nataraja Temple'],
        'dest-157': ['Kanchipuram', 'Ekambareswarar Temple', 'Kailasanathar Temple, Kanchipuram'],
        'dest-158': ['Tiruvannamalai', 'Annamalaiyar Temple', 'Arunachala'],
        'dest-159': ['Lingaraja Temple', 'Mukteshvara Temple, Bhubaneswar', 'Bhubaneswar'],
        'dest-160': ['Jagannath Temple, Puri', 'Puri Beach', 'Puri, Odisha'],
        'dest-161': ['Chilika Lake', 'Nalabana Bird Sanctuary', 'Puri district'],
        'dest-162': ['Gopalpur-on-Sea', 'Gopalpur, Odisha', 'Ganjam district'],
        'dest-163': ['Sundarbans National Park', 'Sundarbans', 'Royal Bengal tiger'],
        'dest-164': ['Santiniketan', 'Visva-Bharati University', 'Bolpur'],
        'dest-165': ['Bishnupur, Bankura', 'Terracotta temples of Bishnupur', 'Rasmancha'],
        'dest-166': ['Digha', 'New Digha Beach', 'Purba Medinipur'],
        'dest-167': ['Ranchi', 'Hundru Falls', 'Jonha Falls'],
        'dest-168': ['Baidyanath Temple', 'Deoghar', 'Trikut Pahar']
    }
    
    if d['id'] in dest_map:
        return dest_map[d['id']]
    
    clean_name = name.split('(')[0].split('–')[0].split('&')[0].strip()
    return [name, clean_name, f"{clean_name} {city}".strip(), f"{clean_name} {state}".strip(), city]

get_dest_queries = get_dest_canonical_queries

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
    queries = get_dest_canonical_queries(d)
    
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
