package com.nta.domain.userPractice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SentenceTranslationRequest {
    @Schema(description = "Vietnamese sentence", example = "Xin chào", defaultValue = "")
    private String vietnameseSentence;

    @Schema(description = "", example = "1", defaultValue = "1")
    private Integer orderIndex;
}
