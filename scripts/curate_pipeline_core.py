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
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (YatraSetu Curation Bot dev@yatrasetu.in)'
}

def check_url_live(url):
    if not url or not url.strip():
        return False, None, 0, 'Empty'
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            data = resp.read()
            if resp.status in (200, 206) and len(data) > 1000:
                ct = resp.headers.get('Content-Type', '')
                return True, resp.status, len(data), ct
    except Exception as e:
        return False, None, 0, str(e)
    return False, None, 0, 'Unknown'

print("Live check utility loaded.")
