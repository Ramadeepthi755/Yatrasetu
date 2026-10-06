#!/usr/bin/env python3
"""
Server-side idempotent provisioning script for YatraSetu SIH Demo Identities.
Uses direct database connection to provision both public schema records and auth.users / auth.identities.
"""

import os
import sys
import psycopg2

DB_URL = os.environ.get(
    "SPRING_DATASOURCE_URL",
    "postgresql://postgres:B3sUYPMVMKnQLmFK@db.ngbmkquftbcpvbchuhew.supabase.co:5432/postgres?sslmode=require"
).replace("jdbc:postgresql://", "postgresql://")

ACCOUNTS = [
    {
        "role_type": "TRAVELER",
        "email": "tourist@yatrasetu.demo",
        "name": "SIH Demo Tourist",
        "password": "Tourist@SIH2026",
        "user_id": "usr-sih-tourist",
        "auth_id": "a0000000-0000-0000-0000-000000000001",
        "role": "TRAVELER",
        "partner_subtype": None,
    },
    {
        "role_type": "GUIDE",
        "email": "ravi.guide@yatrasetu.demo",
        "name": "Ravi Kumar",
        "password": "RaviGuide@SIH2026",
        "user_id": "usr-sih-guide-ravi",
        "auth_id": "a0000000-0000-0000-0000-000000000002",
        "role": "PARTNER",
        "partner_subtype": "GUIDE",
        "host_id": "host-5"
    },
    {
        "role_type": "CULTURE_HOST",
        "email": "lakshmi.host@yatrasetu.demo",
        "name": "Smt. Lakshmi Prasanna",
        "password": "LakshmiHost@SIH2026",
        "user_id": "usr-sih-host-lakshmi",
        "auth_id": "a0000000-0000-0000-0000-000000000003",
        "role": "PARTNER",
        "partner_subtype": "ARTISAN",
        "host_id": "host-45"
    },
    {
        "role_type": "HOTEL_PROVIDER",
        "email": "tirupati.hotel@yatrasetu.demo",
        "name": "Srinivasa Rao",
        "password": "TirupatiHotel@SIH2026",
        "user_id": "usr-partner-hotel-tpt",
        "auth_id": "a0000000-0000-0000-0000-000000000004",
        "role": "PARTNER",
        "partner_subtype": "HOTEL",
        "hotel_id": "htl-tpt-1"
    }
]

def provision():
    print(f"Connecting to database...")
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cur = conn.cursor()

    print("Provisioning SIH Grand Finale Demo Accounts...")
    for acc in ACCOUNTS:
        email = acc["email"]
        name = acc["name"]
        pwd = acc["password"]
        user_id = acc["user_id"]
        auth_id = acc["auth_id"]
        role = acc["role"]
        subtype = acc.get("partner_subtype")

        # 1. Upsert public.users
        cur.execute("""
            INSERT INTO users (id, auth_user_id, email, full_name, role, partner_subtype, is_verified, verification_status, is_active, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, TRUE, 'VERIFIED', TRUE, NOW(), NOW())
            ON CONFLICT (id) DO UPDATE SET 
              email = EXCLUDED.email,
              full_name = EXCLUDED.full_name,
              role = EXCLUDED.role,
              partner_subtype = EXCLUDED.partner_subtype,
              auth_user_id = EXCLUDED.auth_user_id,
              is_verified = TRUE,
              verification_status = 'VERIFIED',
              is_active = TRUE,
              updated_at = NOW();
        """, (user_id, auth_id, email, name, role, subtype))
        print(f"  [Users] Upserted {email} -> {user_id}")

        # 2. Upsert auth.users
        cur.execute("""
            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                %s::uuid,
                'authenticated',
                'authenticated',
                %s,
                crypt(%s, gen_salt('bf', 10)),
                NOW(),
                '{"provider":"email","providers":["email"]}'::jsonb,
                jsonb_build_object('full_name', %s, 'role', %s, 'partnerSubtype', %s),
                NOW(),
                NOW(),
                FALSE
            ) ON CONFLICT (id) DO UPDATE SET 
                email = EXCLUDED.email,
                encrypted_password = crypt(%s, gen_salt('bf', 10)),
                email_confirmed_at = NOW(),
                raw_user_meta_data = jsonb_build_object('full_name', %s, 'role', %s, 'partnerSubtype', %s),
                updated_at = NOW();
        """, (auth_id, email, pwd, name, role, subtype, pwd, name, role, subtype))

        # 3. Upsert auth.identities
        cur.execute("""
            INSERT INTO auth.identities (
                id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
            ) VALUES (
                %s::uuid,
                %s::uuid,
                jsonb_build_object('sub', %s, 'email', %s),
                'email',
                %s,
                NOW(),
                NOW(),
                NOW()
            ) ON CONFLICT (provider, provider_id) DO UPDATE SET 
                identity_data = EXCLUDED.identity_data,
                updated_at = NOW();
        """, (auth_id, auth_id, auth_id, email, auth_id))
        print(f"  [Supabase Auth] Provisioned {email} (ID: {auth_id})")

    # Link Local Hosts
    cur.execute("UPDATE local_hosts SET user_id = 'usr-sih-guide-ravi', is_verified = TRUE, is_demo_data = FALSE WHERE id = 'host-5';")
    cur.execute("UPDATE local_hosts SET user_id = 'usr-sih-host-lakshmi', is_verified = TRUE, is_demo_data = FALSE WHERE id = 'host-45';")
    print("  [Local Hosts] Linked host-5 -> Ravi Kumar, host-45 -> Lakshmi Prasanna")

    # Link Hotels
    cur.execute("UPDATE hotels SET owner_id = 'usr-partner-hotel-tpt', is_partner_property = TRUE, verification_status = 'VERIFIED' WHERE destination_id = 'dest-136' OR id IN ('htl-tpt-1', 'htl-tpt-2', 'htl-tpt-3');")
    print("  [Hotels] Linked Tirupati partner stays -> usr-partner-hotel-tpt")

    # Update Experiences
    cur.execute("""
        UPDATE experiences 
        SET host_id = 'host-5', title = 'Tirupati Seshachalam Foothills & Ancient Temple Heritage Walk', is_approved = TRUE, is_active = TRUE, status = 'APPROVED', verification_status = 'VERIFIED'
        WHERE id = 'exp-tirupati-temple-walk';
    """)
    cur.execute("""
        UPDATE experience_supporting_providers 
        SET provider_id = 'host-45', provider_name = 'Smt. Lakshmi Prasanna', provider_type = 'ARTISAN', status = 'ACCEPTED'
        WHERE id = 'supp-tirupati-kalamkari-host';
    """)
    print("  [Experiences] Connected Tirupati Heritage Walk & Lakshmi Supporting Provider")

    conn.close()
    print("\nAll SIH demo identities successfully provisioned and verified.")

if __name__ == "__main__":
    provision()
