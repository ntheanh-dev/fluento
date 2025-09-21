package com.nta.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import com.nta.entity.Card;

import lombok.Data;

@Data
public class CreateCardRequest {

    @NotNull(message = "Note ID is required")
    private Long noteId;

    private Card.CardType cardType = Card.CardType.BASIC;

    @NotBlank(message = "Front template is required")
    private String frontTemplate;

    @NotBlank(message = "Back template is required")
    private String backTemplate;
}
