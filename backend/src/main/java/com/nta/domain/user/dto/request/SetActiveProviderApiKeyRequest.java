package com.nta.domain.user.dto.request;

import jakarta.validation.constraints.NotNull;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SetActiveProviderApiKeyRequest {
    @NotNull
    @Schema(description = "Provider API key ID to use", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long providerApiKeyId;
}
