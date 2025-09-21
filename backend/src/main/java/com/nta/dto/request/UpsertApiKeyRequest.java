package com.nta.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpsertApiKeyRequest {

    @NotBlank
    private String provider; // e.g., OPENAI (gemini-compatible), or future providers

    @NotBlank
    @Size(max = 512)
    private String apiKey;
}
