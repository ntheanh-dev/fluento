package com.nta.domain.paragraph.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.nta.domain.paragraph.enums.Level;
import com.nta.domain.paragraph.enums.SentenceCount;
import com.nta.domain.paragraph.enums.Tone;
import com.nta.domain.paragraph.enums.Topic;
import com.nta.domain.paragraph.enums.Type;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ParagraphResponse {
    Long id;
    String title;
    Type type;
    Tone tone;
    Topic topic;
    Level level;
    SentenceCount sentenceCount;
    Long practiceCount;
    LocalDateTime createdAt;
    List<String> sentences;
}
