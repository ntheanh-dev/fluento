package com.nta.domain.deck.dto.response;

import java.time.LocalDateTime;

import com.nta.domain.paragraphSentenceHint.enums.TargetLanguage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeckResponse {
    private Long id;
    private String name;
    private String icon;
    private TargetLanguage targetLanguage;
    private Integer vocabularyCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
