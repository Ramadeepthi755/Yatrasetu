import json
import urllib.parse
from master_resolver import find_verified_url_for_query, verify_single_url
from concurrent.futures import ThreadPoolExecutor

with open('/Users/kumarjd/.gemini/antigravity-ide/brain/930bdc6f-e6c4-4c9f-a1a6-299f5766828b/scratch/traditions.json') as f:
    traditions = json.load(f)

# Define exact targeted queries for all 100 cultural traditions
TRADITION_QUERIES = {
    "cult-an-nicobar-mat": ["Nicobarese craft mat weaving", "Andaman Nicobar cane craft", "Nicobar mat"],
    "cult-an-shell-craft": ["Shell craft Andaman", "Marine shell carving", "Sea shell craft India"],
    "cult-ap-dharmavaram": ["Dharmavaram saree", "Dharmavaram silk weaving", "Silk saree Andhra"],
    "cult-ap-kalamkari": ["Srikalahasti Kalamkari painting", "Kalamkari art tree of life", "Kalamkari painting Andhra"],
    "cult-ap-kondapalli": ["Kondapalli Toys", "Kondapalli wooden toys", "Kondapalli toy Vijayawada"],
    "cult-ap-machilipatnam": ["Machilipatnam Kalamkari block print", "Block printing Kalamkari", "Kalamkari textile"],
    "cult-ar-apatani-weave": ["Apatani weaving", "Apatani textile Arunachal", "Apatani tribe weaving"],
    "cult-ar-monpa-paper": ["Monpa handmade paper", "Tawang handmade paper", "Daphne paper Arunachal"],
    "cult-ar-wancho-wood": ["Wancho wood carving", "Wancho wood craft Arunachal", "Naga wood carving"],
    "cult-as-majuli-mask": ["Majuli mask Assam", "Mukha mask Majuli", "Samaguri Satra mask"],
    "cult-as-muga-silk": ["Muga silk Assam", "Muga silk weaving", "Assam silk mekhela chador"],
    "cult-as-sarthebari": ["Sarthebari bell metal", "Sarthebari bell metal craft", "Kahi bati Sarthebari"],
    "cult-br-madhubani": ["Madhubani painting", "Mithila painting Bihar", "Madhubani art"],
    "cult-br-sikki": ["Sikki grass craft", "Sikki grass craft Bihar", "Golden grass craft"],
    "cult-br-sujuni": ["Sujuni embroidery", "Sujuni craft Bihar", "Sujuni quilt"],
    "cult-cg-bastar-dhokra": ["Bastar Dhokra", "Dhokra metal craft Bastar", "Lost wax brass casting Dhokra"],
    "cult-cg-bastar-iron": ["Bastar iron craft", "Loha shilp Bastar", "Wrought iron craft Chhattisgarh"],
    "cult-cg-terracotta": ["Bastar terracotta craft", "Terracotta pottery Chhattisgarh", "Bastar pottery"],
    "cult-ch-assemblage": ["Rock Garden of Chandigarh sculpture", "Nek Chand sculpture", "Rock Garden ceramic mosaic"],
    "cult-dh-warli": ["Warli painting Dadra Nagar Haveli", "Warli art Silvassa", "Warli tribal painting"],
    "cult-dl-meenakari": ["Meenakari jewellery Delhi", "Meenakari enamel craft", "Meenakari work"],
    "cult-dl-zardozi": ["Zardozi embroidery Delhi", "Zardozi metallic gold embroidery", "Zari Zardozi craft"],
    "cult-ga-azulejos": ["Goan azulejos tile", "Azulejo tile Goa", "Hand painted ceramic tiles Goa"],
    "cult-ga-kunbi": ["Kunbi saree Goa", "Kunbi handloom weaving", "Kunbi cotton weave"],
    "cult-gj-bandhani": ["Bandhani saree Gujarat", "Bandhej tie and dye Kutch", "Bandhani textile"],
    "cult-gj-kutch-lippan": ["Lippan art Kutch", "Lippan kaam mud mirror work", "Kutch mud mirror art"],
    "cult-gj-patan-patola": ["Patan Patola saree", "Double ikat Patola Patan", "Patola weaving Gujarat"],
    "cult-gj-rogan": ["Rogan art Nirona", "Rogan painting Kutch", "Rogan castor oil painting"],
    "cult-hp-chamba-rumal": ["Chamba rumal embroidery", "Chamba rumal needlework", "Chamba handkerchief"],
    "cult-hp-kangra-painting": ["Kangra miniature painting", "Kangra painting Himachal", "Pahari miniature painting"],
    "cult-hp-kullu-shawl": ["Kullu shawl weaving", "Kullu woolen shawl geometric", "Himachali shawl"],
    "cult-hr-panipat-handloom": ["Panipat handloom durrie", "Panipat textile weaving", "Handloom durrie Haryana"],
    "cult-hr-rewari-metal": ["Rewari brass metalware", "Rewari brass craft", "Brass utensil craft"],
    "cult-jh-dhokra": ["Dhokra metal craft Jharkhand", "Jharkhand tribal brass casting", "Dhokra bronze craft"],
    "cult-jh-sohrai-khovar": ["Sohrai painting Hazaribagh", "Khovar mural art Jharkhand", "Sohrai tribal art"],
    "cult-jk-kani": ["Kani shawl weaving Kashmir", "Kani pashmina shawl", "Kani loom Kashmir"],
    "cult-jk-paper-mache": ["Kashmir paper mache", "Papier mache box Kashmir", "Kashmiri paper mache craft"],
    "cult-jk-pashmina": ["Kashmiri pashmina shawl", "Pashmina spinning Kashmir", "Pashmina embroidery"],
    "cult-jk-wood-carving": ["Kashmir walnut wood carving", "Walnut wood carving Srinagar", "Kashmiri wood carving"],
    "cult-ka-bidriware": ["Bidriware craft Bidar", "Bidri metal craft inlay", "Bidriware vase"],
    "cult-ka-channapatna": ["Channapatna toys", "Channapatna wooden lacquer toys", "Channapatna craft"],
    "cult-ka-ilkal": ["Ilkal saree Bagalkot", "Ilkal handloom saree", "Ilkal tope teni pallu"],
    "cult-ka-mysore-silk": ["Mysore silk saree", "Mysore silk weaving KSIC", "Pure silk saree Mysore"],
    "cult-kl-aranmula": ["Aranmula Kannadi", "Aranmula metal mirror", "Aranmula mirror Kerala"],
    "cult-kl-balaramapuram": ["Balaramapuram kasavu saree", "Kerala kasavu mundu", "Balaramapuram handloom"],
    "cult-kl-coir": ["Kerala coir craft", "Coir spinning wheel Kerala", "Coir mat weaving"],
    "cult-kl-kathakali": ["Kathakali mask craft", "Kathakali costume headgear", "Kathakali face painting"],
    "cult-la-pashmina": ["Changthangi goat pashmina Ladakh", "Ladakh pashmina wool spinning", "Changpa pashmina"],
    "cult-la-thangka": ["Ladakh Buddhist thangka", "Thangka painting Ladakh", "Tibetan scroll painting"],
    "cult-la-wood-carving": ["Ladakh wood carving dragon", "Ladakh altar carving", "Shingszo wood carving"],
    "cult-ld-coir-craft": ["Lakshadweep coir fiber craft", "Lakshadweep shell craft", "Coconut coir Lakshadweep"],
    "cult-mh-kolhapuri": ["Kolhapuri chappal leather", "Kolhapuri footwear craft", "Handcrafted Kolhapuri leather"],
    "cult-mh-paithani": ["Paithani saree weaving", "Paithani silk saree peacock pallu", "Yeola Paithani saree"],
    "cult-mh-warli": ["Warli tribal painting Maharashtra", "Warli art Dahanu", "Warli folk painting"],
    "cult-ml-khasi-cane": ["Khasi cane basket craft", "Khasi bamboo knup Meghalaya", "Meghalaya bamboo cane"],
    "cult-ml-ryndia-eri": ["Ryndia eri silk Meghalaya", "Eri silk weaving Ri-Bhoi", "Ahimsa silk Meghalaya"],
    "cult-mn-kauna-craft": ["Kauna reed craft Manipur", "Kauna grass mat Manipur", "Kauna water reed basket"],
    "cult-mn-longpi": ["Longpi black pottery Manipur", "Longpi stone pottery", "Longpi Ham clay Manipur"],
    "cult-mn-moirang-phee": ["Moirang Phee handloom Manipur", "Moirang Phee textile", "Manipur handloom weaving"],
    "cult-mp-bagh": ["Bagh print textile Madhya Pradesh", "Bagh block print Dhar", "Bagh printing MP"],
    "cult-mp-chanderi": ["Chanderi saree weaving", "Chanderi silk cotton fabric", "Chanderi handloom MP"],
    "cult-mp-gond": ["Gond tribal painting Madhya Pradesh", "Gond art Patangarh", "Gond painting MP"],
    "cult-mz-bamboo": ["Mizo bamboo hat Khumbeu", "Mizo cane basketry", "Mizoram bamboo craft"],
    "cult-mz-puan": ["Mizo Puan handloom weaving", "Puchei Puan weaving Mizoram", "Mizo traditional textile"],
    "cult-nl-naga-shawl": ["Naga shawl weaving", "Naga textile backstrap loom", "Chakesang shawl Nagaland"],
    "cult-nl-wood-carving": ["Naga wood carving Morung", "Naga tribal wood sculpture", "Nagaland wood relief"],
    "cult-od-applique": ["Pipili applique work Odisha", "Pipili chandua craft", "Odisha applique canopy"],
    "cult-od-pattachitra": ["Raghurajpur Pattachitra painting", "Pattachitra palm leaf painting", "Odisha pattachitra scroll"],
    "cult-od-pipili": ["Pipili Applique Work", "Pipili lantern applique", "Odisha applique craft"],
    "cult-od-sambalpuri": ["Sambalpuri ikat saree", "Sambalpuri bandha weaving", "Sambalpuri handloom Odisha"],
    "cult-pb-jutti": ["Patiala jutti handcrafted", "Punjabi jutti leather embroidery", "Muktsar jutti Punjab"],
    "cult-pb-phulkari": ["Phulkari dupatta Punjab", "Phulkari embroidery Punjab", "Phulkari needlework"],
    "cult-py-handmade-paper": ["Puducherry handmade paper craft", "Aurobindo handmade paper", "Cotton rag paper Pondicherry"],
    "cult-py-terracotta": ["Villianur terracotta craft Puducherry", "Pondicherry terracotta craft", "Villianur clay sculptures"],
    "cult-rj-blue-pottery": ["Jaipur blue pottery", "Blue pottery craft Rajasthan", "Jaipur ceramic pottery"],
    "cult-rj-kathputli": ["Rajasthani kathputli puppets", "Kathputli puppet craft Jaipur", "Rajasthani wooden puppets"],
    "cult-rj-pichwai": ["Nathdwara Pichwai painting", "Pichwai painting Shrinathji", "Pichwai cloth painting Rajasthan"],
    "cult-rj-thewa": ["Thewa gold work on glass Pratapgarh", "Thewa jewellery Rajasthan", "Thewa gold craft"],
    "cult-sk-choktse": ["Choktse table wood carving Sikkim", "Sikkim wooden folding table", "Choktse table Buddhist"],
    "cult-sk-thangka": ["Sikkim Buddhist thangka painting", "Thangka scroll painting Sikkim", "Buddhist thangka art"],
    "cult-tg-cheriyal": ["Cheriyal scroll painting Telangana", "Cheriyal mask painting", "Nakashi art Cheriyal"],
    "cult-tg-gadwal": ["Gadwal saree weaving Telangana", "Gadwal silk saree handloom", "Gadwal cotton saree"],
    "cult-tg-pembarthi": ["Pembarthi sheet metal craft", "Pembarthi brass repousse", "Pembarthi metal art Telangana"],
    "cult-tg-pochampally": ["Pochampally ikat saree", "Pochampally tie and dye Telangana", "Pochampally double ikat"],
    "cult-tn-kanchipuram": ["Kanchipuram silk saree weaving", "Kanjivaram silk saree Tamil Nadu", "Kanchipuram handloom"],
    "cult-tn-swamimalai": ["Swamimalai bronze idol casting", "Swamimalai bronze statue", "Lost wax bronze casting Swamimalai"],
    "cult-tn-thanjavur-painting": ["Thanjavur painting gold leaf", "Tanjore painting Ganesha", "Thanjavur gold foil art"],
    "cult-tn-toda": ["Toda tribal embroidery Nilgiris", "Toda pukhoor shawl Tamil Nadu", "Toda embroidery shawl"],
    "cult-tr-cane-bamboo": ["Tripura bamboo cane craft", "Tripura bamboo screen weaving", "Bamboo lampshade Tripura"],
    "cult-tr-risa": ["Tripura Risa handloom textile", "Risa indigenous cloth Tripura", "Tripura handloom loin loom"],
    "cult-up-banarasi": ["Banarasi silk saree weaving Varanasi", "Banarasi brocade silk", "Varanasi handloom silk saree"],
    "cult-up-lucknow-chikan": ["Lucknow chikankari embroidery", "Chikan needlework Lucknow", "Chikankari kurti embroidery"],
    "cult-up-moradabad-brass": ["Moradabad brass craft metalware", "Moradabad brass engraving", "Moradabad brassware"],
    "cult-ut-aipan": ["Aipan art Kumaon Uttarakhand", "Aipan folk painting Almora", "Uttarakhand traditional Aipan"],
    "cult-ut-ringal": ["Ringal bamboo craft Uttarakhand", "Garhwal ringal basketry", "Ringal bamboo weaving Himalayas"],
    "cult-ut-thulma": ["Thulma woolen blanket Uttarakhand", "Bhotia wool weaving Uttarakhand", "Thulma blanket weave"],
    "cult-wb-baluchari": ["Baluchari silk saree Bishnupur", "Baluchari saree mythological pallu", "Baluchari handloom Bengal"],
    "cult-wb-kantha": ["Nakshi Kantha embroidery Bengal", "Kantha stitch quilt West Bengal", "Kantha saree embroidery"],
    "cult-wb-terracotta": ["Bankura terracotta horse Bishnupur", "Bishnupur terracotta temples craft", "Bankura horse Bengal"]
}

def resolve_tradition(item):
    tid = item['id']
    queries = TRADITION_QUERIES.get(tid, [item['traditionName'], item.get('craftType', '')])
    url, filename, size, ctype = find_verified_url_for_query(queries)
    return {
        'id': tid,
        'name': item['traditionName'],
        'state': item.get('stateName') or item.get('stateId'),
        'queries': queries,
        'url': url,
        'filename': filename,
        'size': size,
        'ctype': ctype,
        'status': 'PASS' if url else 'FAIL'
    }

print("Resolving all 100 Cultural Traditions...")
with ThreadPoolExecutor(max_workers=15) as ex:
    trad_results = list(ex.map(resolve_tradition, traditions))

passed = [t for t in trad_results if t['status'] == 'PASS']
print(f"Traditions Resolved: {len(passed)}/100 PASS\n")

for t in trad_results:
    if t['status'] != 'PASS':
        print(f"FAILED: [{t['id']}] {t['name']} ({t['state']}) -> {t['queries']}")

with open('/Users/kumarjd/.gemini/antigravity-ide/brain/930bdc6f-e6c4-4c9f-a1a6-299f5766828b/scratch/curated_traditions.json', 'w') as f:
    json.dump(trad_results, f, indent=2)
