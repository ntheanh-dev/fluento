package com.nta.domain.deck.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.nta.domain.paragraphSentenceHint.enums.TargetLanguage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDeckRequest {
    @NotBlank(message = "Deck name is required")
    @Size(max = 150, message = "Deck name must not exceed 150 characters")
    private String name;

    @Size(max = 64, message = "Icon key must not exceed 64 characters")
    private String icon;

    @NotNull(message = "Target language is required")
    private TargetLanguage targetLanguage;
}
