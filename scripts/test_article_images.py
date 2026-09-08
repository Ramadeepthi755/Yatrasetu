import json
import urllib.request
import urllib.parse
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (YatraSetu Curation team@yatrasetu.in)'
}

def get_all_article_images(title):
    params = {
        'action': 'query',
        'format': 'json',
        'titles': title,
        'prop': 'images'
    }
    url = f"https://en.wikipedia.org/w/api.php?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            pages = data.get('query', {}).get('pages', {})
            for pid, p in pages.items():
                images = p.get('images', [])
                results = []
                for img in images:
                    iname = img.get('title', '').replace('File:', '')
                    if iname.lower().endswith(('.jpg', '.jpeg', '.png')) and not any(x in iname.lower() for x in ['icon', 'logo', 'flag', 'map', 'stub']):
                        clean_url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{urllib.parse.quote(iname)}?width=1200"
                        results.append((clean_url, iname))
                return results
    except Exception as e:
        print(f"Error: {e}")
    return []

test_titles = [
    "Warli painting",
    "Phulkari",
    "Pochampally sari",
    "Pattachitra",
    "Sambalpuri sari",
    "Thewa",
    "Thanjavur painting",
    "Swamimalai Bronze Icons"
]

for t in test_titles:
    res = get_all_article_images(t)
    print(f"Article: {t} -> Found {len(res)} candidate images")
    if res:
        print(f"  Lead image: {res[0][1]}")
