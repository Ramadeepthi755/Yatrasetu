package com.yatrasetu.domain;

public enum CancellationPolicyType {
    FREE_CANCELLATION("Free Cancellation"),
    NON_REFUNDABLE("Non-Refundable"),
    PARTIAL_REFUND("Partial Refund"),
    CUSTOM("Custom Policy");

    private final String displayName;

    CancellationPolicyType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
