package com.yatrasetu.domain;

/**
 * Status representation for date-specific hotel availability.
 * - AVAILABLE: Room type has available units (> 2) for the requested stay period.
 * - LIMITED: Room type has 1 or 2 available units remaining for the requested stay period.
 * - SOLD_OUT: Stored inventory exists, but 0 units are available across one or more requested nights.
 * - UNAVAILABLE_DATA: Property is dataset-only, unverified, or has no legitimate inventory maintained.
 */
public enum HotelAvailabilityStatus {
    AVAILABLE,
    LIMITED,
    SOLD_OUT,
    UNAVAILABLE_DATA
}
