package com.nta.domain.apikey;

import lombok.Getter;

@Getter
public enum AiModelName {
    GEMINI_2_5_FLASH("gemini-2.5-flash"),
    GEMINI_2_5_FLASH_LITE("gemini-2.5-flash-lite"),
    GEMINI_2_5_PRO("gemini-2.5-pro");

    private final String apiValue;

    AiModelName(String apiValue) {
        this.apiValue = apiValue;
    }
}
