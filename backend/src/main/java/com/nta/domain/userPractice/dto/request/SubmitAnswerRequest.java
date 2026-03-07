package com.nta.domain.userPractice.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.nta.domain.userSentenceAnswer.SentenceFeedback;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request to submit an answer")
public class SubmitAnswerRequest {
    @Schema(description = "Vietnamese sentence", example = "Xin chào", defaultValue = "")
    @NotBlank(message = "Vietnamese sentence must not be blank")
    @NotNull
    @Size(max = 1000, message = "Vietnamese sentence must not exceed 1000 characters")
    private String vietnameseSentence;

    @Schema(description = "", example = "1", defaultValue = "1")
    @NotNull(message = "Order index is required")
    @Min(value = 0, message = "Order index must be >= 0")
    @Max(value = 30, message = "Order index must be <= 30")
    private Integer orderIndex;

    @Schema(description = "Feedback")
    @NotNull(message = "Feedback is required")
    private SentenceFeedback feedback;

    @Schema(description = "Time spent in milliseconds (optional, sent when submitting last sentence)")
    private Long learningTime;
}
