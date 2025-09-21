package com.nta.dto.request;

import jakarta.validation.constraints.NotNull;

import com.nta.entity.Review;

import lombok.Data;

@Data
public class ReviewCardRequest {

    @NotNull(message = "Card ID is required")
    private Long cardId;

    @NotNull(message = "Rating is required")
    private Review.Rating rating;

    @NotNull(message = "Review time is required")
    private Long reviewTimeMs;
}
