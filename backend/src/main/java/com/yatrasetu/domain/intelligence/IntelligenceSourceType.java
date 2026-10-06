package com.yatrasetu.domain.intelligence;

/**
 * Strict provenance classification for all Government Tourism Intelligence metrics.
 *
 * OBSERVED:  Actual YatraSetu platform activity (trips planned, saved, reviews, etc.)
 * DERIVED:   Algorithmic calculation from verified platform data (Health Score, Demand Score)
 * ESTIMATED: Deterministic model/baseline estimate (Baseline 7D/30D/90D forecasts)
 * DEMO:      Explicitly synthetic demonstration data for evaluation/SIH showcase
 * OFFICIAL:  Genuinely sourced external official government/census statistics
 */
public enum IntelligenceSourceType {
    OBSERVED,
    DERIVED,
    ESTIMATED,
    DEMO,
    OFFICIAL;

    public String getDisplayLabel() {
        return switch (this) {
            case OBSERVED -> "Observed Platform Activity";
            case DERIVED -> "Derived YatraSetu Intelligence";
            case ESTIMATED -> "Transparent Baseline Estimate";
            case DEMO -> "Demonstration Mode";
            case OFFICIAL -> "Official Benchmark Data";
        };
    }
}
