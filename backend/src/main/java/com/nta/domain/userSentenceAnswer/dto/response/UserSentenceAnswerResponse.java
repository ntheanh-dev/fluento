package com.nta.domain.userSentenceAnswer.dto.response;

import java.time.LocalDateTime;

import com.nta.domain.userSentenceAnswer.SentenceFeedback;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserSentenceAnswerResponse {

    private Long id;

    private String originalText;

    private String userTranslation;

    private Double score;

    private SentenceFeedback feedback;

    private LocalDateTime createdAt;
}
