package com.nta.domain.userSentenceAnswer;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nta.domain.userSentenceAnswer.projection.DailyScoreStatsProjection;

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

    @Query(
            value =
                    """
			SELECT
				DATE(CONVERT_TZ(a.created_at, '+00:00', :tzOffset)) AS statDate,
				COALESCE(AVG(a.score), 0) AS avgScore,
				COUNT(a.id) AS totalAnswers
			FROM user_sentence_answers a
			INNER JOIN user_practices p ON a.practice_id = p.id
			WHERE a.is_submitted = TRUE
			AND p.user_id = :userId
			AND a.created_at >= :start
			AND a.created_at <= :end
			GROUP BY DATE(CONVERT_TZ(a.created_at, '+00:00', :tzOffset))
			ORDER BY statDate
			""",
            nativeQuery = true)
    List<DailyScoreStatsProjection> getDailyScoreStats(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("tzOffset") String tzOffset);
}
