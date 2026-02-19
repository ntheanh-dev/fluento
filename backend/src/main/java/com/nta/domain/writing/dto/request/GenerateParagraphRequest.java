package com.nta.domain.writing.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GenerateParagraphRequest {
    String topic;
    String language;
    String level;
    Integer sentenceCount;
    String tone;
    String customText;
    String writingType; // e.g., "BASIC", "IELTS_TASK1", "IELTS_TASK2", "EMAIL", "AI_GENERATED", "CUSTOM_TEXT"
}
