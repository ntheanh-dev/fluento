package com.nta.domain.paragraph;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import com.nta.common.service.ai.ChatService;
import com.nta.common.service.ai.ParagraphPromptFactory;
import com.nta.common.service.ai.PromptMessage;
import com.nta.domain.paragraph.dto.request.CreateParagraphRequest;
import com.nta.domain.paragraph.dto.response.ParagraphAiResponse;
import com.nta.domain.paragraph.dto.response.ParagraphResponse;
import com.nta.domain.paragraph.dto.response.ParagraphWithTitleAiResponse;
import com.nta.domain.paragraph.enums.Level;
import com.nta.domain.paragraph.enums.SentenceCount;
import com.nta.domain.paragraph.enums.Tone;
import com.nta.domain.paragraph.enums.Topic;
import com.nta.domain.paragraph.enums.Type;
import com.nta.domain.paragraphSentence.ParagraphSentence;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@org.springframework.stereotype.Service("paragraphService")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Transactional
@RequiredArgsConstructor
public class Service {

    Repository repository;
    ParagraphPromptFactory promptFactory;
    ChatService chatService;
    Mapper mapper;

    public Optional<Paragraph> findById(Long id) {
        return repository.findById(id);
    }

    public Page<ParagraphResponse> getAllFiltered(
            Type type,
            Tone tone,
            Topic topic,
            Level level,
            SentenceCount sentenceCount,
            String sort,
            int page,
            int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Object[]> paragraphsWithCount;
        if ("most_practiced".equalsIgnoreCase(sort)) {
            paragraphsWithCount = repository.findWithOptionalFiltersAndPracticeCountOrderByMostPracticed(
                    type, tone, topic, level, sentenceCount, pageable);
        } else {
            Sort.Direction direction = "asc".equalsIgnoreCase(sort) ? Sort.Direction.ASC : Sort.Direction.DESC;
            pageable = PageRequest.of(page, size, Sort.by(direction, "createdAt"));
            paragraphsWithCount = repository.findWithOptionalFiltersAndPracticeCount(
                    type, tone, topic, level, sentenceCount, pageable);
        }
        return paragraphsWithCount.map(row -> toResponse((Paragraph) row[0], (Long) row[1]));
    }

    public Paragraph findOrcreate(CreateParagraphRequest request) {
        return findExistingWithSameSetup(request).orElseGet(() -> switch (request.getType()) {
            case DIARIES -> handleBasicParagraph(request);
            case STORY, EMAIL, IELTS_TASK1, IELTS_TASK2, ESSAYS -> handleOtherParagraph(request);
            case SINGLE_SENTENCE -> handleSingleSentence(request);
        });
    }

    public Paragraph create(CreateParagraphRequest request) {
        switch (request.getType()) {
            case DIARIES: {
                return handleBasicParagraph(request);
            }
            case STORY, EMAIL, IELTS_TASK1, IELTS_TASK2, ESSAYS: {
                return handleOtherParagraph(request);
            }
            case SINGLE_SENTENCE: {
                return handleSingleSentence(request);
            }
            default: {
                throw new IllegalArgumentException("Invalid paragraph type: " + request.getType());
            }
        }
    }

    /** Tái sử dụng paragraph đã có cùng type/tone/topic/level/sentenceCount trước khi gọi AI. */
    private Optional<Paragraph> findExistingWithSameSetup(CreateParagraphRequest request) {
        List<Paragraph> hits = repository.findMatchingSetup(
                request.getType(),
                request.getTone(),
                request.getTopic(),
                request.getLevel(),
                request.getSentenceCount(),
                PageRequest.of(0, 1));
        if (hits.isEmpty()) {
            return Optional.empty();
        }
        Paragraph p = hits.getFirst();
        log.debug(
                "Reusing existing paragraph id={} for type={} topic={} level={}",
                p.getId(),
                request.getType(),
                request.getTopic(),
                request.getLevel());
        return Optional.of(p);
    }

    private Paragraph handleBasicParagraph(CreateParagraphRequest request) {
        PromptMessage prompt = promptFactory.buildPrompt(request);
        ParagraphAiResponse response = chatService
                .sendMessage(prompt.systemMessage(), prompt.userMessage(), ParagraphAiResponse.class)
                .getResult();
        Paragraph paragraph = mapper.toParagraph(request);
        paragraph.setSentences(toParagraphSentences(paragraph, response.getSentences()));
        return repository.save(paragraph);
    }

    private Paragraph handleOtherParagraph(CreateParagraphRequest request) {
        PromptMessage prompt = promptFactory.buildPrompt(request);
        ParagraphWithTitleAiResponse response = chatService
                .sendMessage(prompt.systemMessage(), prompt.userMessage(), ParagraphWithTitleAiResponse.class)
                .getResult();
        Paragraph paragraph = mapper.toParagraph(request);
        paragraph.setTitle(response.getTitle());
        paragraph.setSentences(toParagraphSentences(paragraph, response.getSentences()));
        return repository.save(paragraph);
    }

    private Paragraph handleSingleSentence(CreateParagraphRequest request) {
        PromptMessage prompt = promptFactory.buildPrompt(request);
        ParagraphAiResponse response = chatService
                .sendMessage(prompt.systemMessage(), prompt.userMessage(), ParagraphAiResponse.class)
                .getResult();
        Paragraph paragraph = mapper.toParagraph(request);
        paragraph.setSentences(toParagraphSentences(paragraph, response.getSentences()));
        return repository.save(paragraph);
    }

    private List<ParagraphSentence> toParagraphSentences(Paragraph paragraph, List<String> sentences) {
        if (sentences == null || sentences.isEmpty()) {
            return List.of();
        }
        AtomicInteger orderIndex = new AtomicInteger(0);
        return sentences.stream()
                .map(String::trim)
                .filter(sentence -> !isMeaninglessSentence(sentence))
                .map(sentence -> ParagraphSentence.builder()
                        .paragraph(paragraph)
                        .orderIndex(orderIndex.getAndIncrement())
                        .content(sentence)
                        .build())
                .toList();
    }

    private static boolean isMeaninglessSentence(String sentence) {
        if (sentence == null || sentence.isBlank()) {
            return true;
        }
        String stripped = sentence.replace("\n", "").replace("\r", "").replace("\\n", "");
        return stripped.isBlank();
    }

    private ParagraphResponse toResponse(Paragraph paragraph, Long practiceCount) {
        return ParagraphResponse.builder()
                .id(paragraph.getId())
                .title(paragraph.getTitle())
                .type(paragraph.getType())
                .tone(paragraph.getTone())
                .topic(paragraph.getTopic())
                .level(paragraph.getLevel())
                .sentenceCount(paragraph.getSentenceCount())
                .practiceCount(practiceCount != null ? practiceCount : 0L)
                .createdAt(paragraph.getCreatedAt())
                .sentences(paragraph.getSentenceContents())
                .build();
    }
}
