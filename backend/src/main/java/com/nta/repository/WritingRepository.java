package com.nta.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nta.entity.Writing;

@Repository
public interface WritingRepository extends JpaRepository<Writing, Long> {
    Writing findByConversationId(String conversationId);

    @Query("SELECT w FROM Writing w LEFT JOIN FETCH w.englishSentences WHERE w.conversationId = :conversationId")
    Optional<Writing> findByConversationIdWithSentences(@Param("conversationId") String conversationId);

    @Query("SELECT w FROM Writing w WHERE w.topic IS NOT NULL AND LOWER(CAST(w.topic AS string)) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Writing> searchByTopicName(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT w FROM Writing w WHERE w.user.id = :userId")
    Page<Writing> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query(
            "SELECT w FROM Writing w WHERE w.user.id = :userId AND " +
            "(w.topic IS NOT NULL AND LOWER(CAST(w.topic AS string)) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR w.type = com.nta.enums.WritingType.CUSTOM_TEXT AND LOWER('Custom Text') LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Writing> searchByTopicNameAndUserId(
            @Param("keyword") String keyword, @Param("userId") Long userId, Pageable pageable);
}
