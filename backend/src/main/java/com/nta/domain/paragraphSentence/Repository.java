package com.nta.domain.paragraphSentence;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

@org.springframework.stereotype.Repository("paragraphSentenceRepository")
public interface Repository extends JpaRepository<ParagraphSentence, Long> {
    Optional<ParagraphSentence> findByParagraphIdAndOrderIndex(Long paragraphId, Integer orderIndex);

    List<ParagraphSentence> findByVocabularyHintsIsNull();
}
