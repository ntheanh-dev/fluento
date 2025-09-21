package com.nta.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nta.entity.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByCardId(Long cardId);

    List<Review> findByUserId(Long userId);

    @Query("SELECT r FROM Review r WHERE r.cardId = :cardId AND r.userId = :userId ORDER BY r.createdAt DESC")
    List<Review> findByCardIdAndUserIdOrderByCreatedAtDesc(@Param("cardId") Long cardId, @Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.cardId = :cardId AND r.userId = :userId")
    Long countByCardIdAndUserId(@Param("cardId") Long cardId, @Param("userId") Long userId);

    @Query("SELECT r FROM Review r WHERE r.userId = :userId AND r.createdAt >= :startDate ORDER BY r.createdAt DESC")
    List<Review> findByUserIdAndCreatedAtAfter(
            @Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);
}
