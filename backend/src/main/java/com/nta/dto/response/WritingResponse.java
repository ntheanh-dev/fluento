package com.nta.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.nta.entity.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WritingResponse {
    private List<String> vietNamesesentences; // vietnamese sentences
    private List<Sentence> englishSentences;

    private Long id;
    private String conversationId;
    private Topic topic;
    private Level level;
    private Tone tone;

    private SentenceCount sentenceCount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
