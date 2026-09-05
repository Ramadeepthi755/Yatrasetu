#!/usr/bin/env python3
"""
Generate and verify representative images for all 93 YatraSetu curated destinations.
Queries Wikimedia Commons and verified image repositories.
Validates HTTP 200 on each URL.
"""

import os
import sys
import json
import ssl
import urllib.request
from urllib.parse import quote, urlparse
import psycopg2

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_PATH = os.path.join(BASE_DIR, '.env')

ctx = ssl._create_unverified_context()

def load_env():
    env = {}
    with open(ENV_PATH) as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                k, v = line.strip().split('=', 1)
                env[k] = v.strip('\"\'')
    return env

def check_url(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, context=ctx, timeout=6) as resp:
            return resp.status == 200
    except Exception as e:
        return False

# High quality, curated specific queries for all 93 destinations
# Ensuring exact, representative imagery for every place
DEST_QUERY_MAP = {
    'dest-1': 'Mandrem Beach Goa',
    'dest-2': 'Thiksey Gompa Ladakh',
    'dest-3': 'Hawa Mahal Jaipur',
    'dest-4': 'Varanasi Ghats Ganga aarti',
    'dest-5': 'Taj Mahal Agra India',
    'dest-6': 'City Palace Udaipur Lake Pichola',
    'dest-7': 'Alappuzha houseboat Kerala backwaters',
    'dest-8': 'Madikeri Fort Coorg Kodagu',
    'dest-9': 'Ziro Valley Arunachal Pradesh',
    'dest-10': 'Living root bridge Nohwet Mawlynnong',
    'dest-11': 'Ridge Shimla Christ Church',
    'dest-12': 'Tsuglagkhang Complex Dharamshala McLeod Ganj',
    'dest-13': 'Solang Valley Manali',
    'dest-14': 'Tawang Monastery Arunachal',
    'dest-15': 'Khajjiar Lake meadow Chamba',
    'dest-16': 'Key Monastery Spiti Valley',
    'dest-17': 'Hunder sand dunes Nubra Valley',
    'dest-18': 'Pangong Tso lake Ladakh',
    'dest-19': 'Ooty Nilgiri Mountain Railway lake',
    'dest-20': 'Munnar tea plantations Kerala',
    'dest-21': 'Vivekananda Rock Memorial Kanyakumari',
    'dest-22': 'Dhordo White Desert Rann of Kutch',
    'dest-23': 'Dhanushkodi ghost town beach',
    'dest-24': 'Chitrakote Falls Bastar Chhattisgarh',
    'dest-25': 'Om Beach Gokarna Karnataka',
    'dest-26': 'Puducherry Promenade beach French quarter',
    'dest-27': 'Stone Chariot Vittala Temple Hampi',
    'dest-28': 'Majuli river island Assam Brahmaputra',
    'dest-29': 'Borra Caves Araku Valley',
    'dest-30': 'Varkala Cliff Beach Papanasam',
    'dest-31': 'Radhanagar Beach Havelock Island Swaraj Dweep',
    'dest-32': 'Natural Bridge Neil Island Shaheed Dweep',
    'dest-33': 'Ward Lake Shillong Meghalaya',
    'dest-34': 'Nohkalikai Falls Cherrapunji Sohra',
    'dest-35': 'Umngot River Dawki Shnongpdeng',
    'dest-36': 'Krang Suri Falls Jaintia Hills',
    'dest-37': 'Lakshman Jhula Rishikesh Ganga',
    'dest-38': 'Har Ki Pauri Haridwar Ganga',
    'dest-40': 'Harmandir Sahib Golden Temple Amritsar',
    'dest-41': 'Surkanda Devi Kanatal Tehri',
    'dest-42': 'Binsar Wildlife Sanctuary Almora',
    'dest-43': 'Panchachuli peaks Munsiyari Pithoragarh',
    'dest-44': 'Tiger Falls Chakrata Dehradun',
    'dest-45': 'Kanha National Park tiger reserve',
    'dest-46': 'Ranthambore Fort tiger reserve',
    'dest-47': 'Bandhavgarh National Park tiger',
    'dest-48': 'Tadoba Andhari tiger reserve lake',
    'dest-49': 'Agatti Island lagoon Lakshadweep',
    'dest-50': 'Kalpeni Island Lakshadweep beach',
    'dest-51': 'Jaisalmer Fort Thar Desert',
    'dest-52': 'Aina Mahal Bhuj Kutch',
    'dest-54': 'Banasura Sagar Dam Wayanad Chembra',
    'dest-55': 'Tamhini Ghat waterfalls Mulshi',
    'dest-56': 'Elephant Head Point Mahabaleshwar',
    'dest-57': 'Mullayanagiri peak Chikmagalur coffee',
    'dest-58': 'Amboli Falls Sindhudurg',
    'dest-59': 'Sunset Point Agumbe rainforest',
    'dest-60': 'Kudremukh peak Shola grasslands',
    'dest-63': 'Cellular Jail Port Blair Andaman',
    'dest-64': 'Darjeeling Himalayan Railway tea garden',
    'dest-65': 'Rumtek Monastery Gangtok Sikkim',
    'dest-66': 'Yumthang Valley Lachung North Sikkim',
    'dest-67': 'Double Decker Living Root Bridge Nongriat Meghalaya',
    'dest-68': 'Indian Rhinoceros Kaziranga National Park Assam',
    'dest-69': 'Kandariya Mahadeva temple Khajuraho',
    'dest-70': 'Orchha Chhatris Betwa river Madhya Pradesh',
    'dest-72': 'Kasar Devi temple Almora Himalayas',
    'dest-75': 'Tirthan Valley river Jibhi Himachal',
    'dest-76': 'Chitkul village Baspa River Kinnaur',
    'dest-77': 'Miyar Valley Lahaul glacier',
    'dest-78': 'Keoladeo National Park painted storks Bharatpur',
    'dest-79': 'Ranganathittu Bird Sanctuary Cauvery River',
    'dest-80': 'Nal Sarovar Bird Sanctuary lake Gujarat',
    'dest-81': 'Great Rann of Kutch salt desert white',
    'dest-82': 'Sam Sand Dunes Jaisalmer Thar Desert camel',
    'dest-83': 'Maravanthe Beach Arabian Sea Souparnika River',
    'dest-84': 'Ramachandi Beach Konark marine drive Odisha',
    'dest-85': 'Unakoti rock cut carvings Shiva Tripura',
    'dest-86': 'Shore Temple Mahabalipuram Mamallapuram',
    'dest-87': 'Butterfly Beach Palolem South Goa',
    'dest-88': 'Bangaram Island atoll turquoise lagoon Lakshadweep',
    'dest-89': 'Bekal Fort Kasaragod Malabar coast Kerala',
    'dest-90': 'Dwarkadhish temple Mathura Vrindavan',
    'dest-91': 'Triveni Ghat Rishikesh evening aarti',
    'dest-92': 'Dashashwamedh Ghat Varanasi Ganga',
    'dest-93': 'Mahabodhi Temple Bodh Gaya Bihar',
    'dest-94': 'Pamban Bridge Rameswaram ocean',
    'dest-95': 'Pattadakal UNESCO complex Chalukya temples',
    'dest-96': 'Gulmarg Gondola snow Apharwat peak Kashmir',
    'dest-97': 'Auli skiing slopes Nanda Devi view',
    'dest-98': 'Annamalaiyar Temple Arunachala Tiruvannamalai',
    'dest-99': 'Narmada Udgam Temple Amarkantak',
    'dest-100': 'Badrinath Temple Char Dham Himalayas Uttarakhand',
}

