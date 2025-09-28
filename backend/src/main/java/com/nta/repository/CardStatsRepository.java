package com.nta.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nta.entity.CardStats;

@Repository
public interface CardStatsRepository extends JpaRepository<CardStats, Long> {

    Optional<CardStats> findByCardIdAndUserId(Long cardId, Long userId);

    List<CardStats> findByUserId(Long userId);

    @Query(
            "SELECT cs FROM CardStats cs WHERE cs.userId = :userId AND cs.dueDate <= :currentTime ORDER BY cs.dueDate ASC")
    List<CardStats> findDueCardsForUser(@Param("userId") Long userId, @Param("currentTime") LocalDateTime currentTime);

    @Query(
            "SELECT cs FROM CardStats cs WHERE cs.userId = :userId AND cs.dueDate <= :currentTime AND cs.dueDate >= :startOfDay ORDER BY cs.dueDate ASC")
    List<CardStats> findTodayDueCardsForUser(
            @Param("userId") Long userId,
            @Param("currentTime") LocalDateTime currentTime,
            @Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT COUNT(cs) FROM CardStats cs WHERE cs.userId = :userId AND cs.dueDate <= :currentTime")
    Long countDueCardsForUser(@Param("userId") Long userId, @Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT COUNT(cs) FROM CardStats cs WHERE cs.userId = :userId")
    Long countTotalCardsForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(cs) FROM CardStats cs JOIN Card c ON cs.cardId = c.id JOIN Note n ON c.noteId = n.id WHERE cs.userId = :userId AND n.deckId = :deckId")
    Long countTotalCardsForUserAndDeck(@Param("userId") Long userId, @Param("deckId") Long deckId);

    @Query("SELECT COUNT(cs) FROM CardStats cs WHERE cs.userId = :userId AND cs.repetitions > 0")
    Long countLearnedCardsForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(cs) FROM CardStats cs JOIN Card c ON cs.cardId = c.id JOIN Note n ON c.noteId = n.id WHERE cs.userId = :userId AND cs.repetitions > 0 AND n.deckId = :deckId")
    Long countLearnedCardsForUserAndDeck(@Param("userId") Long userId, @Param("deckId") Long deckId);

    List<CardStats> findByCardIdInAndUserId(List<Long> cardIds, Long userId);
}
