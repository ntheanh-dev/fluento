package com.nta.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nta.entity.Deck;

@Repository
public interface DeckRepository extends JpaRepository<Deck, Long> {

    List<Deck> findByUserId(Long userId);

    Optional<Deck> findByUserIdAndName(Long userId, String name);

    @Query("SELECT COUNT(n) FROM Note n WHERE n.deckId = :deckId")
    Long countNotesByDeckId(@Param("deckId") Long deckId);

    @Query("SELECT COUNT(c) FROM Card c JOIN Note n ON c.noteId = n.id WHERE n.deckId = :deckId")
    Long countCardsByDeckId(@Param("deckId") Long deckId);
}
