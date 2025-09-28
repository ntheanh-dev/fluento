package com.nta.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nta.entity.Note;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByDeckId(Long deckId);

    List<Note> findByUserId(Long userId);

    List<Note> findByNoteTypeId(Long noteTypeId);

    @Query("SELECT n FROM Note n WHERE n.deckId = :deckId AND n.userId = :userId")
    List<Note> findByDeckIdAndUserId(@Param("deckId") Long deckId, @Param("userId") Long userId);

    @Query("SELECT n FROM Note n WHERE n.deckId = :deckId AND n.userId = :userId")
    Page<Note> findByDeckIdAndUserId(@Param("deckId") Long deckId, @Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COUNT(n) FROM Note n WHERE n.deckId = :deckId")
    Long countByDeckId(@Param("deckId") Long deckId);
}
