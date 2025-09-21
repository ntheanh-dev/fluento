package com.nta.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WritingStatisticsResponse {
    private int totalWritingExercises;
    private double averageSentences;
    private int highestSentences;
    private List<DailyPracticeData> practiceFrequency;
    private List<ScoreProgressData> scoreProgress;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyPracticeData {
        private String dayOfWeek; // CN, T2, T3, T4, T5, T6, T7
        private int count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreProgressData {
        private String date; // format: dd-MM
        private double score;
    }
}
