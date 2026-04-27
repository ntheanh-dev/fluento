package com.nta.domain.paragraphSentence;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.PageRequest;

import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.common.service.CommonUserService;
import com.nta.common.service.ai.ChatService;
import com.nta.common.service.ai.ParagraphPromptFactory;
import com.nta.common.service.ai.PromptMessage;
import com.nta.domain.paragraphSentence.dto.response.CommunityTranslationResponse;
import com.nta.domain.paragraphSentence.enums.CommunityScoreBand;
import com.nta.domain.paragraphSentenceHint.ParagraphSentenceHint;
import com.nta.domain.paragraphSentenceHint.enums.TargetLanguage;
import com.nta.domain.user.User;
import com.nta.domain.userSentenceAnswer.UserSentenceAnswer;

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
    private static final int COMMUNITY_FETCH_CAP = 80;
    private static final int COMMUNITY_UNIQUE_CAP = 24;
    private static final TargetLanguage DEFAULT_TARGET_LANGUAGE = TargetLanguage.EN;

    Repository repository;
    com.nta.domain.paragraphSentenceHint.Repository hintRepository;
    ParagraphPromptFactory promptFactory;
    ChatService chatService;
    com.nta.domain.userSentenceAnswer.Repository userSentenceAnswerRepository;
    CommonUserService commonUserService;

    public ParagraphSentenceHint getOrCreateVocabularyHints(Long sentenceId) {
        return getOrCreateVocabularyHints(sentenceId, DEFAULT_TARGET_LANGUAGE, null);
    }

    public ParagraphSentenceHint getOrCreateVocabularyHints(Long sentenceId, Consumer<String> onChunk) {
        return getOrCreateVocabularyHints(sentenceId, DEFAULT_TARGET_LANGUAGE, onChunk);
    }

    public ParagraphSentenceHint getOrCreateVocabularyHints(
            Long sentenceId, TargetLanguage targetLanguage, Consumer<String> onChunk) {
        ParagraphSentence sentence =
                repository.findById(sentenceId).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        TargetLanguage language = targetLanguage == null ? DEFAULT_TARGET_LANGUAGE : targetLanguage;

        var existingHint = hintRepository.findByParagraphSentenceIdAndTargetLanguage(sentenceId, language);
        if (existingHint.isPresent()) {
            return existingHint.get();
        }

        PromptMessage prompt = promptFactory.buildHintTranslationPrompt(
                sentence.getContent(), sentence.getParagraph().getLevel().getCode(), language);
        VocabularyHint[] response = (onChunk == null
                        ? chatService.sendMessage(prompt.systemMessage(), prompt.userMessage(), VocabularyHint[].class)
                        : chatService.sendMessageStream(
                                prompt.systemMessage(), prompt.userMessage(), VocabularyHint[].class, onChunk))
                .getResult();

        List<VocabularyHint> vocabularyHints = response != null ? Arrays.asList(response) : List.of();
        ParagraphSentenceHint hint = ParagraphSentenceHint.builder()
                .paragraphSentence(sentence)
                .targetLanguage(language)
                .hintsJson(vocabularyHints)
                .build();
        return hintRepository.save(hint);
    }

    public List<CommunityTranslationResponse> getCommunityTranslations(
            Long sentenceId, CommunityScoreBand band, TargetLanguage targetLanguage) {
        ParagraphSentence sentence =
                repository.findById(sentenceId).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Long paragraphId = sentence.getParagraph().getId();
        Integer orderIndex = sentence.getOrderIndex();
        Long currentUserId = commonUserService.getCurrentUserIdFromContext();
        TargetLanguage language = targetLanguage == null ? DEFAULT_TARGET_LANGUAGE : targetLanguage;

        List<UserSentenceAnswer> filteredRaw =
                userSentenceAnswerRepository.findRecentSubmittedByParagraphAndOrderExcludingUser(
                        paragraphId,
                        orderIndex,
                        currentUserId,
                        language,
                        band.getQueryIndex(),
                        PageRequest.of(0, COMMUNITY_FETCH_CAP));

        return buildDedupedTranslationList(filteredRaw);
    }

    private List<CommunityTranslationResponse> buildDedupedTranslationList(List<UserSentenceAnswer> raw) {
        Map<String, CommunityTranslationResponse> byNormalized = new LinkedHashMap<>();
        for (UserSentenceAnswer a : raw) {
            if (a.getUserTranslation() == null || a.getUserTranslation().isBlank()) {
                continue;
            }
            String key = normalizeTranslationKey(a.getUserTranslation());
            if (byNormalized.containsKey(key)) {
                continue;
            }
            byNormalized.put(
                    key,
                    CommunityTranslationResponse.builder()
                            .translatorName(resolveTranslatorDisplayName(
                                    a.getPractice() != null ? a.getPractice().getUser() : null))
                            .translation(a.getUserTranslation())
                            .score(a.getScore())
                            .submittedAt(a.getCreatedAt())
                            .build());
            if (byNormalized.size() >= COMMUNITY_UNIQUE_CAP) {
                break;
            }
        }
        return new ArrayList<>(byNormalized.values());
    }

    private static String normalizeTranslationKey(String translation) {
        return translation.trim().replace("\r\n", "\n");
    }

    private static String resolveTranslatorDisplayName(User user) {
        if (user == null) {
            return "Học viên";
        }
        if (user.getFullName() != null && !user.getFullName().isBlank()) {
            return user.getFullName().trim();
        }
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            return user.getUsername().trim();
        }
        return "Học viên";
    }
}
