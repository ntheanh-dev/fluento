package com.nta.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyModeStatsResponse {
    private Long totalVocabulary;
    private Long mastered;
    private Long dueForReview;
    private Double masteryPercentage;
    private DifficultyDistribution difficultyDistribution;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DifficultyDistribution {
        private Long known;
        private Long easy;
        private Long medium;
        private Long hard;
        private Long notStarted;
    }
}