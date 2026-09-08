package com.yatrasetu.domain;

/**
 * Data provenance source type across the YatraSetu platform.
 * Strictly adheres to the source hierarchy:
 * DATASET -> OFFICIAL -> API -> PARTNER_SUBMITTED -> USER_GENERATED -> DEMO
 */
public enum SourceType {
    DATASET,
    OFFICIAL,
    API,
    PARTNER_SUBMITTED,
    USER_GENERATED,
    DEMO
}
