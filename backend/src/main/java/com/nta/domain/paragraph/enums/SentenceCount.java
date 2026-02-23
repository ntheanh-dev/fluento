package com.nta.domain.paragraph.enums;

import java.util.Arrays;

public enum SentenceCount {
    FIVE(5),
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
}
