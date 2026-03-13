package com.nta.domain.userPractice.enums;

public enum WritingPerformanceRange {
    LAST_7_DAYS,
    LAST_30_DAYS;

    public static WritingPerformanceRange fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("range is required");
        }
        return WritingPerformanceRange.valueOf(value.trim().toUpperCase());
    }
}
