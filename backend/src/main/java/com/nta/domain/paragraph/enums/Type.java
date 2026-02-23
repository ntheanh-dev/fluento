package com.nta.domain.paragraph.enums;

import java.util.Arrays;

/**
 * Enum representing different types of writing exercises/practices
 */
public enum Type {
    BASIC("BASIC", "Basic Writing Practice"),
    IELTS_TASK1("IELTS_TASK1", "IELTS Task 1"),
    IELTS_TASK2("IELTS_TASK2", "IELTS Task 2"),
    EMAIL("EMAIL", "Email Writing"),
    CUSTOM_TEXT("CUSTOM_TEXT", "Custom Text");

    private final String code;
    private final String displayName;

    Type(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Parse from request string (e.g. "basic", "ielts_task1") to enum.
     */
    public static Type fromString(String s) {
        if (s == null || s.isBlank()) return null;
        String normalized = s.trim().toUpperCase().replace("-", "_");
        return Arrays.stream(values())
                .filter(wt -> wt.name().equals(normalized) || wt.code.equals(normalized))
                .findFirst()
                .orElse(null);
    }
}
