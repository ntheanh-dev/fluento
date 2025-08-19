package com.nta.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SentenceTranslationRequest {
    private String vietnameseSentence;
    private String englishSentence;
}
