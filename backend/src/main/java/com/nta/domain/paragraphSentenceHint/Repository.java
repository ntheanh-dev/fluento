package com.nta.domain.paragraphSentenceHint;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nta.domain.paragraphSentenceHint.enums.TargetLanguage;

@org.springframework.stereotype.Repository("paragraphSentenceHintRepository")
public interface Repository extends JpaRepository<ParagraphSentenceHint, Long> {
    Optional<ParagraphSentenceHint> findByParagraphSentenceIdAndTargetLanguage(
            Long paragraphSentenceId, TargetLanguage targetLanguage);

    boolean existsByParagraphSentenceIdAndTargetLanguage(Long paragraphSentenceId, TargetLanguage targetLanguage);
}
