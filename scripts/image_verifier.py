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
    'User-Agent': 'YatraSetuDataValidator/1.0 (https://yatrasetu.in; team@yatrasetu.in)'
}

def verify_image_url(item):
    """Perform real GET request to verify HTTP status, content-type, and size"""
    url = item.get('image_url')
    if not url or not url.strip():
        item['validation'] = {
            'status': 'MISSING',
            'http_code': None,
            'content_type': None,
            'size_bytes': 0,
            'dimensions': 'N/A',
            'error': 'Empty URL',
            'verified': False
        }
        return item

    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=12) as resp:
            http_code = resp.status
            content_type = resp.headers.get('Content-Type', '')
            data = resp.read()
            size = len(data)
            
            # Simple header inspection for JPEG / PNG dimensions if possible
            dimensions = "Unknown"
            if len(data) > 30:
                if data.startswith(b'\x89PNG\r\n\x1a\n') and len(data) >= 24:
                    w = int.from_bytes(data[16:20], 'big')
                    h = int.from_bytes(data[20:24], 'big')
                    dimensions = f"{w}x{h}"
                elif data.startswith(b'\xff\xd8'):
                    # Basic JPEG marker parsing
                    idx = 2
                    while idx < min(len(data) - 9, 8192):
                        if data[idx] == 0xFF and data[idx+1] in (0xC0, 0xC1, 0xC2):
                            h = int.from_bytes(data[idx+5:idx+7], 'big')
                            w = int.from_bytes(data[idx+7:idx+9], 'big')
                            dimensions = f"{w}x{h}"
                            break
                        elif data[idx] == 0xFF and data[idx+1] not in (0x00, 0xFF):
                            length = int.from_bytes(data[idx+2:idx+4], 'big')
                            idx += 2 + length
                        else:
                            idx += 1

            is_valid_image = (http_code in (200, 206)) and ('image' in content_type or url.endswith('.jpg') or url.endswith('.png') or url.endswith('.jpeg')) and size > 2048

            item['validation'] = {
                'status': 'PASS' if is_valid_image else 'FAIL',
                'http_code': http_code,
                'content_type': content_type,
                'size_bytes': size,
                'dimensions': dimensions,
                'verified': is_valid_image,
                'error': None if is_valid_image else 'Invalid image content'
            }
            return item
    except urllib.error.HTTPError as e:
        item['validation'] = {
            'status': 'FAIL',
            'http_code': e.code,
            'content_type': None,
            'size_bytes': 0,
            'dimensions': 'N/A',
            'error': f"HTTP {e.code}: {e.reason}",
            'verified': False
        }
        return item
    except Exception as e:
        item['validation'] = {
            'status': 'FAIL',
            'http_code': None,
            'content_type': None,
            'size_bytes': 0,
            'dimensions': 'N/A',
            'error': str(e),
            'verified': False
        }
        return item

print("Curation verification utility ready.")
