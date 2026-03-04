package com.nta.domain.userSentenceAnswer;

import java.util.Optional;

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
}
