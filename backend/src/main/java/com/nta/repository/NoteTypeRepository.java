package com.nta.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nta.entity.NoteType;

@Repository
public interface NoteTypeRepository extends JpaRepository<NoteType, Long> {

    Optional<NoteType> findByName(String name);

    @Query("SELECT COUNT(n) FROM Note n WHERE n.noteTypeId = :noteTypeId")
    Long countNotesByNoteTypeId(@Param("noteTypeId") Long noteTypeId);
}
