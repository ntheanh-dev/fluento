package com.nta.common.enums;

public enum Tone {
    FORMAL,
    INFORMAL,
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
