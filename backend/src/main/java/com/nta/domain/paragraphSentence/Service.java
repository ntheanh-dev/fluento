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

    Repository repository;
    ParagraphPromptFactory promptFactory;
    ChatService chatService;
    com.nta.domain.userSentenceAnswer.Repository userSentenceAnswerRepository;
    CommonUserService commonUserService;

    public ParagraphSentence getOrCreateVocabularyHints(Long sentenceId) {
        return getOrCreateVocabularyHints(sentenceId, null);
    }

    public ParagraphSentence getOrCreateVocabularyHints(Long sentenceId, Consumer<String> onChunk) {
        ParagraphSentence sentence =
                repository.findById(sentenceId).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (sentence.getVocabularyHints() != null) {
            return sentence;
        }

        PromptMessage prompt = promptFactory.buildHintTranslationPrompt(
                sentence.getContent(), sentence.getParagraph().getLevel().getCode());
        VocabularyHint[] response = (onChunk == null
                        ? chatService.sendMessage(prompt.systemMessage(), prompt.userMessage(), VocabularyHint[].class)
                        : chatService.sendMessageStream(
                                prompt.systemMessage(), prompt.userMessage(), VocabularyHint[].class, onChunk))
                .getResult();

        List<VocabularyHint> vocabularyHints = response != null ? Arrays.asList(response) : List.of();
        sentence.setVocabularyHints(vocabularyHints);
        return repository.save(sentence);
    }

    public List<CommunityTranslationResponse> getCommunityTranslations(Long sentenceId, CommunityScoreBand band) {
        ParagraphSentence sentence =
                repository.findById(sentenceId).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Long paragraphId = sentence.getParagraph().getId();
        Integer orderIndex = sentence.getOrderIndex();
        Long currentUserId = commonUserService.getCurrentUserIdFromContext();

        List<UserSentenceAnswer> filteredRaw =
                userSentenceAnswerRepository.findRecentSubmittedByParagraphAndOrderExcludingUser(
                        paragraphId,
                        orderIndex,
                        currentUserId,
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
