package com.yatrasetu.domain;

public enum MealPlan {
    EP("European Plan (Room Only)"),
    CP("Continental Plan (Room + Breakfast)"),
    MAP("Modified American Plan (Room + Breakfast + One Meal)"),
    AP("American Plan (Room + All Meals)");

    private final String displayName;

    MealPlan(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
