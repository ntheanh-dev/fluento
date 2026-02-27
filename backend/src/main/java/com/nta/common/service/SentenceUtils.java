package com.nta.common.service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public final class SentenceUtils {

    private SentenceUtils() {
        // prevent instantiation
    }

    /**
     * Split paragraph into sentences.
     * Supports ., ?, ! endings.
     */
    public static List<String> splitSentences(String paragraphContent) {

        if (paragraphContent == null || paragraphContent.isBlank()) {
            return List.of();
        }

        return Arrays.stream(paragraphContent.trim().split("(?<=[.!?])\\s+"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}
