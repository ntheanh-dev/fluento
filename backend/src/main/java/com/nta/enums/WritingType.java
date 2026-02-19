package com.nta.enums;

import java.util.Arrays;

/**
 * Enum representing different types of writing exercises/practices
 */
public enum WritingType {
    /**
     * Basic writing practice - general paragraph writing
     */
    BASIC("BASIC", "Basic Writing Practice"),
    
    /**
     * IELTS Task 1 - Academic writing task (describing charts, graphs, processes)
     */
    IELTS_TASK1("IELTS_TASK1", "IELTS Task 1"),
    
    /**
     * IELTS Task 2 - Academic essay writing (argumentative, opinion, discussion)
     */
    IELTS_TASK2("IELTS_TASK2", "IELTS Task 2"),
    
    /**
     * Email writing practice
     */
    EMAIL("EMAIL", "Email Writing"),
    
    /**
     * AI-generated content based on topic and configuration
     */
    AI_GENERATED("AI_GENERATED", "AI Generated"),
    
    /**
     * User-provided custom text for translation practice
     */
    CUSTOM_TEXT("CUSTOM_TEXT", "Custom Text");

    private final String code;
    private final String displayName;

    WritingType(String code, String displayName) {
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
    public static WritingType fromString(String s) {
        if (s == null || s.isBlank()) return null;
        String normalized = s.trim().toUpperCase().replace("-", "_");
        return Arrays.stream(values())
                .filter(wt -> wt.name().equals(normalized) || wt.code.equals(normalized))
                .findFirst()
                .orElse(null);
    }
}
