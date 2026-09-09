-- V34__sih_grand_finale_demo_accounts_and_notifications.sql
-- SIH Grand Finale Real Demo Accounts & Multi-Tenant Notification Mappings

-- 1. Ensure Public Users for all 4 SIH Demo Identities
INSERT INTO users (id, auth_user_id, email, full_name, role, partner_subtype, is_verified, verification_status, is_active, created_at, updated_at)
VALUES 
  ('usr-sih-tourist', 'a0000000-0000-0000-0000-000000000001', 'tourist@yatrasetu.demo', 'SIH Demo Tourist', 'TRAVELER', NULL, TRUE, 'VERIFIED', TRUE, NOW(), NOW()),
  ('usr-sih-guide-ravi', 'a0000000-0000-0000-0000-000000000002', 'ravi.guide@yatrasetu.demo', 'Ravi Kumar', 'PARTNER', 'GUIDE', TRUE, 'VERIFIED', TRUE, NOW(), NOW()),
  ('usr-sih-host-lakshmi', 'a0000000-0000-0000-0000-000000000003', 'lakshmi.host@yatrasetu.demo', 'Smt. Lakshmi Prasanna', 'PARTNER', 'ARTISAN', TRUE, 'VERIFIED', TRUE, NOW(), NOW()),
  ('usr-partner-hotel-tpt', 'a0000000-0000-0000-0000-000000000004', 'tirupati.hotel@yatrasetu.demo', 'Srinivasa Rao', 'PARTNER', 'HOTEL', TRUE, 'VERIFIED', TRUE, NOW(), NOW())
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

-- 2. Link Tirupati Local Hosts to Authentic Partner User Accounts
-- Link Ravi Kumar (host-5) to usr-sih-guide-ravi
UPDATE local_hosts 
SET 
  user_id = 'usr-sih-guide-ravi',
  name = 'Ravi Kumar',
  destination_id = 'dest-136',
  role_title = 'Heritage & Temple Guide',
  is_verified = TRUE,
  is_demo_data = FALSE,
  updated_at = NOW()
WHERE id = 'host-5';

-- Link Smt. Lakshmi Prasanna (host-45) to usr-sih-host-lakshmi
UPDATE local_hosts 
SET 
  user_id = 'usr-sih-host-lakshmi',
  name = 'Smt. Lakshmi Prasanna',
  destination_id = 'dest-136',
  role_title = 'Kalamkari Artisan & Temple Craft Weaver',
  is_verified = TRUE,
  is_demo_data = FALSE,
  updated_at = NOW()
WHERE id = 'host-45';

-- 3. Link Tirupati Hotels to Hotel Partner User Account (usr-partner-hotel-tpt)
UPDATE hotels 
SET 
  owner_id = 'usr-partner-hotel-tpt',
  is_partner_property = TRUE,
  verification_status = 'VERIFIED',
  updated_at = NOW()
WHERE destination_id = 'dest-136' OR id IN ('htl-tpt-1', 'htl-tpt-2', 'htl-tpt-3');

-- 4. Ensure Tirupati Experience & Supporting Provider Collaboration are tightly connected
-- Experience 1: Ravi Kumar's Tirupati Heritage Walk
INSERT INTO experiences (
    id, host_id, destination_id, city_id, title, description, category,
    duration_hours, price_per_person, max_group_size, included_items, requirements,
    languages, cover_image_url, is_approved, is_active, is_demo_data, status, verification_status, created_at, updated_at
) VALUES 
(
    'exp-tirupati-temple-walk',
    'host-5',
    'dest-136',
    'tirupati',
    'Tirupati Seshachalam Foothills & Ancient Temple Heritage Walk',
    'Immerse in the devotional heritage of Tirupati at the base of the Seshachalam hills. Visit the ancient Sri Kapila Theertham temple, listen to historical narratives of the Pallava and Vijayanagara royal patrons, and discover sacred temple art traditions.',
    'Heritage & Temple Tour',
    3.5,
    1800.00,
    8,
    '{"Monuments Entry Assistance","Special Laddu Prasadam Token","Heritage Audio Receiver Guide","Chilled Mineral Water Bottle"}',
    'Modest traditional attire required for temple premises; comfortable walking footwear.',
    '{"Telugu","Hindi","English","Tamil"}',
    'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    TRUE, TRUE, FALSE, 'APPROVED', 'VERIFIED', NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET 
    host_id = EXCLUDED.host_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    duration_hours = EXCLUDED.duration_hours,
    price_per_person = EXCLUDED.price_per_person,
    is_approved = TRUE,
    is_active = TRUE,
    status = 'APPROVED',
    verification_status = 'VERIFIED';

-- Supporting Provider: Smt. Lakshmi Prasanna for Kalamkari Art segment
INSERT INTO experience_supporting_providers (
    id, experience_id, provider_id, provider_name, provider_type, role_description, status, notes, created_at, updated_at
) VALUES 
(
    'supp-tirupati-kalamkari-host',
    'exp-tirupati-temple-walk',
    'host-45',
    'Smt. Lakshmi Prasanna',
    'ARTISAN',
    'Traditional Kalamkari Temple Craft & Sacred Art Demonstration Host',
    'ACCEPTED',
    'Hosts a 30-minute temple art and sacred textile storytelling segment during the heritage walk.',
    NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET 
    experience_id = EXCLUDED.experience_id,
    provider_id = EXCLUDED.provider_id,
    provider_name = EXCLUDED.provider_name,
    provider_type = EXCLUDED.provider_type,
    role_description = EXCLUDED.role_description,
    status = 'ACCEPTED';

-- 5. Supabase Auth Users & Identities Provisioning (Executed via Postgres pgcrypto)
-- Provision Tourist
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'authenticated',
    'authenticated',
    'tourist@yatrasetu.demo',
    crypt('Tourist@SIH2026', gen_salt('bf', 10)),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"SIH Demo Tourist","role":"TRAVELER"}'::jsonb,
    NOW(),
    NOW(),
    FALSE
) ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    encrypted_password = crypt('Tourist@SIH2026', gen_salt('bf', 10)),
    email_confirmed_at = NOW(),
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = NOW();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    jsonb_build_object('sub', 'a0000000-0000-0000-0000-000000000001', 'email', 'tourist@yatrasetu.demo'),
    'email',
    'a0000000-0000-0000-0000-000000000001',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (provider, provider_id) DO UPDATE SET 
    identity_data = EXCLUDED.identity_data,
    updated_at = NOW();

