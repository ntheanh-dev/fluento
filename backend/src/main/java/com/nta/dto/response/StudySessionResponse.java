package com.nta.dto.response;

import java.util.List;

import lombok.Data;

@Data
public class StudySessionResponse {

    private Long totalCards;
    private Long dueCards;
    private Long newCards;
    private Long reviewCards;
    private List<CardResponse> cardsToStudy;
    private StudyStatsResponse stats;

    @Data
    public static class StudyStatsResponse {
        private Long totalCards;
        private Long learnedCards;
        private Long dueToday;
        private Long newToday;
        private Long reviewToday;
    }
}
