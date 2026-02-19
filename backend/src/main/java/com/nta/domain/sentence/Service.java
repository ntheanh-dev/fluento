package com.nta.domain.sentence;

import java.time.LocalDateTime;

import com.nta.domain.sentence.dto.request.SentenceCreationRequest;
import com.nta.domain.writing.Writing;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@org.springframework.stereotype.Service("sentenceService")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class Service {
    com.nta.domain.sentence.Repository repository;
    com.nta.domain.writing.Repository writingRepository;
    com.nta.domain.sentence.Mapper mapper;

    public void addSentence(final SentenceCreationRequest request) {
        final Writing writing = writingRepository.findByConversationId(request.getConversationId());
        if (writing == null) {
            throw new IllegalArgumentException("Writing not found with id: " + request.getConversationId());
        }
        final Sentence sentence = mapper.toSentence(request);
        sentence.setWriting(writing);
        sentence.setCreatedAt(LocalDateTime.now());
        repository.save(sentence);
        log.debug("Sentence added for conversation: {}", request.getConversationId());
    }
}
