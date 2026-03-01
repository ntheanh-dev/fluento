package com.nta.domain.userPractice.dto.request;

import jakarta.validation.constraints.*;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request to translate a sentence")
public class SentenceTranslationRequest {

    @Schema(description = "Translated sentence", example = "Hello", defaultValue = "")
    @NotBlank(message = "Translated sentence must not be blank")
    @Size(max = 1000, message = "Translated sentence must not exceed 1000 characters")
    private String translatedSentence;

    @Schema(description = "Order index of sentence", example = "1", defaultValue = "0")
    @NotNull(message = "Order index is required")
    @Min(value = 0, message = "Order index must be >= 0")
    @Max(value = 30, message = "Order index must be <= 30")
    private Integer orderIndex;
}
