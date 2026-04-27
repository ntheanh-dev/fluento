package com.nta.domain.vocabulary.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyResponse {
    private Long id;
    private String text;
    private String meaning;
    private String partOfSpeech;
    private String pronunciation;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
