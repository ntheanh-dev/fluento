package com.nta.domain.paragraphSentence;

import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@org.springframework.stereotype.Repository("paragraphSentenceRepository")
public interface Repository extends JpaRepository<ParagraphSentence, Long> {
    Optional<ParagraphSentence> findByParagraphIdAndOrderIndex(Long paragraphId, Integer orderIndex);

    @Query(
            """
			SELECT ps
			FROM ParagraphSentence ps
			WHERE LOWER(ps.content) LIKE LOWER(CONCAT('%', :keyword, '%'))
			ORDER BY ps.id DESC
			""")
    java.util.List<ParagraphSentence> findByContentContainingKeyword(
            @Param("keyword") String keyword, Pageable pageable);
}
