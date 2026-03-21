package com.nta.domain.paragraph;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import jakarta.transaction.Transactional;

import com.nta.common.service.ai.ChatService;
import com.nta.common.service.ai.ParagraphPromptFactory;
import com.nta.common.service.ai.PromptMessage;
import com.nta.domain.paragraph.dto.request.CreateParagraphRequest;
import com.nta.domain.paragraph.dto.response.ParagraphAiResponse;
import com.nta.domain.paragraph.dto.response.ParagraphWithTitleAiResponse;
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

    // NOTE: Sau khi có một lượng data paragraph rồi thì không cần dùng AI để tạo nữa
    // mà sẽ query trong DB.
    public Paragraph findOrcreate(CreateParagraphRequest request) {
        return switch (request.getType()) {
            case BASIC -> handleBasicParagraph(request);
            case STORY, EMAIL, IELTS_TASK1, IELTS_TASK2 -> handleOtherParagraph(request);
            case SINGLE_SENTENCE -> handleSingleSentence(request);
        };
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
                .filter(sentence -> !sentence.isBlank())
                .map(sentence -> ParagraphSentence.builder()
                        .paragraph(paragraph)
                        .orderIndex(orderIndex.getAndIncrement())
                        .content(sentence)
                        .build())
                .toList();
    }
}
