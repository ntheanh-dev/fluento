package com.nta.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.nta.entity.Card;

import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CardResponse {

    private Long id;
    private Long noteId;
    private Card.CardType cardType;
    private String frontTemplate;
    private String backTemplate;
    private LocalDateTime createdAt;

    @com.fasterxml.jackson.annotation.JsonProperty("fieldValues")
    private Map<String, String> fieldValues; // Field values for template rendering

    private CardStatsResponse stats;
    private NextIntervalResponse nextIntervals;

    @Data
    public static class CardStatsResponse {
        private BigDecimal easeFactor;
        private Integer intervalMinutes;
        private Integer repetitions;
        private Integer lapses;
        private LocalDateTime dueDate;
        private LocalDateTime lastReviewedAt;
    }
}
