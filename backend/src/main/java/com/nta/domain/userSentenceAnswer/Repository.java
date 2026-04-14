package com.nta.domain.userSentenceAnswer;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@org.springframework.stereotype.Repository("userSentenceAnswerRepository")
public interface Repository extends JpaRepository<UserSentenceAnswer, Long> {

    @Query(
            """
			SELECT a FROM UserSentenceAnswer a
			WHERE a.practice.id = :practiceId
			AND a.orderIndex = :orderIndex
			AND (a.isSubmitted = FALSE OR a.isSubmitted IS NULL)
			ORDER BY a.createdAt DESC
			""")
    Optional<UserSentenceAnswer> findLatestDraft(
            @Param("practiceId") Long practiceId, @Param("orderIndex") Integer orderIndex);

    /**
     * Thống kê tổng số câu trả lời và điểm trung bình cho toàn bộ UserSentenceAnswer đã submit
     * của một user (thông qua quan hệ UserPractice.user.id).
     */
    @Query(
            """
			SELECT COUNT(a), COALESCE(AVG(a.score), 0)
			FROM UserSentenceAnswer a
			INNER JOIN a.practice p
			WHERE a.isSubmitted = TRUE
			AND p.user.id = :userId
			""")
    Object[] getUserSentenceAnswerStats(@Param("userId") Long userId);

    /**
     * @param scoreBand 0 = điểm ≤ 7; 1 = (7, 8]; 2 = điểm &gt; 8. Chỉ lấy bản ghi có score.
     */
    @Query(
            """
			SELECT DISTINCT a FROM UserSentenceAnswer a
			INNER JOIN FETCH a.practice p
			INNER JOIN FETCH p.user u
			WHERE p.paragraph.id = :paragraphId
			AND a.orderIndex = :orderIndex
			AND a.isSubmitted = true
			AND p.user.id <> :excludeUserId
			AND (
				(:scoreBand = 0 AND a.score <= 7.0)
				OR (:scoreBand = 1 AND a.score > 7.0 AND a.score <= 8.0)
				OR (:scoreBand = 2 AND a.score > 8.0)
			)
			ORDER BY a.createdAt DESC
			""")
    List<UserSentenceAnswer> findRecentSubmittedByParagraphAndOrderExcludingUser(
            @Param("paragraphId") Long paragraphId,
            @Param("orderIndex") Integer orderIndex,
            @Param("excludeUserId") Long excludeUserId,
            @Param("scoreBand") int scoreBand,
            Pageable pageable);

    void deleteByPracticeParagraphId(Long paragraphId);
}
