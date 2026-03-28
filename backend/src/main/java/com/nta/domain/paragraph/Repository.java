package com.nta.domain.paragraph;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nta.domain.paragraph.enums.Level;
import com.nta.domain.paragraph.enums.SentenceCount;
import com.nta.domain.paragraph.enums.Tone;
import com.nta.domain.paragraph.enums.Topic;
import com.nta.domain.paragraph.enums.Type;

@org.springframework.stereotype.Repository("paragraphRepository")
public interface Repository extends JpaRepository<Paragraph, Long> {
    @Query(
            """
			SELECT p FROM Paragraph p
			WHERE p.type = :type
			AND p.tone = :tone
			AND p.topic = :topic
			AND p.level = :level
			AND (
				(:sentenceCount IS NULL AND p.sentenceCount IS NULL)
				OR (:sentenceCount IS NOT NULL AND p.sentenceCount = :sentenceCount)
			)
			ORDER BY p.id ASC
			""")
    List<Paragraph> findMatchingSetup(
            @Param("type") Type type,
            @Param("tone") Tone tone,
            @Param("topic") Topic topic,
            @Param("level") Level level,
            @Param("sentenceCount") SentenceCount sentenceCount,
            Pageable pageable);
}
