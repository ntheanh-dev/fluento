package com.nta.domain.sentence.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SentenceCreationRequest {
    String conversationId;
    String vietnamese;
    String englishTranslation;
    Integer orderIndex;
    Integer score;
    String feedback;
}
