package com.nta.domain.writing.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TranslationHintsRequest {
    @Schema(description = "Vietnamese sentence to translate", example = "Xin chào", defaultValue = "")
    private String vietnameseSentence;
    
    @Schema(description = "Proficiency level", example = "A2", defaultValue = "A2", allowableValues = {"A1", "A2", "B1", "B2", "C1", "C2"})
    private String level;
}
