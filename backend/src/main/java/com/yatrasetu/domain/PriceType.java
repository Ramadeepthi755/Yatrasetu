package com.yatrasetu.domain;

/**
 * Transport and operational pricing disclosure level.
 * Prevents synthetic/fabricated live fares by explicitly disclosing uncertainty.
 */
public enum PriceType {
    PRICE_UNAVAILABLE,
    ESTIMATED_PRICE,
    EXACT_FARE
}
