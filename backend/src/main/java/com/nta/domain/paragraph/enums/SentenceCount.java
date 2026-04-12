package com.nta.domain.paragraph.enums;

import java.util.Arrays;

public enum SentenceCount {
    TEN(10),
    FIFTEEN(15),
    TWENTY(20),
    MAX(30);

    private final int size;

    SentenceCount(int size) {
        this.size = size;
    }

    public int getSize() {
        return size;
    }

    public static SentenceCount fromSize(int size) {
        return Arrays.stream(values()).filter(sc -> sc.size == size).findFirst().orElse(null);
    }

    public static SentenceCount fromString(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return valueOf(s.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
