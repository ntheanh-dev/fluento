package com.nta.domain.writing.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TranslationHintsRequest {
    private String vietnameseSentence;
    private String level; // A2, B1, B2, C1, C2
}
