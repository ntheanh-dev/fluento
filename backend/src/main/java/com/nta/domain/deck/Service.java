package com.nta.domain.deck;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import jakarta.transaction.Transactional;

import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.common.service.CommonUserService;
import com.nta.domain.deck.dto.request.AddVocabularyToDeckRequest;
import com.nta.domain.deck.dto.request.CreateDeckRequest;
import com.nta.domain.deck.dto.request.UpdateDeckRequest;
import com.nta.domain.deck.dto.response.DeckDetailResponse;
import com.nta.domain.deck.dto.response.DeckResponse;
import com.nta.domain.deck.dto.response.DeckVocabularyResponse;
import com.nta.domain.paragraphSentenceHint.enums.TargetLanguage;
import com.nta.domain.user.User;
import com.nta.domain.vocabulary.Vocabulary;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@org.springframework.stereotype.Service("deckService")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class Service {
    private static final String DEFAULT_DECK_ICON = "book-open";

    Repository repository;
    com.nta.domain.vocabulary.Repository vocabularyRepository;
    CommonUserService commonUserService;
    Mapper mapper;

    public List<DeckResponse> getMyDecks(TargetLanguage targetLanguage) {
        Long userId = commonUserService.getCurrentUserIdFromContext();
        List<Deck> decks = targetLanguage == null
                ? repository.findByUserIdOrderByCreatedAtDesc(userId)
                : repository.findByUserIdAndTargetLanguageOrderByCreatedAtDesc(userId, targetLanguage);
        return mapper.toDeckResponses(decks);
    }

    public DeckResponse createMyDeck(CreateDeckRequest request) {
        User user = commonUserService.getUserFromContext();
        String normalizedName = request.getName().trim();
        var existing = repository.findByUserIdAndTargetLanguageAndName(
                user.getId(), request.getTargetLanguage(), normalizedName);
        if (existing.isPresent()) {
            return mapper.toDeckResponse(existing.get());
        }

        Deck deck = Deck.builder()
                .user(user)
                .targetLanguage(request.getTargetLanguage())
                .name(normalizedName)
                .icon(normalizeIcon(request.getIcon()))
                .vocabularies(new LinkedHashSet<>())
                .build();
        return mapper.toDeckResponse(repository.save(deck));
    }

    public DeckDetailResponse getMyDeckDetail(Long deckId) {
        Long userId = commonUserService.getCurrentUserIdFromContext();
        Deck deck = repository
                .findByIdAndUserId(deckId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        List<DeckVocabularyResponse> vocabularies = deck.getVocabularies() == null
                ? List.of()
                : deck.getVocabularies().stream()
                        .sorted(Comparator.comparing(
                                Vocabulary::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                        .map(vocabulary -> DeckVocabularyResponse.builder()
                                .id(vocabulary.getId())
                                .text(vocabulary.getText())
                                .meaning(vocabulary.getMeaning())
                                .partOfSpeech(vocabulary.getPartOfSpeech())
                                .pronunciation(vocabulary.getPronunciation())
                                .createdAt(vocabulary.getCreatedAt())
                                .updatedAt(vocabulary.getUpdatedAt())
                                .build())
                        .toList();

        return DeckDetailResponse.builder()
                .id(deck.getId())
                .name(deck.getName())
                .icon(deck.getIcon())
                .targetLanguage(deck.getTargetLanguage())
                .vocabularyCount(vocabularies.size())
                .createdAt(deck.getCreatedAt())
                .updatedAt(deck.getUpdatedAt())
                .vocabularies(vocabularies)
                .build();
    }

    public DeckResponse updateMyDeck(Long deckId, UpdateDeckRequest request) {
        Long userId = commonUserService.getCurrentUserIdFromContext();
        Deck deck = repository
                .findByIdAndUserId(deckId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        String normalizedName = request.getName().trim();
        boolean duplicatedName = repository.existsByUserIdAndTargetLanguageAndNameAndIdNot(
                userId, deck.getTargetLanguage(), normalizedName, deck.getId());
        if (duplicatedName) {
            throw new AppException(ErrorCode.DECK_ALREADY_EXISTS);
        }

        deck.setName(normalizedName);
        deck.setIcon(normalizeIcon(request.getIcon()));
        return mapper.toDeckResponse(repository.save(deck));
    }

    public DeckResponse addVocabularyToDeck(Long deckId, AddVocabularyToDeckRequest request) {
        Long userId = commonUserService.getCurrentUserIdFromContext();
        Deck deck = repository
                .findByIdAndUserId(deckId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (deck.getVocabularies() == null) {
            deck.setVocabularies(new LinkedHashSet<>());
        }

        if (deck.getTargetLanguage() != request.getTargetLanguage()) {
            throw new AppException(ErrorCode.INVALID_TARGET_LANGUAGE);
        }

        String normalizedText = normalizeText(request.getText());
        boolean existedInDeck = deck.getVocabularies().stream()
                .map(Vocabulary::getText)
                .filter(text -> text != null && !text.isBlank())
                .map(Service::normalizeText)
                .anyMatch(normalizedText::equals);
        if (existedInDeck) {
            throw new AppException(ErrorCode.VOCABULARY_ALREADY_IN_DECK);
        }

        Vocabulary vocabulary = vocabularyRepository
                .findByUserIdAndTargetLanguageAndText(userId, request.getTargetLanguage(), normalizedText)
                .orElseGet(() -> vocabularyRepository.save(Vocabulary.builder()
                        .user(deck.getUser())
                        .targetLanguage(request.getTargetLanguage())
                        .text(normalizedText)
                        .partOfSpeech(request.getPartOfSpeech())
                        .meaning(request.getMeaning())
                        .pronunciation(request.getPronunciation())
                        .exampleSentence(request.getExampleSentence())
                        .build()));

        deck.getVocabularies().add(vocabulary);
        return mapper.toDeckResponse(repository.save(deck));
    }

    public void deleteMyDeck(Long deckId) {
        Long userId = commonUserService.getCurrentUserIdFromContext();
        Deck deck = repository
                .findByIdAndUserId(deckId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Set<Vocabulary> vocabularies = deck.getVocabularies() == null ? Set.of() : Set.copyOf(deck.getVocabularies());

        if (deck.getVocabularies() != null) {
            deck.getVocabularies().clear();
        }
        repository.save(deck);
        repository.delete(deck);

        for (Vocabulary vocabulary : vocabularies) {
            Long vocabularyId = vocabulary.getId();
            if (vocabularyId == null) {
                continue;
            }
            if (!repository.existsByVocabularies_Id(vocabularyId)) {
                vocabularyRepository.deleteById(vocabularyId);
            }
        }
    }

    private static String normalizeText(String text) {
        return text == null ? "" : text.trim().toLowerCase();
    }

    private static String normalizeIcon(String icon) {
        if (icon == null || icon.isBlank()) {
            return DEFAULT_DECK_ICON;
        }
        return icon.trim().toLowerCase();
    }
}
