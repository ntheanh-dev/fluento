package com.nta.domain.userPractice;

import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nta.domain.paragraph.enums.Level;
import com.nta.domain.paragraph.enums.Topic;
import com.nta.domain.paragraph.enums.Type;
import com.nta.domain.paragraphSentenceHint.enums.TargetLanguage;

@org.springframework.stereotype.Repository("userPracticeRepository")
public interface Repository extends JpaRepository<UserPractice, Long> {
    Optional<UserPractice> findByIdAndUserId(Long id, Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM UserPractice p WHERE p.id = :id AND p.user.id = :userId")
    Optional<UserPractice> findByIdAndUserIdForUpdate(@Param("id") Long id, @Param("userId") Long userId);

    List<UserPractice> findByUserId(Long userId);

    @Query(
            "SELECT DISTINCT p FROM UserPractice p LEFT JOIN p.paragraph.sentences s WHERE p.user.id = :userId AND (:type IS NULL OR p.paragraph.type = :type) AND (:topic IS NULL OR p.paragraph.topic = :topic) AND (:level IS NULL OR p.paragraph.level = :level) AND (:targetLanguage IS NULL OR p.targetLanguage = :targetLanguage) AND (:completed IS NULL OR (:completed = true AND (SELECT COUNT(sa) FROM UserSentenceAnswer sa WHERE sa.practice = p AND sa.isSubmitted = true) >= SIZE(p.paragraph.sentences)) OR (:completed = false AND (SELECT COUNT(sa) FROM UserSentenceAnswer sa WHERE sa.practice = p AND sa.isSubmitted = true) < SIZE(p.paragraph.sentences))) AND (:search IS NULL OR LENGTH(TRIM(COALESCE(:search, ''))) = 0 OR LOWER(s.content) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.paragraph.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<UserPractice> findByUserIdAndFilters(
            @Param("userId") Long userId,
            @Param("type") Type type,
            @Param("topic") Topic topic,
            @Param("level") Level level,
            @Param("targetLanguage") TargetLanguage targetLanguage,
            @Param("completed") Boolean completed,
            @Param("search") String search,
            Pageable pageable);

    @Query(
            "SELECT DISTINCT p FROM UserPractice p LEFT JOIN p.paragraph.sentences s WHERE (:type IS NULL OR p.paragraph.type = :type) AND (:topic IS NULL OR p.paragraph.topic = :topic) AND (:level IS NULL OR p.paragraph.level = :level) AND (:targetLanguage IS NULL OR p.targetLanguage = :targetLanguage) AND (:completed IS NULL OR (:completed = true AND (SELECT COUNT(sa) FROM UserSentenceAnswer sa WHERE sa.practice = p AND sa.isSubmitted = true) >= SIZE(p.paragraph.sentences)) OR (:completed = false AND (SELECT COUNT(sa) FROM UserSentenceAnswer sa WHERE sa.practice = p AND sa.isSubmitted = true) < SIZE(p.paragraph.sentences))) AND (:search IS NULL OR LENGTH(TRIM(COALESCE(:search, ''))) = 0 OR LOWER(s.content) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.paragraph.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<UserPractice> findAllWithFilters(
            @Param("type") Type type,
            @Param("topic") Topic topic,
            @Param("level") Level level,
            @Param("targetLanguage") TargetLanguage targetLanguage,
            @Param("completed") Boolean completed,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(up.learningTime), 0) FROM UserPractice up WHERE up.user.id = :userId")
    Long getTotalLearningTimeByUserId(@Param("userId") Long userId);

    void deleteByParagraphId(Long paragraphId);
}
