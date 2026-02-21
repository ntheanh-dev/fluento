package com.nta.domain.apikey;

import lombok.Getter;

@Getter
public enum AiModelName {
    GEMINI_1_5_PRO("gemini-1.5-pro"),
    GEMINI_1_5_FLASH("gemini-1.5-flash"),
    GEMINI_1_0_PRO("gemini-1.0-pro");

    private final String apiValue;

    AiModelName(String apiValue) {
        this.apiValue = apiValue;
    }
}