def search_wikimedia(query):
    q = quote(query)
    url = f"https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={q}&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json&gsrlimit=3"
    req = urllib.request.Request(url, headers={'User-Agent': 'YatraSetuDataAudit/1.0 (contact: info@yatrasetu.in)'})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            pages = data.get('query', {}).get('pages', {})
            for pid, p in pages.items():
                img_url = p['imageinfo'][0]['url']
                # Avoid svg or audio
                if img_url.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    return img_url
    except Exception as e:
        print(f"Error querying {query}: {e}")
    return None

def main():
    results = {}
    print("Beginning image search and verification for all 93 destinations...")
    for dest_id, query in DEST_QUERY_MAP.items():
        img = search_wikimedia(query)
        if img:
            ok = check_url(img)
            if ok:
                results[dest_id] = img
                print(f"[OK] {dest_id} -> {img[:65]}...")
            else:
                print(f"[HTTP FAIL] {dest_id} -> {img}")
        else:
            print(f"[NOT FOUND] {dest_id} query={query}")

    print(f"\nSuccessfully verified {len(results)} of {len(DEST_QUERY_MAP)} destination images.")
    out_file = os.path.join(BASE_DIR, 'data', 'scripts', 'verified_images.json')
    with open(out_file, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"Saved to {out_file}")

if __name__ == '__main__':
    main()
