package com.nta.domain.paragraph;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nta.domain.paragraph.enums.Level;
import com.nta.domain.paragraph.enums.SentenceCount;
import com.nta.domain.paragraph.enums.Tone;
import com.nta.domain.paragraph.enums.Topic;
import com.nta.domain.paragraph.enums.Type;
import com.nta.domain.paragraphSentence.ParagraphSentence;

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

    @Query(
            value =
                    """
			SELECT p FROM Paragraph p
			WHERE (:type IS NULL OR p.type = :type)
			AND (:tone IS NULL OR p.tone = :tone)
			AND (:topic IS NULL OR p.topic = :topic)
			AND (:level IS NULL OR p.level = :level)
			AND (:sentenceCount IS NULL OR p.sentenceCount = :sentenceCount)
			AND (:maxSentenceCount IS NULL OR SIZE(p.sentences) <= :maxSentenceCount)
			AND (:excludeUserInput = false OR p.type <> com.nta.domain.paragraph.enums.Type.USER_INPUT)
			""",
            countQuery =
                    """
			SELECT count(p) FROM Paragraph p
			WHERE (:type IS NULL OR p.type = :type)
			AND (:tone IS NULL OR p.tone = :tone)
			AND (:topic IS NULL OR p.topic = :topic)
			AND (:level IS NULL OR p.level = :level)
			AND (:sentenceCount IS NULL OR p.sentenceCount = :sentenceCount)
			AND (:maxSentenceCount IS NULL OR SIZE(p.sentences) <= :maxSentenceCount)
			AND (:excludeUserInput = false OR p.type <> com.nta.domain.paragraph.enums.Type.USER_INPUT)
			""")
    Page<Paragraph> findWithOptionalFilters(
            @Param("type") Type type,
            @Param("tone") Tone tone,
            @Param("topic") Topic topic,
            @Param("level") Level level,
            @Param("sentenceCount") SentenceCount sentenceCount,
            @Param("maxSentenceCount") Integer maxSentenceCount,
            @Param("excludeUserInput") boolean excludeUserInput,
            Pageable pageable);

    @Query(
            value =
                    """
			SELECT p, COUNT(up)
			FROM Paragraph p
			LEFT JOIN p.practices up
			WHERE (:type IS NULL OR p.type = :type)
			AND (:tone IS NULL OR p.tone = :tone)
			AND (:topic IS NULL OR p.topic = :topic)
			AND (:level IS NULL OR p.level = :level)
			AND (:sentenceCount IS NULL OR p.sentenceCount = :sentenceCount)
			AND (:excludeUserInput = false OR p.type <> com.nta.domain.paragraph.enums.Type.USER_INPUT)
			GROUP BY p
			""",
            countQuery =
                    """
			SELECT count(p) FROM Paragraph p
			WHERE (:type IS NULL OR p.type = :type)
			AND (:tone IS NULL OR p.tone = :tone)
			AND (:topic IS NULL OR p.topic = :topic)
			AND (:level IS NULL OR p.level = :level)
			AND (:sentenceCount IS NULL OR p.sentenceCount = :sentenceCount)
			AND (:excludeUserInput = false OR p.type <> com.nta.domain.paragraph.enums.Type.USER_INPUT)
			""")
    Page<Object[]> findWithOptionalFiltersAndPracticeCount(
            @Param("type") Type type,
            @Param("tone") Tone tone,
            @Param("topic") Topic topic,
            @Param("level") Level level,
            @Param("sentenceCount") SentenceCount sentenceCount,
            @Param("excludeUserInput") boolean excludeUserInput,
            Pageable pageable);

    // Thêm một query để fetch sentences riêng cho danh sách IDs
    @Query("SELECT DISTINCT p FROM Paragraph p JOIN FETCH p.sentences WHERE p IN :paragraphs")
    List<Paragraph> fetchSentences(@Param("paragraphs") List<Paragraph> paragraphs);

    @Query(
            value =
                    """
			SELECT p, COUNT(up)
			FROM Paragraph p
			LEFT JOIN p.practices up
			WHERE (:type IS NULL OR p.type = :type)
			AND (:tone IS NULL OR p.tone = :tone)
			AND (:topic IS NULL OR p.topic = :topic)
			AND (:level IS NULL OR p.level = :level)
			AND (:sentenceCount IS NULL OR p.sentenceCount = :sentenceCount)
			AND (:excludeUserInput = false OR p.type <> com.nta.domain.paragraph.enums.Type.USER_INPUT)
			GROUP BY p
			ORDER BY COUNT(up) DESC, p.createdAt DESC
			""",
            countQuery =
                    """
			SELECT count(p) FROM Paragraph p
			WHERE (:type IS NULL OR p.type = :type)
			AND (:tone IS NULL OR p.tone = :tone)
			AND (:topic IS NULL OR p.topic = :topic)
			AND (:level IS NULL OR p.level = :level)
			AND (:sentenceCount IS NULL OR p.sentenceCount = :sentenceCount)
			AND (:excludeUserInput = false OR p.type <> com.nta.domain.paragraph.enums.Type.USER_INPUT)
			""")
    Page<Object[]> findWithOptionalFiltersAndPracticeCountOrderByMostPracticed(
            @Param("type") Type type,
            @Param("tone") Tone tone,
            @Param("topic") Topic topic,
            @Param("level") Level level,
            @Param("sentenceCount") SentenceCount sentenceCount,
            @Param("excludeUserInput") boolean excludeUserInput,
            Pageable pageable);

    @Query(
            value =
                    """
					SELECT p, COUNT(up)
					FROM Paragraph p
					LEFT JOIN p.practices up
					WHERE (:type IS NULL OR p.type = :type)
					AND (:tone IS NULL OR p.tone = :tone)
					AND (:topic IS NULL OR p.topic = :topic)
					AND (:level IS NULL OR p.level = :level)
					AND (:sentenceCount IS NULL OR p.sentenceCount = :sentenceCount)
					GROUP BY p
				""",
            countQuery =
                    """
					SELECT count(p)
					FROM Paragraph p
					WHERE (:type IS NULL OR p.type = :type)
					AND (:tone IS NULL OR p.tone = :tone)
					AND (:topic IS NULL OR p.topic = :topic)
					AND (:level IS NULL OR p.level = :level)
					AND (:sentenceCount IS NULL OR p.sentenceCount = :sentenceCount)
				""")
    Page<Object[]> findPageWithPracticeCount(
            @Param("type") Type type,
            @Param("tone") Tone tone,
            @Param("topic") Topic topic,
            @Param("level") Level level,
            @Param("sentenceCount") SentenceCount sentenceCount,
            Pageable pageable);

    @Query(
            """
				SELECT ps
				FROM ParagraphSentence ps
				WHERE ps.paragraph.id IN :ids
				ORDER BY ps.paragraph.id, ps.orderIndex
			""")
    List<ParagraphSentence> fetchSentencesByParagraphIds(@Param("ids") List<Long> ids);
}
