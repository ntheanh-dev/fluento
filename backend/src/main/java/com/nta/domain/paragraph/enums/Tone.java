package com.nta.domain.paragraph.enums;

public enum Tone {
    FORMAL,
    FRIENDLY,
    PROFESSIONAL;

    public static Tone fromString(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return valueOf(s.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
