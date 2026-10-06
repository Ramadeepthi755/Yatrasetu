import urllib.request
import urllib.parse
import json
import ssl
import time
from concurrent.futures import ThreadPoolExecutor

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'YatraSetuDataValidator/1.0 (https://yatrasetu.in; contact@yatrasetu.in)'
}

def search_wikimedia(query):
    """Search Wikimedia API for top image results"""
    params = {
        'action': 'query',
        'format': 'json',
        'generator': 'search',
        'gsrnamespace': '6',
        'gsrlimit': '8',
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
    except Exception as e:
        return []

def verify_single_url(url):
    """Validate URL with HTTP GET and length/dimension check"""
    if not url or not url.strip():
        return False, None, 0, 'Empty'
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
            data = resp.read()
            if resp.status in (200, 206) and len(data) > 2048:
                return True, resp.status, len(data), resp.headers.get('Content-Type')
    except Exception as e:
        pass
    return False, None, 0, None

def find_verified_url_for_query(queries):
    """Try a series of specific queries and return the first valid verified image"""
    if isinstance(queries, str):
        queries = [queries]
    for q in queries:
        candidates = search_wikimedia(q)
        for c in candidates:
            ok, status, size, ctype = verify_single_url(c['url'])
            if ok:
                return c['url'], c['file_name'], size, ctype
    return None, None, 0, None

print("Master resolver ready.")
