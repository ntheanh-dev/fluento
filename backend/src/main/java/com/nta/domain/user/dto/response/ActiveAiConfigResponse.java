package com.nta.domain.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActiveAiConfigResponse {
    /** ID của row api_keys đang dùng (một row = key + model). */
    private Long activeApiKeyId;
    /** Model ID string for API calls (e.g. gemini-1.5-pro). */
    private String modelId;
    /** API key (decrypted) for use. */
    private String apiKey;
}
