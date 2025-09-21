package com.nta.dto.request;

import java.util.Map;

import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class CreateNoteRequest {

    @NotNull(message = "Note type ID is required")
    private Long noteTypeId;

    @NotNull(message = "Deck ID is required")
    private Long deckId;

    @NotNull(message = "Field values are required")
    private Map<String, Object> fieldValues;
}
