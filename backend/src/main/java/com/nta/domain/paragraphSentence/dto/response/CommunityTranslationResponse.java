package com.nta.domain.paragraphSentence.dto.response;

import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommunityTranslationResponse {
    /** Tên hiển thị: ưu tiên fullName, không có thì username. */
    String translatorName;

    String translation;
    Double score;
    LocalDateTime submittedAt;
}
