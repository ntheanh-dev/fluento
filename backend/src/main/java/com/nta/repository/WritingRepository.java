package com.nta.repository;

import java.time.LocalDateTime;
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

    @Query("SELECT w FROM Writing w JOIN w.topic t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Writing> searchByTopicName(@Param("keyword") String keyword, Pageable pageable);
    
    // Statistics queries
    @Query("SELECT COUNT(w) FROM Writing w WHERE w.user.id = :userId")
    int countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT AVG(LENGTH(w.vietnameseParagraph) - LENGTH(REPLACE(w.vietnameseParagraph, '.', '')) + 1) FROM Writing w WHERE w.user.id = :userId")
    Double getAverageSentencesByUserId(@Param("userId") Long userId);
    
    @Query("SELECT MAX(LENGTH(w.vietnameseParagraph) - LENGTH(REPLACE(w.vietnameseParagraph, '.', '')) + 1) FROM Writing w WHERE w.user.id = :userId")
    Integer getHighestSentencesByUserId(@Param("userId") Long userId);
    
    @Query("SELECT DAYNAME(w.createdAt) as dayOfWeek, COUNT(w) as count " +
           "FROM Writing w WHERE w.user.id = :userId " +
           "AND w.createdAt >= :startDate " +
           "GROUP BY DAYNAME(w.createdAt)")
    List<Object[]> getPracticeFrequencyByUserId(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT DATE_FORMAT(w.createdAt, '%d-%m') as date, AVG(s.score) as score " +
           "FROM Writing w JOIN w.englishSentences s WHERE w.user.id = :userId " +
           "AND w.createdAt >= :startDate " +
           "GROUP BY DATE_FORMAT(w.createdAt, '%d-%m') " +
           "ORDER BY DATE_FORMAT(w.createdAt, '%d-%m')")
    List<Object[]> getScoreProgressByUserId(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);
}
