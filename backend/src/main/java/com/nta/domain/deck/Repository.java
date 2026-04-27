package com.nta.domain.deck;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nta.domain.paragraphSentenceHint.enums.TargetLanguage;

@org.springframework.stereotype.Repository("deckRepository")
public interface Repository extends JpaRepository<Deck, Long> {
    Optional<Deck> findByIdAndUserId(Long id, Long userId);

    Optional<Deck> findByUserIdAndTargetLanguageAndName(Long userId, TargetLanguage targetLanguage, String name);

    boolean existsByUserIdAndTargetLanguageAndNameAndIdNot(
            Long userId, TargetLanguage targetLanguage, String name, Long id);

    List<Deck> findByUserIdAndTargetLanguageOrderByCreatedAtDesc(Long userId, TargetLanguage targetLanguage);

    List<Deck> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByVocabularies_Id(Long vocabularyId);
}
