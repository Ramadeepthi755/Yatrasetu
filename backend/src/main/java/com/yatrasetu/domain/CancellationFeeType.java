package com.yatrasetu.domain;

public enum CancellationFeeType {
    NONE("No Fee"),
    PERCENTAGE("Percentage Fee"),
    FIXED_AMOUNT("Fixed Amount"),
    FIRST_NIGHT("First Night Charge");

    private final String displayName;

    CancellationFeeType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
