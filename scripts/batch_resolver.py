import json
import urllib.request
import urllib.parse
import ssl
import sys
import os
from concurrent.futures import ThreadPoolExecutor

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (YatraSetu Curation team@yatrasetu.in)'
}

def verify_url(url):
    if not url or not url.strip():
        return False, None, 0, 'Empty', 'N/A'
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
            data = resp.read()
            if resp.status in (200, 206) and len(data) > 1500:
                ct = resp.headers.get('Content-Type', '')
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
                return True, resp.status, len(data), ct, dims
    except Exception as e:
        return False, None, 0, str(e), 'N/A'
    return False, None, 0, 'Invalid Content', 'N/A'

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

def resolve_item(queries, fallbacks=None):
    if fallbacks:
        for f in fallbacks:
            ok, st, sz, ct, dims = verify_url(f)
            if ok:
                return f, 'Direct Verified Source', sz, ct, dims
    for q in queries:
        img, title = get_wikipedia_lead_image(q)
        if img:
            ok, st, sz, ct, dims = verify_url(img)
            if ok:
                return img, f"Wikipedia: {title}", sz, ct, dims
        candidates = search_wikimedia(q)
        for c in candidates:
            ok, st, sz, ct, dims = verify_url(c['url'])
            if ok:
                return c['url'], f"Wikimedia: {c['file_name']}", sz, ct, dims
    return None, 'Not Found', 0, None, 'N/A'

print("Batch resolution pipeline ready.")
