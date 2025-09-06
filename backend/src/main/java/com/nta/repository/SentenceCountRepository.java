package com.nta.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nta.entity.SentenceCount;

@Repository
public interface SentenceCountRepository extends JpaRepository<SentenceCount, Long> {
    Optional<SentenceCount> findBySize(final int size);
}
