package com.nta.service;

import com.nta.dto.request.SentenceCreationRequest;
import com.nta.entity.Sentence;
import com.nta.entity.Writing;
import com.nta.mapper.SentenceMapper;
import com.nta.repository.SentenceRepository;
import com.nta.repository.WritingRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SentenceService {
    SentenceRepository sentenceRepository;
    WritingRepository writingRepository;
    SentenceMapper sentenceMapper;

    public void addSentence(final SentenceCreationRequest request) {
        final Writing writing = writingRepository.findByConversationId(request.getConversationId());
        if (writing == null) {
            throw new IllegalArgumentException(
                    "Writing not found with id: " + request.getConversationId());
        }
        final Sentence sentence = sentenceMapper.toSentence(request);
        sentence.setWriting(writing);
        sentence.setCreatedAt(LocalDateTime.now());
        sentenceRepository.save(sentence);
    }
}
