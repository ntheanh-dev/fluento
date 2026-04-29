package com.nta.domain.user.projection;

public interface CurrentUserRankingProjection {

    Long getUserRank();

    String getFullName();

    String getUrlAvatar();

    Long getTotalUserSentenceAnswers();

    Double getAvgScore();

    Integer getCurrentStreak();

    Long getTotalLearningTime();
}
