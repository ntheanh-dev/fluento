package com.nta.domain.paragraphSentence;

import java.util.Arrays;
import java.util.List;

import jakarta.transaction.Transactional;

import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.common.service.ai.ChatService;
import com.nta.common.service.ai.ParagraphPromptFactory;
import com.nta.common.service.ai.PromptMessage;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@org.springframework.stereotype.Service("paragraphSentenceService")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Transactional
@RequiredArgsConstructor
public class Service {
    Repository repository;
    ParagraphPromptFactory promptFactory;
    ChatService chatService;

    public ParagraphSentence getOrCreateVocabularyHints(Long sentenceId) {
        ParagraphSentence sentence =
                repository.findById(sentenceId).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (sentence.getVocabularyHints() != null) {
            return sentence;
        }

        PromptMessage prompt = promptFactory.buildHintTranslationPrompt(
                sentence.getContent(), sentence.getParagraph().getLevel().getCode());
        VocabularyHint[] response = chatService
                .sendMessage(prompt.systemMessage(), prompt.userMessage(), VocabularyHint[].class)
                .getResult();

        List<VocabularyHint> vocabularyHints = response != null ? Arrays.asList(response) : List.of();
        sentence.setVocabularyHints(vocabularyHints);
        return repository.save(sentence);
    }
}
