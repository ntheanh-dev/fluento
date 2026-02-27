package com.nta.domain.hint;

import java.util.List;
import java.util.Optional;

import jakarta.transaction.Transactional;

import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.common.service.SentenceUtils;
import com.nta.common.service.ai.ChatService;
import com.nta.common.service.ai.ParagraphPromptFactory;
import com.nta.common.service.ai.PromptMessage;
import com.nta.domain.paragraph.Paragraph;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@org.springframework.stereotype.Service("hintService")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@RequiredArgsConstructor
public class Service {

    Repository repository;
    com.nta.domain.paragraph.Repository paraRepo;
    ParagraphPromptFactory promptFactory;
    ChatService chatService;

    @Transactional
    public HintContent getOrCreateByParagraphId(Long paraId, Integer orderIndex) {
        Paragraph paragraph =
                paraRepo.findById(paraId).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Optional<Hint> existing = repository.findByParagraphIdAndOrderIndex(paraId, orderIndex);

        if (existing.isPresent()) {
            return existing.get().getHints();
        }

        // 3. split sentences
        List<String> sentences = SentenceUtils.splitSentences(paragraph.getContent());

        if (orderIndex >= sentences.size()) {
            throw new IllegalArgumentException("Invalid sentence index");
        }

        String sentence = sentences.get(orderIndex);

        PromptMessage prompt = promptFactory.buildHintTranslationPrompt(
                sentence, paragraph.getLevel().getCode());

        HintContent response = chatService
                .sendMessage(prompt.systemMessage(), prompt.userMessage(), HintContent.class)
                .getResult();

        Hint hint = Hint.builder()
                .paragraph(paragraph)
                .orderIndex(orderIndex)
                .hints(response)
                .build();
        repository.save(hint);
        return response;
    }
}
