package com.nta.domain.userSentenceAnswer.projection;

import java.time.LocalDate;

public interface DailyScoreStatsProjection {
    /** Ngày theo múi giờ app (cột sau CONVERT_TZ trong query). */
    LocalDate getStatDate();

    Double getAvgScore();

    Long getTotalAnswers();
}
