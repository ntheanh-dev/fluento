package com.nta.domain.userPractice.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import com.nta.domain.userSentenceAnswer.SentenceFeedback;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SubmitAnswerRequest {
    @Schema(description = "Vietnamese sentence", example = "Xin chào", defaultValue = "")
    @NotNull
    @NotEmpty
    private String vietnameseSentence;

    @Schema(description = "", example = "1", defaultValue = "1")
    @NotNull
    @NotEmpty
    private Integer orderIndex;

    @Schema(description = "Feedback")
    @NotNull
    @NotEmpty
    private SentenceFeedback feedback;
}
