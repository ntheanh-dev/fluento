package com.nta.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.nta.entity.Review;

import lombok.Data;

@Data
public class ReviewResponse {

    private Long id;
    private Long cardId;
    private Long userId;
    private Review.Rating rating;
    private BigDecimal easeFactor;
    private Integer intervalDays;
    private Integer repetitions;
    private LocalDateTime dueDate;
    private Integer reviewTimeMs;
    private LocalDateTime createdAt;
}
