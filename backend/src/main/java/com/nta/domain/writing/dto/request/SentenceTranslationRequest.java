package com.nta.domain.writing.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SentenceTranslationRequest {
    @Schema(description = "Vietnamese sentence", example = "Xin chào", defaultValue = "")
    private String vietnameseSentence;

    @Schema(description = "English translation", example = "Hello", defaultValue = "")
    private String englishSentence;
}
