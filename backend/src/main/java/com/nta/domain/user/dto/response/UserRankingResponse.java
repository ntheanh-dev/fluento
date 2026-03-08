package com.nta.domain.user.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserRankingResponse {

    Long rank;
    String fullName;
    String urlAvatar;
    Double avgScore;
    Long totalUserSentenceAnswers;
    Integer currentStreak;
    Long totalLearningTime;
}
