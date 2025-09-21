package com.nta.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Data;

@Data
public class CreateDeckRequest {

    @NotBlank(message = "Deck name is required")
    @Size(max = 255, message = "Deck name must not exceed 255 characters")
    private String name;
}
