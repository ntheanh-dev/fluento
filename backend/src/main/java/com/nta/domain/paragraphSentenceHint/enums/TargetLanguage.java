package com.nta.domain.paragraphSentenceHint.enums;

public enum TargetLanguage {
    EN,
    ZH,
    KO;

    public static TargetLanguage fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return TargetLanguage.valueOf(value.trim().toUpperCase());
    }
}
