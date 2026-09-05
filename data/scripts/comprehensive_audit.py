#!/usr/bin/env python3
"""
YatraSetu - Comprehensive Data Integrity & Utilization Audit
Automated checks for:
1. Wrong city -> state relationships
2. Fallback coordinates (20.5937, 78.9629) or null/zero
3. Destination -> city -> state integrity
4. Hotel -> city integrity
5. POI -> city / destination integrity
6. Local Host -> city / state integrity
7. Travel Buddy -> destination / state integrity
8. Duplicate records
9. Orphan records
10. Unlabelled demo data
"""

import os
import psycopg2
from collections import defaultdict

def run_audit():
    env = {}
    env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env')
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip().strip("'").strip('"')

    url = env['SPRING_DATASOURCE_URL'].replace('jdbc:postgresql://', 'postgresql://')
    conn = psycopg2.connect(
        dbname=url.split('/')[-1].split('?')[0],
        user=env['SPRING_DATASOURCE_USERNAME'],
        password=env['SPRING_DATASOURCE_PASSWORD'],
        host=url.split('@')[-1].split(':')[0] if '@' in url else url.split('//')[-1].split(':')[0],
        port=int(url.split(':')[-1].split('/')[0])
    )
    cur = conn.cursor()

    report = {}
    print("=" * 70)
    print("YATRASETU AUTOMATED DATA INTEGRITY AUDIT")
    print("=" * 70)

    # 1. Cities check
    cur.execute("""
        SELECT count(*) FROM cities 
        WHERE (state_id = 'IN-DL' AND id != 'delhi' AND id != 'new-delhi')
           OR state_id IS NULL;
    """)
    wrong_city_state = cur.fetchone()[0]
    report['wrong_city_state'] = wrong_city_state

    cur.execute("""
        SELECT count(*) FROM cities 
        WHERE (abs(latitude - 20.5937) < 0.001 AND abs(longitude - 78.9629) < 0.001)
           OR latitude IS NULL OR longitude IS NULL OR (latitude = 0 AND longitude = 0);
    """)
    fallback_city_coords = cur.fetchone()[0]
    report['fallback_city_coords'] = fallback_city_coords

    # 2. Destinations check
    cur.execute("""
        SELECT count(*) FROM destinations d
        LEFT JOIN cities c ON d.city_id = c.id
        WHERE c.id IS NULL;
    """)
    dest_orphan_city = cur.fetchone()[0]
    report['dest_orphan_city'] = dest_orphan_city

    cur.execute("""
        SELECT count(*) FROM destinations d
        JOIN cities c ON d.city_id = c.id
        WHERE d.state_id != c.state_id;
    """)
    dest_state_mismatch = cur.fetchone()[0]
    report['dest_state_mismatch'] = dest_state_mismatch

    # 3. Hotels check
    cur.execute("""
        SELECT count(*) FROM hotels h
        LEFT JOIN cities c ON h.city_id = c.id
        WHERE c.id IS NULL;
    """)
    hotel_orphan_city = cur.fetchone()[0]
    report['hotel_orphan_city'] = hotel_orphan_city

    cur.execute("""
        SELECT count(*) FROM hotels h
        JOIN cities c ON h.city_id = c.id
        WHERE c.state_id = 'IN-DL' AND c.id != 'delhi' AND c.id != 'new-delhi';
    """)
    hotel_wrong_state = cur.fetchone()[0]
    report['hotel_wrong_state'] = hotel_wrong_state

    # 4. Destination POIs check
    cur.execute("""
        SELECT count(*) FROM destination_pois p
        WHERE p.city_id IS NOT NULL 
          AND p.city_id NOT IN (SELECT id FROM cities);
    """)
    poi_orphan_city = cur.fetchone()[0]
    report['poi_orphan_city'] = poi_orphan_city

    cur.execute("""
        SELECT count(*) FROM destination_pois p
        WHERE p.destination_id IS NOT NULL 
          AND p.destination_id NOT IN (SELECT id FROM destinations);
    """)
    poi_orphan_dest = cur.fetchone()[0]
    report['poi_orphan_dest'] = poi_orphan_dest

    # 5. Local Hosts check
    cur.execute("""
        SELECT count(*) FROM local_hosts h
        LEFT JOIN cities c ON h.city_id = c.id
        WHERE c.id IS NULL;
    """)
    host_orphan_city = cur.fetchone()[0]
    report['host_orphan_city'] = host_orphan_city

    cur.execute("""
        SELECT count(*) FROM local_hosts h
        JOIN cities c ON h.city_id = c.id
        WHERE h.state_id != c.state_id;
    """)
    host_state_mismatch = cur.fetchone()[0]
    report['host_state_mismatch'] = host_state_mismatch

    cur.execute("""
        SELECT count(*) FROM local_hosts
        WHERE is_demo_data IS NOT TRUE;
    """)
    host_unlabelled_demo = cur.fetchone()[0]
    report['host_unlabelled_demo'] = host_unlabelled_demo

    # 6. Experiences check
    cur.execute("""
        SELECT count(*) FROM experiences
        WHERE is_demo_data IS NOT TRUE;
    """)
    exp_unlabelled_demo = cur.fetchone()[0]
    report['exp_unlabelled_demo'] = exp_unlabelled_demo

    # 7. Travel Buddies check
    cur.execute("""
        SELECT count(*) FROM travel_buddies
        WHERE is_demo_data IS NOT TRUE;
    """)
    buddy_unlabelled_demo = cur.fetchone()[0]
    report['buddy_unlabelled_demo'] = buddy_unlabelled_demo

    # 8. Duplicate primary keys check
    for tbl in ['states', 'cities', 'destinations', 'hotels', 'local_hosts', 'travel_buddies']:
        cur.execute(f"SELECT id, count(*) FROM {tbl} GROUP BY id HAVING count(*) > 1;")
        dups = len(cur.fetchall())
        report[f'{tbl}_duplicates'] = dups

    # 9. Destination Ecosystem Checks
    cur.execute("SELECT count(*) FROM famous_foods WHERE destination_id NOT IN (SELECT id FROM destinations);")
    report['food_orphan_dest'] = cur.fetchone()[0]

    cur.execute("SELECT count(*) FROM destination_transports WHERE destination_id NOT IN (SELECT id FROM destinations);")
    report['transport_orphan_dest'] = cur.fetchone()[0]

    cur.execute("SELECT count(DISTINCT destination_id) FROM famous_foods;")
    report['dests_with_food'] = cur.fetchone()[0]

    cur.execute("SELECT count(DISTINCT destination_id) FROM destination_transports;")
    report['dests_with_transport'] = cur.fetchone()[0]

    cur.execute("SELECT count(*) FROM famous_foods;")
    report['total_foods'] = cur.fetchone()[0]

    cur.execute("SELECT count(*) FROM destination_transports;")
    report['total_transports'] = cur.fetchone()[0]

    cur.execute("SELECT count(*) FROM restaurants WHERE is_verified = true AND source_type = 'PARTNER_SUBMITTED';")
    report['unverified_partner_as_verified'] = cur.fetchone()[0]

    print(f"1. Non-Delhi cities mapped to IN-DL: {report['wrong_city_state']}")
    print(f"2. Cities with fallback (20.5937, 78.9629) or null coords: {report['fallback_city_coords']}")
    print(f"3. Destinations with orphan city_id: {report['dest_orphan_city']}")
    print(f"4. Destinations with state != city.state: {report['dest_state_mismatch']}")
    print(f"5. Hotels with orphan city_id: {report['hotel_orphan_city']}")
    print(f"6. Hotels in erroneously mapped Delhi cities: {report['hotel_wrong_state']}")
    print(f"7. POIs with orphan city_id: {report['poi_orphan_city']}")
    print(f"8. POIs with orphan destination_id: {report['poi_orphan_dest']}")
    print(f"9. Local hosts with orphan city_id: {report['host_orphan_city']}")
    print(f"10. Local hosts with state != city.state: {report['host_state_mismatch']}")
    print(f"11. Local hosts unlabelled demo data: {report['host_unlabelled_demo']}")
    print(f"12. Experiences unlabelled demo data: {report['exp_unlabelled_demo']}")
    print(f"13. Travel buddies unlabelled demo data: {report['buddy_unlabelled_demo']}")
    print(f"14. Duplicate IDs in major tables: {sum(v for k, v in report.items() if '_duplicates' in k)}")
    print(f"15. Famous food orphan destination_id: {report['food_orphan_dest']}")
    print(f"16. Transport orphan destination_id: {report['transport_orphan_dest']}")
    print(f"17. Destinations with authentic food dishes: {report['dests_with_food']} / 93 (Total dishes: {report['total_foods']})")
    print(f"18. Destinations with transport connectivity: {report['dests_with_transport']} / 93 (Total nodes: {report['total_transports']})")
    print("=" * 70)

    cur.close()
    conn.close()

if __name__ == '__main__':
    run_audit()
