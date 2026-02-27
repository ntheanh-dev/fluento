package com.nta.domain.hint.dto.request;

import com.nta.domain.paragraph.validation.ValidParagraphRequest;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request to generate a paragraph based on given constraints")
@ValidParagraphRequest
public class HintTranslationRequest {
    @Schema(description = "Vietnamese sentence to translate", example = "Xin chào", defaultValue = "")
    private String vietnameseSentence;

    @Schema(
            description = "Proficiency level",
            example = "A2",
            defaultValue = "A2",
            allowableValues = {"A1", "A2", "B1", "B2", "C1", "C2"})
    private String level;

    @Schema(description = "Sentence order index", example = "0", defaultValue = "0")
    private Integer orderIndex;
}
