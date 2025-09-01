package com.nta.dto.response;

import com.nta.entity.Level;
import com.nta.entity.SentenceCount;
import com.nta.entity.Topic;
import com.nta.entity.User;
import com.nta.entity.Tone;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WritingResponse {
    private List<String> sentences; // vietnamese sentences
    private List<String> englishTranslations;

    private Long id;
    private String conversationId;
    private User user;
    private Topic topic;
    private Level level;
    private Tone tone;

    private SentenceCount sentenceCount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
