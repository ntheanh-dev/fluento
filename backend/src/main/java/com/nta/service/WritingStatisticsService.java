package com.nta.service;

import com.nta.dto.response.WritingStatisticsResponse;
import com.nta.repository.WritingRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WritingStatisticsService {
    
    private final WritingRepository writingRepository;
    
    public WritingStatisticsResponse getWritingStatistics(Long userId) {
        // Get basic statistics
        int totalExercises = writingRepository.countByUserId(userId);
        Double avgSentences = writingRepository.getAverageSentencesByUserId(userId);
        Integer highestSentences = writingRepository.getHighestSentencesByUserId(userId);
        
        // Get practice frequency (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Object[]> practiceData = writingRepository.getPracticeFrequencyByUserId(userId, thirtyDaysAgo);
        
        // Get score progress (last 30 days)
        List<Object[]> scoreData = writingRepository.getScoreProgressByUserId(userId, thirtyDaysAgo);
        
        // Convert practice frequency data
        List<WritingStatisticsResponse.DailyPracticeData> practiceFrequency = 
            convertToDailyPracticeData(practiceData);
        
        // Convert score progress data
        List<WritingStatisticsResponse.ScoreProgressData> scoreProgress = 
            convertToScoreProgressData(scoreData);
        
        return WritingStatisticsResponse.builder()
                .totalWritingExercises(totalExercises)
                .averageSentences(avgSentences != null ? avgSentences : 0.0)
                .highestSentences(highestSentences != null ? highestSentences : 0)
                .practiceFrequency(practiceFrequency)
                .scoreProgress(scoreProgress)
                .build();
    }
    
    private List<WritingStatisticsResponse.DailyPracticeData> convertToDailyPracticeData(List<Object[]> rawData) {
        // Create a map of day names to Vietnamese abbreviations
        Map<String, String> dayMapping = Map.of(
            "Sunday", "CN",
            "Monday", "T2", 
            "Tuesday", "T3",
            "Wednesday", "T4",
            "Thursday", "T5",
            "Friday", "T6",
            "Saturday", "T7"
        );
        
        // Initialize all days with 0 count in the correct order (CN, T2, T3, T4, T5, T6, T7)
        List<WritingStatisticsResponse.DailyPracticeData> result = Arrays.asList(
            WritingStatisticsResponse.DailyPracticeData.builder().dayOfWeek("CN").count(0).build(),
            WritingStatisticsResponse.DailyPracticeData.builder().dayOfWeek("T2").count(0).build(),
            WritingStatisticsResponse.DailyPracticeData.builder().dayOfWeek("T3").count(0).build(),
            WritingStatisticsResponse.DailyPracticeData.builder().dayOfWeek("T4").count(0).build(),
            WritingStatisticsResponse.DailyPracticeData.builder().dayOfWeek("T5").count(0).build(),
            WritingStatisticsResponse.DailyPracticeData.builder().dayOfWeek("T6").count(0).build(),
            WritingStatisticsResponse.DailyPracticeData.builder().dayOfWeek("T7").count(0).build()
        );
        
        // Update with actual data
        for (Object[] row : rawData) {
            String englishDay = (String) row[0];
            Long count = ((Number) row[1]).longValue();
            String vietnameseDay = dayMapping.get(englishDay);
            
            if (vietnameseDay != null) {
                result.stream()
                    .filter(data -> data.getDayOfWeek().equals(vietnameseDay))
                    .findFirst()
                    .ifPresent(data -> data.setCount(count.intValue()));
            }
        }
        
        return result;
    }
    
    private List<WritingStatisticsResponse.ScoreProgressData> convertToScoreProgressData(List<Object[]> rawData) {
        return rawData.stream()
                .map(row -> WritingStatisticsResponse.ScoreProgressData.builder()
                        .date((String) row[0])
                        .score(((Number) row[1]).doubleValue())
                        .build())
                .collect(Collectors.toList());
    }
}
