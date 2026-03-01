package com.nta.common.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class SentenceUtils {

    private SentenceUtils() {
        // prevent instantiation
    }

    /**
     * Split paragraph into sentences.
     * Supports ., ?, ! endings.
     */
    private static final Pattern SENTENCE_PATTERN =
            Pattern.compile(".*?(?:[.!?](?:\\n+|\\s+)|,(?:\\n+)|$)", Pattern.DOTALL);

    public static List<String> splitSentences(String text) {
        if (text == null || text.isEmpty()) {
            return Collections.emptyList();
        }

        // Normalize CRLF -> LF
        String normalized = text.replace("\r\n", "\n");

        Matcher matcher = SENTENCE_PATTERN.matcher(normalized);
        List<String> result = new ArrayList<String>();

        while (matcher.find()) {
            String sentence = matcher.group().trim();
            if (!sentence.isEmpty()) {
                result.add(sentence);
            }
        }

        return result;
    }
}
