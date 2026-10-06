-- ==============================================================================
-- Migration V36: Correct destination_pois relationships
-- Realigns POIs that were mistakenly assigned to Chennai (dest-108) instead of
-- Manali (dest-13), and to Bengaluru (dest-105) instead of Mysore (dest-113).
-- ==============================================================================

-- 1. Realign Manali POIs misassigned to Chennai (dest-108)
UPDATE destination_pois
SET destination_id = 'dest-13', city_id = 'manali', updated_at = NOW()
WHERE id IN (
    'poi-ts-392', 'poi-ts-393', 'poi-ts-396', 'poi-ts-397', 'poi-ts-398',
    'poi-ts-399', 'poi-ts-401', 'poi-ts-402', 'poi-ts-404', 'poi-ts-405',
    'poi-ts-409', 'poi-ts-410'
);

-- 2. Realign Mysore and Srirangapatna POIs misassigned to Bengaluru (dest-105)
UPDATE destination_pois
SET destination_id = 'dest-113', city_id = 'mysore', updated_at = NOW()
WHERE id IN (
    'poi-ts-73', 'poi-ts-74', 'poi-ts-75', 'poi-ts-76', 'poi-ts-77',
    'poi-ts-78', 'poi-ts-79', 'poi-ts-80', 'poi-ts-81', 'poi-ts-82',
    'poi-ts-83', 'poi-ts-84', 'poi-ts-85', 'poi-ts-87', 'poi-ts-88',
    'poi-ts-89', 'poi-ts-90', 'poi-ts-91', 'poi-ts-92', 'poi-ts-93',
    'poi-ts-94', 'poi-ts-98', 'poi-ts-99', 'poi-ts-100', 'poi-ts-101'
);
