package com.nta.dto.request;

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
}
