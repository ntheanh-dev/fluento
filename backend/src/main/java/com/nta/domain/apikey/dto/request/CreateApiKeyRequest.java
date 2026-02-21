package com.nta.domain.apikey.dto.request;

import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateApiKeyRequest {
    @NotBlank(message = "API key is required")
    private String apiKey;
}
