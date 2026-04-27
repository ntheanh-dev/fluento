package com.nta.domain.vocabulary.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateVocabularyRequest {
    @NotBlank(message = "Vocabulary text is required")
    @Size(max = 255, message = "Vocabulary text must not exceed 255 characters")
    private String text;

    @Size(max = 100, message = "Part of speech must not exceed 100 characters")
    private String partOfSpeech;

    @Size(max = 2000, message = "Meaning must not exceed 2000 characters")
    private String meaning;

    @Size(max = 255, message = "Pronunciation must not exceed 255 characters")
    private String pronunciation;
}
