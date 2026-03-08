package com.nta.domain.user.projection;

public interface UserRankingProjection {

    Long getId();

    String getFullName();

    String getUrlAvatar();

    Long getTotalUserSentenceAnswers();

    Double getAvgScore();

    Integer getCurrentStreak();

    Long getTotalLearningTime();
}
