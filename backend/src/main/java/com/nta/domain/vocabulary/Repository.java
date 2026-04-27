package com.nta.domain.vocabulary;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nta.domain.paragraphSentenceHint.enums.TargetLanguage;

@org.springframework.stereotype.Repository("vocabularyRepository")
public interface Repository extends JpaRepository<Vocabulary, Long> {
    Optional<Vocabulary> findByIdAndUserId(Long id, Long userId);

    Optional<Vocabulary> findByUserIdAndTargetLanguageAndText(Long userId, TargetLanguage targetLanguage, String text);

    List<Vocabulary> findByUserIdAndTargetLanguageOrderByCreatedAtDesc(Long userId, TargetLanguage targetLanguage);
}
