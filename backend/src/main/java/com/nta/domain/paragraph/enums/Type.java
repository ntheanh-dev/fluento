package com.nta.domain.paragraph.enums;

import java.util.Arrays;

public enum Type {
    BASIC("WRITING_BASIC", "Basic Writing Practice"),
    IELTS_TASK1("IELTS_TASK1", "IELTS Writing Task 1"),
    IELTS_TASK2("IELTS_TASK2", "IELTS Writing Task 2"),
    EMAIL("EMAIL", "Email Writing"),
    STORY("STORY", "Story Writing"),
    CUSTOM_TEXT("CUSTOM_TEXT", "Custom Writing Text");

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
     * Parse from request string (e.g. "ielts_task1", "speaking-part2")
     */
    public static Type fromString(String s) {
        if (s == null || s.isBlank()) return null;
        String normalized = s.trim().toUpperCase().replace("-", "_");
        return Arrays.stream(values())
                .filter(tt -> tt.name().equals(normalized) || tt.code.equals(normalized))
                .findFirst()
                .orElse(null);
    }
}
