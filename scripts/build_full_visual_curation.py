import json
import urllib.request
import urllib.parse
import ssl
import os
import time
from concurrent.futures import ThreadPoolExecutor

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (YatraSetu Curation team@yatrasetu.in)'
}

def search_wikimedia(query):
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
        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            pages = data.get('query', {}).get('pages', {})
            candidates = []
            for pid, p in pages.items():
                title = p.get('title', '')
                info = p.get('imageinfo', [{}])[0]
                img_url = info.get('url')
                mime = info.get('mime', '')
                width = info.get('width', 0)
                height = info.get('height', 0)
                if img_url and ('jpeg' in mime or 'png' in mime or 'jpg' in mime):
                    file_name = title.replace('File:', '')
                    clean_url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{urllib.parse.quote(file_name)}?width=1200"
                    candidates.append({
                        'title': title,
                        'file_name': file_name,
                        'url': clean_url,
                        'width': width,
                        'height': height,
                        'mime': mime
                    })
            return candidates
    except Exception:
        return []

def get_wikipedia_lead_image(title):
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
        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            pages = data.get('query', {}).get('pages', {})
            for pid, p in pages.items():
                if 'thumbnail' in p:
                    src = p['thumbnail']['source']
                    return src, p.get('title')
    except Exception:
        pass
    return None, None

def verify_live_image(url):
    if not url or not url.strip():
        return False, None, 0, 'Empty', 'N/A'
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
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
                            length = int.from_bytes(data[idx+2:idx+4], 'big')
                            idx += 2 + length
                        else:
                            idx += 1
            if status in (200, 206) and size > 1500:
                return True, status, size, ctype, dims
    except Exception as e:
        return False, None, 0, str(e), 'N/A'
    return False, None, 0, 'Invalid Content', 'N/A'

def resolve_best_image(queries, fallback_urls=None):
    if fallback_urls:
        for fu in fallback_urls:
            ok, st, sz, ct, dims = verify_live_image(fu)
            if ok:
                return fu, "Direct Verified Source", sz, ct, dims
    if isinstance(queries, str):
        queries = [queries]
    for q in queries:
        img, title = get_wikipedia_lead_image(q)
        if img:
            ok, st, sz, ct, dims = verify_live_image(img)
            if ok:
                return img, f"Wikipedia: {title}", sz, ct, dims
        candidates = search_wikimedia(q)
        for c in candidates:
            ok, st, sz, ct, dims = verify_live_image(c['url'])
            if ok:
                return c['url'], f"Wikimedia: {c['file_name']}", sz, ct, dims
    return None, "Not Found", 0, None, 'N/A'

# Load files
with open('/Users/kumarjd/.gemini/antigravity-ide/brain/930bdc6f-e6c4-4c9f-a1a6-299f5766828b/scratch/states.json') as f:
    raw_states = json.load(f)

with open('/Users/kumarjd/.gemini/antigravity-ide/brain/930bdc6f-e6c4-4c9f-a1a6-299f5766828b/scratch/destinations.json') as f:
    raw_destinations = json.load(f)

with open('/Users/kumarjd/.gemini/antigravity-ide/brain/930bdc6f-e6c4-4c9f-a1a6-299f5766828b/scratch/traditions.json') as f:
    raw_traditions = json.load(f)

print(f"Loaded {len(raw_states)} states, {len(raw_destinations)} destinations, {len(raw_traditions)} traditions.")

# Execute resolution & validation
def process_all():
    # 1. States
    print("\n--- Processing 36 States ---")
    from state_queries import STATE_CONFIGS
    state_results = []
    for s in raw_states:
        sid = s['id']
        cfg = STATE_CONFIGS.get(sid, {'queries': [s['stateName']], 'fallbacks': []})
        url, source, sz, ct, dims = resolve_best_image(cfg['queries'], cfg.get('fallbacks'))
        state_results.append({
            'id': sid,
            'name': s['stateName'],
            'region': s.get('region'),
            'landmark': cfg.get('landmark', s['stateName']),
            'url': url,
            'source': source,
            'size': sz,
            'ctype': ct,
            'dims': dims,
            'status': 'PASS' if url else 'FAIL'
        })
        print(f"State [{sid}] {s['stateName']} -> {url is not None} ({dims})")

    # 2. Destinations
    print("\n--- Processing 164 Destinations ---")
    from dest_queries import DEST_CONFIGS
    dest_results = []
    for d in raw_destinations:
        did = d['id']
        cfg = DEST_CONFIGS.get(did, {'queries': [d['destinationName'], d.get('cityName', '')], 'fallbacks': []})
        url, source, sz, ct, dims = resolve_best_image(cfg['queries'], cfg.get('fallbacks'))
        dest_results.append({
            'id': did,
            'name': d['destinationName'],
            'state': d.get('stateName'),
            'city': d.get('cityName'),
            'landmark': cfg.get('landmark', d['destinationName']),
            'url': url,
            'source': source,
            'size': sz,
            'ctype': ct,
            'dims': dims,
            'status': 'PASS' if url else 'FAIL'
        })
        print(f"Dest [{did}] {d['destinationName']} -> {url is not None} ({dims})")

    # 3. Cultural Traditions
    print("\n--- Processing 100 Cultural Traditions ---")
    from tradition_queries import TRADITION_CONFIGS
    trad_results = []
    for t in raw_traditions:
        tid = t['id']
        cfg = TRADITION_CONFIGS.get(tid, {'queries': [t['traditionName'], t.get('craftType', '')], 'fallbacks': []})
        url, source, sz, ct, dims = resolve_best_image(cfg['queries'], cfg.get('fallbacks'))
        trad_results.append({
            'id': tid,
            'name': t['traditionName'],
            'state': t.get('stateName') or t.get('stateId'),
            'craft': t.get('craftType'),
            'category': t.get('category'),
            'url': url,
            'source': source,
            'size': sz,
            'ctype': ct,
            'dims': dims,
            'status': 'PASS' if url else 'FAIL'
        })
        print(f"Tradition [{tid}] {t['traditionName']} -> {url is not None} ({dims})")

    return state_results, dest_results, trad_results

