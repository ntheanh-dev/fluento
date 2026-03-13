package com.nta.domain.userSentenceAnswer.projection;

import java.time.LocalDate;

public interface DailyScoreStatsProjection {
    LocalDate getDate();

    Double getAvgScore();

    Long getTotalAnswers();
}
