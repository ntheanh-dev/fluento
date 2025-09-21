package com.nta.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nta.entity.Field;

@Repository
public interface FieldRepository extends JpaRepository<Field, Long> {

    List<Field> findByNoteTypeIdOrderByFieldOrder(Long noteTypeId);

    @Query("SELECT f FROM Field f WHERE f.noteTypeId = :noteTypeId ORDER BY f.fieldOrder ASC")
    List<Field> findFieldsByNoteTypeOrdered(@Param("noteTypeId") Long noteTypeId);
}
