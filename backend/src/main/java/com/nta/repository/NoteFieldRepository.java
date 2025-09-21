package com.nta.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nta.entity.NoteField;

@Repository
public interface NoteFieldRepository extends JpaRepository<NoteField, Long> {

    List<NoteField> findByNoteId(Long noteId);

    Optional<NoteField> findByNoteIdAndFieldId(Long noteId, Long fieldId);

    @Query(
            "SELECT nf FROM NoteField nf JOIN Field f ON nf.fieldId = f.id WHERE nf.noteId = :noteId ORDER BY f.fieldOrder ASC")
    List<NoteField> findByNoteIdOrderedByFieldOrder(@Param("noteId") Long noteId);

    void deleteByNoteId(Long noteId);
}
