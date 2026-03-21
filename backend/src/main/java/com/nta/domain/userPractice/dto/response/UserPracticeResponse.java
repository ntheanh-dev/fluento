package com.nta.domain.userPractice.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.nta.domain.paragraph.Paragraph;
import com.nta.domain.userSentenceAnswer.UserSentenceAnswer;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserPracticeResponse {

    private Long id;

    private Integer attemptNumber;

    private Double score;

    private Long learningTime;

    private LocalDateTime createdAt;

    private Paragraph paragraph;

    private List<UserSentenceAnswer> sentenceAnswers;
}
