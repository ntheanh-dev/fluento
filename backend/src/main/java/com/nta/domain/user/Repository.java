package com.nta.domain.user;

import java.time.LocalDate;
import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nta.domain.user.projection.CurrentUserRankingProjection;
import com.nta.domain.user.projection.UserRankingProjection;

@org.springframework.stereotype.Repository("userRepository")
public interface Repository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.id = :id")
    Optional<User> findByIdForUpdate(@Param("id") Long id);

    @Query(
            value =
                    """
					SELECT u.id AS id,
						u.fullName AS fullName,
						u.urlAvatar AS urlAvatar,
						COALESCE(COUNT(a), 0) AS totalUserSentenceAnswers,
						COALESCE(AVG(a.score), 0) AS avgScore,
						u.currentStreak AS currentStreak,
						(SELECT COALESCE(SUM(p2.learningTime), 0) FROM UserPractice p2 WHERE p2.user.id = u.id) AS totalLearningTime
					FROM User u
					LEFT JOIN UserPractice p ON p.user.id = u.id
					LEFT JOIN UserSentenceAnswer a ON a.practice.id = p.id AND a.isSubmitted = TRUE
					GROUP BY u.id, u.fullName, u.urlAvatar, u.currentStreak
					ORDER BY avgScore DESC, totalUserSentenceAnswers DESC, u.currentStreak DESC
					""",
            countQuery = """
					SELECT COUNT(u)
					FROM User u
					""")
    Page<UserRankingProjection> findUserRankings(Pageable pageable);

    @Query(
            value =
                    """
					WITH user_stats AS (
						SELECT
							u.id AS userId,
							u.full_name AS fullName,
							u.url_avatar AS urlAvatar,
							COALESCE(COUNT(a.id), 0) AS totalUserSentenceAnswers,
							COALESCE(AVG(a.score), 0) AS avgScore,
							u.current_streak AS currentStreak,
							COALESCE(SUM(p.learning_time), 0) AS totalLearningTime
						FROM users u
						LEFT JOIN user_practices p ON p.user_id = u.id
						LEFT JOIN user_sentence_answers a ON a.practice_id = p.id AND a.is_submitted = TRUE
						GROUP BY u.id, u.full_name, u.url_avatar, u.current_streak
					),
					ranked_users AS (
						SELECT
							ROW_NUMBER() OVER (
								ORDER BY avgScore DESC, totalUserSentenceAnswers DESC, currentStreak DESC
							) AS userRank,
							userId,
							fullName,
							urlAvatar,
							totalUserSentenceAnswers,
							avgScore,
							currentStreak,
							totalLearningTime
						FROM user_stats
					)
					SELECT
						ru.userRank AS userRank,
						ru.fullName AS fullName,
						ru.urlAvatar AS urlAvatar,
						ru.totalUserSentenceAnswers AS totalUserSentenceAnswers,
						ru.avgScore AS avgScore,
						ru.currentStreak AS currentStreak,
						ru.totalLearningTime AS totalLearningTime
					FROM ranked_users ru
					WHERE ru.userId = :userId
					""",
            nativeQuery = true)
    CurrentUserRankingProjection findCurrentUserRanking(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE User u SET u.currentStreak = 0 WHERE u.lastSubmissionDate IS NULL OR u.lastSubmissionDate < ?1")
    int resetBrokenStreaks(LocalDate thresholdDate);

    @Modifying
    @Query("""
		UPDATE User
		SET credits = credits - :amount
		WHERE id = :userId AND credits >= :amount
	""")
    int reserveCredits(@Param("userId") Long userId, @Param("amount") Integer amount);

    @Modifying
    @Query("""
		UPDATE User
		SET credits = credits + :amount
		WHERE id = :userId
	""")
    void addCredits(@Param("userId") Long userId, @Param("amount") Integer amount);

    @Modifying
    @Query("""
		UPDATE User
		SET coins = coins + :amount
		WHERE id = :userId
	""")
    void addCoins(@Param("userId") Long userId, @Param("amount") Integer amount);

    @Modifying
    @Query(
            """
		UPDATE User u
		SET u.credits = CASE WHEN u.credits >= :amount THEN u.credits - :amount ELSE 0 END
		WHERE u.id = :userId
		""")
    void subtractCredits(@Param("userId") Long userId, @Param("amount") Integer amount);

    @Modifying
    @Query("""
		UPDATE User u
		SET u.credits = :amount
		WHERE u.id = :userId
		""")
    void setCredits(@Param("userId") Long userId, @Param("amount") Integer amount);

    @Modifying
    @Query("UPDATE User u SET u.credits = :amount")
    int setAllUsersCredits(@Param("amount") Integer amount);

    @Query("SELECT u.credits FROM User u WHERE u.id = :userId")
    Integer findCreditsByUserId(@Param("userId") Long userId);

    @Query("SELECT u.coins FROM User u WHERE u.id = :userId")
    Integer findCoinsByUserId(@Param("userId") Long userId);

    /**
     * Atomically deducts coins and adds credits only if {@code coins >= cost}.
     *
     * @return number of rows updated (1 if success, 0 if insufficient coins)
     */
    @Modifying
    @Query(
            """
		UPDATE User u
		SET u.coins = u.coins - :cost,
			u.credits = u.credits + :creditsGain
		WHERE u.id = :userId AND u.coins >= :cost
		""")
    int exchangeCoinsForCredits(
            @Param("userId") Long userId, @Param("cost") Integer cost, @Param("creditsGain") Integer creditsGain);
}
