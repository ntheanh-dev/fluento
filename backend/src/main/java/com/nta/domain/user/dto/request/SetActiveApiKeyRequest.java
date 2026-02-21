package com.nta.domain.user.dto.request;

import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SetActiveApiKeyRequest {
    @NotNull(message = "apiKeyId is required")
    /** ID của row trong bảng api_keys (một row = key + model). */
    private Long apiKeyId;
}
