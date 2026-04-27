package com.nta.domain.vocabulary;

import java.util.Set;

import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.common.service.CommonUserService;
import com.nta.domain.deck.Deck;
import com.nta.domain.vocabulary.dto.request.UpdateVocabularyRequest;
import com.nta.domain.vocabulary.dto.response.VocabularyResponse;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@org.springframework.stereotype.Service("vocabularyService")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@org.springframework.transaction.annotation.Transactional
public class Service {
    Repository repository;
    com.nta.domain.deck.Repository deckRepository;
    CommonUserService commonUserService;

    public VocabularyResponse updateVocabulary(Long vocabularyId, UpdateVocabularyRequest request) {
        if (vocabularyId == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        Long userId = commonUserService.getCurrentUserIdFromContext();
        Vocabulary vocabulary = repository
                .findByIdAndUserId(vocabularyId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        String normalizedText = normalizeText(request.getText());
        var duplicateText =
                repository.findByUserIdAndTargetLanguageAndText(userId, vocabulary.getTargetLanguage(), normalizedText);
        if (duplicateText.isPresent()
                && !vocabularyId.equals(duplicateText.get().getId())) {
            throw new AppException(ErrorCode.VOCABULARY_ALREADY_IN_DECK);
        }

        vocabulary.setText(normalizedText);
        vocabulary.setPartOfSpeech(request.getPartOfSpeech());
        vocabulary.setMeaning(request.getMeaning());
        vocabulary.setPronunciation(request.getPronunciation());
        Vocabulary saved = repository.save(vocabulary);

        return VocabularyResponse.builder()
                .id(saved.getId())
                .text(saved.getText())
                .meaning(saved.getMeaning())
                .partOfSpeech(saved.getPartOfSpeech())
                .pronunciation(saved.getPronunciation())
                .createdAt(saved.getCreatedAt())
                .updatedAt(saved.getUpdatedAt())
                .build();
    }

    public void deleteVocabulary(Long vocabularyId) {
        if (vocabularyId == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        Long userId = commonUserService.getCurrentUserIdFromContext();
        Vocabulary vocabulary = repository
                .findByIdAndUserId(vocabularyId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Set<Deck> decks = vocabulary.getDecks() == null ? Set.of() : Set.copyOf(vocabulary.getDecks());
        for (Deck deck : decks) {
            if (deck.getVocabularies() == null) {
                continue;
            }
            deck.getVocabularies().removeIf(item -> vocabularyId.equals(item.getId()));
            deckRepository.save(deck);
        }

        repository.delete(vocabulary);
    }

    private static String normalizeText(String text) {
        return text == null ? "" : text.trim().toLowerCase();
    }
}