-- Provision Guide: Ravi Kumar
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000002'::uuid,
    'authenticated',
    'authenticated',
    'ravi.guide@yatrasetu.demo',
    crypt('RaviGuide@SIH2026', gen_salt('bf', 10)),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Ravi Kumar","role":"PARTNER","partnerSubtype":"GUIDE"}'::jsonb,
    NOW(),
    NOW(),
    FALSE
) ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    encrypted_password = crypt('RaviGuide@SIH2026', gen_salt('bf', 10)),
    email_confirmed_at = NOW(),
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = NOW();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    'a0000000-0000-0000-0000-000000000002'::uuid,
    'a0000000-0000-0000-0000-000000000002'::uuid,
    jsonb_build_object('sub', 'a0000000-0000-0000-0000-000000000002', 'email', 'ravi.guide@yatrasetu.demo'),
    'email',
    'a0000000-0000-0000-0000-000000000002',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (provider, provider_id) DO UPDATE SET 
    identity_data = EXCLUDED.identity_data,
    updated_at = NOW();

-- Provision Culture Host: Smt. Lakshmi Prasanna
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000003'::uuid,
    'authenticated',
    'authenticated',
    'lakshmi.host@yatrasetu.demo',
    crypt('LakshmiHost@SIH2026', gen_salt('bf', 10)),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Smt. Lakshmi Prasanna","role":"PARTNER","partnerSubtype":"ARTISAN"}'::jsonb,
    NOW(),
    NOW(),
    FALSE
) ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    encrypted_password = crypt('LakshmiHost@SIH2026', gen_salt('bf', 10)),
    email_confirmed_at = NOW(),
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = NOW();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    'a0000000-0000-0000-0000-000000000003'::uuid,
    'a0000000-0000-0000-0000-000000000003'::uuid,
    jsonb_build_object('sub', 'a0000000-0000-0000-0000-000000000003', 'email', 'lakshmi.host@yatrasetu.demo'),
    'email',
    'a0000000-0000-0000-0000-000000000003',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (provider, provider_id) DO UPDATE SET 
    identity_data = EXCLUDED.identity_data,
    updated_at = NOW();

-- Provision Hotel Provider: Srinivasa Rao (Tirupati Grand Residency)
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000004'::uuid,
    'authenticated',
    'authenticated',
    'tirupati.hotel@yatrasetu.demo',
    crypt('TirupatiHotel@SIH2026', gen_salt('bf', 10)),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Srinivasa Rao","role":"PARTNER","partnerSubtype":"HOTEL"}'::jsonb,
    NOW(),
    NOW(),
    FALSE
) ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    encrypted_password = crypt('TirupatiHotel@SIH2026', gen_salt('bf', 10)),
    email_confirmed_at = NOW(),
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = NOW();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    'a0000000-0000-0000-0000-000000000004'::uuid,
    'a0000000-0000-0000-0000-000000000004'::uuid,
    jsonb_build_object('sub', 'a0000000-0000-0000-0000-000000000004', 'email', 'tirupati.hotel@yatrasetu.demo'),
    'email',
    'a0000000-0000-0000-0000-000000000004',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (provider, provider_id) DO UPDATE SET 
    identity_data = EXCLUDED.identity_data,
    updated_at = NOW();
