package com.yatrasetu.domain;

public final class ProvenanceUtil {

    private ProvenanceUtil() {}

    public static String getLabel(SourceType sourceType, Boolean isVerified) {
        if (sourceType == null) {
            return "Dataset";
        }
        return switch (sourceType) {
            case DATASET -> "Dataset";
            case OFFICIAL -> "Official";
            case API -> "Live API";
            case PARTNER_SUBMITTED -> Boolean.TRUE.equals(isVerified) ? "Verified Partner" : "Partner Listing";
            case USER_GENERATED -> "Traveler Submitted";
            case DEMO -> "Demo";
        };
    }
}
