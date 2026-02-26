package com.nta.domain.paragraph;

import jakarta.transaction.Transactional;

import com.nta.common.service.ai.ChatService;
import com.nta.common.service.ai.ParagraphPromptFactory;
import com.nta.common.service.ai.PromptMessage;
import com.nta.domain.hint.dto.response.HintTranslationResponse;
import com.nta.domain.paragraph.dto.request.CreateParagraphRequest;
import com.nta.domain.paragraph.dto.response.ParagraphWithTitleAiResponse;

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
    com.nta.domain.hint.Repository hintRepository;
    Mapper mapper;

    // NOTE: Sau khi có một lượng data paragraph rồi thì không cần dùng AI để tạo nữa
    // mà sẽ query trong DB.
    public Paragraph findOrcreate(CreateParagraphRequest request) {
        return switch (request.getType()) {
            case BASIC -> handleBasicParagraph(request);
            case CUSTOM_TEXT -> handleCustomParagraph(request);
            case STORY, EMAIL, IELTS_TASK1, IELTS_TASK2 -> handleOtherParagraph(request);
        };
    }

    private Paragraph handleCustomParagraph(CreateParagraphRequest request) {
        PromptMessage prompt = promptFactory.buildPrompt(request);
        String response = chatService
                .sendMessage(prompt.systemMessage(), prompt.userMessage(), String.class)
                .getResult();

        boolean isEnglish = response.trim().equalsIgnoreCase("YES");

        if (!isEnglish) {
            throw new IllegalArgumentException("Custom text must be written in English");
        }
        Paragraph paragraph = mapper.toParagraph(request);
        return repository.save(paragraph);
    }

    private Paragraph handleBasicParagraph(CreateParagraphRequest request) {
        PromptMessage prompt = promptFactory.buildPrompt(request);
        String generatedContent = chatService
                .sendMessage(prompt.systemMessage(), prompt.userMessage(), String.class)
                .getResult();
        Paragraph paragraph = mapper.toParagraph(request);
        paragraph.setContent(generatedContent);
        return repository.save(paragraph);
    }

    private Paragraph handleOtherParagraph(CreateParagraphRequest request) {
        PromptMessage prompt = promptFactory.buildPrompt(request);
        ParagraphWithTitleAiResponse response = chatService
                .sendMessage(prompt.systemMessage(), prompt.userMessage(), ParagraphWithTitleAiResponse.class)
                .getResult();
        Paragraph paragraph = mapper.toParagraph(request);
        paragraph.setTitle(response.getTitle());
        paragraph.setContent(response.getContent());
        return repository.save(paragraph);
    }

    private HintTranslationResponse getOrCreateHint(Long id, Integer orderIndex) {}
}
