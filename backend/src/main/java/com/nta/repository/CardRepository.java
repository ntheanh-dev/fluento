package com.nta.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nta.entity.Card;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {

    List<Card> findByNoteId(Long noteId);

    @Query("SELECT c FROM Card c JOIN Note n ON c.noteId = n.id WHERE n.deckId = :deckId")
    List<Card> findByDeckId(@Param("deckId") Long deckId);

    @Query("SELECT c FROM Card c JOIN Note n ON c.noteId = n.id WHERE n.userId = :userId")
    List<Card> findByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(c) FROM Card c WHERE c.noteId = :noteId")
    Long countByNoteId(@Param("noteId") Long noteId);

    @Query("SELECT COUNT(c) FROM Card c JOIN Note n ON c.noteId = n.id WHERE n.deckId = :deckId")
    Long countByDeckId(@Param("deckId") Long deckId);

    List<Card> findByNoteIdIn(List<Long> noteIds);
}
