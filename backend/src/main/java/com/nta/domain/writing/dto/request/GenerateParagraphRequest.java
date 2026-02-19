package com.nta.domain.writing.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GenerateParagraphRequest {
    @Schema(description = "Topic for the paragraph", example = "TECHNOLOGY", defaultValue = "LIFE")
    String topic;

    @Schema(description = "Language for the paragraph", example = "English", defaultValue = "English")
    String language;

    @Schema(description = "Proficiency level", example = "B1", defaultValue = "B1")
    String level;

    @Schema(description = "Number of sentences", example = "10", defaultValue = "10")
    Integer sentenceCount;

    @Schema(description = "Tone of the paragraph", example = "FORMAL", defaultValue = "FORMAL")
    String tone;

    @Schema(description = "Custom text input", example = "", defaultValue = "")
    String customText;

    @Schema(
            description = "Writing type",
            example = "AI_GENERATED",
            defaultValue = "AI_GENERATED",
            allowableValues = {"BASIC", "IELTS_TASK1", "IELTS_TASK2", "EMAIL", "AI_GENERATED", "CUSTOM_TEXT"})
    String writingType;
}
