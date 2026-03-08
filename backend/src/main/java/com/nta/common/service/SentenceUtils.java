package com.nta.common.service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class SentenceUtils {

    private SentenceUtils() {
        // prevent instantiation
    }

    public static List<String> splitSentences(String text) {
        if (text == null || text.isEmpty()) {
            return List.of();
        }

        String normalized = text.replace("\r\n", "\n");

        String regex = ".*?(?:[.!?](?:\\n+|\\s+)|,(?:\\n+)|$)";
        Pattern pattern = Pattern.compile(regex, Pattern.DOTALL);

        Matcher matcher = pattern.matcher(normalized);
        List<String> result = new ArrayList<>();

        while (matcher.find()) {
            String s = matcher.group();
            s = s.replaceAll("^[ ]+|[ ]+$", "");

            if (!s.isEmpty()) {
                result.add(s);
            }
        }

        return result;
    }
}
