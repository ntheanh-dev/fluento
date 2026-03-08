package com.nta.domain.userPractice;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nta.domain.paragraph.enums.Level;
import com.nta.domain.paragraph.enums.Topic;
import com.nta.domain.paragraph.enums.Type;
import com.nta.domain.userPractice.projection.PracticeSubmitProjection;

@org.springframework.stereotype.Repository("userPracticeRepository")
public interface Repository extends JpaRepository<UserPractice, Long> {
    Optional<UserPractice> findByIdAndUserId(Long id, Long userId);

    List<UserPractice> findByUserId(Long userId);

    @Query(
            "SELECT p FROM UserPractice p WHERE p.user.id = :userId AND (:type IS NULL OR p.paragraph.type = :type) AND (:topic IS NULL OR p.paragraph.topic = :topic) AND (:level IS NULL OR p.paragraph.level = :level) AND (:search IS NULL OR LENGTH(TRIM(COALESCE(:search, ''))) = 0 OR LOWER(p.paragraph.content) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.paragraph.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<UserPractice> findByUserIdAndFilters(
            @Param("userId") Long userId,
            @Param("type") Type type,
            @Param("topic") Topic topic,
            @Param("level") Level level,
            @Param("search") String search,
            Pageable pageable);

    @Query(
            "select p.user.id as userId, p.paragraph.content as paragraphContent from UserPractice p where p.id = :practiceId")
    Optional<PracticeSubmitProjection> findSubmitData(Long practiceId);

    @Query("SELECT COALESCE(SUM(up.learningTime), 0) FROM UserPractice up WHERE up.user.id = :userId")
    Long getTotalLearningTimeByUserId(@Param("userId") Long userId);
}
