package com.nta.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Data;

@Data
public class DictionaryRequest {
    @NotBlank(message = "Word is required")
    @Size(max = 100, message = "Word must not exceed 100 characters")
    private String word;
}
