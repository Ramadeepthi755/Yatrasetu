#!/usr/bin/env python3
import psycopg2
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from verify_supabase_db import get_db_params

# Accurate reference mappings for Indian cities
CITY_CORRECTIONS = {
    # city_id: (city_name, district_name, state_id, latitude, longitude)
    'hyderabad': ('Hyderabad', 'Hyderabad', 'IN-TG', 17.3850, 78.4867),
    'delhi': ('Delhi', 'Central Delhi', 'IN-DL', 28.6139, 77.2090),
    'new-delhi': ('New Delhi', 'New Delhi', 'IN-DL', 28.6139, 77.2090),
    'mumbai': ('Mumbai', 'Mumbai City', 'IN-MH', 19.0760, 72.8777),
    'bangalore': ('Bangalore', 'Bengaluru Urban', 'IN-KA', 12.9716, 77.5946),
    'bengaluru': ('Bengaluru', 'Bengaluru Urban', 'IN-KA', 12.9716, 77.5946),
    'chennai': ('Chennai', 'Chennai', 'IN-TN', 13.0827, 80.2707),
    'kolkata': ('Kolkata', 'Kolkata', 'IN-WB', 22.5726, 88.3639),
    'pune': ('Pune', 'Pune', 'IN-MH', 18.5204, 73.8567),
    'ahmedabad': ('Ahmedabad', 'Ahmedabad', 'IN-GJ', 23.0225, 72.5714),
    'kochi': ('Kochi', 'Ernakulam', 'IN-KL', 9.9312, 76.2673),
    'panaji': ('Panaji', 'North Goa', 'IN-GA', 15.4909, 73.8278),
    'goa': ('Goa', 'North Goa', 'IN-GA', 15.2993, 74.1240),
    'rishikesh': ('Rishikesh', 'Dehradun', 'IN-UT', 30.0869, 78.2676),
    'hampi': ('Hampi', 'Vijayanagara', 'IN-KA', 15.3350, 76.4600),
    'allahabad': ('Allahabad', 'Prayagraj', 'IN-UP', 25.4358, 81.8463),
    'amravati': ('Amravati', 'Amravati', 'IN-MH', 20.9374, 77.7796),
    'aurangabad': ('Aurangabad', 'Aurangabad', 'IN-MH', 19.8762, 75.3433),
    'bhubaneswar': ('Bhubaneswar', 'Khordha', 'IN-OD', 20.2961, 85.8245),
    'chandigarh': ('Chandigarh', 'Chandigarh', 'IN-CH', 30.7333, 76.7794),
    'coimbatore': ('Coimbatore', 'Coimbatore', 'IN-TN', 11.0168, 76.9558),
    'durgapur': ('Durgapur', 'Paschim Bardhaman', 'IN-WB', 23.5204, 87.3119),
    'faridabad': ('Faridabad', 'Faridabad', 'IN-HR', 28.4089, 77.3178),
    'gandhinagar': ('Gandhinagar', 'Gandhinagar', 'IN-GJ', 23.2156, 72.6369),
    'ghaziabad': ('Ghaziabad', 'Ghaziabad', 'IN-UP', 28.6692, 77.4538),
    'guwahati': ('Guwahati', 'Kamrup Metropolitan', 'IN-AS', 26.1445, 91.7362),
    'gwalior': ('Gwalior', 'Gwalior', 'IN-MP', 26.2183, 78.1828),
    'hazaribagh': ('Hazaribagh', 'Hazaribagh', 'IN-JH', 23.9961, 85.3670),
    'indore': ('Indore', 'Indore', 'IN-MP', 22.7196, 75.8577),
    'jamshedpur': ('Jamshedpur', 'East Singhbhum', 'IN-JH', 22.8046, 86.2029),
    'jodhpur': ('Jodhpur', 'Jodhpur', 'IN-RJ', 26.2389, 73.0243),
    'kanpur': ('Kanpur', 'Kanpur Nagar', 'IN-UP', 26.4499, 80.3319),
    'kashmir': ('Kashmir', 'Srinagar', 'IN-JK', 34.0837, 74.7973),
    'kumarakom': ('Kumarakom', 'Kottayam', 'IN-KL', 9.6175, 76.4301),
    'lucknow': ('Lucknow', 'Lucknow', 'IN-UP', 26.8467, 80.9462),
    'ludhiana': ('Ludhiana', 'Ludhiana', 'IN-PB', 30.9010, 75.8573),
    'madurai': ('Madurai', 'Madurai', 'IN-TN', 9.9252, 78.1198),
    'manali': ('Manali', 'Kullu', 'IN-HP', 32.2432, 77.1892),
    'mangalore': ('Mangalore', 'Dakshina Kannada', 'IN-KA', 12.9141, 74.8560),
    'mangaluru': ('Mangaluru', 'Dakshina Kannada', 'IN-KA', 12.9141, 74.8560),
    'meerut': ('Meerut', 'Meerut', 'IN-UP', 28.9845, 77.7064),
    'munnar': ('Munnar', 'Idukki', 'IN-KL', 10.0889, 77.0595),
    'mysore': ('Mysore', 'Mysuru', 'IN-KA', 12.2958, 76.6394),
    'mysuru': ('Mysuru', 'Mysuru', 'IN-KA', 12.2958, 76.6394),
    'nagpur': ('Nagpur', 'Nagpur', 'IN-MH', 21.1458, 79.0882),
    'nashik': ('Nashik', 'Nashik', 'IN-MH', 19.9975, 73.7898),
    'noida': ('Noida', 'Gautam Buddha Nagar', 'IN-UP', 28.5355, 77.3910),
    'ooty': ('Ooty', 'Nilgiris', 'IN-TN', 11.4102, 76.6950),
    'patna': ('Patna', 'Patna', 'IN-BR', 25.5941, 85.1376),
    'pondicherry': ('Pondicherry', 'Puducherry', 'IN-PY', 11.9416, 79.8083),
    'raipur': ('Raipur', 'Raipur', 'IN-MP', 21.2514, 81.6296),
    'ranchi': ('Ranchi', 'Ranchi', 'IN-JH', 23.3441, 85.3096),
    'sikkim': ('Sikkim', 'East Sikkim', 'IN-SK', 27.3389, 88.6065),
    'srinagar': ('Srinagar', 'Srinagar', 'IN-JK', 34.0837, 74.7973),
    'tirupati': ('Tirupati', 'Tirupati', 'IN-AP', 13.6288, 79.4192),
    'trivandrum': ('Trivandrum', 'Thiruvananthapuram', 'IN-KL', 8.5241, 76.9366),
    'vadodara': ('Vadodara', 'Vadodara', 'IN-GJ', 22.3072, 73.1812),
    'varkala': ('Varkala', 'Thiruvananthapuram', 'IN-KL', 8.7379, 76.7163),
    'vijayawada': ('Vijayawada', 'NTR', 'IN-AP', 16.5062, 80.6480),
    'visakhapatnam': ('Visakhapatnam', 'Visakhapatnam', 'IN-AP', 17.6868, 83.2185),
    'warangal': ('Warangal', 'Hanamkonda', 'IN-TG', 17.9689, 79.5941),
}

def check_all_61():
    host, port, dbname, user, password, err = get_db_params()
    conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password, sslmode='require')
    cur = conn.cursor()

    cur.execute("""
        SELECT c.id
        FROM cities c
        WHERE c.state_id = 'IN-DL' AND c.id NOT IN ('delhi', 'new-delhi')
           OR (abs(c.latitude - 20.5937) < 0.001 AND abs(c.longitude - 78.9629) < 0.001);
    """)
    db_affected = {r[0] for r in cur.fetchall()}
    cur.close()
    conn.close()

    missing = db_affected - set(CITY_CORRECTIONS.keys())
    print(f"Db affected cities count: {len(db_affected)}")
    print(f"Correction dict count: {len(CITY_CORRECTIONS)}")
    print(f"Uncovered cities: {missing}")

if __name__ == '__main__':
    check_all_61()
