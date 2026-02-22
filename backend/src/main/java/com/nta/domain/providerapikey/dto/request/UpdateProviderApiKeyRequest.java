package com.nta.domain.providerapikey.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProviderApiKeyRequest {
    @Schema(description = "New API key value (optional)", example = "sk-...")
    private String apiKey;
}
