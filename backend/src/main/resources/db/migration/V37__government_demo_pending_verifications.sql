-- Seed/update demo hotel and experience verification status to PENDING_REVIEW for SIH presentation verification queues

UPDATE hotels
SET verification_status = 'PENDING_REVIEW'
WHERE id IN ('hotel-331', 'hotel-332');

UPDATE experiences
SET verification_status = 'PENDING_REVIEW'
WHERE id IN ('exp-45', 'exp-46');
